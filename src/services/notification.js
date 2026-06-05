import { LocalNotifications } from '@capacitor/local-notifications';

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    await Notification.requestPermission();
  }
  await LocalNotifications.requestPermissions();
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
    await LocalNotifications.schedule({
      notifications: [{
        title: 'Habit Quest Reminder',
        body: `Time to complete: ${habit.name}`,
        id: parseInt(habit.id.replace(/\D/g, '') || Date.now()),
        schedule: { at: date },
        actionTypeId: 'HABIT_ACTION'
      }]
    });
  } catch (e) {
    console.log('Notification scheduling failed, falling back to browser', e);
  }
};

export const sendBrowserNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png' });
  }
};
