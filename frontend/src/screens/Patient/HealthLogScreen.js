import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Card, Title, Paragraph, ProgressBar } from "react-native-paper";

export default function HealthDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [heartRate, setHeartRate] = useState(72);
  const [steps, setSteps] = useState(4500);
  const [dailyGoal, setDailyGoal] = useState(8000);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setHeartRate(Math.floor(Math.random() * (100 - 60 + 1)) + 60);
      setSteps(Math.floor(Math.random() * 8000));
      setRefreshing(false);
    }, 1000);
  };

  const progress = steps / dailyGoal;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>📅 Daily Health Log</Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>❤️ Heart Rate</Title>
            <Paragraph>{heartRate} bpm</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>👣 Steps</Title>
            <Paragraph>{steps} / {dailyGoal}</Paragraph>
            <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.tipCard}>
        <Card.Content>
          <Title>🧘 Daily Tip</Title>
          <Paragraph>
            Stay hydrated and take a 10-minute walk to refresh your mind!
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const spacing = {
  sm: 10,
  md: 16,
  lg: 24,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  grid: {
    flexDirection: "column", // 👈 changed from 'row' to 'column'
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: "#fff",
  },
  tipCard: {
    marginTop: spacing.lg,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    elevation: 2,
  },
  progressBar: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
  },
});
