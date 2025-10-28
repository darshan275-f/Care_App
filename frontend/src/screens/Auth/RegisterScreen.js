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
  RadioButton,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    patientUsername: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (formData.role === 'caregiver' && !formData.patientUsername.trim()) {
      Alert.alert('Error', 'Please enter the patient username to link your account');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === 'caregiver') {
      registrationData.patientUsername = formData.patientUsername.trim();
    }

    const result = await register(registrationData);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    } else {
      // Show success message with patient username if applicable
      if (result.user.role === 'patient' && result.user.username) {
        Alert.alert(
          'Registration Successful!',
          `Your patient username is: ${result.user.username}\n\nPlease share this with your caregiver so they can link to your account.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Adaptive Care to start your journey
              </Text>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.form}>
                  <TextInput
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    mode="outlined"
                    autoCapitalize="words"
                    autoComplete="name"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                  />

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
                  />

                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />

                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password-new"
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />

                  <View style={styles.roleSection}>
                    <Text style={styles.roleTitle}>I am a:</Text>
                    <View style={styles.roleOptions}>
                      <View style={styles.roleOption}>
                        <RadioButton
                          value="patient"
                          status={formData.role === 'patient' ? 'checked' : 'unchecked'}
                          onPress={() => handleInputChange('role', 'patient')}
                          color={colors.primary}
                        />
                        <Text style={styles.roleLabel}>Patient</Text>
                      </View>
                      <View style={styles.roleOption}>
                        <RadioButton
                          value="caregiver"
                          status={formData.role === 'caregiver' ? 'checked' : 'unchecked'}
                          onPress={() => handleInputChange('role', 'caregiver')}
                          color={colors.primary}
                        />
                        <Text style={styles.roleLabel}>Caregiver</Text>
                      </View>
                    </View>
                  </View>

                  {formData.role === 'caregiver' && (
                    <Animatable.View animation="fadeIn" duration={500}>
                      <TextInput
                        label="Patient Username"
                        value={formData.patientUsername}
                        onChangeText={(value) => handleInputChange('patientUsername', value)}
                        mode="outlined"
                        placeholder="e.g., pat_1234"
                        style={styles.input}
                        left={<TextInput.Icon icon="account-link" />}
                        helperText="Enter the patient's username to link your account"
                      />
                    </Animatable.View>
                  )}

                  {error && (
                    <Animatable.View animation="shake" duration={500}>
                      <Text style={styles.errorText}>{error}</Text>
                    </Animatable.View>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.registerButton}
                    contentStyle={styles.buttonContent}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
            <View style={styles.footer}>
              <Divider style={styles.divider} />
              <Text style={styles.footerText}>Already have an account?</Text>
              <Button
                mode="outlined"
                onPress={navigateToLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                Sign In
              </Button>
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
    marginBottom: spacing.lg,
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
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  roleSection: {
    marginVertical: spacing.md,
  },
  roleTitle: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  registerButton: {
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
  loginButton: {
    borderColor: colors.primary,
  },
});

export default RegisterScreen;
