'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { TopicInfo } from '@/types';

// Simple module-level cache to avoid refetching on every tab switch
let cachedTopics: TopicInfo[] | null = null;

export default function KnowledgePage() {
  const [topics, setTopics] = useState<TopicInfo[]>(cachedTopics || []);
  const [loading, setLoading] = useState(!cachedTopics);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip if already fetched in this session and cache exists
    if (cachedTopics && !fetchedRef.current) {
      fetchedRef.current = true;
      // Background refresh
      fetch('/api/topics')
        .then((res) => res.json())
        .then((data) => {
          const fresh = data.topics || [];
          cachedTopics = fresh;
          setTopics(fresh);
        })
        .catch(() => {});
      return;
    }

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetch('/api/topics')
        .then((res) => res.json())
        .then((data) => {
          const fresh = data.topics || [];
          cachedTopics = fresh;
          setTopics(fresh);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5" strokeWidth={1.5} /> 지식 모음
        </h1>
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <BookOpen className="h-5 w-5" /> 지식 모음
      </h1>

      {topics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">아직 지식 항목이 없습니다</p>
          <p className="text-sm mt-1">지식 관련 내용을 입력하면 AI가 주제별로 분류합니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <Link key={topic.name} href={`/knowledge/${encodeURIComponent(topic.name)}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">📚 {topic.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(topic.latest), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary">{topic.count}개</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
