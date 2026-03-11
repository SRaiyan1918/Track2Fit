import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Scale, 
  Calendar,
  Plus,
  Target,
  Activity,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ProgressTracker() {
  const { userProfile } = useAuth();
  const { 
    todayLog, 
    weightHistory, 
    addWeight,
    deleteWeight,
    refreshWeightHistory,
    currentStreak,
    loading 
  } = useData();
  
  const [newWeight, setNewWeight] = useState('');
  const [showAddWeight, setShowAddWeight] = useState(false);

  useEffect(() => {
    refreshWeightHistory();
  }, []);

  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      await addWeight(weight);
      setNewWeight('');
      setShowAddWeight(false);
    }
  };

  const handleDeleteWeight = async (entryId: string) => {
    if (!confirm('Delete this weight entry?')) return;
    await deleteWeight(entryId);
  };

  const calculateBMI = () => {
    if (!userProfile?.weight || !userProfile?.height) return null;
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-600 bg-yellow-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600 bg-orange-100' };
    return { label: 'Obese', color: 'text-red-600 bg-red-100' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  // Determine agar user gain karna chahta hai ya lose
  const isGainGoal = userProfile?.targetWeight && userProfile?.weight
    ? userProfile.targetWeight > userProfile.weight
    : false;

  // Weight change color logic:
  // Gain goal: gain = green, loss = red
  // Loss goal: loss = green, gain = red
  const getWeightChangeColor = (change: number) => {
    if (change === 0) return 'text-slate-900 dark:text-white';
    if (isGainGoal) {
      return change > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return change < 0 ? 'text-green-600' : 'text-red-600';
    }
  };

  const weightChartData = {
    labels: weightHistory.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightHistory.map(entry => entry.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} kg`
        }
      }
    },
    scales: {
      y: { beginAtZero: false, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // 🔥 FIX: Real hydration data from todayLog only — no fake placeholder data
  const today = new Date();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = (today.getDay() + 6) % 7; // Monday = 0

  const hydrationValues = weekDays.map((_, i) => {
    if (i === todayDayIndex) return todayLog?.waterIntake || 0;
    return 0; // Sirf real data — no fake numbers
  });

  const hydrationData = {
    labels: weekDays,
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: hydrationValues,
        backgroundColor: hydrationValues.map((v, i) =>
          i === todayDayIndex
            ? 'rgba(59, 130, 246, 0.8)'
            : 'rgba(200, 200, 200, 0.4)'
        ),
        borderRadius: 4,
      }
    ]
  };

  const hydrationChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 3000,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      x: { grid: { display: false } }
    }
  };

  const weightChange = weightHistory.length >= 2 
    ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-purple-500" />
          Progress Tracker
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor your health journey over time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Scale className="w-4 h-4" />
              <span className="text-sm">Current</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {todayLog?.weight ? `${todayLog.weight} kg` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Target</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {userProfile?.targetWeight ? `${userProfile.targetWeight} kg` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Change</span>
            </div>
            <p className={cn('text-2xl font-bold', getWeightChangeColor(weightChange))}>
              {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : '--'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentStreak} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BMI Card */}
      {bmi && bmiCategory && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Body Mass Index (BMI)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{bmi}</span>
                  <Badge className={cn('font-medium', bmiCategory.color)}>
                    {bmiCategory.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>Height: {userProfile?.height} cm</p>
                <p>Weight: {userProfile?.weight} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weight">Weight History</TabsTrigger>
          <TabsTrigger value="hydration">Hydration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weight">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weight History</CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddWeight(!showAddWeight)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Weight
              </Button>
            </CardHeader>
            <CardContent>
              {showAddWeight && (
                <div className="flex gap-2 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="weight" className="sr-only">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddWeight} disabled={!newWeight}>Save</Button>
                </div>
              )}
              
              {weightHistory.length > 0 ? (
                <div className="h-64">
                  <Line data={weightChartData} options={weightChartOptions} />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No weight data yet</p>
                  <p className="text-sm">Add your first weight entry to see progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hydration">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Weekly Hydration</CardTitle>
              <CardDescription>Your water intake for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {(todayLog?.waterIntake || 0) > 0 ? (
                <div className="h-64">
                  <Bar data={hydrationData} options={hydrationChartOptions} />
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-4xl mb-3">💧</p>
                  <p>No hydration data yet today</p>
                  <p className="text-sm">Start tracking your water intake!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weight History Table with Delete */}
      {weightHistory.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weightHistory.slice(-5).reverse().map((entry, index, arr) => {
                const prevEntry = index < arr.length - 1 ? arr[index + 1] : null;
                const change = prevEntry ? entry.weight - prevEntry.weight : 0;
                
                return (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'short', month: 'short', day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {entry.weight} kg
                      </span>
                      {change !== 0 && (
                        <span className={cn('text-sm', getWeightChangeColor(change))}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteWeight(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
