import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, Menu, Button, Text } from 'react-native-paper';
import { colors, spacing, typography } from '../config/theme';

const PatientPicker = ({ patients, selectedPatientId, onChange, label = 'Select Patient' }) => {
  const [visible, setVisible] = React.useState(false);
  const selected = patients?.find(p => p._id === selectedPatientId) || null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setVisible(true)}>
            {selected ? `${selected.name} (@${selected.username})` : 'Choose patient'}
          </Button>
        }
      >
        {(patients || []).map(p => (
          <Menu.Item
            key={p._id}
            onPress={() => {
              onChange(p._id);
              setVisible(false);
            }}
            title={`${p.name} (@${p.username})`}
          />
        ))}
      </Menu>
      {!patients || patients.length === 0 ? (
        <HelperText type="info" visible>
          Link a patient in profile to manage their data.
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default PatientPicker;


