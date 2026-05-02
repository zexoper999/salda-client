import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface MyInquiry {
  id: number;
  title: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
}

export interface InquiryDetail extends MyInquiry {
  content: string;
  imageUrl?: string;
  answer?: string;
  updatedAt: string;
}

export function useMyInquiries() {
  return useQuery<{ data: MyInquiry[] }>({
    queryKey: ['inquiries', 'my'],
    queryFn: async () => {
      const r = await api.get('/inquiries/my');
      return r.data;
    },
  });
}

export function useInquiry(id: number) {
  return useQuery<{ data: InquiryDetail }>({
    queryKey: ['inquiries', id],
    queryFn: async () => {
      const r = await api.get(`/inquiries/${id}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; imageUrl?: string }) => {
      const r = await api.post('/inquiries', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inquiries', 'my'] }),
  });
}
