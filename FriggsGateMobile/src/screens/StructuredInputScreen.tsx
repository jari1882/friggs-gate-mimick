import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFriggState } from '../hooks/useFriggState';
import { useWebSocket } from '../hooks/useWebSocket';

export function StructuredInputScreen() {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isDarkMode } = useFriggState();
  const { sendMessage, isConnected } = useWebSocket();

  const tools = [
    { id: 'analyze', name: 'Analyze', description: 'Deep analysis of text or data' },
    { id: 'summarize', name: 'Summarize', description: 'Create concise summaries' },
    { id: 'transform', name: 'Transform', description: 'Convert or restructure content' },
    { id: 'generate', name: 'Generate', description: 'Create new content based on input' }
  ];

  const theme = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    inputBackground: isDarkMode ? '#333333' : '#ffffff',
    border: isDarkMode ? '#444444' : '#e1e1e1',
    placeholder: isDarkMode ? '#888888' : '#666666'
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setOutput('');
  };

  const handleSubmit = async () => {
    if (!selectedTool || !input.trim()) {
      Alert.alert('Error', 'Please select a tool and enter some input.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Connection Error', 'Not connected to server.');
      return;
    }

    setIsLoading(true);
    setOutput('');

    try {
      const prompt = `[${selectedTool.toUpperCase()}] ${input.trim()}`;
      const response = await sendMessage(prompt);
      setOutput(response);
    } catch (error) {
      console.error('Tool execution failed:', error);
      Alert.alert('Error', 'Failed to execute tool. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setSelectedTool('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.title, { color: theme.text }]}>
          Structured Tools
        </Text>
        <Text style={[styles.subtitle, { color: theme.placeholder }]}>
          Select a tool and provide input for focused AI assistance
        </Text>

        {/* Tool Selection */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Select Tool
        </Text>
        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolCard,
                {
                  backgroundColor: selectedTool === tool.id ? '#007AFF' : theme.cardBackground,
                  borderColor: theme.border
                }
              ]}
              onPress={() => handleToolSelect(tool.id)}
            >
              <Text style={[
                styles.toolName,
                { color: selectedTool === tool.id ? '#ffffff' : theme.text }
              ]}>
                {tool.name}
              </Text>
              <Text style={[
                styles.toolDescription,
                { color: selectedTool === tool.id ? '#ffffff' : theme.placeholder }
              ]}>
                {tool.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Input
        </Text>
        <TextInput
          style={[styles.inputArea, {
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={input}
          onChangeText={setInput}
          placeholder="Enter your text here..."
          placeholderTextColor={theme.placeholder}
          multiline
          textAlignVertical="top"
        />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.border }]}
            onPress={handleClear}
          >
            <Text style={[styles.clearButtonText, { color: theme.text }]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: (selectedTool && input.trim() && isConnected) ? 1 : 0.5 }
            ]}
            onPress={handleSubmit}
            disabled={!selectedTool || !input.trim() || !isConnected || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Processing...' : 'Execute'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Output Section */}
        {(output || isLoading) && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Output
            </Text>
            <View style={[styles.outputArea, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              {isLoading ? (
                <Text style={[styles.loadingText, { color: theme.placeholder }]}>
                  Processing your request...
                </Text>
              ) : (
                <Text style={[styles.outputText, { color: theme.text }]}>
                  {output}
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8
  },
  toolCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  toolDescription: {
    fontSize: 14,
    lineHeight: 18
  },
  inputArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  outputArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100
  },
  outputText: {
    fontSize: 16,
    lineHeight: 22
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});