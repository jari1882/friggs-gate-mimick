import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFriggState } from '../hooks/useFriggState';
import { useWebSocket } from '../hooks/useWebSocket';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { isDarkMode } = useFriggState();
  const { sendMessage, isConnected, status } = useWebSocket();

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isConnected) {
      Alert.alert('Connection Error', 'Not connected to server. Please check your connection.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Scroll to bottom after adding message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendMessage(input.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Scroll to bottom after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Send failed:', error);
      Alert.alert('Send Failed', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const theme = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    inputBackground: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    placeholder: isDarkMode ? '#888888' : '#666666',
    border: isDarkMode ? '#444444' : '#e1e1e1'
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            What Can the{' '}
            <Text style={styles.highlight}>life-nervous-system</Text>
            {' '}Do for You?
          </Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
            ]} />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.placeholder }]}>
                Start a conversation with the Life Nervous System
              </Text>
            </View>
          ) : (
            messages.map((message) => (
              <View key={message.id} style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  { color: message.role === 'user' ? '#ffffff' : '#000000' }
                ]}>
                  {message.content}
                </Text>
              </View>
            ))
          )}
          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantMessage]}>
              <ActivityIndicator size="small" color="#666666" />
              <Text style={[styles.messageText, { color: '#666666', marginLeft: 8 }]}>
                Thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }]}
              value={input}
              onChangeText={setInput}
              placeholder="Remember, you can type /help at any time..."
              placeholderTextColor={theme.placeholder}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: (isConnected && input.trim()) ? 1 : 0.5 }
              ]}
              onPress={handleSend}
              disabled={!isConnected || !input.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24
  },
  highlight: {
    color: '#548dd4',
    fontWeight: 'bold'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize'
  },
  messagesContainer: { flex: 1 },
  messagesContent: {
    padding: 16,
    flexGrow: 1
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  messageBubble: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end'
  },
  assistantMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    flex: 1
  },
  inputContainer: {
    borderTopWidth: 1,
    backgroundColor: 'transparent'
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end'
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    borderWidth: 1
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  }
});