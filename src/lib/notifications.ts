// Browser Notification Service

export interface NotificationSettings {
  enabled: boolean;
  waterReminderInterval: number; // in hours
  exerciseReminderTime: string; // HH:mm format
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  waterReminderInterval: 2,
  exerciseReminderTime: '09:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00'
};

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Check if notifications are supported and permitted
export function checkNotificationStatus(): { supported: boolean; permitted: boolean } {
  const supported = 'Notification' in window;
  const permitted = supported && Notification.permission === 'granted';
  return { supported, permitted };
}

// Send a notification
export function sendNotification(title: string, options?: NotificationOptions): void {
  const { supported, permitted } = checkNotificationStatus();
  
  if (!supported || !permitted) {
    console.log('Notifications not supported or permitted');
    return;
  }

  // Check quiet hours
  if (isInQuietHours()) {
    console.log('In quiet hours, notification suppressed');
    return;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'track2fit-notification',
      requireInteraction: false,
      ...options
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Check if current time is in quiet hours
function isInQuietHours(): boolean {
  const settings = getNotificationSettings();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const start = settings.quietHoursStart;
  const end = settings.quietHoursEnd;
  
  if (start < end) {
    return currentTime >= start && currentTime <= end;
  } else {
    // Quiet hours span midnight
    return currentTime >= start || currentTime <= end;
  }
}

// Get notification settings from localStorage
export function getNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Error reading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Schedule water reminder
let waterReminderInterval: ReturnType<typeof setInterval> | null = null;

export function scheduleWaterReminder(intervalHours: number = 2): void {
  // Clear existing reminder
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
  }

  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  // Convert hours to milliseconds
  const intervalMs = intervalHours * 60 * 60 * 1000;

  waterReminderInterval = setInterval(() => {
    sendNotification('💧 Time to hydrate!', {
      body: 'Stay on track with your daily water goal. Take a sip now!',
      icon: '/water-icon.png'
    });
  }, intervalMs);
}

// Stop water reminder
export function stopWaterReminder(): void {
  if (waterReminderInterval) {
    clearInterval(waterReminderInterval);
    waterReminderInterval = null;
  }
}

// Schedule exercise reminder
let exerciseReminderTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleExerciseReminder(time: string = '09:00'): void {
  // Clear existing reminder
  if (exerciseReminderTimeout) {
    clearTimeout(exerciseReminderTimeout);
  }

  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const delay = reminderTime.getTime() - now.getTime();

  exerciseReminderTimeout = setTimeout(() => {
    sendNotification('🏋️ Exercise Time!', {
      body: 'Time to complete your daily exercise goals. You got this!',
      icon: '/exercise-icon.png'
    });
    // Reschedule for next day
    scheduleExerciseReminder(time);
  }, delay);
}

// Stop exercise reminder
export function stopExerciseReminder(): void {
  if (exerciseReminderTimeout) {
    clearTimeout(exerciseReminderTimeout);
    exerciseReminderTimeout = null;
  }
}

// Initialize all reminders
export function initializeReminders(): void {
  const settings = getNotificationSettings();
  
  if (settings.enabled) {
    scheduleWaterReminder(settings.waterReminderInterval);
    scheduleExerciseReminder(settings.exerciseReminderTime);
  }
}

// Stop all reminders
export function stopAllReminders(): void {
  stopWaterReminder();
  stopExerciseReminder();
}

// Toggle notifications on/off
export async function toggleNotifications(enabled: boolean): Promise<boolean> {
  if (enabled) {
    const permitted = await requestNotificationPermission();
    if (permitted) {
      const settings = getNotificationSettings();
      settings.enabled = true;
      saveNotificationSettings(settings);
      initializeReminders();
      return true;
    }
    return false;
  } else {
    const settings = getNotificationSettings();
    settings.enabled = false;
    saveNotificationSettings(settings);
    stopAllReminders();
    return true;
  }
}

// Send immediate test notification
export function sendTestNotification(): void {
  sendNotification('Track2Fit Test', {
    body: 'Your notifications are working correctly! 💪',
    icon: '/favicon.ico'
  });
}
