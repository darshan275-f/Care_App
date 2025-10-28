import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
  List,
  Avatar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, componentStyles } from '../../config/theme';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const result = await updateProfile({ name: formData.name.trim() });
    if (result.success) {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    return role === 'patient' ? colors.patient.primary : colors.caregiver.primary;
  };

  const getRoleIcon = (role) => {
    return role === 'patient' ? 'account-heart' : 'account-supervisor';
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>
              <View style={styles.avatarSection}>
                <Avatar.Icon
                  size={80}
                  icon={getRoleIcon(user.role)}
                  style={[styles.avatar, { backgroundColor: getRoleColor(user.role) }]}
                />
                <View style={styles.profileInfo}>
                  {isEditing ? (
                    <TextInput
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      mode="outlined"
                      style={styles.nameInput}
                    />
                  ) : (
                    <Title style={styles.name}>{user.name}</Title>
                  )}
                  <Chip
                    icon={getRoleIcon(user.role)}
                    style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) }]}
                    textStyle={styles.roleChipText}
                  >
                    {user.role && typeof user.role === 'string' ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                  </Chip>
                </View>
              </View>

              <View style={styles.profileActions}>
                {isEditing ? (
                  <View style={styles.editActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setIsEditing(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSaveProfile}
                      style={styles.saveButton}
                    >
                      Save
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => setIsEditing(true)}
                    style={styles.editButton}
                    icon="pencil"
                  >
                    Edit Profile
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.cardTitle}>Account Information</Title>
              
              <List.Item
                title="Email"
                description={user.email}
                left={(props) => <List.Icon {...props} icon="email" />}
                style={styles.listItem}
              />
              
              {user.username && (
                <List.Item
                  title="Username"
                  description={user.username}
                  left={(props) => <List.Icon {...props} icon="account" />}
                  style={styles.listItem}
                />
              )}
              
              <List.Item
                title="Member Since"
                description={new Date(user.createdAt).toLocaleDateString()}
                left={(props) => <List.Icon {...props} icon="calendar" />}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>
        </Animatable.View>

        {user.role === 'caregiver' && user.linkedPatients && user.linkedPatients.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Linked Patients</Title>
                {user.linkedPatients.map((patient, index) => (
                  <List.Item
                    key={index}
                    title={patient.name}
                    description={patient.username}
                    left={(props) => <List.Icon {...props} icon="account-heart" />}
                    style={styles.listItem}
                  />
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {user.role === 'patient' && user.linkedCaregivers && user.linkedCaregivers.length > 0 && (
          <Animatable.View animation="fadeInUp" duration={1000} delay={600}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Title style={styles.cardTitle}>Linked Caregivers</Title>
                {user.linkedCaregivers.map((caregiver, index) => (
                  <List.Item
                    key={index}
                    title={caregiver.name}
                    description={caregiver.email}
                    left={(props) => <List.Icon {...props} icon="account-supervisor" />}
                    style={styles.listItem}
                  />
                ))}
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        <Animatable.View animation="fadeInUp" duration={1000} delay={900}>
          <Card style={styles.dangerCard}>
            <Card.Content>
              <Title style={styles.dangerTitle}>Account Actions</Title>
              <Paragraph style={styles.dangerText}>
                Sign out of your account on this device
              </Paragraph>
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor={colors.error}
                icon="logout"
              >
                Sign Out
              </Button>
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    ...componentStyles.centerContent,
  },
  profileCard: {
    ...componentStyles.card,
    marginBottom: spacing.lg,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: typography.h3,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  nameInput: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  roleChipText: {
    color: colors.surface,
    fontWeight: typography.medium,
  },
  profileActions: {
    width: '100%',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  editButton: {
    borderColor: colors.primary,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  infoCard: {
    ...componentStyles.card,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.sm,
  },
  dangerCard: {
    ...componentStyles.card,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  dangerTitle: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  dangerText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.body,
  },
  logoutButton: {
    borderColor: colors.error,
  },
});

export default ProfileScreen;
