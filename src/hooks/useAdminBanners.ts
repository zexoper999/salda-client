import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface Banner {
  id: number;
  imageUrl: string | null;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  isPublic: boolean;
  createdAt: string;
}

interface BannerListResponse {
  items: Banner[];
  total: number;
  page: number;
  limit: number;
}

export function useAdminBanners(search?: string, page = 1, limit = 20) {
  return useQuery<{ data: BannerListResponse }>({
    queryKey: ['admin-banners', search, page, limit],
    queryFn: async () => {
      const res = await api.get('/admin/banners', { params: { search, page, limit } });
      return res.data;
    },
  });
}

export function useAdminBanner(id: number) {
  return useQuery<{ data: Banner }>({
    queryKey: ['admin-banners', id],
    queryFn: async () => {
      const res = await api.get(`/admin/banners/${id}`);
      return res.data;
    },
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Banner, 'id' | 'isPublic' | 'createdAt'>) => {
      const res = await api.post('/admin/banners', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}

export function useUpdateBanner(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Banner>) => {
      const res = await api.patch(`/admin/banners/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/admin/banners/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}
