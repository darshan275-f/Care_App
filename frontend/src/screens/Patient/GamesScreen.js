import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, componentStyles, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { gameService } from '../../services/apiService';

// Simple Memory Match (2x4)
function generateMemoryDeck() {
  const base = ['🍎','🎈','🐶','⭐'];
  const deck = [...base, ...base]
    .map((v) => ({ v, id: Math.random().toString(36).slice(2), flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

const GamesScreen = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('memory-match');
  const [saving, setSaving] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [recentStats, setRecentStats] = useState([]);

  // Memory state
  const [deck, setDeck] = useState(generateMemoryDeck());
  const [firstPick, setFirstPick] = useState(null);
  const [secondPick, setSecondPick] = useState(null);
  const [moves, setMoves] = useState(0);
  const matchedCount = deck.filter(c => c.matched).length;

  // Sequence Recall state
  const colorsSeq = useMemo(() => ['#e74c3c','#27ae60','#2980b9','#f1c40f'], []);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [level, setLevel] = useState(1);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [active]);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await gameService.getStats(user._id, { gameType: active, days: 7 });
      if (res.success) {
        setRecentStats(res.data.stats || res.data?.data?.stats || []);
      } else {
        setRecentStats([]);
      }
    } catch {
      setRecentStats([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const saveStats = async (payload) => {
    try {
      setSaving(true);
      await gameService.saveStats({ patientId: user._id, ...payload });
      await loadStats();
    } catch (e) {
      Alert.alert('Error', 'Failed to save game stats');
    } finally {
      setSaving(false);
    }
  };

  // Memory Match logic
  const onFlip = (card) => {
    if (card.flipped || card.matched || showing) return;
    const newDeck = deck.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    setDeck(newDeck);
    if (!firstPick) {
      setFirstPick(card);
    } else if (!secondPick) {
      setSecondPick(card);
      setMoves(m => m + 1);
      setTimeout(() => {
        const [a, b] = [firstPick, card];
        if (a.v === b.v) {
          setDeck(d => d.map(c => (c.id === a.id || c.id === b.id) ? { ...c, matched: true } : c));
        } else {
          setDeck(d => d.map(c => (c.id === a.id || c.id === b.id) ? { ...c, flipped: false } : c));
        }
        setFirstPick(null);
        setSecondPick(null);
      }, 600);
    }
  };

  useEffect(() => {
    if (matchedCount === deck.length && deck.length > 0 && active === 'memory-match') {
      const score = Math.max(0, 100 - (moves - 8) * 10);
      saveStats({ gameType: 'memory-match', score, maxScore: 100, duration: moves * 2, level: 1, difficulty: 'easy', accuracy: 100, attempts: moves, hintsUsed: 0 });
    }
  }, [matchedCount]);

  const resetMemory = () => {
    setDeck(generateMemoryDeck());
    setFirstPick(null);
    setSecondPick(null);
    setMoves(0);
  };

  // Sequence Recall logic
  const startSequence = async () => {
    if (sequence.length === 0) {
      // Start with first color
      const firstColor = Math.floor(Math.random() * colorsSeq.length);
      setSequence([firstColor]);
      setUserInput([]);
      setShowing(true);
      // Show sequence briefly
      await new Promise(r => setTimeout(r, 800));
      setShowing(false);
    } else {
      // Add next color to sequence
      const next = [...sequence, Math.floor(Math.random() * colorsSeq.length)];
      setSequence(next);
      setUserInput([]);
      setShowing(true);
      // Show sequence briefly
      await new Promise(r => setTimeout(r, 600 + next.length * 300));
      setShowing(false);
    }
  };

  const pressColor = async (idx) => {
    if (showing) return;
    const current = [...userInput, idx];
    setUserInput(current);
    const expected = sequence.slice(0, current.length);
    const correctSoFar = expected.every((v, i) => v === current[i]);
    
    if (!correctSoFar) {
      // Game over
      const score = Math.round((sequence.length - 1) * 15);
      await saveStats({ 
        gameType: 'sequence-recall', 
        score, 
        maxScore: 100, 
        duration: sequence.length * 2, 
        level, 
        difficulty: 'easy', 
        accuracy: Math.round((current.length-1)/Math.max(1,sequence.length-1)*100), 
        attempts: current.length, 
        hintsUsed: 0 
      });
      setSequence([]);
      setUserInput([]);
      setLevel(1);
      Alert.alert('Game Over', `You reached level ${level}! Final score: ${score}`);
      return;
    }
    
    if (current.length === sequence.length) {
      // Level completed, move to next level
      const newLevel = level + 1;
      setLevel(newLevel);
      await saveStats({ 
        gameType: 'sequence-recall', 
        score: Math.min(100, sequence.length * 15), 
        maxScore: 100, 
        duration: sequence.length * 2, 
        level: newLevel, 
        difficulty: 'easy', 
        accuracy: 100, 
        attempts: sequence.length, 
        hintsUsed: 0 
      });
      // Start next sequence
      setTimeout(() => startSequence(), 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cognitive Games</Text>
        <View style={styles.row}>
          <Chip selected={active==='memory-match'} onPress={() => setActive('memory-match')} style={styles.chip}>Memory Match</Chip>
          <Chip selected={active==='sequence-recall'} onPress={() => setActive('sequence-recall')} style={styles.chip}>Sequence Recall</Chip>
        </View>

        {active === 'memory-match' ? (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.grid}>
                {deck.map((c) => (
                  <TouchableOpacity key={c.id} style={[styles.cardTile, c.flipped || c.matched ? styles.tileOn : styles.tileOff]} onPress={() => onFlip(c)}>
                    <Text style={styles.tileText}>{(c.flipped || c.matched) ? c.v : '?'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.desc}>Moves: {moves}</Text>
                <Button mode="outlined" onPress={resetMemory}>Reset</Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.desc}>Level: {level}</Text>
              <View style={styles.seqRow}>
                {colorsSeq.map((clr, idx) => (
                  <TouchableOpacity key={idx} style={[styles.seqBtn, { backgroundColor: clr, opacity: showing ? 0.7 : 1 }]} onPress={() => pressColor(idx)} />
                ))}
              </View>
              <Button mode="contained" onPress={startSequence} disabled={showing} style={styles.mtSm}>
                {sequence.length === 0 ? 'Start Game' : 'Next Level'}
              </Button>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.subtitle}>Recent Stats</Text>
            {loadingStats ? (
              <ActivityIndicator />
            ) : recentStats.length === 0 ? (
              <Text style={styles.description}>No recent stats</Text>
            ) : (
              recentStats.slice(0,5).map((s, i) => (
                <Text key={i} style={styles.statLine}>{`${s.gameType} • score ${s.score}/${s.maxScore} • ${new Date(s.date || s.createdAt).toLocaleDateString()}`}</Text>
              ))
            )}
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
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  card: { ...componentStyles.card, marginBottom: spacing.md },
  title: { fontSize: typography.h4, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.md },
  subtitle: { fontSize: typography.h6, color: colors.primary, marginBottom: spacing.xs },
  description: { fontSize: typography.body, color: colors.textSecondary },
  desc: { fontSize: typography.body, color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  chip: { marginRight: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardTile: { width: '23%', aspectRatio: 1, marginBottom: spacing.sm, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tileOn: { backgroundColor: colors.surface },
  tileOff: { backgroundColor: colors.background },
  tileText: { fontSize: 24 },
  seqRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  seqBtn: { width: '23%', aspectRatio: 1, borderRadius: 8 },
  mtSm: { marginTop: spacing.sm },
  statLine: { fontSize: typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});

export default GamesScreen;
