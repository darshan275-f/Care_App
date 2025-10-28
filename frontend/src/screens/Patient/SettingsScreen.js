import React from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, componentStyles } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
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
              title="Notifications"
              description="Manage your notification preferences"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Accessibility"
              description="Font size, contrast, and other accessibility options"
              left={(props) => <List.Icon {...props} icon="accessibility" />}
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

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emergencyTitle}>My Caregivers</Text>
            {user?.linkedCaregivers && user.linkedCaregivers.length > 0 ? (
              user.linkedCaregivers.map((caregiver, index) => (
                <List.Item
                  key={index}
                  title={caregiver.name}
                  description={caregiver.contactNumber || 'No contact number provided'}
                  left={(props) => <List.Icon {...props} icon="account-heart" color="#27ae60" />}
                  right={(props) => caregiver.contactNumber ? <List.Icon {...props} icon="phone" /> : null}
                  onPress={() => {
                    if (caregiver.contactNumber) {
                      // Handle calling caregiver
                      Alert.alert('Call Caregiver', `Call ${caregiver.name} at ${caregiver.contactNumber}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Call', onPress: () => {/* Handle phone call */} }
                      ]);
                    }
                  }}
                />
              ))
            ) : (
              <Text style={styles.noCaregiversText}>No caregivers linked yet</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            <List.Item
              title="Emergency Services"
              description="Call 911 for medical emergencies"
              left={(props) => <List.Icon {...props} icon="phone" color="#e74c3c" />}
              right={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {/* Handle emergency call */}}
            />
            <List.Item
              title="Poison Control"
              description="1-800-222-1222"
              left={(props) => <List.Icon {...props} icon="phone" color="#e67e22" />}
              right={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {/* Handle poison control call */}}
            />
            <List.Item
              title="Suicide Prevention"
              description="988 - Crisis Lifeline"
              left={(props) => <List.Icon {...props} icon="phone" color="#9b59b6" />}
              right={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {/* Handle crisis call */}}
            />
            <List.Item
              title="Mental Health Crisis"
              description="1-800-950-NAMI (6264)"
              left={(props) => <List.Icon {...props} icon="phone" color="#3498db" />}
              right={(props) => <List.Icon {...props} icon="phone" />}
              onPress={() => {/* Handle mental health call */}}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...componentStyles.container,
    backgroundColor: colors.patient.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    ...componentStyles.card,
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
  },
  noCaregiversText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
