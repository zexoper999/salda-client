"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useFaqs, type Faq } from "@/hooks/useFaq";

function SkeletonItem() {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-7 h-7 bg-gray-100 rounded-full flex-shrink-0" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="w-4 h-4 bg-gray-100 rounded ml-3" />
    </div>
  );
}

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: Faq;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
            Q
          </span>
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {faq.question}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`flex-shrink-0 ml-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="flex items-center gap-3 px-5 pb-4">
          <span className="w-7 h-7 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            A
          </span>
          <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyFaqPage() {
  const { data, isLoading } = useFaqs();
  const faqs = data?.data ?? [];
  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="FAQ" showBack />

      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)
        ) : faqs.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
            등록된 FAQ가 없습니다.
          </div>
        ) : (
          faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
