import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Droplets, 
  Dumbbell, 
  Apple, 
  Flame, 
  Moon,
  Star,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'hydration' | 'exercise' | 'nutrition' | 'streak' | 'ramadan' | 'special';
  requirement: number;
  color: string;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Hydration Badges
  {
    id: 'hydration_beginner',
    name: 'Hydration Beginner',
    description: 'Complete 3 days of hydration goals',
    icon: Droplets,
    category: 'hydration',
    requirement: 3,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'hydration_warrior',
    name: 'Hydration Warrior',
    description: 'Complete 15 days of hydration goals',
    icon: Droplets,
    category: 'hydration',
    requirement: 15,
    color: 'text-blue-600 bg-blue-200 dark:bg-blue-800/30'
  },
  {
    id: 'hydration_master',
    name: 'Hydration Master',
    description: 'Complete 30 days of hydration goals',
    icon: Droplets,
    category: 'hydration',
    requirement: 30,
    color: 'text-blue-700 bg-blue-300 dark:bg-blue-700/30'
  },
  
  // Exercise Badges
  {
    id: 'fitness_starter',
    name: 'Fitness Starter',
    description: 'Complete exercise goals for 3 days',
    icon: Dumbbell,
    category: 'exercise',
    requirement: 3,
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 'fitness_pro',
    name: 'Fitness Pro',
    description: 'Complete exercise goals for 15 days',
    icon: Dumbbell,
    category: 'exercise',
    requirement: 15,
    color: 'text-green-600 bg-green-200 dark:bg-green-800/30'
  },
  {
    id: 'fitness_champion',
    name: 'Fitness Champion',
    description: 'Complete exercise goals for 30 days',
    icon: Dumbbell,
    category: 'exercise',
    requirement: 30,
    color: 'text-green-700 bg-green-300 dark:bg-green-700/30'
  },
  
  // Nutrition Badges
  {
    id: 'nutrition_beginner',
    name: 'Nutrition Beginner',
    description: 'Complete nutrition goals for 3 days',
    icon: Apple,
    category: 'nutrition',
    requirement: 3,
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 'protein_pro',
    name: 'Protein Pro',
    description: 'Hit protein goal 10 times',
    icon: Apple,
    category: 'nutrition',
    requirement: 10,
    color: 'text-orange-600 bg-orange-200 dark:bg-orange-800/30'
  },
  
  // Streak Badges
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 7-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 7,
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 30,
    color: 'text-amber-600 bg-amber-200 dark:bg-amber-800/30'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: Flame,
    category: 'streak',
    requirement: 100,
    color: 'text-amber-700 bg-amber-300 dark:bg-amber-700/30'
  },
  
  // Ramadan Badges
  {
    id: 'ramadan_discipline',
    name: 'Ramadan Discipline Star',
    description: 'Complete Ramadan mode for full month',
    icon: Moon,
    category: 'ramadan',
    requirement: 30,
    color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
  },
  
  // Special Badges
  {
    id: 'all_rounder',
    name: 'All-Rounder',
    description: 'Complete all daily goals for 7 days',
    icon: Star,
    category: 'special',
    requirement: 7,
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
  },
];

export function Badges() {
  const { badges, currentStreak, loading } = useData();

  const earnedBadgeIds = badges.map(b => b.id);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hydration': return Droplets;
      case 'exercise': return Dumbbell;
      case 'nutrition': return Apple;
      case 'streak': return Flame;
      case 'ramadan': return Moon;
      default: return Star;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const categories = ['hydration', 'exercise', 'nutrition', 'streak', 'ramadan', 'special'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          Your Badges
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Collect badges by achieving your health goals
        </p>
      </div>

      {/* Stats Overview */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Badges Earned</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {badges.length}
                </span>
                <span className="text-slate-500">/ {BADGE_DEFINITIONS.length}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Streak</p>
              <div className="flex items-center gap-2 justify-end">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentStreak} days
                </span>
              </div>
            </div>
          </div>
          <Progress 
            value={(badges.length / BADGE_DEFINITIONS.length) * 100} 
            className="mt-4 h-2"
          />
        </CardContent>
      </Card>

      {/* Badges by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryBadges = BADGE_DEFINITIONS.filter(b => b.category === category);
          const earnedInCategory = categoryBadges.filter(b => earnedBadgeIds.includes(b.id));
          
          return (
            <Card key={category} className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getCategoryIcon(category);
                      return <Icon className="w-5 h-5 text-slate-500" />;
                    })()}
                    <CardTitle className="text-lg capitalize">{getCategoryLabel(category)} Badges</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {earnedInCategory.length}/{categoryBadges.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryBadges.map((badge) => {
                    const isEarned = earnedBadgeIds.includes(badge.id);
                    const Icon = badge.icon;
                    
                    return (
                      <div
                        key={badge.id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-lg border-2 transition-all',
                          isEarned 
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          isEarned ? badge.color : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        )}>
                          {isEarned ? (
                            <Icon className="w-6 h-6" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              'font-semibold',
                              isEarned ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                            )}>
                              {badge.name}
                            </h3>
                            {isEarned && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Motivation Card */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Keep Going!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You're doing great! Continue tracking your daily goals to unlock more badges. 
                Consistency is key to building healthy habits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
