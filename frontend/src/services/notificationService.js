import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Request notification permissions
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get the push token
      const token = await this.getExpoPushToken();
      console.log('Push notification token:', token);

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get or generate Expo push token
   * @returns {Promise<string>} Expo push token
   */
  async getExpoPushToken() {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Update with your project ID if needed
      });
      this.expoPushToken = tokenData.data;
      return this.expoPushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   * @param {Object} options - Notification options
   * @param {Date} options.triggerDate - Date and time to trigger notification
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Additional data
   * @param {string} options.sound - Sound file name (optional)
   * @returns {Promise<string>} Notification ID
   */
  async scheduleLocalNotification(options) {
    try {
      const { triggerDate, title, body, data = {}, sound = 'default' } = options;

      if (!triggerDate || triggerDate < new Date()) {
        console.log('Invalid trigger date');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: triggerDate,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a recurring daily notification
   * @param {Object} options - Notification options
   * @param {number} options.hour - Hour (0-23)
   * @param {number} options.minute - Minute (0-59)
   * @param {string} options.title - Notification title
   * @param {string} options.body - Notification body
   * @param {Object} options.data - Additional data
   * @returns {Promise<string>} Notification ID
   */
  async scheduleRecurringNotification(options) {
    try {
      const { hour, minute, title, body, data = {} } = options;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling recurring notification:', error);
      return null;
    }
  }

  /**
   * Cancel a specific notification
   * @param {string} notificationId - Notification ID to cancel
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   * @returns {Promise<Array>} Array of scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Set up notification listeners
   * @param {Function} onNotificationReceived - Callback when notification received
   * @param {Function} onNotificationTap - Callback when notification tapped
   */
  setupListeners(onNotificationReceived, onNotificationTap) {
    // Listen for notifications while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listen for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      if (onNotificationTap) {
        onNotificationTap(response);
      }
    });
  }

  /**
   * Remove notification listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Schedule notification for a medication
   * @param {Object} medication - Medication object
   * @returns {Promise<Array>} Array of notification IDs
   */
  async scheduleMedicationNotifications(medication) {
    if (!medication.schedule || !medication.schedule.times) {
      return [];
    }

    const notificationIds = [];
    const { schedule } = medication;

    if (schedule.type === 'daily') {
      // Schedule daily notifications for the next 30 days
      for (let i = 0; i < 30; i++) {
        const triggerDate = new Date();
        triggerDate.setDate(triggerDate.getDate() + i);

        for (const time of schedule.times) {
          triggerDate.setHours(time.hour, time.minute, 0, 0);

          const notificationId = await this.scheduleLocalNotification({
            triggerDate: new Date(triggerDate),
            title: `Medication Reminder: ${medication.name}`,
            body: `Time to take ${medication.name} (${medication.dosage})`,
            data: {
              type: 'medication',
              medicationId: medication._id,
            },
          });

          if (notificationId) {
            notificationIds.push(notificationId);
          }
        }
      }
    }

    return notificationIds;
  }

  /**
   * Schedule notification for a task
   * @param {Object} task - Task object
   * @returns {Promise<string>} Notification ID
   */
  async scheduleTaskNotification(task) {
    if (!task.dueDate) {
      return null;
    }

    const triggerDate = new Date(task.dueDate);
    triggerDate.setHours(9, 0, 0, 0); // Default to 9 AM

    const notificationId = await this.scheduleLocalNotification({
      triggerDate,
      title: `Task Reminder: ${task.title}`,
      body: task.description || `Don't forget to complete: ${task.title}`,
      data: {
        type: 'task',
        taskId: task._id,
      },
    });

    return notificationId;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

