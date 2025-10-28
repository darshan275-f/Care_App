import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Card, List, Dialog, Portal, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/apiService';

const CaregiverSettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateContact = async () => {
    try {
      setSaving(true);
      const result = await authService.updateProfile({ contactNumber });
      if (result.success) {
        setUser({ ...user, contactNumber });
        setShowContactDialog(false);
        Alert.alert('Success', 'Contact number updated successfully');
      } else {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update contact number');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Profile"
              description="View and edit your profile information"
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Profile')}
            />
            <List.Item
              title="Contact Number"
              description={user?.contactNumber || 'No contact number set'}
              left={(props) => <List.Icon {...props} icon="phone" color="#27ae60" />}
              right={(props) => <List.Icon {...props} icon="pencil" />}
              onPress={() => setShowContactDialog(true)}
            />
            <List.Item
              title="Patient Management"
              description="Manage linked patients"
              left={(props) => <List.Icon {...props} icon="account-group" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Privacy & Security"
              description="Manage your privacy settings"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>
      </View>

      <Portal>
        <Dialog visible={showContactDialog} onDismiss={() => setShowContactDialog(false)}>
          <Dialog.Title>Update Contact Number</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <Text style={styles.helpText}>
              This number will be visible to your linked patients for emergency contact.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowContactDialog(false)}>Cancel</Button>
            <Button 
              loading={saving} 
              onPress={handleUpdateContact}
              disabled={!contactNumber.trim()}
            >
              Update
            </Button>
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    ...componentStyles.card,
  },
  input: {
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default CaregiverSettingsScreen;
