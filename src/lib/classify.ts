import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { ClassifyResult } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `사용자가 입력한 텍스트 또는 이미지를 분석하여 JSON으로 분류하세요.
이미지가 포함된 경우 이미지 내용을 읽고 extracted_text에 추출한 텍스트를 포함하세요.

카테고리:
- task: 실행해야 할 구체적 행동 (할 일)
- idea: 영감, 기획, 가설 (아이디어)
- memo: 참고용 정보, 노트 (메모)
- knowledge: 학습한 정보, 지식 스니펫 (지식)
- schedule: 날짜/시간이 포함된 항목 (일정)
- inbox: 판단 불가한 항목 (미분류)

반드시 JSON만 반환하세요. 다른 텍스트 없이:
{
  "category": "task" | "idea" | "memo" | "knowledge" | "schedule" | "inbox",
  "tags": ["태그1", "태그2"],
  "topic": "주제명 (knowledge인 경우만, 그 외 null)",
  "extracted_text": "이미지에서 추출한 텍스트 (이미지인 경우만, 그 외 null)",
  "summary": "한국어 한 줄 요약",
  "due_date": "ISO8601 날짜 (schedule인 경우만, 그 외 null)",
  "priority": "high" | "medium" | "low" | null,
  "related_topics": ["관련 주제"]
}`;

const classifySchema = z.object({
  category: z.enum(['task', 'idea', 'memo', 'knowledge', 'schedule', 'inbox']),
  tags: z.array(z.string()).default([]),
  topic: z.string().nullable().optional(),
  extracted_text: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  related_topics: z.array(z.string()).optional(),
});

export async function classifyText(text: string, options?: { maxTokens?: number }): Promise<ClassifyResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: options?.maxTokens ?? 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text }],
  });

  return parseResponse(response);
}

export async function classifyImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  text?: string
): Promise<ClassifyResult> {
  const content: Anthropic.Messages.ContentBlockParam[] = [
    {
      type: 'image',
      source: { type: 'base64', media_type: mediaType, data: imageBase64 },
    },
  ];

  if (text) {
    content.push({ type: 'text', text: `첨부 텍스트: ${text}` });
  } else {
    content.push({ type: 'text', text: '이 이미지를 분석하고 분류해주세요.' });
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  return parseResponse(response);
}

function parseResponse(response: Anthropic.Messages.Message): ClassifyResult {
  const text = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Extract JSON from response (handle markdown code blocks)
  // Use greedy match to capture nested objects/arrays
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { category: 'inbox', tags: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const validated = classifySchema.parse(parsed);
    return {
      category: validated.category,
      tags: validated.tags,
      topic: validated.topic ?? undefined,
      extracted_text: validated.extracted_text ?? undefined,
      summary: validated.summary ?? undefined,
      due_date: validated.due_date ?? undefined,
      priority: validated.priority ?? undefined,
      related_topics: validated.related_topics,
    };
  } catch {
    return { category: 'inbox', tags: [] };
  }
}
