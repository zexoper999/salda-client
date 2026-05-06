import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type HistoryItem = {
  id: string;
  type: 'POINT_EARN' | 'POINT_USE' | 'TICKET_EARN' | 'TICKET_USE';
  title: string;
  subtitle: string;
  amount: number;
  sign: '+' | '-';
  currency: 'POINT' | 'TICKET';
  date: string;
};

export function useHistory() {
  return useQuery<{ data: HistoryItem[] }>({
    queryKey: ['history', 'my'],
    queryFn: async () => {
      const r = await api.get('/history/my');
      return r.data;
    },
  });
}
