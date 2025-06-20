import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '@/services/activities';
import { activityLogsService } from '@/services/activityLogs';

export interface DashboardStats {
  totalActivities: number;
  thisWeekCompleted: number;
  completedHours: number;
  totalPlannedHours: number;
  progressPercentage: number;
}

export interface RecentActivity {
  id: string;
  name: string;
  duration: string;
  date: string;
}

export const useDashboardStats = () => {
  // Get all activities
  const { data: activitiesResponse, error: activitiesError } = useQuery({
    queryKey: ['activities', 'all'],
    queryFn: () => activitiesService.getActivities({ limit: 50 }),
  });

  // Get activity logs for the current week
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
    const weekEnd = new Date(now.setDate(diff));
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd.toISOString().split('T')[0];
  };

  const { data: weeklyLogsResponse, error: weeklyLogsError } = useQuery({
    queryKey: ['activityLogs', 'weekly'],
    queryFn: () => activityLogsService.getActivityLogs({
      startDate: getWeekStart(),
      endDate: getWeekEnd(),
      limit: 50,
    }),
  });

  // Get recent activity logs
  const { data: recentLogsResponse, error: recentLogsError } = useQuery({
    queryKey: ['activityLogs', 'recent'],
    queryFn: () => activityLogsService.getActivityLogs({
      limit: 50,
    }),
  });

  // Calculate statistics
  const calculateStats = (): DashboardStats => {
    const activities = activitiesResponse?.data || [];
    const weeklyLogs = weeklyLogsResponse?.data || [];
    const allLogs = recentLogsResponse?.data || [];

    const totalActivities = activities.length;
    
    const thisWeekCompleted = weeklyLogs.filter(log => log.status === 'DONE').length;
    
    // Calculate completed hours from all activity logs
    const completedHours = allLogs
      .filter(log => log.status === 'DONE') // Only count completed activities
      .reduce((total, log) => {
        return total + (log.duration || 0);
      }, 0) / 60; // Convert minutes to hours
    
    // Calculate total planned hours from all activities
    const totalPlannedHours = activities.reduce((total, activity) => {
      return total + (activity.duration || 0);
    }, 0) / 60; // Convert minutes to hours
    
    // Calculate progress based on completed vs total activities this week
    const thisWeekTotal = weeklyLogs.length;
    const progressPercentage = thisWeekTotal > 0 
      ? Math.round((thisWeekCompleted / thisWeekTotal) * 100)
      : 0;

    return {
      totalActivities,
      thisWeekCompleted,
      completedHours: Math.round(completedHours * 10) / 10, // Round to 1 decimal place
      totalPlannedHours: Math.round(totalPlannedHours * 10) / 10, // Round to 1 decimal place
      progressPercentage,
    };
  };

  // Format recent activities
  const getRecentActivities = (): RecentActivity[] => {
    const logs = recentLogsResponse?.data || [];
    
    return logs.map(log => {
      const activity = log.activity;
      const duration = log.duration 
        ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m`
        : 'No duration';
      
      const date = new Date(log.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dateText = '';
      if (diffDays === 1) dateText = 'Today';
      else if (diffDays === 2) dateText = 'Yesterday';
      else if (diffDays <= 7) dateText = `${diffDays - 1} days ago`;
      else dateText = date.toLocaleDateString();

      return {
        id: log.id,
        name: activity?.title || 'Unknown Activity',
        duration,
        date: dateText,
      };
    });
  };

  const stats = calculateStats();
  const recentActivities = getRecentActivities();

  return {
    stats,
    recentActivities,
    isLoading: !activitiesResponse || !weeklyLogsResponse || !recentLogsResponse,
    error: activitiesError || weeklyLogsError || recentLogsError,
  };
}; 