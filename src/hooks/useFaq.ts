import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export function useFaqs() {
  return useQuery<{ data: Faq[] }>({
    queryKey: ['faqs'],
    queryFn: async () => {
      const r = await api.get('/faq');
      return r.data;
    },
  });
}
