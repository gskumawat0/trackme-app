import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '@/hooks/useActivities';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import type { CreateActivityRequest, UpdateActivityRequest } from '@/types';

const Activities: React.FC = () => {
  const { data: activitiesResponse, isLoading, error } = useActivities();
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  // Use custom hook for reliable title updates
  usePageTitle('Activities - TrackMe');

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    duration: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const activities = activitiesResponse?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      const updateData: UpdateActivityRequest = {
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        category: formData.category || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };
      
      updateActivityMutation.mutate(
        { id: editingActivity, data: updateData },
        {
          onSuccess: () => {
            toast.success('Activity updated successfully!');
            setFormData({ title: '', description: '', frequency: 'DAILY', duration: '', category: '', startDate: '', endDate: '' });
            setEditingActivity(null);
            setShowForm(false);
          },
          onError: (error) => {
            toast.error(`Failed to update activity: ${error.message}`);
          },
        }
      );
    } else {
      const newActivity: CreateActivityRequest = {
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        category: formData.category || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };
      
      createActivityMutation.mutate(newActivity, {
        onSuccess: () => {
          toast.success('Activity created successfully!');
          setFormData({ title: '', description: '', frequency: 'DAILY', duration: '', category: '', startDate: '', endDate: '' });
          setShowForm(false);
        },
        onError: (error) => {
          toast.error(`Failed to create activity: ${error.message}`);
        },
      });
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity.id);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      frequency: activity.frequency,
      duration: activity.duration ? activity.duration.toString() : '',
      category: activity.category || '',
      startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
      endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', frequency: 'DAILY', duration: '', category: '', startDate: '', endDate: '' });
    setEditingActivity(null);
    setShowForm(false);
  };

  const deleteActivity = (id: string) => {
    setDeletingActivity(id);
    deleteActivityMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Activity deleted successfully!');
        setDeletingActivity(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete activity: ${error.message}`);
        setDeletingActivity(null);
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Activities - TrackMe</title>
          <meta name="description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
          <meta name="keywords" content="activities, trackme, activity management, productivity, task tracking, daily activities, weekly activities, monthly activities" />
          <meta property="og:title" content="Activities - TrackMe" />
          <meta property="og:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Activities - TrackMe" />
          <meta name="twitter:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
        </Helmet>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Activities - TrackMe</title>
          <meta name="description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
          <meta name="keywords" content="activities, trackme, activity management, productivity, task tracking, daily activities, weekly activities, monthly activities" />
          <meta property="og:title" content="Activities - TrackMe" />
          <meta property="og:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content="Activities - TrackMe" />
          <meta name="twitter:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
        </Helmet>
        <div className="text-center text-red-600">
          Error loading activities: {error.message}
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Activities - TrackMe</title>
        <meta name="description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
        <meta name="keywords" content="activities, trackme, activity management, productivity, task tracking, daily activities, weekly activities, monthly activities" />
        <meta property="og:title" content="Activities - TrackMe" />
        <meta property="og:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Activities - TrackMe" />
        <meta name="twitter:description" content="Manage your activities and track your progress with TrackMe. Create, edit, and organize your daily, weekly, and monthly activities." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Activities</h2>
            <p className="text-muted-foreground">
              Manage your activities and track your progress.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {/* Add Activity Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Activity Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Morning Run"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Frequency
                    </label>
                    <Select
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })
                      }
                      required
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="e.g., 30"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="e.g., Exercise"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your activity..."
                    className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createActivityMutation.isPending || updateActivityMutation.isPending}>
                    {createActivityMutation.isPending || updateActivityMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {editingActivity ? 'Update Activity' : 'Create Activity'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Activities List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(activity)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteActivity(activity.id)}
                      disabled={deletingActivity === activity.id}
                    >
                      {deletingActivity === activity.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {activity.frequency}
                    </span>
                    {activity.duration && (
                      <span className="text-muted-foreground">
                        {activity.duration} min
                      </span>
                    )}
                    {activity.category && (
                      <span className="text-muted-foreground">
                        {activity.category}
                      </span>
                    )}
                  </div>
                  {activity.startDate && (
                    <p className="text-xs text-muted-foreground">
                      Start: {new Date(activity.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {activity.endDate && (
                    <p className="text-xs text-muted-foreground">
                      End: {new Date(activity.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activities.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No activities found. Create your first activity to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Activities; 