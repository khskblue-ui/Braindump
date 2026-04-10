'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Pattern {
  id: string;
  original_categories: string[];
  corrected_categories: string[] | null;
  original_tags: string[] | null;
  corrected_tags: string[] | null;
  keyword_context: string | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  task: '할 일', idea: '아이디어', memo: '메모',
  knowledge: '지식', schedule: '일정', inbox: '미분류',
};

function categoryLabel(cats: string[] | null): string {
  if (!cats || cats.length === 0) return '-';
  return cats.map((c) => CATEGORY_LABELS[c] || c).join(', ');
}

export default function ClassifyPatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPatterns = async () => {
    try {
      const res = await fetch('/api/classify-patterns');
      const data = await res.json();
      setPatterns(data.patterns || []);
    } catch {
      toast.error('교정 이력을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatterns(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/classify-patterns?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      toast.success('교정 이력이 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 교정 이력을 삭제하시겠습니까?\nAI가 학습한 분류 패턴이 초기화됩니다.')) return;
    setDeleting('all');
    try {
      const res = await fetch('/api/classify-patterns?id=all', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPatterns([]);
      toast.success('모든 교정 이력이 초기화되었습니다.');
    } catch {
      toast.error('초기화에 실패했습니다.');
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
        <h1 className="text-xl font-bold">나의 교정 이력</h1>
      </div>

      <p className="text-xs text-muted-foreground">
        AI 분류 결과를 수동으로 수정하면 여기에 기록됩니다. 다음 분류 시 이 패턴을 참고하여 더 정확한 결과를 제공합니다.
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : patterns.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">교정 이력이 없습니다.</p>
            <p className="text-xs text-muted-foreground mt-1">AI 분류 결과를 수정하면 여기에 기록됩니다.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {patterns.length > 1 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                disabled={deleting === 'all'}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                {deleting === 'all' ? '초기화 중...' : '전체 초기화'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {patterns.map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {p.keyword_context ? `"${p.keyword_context.slice(0, 40)}${p.keyword_context.length > 40 ? '...' : ''}"` : '(내용 없음)'}
                      </p>
                      {p.corrected_categories && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">{categoryLabel(p.original_categories)}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{categoryLabel(p.corrected_categories)}</span>
                        </div>
                      )}
                      {p.corrected_tags && (
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <span className="text-muted-foreground">태그: [{(p.original_tags || []).join(', ')}]</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">[{p.corrected_tags.join(', ')}]</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
