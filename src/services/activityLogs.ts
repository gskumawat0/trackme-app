import api from './api';
import type {
  ActivityLog,
  UpdateActivityLogRequest,
  CreateActivityLogCommentRequest,
  ActivityLogComment,
  ExcludedInterval,
  CreateExcludedIntervalRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const activityLogsService = {
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    activityId?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const response = await api.get('/activity-logs', { 
      params: { 
        ...params, 
        comments: 'true' 
      } 
    });
    return response.data;
  },

  async getActivityLog(id: string): Promise<ApiResponse<ActivityLog>> {
    const response = await api.get(`/activity-logs/${id}`);
    return response.data;
  },

  async updateActivityLogStatus(
    id: string,
    data: UpdateActivityLogRequest
  ): Promise<ApiResponse<ActivityLog>> {
    const response = await api.patch(`/activity-logs/${id}/status`, data);
    return response.data;
  },

  async addActivityLogComment(
    id: string,
    data: CreateActivityLogCommentRequest
  ): Promise<ApiResponse<ActivityLogComment>> {
    const response = await api.post(`/activity-logs/${id}/comments`, data);
    return response.data;
  },

  async getActivityLogComments(
    id: string
  ): Promise<ApiResponse<ActivityLogComment[]>> {
    const response = await api.get(`/activity-logs/${id}/comments`);
    return response.data;
  },

  async deleteActivityLogComment(
    activityLogId: string,
    commentId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete(
      `/activity-logs/${activityLogId}/comments/${commentId}`
    );
    return response.data;
  },

  async generateTodayActivityLogs(): Promise<ApiResponse<void>> {
    const response = await api.post('/activity-logs/generate-today');
    return response.data;
  },

  async generateActivityLogs(data: {
    date: string;
    frequency?: string;
  }): Promise<ApiResponse<void>> {
    const response = await api.post('/activity-logs/generate', data);
    return response.data;
  },

  async getExcludedIntervals(): Promise<ApiResponse<ExcludedInterval[]>> {
    const response = await api.get('/activity-logs/excluded-intervals');
    return response.data;
  },

  async addExcludedInterval(
    data: CreateExcludedIntervalRequest
  ): Promise<ApiResponse<ExcludedInterval>> {
    const response = await api.post('/activity-logs/excluded-intervals', data);
    return response.data;
  },

  async deleteExcludedInterval(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(
      `/activity-logs/excluded-intervals/${id}`
    );
    return response.data;
  },

  async getPendingActivityLogs(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const response = await api.get('/activity-logs/pending', { 
      params: { 
        ...params, 
        comments: 'true' 
      } 
    });
    return response.data;
  },

  async getTodayActivityLogs(params?: {
    page?: number;
    limit?: number;
    activityId?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const response = await api.get('/activity-logs/today', { 
      params: { 
        ...params, 
        comments: 'true' 
      } 
    });
    return response.data;
  },
};
