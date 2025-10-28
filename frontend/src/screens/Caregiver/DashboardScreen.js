import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import PatientPicker from '../../components/PatientPicker';
import DebugInfo from '../../components/DebugInfo';
import { patientService, taskService, medicationService, journalService, gameService } from '../../services/apiService';
import moment from 'moment';

const CaregiverDashboardScreen = () => {
  const { user } = useAuth();
  const linkedPatients = useMemo(() => user?.linkedPatients || [], [user]);
  const [patientId, setPatientId] = useState(linkedPatients[0]?._id || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    medications: { taken: 0, total: 0, percentage: 0 },
    tasks: { completed: 0, total: 0, percentage: 0 },
    games: { played: 0, averageScore: 0 },
    mood: 'neutral',
    recentEntries: []
  });

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!patientId) return;

    try {
      if (!isRefresh) setLoading(true);
      
      const dashboardRes = await patientService.getDashboard(patientId);
      if (dashboardRes.success) {
        const data = dashboardRes.data;
        setDashboardData({
          medications: {
            taken: data.medicationStats?.taken || 0,
            total: data.medicationStats?.total || 0,
            percentage: data.medicationStats?.percentage || 0
          },
          tasks: {
            completed: data.taskStats?.completed || 0,
            total: data.taskStats?.total || 0,
            percentage: data.taskStats?.percentage || 0
          },
          games: {
            played: data.recentGameStats?.length || 0,
            averageScore: data.recentGameStats?.length > 0 
              ? Math.round(data.recentGameStats.reduce((sum, g) => sum + g.score, 0) / data.recentGameStats.length)
              : 0
          },
          mood: data.moodStats?.mostRecent || 'neutral',
          recentEntries: data.recentJournalEntries || []
        });
      } else {
        Alert.alert('Error', dashboardRes.error?.message || 'Failed to load dashboard data');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'An unexpected error occurred while loading dashboard data.');
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (linkedPatients.length > 0 && !patientId) {
      setPatientId(linkedPatients[0]._id);
    }
  }, [linkedPatients, patientId]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  }, [loadDashboardData]);

  const getMoodEmoji = (mood) => {
    const moods = {
      'very-happy': '😄',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😔',
      'very-sad': '😢'
    };
    return moods[mood] || '😐';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.caregiver.primary]} />
        }
      >
        <Text style={styles.title}>Patient Dashboard</Text>
       
        <PatientPicker
          patients={linkedPatients}
          selectedPatientId={patientId}
          onChange={setPatientId}
        />

        {loading && !refreshing ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.caregiver.primary} />
          </View>
        ) : patientId ? (
          <>
            {/* Medication Progress */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Medication Adherence</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>
                    {dashboardData.medications.taken} of {dashboardData.medications.total} taken
                  </Text>
                  <Text style={styles.percentageText}>{dashboardData.medications.percentage}%</Text>
                </View>
                <ProgressBar 
                  progress={dashboardData.medications.percentage / 100} 
                  color={dashboardData.medications.percentage >= 80 ? colors.success : colors.warning}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {/* Task Progress */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Task Completion</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>
                    {dashboardData.tasks.completed} of {dashboardData.tasks.total} completed
                  </Text>
                  <Text style={styles.percentageText}>{dashboardData.tasks.percentage}%</Text>
                </View>
                <ProgressBar 
                  progress={dashboardData.tasks.percentage / 100} 
                  color={dashboardData.tasks.percentage >= 80 ? colors.success : colors.warning}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {/* Games & Mood */}
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Cognitive Activity</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{dashboardData.games.played}</Text>
                    <Text style={styles.statLabel}>Games Played</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{dashboardData.games.averageScore}</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{getMoodEmoji(dashboardData.mood)}</Text>
                    <Text style={styles.statLabel}>Current Mood</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Recent Journal Entries */}
            {dashboardData.recentEntries.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardTitle}>Recent Journal Entries</Text>
                  {dashboardData.recentEntries.slice(0, 3).map((entry, index) => (
                    <View key={index} style={styles.entryItem}>
                      <Text style={styles.entryText}>{entry.text.substring(0, 100)}...</Text>
                      <Text style={styles.entryDate}>
                        {moment(entry.createdAt).format('MMM D, h:mm A')} • {entry.authorId?.name || 'Patient'}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.subtitle}>No Patient Selected</Text>
              <Text style={styles.description}>Select a patient to view their dashboard.</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.caregiver.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    ...componentStyles.card,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.body,
    color: colors.text,
  },
  percentageText: {
    fontSize: typography.h6,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  entryItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryText: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  entryDate: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: typography.h6,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});

export default CaregiverDashboardScreen;
