// User types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Activity types
export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  duration?: number | null; // Duration in minutes
  category?: string | null; // Category name
  startDate?: Date | null;
  endDate?: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityWithRolloverInfo extends Activity {
  isRollover: boolean;
  rolloverReason?: string;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  duration?: number; // Duration in minutes
  category?: string; // Category name
  startDate?: string;
  endDate?: string;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  duration?: number; // Duration in minutes
  category?: string; // Category name
  startDate?: string;
  endDate?: string;
}

// ActivityLog types
export interface ActivityLog {
  id: string;
  activityId: string;
  startDate: Date;
  endDate: Date;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD';
  duration?: number | null; // Duration in minutes
  completedAt?: Date | null; // Timestamp when activity was completed
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  activity?: Activity;
  comments?: ActivityLogComment[];
}

export interface CreateActivityLogRequest {
  activityId: string;
  startDate: string;
  endDate: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD';
}

export interface UpdateActivityLogRequest {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'HOLD';
}

// ActivityLogComment types
export interface ActivityLogComment {
  id: string;
  activityLogId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityLogCommentRequest {
  comment: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Activity display types for different frequencies
export interface DailyActivity extends Activity {
  shouldAppearToday: boolean;
}

export interface WeeklyActivity extends Activity {
  shouldAppearThisWeek: boolean;
  weekStartDate: Date;
}

export interface MonthlyActivity extends Activity {
  shouldAppearThisMonth: boolean;
  monthStartDate: Date;
}

// Rollover response types
export interface RolloverSummary {
  totalRollover: number;
  dailyRollover: number;
  weeklyRollover: number;
  monthlyRollover: number;
  rolloverActivities: ActivityWithRolloverInfo[];
}

export interface ActivitiesWithRolloverResponse {
  activities: ActivityWithRolloverInfo[];
  rolloverSummary: RolloverSummary;
}

// Excluded intervals
export interface ExcludedInterval {
  id: string;
  userId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  type: 'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH';
  value: number; // day of week (0-6) for DAILY, week of year (1-52) for WEEKLY, month (1-12) for MONTHLY
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExcludedIntervalRequest {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  type: 'DAY_OF_WEEK' | 'WEEK_OF_YEAR' | 'MONTH';
  value: number;
}
