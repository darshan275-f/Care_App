import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ProgressBar,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/apiService';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const result = await patientService.getDashboard(user._id);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      'very-happy': '😄',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😔',
      'very-sad': '😢',
    };
    return moodIcons[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    return colors.mood[mood] || colors.textSecondary;
  };

  const getPriorityColor = (priority) => {
    return colors.priority[priority] || colors.textSecondary;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.patient.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Failed to load dashboard data</Text>
          <Button mode="contained" onPress={loadDashboardData}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.patient.primary]}
            tintColor={colors.patient.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Card style={styles.welcomeCard}>
            <Card.Content>
              <Title style={styles.welcomeTitle}>
                Good {moment().format('A') === 'AM' ? 'Morning' : 'Evening'}, {user.name}!
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Here's your care summary for today
              </Paragraph>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Overall Progress */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
          <Card style={styles.progressCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Today's Progress</Title>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={dashboardData.overallProgress / 100}
                  color={colors.patient.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {dashboardData.overallProgress}% Complete
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Medications Summary */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Medications</Title>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('PatientMedications')}
                  compact
                >
                  View All
                </Button>
              </View>
              
              <View style={styles.medicationStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.medicationStats.taken}
                  </Text>
                  <Text style={styles.statLabel}>Taken</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.medicationStats.total}
                  </Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.medicationStats.percentage}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
              </View>

              {dashboardData.medicationStats.medications.slice(0, 3).map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  </View>
                  <Chip
                    icon={med.taken ? 'check' : med.skipped ? 'close' : 'clock'}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: med.taken 
                          ? colors.success 
                          : med.skipped 
                          ? colors.error 
                          : colors.warning
                      }
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {med.taken ? 'Taken' : med.skipped ? 'Skipped' : 'Pending'}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Tasks Summary */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={900}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.cardTitle}>Tasks</Title>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('PatientTasks')}
                  compact
                >
                  View All
                </Button>
              </View>
              
              <View style={styles.taskStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.taskStats.completed}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.taskStats.total}
                  </Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {dashboardData.taskStats.percentage}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
              </View>

              {dashboardData.taskStats.tasks.slice(0, 3).map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDue}>
                      Due: {moment(task.dueDate).format('MMM D, h:mm A')}
                    </Text>
                  </View>
                  <Chip
                    icon={task.completed ? 'check' : 'clock'}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: task.completed ? colors.success : colors.warning
                      }
                    ]}
                    textStyle={styles.statusChipText}
                  >
                    {task.completed ? 'Done' : 'Pending'}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Recent Journal Entries */}
        {dashboardData.recentJournalEntries && dashboardData.recentJournalEntries.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>Recent Journal</Title>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('PatientJournal')}
                    compact
                  >
                    View All
                  </Button>
                </View>
                
                {dashboardData.recentJournalEntries.slice(0, 2).map((entry, index) => (
                  <View key={index} style={styles.journalItem}>
                    <View style={styles.journalHeader}>
                      <Text style={styles.journalMood}>
                        {getMoodIcon(entry.mood)}
                      </Text>
                      <Text style={styles.journalDate}>
                        {moment(entry.createdAt).format('MMM D')}
                      </Text>
                    </View>
                    <Text style={styles.journalText} numberOfLines={2}>
                      {entry.text}
                    </Text>
                    <Text style={styles.journalAuthor}>
                      By {entry.authorId.name}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Mood Statistics */}
        {dashboardData.moodStats && dashboardData.moodStats.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={1000} delay={1500}>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Recent Mood</Title>
                <View style={styles.moodStats}>
                  {dashboardData.moodStats.slice(0, 3).map((mood, index) => (
                    <View key={index} style={styles.moodItem}>
                      <Text style={styles.moodIcon}>
                        {getMoodIcon(mood._id)}
                      </Text>
                      <Text style={styles.moodCount}>{mood.count}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={1000} delay={1800}>
          <Card style={styles.actionsCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Quick Actions</Title>
              <View style={styles.actionsGrid}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientMedications')}
                  style={styles.actionButton}
                  icon="medication"
                >
                  Medications
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientTasks')}
                  style={styles.actionButton}
                  icon="assignment"
                >
                  Tasks
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientJournal')}
                  style={styles.actionButton}
                  icon="book"
                >
                  Journal
                </Button>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('PatientGames')}
                  style={styles.actionButton}
                  icon="games"
                >
                  Games
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.patient.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    ...componentStyles.centerContent,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  welcomeCard: {
    ...componentStyles.card,
    backgroundColor: colors.patient.primary,
    marginBottom: spacing.lg,
  },
  welcomeTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semiBold,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.body,
    color: colors.surface,
    opacity: 0.9,
  },
  progressCard: {
    ...componentStyles.card,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.body,
    color: colors.text,
    textAlign: 'center',
    fontWeight: typography.medium,
  },
  summaryCard: {
    ...componentStyles.card,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  medicationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.patient.primary,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.text,
  },
  medicationDosage: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.text,
  },
  taskDue: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    fontSize: typography.caption,
    color: colors.surface,
    fontWeight: typography.medium,
  },
  journalItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  journalMood: {
    fontSize: 24,
  },
  journalDate: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  journalText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.sm,
  },
  journalAuthor: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  moodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  moodItem: {
    alignItems: 'center',
  },
  moodIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  moodCount: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    color: colors.text,
  },
  actionsCard: {
    ...componentStyles.card,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.patient.primary,
  },
});

export default DashboardScreen;
