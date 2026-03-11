import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { format, subDays } from 'date-fns';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
  getOrCreateDailyLog, 
  updateDailyLog,
  getWeightHistory,
  addWeightEntry,
  deleteWeightEntry,
  getUserBadges,
  awardBadge,
  updateUserProfile
} from '@/lib/firebase';
import type { 
  DailyLog, 
  WeightEntry, 
  Badge, 
  ExerciseLog, 
  NutritionLog,
  HydrationResult,
  HealthAdvice,
  ProgressSummary
} from '@/types';
import { getHydrationStatus, calculateWaterGoal } from '@/lib/utils';

interface DataContextType {
  // Daily Data
  todayLog: DailyLog | null;
  refreshTodayLog: () => Promise<void>;
  // Water Tracking
  addWater: (amount: number) => Promise<void>;
  setCustomWater: (amount: number) => Promise<void>;
  getHydrationStatus: () => HydrationResult;
  // Exercise Tracking
  updateExercise: (exerciseId: string, data: Partial<ExerciseLog[string]>) => Promise<void>;
  getExerciseCompletion: () => number;
  // Nutrition Tracking
  toggleNutritionItem: (itemId: string) => Promise<void>;
  addCustomNutritionItem: (name: string) => Promise<void>;
  removeCustomNutritionItem: (itemId: string) => Promise<void>;
  getNutritionCompletion: () => number;
  // Weight Tracking
  weightHistory: WeightEntry[];
  addWeight: (weight: number) => Promise<void>;
  deleteWeight: (entryId: string) => Promise<void>;
  refreshWeightHistory: () => Promise<void>;
  // Badges
  badges: Badge[];
  checkAndAwardBadges: () => Promise<void>;
  // AI Advice
  getHealthAdvice: () => HealthAdvice[];
  // Progress
  getProgressSummary: () => ProgressSummary;
  // Streak
  currentStreak: number;
  // Loading
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_EXERCISES = {
  squats: { targetSets: 3, targetReps: 15, completedSets: 0, completed: false },
  pushups: { targetSets: 3, targetReps: 10, completedSets: 0, completed: false },
  plank: { targetSets: 3, targetReps: 30, completedSets: 0, completed: false },
};

const DEFAULT_NUTRITION: NutritionLog = {
  egg: false,
  fruit: false,
  protein: false,
  custom: []
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth();
  const { ramadanMode } = useTheme();
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  // 🔥 HELPER FUNCTION: Check if a day is fully completed
  const isDayCompleted = useCallback((log: DailyLog): boolean => {
    if (!log) return false;
    
    // Check water (80% or more)
    const waterCompleted = (log.waterIntake || 0) >= ((log.waterGoal || 2000) * 0.8);
    
    // Check exercises — deleted ignore, completedSets se judge karo (completed flag stale ho sakta hai)
    const DEFAULT_EXERCISE_IDS = ['squats', 'pushups', 'plank'];
    const DEFAULT_TARGETS: Record<string, number> = { squats: 3, pushups: 3, plank: 3 };
    const exercisesMap = (log.exercises || {}) as Record<string, any>;

    // Default exercises
    const defaultExs = DEFAULT_EXERCISE_IDS.map(id => {
      const d = exercisesMap[id] || {};
      return { targetSets: d.targetSets ?? DEFAULT_TARGETS[id], completedSets: d.completedSets ?? 0 };
    });

    // Custom exercises — sirf jo deleted nahi hain
    const customExs = Object.entries(exercisesMap)
      .filter(([id]) => id.startsWith('custom_'))
      .filter(([, d]: any) => !d.deleted && d.completedSets !== -1)
      .map(([, d]: any) => ({ targetSets: d.targetSets ?? 3, completedSets: d.completedSets ?? 0 }));

    const activeExs = [...defaultExs, ...customExs];
    const exerciseCompleted = activeExs.length > 0
      ? activeExs.every(e => e.completedSets >= e.targetSets)
      : false;
    
    // Check nutrition (all standard items completed)
    const nutrition = log.nutrition || DEFAULT_NUTRITION;
    const standardCompleted = nutrition.egg && nutrition.fruit && nutrition.protein;
    
    return waterCompleted && exerciseCompleted && standardCompleted;
  }, []);

  // 🔥 STREAK CALCULATION FUNCTION - FIXED
  const calculateStreak = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      let streak = 0;
      let currentDate = new Date();
      let checking = true;
      const maxDays = 100; // Safety: max 100 days check
      
      while (checking && streak < maxDays) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Get log from Firebase
        const logData = await getOrCreateDailyLog(user.uid, dateStr);
        
        // ✅ FIX: Create DailyLog object safely
        const log: DailyLog = {
          date: logData.date || dateStr,
          waterIntake: logData.waterIntake || 0,
          waterGoal: logData.waterGoal || 2000,
          exercises: logData.exercises || {},
          nutrition: logData.nutrition || { 
            egg: false, 
            fruit: false, 
            protein: false, 
            custom: [] 
          },
          streak: logData.streak || 0,
          weight: logData.weight,
          ramadanMode: logData.ramadanMode || false,
          sehriWater: logData.sehriWater || 0,
          iftarWater: logData.iftarWater || 0,
          //createdAt: logData.createdAt,
          //updatedAt: logData.updatedAt
        };
        
        // Check if this day was completed
        if (isDayCompleted(log)) {
          streak++;
          currentDate = subDays(currentDate, 1); // Move to previous day
        } else {
          checking = false;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }, [user, isDayCompleted]);

  // 🔥 UPDATE STREAK FUNCTION
  const updateStreak = useCallback(async () => {
    if (!user) return;
    
    try {
      const newStreak = await calculateStreak();
      
      // Update streak in today's log
      if (todayLog) {
        await updateDailyLog(user.uid, today, { streak: newStreak });
      }
      
      setCurrentStreak(newStreak);
      
      // Check for streak badges
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, today, todayLog, calculateStreak]);

  // Initialize daily log
  const refreshTodayLog = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const logData = await getOrCreateDailyLog(user.uid, today);
      
      // ✅ FIX: Create DailyLog object safely
      const log: DailyLog = {
        date: logData.date || today,
        waterIntake: logData.waterIntake || 0,
        waterGoal: logData.waterGoal || 2000,
        exercises: logData.exercises || { ...DEFAULT_EXERCISES },
        nutrition: logData.nutrition || { ...DEFAULT_NUTRITION },
        streak: logData.streak || 0,
        weight: logData.weight,
        ramadanMode: logData.ramadanMode || ramadanMode,
        sehriWater: logData.sehriWater || 0,
        iftarWater: logData.iftarWater || 0,
        //createdAt: logData.createdAt,
        //updatedAt: logData.updatedAt
      };
      
      // Set water goal based on user weight
      if (userProfile?.weight) {
        log.waterGoal = calculateWaterGoal(userProfile.weight);
      }
      
      setTodayLog(log);
      
      // Update streak when loading today's log
      await updateStreak();
      
    } catch (error) {
      console.error('Error refreshing today log:', error);
    } finally {
      setLoading(false);
    }
  }, [user, today, userProfile, ramadanMode, updateStreak]);

  // Load initial data
  useEffect(() => {
    if (user) {
      refreshTodayLog();
      refreshWeightHistory();
      loadBadges();
    }
  }, [user]);

  // Call updateStreak whenever any tracking changes
  useEffect(() => {
    if (user && todayLog) {
      updateStreak();
    }
  }, [
    todayLog?.waterIntake,
    todayLog?.exercises,
    todayLog?.nutrition,
    todayLog?.weight
  ]);

  // Water tracking functions
  const addWater = async (amount: number) => {
    if (!user || !todayLog) return;
    
    try {
      const newIntake = todayLog.waterIntake + amount;
      
      if (ramadanMode) {
        const hour = new Date().getHours();
        const isSehri = hour < 6;
        if (isSehri) {
          await updateDailyLog(user.uid, today, {
            sehriWater: (todayLog.sehriWater || 0) + amount
          });
        } else {
          await updateDailyLog(user.uid, today, {
            iftarWater: (todayLog.iftarWater || 0) + amount
          });
        }
      }
      
      await updateDailyLog(user.uid, today, { waterIntake: newIntake });
      setTodayLog(prev => prev ? { ...prev, waterIntake: newIntake } : null);
      
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const setCustomWater = async (amount: number) => {
    if (!user || !todayLog) return;
    
    try {
      await updateDailyLog(user.uid, today, { waterIntake: amount });
      setTodayLog(prev => prev ? { ...prev, waterIntake: amount } : null);
    } catch (error) {
      console.error('Error setting custom water:', error);
    }
  };

  const getHydrationStatusResult = (): HydrationResult => {
    if (!todayLog) {
      return { percentage: 0, status: 'dehydrated', message: 'Start drinking water!', color: 'red' };
    }
    return getHydrationStatus(todayLog.waterIntake, todayLog.waterGoal);
  };

  // Exercise tracking functions
  const updateExercise = async (exerciseId: string, data: Partial<ExerciseLog[string]>) => {
    if (!user || !todayLog) return;
    
    try {
      const updatedExercises = {
        ...todayLog.exercises,
        [exerciseId]: {
          ...todayLog.exercises[exerciseId],
          ...data
        }
      };
      
      await updateDailyLog(user.uid, today, { exercises: updatedExercises });
      setTodayLog(prev => prev ? { ...prev, exercises: updatedExercises } : null);
      
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const getExerciseCompletion = (): number => {
    if (!todayLog || !todayLog.exercises) return 0;

    const DEFAULT_EXERCISE_IDS = ['squats', 'pushups', 'plank'];
    const DEFAULT_EXERCISE_TARGETS: Record<string, { targetSets: number }> = {
      squats: { targetSets: 3 },
      pushups: { targetSets: 3 },
      plank: { targetSets: 3 },
    };

    const exercisesData = todayLog.exercises as Record<string, {
      targetSets?: number;
      completedSets?: number;
      completed?: boolean;
      deleted?: boolean;
      isCustom?: boolean;
    }>;

    // Build active exercises list (same logic as ExerciseTracker)
    const defaultExercises = DEFAULT_EXERCISE_IDS.map(id => {
      const data = exercisesData[id] || {};
      return {
        targetSets: data.targetSets ?? DEFAULT_EXERCISE_TARGETS[id].targetSets,
        completedSets: data.completedSets ?? 0,
        deleted: false,
      };
    });

    const customExercises = Object.entries(exercisesData)
      .filter(([id]) => id.startsWith('custom_'))
      .filter(([, data]) => !data.deleted && data.completedSets !== -1)
      .map(([, data]) => ({
        targetSets: data.targetSets ?? 3,
        completedSets: data.completedSets ?? 0,
        deleted: false,
      }));

    const activeExercises = [...defaultExercises, ...customExercises];
    if (activeExercises.length === 0) return 0;

    const completedCount = activeExercises.filter(
      ex => ex.completedSets >= ex.targetSets
    ).length;

    return Math.round((completedCount / activeExercises.length) * 100);
  };

  // Nutrition tracking functions
  const toggleNutritionItem = async (itemId: string) => {
    if (!user || !todayLog) return;
    
    try {
      const updatedNutrition = { ...todayLog.nutrition };
      
      if (['egg', 'fruit', 'protein'].includes(itemId)) {
        updatedNutrition[itemId as keyof Omit<NutritionLog, 'custom'>] = 
          !updatedNutrition[itemId as keyof Omit<NutritionLog, 'custom'>];
      } else {
        const customItem = updatedNutrition.custom.find(item => item.id === itemId);
        if (customItem) {
          customItem.completed = !customItem.completed;
        }
      }
      
      await updateDailyLog(user.uid, today, { nutrition: updatedNutrition });
      setTodayLog(prev => prev ? { ...prev, nutrition: updatedNutrition } : null);
      
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error toggling nutrition item:', error);
    }
  };

  const addCustomNutritionItem = async (name: string) => {
    if (!user || !todayLog) return;
    
    try {
      const newItem = {
        id: `custom_${Date.now()}`,
        name,
        completed: false
      };
      
      const updatedNutrition = {
        ...todayLog.nutrition,
        custom: [...todayLog.nutrition.custom, newItem]
      };
      
      await updateDailyLog(user.uid, today, { nutrition: updatedNutrition });
      setTodayLog(prev => prev ? { ...prev, nutrition: updatedNutrition } : null);
    } catch (error) {
      console.error('Error adding custom nutrition item:', error);
    }
  };

  const removeCustomNutritionItem = async (itemId: string) => {
    if (!user || !todayLog) return;
    
    try {
      const updatedNutrition = {
        ...todayLog.nutrition,
        custom: todayLog.nutrition.custom.filter(item => item.id !== itemId)
      };
      
      await updateDailyLog(user.uid, today, { nutrition: updatedNutrition });
      setTodayLog(prev => prev ? { ...prev, nutrition: updatedNutrition } : null);
    } catch (error) {
      console.error('Error removing custom nutrition item:', error);
    }
  };

  const getNutritionCompletion = (): number => {
    if (!todayLog || !todayLog.nutrition) return 0;
    
    const { egg, fruit, protein, custom } = todayLog.nutrition;
    const standardItems = [egg, fruit, protein];
    const standardCompleted = standardItems.filter(Boolean).length;
    const customCompleted = custom.filter(item => item.completed).length;
    const customTotal = custom.length;
    const totalItems = 3 + customTotal;
    const totalCompleted = standardCompleted + customCompleted;
    
    return totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  };

  const deleteWeight = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteWeightEntry(user.uid, entryId);
      await refreshWeightHistory();
    } catch (error) {
      console.error('Error deleting weight entry:', error);
    }
  };

  // Weight tracking functions
  const refreshWeightHistory = async () => {
    if (!user) return;
    
    try {
      const history = await getWeightHistory(user.uid, 30);
      setWeightHistory(history);
    } catch (error) {
      console.error('Error refreshing weight history:', error);
    }
  };

  const addWeight = async (weight: number) => {
    if (!user) return;
    
    try {
      await addWeightEntry(user.uid, weight, today);
      await updateUserProfile(user.uid, { weight });
      
      if (todayLog) {
        await updateDailyLog(user.uid, today, { weight });
        setTodayLog(prev => prev ? { ...prev, weight } : null);
      }
      
      await refreshWeightHistory();
    } catch (error) {
      console.error('Error adding weight:', error);
    }
  };

  // Badge functions
  const loadBadges = async () => {
    if (!user) return;
    
    try {
      const userBadges = await getUserBadges(user.uid);
      setBadges(userBadges as Badge[]);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const checkAndAwardBadges = async () => {
    if (!user || !todayLog) return;
    
    const badgeDefinitions = [
      { id: 'hydration_beginner', name: 'Hydration Beginner', description: 'Complete 3 days of hydration goals', category: 'hydration', requirement: 3 },
      { id: 'hydration_warrior', name: 'Hydration Warrior', description: 'Complete 15 days of hydration goals', category: 'hydration', requirement: 15 },
      { id: 'hydration_master', name: 'Hydration Master', description: 'Complete 30 days of hydration goals', category: 'hydration', requirement: 30 },
      { id: 'fitness_starter', name: 'Fitness Starter', description: 'Complete exercise goals for 3 days', category: 'exercise', requirement: 3 },
      { id: 'fitness_pro', name: 'Fitness Pro', description: 'Complete exercise goals for 15 days', category: 'exercise', requirement: 15 },
      { id: 'nutrition_beginner', name: 'Nutrition Beginner', description: 'Complete nutrition goals for 3 days', category: 'nutrition', requirement: 3 },
      { id: 'protein_pro', name: 'Protein Pro', description: 'Hit protein goal 10 times', category: 'nutrition', requirement: 10 },
      { id: 'consistency_king', name: 'Consistency King', description: 'Maintain a 7-day streak', category: 'streak', requirement: 7 },
      { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 30-day streak', category: 'streak', requirement: 30 },
    ];
    
    const currentBadges = badges.map(b => b.id);
    
    for (const badge of badgeDefinitions) {
      if (!currentBadges.includes(badge.id)) {
        let shouldAward = false;
        
        if (badge.category === 'hydration' && todayLog.waterIntake >= todayLog.waterGoal) {
          shouldAward = currentStreak >= badge.requirement;
        } else if (badge.category === 'exercise' && getExerciseCompletion() === 100) {
          shouldAward = currentStreak >= badge.requirement;
        } else if (badge.category === 'nutrition' && getNutritionCompletion() === 100) {
          shouldAward = currentStreak >= badge.requirement;
        } else if (badge.category === 'streak') {
          shouldAward = currentStreak >= badge.requirement;
        }
        
        if (shouldAward) {
          try {
            await awardBadge(user.uid, badge.id, badge);
            setBadges(prev => [...prev, badge as Badge]);
          } catch (error) {
            console.error('Error awarding badge:', error);
          }
        }
      }
    }
  };

  // AI Advice function (rule-based)
  const getHealthAdvice = (): HealthAdvice[] => {
    const advice: HealthAdvice[] = [];
    
    if (!todayLog) return advice;
    
    const hydration = getHydrationStatusResult();
    if (hydration.status === 'dehydrated') {
      advice.push({
        type: 'hydration',
        message: 'You need to drink more water! Aim for at least 8 glasses today.',
        priority: 'high'
      });
    } else if (hydration.status === 'good') {
      advice.push({
        type: 'hydration',
        message: 'Great job staying hydrated! Keep it up.',
        priority: 'low'
      });
    }
    
    const exerciseCompletion = getExerciseCompletion();
    if (exerciseCompletion < 50) {
      advice.push({
        type: 'exercise',
        message: 'Time to get moving! Even a short workout helps.',
        priority: 'medium'
      });
    } else if (exerciseCompletion === 100) {
      advice.push({
        type: 'exercise',
        message: 'Excellent work completing your exercises today!',
        priority: 'low'
      });
    }
    
    const nutritionCompletion = getNutritionCompletion();
    if (nutritionCompletion < 50) {
      advice.push({
        type: 'nutrition',
        message: 'Don\'t forget to eat healthy today!',
        priority: 'medium'
      });
    }
    
    if (currentStreak >= 7) {
      advice.push({
        type: 'general',
        message: `Amazing! You're on a ${currentStreak}-day streak. Keep the momentum going!`,
        priority: 'low'
      });
    }
    
    if (ramadanMode) {
      advice.push({
        type: 'hydration',
        message: 'Remember to hydrate well between Iftar and Suhoor!',
        priority: 'medium'
      });
    }
    
    return advice.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Progress summary
  const getProgressSummary = (): ProgressSummary => {
    const hydration = getHydrationStatusResult();
    
    return {
      hydrationPercentage: hydration.percentage,
      exercisePercentage: getExerciseCompletion(),
      nutritionPercentage: getNutritionCompletion(),
      currentStreak,
      totalBadges: badges.length,
      weightChange: weightHistory.length >= 2 
        ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
        : 0
    };
  };

  return (
    <DataContext.Provider value={{
      todayLog,
      refreshTodayLog,
      addWater,
      setCustomWater,
      getHydrationStatus: getHydrationStatusResult,
      updateExercise,
      getExerciseCompletion,
      toggleNutritionItem,
      addCustomNutritionItem,
      removeCustomNutritionItem,
      getNutritionCompletion,
      weightHistory,
      addWeight,
      deleteWeight,
      refreshWeightHistory,
      badges,
      checkAndAwardBadges,
      getHealthAdvice,
      getProgressSummary,
      currentStreak,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}