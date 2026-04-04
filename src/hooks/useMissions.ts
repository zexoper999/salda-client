import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ApiResponse, Mission, UserMission } from '@/types';

export function useMissions() {
  return useQuery<ApiResponse<Mission[]>>({
    queryKey: ['missions'],
    queryFn: async () => {
      const res = await api.get('/missions');
      return res.data;
    },
  });
}

export function useFirstComeMissions() {
  return useQuery<ApiResponse<Mission[]>>({
    queryKey: ['missions', 'first-come'],
    queryFn: async () => {
      const res = await api.get('/missions/first-come');
      return res.data;
    },
  });
}

export function useMissionDetail(id: number) {
  return useQuery<ApiResponse<Mission>>({
    queryKey: ['missions', id],
    queryFn: async () => {
      const res = await api.get(`/missions/${id}`);
      return res.data;
    },
  });
}

export function useMyCompletedMissions() {
  return useQuery<ApiResponse<UserMission[]>>({
    queryKey: ['missions', 'my-completed'],
    queryFn: async () => {
      const res = await api.get('/missions/my/completed');
      return res.data;
    },
  });
}

export function useCompleteMission(missionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/missions/${missionId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });
}
