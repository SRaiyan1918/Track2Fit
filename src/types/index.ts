// User Profile Types
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  name?: string;
  weight?: number;
  targetWeight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  createdAt?: any;
  updatedAt?: any;
}

// BMI Calculation Result
export interface BMIResult {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  color: string;
}

// Exercise Types
export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  completedSets: number;
  unit?: string;
}

export interface ExerciseLog {
  [key: string]: {
    targetSets: number;
    targetReps: number;
    completedSets: number;
    completed: boolean;
  };
}

// Nutrition Types
export interface NutritionItem {
  id: string;
  name: string;
  completed: boolean;
  icon?: string;
}

export interface NutritionLog {
  egg: boolean;
  fruit: boolean;
  protein: boolean;
  custom: NutritionItem[];
}

// Daily Log Types
export interface DailyLog {
  date: string;
  waterIntake: number;
  waterGoal: number;
  exercises: ExerciseLog;
  nutrition: NutritionLog;
  weight: number | null;
  streak: number;
  ramadanMode: boolean;
  sehriWater: number;
  iftarWater: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'hydration' | 'exercise' | 'nutrition' | 'streak' | 'ramadan' | 'special';
  requirement: number;
  awardedAt?: Date;
}

// Weight History Entry
export interface WeightEntry {
  id?: string;
  weight: number;
  date: string;
  createdAt?: Date;
}

// Hydration Status
export type HydrationStatus = 'dehydrated' | 'good' | 'perfect' | 'overhydrated';

export interface HydrationResult {
  percentage: number;
  status: HydrationStatus;
  message: string;
  color: string;
}

// AI Advice Types
export interface HealthAdvice {
  type: 'hydration' | 'exercise' | 'nutrition' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

// App Settings
export interface AppSettings {
  darkMode: boolean;
  ramadanMode: boolean;
  notificationsEnabled: boolean;
  waterReminderInterval: number;
  exerciseReminderTime: string;
}

// Chart Data Types
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

// Notification Types
export interface NotificationPermission {
  granted: boolean;
  permission: NotificationPermission | 'default' | 'denied';
}

// Ramadan Mode
export interface RamadanSettings {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  autoDisable: boolean;
}

// Progress Summary
export interface ProgressSummary {
  hydrationPercentage: number;
  exercisePercentage: number;
  nutritionPercentage: number;
  currentStreak: number;
  totalBadges: number;
  weightChange: number;
}
