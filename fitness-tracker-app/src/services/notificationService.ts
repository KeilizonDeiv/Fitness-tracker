import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const WATER_REMINDER_ID = 'fittrack-water-reminder';
const WORKOUT_REMINDER_ID = 'fittrack-workout-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleWaterReminders(): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) return false;
  await ensureAndroidChannel();

  await Notifications.cancelScheduledNotificationAsync(WATER_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: WATER_REMINDER_ID,
    content: {
      title: 'Stay hydrated 💧',
      body: "Don't forget to log your water intake today.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 14,
      minute: 0,
    },
  });
  return true;
}

export async function cancelWaterReminders(): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(WATER_REMINDER_ID).catch(() => {});
  return true;
}

export async function scheduleWorkoutReminders(): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) return false;
  await ensureAndroidChannel();

  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_REMINDER_ID,
    content: {
      title: "Keep your streak alive 🔥",
      body: 'Log a workout today to stay on track with your goal.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
  return true;
}

export async function cancelWorkoutReminders(): Promise<boolean> {
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  return true;
}
