'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAdminProduct, useCreateProduct, useUpdateProduct, useDeleteProduct,
  CATEGORY_LABEL, type ProductCategory, type ProductStatus,
} from '@/hooks/useAdminProducts';
import ImageUploader from '@/components/admin/ImageUploader';

const isNew = (id: string) => id === 'new';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function toDateInput(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

export default function AdminShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const creating = isNew(id);
  const productId = creating ? 0 : Number(id);

  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseInputSearch, setPurchaseInputSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');

  const { data, isLoading } = useAdminProduct(productId, purchasePage, purchaseSearch);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId);
  const deleteMutation = useDeleteProduct();

  const [form, setForm] = useState({
    category: 'GIFT_CARD' as ProductCategory,
    name: '',
    brand: '',
    description: '',
    imageUrl: '' as string | null,
    price: 0,
    status: 'ON_SALE' as ProductStatus,
    startAt: '',
    endAt: '',
    noExpiry: false,
    ended: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!creating && data?.data?.product) {
      const p = data.data.product;
      setForm({
        category: p.category,
        name: p.name,
        brand: p.brand ?? '',
        description: p.description ?? '',
        imageUrl: p.imageUrl ?? null,
        price: p.price,
        status: p.status === 'ENDED' ? 'ON_SALE' : p.status,
        startAt: toDateInput(p.startAt),
        endAt: toDateInput(p.endAt),
        noExpiry: !p.startAt && !p.endAt,
        ended: p.status === 'ENDED',
      });
    }
  }, [data, creating]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const disabled = form.ended;

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('상품명을 입력하세요.'); return; }
    if (form.price <= 0) { setError('가격을 입력하세요.'); return; }
    const status: ProductStatus = form.ended ? 'ENDED' : form.status;
    const payload = {
      category: form.category,
      name: form.name,
      brand: form.brand || undefined,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      price: form.price,
      status,
      startAt: form.noExpiry ? null : (form.startAt || null),
      endAt: form.noExpiry ? null : (form.endAt || null),
    };
    setError('');
    try {
      if (creating) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync(payload);
      }
      router.push('/admin/shop');
    } catch {
      setError('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('상품을 삭제하시겠습니까?')) return;
    await deleteMutation.mutateAsync(productId);
    router.push('/admin/shop');
  };

  const purchases = data?.data?.purchases ?? [];
  const purchaseTotal = data?.data?.purchaseTotal ?? 0;
  const purchaseCountFmt = data?.data?.purchaseCountFmt ?? '0';
  const purchaseTotalPages = Math.max(1, Math.ceil(purchaseTotal / 10));

  if (!creating && isLoading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        {creating ? '상품등록' : '상품수정'}
      </h1>

      {/* 상품 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* 이미지 + 기본정보 */}
        <div className="flex gap-6">
          <div className="w-48 flex-shrink-0">
            <ImageUploader
              folder="products"
              images={form.imageUrl ? [form.imageUrl] : []}
              maxCount={1}
              onChange={(urls) => set('imageUrl', urls[0] ?? null)}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">상품명</label>
              <input
                type="text"
                value={form.name}
                disabled={disabled}
                onChange={(e) => set('name', e.target.value)}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">카테고리 · 상품분류</label>
              <div className="flex gap-2">
                <select
                  value={form.category}
                  disabled={disabled}
                  onChange={(e) => set('category', e.target.value as ProductCategory)}
                  className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {(Object.entries(CATEGORY_LABEL) as [ProductCategory, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="상품분류 (예: 배달의민족)"
                  value={form.brand}
                  disabled={disabled}
                  onChange={(e) => set('brand', e.target.value)}
                  className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">상품 설명</label>
              <textarea
                value={form.description}
                disabled={disabled}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* 판매기간 + 가격 + 활성화 상태 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 판매기간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">판매기간</label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={form.startAt}
                disabled={disabled || form.noExpiry}
                onChange={(e) => set('startAt', e.target.value)}
                className="h-9 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none w-full disabled:bg-gray-50 disabled:text-gray-300"
              />
              <span className="text-gray-400 flex-shrink-0">~</span>
              <input
                type="date"
                value={form.endAt}
                disabled={disabled || form.noExpiry}
                onChange={(e) => set('endAt', e.target.value)}
                className="h-9 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none w-full disabled:bg-gray-50 disabled:text-gray-300"
              />
            </div>
            <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.noExpiry}
                disabled={disabled}
                onChange={(e) => set('noExpiry', e.target.checked)}
                className="w-4 h-4 accent-gray-600"
              />
              <span className="text-xs text-gray-500">기간없음</span>
            </label>
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">가격</label>
            <input
              type="number"
              min={0}
              value={form.price}
              disabled={disabled}
              onChange={(e) => set('price', Number(e.target.value))}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <label className="flex items-center gap-1.5 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ended}
                onChange={(e) => set('ended', e.target.checked)}
                className="w-4 h-4 accent-gray-600"
              />
              <span className="text-xs text-gray-500">판매종료</span>
            </label>
          </div>

          {/* 활성화 상태 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">활성화 상태</label>
            <div className="space-y-2">
              {(['ON_SALE', 'SUSPENDED'] as ProductStatus[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    disabled={disabled}
                    onChange={() => set('status', s)}
                    className="accent-gray-800"
                  />
                  <span className="text-sm text-gray-700">
                    {s === 'ON_SALE' ? '활성화' : '비활성화'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* 구매 내역 (수정 모드만) */}
      {!creating && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">상품 구매</h2>
            <span className="text-sm text-gray-500">
              구매 횟수 <strong className="text-gray-800">{purchaseCountFmt}</strong>
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['이름', '휴대폰번호', '기존포인트', '사용포인트', '잔여포인트', '구매일'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      구매 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{p.user.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{p.pointBefore.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#F59E0B' }}>
                        {p.pointUsed.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.pointAfter.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-400">{fmtDate(p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 구매내역 하단 */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={purchaseInputSearch}
                onChange={(e) => setPurchaseInputSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPurchaseSearch(purchaseInputSearch); setPurchasePage(1); }}}
                placeholder="이름으로 검색"
                className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none w-36"
              />
              <button
                onClick={() => { setPurchaseSearch(purchaseInputSearch); setPurchasePage(1); }}
                className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg"
              >
                검색
              </button>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: purchaseTotalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPurchasePage(p)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    p === purchasePage ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-between mt-6">
        <div>
          {!creating && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/shop')}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2.5 bg-[#1C2536] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#2a3548] transition-colors"
          >
            {createMutation.isPending || updateMutation.isPending ? '처리 중...' : creating ? '등록하기' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
