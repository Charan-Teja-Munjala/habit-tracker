import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../store/userStore';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  scheduleEveningAlert,
  cancelAllNotifications,
} from '../services/notificationService';

/**
 * Call once at the app root. Handles:
 * - Requesting permission on first launch
 * - Scheduling/rescheduling reminders when settings change
 * - Navigating to the correct screen when a notification is tapped
 */
export function useNotifications() {
  const navigation = useNavigation<any>();
  const settings = useUserStore((s) => s.notificationSettings);
  const updateSettings = useUserStore((s) => s.updateNotificationSettings);
  const prevSettings = useRef(settings);

  // Request permissions once on mount
  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermissions();
      if (granted && settings.dailyReminderEnabled) {
        await scheduleDailyReminder(
          settings.dailyReminderTime.hour,
          settings.dailyReminderTime.minute
        );
      }
      if (granted && settings.eveningAlertEnabled) {
        await scheduleEveningAlert();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-schedule when settings change
  useEffect(() => {
    const prev = prevSettings.current;
    prevSettings.current = settings;

    (async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      if (
        settings.dailyReminderEnabled !== prev.dailyReminderEnabled ||
        settings.dailyReminderTime.hour !== prev.dailyReminderTime.hour ||
        settings.dailyReminderTime.minute !== prev.dailyReminderTime.minute
      ) {
        if (settings.dailyReminderEnabled) {
          await scheduleDailyReminder(
            settings.dailyReminderTime.hour,
            settings.dailyReminderTime.minute
          );
        } else {
          await cancelAllNotifications();
          // Restore evening alert if still enabled
          if (settings.eveningAlertEnabled) await scheduleEveningAlert();
        }
      }

      if (settings.eveningAlertEnabled !== prev.eveningAlertEnabled) {
        if (settings.eveningAlertEnabled) {
          await scheduleEveningAlert();
        } else {
          await cancelAllNotifications();
          // Restore daily reminder if still enabled
          if (settings.dailyReminderEnabled) {
            await scheduleDailyReminder(
              settings.dailyReminderTime.hour,
              settings.dailyReminderTime.minute
            );
          }
        }
      }
    })();
  }, [settings]);

  // Navigate to correct screen when user taps a notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen as string | undefined;
      if (screen) {
        try { navigation.navigate(screen as any); } catch {}
      }
    });
    return () => sub.remove();
  }, [navigation]);
}
