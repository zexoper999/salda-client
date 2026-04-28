import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface AdminUser {
  id: number;
  name: string;
  phone: string | null;
  point: number;
  loginType: string;
  createdAt: string;
  entryCount: number;
}

export interface AdminUserDetail {
  id: number;
  name: string;
  phone: string | null;
  point: number;
  totalEarnedPoint: number;
  usedPoint: number;
  adjustedPoint: number;
  loginType: string;
  createdAt: string;
  missionCount: number;
  entryCount: number;
}

export function useAdminUsers(page: number, limit: number, search: string) {
  return useQuery<{ data: { users: AdminUser[]; total: number; page: number; limit: number } }>({
    queryKey: ['admin-users', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/users?${params}`);
      return r.data;
    },
  });
}

export function useAdminUser(id: number) {
  return useQuery<{ data: AdminUserDetail }>({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const r = await api.get(`/admin/users/${id}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useUpdateUserPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, point }: { id: number; point: number }) => {
      const r = await api.patch(`/admin/users/${id}/point`, { point });
      return r.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user', id] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/users/${id}`);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
