import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Filter, Download, Loader2, Plus, CalendarDays, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useActivityLogs, useGenerateActivityLogs, useUpdateActivityLogStatus, useTodayActivityLogs } from '@/hooks/useActivityLogs';
import { usePageTitle } from '@/hooks/usePageTitle';
import GenerateActivityLogsModal from '@/components/GenerateActivityLogsModal';
import ActivityLogCommentsModal from '@/components/ActivityLogCommentsModal';
import type { ActivityLog } from '@/types';

const ActivityLogs: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedActivityLog, setSelectedActivityLog] = useState<ActivityLog | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [showPendingAndExpired, setShowPendingAndExpired] = useState(false);

  // Use custom hook for reliable title updates
  usePageTitle('Activity Logs - TrackMe');

  // API integration using custom hooks
  const {
    data: activityLogsResponse,
    isLoading,
    error,
    refetch
  } = useActivityLogs({
    page: currentPage,
    limit: pageSize,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const {
    mutate: generateActivityLogs,
    isPending: isGenerating
  } = useGenerateActivityLogs();

  const {
    mutate: updateActivityLogStatus,
    isPending: isUpdating
  } = useUpdateActivityLogStatus();

  // Get today's logs
  const {
    data: todayLogsResponse,
    isLoading: todayLoading,
  } = useTodayActivityLogs();

  const activityLogs = activityLogsResponse?.data || [];
  const todayLogs = todayLogsResponse?.data || [];
  const pagination = activityLogsResponse?.pagination;

  // Use the appropriate data based on the filter
  const displayLogs = showPendingAndExpired ? todayLogs : activityLogs;
  const isLoadingData = showPendingAndExpired ? todayLoading : isLoading;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800';
      case 'HOLD':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'TODO':
        return 'Pending';
      case 'HOLD':
        return 'Hold';
      default:
        return status;
    }
  };

  const filteredLogs = displayLogs.filter((log) => {
    const matchesFilter = log.activity?.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    return matchesFilter;
  });

  // Sort logs by endDate in increasing order and add expiry highlighting
  const sortedAndHighlightedLogs = useMemo(() => {
    const now = new Date();
    const oneAndHalfDaysInMs = 1.5 * 24 * 60 * 60 * 1000;
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

    return filteredLogs
      .map((log) => {
        const endDate = new Date(log.endDate);
        const timeUntilExpiry = endDate.getTime() - now.getTime();
        
        let borderColor = '';
        if (timeUntilExpiry <= 0) {
          borderColor = 'border-l-4 border-l-red-600'; // Darker red for expired
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
      })
      .sort((a, b) => {
        // Sort by endDate only in increasing order
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });
  }, [filteredLogs]);

  const handleExportLogs = () => {
    // This would typically call an API to export logs
    // For now, we'll just show a toast notification
    toast.success('Activity logs exported successfully!');
  };

  const handleGenerateTodayLogs = () => {
    const today = new Date();
    const date = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    generateActivityLogs({
      date,
      frequency: 'DAILY'
    }, {
      onSuccess: () => {
        toast.success('Today\'s activity logs generated successfully!');
        refetch(); // Refresh the data to show the new logs
      },
      onError: (error) => {
        toast.error('Failed to generate today\'s activity logs');
        console.error('Generate today logs error:', error);
      }
    });
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleUpdateStatus = (logId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD') => {
    updateActivityLogStatus({
      id: logId,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast.success('Activity status updated successfully!');
        refetch(); // Refresh the data to show the updated status
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
              disabled={isGenerating || isLoadingData}
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Today's Logs
            </Button>
            <Button 
              onClick={() => setIsGenerateModalOpen(true)}
              disabled={isGenerating || isLoadingData}
              variant="outline"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Generate Custom Logs
            </Button>
            <Button onClick={handleExportLogs} disabled={isLoadingData}>
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
                  disabled={showPendingAndExpired}
                >
                  <option value="all">All Statuses</option>
                  <option value="TODO">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Completed</option>
                  <option value="HOLD">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Special Filters
                </label>
                <select
                  value={showPendingAndExpired ? 'today' : 'all'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setShowPendingAndExpired(value === 'today');
                    setSelectedStatus('all');
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All Items</option>
                  <option value="today">Today's Logs</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilter('');
                    setSelectedStatus('all');
                    setCurrentPage(1);
                    setShowPendingAndExpired(false);
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

        {/* Activity Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Activity Logs
              {showPendingAndExpired && (
                <span className="ml-2 text-sm font-normal text-orange-600">
                  (Today's Logs Only)
                </span>
              )}
            </CardTitle>
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
            {isLoadingData ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading activity logs...</span>
              </div>
            ) : sortedAndHighlightedLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found matching your filters.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAndHighlightedLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${log.borderColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {log.activity?.title || 'Unknown Activity'}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}
                          >
                            {getStatusDisplay(log.status)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getExpiryBadgeColor(log.timeUntilExpiry)}`}
                            title={`Expires: ${formatDate(log.endDate)}`}
                          >
                            {formatTimeUntilExpiry(log.timeUntilExpiry)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(log.startDate)} - {formatDate(log.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(log.duration ?? null)}</span>
                          </div>
                          <div>
                            <span>Created: {formatDate(log.createdAt)}</span>
                          </div>
                        </div>

                        {log.activity?.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {log.activity.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <select
                          value={log.status}
                          onChange={(e) => handleUpdateStatus(log.id, e.target.value as any)}
                          disabled={isUpdating}
                          className="text-xs p-1 border rounded bg-background"
                        >
                          <option value="TODO">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Completed</option>
                          <option value="HOLD">On Hold</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenComments(log)}
                          className="text-xs"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Comments
                          {log.comments && log.comments.length > 0 && (
                            <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                              {log.comments.length}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                    {displayLogs.filter((log) => log.status === 'DONE').length}
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
                      const totalMinutes = displayLogs
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
                    {displayLogs.filter((log) => log.status === 'IN_PROGRESS').length}
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
                    {displayLogs.filter((log) => {
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing page {pagination.page} of {pagination.totalPages} 
                  ({pagination.total} total logs)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 py-2 text-sm">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Activity Logs Modal */}
      <GenerateActivityLogsModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={() => refetch()}
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