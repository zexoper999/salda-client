import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse, SubscriptionListResponse, SubscriptionDetail, SubscriptionEntry, SubscriptionType } from '@/types';

export function useSubscriptions(type?: SubscriptionType) {
  return useQuery<ApiResponse<SubscriptionListResponse>>({
    queryKey: ['subscriptions', type],
    queryFn: async () => {
      const res = await api.get('/subscriptions', { params: type ? { type } : {} });
      return res.data;
    },
  });
}

export function useSubscriptionDetail(id: number) {
  return useQuery<ApiResponse<SubscriptionDetail>>({
    queryKey: ['subscriptions', id],
    queryFn: async () => {
      const res = await api.get(`/subscriptions/${id}`);
      return res.data;
    },
    refetchInterval: 8000, // 8초마다 점유율 갱신 (polling)
  });
}

export function useMyEntries() {
  return useQuery<ApiResponse<SubscriptionEntry[]>>({
    queryKey: ['subscriptions', 'my-entries'],
    queryFn: async () => {
      const res = await api.get('/subscriptions/my/entries');
      return res.data;
    },
  });
}

export function useEnterSubscription(subscriptionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketCount: number) => {
      const res = await api.post(`/subscriptions/${subscriptionId}/enter`, { ticketCount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] }); // 응모권 잔액 갱신
    },
  });
}
