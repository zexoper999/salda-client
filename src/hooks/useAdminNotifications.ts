import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminNotification {
  id: number;
  title: string;
  body: string;
  targetType: 'ALL' | 'SPECIFIC';
  status: 'PENDING' | 'SENT' | 'FAILED';
  sendAt: string | null;
  sentAt: string | null;
  createdAt: string;
  targets: { id: number; userId: number; user: { id: number; name: string } }[];
}

export interface NotificationUser {
  id: number;
  name: string;
  phone: string | null;
  point: number;
  createdAt: string;
  kakaoId: string | null;
  appleId: string | null;
  notifAll: boolean;
  notifSubscription: boolean;
  notifMarketing: boolean;
  notifInfo: boolean;
  _count: { subscriptionEntries: number };
}

export function useAdminNotifications(page: number, search: string) {
  return useQuery<{ data: { notifications: AdminNotification[]; total: number } }>({
    queryKey: ['admin-notifications', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/notifications?${params}`);
      return r.data;
    },
  });
}

export function useNotificationUsers(search: string, enabled: boolean) {
  return useQuery<{ data: NotificationUser[] }>({
    queryKey: ['notification-users', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const r = await api.get(`/admin/notifications/users?${params}`);
      return r.data;
    },
    enabled,
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      targetType: 'ALL' | 'SPECIFIC';
      targetUserIds?: number[];
      sendAt?: string;
    }) => {
      const r = await api.post('/admin/notifications', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/notifications/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });
}
