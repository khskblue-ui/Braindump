import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { classifyText } from '@/lib/classify';
import { PDFParse } from 'pdf-parse';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PAGES = 50;
const MAX_TEXT_LENGTH = 100000; // ~100K chars for AI input safety

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

    // 1. Extract text from PDF using pdf-parse v2
    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText({ first: MAX_PAGES });
    const numPages = textResult.pages?.length ?? 0;

    const extractedText = textResult.pages
      ?.map((p: { text: string }) => p.text)
      .join('\n')
      .trim();

    if (!extractedText || extractedText.length < 10) {
      parser.destroy();
      return NextResponse.json(
        { error: '텍스트를 추출할 수 없습니다. 스캔된 PDF는 지원하지 않습니다.' },
        { status: 400 }
      );
    }

    parser.destroy();

    // Truncate if too long
    const textForAI = extractedText.length > MAX_TEXT_LENGTH
      ? extractedText.slice(0, MAX_TEXT_LENGTH)
      : extractedText;

    // 2. Create entry immediately (as inbox, with extracted text)
    const { data: entry, error: insertError } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        raw_text: `[PDF] ${file.name}`,
        extracted_text: extractedText.slice(0, 50000), // DB storage limit
        input_type: 'pdf',
        category: 'inbox',
      })
      .select()
      .single();

    if (insertError || !entry) {
      console.error('PDF entry creation error:', insertError);
      return NextResponse.json({ error: '항목 생성에 실패했습니다.' }, { status: 500 });
    }

    // 3. AI classify + summarize (background-style but within same request)
    try {
      // Use more tokens for long PDF content (detailed summary)
      const result = await classifyText(textForAI, { maxTokens: 1500 });

      // For PDF, force category to 'knowledge' if AI says inbox/memo
      const category = result.category === 'inbox' || result.category === 'memo'
        ? 'knowledge'
        : result.category;

      const topic = result.topic?.trim().toLowerCase()
        || file.name.replace(/\.pdf$/i, '').trim().toLowerCase()
        || null;

      const updateData: Record<string, unknown> = {
        category,
        tags: result.tags || [],
        summary: result.summary || null,
        priority: result.priority || null,
        topic,
        ai_metadata: result,
      };

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
    console.error('PDF processing error:', err);
    return NextResponse.json({ error: 'PDF 처리에 실패했습니다.' }, { status: 500 });
  }
}
