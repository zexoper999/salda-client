import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminSubscription {
  id: number;
  type: 'JEONSE' | 'VEHICLE';
  title: string;
  oneLineDesc: string | null;
  imageUrls: string[];
  startAt: string;
  endAt: string;
  createdAt: string;
  maxEntries: number;
  entryCount: number;
  entryCountFmt: string;
  status: 'ONGOING' | 'CLOSING_SOON' | 'CLOSED';
  isDefault: boolean;
}

export interface AdminSubscriptionDetail extends AdminSubscription {
  description: string | null;
  deposit: number;
  bonusIncluded: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  ONGOING: '응모진행중',
  CLOSING_SOON: '마감임박',
  CLOSED: '응모마감',
};
export { STATUS_LABEL };

export function useAdminSubscriptions(page: number, limit: number, search: string) {
  return useQuery<{ data: { subscriptions: AdminSubscription[]; total: number } }>({
    queryKey: ['admin-subscriptions', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/subscriptions?${params}`);
      return r.data;
    },
  });
}

export function useAdminSubscription(id: number) {
  return useQuery<{ data: AdminSubscriptionDetail }>({
    queryKey: ['admin-subscription', id],
    queryFn: async () => {
      const r = await api.get(`/admin/subscriptions/${id}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminSubscriptionDetail>) => {
      const r = await api.post('/admin/subscriptions', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}

export function useUpdateSubscription(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminSubscriptionDetail> & { status?: string }) => {
      const r = await api.patch(`/admin/subscriptions/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['admin-subscription', id] });
    },
  });
}

export function useCloseSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.patch(`/admin/subscriptions/${id}/close`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/subscriptions/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}

export function useSetDefaultSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.patch(`/admin/subscriptions/${id}/set-default`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}
