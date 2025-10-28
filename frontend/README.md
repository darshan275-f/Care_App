# Adaptive Care Frontend

React Native mobile application built with Expo for Alzheimer's patients and caregivers.

## Features

- **Role-based Authentication**: Separate interfaces for patients and caregivers
- **Patient-Caregiver Linking**: Secure account linking system
- **Medication Management**: Track medications with adherence monitoring
- **Task Management**: Create and track daily tasks
- **Journal System**: Mood tracking and care notes
- **Cognitive Games**: Memory and brain training exercises
- **Real-time Dashboard**: Comprehensive care overview
- **Accessibility**: Large buttons, high contrast, readable fonts

## Tech Stack

- **React Native** with Expo CLI
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Context API** for state management
- **Axios** for API calls
- **Expo SecureStore** for secure token storage
- **React Native Animatable** for animations

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env`:
   ```env
   API_URL=http://localhost:5000
   API_TIMEOUT=10000
   APP_NAME=Adaptive Care
   APP_VERSION=1.0.0
   DEBUG_MODE=true
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── Auth/           # Authentication screens
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── LinkPatientScreen.js
│   │   ├── Patient/        # Patient-specific screens
│   │   │   ├── DashboardScreen.js
│   │   │   ├── MedicationsScreen.js
│   │   │   ├── TasksScreen.js
│   │   │   ├── JournalScreen.js
│   │   │   ├── GamesScreen.js
│   │   │   └── SettingsScreen.js
│   │   ├── Caregiver/      # Caregiver-specific screens
│   │   │   ├── DashboardScreen.js
│   │   │   ├── PatientsScreen.js
│   │   │   ├── MedicationsScreen.js
│   │   │   ├── TasksScreen.js
│   │   │   ├── JournalScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── Shared/         # Shared screens
│   │       ├── LoadingScreen.js
│   │       └── ProfileScreen.js
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.js
│   ├── context/           # React Context providers
│   │   └── AuthContext.js
│   ├── services/          # API service functions
│   │   └── apiService.js
│   ├── config/            # Configuration files
│   │   ├── api.js         # API configuration
│   │   └── theme.js       # Theme configuration
│   └── utils/             # Utility functions
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
└── package.json
```

## Key Components

### Authentication Flow

1. **Login/Register**: Users authenticate with email and password
2. **Role Selection**: Choose between patient or caregiver role
3. **Patient Linking**: Caregivers link to patients using unique usernames
4. **Token Management**: Secure JWT token storage and automatic refresh

### Patient Interface

- **Dashboard**: Overview of medications, tasks, and progress
- **Medications**: View and mark medications as taken/skipped
- **Tasks**: View and complete assigned tasks
- **Journal**: Write entries and track mood
- **Games**: Play cognitive games and track progress
- **Settings**: Profile and app preferences

### Caregiver Interface

- **Dashboard**: Patient statistics and care insights
- **Patient Management**: View and manage linked patients
- **Medication Management**: Add/edit patient medications
- **Task Management**: Create and assign tasks
- **Journal Access**: View and add journal entries
- **Settings**: Profile and app preferences

## Theme System

The app uses a comprehensive theme system with:

- **Role-based Colors**: Different color schemes for patients vs caregivers
- **Accessibility**: High contrast, large fonts, readable colors
- **Mood Colors**: Color-coded mood indicators
- **Priority Colors**: Visual priority indicators for tasks
- **Consistent Spacing**: Standardized spacing system
- **Typography**: Optimized font sizes and weights

## API Integration

The frontend integrates with the backend API through:

- **Axios Configuration**: Base URL, timeouts, interceptors
- **Token Management**: Automatic token injection and refresh
- **Error Handling**: Comprehensive error handling and user feedback
- **Service Layer**: Organized API service functions
- **Type Safety**: Consistent data structures

## State Management

Uses React Context API for:

- **Authentication State**: User data, tokens, login status
- **Global State**: App-wide state management
- **Error Handling**: Global error state and handling
- **Loading States**: Loading indicators and states

## Navigation

React Navigation setup with:

- **Stack Navigation**: For authentication and modal screens
- **Tab Navigation**: For main app screens
- **Role-based Routing**: Different navigation for patients vs caregivers
- **Deep Linking**: Support for deep linking and navigation

## Development

### Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Debugging

- Use React Native Debugger
- Enable remote debugging in Expo
- Use console.log for debugging
- Check network requests in browser dev tools

### Testing

```bash
npm test
```

## Building for Production

### iOS

1. **Configure app.json** with iOS settings
2. **Build with EAS:**
   ```bash
   npx eas build --platform ios
   ```
3. **Submit to App Store**

### Android

1. **Configure app.json** with Android settings
2. **Build with EAS:**
   ```bash
   npx eas build --platform android
   ```
3. **Submit to Google Play Store**

## Accessibility

The app is designed with accessibility in mind:

- **Large Touch Targets**: Minimum 44px touch targets
- **High Contrast**: Sufficient color contrast ratios
- **Readable Fonts**: Minimum 16px font size
- **Voice Labels**: Screen reader support
- **Simple Navigation**: Clear navigation patterns
- **Error Messages**: Clear, helpful error messages

## Performance

Optimizations include:

- **Lazy Loading**: Load screens only when needed
- **Image Optimization**: Optimized images and caching
- **Memory Management**: Proper cleanup of resources
- **Network Optimization**: Efficient API calls and caching
- **Bundle Splitting**: Optimized bundle sizes

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS simulator not starting**: Check Xcode installation
3. **Android emulator issues**: Check Android Studio setup
4. **Network errors**: Verify API URL in .env file
5. **Token issues**: Clear app data and re-login

### Getting Help

- Check Expo documentation
- Review React Native documentation
- Check GitHub issues
- Contact development team

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new components
3. Add proper error handling
4. Include accessibility features
5. Test on both iOS and Android
6. Update documentation

## License

MIT License - see LICENSE file for details.
