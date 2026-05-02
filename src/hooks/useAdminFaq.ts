import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminFaq {
  id: number;
  question: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
}

export interface AdminFaqDetail extends AdminFaq {
  answer: string;
  updatedAt: string;
}

export function useAdminFaqs(page: number, search: string) {
  return useQuery<{ data: { faqs: AdminFaq[]; total: number } }>({
    queryKey: ['admin-faqs', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/faq?${params}`);
      return r.data;
    },
  });
}

export function useAdminFaq(id: number) {
  return useQuery<{ data: AdminFaqDetail }>({
    queryKey: ['admin-faq', id],
    queryFn: async () => {
      const r = await api.get(`/admin/faq/${id}`);
      return r.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      const r = await api.post('/admin/faq', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}

export function useUpdateFaq(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { question?: string; answer?: string; isVisible?: boolean }) => {
      const r = await api.patch(`/admin/faq/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] });
      qc.invalidateQueries({ queryKey: ['admin-faq', id] });
    },
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/faq/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });
}
