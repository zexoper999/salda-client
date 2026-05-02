'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAdminNotice, useCreateNotice, useUpdateNotice, useDeleteNotice,
} from '@/hooks/useAdminNotices';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-100 rounded" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function AdminNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';
  const noticeId = isNew ? 0 : Number(id);

  const { data, isLoading } = useAdminNotice(noticeId);
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice(noticeId);
  const deleteMutation = useDeleteNotice();

  const [editing, setEditing] = useState(isNew);
  const [form, setForm] = useState({ title: '', content: '', isVisible: true });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew && data?.data) {
      const n = data.data;
      setForm({ title: n.title, content: n.content, isVisible: n.isVisible });
    }
  }, [data, isNew]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!form.content.trim()) { setError('내용을 입력하세요.'); return; }
    setError('');
    try {
      if (isNew) {
        await createMutation.mutateAsync(form);
        router.push('/admin/notices');
      } else {
        await updateMutation.mutateAsync(form);
        setEditing(false);
      }
    } catch {
      setError('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await deleteMutation.mutateAsync(noticeId);
      router.push('/admin/notices');
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isNew && isLoading) return <LoadingSkeleton />;

  const notice = data?.data;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        {isNew ? '공지사항 등록' : '공지사항'}
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {editing ? (
          /* 편집 모드 */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">제목</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                rows={15}
                placeholder="공지사항 내용을 입력하세요"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400"
              />
            </div>
            {!isNew && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">공개여부</label>
                <button
                  onClick={() => set('isVisible', !form.isVisible)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isVisible ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.isVisible ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-xs text-gray-500">{form.isVisible ? '공개' : '비공개'}</span>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        ) : (
          /* 뷰 모드 */
          <div>
            <h2 className="text-xl font-bold text-gray-800">{notice?.title}</h2>
            <p className="text-xs text-gray-400 mt-1">{notice && fmtDate(notice.createdAt)}</p>
            <hr className="my-4 border-gray-200" />
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
              {notice?.content}
            </p>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between mt-6">
        {isNew ? (
          <>
            <button
              onClick={() => router.push('/admin/notices')}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              등록취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
            >
              {isPending ? '처리 중...' : '등록하기'}
            </button>
          </>
        ) : editing ? (
          <>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
            >
              {isPending ? '처리 중...' : '저장하기'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              삭제하기
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/notices')}
                className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                목록으로
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold hover:bg-[#2a3548] transition-colors"
              >
                수정하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
