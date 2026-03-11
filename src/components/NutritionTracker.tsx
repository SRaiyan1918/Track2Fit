import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
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
  Apple, 
  Plus, 
  Trash2, 
  Egg, 
  Cherry, 
  Beef,
  CheckCircle2,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NutritionItem {
  id: string;
  name: string;
  completed: boolean;
  icon?: string;
}

const DEFAULT_ITEMS = [
  { id: 'egg', name: 'Eat 1 Egg', icon: 'egg', description: 'Good source of protein' },
  { id: 'fruit', name: 'Eat 1 Fruit', icon: 'fruit', description: 'Vitamins and fiber' },
  { id: 'protein', name: 'Protein Goal', icon: 'protein', description: '1g per kg of body weight' },
];

export function NutritionTracker() {
  const { 
    todayLog, 
    toggleNutritionItem, 
    addCustomNutritionItem, 
    removeCustomNutritionItem,
    getNutritionCompletion,
    loading 
  } = useData();
  
  const [newItemName, setNewItemName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const nutrition = todayLog?.nutrition || { egg: false, fruit: false, protein: false, custom: [] };
  const completion = getNutritionCompletion();

  const handleToggle = async (itemId: string) => {
    await toggleNutritionItem(itemId);
  };

  const handleAddCustom = async () => {
    if (!newItemName.trim()) return;
    await addCustomNutritionItem(newItemName);
    setNewItemName('');
    setDialogOpen(false);
  };

  const handleRemoveCustom = async (itemId: string) => {
    await removeCustomNutritionItem(itemId);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'egg':
        return <Egg className="w-5 h-5" />;
      case 'fruit':
        return <Cherry className="w-5 h-5" />;
      case 'protein':
        return <Beef className="w-5 h-5" />;
      default:
        return <Apple className="w-5 h-5" />;
    }
  };

  const getItemColor = (iconName: string) => {
    switch (iconName) {
      case 'egg':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'fruit':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'protein':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Apple className="w-7 h-7 text-orange-500" />
          Nutrition Tracker
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Build healthy eating habits one day at a time
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
                  className="text-orange-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Apple className="w-8 h-8 text-orange-500 mb-1" />
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {completion}%
                </span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {completion === 100 ? (
                  <span className="text-green-600 font-semibold">All goals completed! 🎉</span>
                ) : (
                  <>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {DEFAULT_ITEMS.filter(item => nutrition[item.id as keyof typeof nutrition]).length + nutrition.custom.filter((i: NutritionItem) => i.completed).length}
                    </span>/{DEFAULT_ITEMS.length + nutrition.custom.length} habits completed
                  </>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Habits Checklist */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Habits</CardTitle>
            <CardDescription>Check off your nutrition goals</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Habit</DialogTitle>
                <DialogDescription>
                  Create a new nutrition habit to track
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="habit">Habit Name</Label>
                  <Input
                    id="habit"
                    placeholder="e.g., Drink green tea"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddCustom}
                  disabled={!newItemName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Default Items */}
          {DEFAULT_ITEMS.map((item) => {
            const isCompleted = nutrition[item.id as keyof typeof nutrition] as boolean;
            
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  getItemColor(item.icon)
                )}>
                  {getIcon(item.icon)}
                </div>
                <div className="flex-1">
                  <h3 className={cn(
                    'font-semibold',
                    isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                  )}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                  isCompleted 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-slate-300 dark:border-slate-600'
                )}>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
            );
          })}

          {/* Custom Items */}
          {nutrition.custom.map((item: NutritionItem) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                item.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              )}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-green-500 bg-green-100 dark:bg-green-900/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  'font-semibold',
                  item.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                )}>
                  {item.name}
                </h3>
                <p className="text-sm text-slate-500">Custom habit</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                  item.completed 
                    ? 'bg-green-500 border-green-500' 
                    : 'border-slate-300 dark:border-slate-600'
                )}>
                  {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCustom(item.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {DEFAULT_ITEMS.length + nutrition.custom.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No habits added yet</p>
              <p className="text-sm">Add your first nutrition habit!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Tips */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Nutrition Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Eat Breakfast</p>
                <p className="text-sm text-slate-500">Start your day with energy</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Stay Balanced</p>
                <p className="text-sm text-slate-500">Include all food groups</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Portion Control</p>
                <p className="text-sm text-slate-500">Eat mindfully and slowly</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Plan Ahead</p>
                <p className="text-sm text-slate-500">Prep meals for the week</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
