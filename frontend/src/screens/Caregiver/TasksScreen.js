import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, HelperText, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import PatientPicker from '../../components/PatientPicker';
import { taskService } from '../../services/apiService';
import notificationService from '../../services/notificationService';
import moment from 'moment';

const emptyForm = {
  title: '',
  description: '',
  dueDate: new Date(),
  priority: 'medium',
  category: 'other',
  notes: '',
};

const CaregiverTasksScreen = () => {
  const { user } = useAuth();
  const linkedPatients = useMemo(() => user?.linkedPatients || [], [user]);
  const [patientId, setPatientId] = useState(linkedPatients[0]?._id || null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (linkedPatients.length > 0 && !patientId) {
      setPatientId(linkedPatients[0]._id);
    }
  }, [linkedPatients, patientId]);

  useEffect(() => {
    if (patientId) {
      loadTasks();
    }
  }, [patientId]);


  const loadTasks = async () => {
    if (!patientId) {
      setTasks([]);
      return;
    }
    
    try {
      setLoading(true);
      const res = await taskService.getByPatient(patientId, { isActive: true });
      if (res.success) {
        setTasks(res.data.tasks || res.data?.data?.tasks || res.data || []);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: new Date(task.dueDate),
      priority: task.priority,
      category: task.category,
      notes: task.notes || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!patientId) return;
    if (!form.title || !form.dueDate) return;
    try {
      setSaving(true);
      const payload = {
        patientId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dueDate: form.dueDate.toISOString(),
        priority: form.priority,
        category: form.category,
        notes: form.notes.trim() || undefined,
        recurring: { type: 'none', interval: 1 }
      };
      const res = editingId
        ? await taskService.update(editingId, payload)
        : await taskService.create(payload);
      if (res.success) {
        // Schedule notification for new task
        if (!editingId && res.data?.task) {
          try {
            const notificationId = await notificationService.scheduleTaskNotification(res.data.task);
            if (notificationId) {
              console.log('Notification scheduled for task');
            }
          } catch (notifError) {
            console.error('Failed to schedule notification:', notifError);
            // Don't fail the task creation
          }
        }
        
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        await loadTasks();
        Alert.alert('Success', editingId ? 'Task updated' : 'Task created with notification');
      } else {
        Alert.alert('Error', res.error.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await taskService.delete(id);
            if (res.success) {
              await loadTasks();
            } else {
              Alert.alert('Error', res.error.message);
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete task');
          }
        }
      }
    ]);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setForm({ ...form, dueDate: currentDate });
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || form.dueDate;
    setShowTimePicker(Platform.OS === 'ios');
    setForm({ ...form, dueDate: currentTime });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Task Management</Text>
        <PatientPicker
          patients={linkedPatients}
          selectedPatientId={patientId}
          onChange={setPatientId}
        />

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.caregiver.primary} />
          </View>
        ) : !patientId ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.subtitle}>Select a Patient</Text>
              <Text style={styles.description}>Choose a patient to view their tasks.</Text>
            </Card.Content>
          </Card>
        ) : tasks.length === 0 ? (
          <Card style={styles.card}> 
            <Card.Content>
              <Text style={styles.subtitle}>No tasks yet</Text>
              <Text style={styles.description}>Create a task to get started.</Text>
            </Card.Content>
          </Card>
        ) : (
          tasks.map(task => (
            <Card key={task._id} style={styles.card}>
              <Card.Title title={task.title} subtitle={`Due ${moment(task.dueDate).format('MMM D, h:mm A')}`} right={(props) => (
                <IconButton {...props} icon="delete" onPress={() => handleDelete(task._id)} />
              )} />
              <Card.Content>
                {!!task.description && <Text style={styles.desc}>{task.description}</Text>}
                <View style={styles.row}>
                  <Chip style={styles.chip}>{task.category}</Chip>
                  <Chip style={styles.chip}>{task.priority}</Chip>
                  {task.completed ? (
                    <Chip icon="check" style={styles.doneChip}>Completed</Chip>
                  ) : (
                    <Chip icon="clock" style={styles.pendingChip}>Pending</Chip>
                  )}
                </View>
                {task.completedAt && (
                  <Text style={styles.statusText}>
                    Completed at: {moment(task.completedAt).format('MMM D, h:mm A')}
                  </Text>
                )}
                {task.completionNotes && (
                  <Text style={styles.statusText}>
                    Notes: {task.completionNotes}
                  </Text>
                )}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => openEdit(task)}>Edit</Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreate} disabled={!patientId} />

      <Portal>
        <Dialog visible={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Title>{editingId ? 'Edit Task' : 'New Task'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={form.title}
              onChangeText={(v) => setForm({ ...form, title: v })}
              style={styles.input}
            />
            <HelperText type="error" visible={!form.title}>Title is required</HelperText>
            <TextInput
              label="Description"
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              style={styles.input}
              multiline
            />
            <View style={styles.row}>
              <Button onPress={() => setShowDatePicker(true)}>Select Date</Button>
              <Button onPress={() => setShowTimePicker(true)}>Select Time</Button>
            </View>
            <Text style={styles.dateText}>{moment(form.dueDate).format('MMM D, YYYY h:mm A')}</Text>
            {showDatePicker && (
              <DateTimePicker
                value={form.dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={form.dueDate}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
            <View style={styles.row}>
              <Chip selected={form.priority === 'low'} onPress={() => setForm({ ...form, priority: 'low' })}>low</Chip>
              <Chip selected={form.priority === 'medium'} onPress={() => setForm({ ...form, priority: 'medium' })}>medium</Chip>
              <Chip selected={form.priority === 'high'} onPress={() => setForm({ ...form, priority: 'high' })}>high</Chip>
            </View>
            <View style={styles.row}>
              {['medication','appointment','exercise','social','personal','other'].map(cat => (
                <Chip key={cat} selected={form.category === cat} onPress={() => setForm({ ...form, category: cat })} style={styles.chip}>{cat}</Chip>
              ))}
            </View>
            <TextInput
              label="Notes"
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
              style={styles.input}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowForm(false)}>Cancel</Button>
            <Button loading={saving} onPress={handleSave} disabled={!form.title || !form.dueDate}>{editingId ? 'Update' : 'Create'}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  subtitle: {
    fontSize: typography.h6,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  desc: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
  },
  doneChip: {
    backgroundColor: colors.success,
  },
  pendingChip: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  dateText: {
    fontSize: typography.body,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});

export default CaregiverTasksScreen;