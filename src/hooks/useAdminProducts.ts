import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type ProductCategory = 'GIFT_CARD' | 'CAFE' | 'CONVENIENCE' | 'BURGER_PIZZA' | 'GAS' | 'DINING';
export type ProductStatus = 'ON_SALE' | 'SUSPENDED' | 'ENDED';

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  GIFT_CARD:    '상품권',
  CAFE:         '카페',
  CONVENIENCE:  '편의점',
  BURGER_PIZZA: '햄버거/피자',
  GAS:          '주유',
  DINING:       '외식',
};

export interface AdminProduct {
  id: number;
  category: ProductCategory;
  status: ProductStatus;
  name: string;
  brand: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  purchaseCount: number;
  purchaseCountFmt: string;
}

export interface AdminProductPurchase {
  id: number;
  phone: string;
  pointBefore: number;
  pointUsed: number;
  pointAfter: number;
  createdAt: string;
  user: { name: string };
}

export function useAdminProducts(page: number, limit: number, search: string) {
  return useQuery<{ data: { products: AdminProduct[]; total: number } }>({
    queryKey: ['admin-products', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/products?${params}`);
      return r.data;
    },
  });
}

export function useAdminProduct(
  id: number,
  purchasePage: number,
  purchaseSearch: string,
) {
  return useQuery<{
    data: {
      product: AdminProduct;
      purchases: AdminProductPurchase[];
      purchaseTotal: number;
      purchaseCountFmt: string;
    };
  }>({
    queryKey: ['admin-product', id, purchasePage, purchaseSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ purchasePage: String(purchasePage), purchaseLimit: '10' });
      if (purchaseSearch) params.set('purchaseSearch', purchaseSearch);
      const r = await api.get(`/admin/products/${id}?${params}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminProduct>) => {
      const r = await api.post('/admin/products', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useUpdateProduct(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminProduct & { startAt: string | null; endAt: string | null }>) => {
      const r = await api.patch(`/admin/products/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/products/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}
