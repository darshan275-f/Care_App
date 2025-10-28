import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, componentStyles } from '../../config/theme';

const PatientsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Patient Management</Text>
            <Text style={styles.subtitle}>Coming Soon</Text>
            <Text style={styles.description}>
              This screen will show all linked patients and allow you to manage their care plans.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.caregiver.background,
  },
  centerContent: {
    ...componentStyles.centerContent,
  },
  card: {
    ...componentStyles.card,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: colors.primary,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24,
  },
});

export default PatientsScreen;
