import { LocalNotifications } from '@capacitor/local-notifications';

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.log('Browser notification permission failed', e);
    }
  }
  
  try {
    await LocalNotifications.requestPermissions();
  } catch (e) {
    console.log('Capacitor notifications not available in this environment');
  }
};

export const scheduleHabitNotification = async (habit) => {
  if (!habit.reminderTime || !habit.active) return;
  
  const [hours, minutes] = habit.reminderTime.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  if (date < new Date()) {
    date.setDate(date.getDate() + 1);
  }

  try {
    // Generate a safe 32-bit integer ID for Capacitor
    const rawId = habit.id.replace(/\D/g, '') || Date.now().toString();
    const safeId = parseInt(rawId) % 2147483647;

    await LocalNotifications.schedule({
      notifications: [{
        title: 'Habit Quest Reminder',
        body: `Time to complete: ${habit.name}`,
        id: safeId,
        schedule: { at: date },
        actionTypeId: 'HABIT_ACTION'
      }]
    });
  } catch (e) {
    console.log('Capacitor notification scheduling failed, falling back to browser', e);
  }
};

export const sendBrowserNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icon-192.png' });
    } catch (e) {
      console.log('Browser notification failed', e);
    }
  }
};
