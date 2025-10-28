import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, HelperText, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import PatientPicker from '../../components/PatientPicker';
import { medicationService } from '../../services/apiService';
import notificationService from '../../services/notificationService';
import moment from 'moment';

const emptyForm = {
  name: '',
  dosage: '',
  scheduleType: 'daily',
  times: [{ hour: 9, minute: 0 }],
  days: [],
  notes: '',
};

const CaregiverMedicationsScreen = () => {
  const { user } = useAuth();
  const linkedPatients = useMemo(() => user?.linkedPatients || [], [user]);
  const [patientId, setPatientId] = useState(linkedPatients[0]?._id || null);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);


  useEffect(() => {
    if (linkedPatients.length > 0 && !patientId) {
      setPatientId(linkedPatients[0]._id);
    }
  }, [linkedPatients, patientId]);

  useEffect(() => {
    if (patientId) {
      loadMeds();
    }
  }, [patientId]);

  const loadMeds = async () => {
    if (!patientId) {
      setMeds([]);
      return;
    }
    
    try {
      setLoading(true);
      const res = await medicationService.getByPatient(patientId, true);
      if (res.success) {
        setMeds(res.data.medications || res.data?.data?.medications || []);
      } else {
        setMeds([]);
      }
    } catch (e) {
      setMeds([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditingId(med._id);
    setForm({
      name: med.name,
      dosage: med.dosage,
      scheduleType: med.schedule?.type || 'daily',
      times: med.schedule?.times?.length ? med.schedule.times : [{ hour: 9, minute: 0 }],
      days: med.schedule?.days || [],
      notes: med.notes || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!patientId) return;
    if (!form.name || !form.dosage) return;
    try {
      setSaving(true);
      const payload = {
        patientId,
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        schedule: {
          type: form.scheduleType,
          times: form.times.filter(t => t.hour >= 0 && t.hour <= 23 && t.minute >= 0 && t.minute <= 59),
          days: form.days || [],
        },
        notes: form.notes.trim() || undefined,
      };
      const res = editingId
        ? await medicationService.update(editingId, payload)
        : await medicationService.create(payload);
      if (res.success) {
        // Schedule notifications for new medication
        if (!editingId && res.data?.medication) {
          try {
            await notificationService.scheduleMedicationNotifications(res.data.medication);
            console.log('Notifications scheduled for medication');
          } catch (notifError) {
            console.error('Failed to schedule notifications:', notifError);
            // Don't fail the medication creation
          }
        }
        
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        await loadMeds();
        Alert.alert('Success', editingId ? 'Medication updated' : 'Medication created with notifications');
      } else {
        Alert.alert('Error', res.error.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save medication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Medication', 'Are you sure you want to delete this medication?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await medicationService.delete(id);
            if (res.success) {
              await loadMeds();
            } else {
              Alert.alert('Error', res.error.message);
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to delete medication');
          }
        }
      }
    ]);
  };

  const addTime = () => setForm({ ...form, times: [...form.times, { hour: 9, minute: 0 }] });
  const updateTime = (idx, key, val) => {
    const times = [...form.times];
    times[idx] = { ...times[idx], [key]: Number(val) };
    setForm({ ...form, times });
  };
  const removeTime = (idx) => setForm({ ...form, times: form.times.filter((_, i) => i !== idx) });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Medication Management</Text>
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
              <Text style={styles.description}>Choose a patient to view their medications.</Text>
            </Card.Content>
          </Card>
        ) : meds.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.subtitle}>No medications yet</Text>
              <Text style={styles.description}>Add a medication to get started.</Text>
            </Card.Content>
          </Card>
        ) : (
          meds.map(med => {
            // Get today's status for this medication
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStatus = med.takenDates?.find(td => 
              new Date(td.date).setHours(0, 0, 0, 0) === today.getTime()
            );
            
            const getStatusChip = () => {
              if (todayStatus?.taken) {
                return <Chip icon="check" style={styles.takenChip}>Taken</Chip>;
              } else if (todayStatus?.skipped) {
                return <Chip icon="close" style={styles.skippedChip}>Skipped</Chip>;
              } else {
                return <Chip icon="clock" style={styles.pendingChip}>Pending</Chip>;
              }
            };

            return (
              <Card key={med._id} style={styles.card}>
                <Card.Title title={`${med.name} (${med.dosage})`} subtitle={`Created ${moment(med.createdAt).format('MMM D, YYYY')}`} right={(props) => (
                  <IconButton {...props} icon="delete" onPress={() => handleDelete(med._id)} />
                )} />
                <Card.Content>
                  <View style={styles.row}>
                    <Chip style={styles.chip}>{med.schedule?.type || 'daily'}</Chip>
                    {(med.schedule?.times || []).map((t, i) => (
                      <Chip key={i} style={styles.chip}>{`${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`}</Chip>
                    ))}
                    {getStatusChip()}
                  </View>
                  {!!med.notes && <Text style={styles.desc}>{med.notes}</Text>}
                  {todayStatus?.takenAt && (
                    <Text style={styles.statusText}>
                      Taken at: {moment(todayStatus.takenAt).format('h:mm A')}
                    </Text>
                  )}
                  {todayStatus?.notes && (
                    <Text style={styles.statusText}>
                      Notes: {todayStatus.notes}
                    </Text>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => openEdit(med)}>Edit</Button>
                </Card.Actions>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={openCreate} disabled={!patientId} />

      <Portal>
        <Dialog visible={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Title>{editingId ? 'Edit Medication' : 'New Medication'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              style={styles.input}
            />
            <HelperText type="error" visible={!form.name}>Name is required</HelperText>
            <TextInput
              label="Dosage"
              value={form.dosage}
              onChangeText={(v) => setForm({ ...form, dosage: v })}
              style={styles.input}
            />
            <HelperText type="error" visible={!form.dosage}>Dosage is required</HelperText>

            <View style={styles.row}>
              {['daily','weekly','as-needed'].map(t => (
                <Chip key={t} selected={form.scheduleType === t} onPress={() => setForm({ ...form, scheduleType: t })} style={styles.chip}>{t}</Chip>
              ))}
            </View>

            <Text style={styles.section}>Times</Text>
            {form.times.map((t, idx) => (
              <View key={idx} style={styles.timeRow}>
                <TextInput
                  label="Hour"
                  keyboardType="numeric"
                  value={String(t.hour)}
                  onChangeText={(v) => updateTime(idx, 'hour', v)}
                  style={styles.timeInput}
                />
                <TextInput
                  label="Minute"
                  keyboardType="numeric"
                  value={String(t.minute)}
                  onChangeText={(v) => updateTime(idx, 'minute', v)}
                  style={styles.timeInput}
                />
                <IconButton icon="delete" onPress={() => removeTime(idx)} />
              </View>
            ))}
            <Button onPress={addTime}>Add Time</Button>

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
            <Button loading={saving} onPress={handleSave} disabled={!form.name || !form.dosage}>{editingId ? 'Update' : 'Create'}</Button>
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
    marginTop: spacing.xs,
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
  takenChip: {
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  skippedChip: {
    backgroundColor: colors.error,
    marginRight: spacing.xs,
  },
  pendingChip: {
    backgroundColor: colors.warning,
    marginRight: spacing.xs,
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
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInput: {
    flex: 1,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});

export default CaregiverMedicationsScreen;
