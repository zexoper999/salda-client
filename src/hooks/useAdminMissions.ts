import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type MissionCategory = 'SNS_SUBSCRIBE' | 'PAGE_VISIT' | 'TAG_FIND';
export type MissionStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export const CATEGORY_LABEL: Record<MissionCategory, string> = {
  SNS_SUBSCRIBE: 'SNS구독',
  PAGE_VISIT: '페이지방문',
  TAG_FIND: '관련태그찾기',
};

export const STATUS_LABEL: Record<MissionStatus, string> = {
  ACTIVE: '진행중',
  INACTIVE: '비활성화',
  CLOSED: '미션마감',
};

export interface AdminMission {
  id: number;
  category: MissionCategory;
  status: MissionStatus;
  title: string;
  publisher: string | null;
  oneLineDesc: string | null;
  imageUrls: string[];
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  successCount: number;
  successCountFmt: string;
}

export interface AdminMissionDetail {
  id: number;
  category: MissionCategory;
  status: MissionStatus;
  title: string;
  publisher: string | null;
  oneLineDesc: string | null;
  description: string | null;
  imageUrls: string[];
  missionUrl: string | null;
  rewardPoint: number;
  rewardTicket: number;
  ageRestriction: boolean;
  isFirstCome: boolean;
  limitCount: number | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

export interface MissionParticipant {
  id: number;
  success: boolean;
  completedAt: string;
  name: string;
  phone: string | null;
  point: number;
  entryCount: number;
  joinedAt: string;
  loginType: string;
}

export function useAdminMissions(page: number, limit: number, search: string) {
  return useQuery<{ data: { missions: AdminMission[]; total: number } }>({
    queryKey: ['admin-missions', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/missions?${params}`);
      return r.data;
    },
  });
}

export function useAdminMission(
  id: number,
  participantPage: number,
  search: string,
) {
  return useQuery<{
    data: {
      mission: AdminMissionDetail;
      participants: MissionParticipant[];
      participantTotal: number;
      successTotal: number;
      successTotalFmt: string;
    };
  }>({
    queryKey: ['admin-mission', id, participantPage, search],
    queryFn: async () => {
      const params = new URLSearchParams({ participantPage: String(participantPage) });
      if (search) params.set('search', search);
      const r = await api.get(`/admin/missions/${id}?${params}`);
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminMissionDetail>) => {
      const r = await api.post('/admin/missions', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-missions'] }),
  });
}

export function useUpdateMission(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminMissionDetail>) => {
      const r = await api.patch(`/admin/missions/${id}`, data);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-missions'] });
      qc.invalidateQueries({ queryKey: ['admin-mission', id] });
    },
  });
}

export function useDeleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const r = await api.delete(`/admin/missions/${id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-missions'] }),
  });
}
