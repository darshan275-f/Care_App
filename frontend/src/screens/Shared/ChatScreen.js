import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Card, Text, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/apiService';
import { colors, spacing, typography } from '../../config/theme';

const ChatBubble = ({ message, isOwn }) => {
  return (
    <View style={[styles.bubbleRow, isOwn ? styles.right : styles.left]}>
      {!isOwn && <Avatar.Text size={28} label={message.senderId?.name?.[0]?.toUpperCase() || '?'} style={styles.avatar} />}
      <Card style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Card.Content>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>{message.content}</Text>
          <Text style={styles.timeText}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const ChatScreen = ({ route }) => {
  const { user } = useAuth();
  const { peerId, peerName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  const loadMessages = async () => {
    const result = await chatService.getMessages(user._id, peerId, 200);
    if (result.success) {
      setMessages(result.data);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [peerId]);

  const send = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    await chatService.sendMessage(user._id, peerId, content);
    loadMessages();
  };

  const renderItem = ({ item }) => {
    const isOwn = item.senderId === user._id || item.senderId?._id === user._id;
    return <ChatBubble message={item} isOwn={isOwn} />;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder={`Message ${peerName || 'peer'}...`}
          value={text}
          onChangeText={setText}
          style={styles.input}
          outlineColor={colors.border}
        />
        <IconButton icon="send" size={26} onPress={send} iconColor={colors.surface} style={styles.sendBtn} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  avatar: { marginRight: spacing.xs, backgroundColor: colors.primary },
  bubble: { maxWidth: '80%', borderRadius: 16 },
  ownBubble: { backgroundColor: colors.patient?.primary || colors.primary },
  otherBubble: { backgroundColor: colors.surface },
  messageText: { fontSize: typography.body, lineHeight: typography.lineHeight?.body || 20 },
  ownText: { color: colors.surface },
  otherText: { color: colors.text },
  timeText: { marginTop: 6, fontSize: typography.caption, opacity: 0.7, textAlign: 'right', color: '#ffffffb3' },
  inputRow: { flexDirection: 'row', padding: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, marginRight: spacing.sm, backgroundColor: colors.background },
  sendBtn: { backgroundColor: colors.patient?.primary || colors.primary, margin: 0 },
});

export default ChatScreen;


