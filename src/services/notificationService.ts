import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// How notifications appear while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Schedule (or reschedule) a daily habit reminder at a given time. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  // Cancel any old daily reminder before re-scheduling
  await cancelByTag('daily-reminder');

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌟 Time to build your habits!',
      body: 'Open the app to check off today\'s habits and keep your streak alive.',
      sound: 'default',
      data: { screen: 'Home', tag: 'daily-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

/** Schedule a 9 PM evening streak-protection reminder. */
export async function scheduleEveningAlert(): Promise<string> {
  await cancelByTag('evening-alert');

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Don\'t break your streak!',
      body: 'You still have habits to complete today. Finish strong!',
      sound: 'default',
      data: { screen: 'Home', tag: 'evening-alert' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
  return id;
}

/** Fire an immediate notification when an achievement or milestone is unlocked. */
export async function sendAchievementNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { screen: 'Achievements' },
    },
    trigger: null, // fire immediately
  });
}

/** Cancel all scheduled notifications with a specific data.tag value. */
async function cancelByTag(tag: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.tag === tag)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** Cancel ALL scheduled notifications (e.g., when all reminders are disabled). */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
