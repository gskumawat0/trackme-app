import api from './api';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  ApiResponse,
  PaginatedResponse,
  ActivitiesWithRolloverResponse,
} from '@/types';

export const activitiesService = {
  async getActivities(params?: {
    page?: number;
    limit?: number;
    frequency?: string;
    search?: string;
  }): Promise<PaginatedResponse<Activity>> {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  async getActivity(id: string): Promise<ApiResponse<Activity>> {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  async createActivity(
    data: CreateActivityRequest
  ): Promise<ApiResponse<Activity>> {
    const response = await api.post('/activities', data);
    return response.data;
  },

  async updateActivity(
    id: string,
    data: UpdateActivityRequest
  ): Promise<ApiResponse<Activity>> {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  async deleteActivity(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  async getActivitiesWithRollover(): Promise<
    ApiResponse<ActivitiesWithRolloverResponse>
  > {
    const response = await api.get('/activities/rollover');
    return response.data;
  },
};
