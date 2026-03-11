import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { WaterTracker } from '@/components/WaterTracker';
import { ExerciseTracker } from '@/components/ExerciseTracker';
import { NutritionTracker } from '@/components/NutritionTracker';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Badges } from '@/components/Badges';
import { Profile } from '@/components/Profile';
import { Settings } from '@/components/Settings';
import { Toaster } from '@/components/ui/sonner';
import { initializeReminders } from '@/lib/notifications';
import './App.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize notifications on app load
  useEffect(() => {
    if (user) {
      initializeReminders();
    }
  }, [user]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'water':
        return <WaterTracker />;
      case 'exercise':
        return <ExerciseTracker />;
      case 'nutrition':
        return <NutritionTracker />;
      case 'progress':
        return <ProgressTracker />;
      case 'badges':
        return <Badges />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      <Toaster />
    </Layout>
  );
}

export default App;
