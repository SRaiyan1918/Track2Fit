import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Settings2, 
  Bell, 
  Moon, 
  Sun, 
  Droplets, 
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationSettings } from '@/lib/notifications';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission,
  checkNotificationStatus,
  sendTestNotification,
  toggleNotifications
} from '@/lib/notifications';

export function Settings() {
  const { darkMode, toggleDarkMode, ramadanMode, toggleRamadanMode } = useTheme();
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    waterReminderInterval: 2,
    exerciseReminderTime: '09:00',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });
  const [notificationStatus, setNotificationStatus] = useState({ supported: false, permitted: false });
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    const settings = getNotificationSettings();
    setNotificationSettings(settings);
    setNotificationStatus(checkNotificationStatus());
  }, []);

  const handleToggleNotifications = async () => {
    const newEnabled = !notificationSettings.enabled;
    
    if (newEnabled) {
      const permitted = await requestNotificationPermission();
      if (permitted) {
        const newSettings = { ...notificationSettings, enabled: true };
        setNotificationSettings(newSettings);
        saveNotificationSettings(newSettings);
        setNotificationStatus({ supported: true, permitted: true });
      }
    } else {
      const newSettings = { ...notificationSettings, enabled: false };
      setNotificationSettings(newSettings);
      saveNotificationSettings(newSettings);
      toggleNotifications(false);
    }
  };

  const handleUpdateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = () => {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings2 className="w-7 h-7 text-slate-500" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Customize your app experience
        </p>
      </div>

      {/* Appearance Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-500">
                  {darkMode ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Ramadan Mode</p>
                <p className="text-sm text-slate-500">
                  {ramadanMode ? 'Active' : 'Inactive'} - Special tracking for fasting
                </p>
              </div>
            </div>
            <Switch 
              checked={ramadanMode} 
              onCheckedChange={toggleRamadanMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your reminder preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className={cn(
                'w-5 h-5',
                notificationSettings.enabled ? 'text-green-500' : 'text-slate-400'
              )} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Enable Notifications</p>
                <p className="text-sm text-slate-500">
                  {notificationStatus.supported 
                    ? notificationSettings.enabled ? 'Notifications are on' : 'Notifications are off'
                    : 'Your browser doesn\'t support notifications'
                  }
                </p>
              </div>
            </div>
            <Switch 
              checked={notificationSettings.enabled} 
              onCheckedChange={handleToggleNotifications}
              disabled={!notificationStatus.supported}
            />
          </div>

          {notificationSettings.enabled && (
            <>
              {/* Water Reminder */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Water Reminder</p>
                    <p className="text-sm text-slate-500">
                      Remind me to drink water every {notificationSettings.waterReminderInterval} hours
                    </p>
                  </div>
                </div>
                <div className="pl-8">
                  <Label className="mb-2 block">Interval: {notificationSettings.waterReminderInterval} hours</Label>
                  <Slider
                    value={[notificationSettings.waterReminderInterval]}
                    onValueChange={([value]) => handleUpdateSetting('waterReminderInterval', value)}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1h</span>
                    <span>2h</span>
                    <span>3h</span>
                    <span>4h</span>
                  </div>
                </div>
              </div>

              {/* Exercise Reminder */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Exercise Reminder</p>
                    <p className="text-sm text-slate-500">
                      Daily reminder to complete your exercises
                    </p>
                  </div>
                </div>
                <div className="pl-8">
                  <Label htmlFor="exerciseTime" className="mb-2 block">Reminder Time</Label>
                  <Input
                    id="exerciseTime"
                    type="time"
                    value={notificationSettings.exerciseReminderTime}
                    onChange={(e) => handleUpdateSetting('exerciseReminderTime', e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Quiet Hours</p>
                    <p className="text-sm text-slate-500">
                      No notifications during these hours
                    </p>
                  </div>
                </div>
                <div className="pl-8 flex items-center gap-4">
                  <div>
                    <Label htmlFor="quietStart" className="mb-1 block text-xs">Start</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={notificationSettings.quietHoursStart}
                      onChange={(e) => handleUpdateSetting('quietHoursStart', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <span className="text-slate-400 pt-5">to</span>
                  <div>
                    <Label htmlFor="quietEnd" className="mb-1 block text-xs">End</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={notificationSettings.quietHoursEnd}
                      onChange={(e) => handleUpdateSetting('quietHoursEnd', e.target.value)}
                      className="w-28"
                    />
                  </div>
                </div>
              </div>

              {/* Test Notification */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleTestNotification}
                  className={cn(testSent && 'text-green-600 border-green-600')}
                >
                  {testSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Test Sent!
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Send Test Notification
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {!notificationStatus.supported && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Notifications Not Supported
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari for the best experience.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>About Track2Fit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Version</p>
                <p className="text-sm text-slate-500">1.0.0</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Description</p>
                <p className="text-sm text-slate-500">
                  Track2Fit is a daily health discipline system that helps you track hydration, 
                  exercise, nutrition habits, and weight progress. Build consistency through 
                  streaks and badges.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
