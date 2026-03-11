import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Droplets, 
  Plus, 
  GlassWater, 
  CupSoda, 
  Beaker,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn, formatWaterAmount } from '@/lib/utils';

export function WaterTracker() {
  const { 
    todayLog, 
    addWater, 
    setCustomWater, 
    getHydrationStatus,
    loading 
  } = useData();
  const { ramadanMode } = useTheme();
  
  const [customAmount, setCustomAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const hydration = getHydrationStatus();
  const waterGoal = todayLog?.waterGoal || 2000;
  const waterIntake = todayLog?.waterIntake || 0;
  const remaining = Math.max(waterGoal - waterIntake, 0);

  const handleAddWater = async (amount: number) => {
    await addWater(amount);
  };

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      await addWater(amount);
      setCustomAmount('');
      setDialogOpen(false);
    }
  };

  const handleSetCustom = async () => {
    const amount = parseInt(customAmount);
    if (amount >= 0) {
      await setCustomWater(amount);
      setCustomAmount('');
      setDialogOpen(false);
    }
  };

  const getStatusIcon = () => {
    switch (hydration.status) {
      case 'dehydrated':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'good':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'perfect':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'overhydrated':
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusBgColor = () => {
    switch (hydration.status) {
      case 'dehydrated':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'good':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'perfect':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'overhydrated':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    }
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-7 h-7 text-blue-500" />
          Water Tracker
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track your daily hydration and stay healthy
        </p>
      </div>

      {/* Main Progress Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* Water Circle */}
            <div className="relative w-48 h-48 mb-6">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - Math.min(hydration.percentage / 100, 1))}`}
                  className={cn(
                    'transition-all duration-500',
                    hydration.status === 'dehydrated' && 'text-red-500',
                    hydration.status === 'good' && 'text-yellow-500',
                    hydration.status === 'perfect' && 'text-green-500',
                    hydration.status === 'overhydrated' && 'text-purple-500'
                  )}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className={cn(
                  'w-10 h-10 mb-1',
                  hydration.status === 'dehydrated' && 'text-red-500',
                  hydration.status === 'good' && 'text-yellow-500',
                  hydration.status === 'perfect' && 'text-green-500',
                  hydration.status === 'overhydrated' && 'text-purple-500'
                )} />
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {hydration.percentage}%
                </span>
                <span className="text-sm text-slate-500">
                  {formatWaterAmount(waterIntake)}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border mb-4',
              getStatusBgColor()
            )}>
              {getStatusIcon()}
              <span 
                className="font-medium"
                style={{ color: hydration.color }}
              >
                {hydration.message}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Goal</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatWaterAmount(waterGoal)}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Drank</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatWaterAmount(waterIntake)}
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Remaining</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatWaterAmount(remaining)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ramadan Mode Section */}
      {ramadanMode && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Moon className="w-5 h-5" />
              Ramadan Hydration Tracking
            </CardTitle>
            <CardDescription>
              Track your water intake during Sehri and Iftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Sehri</span>
                </div>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {formatWaterAmount(todayLog?.sehriWater || 0)}
                </p>
                <p className="text-xs text-slate-500">Before sunrise</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-slate-900 dark:text-white">Iftar</span>
                </div>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {formatWaterAmount(todayLog?.iftarWater || 0)}
                </p>
                <p className="text-xs text-slate-500">After sunset</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center">
                💡 Tip: Try to drink 2-3 glasses at Sehri and pace yourself between Iftar and sleep
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Buttons */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>Tap to add water quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
              onClick={() => handleAddWater(250)}
            >
              <GlassWater className="w-8 h-8 text-blue-500" />
              <span className="font-semibold">+250 ml</span>
              <span className="text-xs text-slate-500">Glass</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
              onClick={() => handleAddWater(500)}
            >
              <CupSoda className="w-8 h-8 text-blue-500" />
              <span className="font-semibold">+500 ml</span>
              <span className="text-xs text-slate-500">Bottle</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
              onClick={() => handleAddWater(750)}
            >
              <Beaker className="w-8 h-8 text-blue-500" />
              <span className="font-semibold">+750 ml</span>
              <span className="text-xs text-slate-500">Large</span>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Plus className="w-8 h-8 text-blue-500" />
                  <span className="font-semibold">Custom</span>
                  <span className="text-xs text-slate-500">Any amount</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Amount</DialogTitle>
                  <DialogDescription>
                    Enter the amount of water you drank in milliliters
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (ml)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 300"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="0"
                      max="5000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={handleCustomAdd}
                      disabled={!customAmount || parseInt(customAmount) <= 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Total
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleSetCustom}
                      disabled={!customAmount || parseInt(customAmount) < 0}
                    >
                      Set as Total
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Hydration Tips */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Hydration Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Start Early</p>
                <p className="text-sm text-slate-500">Drink water as soon as you wake up</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Before Meals</p>
                <p className="text-sm text-slate-500">Drink 30 minutes before eating</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Carry a Bottle</p>
                <p className="text-sm text-slate-500">Keep water with you always</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Set Reminders</p>
                <p className="text-sm text-slate-500">Use notifications to stay on track</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
