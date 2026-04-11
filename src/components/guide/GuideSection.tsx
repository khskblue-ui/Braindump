'use client';

import { ScrollReveal } from '@/components/landing/ScrollReveal';

interface GuideSectionProps {
  id: string;
  number: number;
  color: string;
  title: string;
  description: string;
  children: React.ReactNode;
  layout?: 'default' | 'split';
}

export function GuideSection({ id, number, color, title, description, children, layout = 'default' }: GuideSectionProps) {
  return (
    <section id={id} className="py-16 sm:py-20 scroll-mt-32">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-start gap-4 mb-8">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {number}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1.5 leading-relaxed">{description}</p>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          {layout === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
              {children}
            </div>
          ) : (
            children
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
