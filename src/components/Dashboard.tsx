import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Dumbbell, 
  Apple, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ChevronRight,
  Sparkles,
  Moon,
  Target
} from 'lucide-react';
import { cn, formatWaterAmount } from '@/lib/utils';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { userProfile } = useAuth();
  const { 
    todayLog, 
    getHydrationStatus, 
    getExerciseCompletion, 
    getNutritionCompletion,
    currentStreak,
    weightHistory,
    getHealthAdvice,
    loading 
  } = useData();
  const { ramadanMode } = useTheme();

  const hydration = getHydrationStatus();
  const exerciseCompletion = getExerciseCompletion();
  const nutritionCompletion = getNutritionCompletion();
  const advice = getHealthAdvice();

  // Calculate weight change
  const weightChange = weightHistory.length >= 2 
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
    : 0;

  const getWeightChangeIcon = () => {
    if (weightChange < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (weightChange > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getWeightChangeText = () => {
    if (weightChange < 0) return `-${Math.abs(weightChange).toFixed(1)} kg`;
    if (weightChange > 0) return `+${weightChange.toFixed(1)} kg`;
    return 'No change';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {userProfile?.name?.split(' ')[0] || 'Friend'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's your daily health summary
          </p>
        </div>
        {ramadanMode && (
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1">
            <Moon className="w-4 h-4 mr-1" />
            Ramadan Mode Active
          </Badge>
        )}
      </div>

      {/* AI Advice Section */}
      {advice.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Health Tip
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {advice[0].message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hydration Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
          onClick={() => onTabChange('water')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatWaterAmount(todayLog?.waterIntake || 0)}
            </div>
            <div className="mt-2">
              <Progress 
                value={hydration.percentage} 
                className="h-2"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{hydration.percentage}%</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: hydration.color }}
                >
                  {hydration.status === 'dehydrated' ? 'Low' : 
                   hydration.status === 'good' ? 'Good' :
                   hydration.status === 'perfect' ? 'Perfect' : 'High'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
          onClick={() => onTabChange('exercise')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {exerciseCompletion}%
            </div>
            <div className="mt-2">
              <Progress 
                value={exerciseCompletion} 
                className="h-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                {exerciseCompletion === 100 ? 'All goals completed!' : 'Keep going!'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
          onClick={() => onTabChange('nutrition')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {nutritionCompletion}%
            </div>
            <div className="mt-2">
              <Progress 
                value={nutritionCompletion} 
                className="h-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Daily habits tracked
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md"
          onClick={() => onTabChange('progress')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentStreak} days
            </div>
            <div className="mt-2">
              <Progress 
                value={Math.min((currentStreak / 30) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                {currentStreak >= 7 ? 'Amazing consistency!' : 'Build your streak!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary & Weight Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Summary */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
            <CardDescription>Your daily health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Daily Goal</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatWaterAmount(todayLog?.waterGoal || 2000)}
                </p>
                <p className="text-xs text-slate-500">Water intake target</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">Remaining</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatWaterAmount(Math.max((todayLog?.waterGoal || 2000) - (todayLog?.waterIntake || 0), 0))}
                </p>
                <p className="text-xs text-slate-500">To reach your goal</p>
              </div>
            </div>
            
            {ramadanMode && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-2">
                  <Moon className="w-4 h-4" />
                  <span className="font-medium">Ramadan Tracking</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sehri</p>
                    <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                      {formatWaterAmount(todayLog?.sehriWater || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Iftar</p>
                    <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                      {formatWaterAmount(todayLog?.iftarWater || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight Progress */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Weight Progress</CardTitle>
            <CardDescription>Track your weight changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Weight</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todayLog?.weight ? `${todayLog.weight} kg` : 'Not recorded'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">Change</p>
                <div className="flex items-center gap-1 justify-end">
                  {getWeightChangeIcon()}
                  <span className="font-semibold">{getWeightChangeText()}</span>
                </div>
              </div>
            </div>
            
            {userProfile?.weight && userProfile?.height && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">BMI</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {(() => {
                        const bmi = userProfile.weight! / Math.pow(userProfile.height! / 100, 2);
                        return bmi.toFixed(1);
                      })()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-sm",
                      (() => {
                        const bmi = userProfile.weight! / Math.pow(userProfile.height! / 100, 2);
                        if (bmi < 18.5) return 'border-yellow-500 text-yellow-600';
                        if (bmi < 25) return 'border-green-500 text-green-600';
                        if (bmi < 30) return 'border-orange-500 text-orange-600';
                        return 'border-red-500 text-red-600';
                      })()
                    )}
                  >
                    {(() => {
                      const bmi = userProfile.weight! / Math.pow(userProfile.height! / 100, 2);
                      if (bmi < 18.5) return 'Underweight';
                      if (bmi < 25) return 'Normal';
                      if (bmi < 30) return 'Overweight';
                      return 'Obese';
                    })()}
                  </Badge>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onTabChange('progress')}
            >
              View Full Progress
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange('water')}
            >
              <Droplets className="w-6 h-6 text-blue-500" />
              <span className="text-sm">Add Water</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange('exercise')}
            >
              <Dumbbell className="w-6 h-6 text-green-500" />
              <span className="text-sm">Log Exercise</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange('nutrition')}
            >
              <Apple className="w-6 h-6 text-orange-500" />
              <span className="text-sm">Track Nutrition</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onTabChange('badges')}
            >
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span className="text-sm">View Badges</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
