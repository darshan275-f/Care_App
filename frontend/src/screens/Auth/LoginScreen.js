import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View animation="fadeInDown" duration={1000}>
            <View style={styles.header}>
              <Text style={styles.title}>Adaptive Care</Text>
              <Text style={styles.subtitle}>
                Supporting Alzheimer's patients and caregivers
              </Text>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Welcome Back</Title>
                <Paragraph style={styles.cardSubtitle}>
                  Sign in to continue your care journey
                </Paragraph>

                <View style={styles.form}>
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                    error={error && error.includes('email')}
                  />

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    error={error && error.includes('password')}
                  />

                  {error && (
                    <Animatable.View animation="shake" duration={500}>
                      <Text style={styles.errorText}>{error}</Text>
                    </Animatable.View>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
            <View style={styles.footer}>
              <Divider style={styles.divider} />
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Button
                mode="outlined"
                onPress={navigateToRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeIn" duration={1000} delay={900}>
            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>
                Patient: patient@example.com / password123
              </Text>
              <Text style={styles.demoText}>
                Caregiver: caregiver@example.com / password123
              </Text>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
  },
  card: {
    ...componentStyles.card,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.body,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  divider: {
    width: '100%',
    marginBottom: spacing.md,
  },
  footerText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  registerButton: {
    borderColor: colors.primary,
  },
  demoInfo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  demoTitle: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  demoText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default LoginScreen;
