import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityLogsService } from '@/services/activityLogs';
import type {
  UpdateActivityLogRequest,
  CreateActivityLogCommentRequest,
} from '@/types';

export const useActivityLogs = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  activityId?: string;
}) => {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => activityLogsService.getActivityLogs(params),
  });
};

export const useActivityLog = (id: string) => {
  return useQuery({
    queryKey: ['activityLog', id],
    queryFn: () => activityLogsService.getActivityLog(id),
    enabled: !!id,
  });
};

export const useUpdateActivityLogStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateActivityLogRequest;
    }) => activityLogsService.updateActivityLogStatus(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate all activity log related queries with a single call
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'activityLogs' || 
          query.queryKey[0] === 'todayActivityLogs' ||
          (query.queryKey[0] === 'activityLog' && query.queryKey[1] === id)
      });
    },
  });
};

export const useAddActivityLogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateActivityLogCommentRequest;
    }) => activityLogsService.addActivityLogComment(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific activity log and today's logs
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          (query.queryKey[0] === 'activityLog' && query.queryKey[1] === id) ||
          query.queryKey[0] === 'todayActivityLogs'
      });
    },
  });
};

export const useActivityLogComments = (id: string) => {
  return useQuery({
    queryKey: ['activityLogComments', id],
    queryFn: () => activityLogsService.getActivityLogComments(id),
    enabled: !!id,
  });
};

export const useDeleteActivityLogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityLogId,
      commentId,
    }: {
      activityLogId: string;
      commentId: string;
    }) =>
      activityLogsService.deleteActivityLogComment(activityLogId, commentId),
    onSuccess: (_, { activityLogId }) => {
      // Invalidate comments and today's logs
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          (query.queryKey[0] === 'activityLogComments' && query.queryKey[1] === activityLogId) ||
          query.queryKey[0] === 'todayActivityLogs'
      });
    },
  });
};

export const useGenerateTodayActivityLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activityLogsService.generateTodayActivityLogs(),
    onSuccess: () => {
      // Invalidate all activity log related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'activityLogs' || 
          query.queryKey[0] === 'todayActivityLogs'
      });
    },
  });
};

export const useGenerateActivityLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      date: string;
      frequency?: string;
    }) => activityLogsService.generateActivityLogs(data),
    onSuccess: () => {
      // Invalidate all activity log related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'activityLogs' || 
          query.queryKey[0] === 'todayActivityLogs'
      });
    },
  });
};

export const useExcludedIntervals = () => {
  return useQuery({
    queryKey: ['excludedIntervals'],
    queryFn: () => activityLogsService.getExcludedIntervals(),
  });
};

export const useAddExcludedInterval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'; type: 'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH'; value: number }) =>
      activityLogsService.addExcludedInterval(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['excludedIntervals'] });
    },
  });
};

export const useDeleteExcludedInterval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityLogsService.deleteExcludedInterval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['excludedIntervals'] });
    },
  });
};

export const usePendingActivityLogs = (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['pendingActivityLogs', params],
    queryFn: () => activityLogsService.getPendingActivityLogs(params),
  });
};

export const useTodayCompletedLogs = () => {
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  const getTodayEnd = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today.toISOString().split('T')[0];
  };

  return useQuery({
    queryKey: ['todayCompletedLogs'],
    queryFn: () => activityLogsService.getActivityLogs({
      startDate: getTodayStart(),
      endDate: getTodayEnd(),
      status: 'DONE',
      limit: 100,
    }),
  });
};

export const useTodayActivityLogs = () => {
  return useQuery({
    queryKey: ['todayActivityLogs'],
    queryFn: () => activityLogsService.getTodayActivityLogs(),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};
