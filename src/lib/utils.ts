import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BMIResult, HydrationResult, HydrationStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// BMI Calculation
export function calculateBMI(weight: number, height: number): BMIResult {
  // BMI = weight (kg) / height (m)
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBMI = Math.round(bmi * 10) / 10;
  
  let category: BMIResult['category'];
  let color: string;
  
  if (roundedBMI < 18.5) {
    category = 'underweight';
    color = '#F59E0B'; // Yellow
  } else if (roundedBMI < 25) {
    category = 'normal';
    color = '#10B981'; // Green
  } else if (roundedBMI < 30) {
    category = 'overweight';
    color = '#F97316'; // Orange
  } else {
    category = 'obese';
    color = '#EF4444'; // Red
  }
  
  return { value: roundedBMI, category, color };
}

export function getBMICategoryLabel(category: BMIResult['category']): string {
  const labels = {
    underweight: 'Underweight',
    normal: 'Normal Weight',
    overweight: 'Overweight',
    obese: 'Obese'
  };
  return labels[category];
}

// Water Goal Calculation
export function calculateWaterGoal(weight: number): number {
  // Formula: Weight × 30-35 ml (using 32.5ml as average)
  const waterGoal = Math.round(weight * 32.5);
  // Round to nearest 100ml
  return Math.round(waterGoal / 100) * 100;
}

// Hydration Status
export function getHydrationStatus(intake: number, goal: number): HydrationResult {
  const percentage = Math.round((intake / goal) * 100);
  
  let status: HydrationStatus;
  let message: string;
  let color: string;
  
  if (percentage < 60) {
    status = 'dehydrated';
    message = 'Mild Dehydration Warning - Drink more water!';
    color = '#EF4444';
  } else if (percentage < 80) {
    status = 'good';
    message = 'Good hydration level - Keep drinking!';
    color = '#F59E0B';
  } else if (percentage <= 100) {
    status = 'perfect';
    message = 'Perfect Hydration - Great job!';
    color = '#10B981';
  } else {
    status = 'overhydrated';
    message = 'Overhydration Warning - Slow down a bit!';
    color = '#8B5CF6';
  }
  
  return { percentage, status, message, color };
}

// Format water amount
export function formatWaterAmount(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${ml} ml`;
}

// Format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Date formatting
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatFullDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Streak calculation
export function calculateStreak(history: { date: string; completed: boolean }[]): number {
  if (!history || history.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak && entry.completed) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}

// Progress color
export function getProgressColor(percentage: number): string {
  if (percentage < 30) return 'bg-red-500';
  if (percentage < 60) return 'bg-yellow-500';
  if (percentage < 80) return 'bg-blue-500';
  return 'bg-green-500';
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

// Check if Ramadan period (approximate)
export function isRamadanPeriod(): boolean {
  // This is a simplified check - Ramadan dates change yearly
  // For production, use a proper Islamic calendar API
  return false; // Disabled by default
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clamp value
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Round to decimal places
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
