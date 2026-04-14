import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse, Product, ProductListResponse, ProductCategory, Purchase } from '@/types';

export function useProducts(category?: ProductCategory) {
  return useQuery<ApiResponse<ProductListResponse>>({
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
    enabled: !isNaN(id),
  });
}

export function useMyPurchases() {
  return useQuery<ApiResponse<Purchase[]>>({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      const res = await api.get('/products/my/purchases');
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
      void queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      void queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
    },
  });
}
