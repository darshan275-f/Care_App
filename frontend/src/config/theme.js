import { DefaultTheme } from 'react-native-paper';

// Adaptive Care Color Palette
const colors = {
  primary: '#4A90E2',        // Soft blue - calming and trustworthy
  primaryDark: '#357ABD',    // Darker blue for contrast
  secondary: '#7ED321',      // Fresh green - positive and healthy
  accent: '#F5A623',         // Warm orange - friendly and approachable
  background: '#F8F9FA',     // Light gray - clean and modern
  surface: '#FFFFFF',        // White - clean and accessible
  text: '#2C3E50',          // Dark gray - readable and professional
  textSecondary: '#7F8C8D', // Medium gray - secondary text
  error: '#E74C3C',         // Red - clear error indication
  warning: '#F39C12',       // Orange - attention needed
  success: '#27AE60',       // Green - success confirmation
  info: '#3498DB',          // Blue - informational
  disabled: '#BDC3C7',      // Light gray - disabled state
  border: '#E1E8ED',        // Light border
  shadow: '#000000',        // Black with opacity for shadows
  
  // Patient-specific colors
  patient: {
    primary: '#4A90E2',
    secondary: '#7ED321',
    background: '#F0F8FF',   // Very light blue
  },
  
  // Caregiver-specific colors
  caregiver: {
    primary: '#7ED321',
    secondary: '#4A90E2',
    background: '#F0FFF0',   // Very light green
  },
  
  // Mood colors
  mood: {
    'very-happy': '#27AE60',
    'happy': '#7ED321',
    'neutral': '#F5A623',
    'sad': '#E67E22',
    'very-sad': '#E74C3C',
  },
  
  // Priority colors
  priority: {
    high: '#E74C3C',
    medium: '#F39C12',
    low: '#27AE60',
  },
  
  // Game difficulty colors
  difficulty: {
    easy: '#27AE60',
    medium: '#F39C12',
    hard: '#E74C3C',
  }
};

// Typography
const typography = {
  // Font sizes optimized for accessibility
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  button: 16,
  
  // Font weights
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  
  // Line heights for better readability
  lineHeight: {
    h1: 40,
    h2: 36,
    h3: 32,
    h4: 28,
    h5: 24,
    h6: 22,
    body: 24,
    bodySmall: 20,
    caption: 16,
  }
};

// Spacing system
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Shadows
const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Create React Native Paper theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
    disabled: colors.disabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: borderRadius.md,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: typography.regular,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: typography.medium,
    },
    light: {
      fontFamily: 'System',
      fontWeight: typography.light,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: typography.light,
    },
  },
};

// Component-specific styles
const componentStyles = {
  card: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  input: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
};

export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentStyles,
};

export default theme;
