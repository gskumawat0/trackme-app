import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, TrendingUp, Loader2, CheckCircle, AlertTriangle, PlayCircle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTodayActivityLogs } from '@/hooks/useActivityLogs';
import { usePageTitle } from '@/hooks/usePageTitle';

const Dashboard: React.FC = () => {
  const { recentActivities, isLoading: statsLoading, error } = useDashboardStats();
  const { data: todayActivityResponse, isLoading: todayActivityLoading, error: todayActivityError } = useTodayActivityLogs();

  // Use custom hook for reliable title updates
  usePageTitle('Dashboard - TrackMe');

  const todayActivityLogs = todayActivityResponse?.data || [];

  // Calculate stats from today's activity logs (same as ActivityLogs page)
  const todayStats = useMemo(() => {
    const now = new Date();
    
    // Status counts
    const statusCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      HOLD: 0,
    };

    // Duration calculations
    let totalCompletedMinutes = 0;
    let expiredCount = 0;

    todayActivityLogs.forEach((log) => {
      statusCounts[log.status as keyof typeof statusCounts]++;
      
      if (log.status === 'DONE' && log.duration) {
        totalCompletedMinutes += log.duration;
      }

      // Check for expired items
      const endDate = new Date(log.endDate);
      if (endDate < now && log.status !== 'DONE') {
        expiredCount++;
      }
    });

    const totalCompletedHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;
    const totalActivities = todayActivityLogs.length;
    const completedCount = statusCounts.DONE;
    const inProgressCount = statusCounts.IN_PROGRESS;
    const pendingCount = statusCounts.TODO;
    const onHoldCount = statusCounts.HOLD;

    // Calculate progress percentage
    const progressPercentage = totalActivities > 0 
      ? Math.round((completedCount / totalActivities) * 100)
      : 0;

    return {
      totalActivities,
      completedCount,
      inProgressCount,
      pendingCount,
      onHoldCount,
      expiredCount,
      totalCompletedHours,
      progressPercentage,
    };
  }, [todayActivityLogs]);

  // Transform stats into the format expected by the component
  const statsData = [
    {
      title: 'Total Activities',
      value: todayStats.totalActivities.toString(),
      icon: Activity,
      description: 'Activities for today',
      color: 'text-purple-600',
    },
    {
      title: 'Completed',
      value: todayStats.completedCount.toString(),
      icon: CheckCircle,
      description: 'Activities done today',
      color: 'text-green-600',
    },
    {
      title: 'In Progress',
      value: todayStats.inProgressCount.toString(),
      icon: PlayCircle,
      description: 'Currently active',
      color: 'text-blue-600',
    },
    {
      title: 'Pending',
      value: todayStats.pendingCount.toString(),
      icon: Clock,
      description: 'Awaiting start',
      color: 'text-yellow-600',
    },
  ];

  const additionalStatsData = [
    {
      title: 'Completed Hours',
      value: `${todayStats.totalCompletedHours}h`,
      icon: Clock,
      description: 'Hours completed today',
      color: 'text-green-600',
    },
    {
      title: 'Progress',
      value: `${todayStats.progressPercentage}%`,
      icon: TrendingUp,
      description: 'Goal completion',
      color: 'text-blue-600',
    },
    {
      title: 'Expired Items',
      value: todayStats.expiredCount.toString(),
      icon: AlertTriangle,
      description: 'Overdue tasks',
      color: 'text-red-600',
    },
  ];

  useEffect(() => {
    // Show error toast if there's an error
    if (error || todayActivityError) {
      toast.error('Failed to load dashboard data');
    }
  }, [error, todayActivityError]);

  if (statsLoading || todayActivityLoading) {
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
            Welcome back! Here's an overview of your activity tracking for today.
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

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{todayStats.completedCount}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <PlayCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{todayStats.inProgressCount}</div>
                <div className="text-sm text-blue-700">In Progress</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{todayStats.pendingCount}</div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <PauseCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-600">{todayStats.onHoldCount}</div>
                <div className="text-sm text-gray-700">On Hold</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activities</CardTitle>
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
                  No activities found for today
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