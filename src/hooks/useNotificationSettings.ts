import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface NotificationSettings {
  notifAll: boolean;
  notifSubscription: boolean;
  notifMarketing: boolean;
  notifInfo: boolean;
  notifNight: boolean;
}

export function useNotificationSettings() {
  return useQuery<{ data: NotificationSettings }>({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const r = await api.get('/notifications/settings');
      return r.data;
    },
    staleTime: 0,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      const r = await api.patch('/notifications/settings', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-settings'] }),
  });
}
