import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { classifyText, smartTruncate } from '@/lib/classify';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { join } from 'path';

// Point worker to actual file for serverless environment
GlobalWorkerOptions.workerSrc = join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.mjs');

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PAGES = 50;
const MAX_TEXT_LENGTH = 100000; // ~100K chars for AI input safety

function sanitizePdfText(text: string): string {
  // Keep: Korean (AC00-D7AF, 1100-11FF, 3130-318F, A960-A97F),
  // CJK (4E00-9FFF, 3000-303F), Latin (0020-007F, 00A0-00FF),
  // common punctuation, numbers, whitespace
  return text.replace(/[^\u0020-\u007F\u00A0-\u00FF\u0100-\u024F\u1100-\u11FF\u3000-\u303F\u3130-\u318F\u4E00-\u9FFF\uAC00-\uD7AF\uA960-\uA97F\uD7B0-\uD7FF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\n\r\t]/g, '')
    .replace(/\n{3,}/g, '\n\n')  // collapse excessive newlines
    .trim();
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase, user } = auth as Exclude<typeof auth, { error: NextResponse }>;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDF 파일만 지원합니다.' }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: '10MB 이하의 PDF만 가능합니다.' }, { status: 400 });
    }

    // 1. Extract text from PDF using pdfjs-dist
    const buffer = new Uint8Array(await file.arrayBuffer());
    const cMapUrl = join(process.cwd(), 'node_modules/pdfjs-dist/cmaps/');
    const pdfDoc = await getDocument({
      data: buffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      cMapUrl,
      cMapPacked: true,
    }).promise;
    const numPages = Math.min(pdfDoc.numPages, MAX_PAGES);
    const pageTexts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of content.items) {
        if (!('str' in item)) continue;
        const textItem = item as { str: string; transform: number[]; hasEOL?: boolean };
        const y = textItem.transform[5];

        if (lastY !== null && Math.abs(y - lastY) > 2) {
          // Y position changed → new line
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = textItem.str;
        } else {
          currentLine += textItem.str;
        }

        if (textItem.hasEOL) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = '';
          lastY = null;
        } else {
          lastY = y;
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
      pageTexts.push(lines.join('\n'));
    }

    const rawText = pageTexts.join('\n\n');  // double newline between pages
    const extractedText = sanitizePdfText(rawText);

    if (!extractedText || extractedText.length < 10) {
      pdfDoc.destroy();
      return NextResponse.json(
        { error: '텍스트를 추출할 수 없습니다. 스캔된 PDF는 지원하지 않습니다.' },
        { status: 400 }
      );
    }

    pdfDoc.destroy();

    // Truncate if too long (smart sampling: beginning + ending)
    const textForAI = smartTruncate(extractedText, MAX_TEXT_LENGTH);

    // 2. Create entry immediately (as inbox, with extracted text)
    const { data: entry, error: insertError } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        raw_text: `[PDF] ${file.name}`,
        extracted_text: extractedText.slice(0, 50000), // DB storage limit
        input_type: 'pdf',
        categories: ['inbox'],
      })
      .select()
      .single();

    if (insertError || !entry) {
      console.error('PDF entry creation error:', insertError);
      return NextResponse.json(
        { error: '항목 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 3. AI classify + summarize (background-style but within same request)
    // Fetch user's custom rules for priority injection
    let userRules: string | undefined;
    const { data: rules } = await supabase
      .from('user_classify_rules')
      .select('keyword, category, context')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (rules?.length) {
      userRules = rules.map((r: { keyword: string; category: string; context: string | null }) => {
        const ctx = r.context ? ` (${r.context === 'personal' ? '개인' : '회사'})` : '';
        return `- "${r.keyword}" 키워드 → 반드시 ${r.category} 포함${ctx}`;
      }).join('\n');
    }

    try {
      // Use more tokens for long PDF content (detailed summary)
      const result = await classifyText(textForAI, { maxTokens: 1500, userRules, inputType: 'PDF', textLength: extractedText.length });

      // For PDF, ensure 'knowledge' is included
      let categories = result.categories;
      if (categories.length === 1 && (categories[0] === 'inbox' || categories[0] === 'memo')) {
        categories = ['knowledge'];
      } else if (!categories.includes('knowledge')) {
        categories = [...categories, 'knowledge'];
      }

      const topic = result.topic?.trim().toLowerCase()
        || file.name.replace(/\.pdf$/i, '').trim().toLowerCase()
        || null;

      const updateData: Record<string, unknown> = {
        categories,
        tags: result.tags || [],
        summary: result.summary || null,
        topic,
        ai_metadata: result,
      };
      // Set context for all categories (null when ambiguous)
      updateData.context = result.context ?? null;

      await supabase
        .from('entries')
        .update(updateData)
        .eq('id', entry.id)
        .eq('user_id', user.id);

      return NextResponse.json({
        entry: { ...entry, ...updateData },
        pages: numPages,
        textLength: extractedText.length,
      });
    } catch (classifyErr) {
      console.error('PDF classification error:', classifyErr);
      // Entry is already saved as inbox — classification can be retried manually
      return NextResponse.json({
        entry,
        pages: numPages,
        textLength: extractedText.length,
        classifyError: 'AI 분류에 실패했습니다. 수동으로 재분류해주세요.',
      });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('PDF processing error:', errMsg, err);
    return NextResponse.json(
      { error: `PDF 처리에 실패했습니다: ${errMsg.slice(0, 100)}` },
      { status: 500 }
    );
  }
}
