import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const DebugInfo = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>
      <Text style={styles.text}>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>User Role: {user?.role || 'None'}</Text>
      <Text style={styles.text}>User Name: {user?.name || 'None'}</Text>
      <Text style={styles.text}>Linked Patients Count: {user?.linkedPatients?.length || 0}</Text>
      {user?.linkedPatients?.map((patient, index) => (
        <Text key={index} style={styles.text}>
          Patient {index + 1}: {patient.name} (ID: {patient._id})
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default DebugInfo;
