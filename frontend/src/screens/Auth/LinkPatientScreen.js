import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const LinkPatientScreen = () => {
  const navigation = useNavigation();
  const { linkPatient, isLoading } = useAuth();
  
  const [patientUsername, setPatientUsername] = useState('');

  const handleLinkPatient = async () => {
    if (!patientUsername.trim()) {
      Alert.alert('Error', 'Please enter the patient username');
      return;
    }

    const result = await linkPatient(patientUsername.trim());
    if (result.success) {
      Alert.alert(
        'Success!',
        'You have been successfully linked to the patient.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Link Failed', result.error);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animatable.View animation="fadeInDown" duration={1000}>
          <View style={styles.header}>
            <Text style={styles.title}>Link to Patient</Text>
            <Text style={styles.subtitle}>
              Connect your caregiver account to a patient
            </Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Patient Connection</Title>
              <Paragraph style={styles.cardSubtitle}>
                Enter the patient's username to link your account and start managing their care.
              </Paragraph>

              <View style={styles.form}>
                <TextInput
                  label="Patient Username"
                  value={patientUsername}
                  onChangeText={setPatientUsername}
                  mode="outlined"
                  placeholder="e.g., pat_1234"
                  style={styles.input}
                  left={<TextInput.Icon icon="account-link" />}
                  helperText="Ask the patient for their username (format: pat_XXXX)"
                />

                <Button
                  mode="contained"
                  onPress={handleLinkPatient}
                  style={styles.linkButton}
                  contentStyle={styles.buttonContent}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Linking...' : 'Link to Patient'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
          <View style={styles.footer}>
            <Button
              mode="text"
              onPress={navigateToLogin}
              style={styles.backButton}
            >
              Back to Sign In
            </Button>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeIn" duration={1000} delay={900}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to get the patient username:</Text>
            <Text style={styles.infoText}>
              1. Ask the patient to check their account details
            </Text>
            <Text style={styles.infoText}>
              2. The username format is: pat_XXXX (e.g., pat_1234)
            </Text>
            <Text style={styles.infoText}>
              3. This username is generated when the patient creates their account
            </Text>
          </View>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  linkButton: {
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
  backButton: {
    marginTop: spacing.md,
  },
  infoCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.lineHeight.bodySmall,
  },
});

export default LinkPatientScreen;
