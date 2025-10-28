import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../config/theme';

// Import screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LinkPatientScreen from '../screens/Auth/LinkPatientScreen';

// Patient screens
import PatientDashboardScreen from '../screens/Patient/DashboardScreen';
import PatientMedicationsScreen from '../screens/Patient/MedicationsScreen';
import PatientTasksScreen from '../screens/Patient/TasksScreen';
import PatientJournalScreen from '../screens/Patient/JournalScreen';
import PatientGamesScreen from '../screens/Patient/GamesScreen';
import PatientSettingsScreen from '../screens/Patient/SettingsScreen';
import MedicineScanner from '../screens/Patient/MedicineScanner';

// Caregiver screens
import CaregiverDashboardScreen from '../screens/Caregiver/DashboardScreen';
import CaregiverPatientsScreen from '../screens/Caregiver/PatientsScreen';
import CaregiverMedicationsScreen from '../screens/Caregiver/MedicationsScreen';
import CaregiverTasksScreen from '../screens/Caregiver/TasksScreen';
import CaregiverJournalScreen from '../screens/Caregiver/JournalScreen';
import CaregiverSettingsScreen from '../screens/Caregiver/SettingsScreen';

// Shared screens
import LoadingScreen from '../screens/Shared/LoadingScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Patient Tab Navigator
const PatientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'PatientDashboard':
              iconName = 'home';
              break;
            case 'PatientMedications':
              iconName = 'healing';
              break;
            case 'PatientTasks':
              iconName = 'assignment';
              break;
            case 'PatientJournal':
              iconName = 'book';
              break;
            case 'PatientGames':
              iconName = 'games';
              break;
            case 'PatientSettings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.patient.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption,
          fontWeight: typography.medium,
        },
        headerStyle: {
          backgroundColor: colors.patient.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: typography.semiBold,
          fontSize: typography.h6,
        },
      })}
    >
      <Tab.Screen 
        name="PatientDashboard" 
        component={PatientDashboardScreen}
        options={{ 
          title: 'Home',
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="PatientMedications" 
        component={PatientMedicationsScreen}
        options={{ 
          title: 'Medications',
          tabBarLabel: 'Medications'
        }}
      />
      <Tab.Screen 
        name="PatientTasks" 
        component={PatientTasksScreen}
        options={{ 
          title: 'Tasks',
          tabBarLabel: 'Tasks'
        }}
      />
      <Tab.Screen 
        name="PatientJournal" 
        component={PatientJournalScreen}
        options={{ 
          title: 'Journal',
          tabBarLabel: 'Journal'
        }}
      />
      <Tab.Screen 
        name="PatientGames" 
        component={PatientGamesScreen}
        options={{ 
          title: 'Games',
          tabBarLabel: 'Games'
        }}
      />
      <Tab.Screen 
        name="PatientSettings" 
        component={PatientSettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
};

// Caregiver Tab Navigator
const CaregiverTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'CaregiverDashboard':
              iconName = 'dashboard';
              break;
            case 'CaregiverPatients':
              iconName = 'people';
              break;
            case 'CaregiverMedications':
              iconName = 'healing';
              break;
            case 'CaregiverTasks':
              iconName = 'assignment';
              break;
            case 'CaregiverJournal':
              iconName = 'book';
              break;
            case 'CaregiverSettings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.caregiver.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption,
          fontWeight: typography.medium,
        },
        headerStyle: {
          backgroundColor: colors.caregiver.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: typography.semiBold,
          fontSize: typography.h6,
        },
      })}
    >
      <Tab.Screen 
        name="CaregiverDashboard" 
        component={CaregiverDashboardScreen}
        options={{ 
          title: 'Dashboard',
          tabBarLabel: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="CaregiverPatients" 
        component={CaregiverPatientsScreen}
        options={{ 
          title: 'Patients',
          tabBarLabel: 'Patients'
        }}
      />
      <Tab.Screen 
        name="CaregiverMedications" 
        component={CaregiverMedicationsScreen}
        options={{ 
          title: 'Medications',
          tabBarLabel: 'Medications'
        }}
      />
      <Tab.Screen 
        name="CaregiverTasks" 
        component={CaregiverTasksScreen}
        options={{ 
          title: 'Tasks',
          tabBarLabel: 'Tasks'
        }}
      />
      <Tab.Screen 
        name="CaregiverJournal" 
        component={CaregiverJournalScreen}
        options={{ 
          title: 'Journal',
          tabBarLabel: 'Journal'
        }}
      />
      <Tab.Screen 
        name="CaregiverSettings" 
        component={CaregiverSettingsScreen}
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: typography.semiBold,
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          title: 'Welcome to Adaptive Care',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account'
        }}
      />
      <Stack.Screen 
        name="LinkPatient" 
        component={LinkPatientScreen}
        options={{ 
          title: 'Link to Patient'
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <>
            {user?.role === 'patient' ? (
              <>
              <Stack.Screen name="PatientMain" component={PatientTabNavigator} />
              <Stack.Screen 
  name="MedicineScanner" 
  component={MedicineScanner} 
  options={{ 
    title: 'Medicine Scanner',
    headerShown: true 
  }} 
/>
              </>
            ) : (
              <Stack.Screen name="CaregiverMain" component={CaregiverTabNavigator} />
            )}
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: {
                  backgroundColor: user?.role === 'patient' ? colors.patient.primary : colors.caregiver.primary,
                },
                headerTintColor: colors.surface,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
