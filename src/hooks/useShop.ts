import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse, Product, ProductCategory } from '@/types';

export function useProducts(category?: ProductCategory) {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', category],
    queryFn: async () => {
      const res = await api.get('/products', { params: category ? { category } : {} });
      return res.data;
    },
  });
}

export function useProductDetail(id: number) {
  return useQuery<ApiResponse<Product>>({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });
}

export function usePurchaseProduct(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phone: string) => {
      const res = await api.post(`/products/${productId}/purchase`, { phone });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] }); // 포인트 잔액 갱신
    },
  });
}
