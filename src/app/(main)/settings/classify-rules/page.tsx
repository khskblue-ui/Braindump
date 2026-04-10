'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Rule {
  id: string;
  keyword: string;
  category: string;
  context: string | null;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { value: 'task', label: '할 일' },
  { value: 'idea', label: '아이디어' },
  { value: 'memo', label: '메모' },
  { value: 'knowledge', label: '지식' },
  { value: 'schedule', label: '일정' },
];

const CONTEXT_OPTIONS = [
  { value: '', label: '없음' },
  { value: 'personal', label: '개인' },
  { value: 'work', label: '회사' },
];

const CATEGORY_LABELS: Record<string, string> = {
  task: '할 일', idea: '아이디어', memo: '메모',
  knowledge: '지식', schedule: '일정', inbox: '미분류',
};

const CONTEXT_LABELS: Record<string, string> = {
  personal: '개인', work: '회사',
};

export default function ClassifyRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('task');
  const [context, setContext] = useState('');

  const showContextPicker = category === 'task' || category === 'schedule';

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/classify-rules');
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      toast.error('규칙을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleAdd = async () => {
    if (!keyword.trim()) {
      toast.error('키워드를 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/classify-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          category,
          context: showContextPicker && context ? context : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || '규칙 추가에 실패했습니다.');
        return;
      }
      setRules((prev) => [data.rule, ...prev]);
      setKeyword('');
      toast.success('규칙이 추가되었습니다.');
    } catch {
      toast.error('규칙 추가에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/classify-rules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success('규칙이 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">나의 분류 규칙</h1>
      </div>

      <p className="text-xs text-muted-foreground">
        특정 키워드가 포함되면 항상 지정한 카테고리로 분류되도록 규칙을 추가할 수 있습니다.
        커스텀 규칙은 AI 교정 이력보다 우선 적용됩니다.
      </p>

      {/* Add rule form */}
      <Card>
        <CardContent className="py-3 px-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">키워드</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 회의, 장보기, 운동"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">카테고리</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== 'task' && e.target.value !== 'schedule') {
                    setContext('');
                  }
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {showContextPicker && (
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">맥락</label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {CONTEXT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Button onClick={handleAdd} disabled={saving || !keyword.trim()} size="sm" className="w-full gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            {saving ? '추가 중...' : '규칙 추가'}
          </Button>
        </CardContent>
      </Card>

      {/* Rules list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">등록된 규칙이 없습니다.</p>
            <p className="text-xs text-muted-foreground mt-1">위에서 키워드와 카테고리를 선택하여 규칙을 추가해보세요.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{rules.length}개의 규칙 (최대 50개)</p>
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">&ldquo;{rule.keyword}&rdquo;</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs font-medium">{CATEGORY_LABELS[rule.category] || rule.category}</span>
                    {rule.context && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: rule.context === 'personal' ? '#3B82F61A' : '#7C3AED1A',
                          color: rule.context === 'personal' ? '#3B82F6' : '#7C3AED',
                        }}
                      >
                        {CONTEXT_LABELS[rule.context]}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleting === rule.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
