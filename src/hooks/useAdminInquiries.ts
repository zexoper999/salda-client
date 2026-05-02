import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminInquiry {
  id: number;
  title: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  user: { name: string; phone: string | null };
}

export interface AdminInquiryDetail extends AdminInquiry {
  content: string;
  imageUrl?: string;
  answer?: string;
}

export function useAdminInquiries(page: number, search: string) {
  return useQuery<{ data: { inquiries: AdminInquiry[]; total: number } }>({
    queryKey: ['admin-inquiries', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/inquiries?${params}`);
      return r.data;
    },
  });
}

export function useAdminInquiry(id: number) {
  return useQuery<{ data: AdminInquiryDetail }>({
    queryKey: ['admin-inquiry', id],
    queryFn: async () => {
      const r = await api.get(`/admin/inquiries/${id}`);
      return r.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useReplyInquiry(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (answer: string) => {
      const r = await api.patch(`/admin/inquiries/${id}`, { answer });
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-inquiries'] });
      qc.invalidateQueries({ queryKey: ['admin-inquiry', id] });
    },
  });
}

export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/inquiries/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inquiries'] }),
  });
}
