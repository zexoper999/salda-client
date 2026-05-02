import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminNotice {
  id: number;
  title: string;
  isVisible: boolean;
  viewCount: number;
  createdAt: string;
}

export interface AdminNoticeDetail extends AdminNotice {
  content: string;
  updatedAt: string;
}

export function useAdminNotices(page: number, search: string) {
  return useQuery<{ data: { notices: AdminNotice[]; total: number } }>({
    queryKey: ['admin-notices', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/notices?${params}`);
      return r.data;
    },
  });
}

export function useAdminNotice(id: number) {
  return useQuery<{ data: AdminNoticeDetail }>({
    queryKey: ['admin-notice', id],
    queryFn: async () => {
      const r = await api.get(`/admin/notices/${id}`);
      return r.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; isVisible: boolean }) => {
      const r = await api.post('/admin/notices', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notices'] }),
  });
}

export function useUpdateNotice(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; content?: string; isVisible?: boolean }) => {
      const r = await api.patch(`/admin/notices/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notices'] });
      qc.invalidateQueries({ queryKey: ['admin-notice', id] });
    },
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/notices/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notices'] }),
  });
}
