import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';

import { colors, typography, spacing, componentStyles } from '../../config/theme';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🧠</Text>
          </View>
        </Animatable.View>
        
        <Animatable.View animation="fadeIn" duration={1000} delay={500}>
          <Text style={styles.title}>Adaptive Care</Text>
          <Text style={styles.subtitle}>Loading your care journey...</Text>
        </Animatable.View>
        
        <Animatable.View animation="fadeIn" duration={1000} delay={1000}>
          <ActivityIndicator 
            size="large" 
            color={colors.primary} 
            style={styles.loader}
          />
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
    ...componentStyles.centerContent,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
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
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.body,
  },
  loader: {
    marginTop: spacing.lg,
  },
});

export default LoadingScreen;
