import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Filter, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useExcludedIntervals, useAddExcludedInterval, useDeleteExcludedInterval } from '@/hooks/useActivityLogs';
import { usePageTitle } from '@/hooks/usePageTitle';

const ExcludedIntervals: React.FC = () => {
  const [selectedFrequency, setSelectedFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [selectedType, setSelectedType] = useState<'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH'>('DAY_OF_WEEK');
  const [selectedValue, setSelectedValue] = useState<number>(0);

  // Use custom hook for reliable title updates
  usePageTitle('Excluded Intervals - TrackMe');

  // API integration using custom hooks
  const {
    data: excludedIntervalsResponse,
    isLoading,
    error,
    refetch
  } = useExcludedIntervals();

  const {
    mutate: addExcludedInterval,
    isPending: isAdding
  } = useAddExcludedInterval();

  const {
    mutate: deleteExcludedInterval,
    isPending: isDeleting
  } = useDeleteExcludedInterval();

  const excludedIntervals = excludedIntervalsResponse?.data || [];

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'DAY_OF_WEEK':
        return 'Day of Week';
      case 'WEEK_OF_YEAR':
        return 'Week of Year';
      case 'MONTH':
        return 'Month';
      default:
        return type;
    }
  };

  const getValueDisplay = (type: string, value: number) => {
    if (type === 'DAY_OF_WEEK') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[value] || `Day ${value}`;
    } else if (type === 'WEEK_OF_YEAR') {
      return `Week ${value}`;
    } else if (type === 'MONTH') {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return months[value - 1] || `Month ${value}`;
    }
    return value.toString();
  };

  const handleAddExcludedInterval = () => {
    addExcludedInterval({
      frequency: selectedFrequency,
      type: selectedType,
      value: selectedValue
    }, {
      onSuccess: () => {
        toast.success('Excluded interval added successfully!');
        // Reset form
        if (selectedType === 'DAY_OF_WEEK') {
          setSelectedValue(0);
        } else if (selectedType === 'WEEK_OF_YEAR') {
          setSelectedValue(1);
        } else if (selectedType === 'MONTH') {
          setSelectedValue(1);
        }
      },
      onError: (error) => {
        toast.error('Failed to add excluded interval');
        console.error('Add excluded interval error:', error);
      }
    });
  };

  const handleDeleteExcludedInterval = (id: string) => {
    deleteExcludedInterval(id, {
      onSuccess: () => {
        toast.success('Excluded interval deleted successfully!');
      },
      onError: (error) => {
        toast.error('Failed to delete excluded interval');
        console.error('Delete excluded interval error:', error);
      }
    });
  };

  const handleTypeChange = (newType: 'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH') => {
    setSelectedType(newType);
    // Reset value to appropriate default
    if (newType === 'DAY_OF_WEEK') {
      setSelectedValue(0);
    } else if (newType === 'WEEK_OF_YEAR') {
      setSelectedValue(1);
    } else if (newType === 'MONTH') {
      setSelectedValue(1);
    }
  };

  const handleFrequencyChange = (newFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    setSelectedFrequency(newFrequency);
    // Update type based on frequency
    if (newFrequency === 'DAILY') {
      setSelectedType('DAY_OF_WEEK');
      setSelectedValue(0);
    } else if (newFrequency === 'WEEKLY') {
      setSelectedType('WEEK_OF_YEAR');
      setSelectedValue(1);
    } else if (newFrequency === 'MONTHLY') {
      setSelectedType('MONTH');
      setSelectedValue(1);
    }
  };

  if (error) {
    return (
      <>
        <Helmet>
          <title>Excluded Intervals - TrackMe</title>
          <meta name="description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
          <meta name="keywords" content="excluded intervals, trackme, activity scheduling, skip generation, activity management" />
          <meta property="og:title" content="Excluded Intervals - TrackMe" />
          <meta property="og:description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Excluded Intervals - TrackMe" />
          <meta name="twitter:description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Excluded Intervals</h2>
              <p className="text-muted-foreground">
                Manage when activity logs should not be generated.
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load excluded intervals</p>
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
        <title>Excluded Intervals - TrackMe</title>
        <meta name="description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
        <meta name="keywords" content="excluded intervals, trackme, activity scheduling, skip generation, activity management" />
        <meta property="og:title" content="Excluded Intervals - TrackMe" />
        <meta property="og:description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Excluded Intervals - TrackMe" />
        <meta name="twitter:description" content="Manage excluded intervals for activity log generation in TrackMe. Configure days and months when activity logs should not be generated." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Excluded Intervals</h2>
            <p className="text-muted-foreground">
              Manage when activity logs should not be generated.
            </p>
          </div>
        </div>

        {/* Add New Excluded Interval */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Excluded Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Frequency
                </label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => handleFrequencyChange(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value as 'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH')}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {selectedFrequency === 'DAILY' && (
                    <option value="DAY_OF_WEEK">Day of Week</option>
                  )}
                  {selectedFrequency === 'WEEKLY' && (
                    <option value="WEEK_OF_YEAR">Week of Year</option>
                  )}
                  {selectedFrequency === 'MONTHLY' && (
                    <option value="MONTH">Month</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Value
                </label>
                <select
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(Number(e.target.value))}
                  className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {selectedType === 'DAY_OF_WEEK' && (
                    <>
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </>
                  )}
                  {selectedType === 'WEEK_OF_YEAR' && (
                    <>
                      {Array.from({ length: 52 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Week {i + 1}
                        </option>
                      ))}
                    </>
                  )}
                  {selectedType === 'MONTH' && (
                    <>
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddExcludedInterval}
                  disabled={isAdding}
                  className="w-full"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Interval
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excluded Intervals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Current Excluded Intervals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading excluded intervals...</span>
              </div>
            ) : excludedIntervals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>No excluded intervals configured.</p>
                <p className="text-sm">Add intervals above to skip activity log generation on specific days or months.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {excludedIntervals.map((interval) => (
                  <div
                    key={interval.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getFrequencyDisplay(interval.frequency)} - {getTypeDisplay(interval.type)}
                          </h3>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {getValueDisplay(interval.type, interval.value)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {formatDate(interval.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Updated: {formatDate(interval.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => handleDeleteExcludedInterval(interval.id)}
                          disabled={isDeleting}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
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
                    Total Excluded Intervals
                  </p>
                  <p className="text-2xl font-bold">
                    {excludedIntervals.length}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Daily Exclusions
                  </p>
                  <p className="text-2xl font-bold">
                    {excludedIntervals.filter((interval) => interval.frequency === 'DAILY').length}
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
                    Weekly Exclusions
                  </p>
                  <p className="text-2xl font-bold">
                    {excludedIntervals.filter((interval) => interval.frequency === 'WEEKLY').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Exclusions
                  </p>
                  <p className="text-2xl font-bold">
                    {excludedIntervals.filter((interval) => interval.frequency === 'MONTHLY').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Information */}
        <Card>
          <CardHeader>
            <CardTitle>How Excluded Intervals Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Excluded intervals allow you to specify when activity logs should <strong>not</strong> be generated automatically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Daily Exclusions</h4>
                  <p>Skip activity log generation on specific days of the week (e.g., weekends).</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Weekly Exclusions</h4>
                  <p>Skip activity log generation during specific weeks of the year (1-52).</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Monthly Exclusions</h4>
                  <p>Skip activity log generation during specific months of the year.</p>
                </div>
              </div>
              <p className="text-xs">
                <strong>Note:</strong> These settings only affect automatic generation. You can still manually create activity logs on excluded days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExcludedIntervals; 