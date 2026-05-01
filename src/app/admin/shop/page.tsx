'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminProducts, useUpdateProduct, CATEGORY_LABEL, type AdminProduct } from '@/hooks/useAdminProducts';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function SalePeriod({ product }: { product: AdminProduct }) {
  if (!product.startAt && !product.endAt) return <span className="text-gray-400">기간없음</span>;
  if (product.status === 'ENDED') return <span className="text-red-400 font-medium">판매종료</span>;
  const s = product.startAt ? fmtDate(product.startAt) : '';
  const e = product.endAt ? fmtDate(product.endAt) : '';
  return <span>{s}~{e}</span>;
}

function StatusToggle({ product }: { product: AdminProduct }) {
  const updateMutation = useUpdateProduct(product.id);
  const isOn = product.status === 'ON_SALE';
  const isEnded = product.status === 'ENDED';

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEnded) return;
    updateMutation.mutate({ status: isOn ? 'SUSPENDED' : 'ON_SALE' });
  };

  return (
    <button
      onClick={toggle}
      disabled={isEnded || updateMutation.isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 ${
        isOn ? 'bg-blue-500' : 'bg-gray-200'
      }`}
      aria-label="활성화 토글"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminShopPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState('');
  const [search, setSearch] = useState('');
  const LIMIT = 10;

  const { data, isLoading } = useAdminProducts(page, LIMIT, search);
  const products = data?.data?.products ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const handleSearch = () => { setSearch(inputSearch); setPage(1); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">쇼핑관리</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-14">No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상품설명</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-36">판매기간</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">구매현황</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">등록일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">활성화</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-5">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/shop/${product.id}`)}
                >
                  <td className="px-4 py-4 text-gray-500">{product.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">
                          {CATEGORY_LABEL[product.category]}
                          {product.brand && ` · ${product.brand}`}
                        </p>
                        <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 max-w-sm">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    <SalePeriod product={product} />
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-700">{product.purchaseCountFmt}</td>
                  <td className="px-4 py-4 text-gray-500">{fmtDate(product.createdAt)}</td>
                  <td className="px-4 py-4">
                    <StatusToggle product={product} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 바 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="상품이름으로 검색"
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none w-44"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#1C2536] text-white text-sm rounded-lg"
          >
            검색
          </button>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                p === page ? 'bg-[#1C2536] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          disabled
          title="외부 API 연동 후 사용 가능합니다"
          className="px-5 py-2.5 bg-[#1C2536] text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed"
        >
          상품호출
        </button>
      </div>
    </div>
  );
}
