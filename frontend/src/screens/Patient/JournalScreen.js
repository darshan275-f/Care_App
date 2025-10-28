import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Button, FAB, Dialog, Portal, TextInput, HelperText, Chip, Switch, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { patientService, journalService } from '../../services/apiService';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import moment from 'moment';

const emptyForm = { text: '', mood: 'neutral', tags: '', isPrivate: false, imageUrl: '' };

const JournalScreen = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const res = await patientService.getJournalEntries(user._id, { limit: 50 });
      if (res.success) {
        setEntries(res.data.entries || res.data?.data?.entries || []);
      } else {
        Alert.alert('Error', res.error.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.text) return;
    try {
      setSaving(true);
      const payload = {
        patientId: user._id,
        text: form.text.trim(),
        imageUrl: form.imageUrl?.trim() || undefined,
        mood: form.mood,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isPrivate: !!form.isPrivate,
      };
      const res = await journalService.create(payload);
      if (res.success) {
        setShowForm(false);
        setForm(emptyForm);
        await loadEntries();
        Alert.alert('Success', 'Journal entry added');
      } else {
        Alert.alert('Error', res.error.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!form.imageUrl) {
      Alert.alert('Info', 'Provide a local image URI or remote URL to upload');
      return;
    }
    try {
      setSaving(true);
      const url = await uploadImageToCloudinary(form.imageUrl);
      setForm({ ...form, imageUrl: url });
      Alert.alert('Uploaded', 'Image uploaded to Cloudinary');
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Journal</Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.patient.primary} />
          </View>
        ) : entries.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.subtitle}>No entries yet</Text>
              <Text style={styles.description}>Add your first entry.</Text>
            </Card.Content>
          </Card>
        ) : (
          entries.map(entry => (
            <Card key={entry._id} style={styles.card}>
              <Card.Title title={moment(entry.createdAt).format('MMM D, YYYY h:mm A')} subtitle={`Mood: ${entry.mood}`} />
              <Card.Content>
                <Text style={styles.entryText}>{entry.text}</Text>
                {!!entry.imageUrl && (
                  <Image source={{ uri: entry.imageUrl }} style={styles.image} />
                )}
                {!!entry.tags && entry.tags.length > 0 && (
                  <View style={styles.row}>
                    {entry.tags.map((t, i) => (<Chip key={i} style={styles.chip}>#{t}</Chip>))}
                  </View>
                )}
                {entry.isPrivate ? <Chip style={styles.privateChip}>Private</Chip> : null}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />

      <Portal>
        <Dialog visible={showForm} onDismiss={() => setShowForm(false)}>
          <Dialog.Title>New Entry</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="What's on your mind?"
              value={form.text}
              onChangeText={(v) => setForm({ ...form, text: v })}
              style={styles.input}
              multiline
            />
            <HelperText type="error" visible={!form.text}>Text is required</HelperText>
            <View style={styles.row}>
              {['very-happy','happy','neutral','sad','very-sad'].map(m => (
                <Chip key={m} selected={form.mood === m} onPress={() => setForm({ ...form, mood: m })} style={styles.chip}>{m}</Chip>
              ))}
            </View>
            <TextInput
              label="Tags (comma separated)"
              value={form.tags}
              onChangeText={(v) => setForm({ ...form, tags: v })}
              style={styles.input}
            />
            <View style={styles.rowBetween}>
              <Text style={styles.switchLabel}>Private</Text>
              <Switch value={form.isPrivate} onValueChange={(v) => setForm({ ...form, isPrivate: v })} />
            </View>
            <TextInput
              label="Image URL or local URI"
              value={form.imageUrl}
              onChangeText={(v) => setForm({ ...form, imageUrl: v })}
              style={styles.input}
            />
            <Button onPress={handleUpload} loading={saving} disabled={!form.imageUrl}>Upload to Cloudinary</Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowForm(false)}>Cancel</Button>
            <Button loading={saving} onPress={handleSave} disabled={!form.text}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.patient.background,
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
  entryText: {
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  chip: {
    marginRight: spacing.xs,
  },
  privateChip: {
    backgroundColor: colors.warning,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  switchLabel: {
    fontSize: typography.body,
    color: colors.text,
  },
});

export default JournalScreen;
