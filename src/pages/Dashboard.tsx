import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, TrendingUp, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTodayCompletedLogs, useTodayActivityLogs } from '@/hooks/useActivityLogs';
import { usePageTitle } from '@/hooks/usePageTitle';

const Dashboard: React.FC = () => {
  const { stats, recentActivities, isLoading, error } = useDashboardStats();
  const { data: todayCompletedResponse, isLoading: todayCompletedLoading } = useTodayCompletedLogs();
  const { data: todayActivityResponse, isLoading: todayActivityLoading } = useTodayActivityLogs();

  // Use custom hook for reliable title updates
  usePageTitle('Dashboard - TrackMe');

  const todayCompletedLogs = todayCompletedResponse?.data || [];
  const todayActivityLogs = todayActivityResponse?.data || [];

  // Calculate additional stats
  const todayCompletedCount = todayCompletedLogs.length;
  const todayCompletedHours = todayCompletedLogs.reduce((total, log) => total + (log.duration || 0), 0) / 60;
  
  const todayActivityCount = todayActivityLogs.length;

  // Transform stats into the format expected by the component
  const statsData = [
    {
      title: 'Total Activities',
      value: stats?.totalActivities?.toString() || '0',
      icon: Activity,
      description: 'Active tracking',
      color: 'text-muted-foreground',
    },
    {
      title: 'Today Completed',
      value: todayCompletedCount.toString(),
      icon: CheckCircle,
      description: 'Activities done today',
      color: 'text-green-600',
    },
    {
      title: 'Today Hours',
      value: `${Math.round(todayCompletedHours * 10) / 10}h`,
      icon: Clock,
      description: 'Hours completed today',
      color: 'text-blue-600',
    },
    {
      title: 'Today Activities',
      value: todayActivityCount.toString(),
      icon: Activity,
      description: 'Activities for today',
      color: 'text-purple-600',
    },
  ];

  const additionalStatsData = [
    {
      title: 'This Week',
      value: stats?.thisWeekCompleted?.toString() || '0',
      icon: Calendar,
      description: 'Completed activities',
      color: 'text-muted-foreground',
    },
    {
      title: 'Progress',
      value: `${stats?.progressPercentage || 0}%`,
      icon: TrendingUp,
      description: 'Goal completion',
      color: 'text-muted-foreground',
    },
  ];

  useEffect(() => {
    // Show error toast if there's an error
    if (error) {
      toast.error('Failed to load dashboard data');
    }
  }, [error]);

  if (isLoading || todayCompletedLoading || todayActivityLoading) {
    return (
      <>
        <Helmet>
          <title>Dashboard - TrackMe</title>
          <meta name="description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
          <meta name="keywords" content="dashboard, trackme, activity tracking, productivity, progress overview" />
          <meta property="og:title" content="Dashboard - TrackMe" />
          <meta property="og:description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Dashboard - TrackMe" />
          <meta name="twitter:description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
        </Helmet>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your activity tracking.
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading dashboard data...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - TrackMe</title>
        <meta name="description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
        <meta name="keywords" content="dashboard, trackme, activity tracking, productivity, progress overview" />
        <meta property="og:title" content="Dashboard - TrackMe" />
        <meta property="og:description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Dashboard - TrackMe" />
        <meta name="twitter:description" content="TrackMe dashboard - Overview of your activity tracking progress and recent activities." />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your activity tracking.
          </p>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {additionalStatsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.duration}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activity.date}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activities found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard; 