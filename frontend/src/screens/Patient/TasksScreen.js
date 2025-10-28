import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Chip,
  ActivityIndicator,
  Checkbox,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/apiService';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const TasksScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const result = await patientService.getTasks(user._id);
      if (result.success) {
        setTasks(result.data.tasks);
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTasks();
    setIsRefreshing(false);
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      if (completed) {
        const result = await patientService.markTaskCompleted(user._id, taskId);
        if (result.success) {
          await loadTasks();
          Alert.alert('Success', 'Task marked as completed');
        } else {
          Alert.alert('Error', result.error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const openDatePicker = (task) => {
    setSelectedTask(task);
    setSelectedDate(new Date(task.dueDate || Date.now()));
    setShowPicker(true);
  };

  const onDateChange = async (event, date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!date) return;
    setSelectedDate(date);

    if (selectedTask) {
      try {
        const result = await patientService.updateTaskDueDate(
          user._id,
          selectedTask._id,
          date
        );
        if (result.success) {
          await loadTasks();
          Alert.alert('Updated', 'Task due date updated successfully');
        } else {
          Alert.alert('Error', result.error.message);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to update due date');
      }
    }
  };

  const isOverdue = (dueDate) => moment(dueDate).isBefore(moment(), 'day');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.patient.primary} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
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
      >
        {tasks.length === 0 ? (
          <Animatable.View animation="fadeIn" duration={1000}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>No Tasks</Text>
                <Text style={styles.emptyText}>
                  You don't have any tasks assigned yet.
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        ) : (
          tasks.map((task, index) => (
            <Animatable.View
              key={task._id}
              animation="fadeInUp"
              duration={1000}
              delay={index * 100}
            >
              <Card
                style={[
                  styles.taskCard,
                  isOverdue(task.dueDate) && !task.completed && styles.overdueCard,
                ]}
              >
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskInfo}>
                      <Title style={styles.taskTitle}>{task.title}</Title>
                      {task.description && (
                        <Text style={styles.taskDescription}>
                          {task.description}
                        </Text>
                      )}
                    </View>
                    <Checkbox
                      status={task.completed ? 'checked' : 'unchecked'}
                      onPress={() => handleToggleTask(task._id, !task.completed)}
                      color={colors.patient.primary}
                    />
                  </View>

                  <View style={styles.taskDetails}>
                    <Text
                      style={[
                        styles.dueDateText,
                        isOverdue(task.dueDate) && !task.completed && styles.overdueText,
                      ]}
                    >
                      Due: {moment(task.dueDate).format('MMM D, YYYY h:mm A')}
                    </Text>


                  </View>
                </Card.Content>
              </Card>
            </Animatable.View>
          ))
        )}
      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.patient.background },
  scrollView: { flex: 1, padding: spacing.md },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyCard: { marginTop: spacing.xl, padding: spacing.md },
  emptyContent: { alignItems: 'center' },
  emptyTitle: { fontSize: typography.h5, fontWeight: '600', marginBottom: 8 },
  emptyText: { color: colors.textSecondary },
  taskCard: { marginBottom: spacing.md, padding: spacing.sm },
  overdueCard: { borderLeftWidth: 4, borderLeftColor: colors.error },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: { flex: 1, marginRight: spacing.md },
  taskTitle: { fontSize: typography.h5, fontWeight: '600' },
  taskDescription: { color: colors.textSecondary },
  taskDetails: { marginTop: spacing.sm },
  dueDateText: { color: colors.textSecondary, marginBottom: 6 },
  overdueText: { color: colors.error, fontWeight: '500' },
  changeButton: { alignSelf: 'flex-start', marginTop: 4 },
});

export default TasksScreen;
