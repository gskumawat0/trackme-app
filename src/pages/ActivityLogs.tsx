import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Filter, Download, Loader2, Plus, MessageSquare, CheckCircle, PlayCircle, Clock as ClockIcon, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTodayActivityLogs, useGenerateActivityLogs, useUpdateActivityLogStatus } from '@/hooks/useActivityLogs';
import { usePageTitle } from '@/hooks/usePageTitle';
import GenerateActivityLogsModal from '@/components/GenerateActivityLogsModal';
import ActivityLogCommentsModal from '@/components/ActivityLogCommentsModal';
import type { ActivityLog } from '@/types';

const ActivityLogs: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedActivityLog, setSelectedActivityLog] = useState<ActivityLog | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Use custom hook for reliable title updates
  usePageTitle('Activity Logs - TrackMe');

  // API integration using custom hooks - only use today's logs
  const {
    data: todayLogsResponse,
    isLoading,
    error,
    refetch
  } = useTodayActivityLogs();

  const {
    mutate: generateActivityLogs,
    isPending: isGenerating
  } = useGenerateActivityLogs();

  const {
    mutate: updateActivityLogStatus,
    isPending: isUpdating
  } = useUpdateActivityLogStatus();

  const activityLogs = todayLogsResponse?.data || [];

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (durationMinutes: number | null) => {
    if (!durationMinutes) return 'No duration set';
    
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeUntilExpiry = (timeUntilExpiry: number) => {
    if (timeUntilExpiry <= 0) {
      return 'Expired';
    }
    
    const days = Math.floor(timeUntilExpiry / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeUntilExpiry % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilExpiry % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getExpiryBadgeColor = (timeUntilExpiry: number) => {
    if (timeUntilExpiry <= 0) {
      return 'bg-red-100 text-red-800';
    }
    
    const oneAndHalfDaysInMs = 1.5 * 24 * 60 * 60 * 1000;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    
    if (timeUntilExpiry < oneAndHalfDaysInMs) {
      return 'bg-red-100 text-red-800';
    } else if (timeUntilExpiry < threeDaysInMs) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'TODO':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'HOLD':
        return <PauseCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter = log.activity?.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    return matchesFilter;
  });

  // Group logs by status and sort by expiry date
  const groupedLogs = useMemo(() => {
    const now = new Date();
    const oneAndHalfDaysInMs = 1.5 * 24 * 60 * 60 * 1000;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    const logsWithExpiry = filteredLogs.map((log) => {
      const endDate = new Date(log.endDate);
      const timeUntilExpiry = endDate.getTime() - now.getTime();
      
      let borderColor = '';
      if (timeUntilExpiry <= 0) {
        borderColor = 'border-l-4 border-l-red-600';
      } else if (timeUntilExpiry < oneAndHalfDaysInMs) {
        borderColor = 'border-l-4 border-l-red-500';
      } else if (timeUntilExpiry < threeDaysInMs) {
        borderColor = 'border-l-4 border-l-yellow-500';
      } else {
        borderColor = 'border-l-4 border-l-gray-200';
      }

      return {
        ...log,
        borderColor,
        timeUntilExpiry
      };
    });

    // Sort by expiry date (earliest first)
    logsWithExpiry.sort((a, b) => a.timeUntilExpiry - b.timeUntilExpiry);

    // Group by status
    const grouped = {
      TODO: logsWithExpiry.filter(log => log.status === 'TODO'),
      IN_PROGRESS: logsWithExpiry.filter(log => log.status === 'IN_PROGRESS'),
      DONE: logsWithExpiry.filter(log => log.status === 'DONE'),
      HOLD: logsWithExpiry.filter(log => log.status === 'HOLD'),
    };

    return grouped;
  }, [filteredLogs]);

  const statusColumns = [
    { key: 'TODO', title: 'Pending', icon: getStatusIcon('TODO'), color: 'bg-yellow-50' },
    { key: 'HOLD', title: 'On Hold', icon: getStatusIcon('HOLD'), color: 'bg-gray-50' },
    { key: 'IN_PROGRESS', title: 'In Progress', icon: getStatusIcon('IN_PROGRESS'), color: 'bg-blue-50' },
    { key: 'DONE', title: 'Completed', icon: getStatusIcon('DONE'), color: 'bg-green-50' },
  ];

  const handleExportLogs = () => {
    toast.success('Activity logs exported successfully!');
  };

  const handleGenerateTodayLogs = () => {
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    generateActivityLogs({
      date,
      frequency: 'DAILY'
    }, {
      onSuccess: () => {
        toast.success('Today\'s activity logs generated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to generate today\'s activity logs');
        console.error('Generate today logs error:', error);
      }
    });
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
  };

  const handleUpdateStatus = (logId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD') => {
    updateActivityLogStatus({
      id: logId,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast.success('Activity status updated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to update activity status');
        console.error('Update activity status error:', error);
      }
    });
  };

  const handleOpenComments = (activityLog: ActivityLog) => {
    setSelectedActivityLog(activityLog);
    setIsCommentsModalOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsModalOpen(false);
    setSelectedActivityLog(null);
  };

  if (error) {
    return (
      <>
        <Helmet>
          <title>Activity Logs - TrackMe</title>
          <meta name="description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
          <meta name="keywords" content="activity logs, trackme, activity tracking, progress tracking, activity history, productivity logs" />
          <meta property="og:title" content="Activity Logs - TrackMe" />
          <meta property="og:description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Activity Logs - TrackMe" />
          <meta name="twitter:description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Activity Logs</h2>
              <p className="text-muted-foreground">
                View and manage your activity tracking history.
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load activity logs</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Activity Logs - TrackMe</title>
        <meta name="description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
        <meta name="keywords" content="activity logs, trackme, activity tracking, progress tracking, activity history, productivity logs" />
        <meta property="og:title" content="Activity Logs - TrackMe" />
        <meta property="og:description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Activity Logs - TrackMe" />
        <meta name="twitter:description" content="View and manage your activity tracking history with TrackMe. Track progress, update status, and export your activity logs." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Activity Logs</h2>
            <p className="text-muted-foreground">
              View and manage your activity tracking history.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateTodayLogs} 
              disabled={isGenerating || isLoading}
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Today's Logs
            </Button>
            <Button onClick={handleExportLogs} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search Activities
                </label>
                <Input
                  placeholder="Search by activity name..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status Filter
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="TODO">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                  <option value="HOLD">On Hold</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilter('');
                    setSelectedStatus('all');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jira-like Board */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Board</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Expired</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Expires in &lt; 1.5 days</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Expires in &lt; 3 days</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Expires in &gt; 3 days</span>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading activity logs...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {statusColumns.map((column) => {
                  const logs = groupedLogs[column.key as keyof typeof groupedLogs];
                  const filteredLogs = selectedStatus === 'all' || selectedStatus === column.key ? logs : [];
                  
                  return (
                    <div key={column.key} className={`rounded-lg ${column.color} p-4`}>
                      <div className="flex items-center gap-2 mb-4">
                        {column.icon}
                        <h3 className="font-semibold text-lg">{column.title}</h3>
                        <span className="bg-white/50 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                          {logs.length}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {filteredLogs.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            No {column.title.toLowerCase()} tasks
                          </div>
                        ) : (
                          filteredLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${log.borderColor}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {log.activity?.title || 'Unknown Activity'}
                                </h4>
                                <select
                                  value={log.status}
                                  onChange={(e) => handleUpdateStatus(log.id, e.target.value as any)}
                                  disabled={isUpdating}
                                  className="text-xs p-1 border rounded bg-background ml-2"
                                >
                                  <option value="TODO">Pending</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="DONE">Completed</option>
                                  <option value="HOLD">On Hold</option>
                                </select>
                              </div>
                              
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(log.endDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(log.duration ?? null)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs ${getExpiryBadgeColor(log.timeUntilExpiry)}`}
                                  >
                                    {formatTimeUntilExpiry(log.timeUntilExpiry)}
                                  </span>
                                </div>
                              </div>

                              {log.activity?.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {log.activity.description}
                                </p>
                              )}

                              <div className="flex justify-between items-center mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenComments(log)}
                                  className="text-xs h-6 px-2"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  {log.comments && log.comments.length > 0 && (
                                    <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs ml-1">
                                      {log.comments.length}
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold">
                    {activityLogs.filter((log) => log.status === 'DONE').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {(() => {
                      const totalMinutes = activityLogs
                        .filter((log) => log.status === 'DONE' && log.duration)
                        .reduce((sum, log) => sum + (log.duration || 0), 0);
                      const hours = Math.floor(totalMinutes / 60);
                      const mins = totalMinutes % 60;
                      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                    })()}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Sessions
                  </p>
                  <p className="text-2xl font-bold">
                    {activityLogs.filter((log) => log.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expired Items
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {activityLogs.filter((log) => {
                      const endDate = new Date(log.endDate);
                      const now = new Date();
                      return endDate < now;
                    }).length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generate Activity Logs Modal */}
      <GenerateActivityLogsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />

      {/* Comments Modal */}
      <ActivityLogCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseComments}
        activityLog={selectedActivityLog}
      />
    </>
  );
};

export default ActivityLogs; 