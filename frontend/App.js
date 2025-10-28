import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/config/theme';
import notificationService from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start
    const setupNotifications = async () => {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        console.log('Notification permissions granted');
      } else {
        console.log('Notification permissions denied');
      }

      // Set up notification listeners
      notificationService.setupListeners(
        (notification) => {
          console.log('Notification received:', notification);
          // Handle notification when received
        },
        (response) => {
          console.log('Notification tapped:', response);
          // Handle notification tap - could navigate to specific screen
        }
      );
    };

    setupNotifications();

    // Cleanup listeners on unmount
    return () => {
      notificationService.removeListeners();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
