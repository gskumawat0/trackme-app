import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '@/services/activities';
import type { CreateActivityRequest, UpdateActivityRequest } from '@/types';

export const useActivities = (params?: {
  page?: number;
  limit?: number;
  frequency?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => activitiesService.getActivities(params),
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesService.getActivity(id),
    enabled: !!id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityRequest) =>
      activitiesService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActivityRequest }) =>
      activitiesService.updateActivity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activitiesService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useActivitiesWithRollover = () => {
  return useQuery({
    queryKey: ['activities', 'rollover'],
    queryFn: () => activitiesService.getActivitiesWithRollover(),
  });
};
