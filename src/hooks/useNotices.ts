import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface Notice {
  id: number;
  title: string;
  createdAt: string;
}

export interface NoticeDetail extends Notice {
  content: string;
  viewCount: number;
}

export function useNotices() {
  return useQuery<{ data: Notice[] }>({
    queryKey: ['notices'],
    queryFn: async () => {
      const r = await api.get('/notices');
      return r.data;
    },
  });
}

export function useNotice(id: number) {
  return useQuery<{ data: NoticeDetail }>({
    queryKey: ['notices', id],
    queryFn: async () => {
      const r = await api.get(`/notices/${id}`);
      return r.data;
    },
    enabled: !!id,
  });
}
