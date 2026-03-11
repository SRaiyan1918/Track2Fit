import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Dumbbell, 
  Plus, 
  Minus, 
  Trophy,
  Flame,
  Target,
  CheckCircle2,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  completedSets: number;
  completed?: boolean;
  unit?: string;
  isCustom?: boolean;
  deleted?: boolean;
}

// Type for exercise data from context
interface ExerciseData {
  targetSets?: number;
  targetReps?: number;
  completedSets?: number;
  completed?: boolean;
  name?: string;
  unit?: string;
  deleted?: boolean;
  isCustom?: boolean;
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'squats', name: 'Squats', targetSets: 3, targetReps: 15, completedSets: 0 },
  { id: 'pushups', name: 'Pushups', targetSets: 3, targetReps: 10, completedSets: 0 },
  { id: 'plank', name: 'Plank', targetSets: 3, targetReps: 30, completedSets: 0, unit: 'seconds' },
];

export function ExerciseTracker() {
  const { todayLog, updateExercise, currentStreak, loading } = useData();
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('10');
  const [dialogOpen, setDialogOpen] = useState(false);
  // localExercises hata diya - iski zaroorat nahi

  const exercises = (todayLog?.exercises as Record<string, ExerciseData>) || {};
  
  // getAllExercises ke baad calculate hoga (neeche defined hai)

  const handleIncrementSet = async (exerciseId: string) => {
    // Default exercises ke liye fallback targets
    const defaultTargets: Record<string, number> = { squats: 3, pushups: 3, plank: 3 };
    const existingData = exercises[exerciseId] as ExerciseData | undefined;
    
    const currentSets = existingData?.completedSets || 0;
    const targetSets = existingData?.targetSets || defaultTargets[exerciseId] || 3;
    const newCompletedSets = Math.min(currentSets + 1, targetSets);
    
    await updateExercise(exerciseId, {
      completedSets: newCompletedSets,
      completed: newCompletedSets >= targetSets,
      targetSets,
    });
  };

  const handleDecrementSet = async (exerciseId: string) => {
    const defaultTargets: Record<string, number> = { squats: 3, pushups: 3, plank: 3 };
    const existingData = exercises[exerciseId] as ExerciseData | undefined;
    
    const currentSets = existingData?.completedSets || 0;
    const targetSets = existingData?.targetSets || defaultTargets[exerciseId] || 3;
    const newCompletedSets = Math.max(currentSets - 1, 0);
    
    await updateExercise(exerciseId, {
      completedSets: newCompletedSets,
      completed: newCompletedSets >= targetSets,
      targetSets,
    });
  };

  const handleResetExercise = async (exerciseId: string) => {
    await updateExercise(exerciseId, {
      completedSets: 0,
      completed: false
    });
  };

  // 🔥 FIXED: Delete function
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Delete this custom exercise?')) return;
    
    try {
      await updateExercise(exerciseId, {
        completedSets: -1,
        completed: false,
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  // 🔥 FIXED: Add exercise function
  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return;
    
    const exerciseId = `custom_${Date.now()}`;
    
    await updateExercise(exerciseId, {
      name: newExerciseName.trim(),
      targetSets: parseInt(newExerciseSets) || 3,
      targetReps: parseInt(newExerciseReps) || 10,
      completedSets: 0,
      completed: false,
      isCustom: true,
      deleted: false
    });
    
    setNewExerciseName('');
    setNewExerciseSets('3');
    setNewExerciseReps('10');
    setDialogOpen(false);
  };

  // Get all exercises + completion (correct order)
  const getAllExercises = (): Exercise[] => {
    const defaultExercises = DEFAULT_EXERCISES.map(def => {
      const exerciseData = exercises[def.id] as ExerciseData || {};
      return {
        ...def,
        completedSets: exerciseData.completedSets || 0,
        completed: exerciseData.completed || false,
        deleted: false
      };
    });
    
    const customExercises = Object.entries(exercises)
      .filter(([id]) => id.startsWith('custom_'))
      .filter(([_, data]) => !(data as ExerciseData).deleted && (data as ExerciseData).completedSets !== -1)
      .map(([id, data]) => {
        const exerciseData = data as ExerciseData;
        return {
          id,
          name: exerciseData.name || id.replace('custom_', 'Exercise ').slice(0, 10),
          targetSets: exerciseData.targetSets || 3,
          targetReps: exerciseData.targetReps || 10,
          completedSets: exerciseData.completedSets || 0,
          completed: exerciseData.completed || false,
          unit: exerciseData.unit,
          isCustom: true,
          deleted: exerciseData.deleted || false
        };
      });
    
    return [...defaultExercises, ...customExercises];
  };

  const getCompletion = (): number => {
    const activeExercises = getAllExercises().filter(ex => !ex.deleted);
    if (activeExercises.length === 0) return 0;
    const completedCount = activeExercises.filter(ex => ex.completedSets >= ex.targetSets).length;
    return Math.round((completedCount / activeExercises.length) * 100);
  };

  const completion = getCompletion();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allExercises = getAllExercises();
  const activeExercises = allExercises.filter(ex => !ex.deleted);
  const completedCount = activeExercises.filter(ex => ex.completedSets >= ex.targetSets).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-green-500" />
          Exercise Tracker
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your daily workouts and build consistency
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* Progress Circle */}
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 72}`}
                  strokeDashoffset={`${2 * Math.PI * 72 * (1 - completion / 100)}`}
                  className="text-green-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Trophy className="w-8 h-8 text-green-500 mb-1" />
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {completion}%
                </span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">{currentStreak || 0}</span> day streak
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">{completedCount}</span>/{activeExercises.length} completed
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Exercises</CardTitle>
            <CardDescription>Tap + or - to track your sets</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Exercise</DialogTitle>
                <DialogDescription>
                  Create a new exercise to track
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Lunges"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets">Target Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={newExerciseSets}
                      onChange={(e) => setNewExerciseSets(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps">Target Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={newExerciseReps}
                      onChange={(e) => setNewExerciseReps(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddExercise}
                  disabled={!newExerciseName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeExercises.map((exercise) => {
            const isCompleted = exercise.completedSets >= exercise.targetSets;
            const progress = (exercise.completedSets / exercise.targetSets) * 100;
            
            return (
              <div 
                key={exercise.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-slate-50 dark:bg-slate-800 border-transparent'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Dumbbell className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Target: {exercise.targetSets} sets × {exercise.targetReps} {exercise.unit || 'reps'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDecrementSet(exercise.id)}
                      disabled={exercise.completedSets === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="w-12 text-center">
                      <span className={cn(
                        'text-lg font-bold',
                        isCompleted ? 'text-green-600' : 'text-slate-900 dark:text-white'
                      )}>
                        {exercise.completedSets}
                      </span>
                      <span className="text-slate-400">/{exercise.targetSets}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleIncrementSet(exercise.id)}
                      disabled={exercise.completedSets >= exercise.targetSets}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                      onClick={() => handleResetExercise(exercise.id)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>

                    {/* Delete button - custom exercises ke liye */}
                    {exercise.isCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
          
          {activeExercises.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No exercises added yet</p>
              <p className="text-sm">Add your first exercise to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Tips */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Exercise Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Warm Up</p>
                <p className="text-sm text-slate-500">Always warm up before exercising</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Stay Hydrated</p>
                <p className="text-sm text-slate-500">Drink water during your workout</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Proper Form</p>
                <p className="text-sm text-slate-500">Focus on form over quantity</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Rest Days</p>
                <p className="text-sm text-slate-500">Allow your body to recover</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}