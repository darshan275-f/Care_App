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
  Button,
  Chip,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/apiService';
import { colors, typography, spacing, componentStyles } from '../../config/theme';
import MedicineScanner from './MedicineScanner';

const MedicationsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      const result = await patientService.getMedications(user._id);
      if (result.success) {
        setMedications(result.data.medications);
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMedications();
    setIsRefreshing(false);
  };

  const handleMarkTaken = async (medicationId) => {
    try {
      const result = await patientService.markMedicationTaken(user._id, medicationId);
      if (result.success) {
        await loadMedications();
        Alert.alert('Success', 'Medication marked as taken');
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update medication status');
    }
  };

  const handleMarkSkipped = async (medicationId) => {
    Alert.alert(
      'Skip Medication',
      'Are you sure you want to mark this medication as skipped?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await patientService.markMedicationSkipped(user._id, medicationId);
              if (result.success) {
                await loadMedications();
                Alert.alert('Success', 'Medication marked as skipped');
              } else {
                Alert.alert('Error', result.error.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update medication status');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken':
        return colors.success;
      case 'skipped':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken':
        return 'check';
      case 'skipped':
        return 'close';
      default:
        return 'clock';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.patient.primary} />
          <Text style={styles.loadingText}>Loading medications...</Text>
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
        {medications.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={1000}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>No Medications</Text>
                <Text style={styles.emptyText}>
                  You don't have any medications scheduled yet.
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          medications.map((medication, index) => (
            <Animatable.View
              key={medication._id}
              animation="fadeInUp"
              duration={1000}
              delay={index * 100}
            >
              <Card style={styles.medicationCard}>
                <Card.Content>
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationInfo}>
                      <Title style={styles.medicationName}>
                        {medication.name}
                      </Title>
                      <Text style={styles.medicationDosage}>
                        {medication.dosage}
                      </Text>
                    </View>
                    <Chip
                      icon={getStatusIcon(medication.todayStatus.status)}
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(medication.todayStatus.status) }
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {medication.todayStatus.status.charAt(0).toUpperCase() + 
                       medication.todayStatus.status.slice(1)}
                    </Chip>
                  </View>

                  {medication.schedule && (
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleLabel}>Schedule:</Text>
                      <Text style={styles.scheduleText}>
                        {medication.schedule.type === 'daily' ? 'Daily' : 
                         medication.schedule.type === 'weekly' ? 'Weekly' : 
                         'As needed'}
                      </Text>
                      {medication.schedule.times && medication.schedule.times.length > 0 && (
                        <Text style={styles.scheduleTimes}>
                          {medication.schedule.times.map(time => 
                            `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`
                          ).join(', ')}
                        </Text>
                      )}
                    </View>
                  )}

                  {medication.notes && (
                    <View style={styles.notesInfo}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{medication.notes}</Text>
                    </View>
                  )}

                  {medication.todayStatus.takenAt && (
                    <View style={styles.takenInfo}>
                      <Text style={styles.takenLabel}>Taken at:</Text>
                      <Text style={styles.takenText}>
                        {moment(medication.todayStatus.takenAt).format('h:mm A')}
                      </Text>
                    </View>
                  )}

                  {medication.todayStatus.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => handleMarkTaken(medication._id)}
                        style={[styles.actionButton, styles.takenButton]}
                        icon="check"
                      >
                        Mark Taken
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleMarkSkipped(medication._id)}
                        style={[styles.actionButton, styles.skippedButton]}
                        icon="close"
                        textColor={colors.error}
                      >
                        Skip
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            </Animatable.View>
          ))
        )}
      </ScrollView>
        <FAB
        icon="camera"
        label="Scan Medicine"
        style={styles.fab}
        color={colors.surface}
        onPress={() => navigation.navigate('MedicineScanner')}
      />
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
    padding: spacing.md,
  },
  centerContent: {
    ...componentStyles.centerContent,
  },
    fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.patient.primary,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyCard: {
    ...componentStyles.card,
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
  },
  medicationCard: {
    ...componentStyles.card,
    marginBottom: spacing.md,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  medicationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  medicationName: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  medicationDosage: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    fontSize: typography.caption,
    color: colors.surface,
    fontWeight: typography.medium,
  },
  scheduleInfo: {
    marginBottom: spacing.sm,
  },
  scheduleLabel: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scheduleText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  scheduleTimes: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  notesInfo: {
    marginBottom: spacing.sm,
  },
  notesLabel: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.body,
  },
  takenInfo: {
    marginBottom: spacing.md,
  },
  takenLabel: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  takenText: {
    fontSize: typography.body,
    color: colors.success,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  takenButton: {
    backgroundColor: colors.success,
  },
  skippedButton: {
    borderColor: colors.error,
  },
});

export default MedicationsScreen;
