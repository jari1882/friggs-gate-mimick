import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFriggState } from '../hooks/useFriggState';

export function SettingsScreen() {
  const {
    isDarkMode,
    toggleTheme,
    isLLMIntegrationEnabled,
    toggleLLMIntegration
  } = useFriggState();

  const theme = {
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    cardBackground: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    border: isDarkMode ? '#444444' : '#e1e1e1'
  };

  const showAbout = () => {
    Alert.alert(
      "About Frigg's Gate",
      "Mobile interface to the Life Nervous System cognitive architecture.\n\nVersion: 1.0.0",
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Appearance
        </Text>

        <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Integration
        </Text>

        <View style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                LLM Integration
              </Text>
              <Text style={[styles.settingDescription, { color: theme.text, opacity: 0.7 }]}>
                Enable advanced language model features
              </Text>
            </View>
            <Switch
              value={isLLMIntegrationEnabled}
              onValueChange={toggleLLMIntegration}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isLLMIntegrationEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          About
        </Text>

        <TouchableOpacity
          style={[styles.settingCard, { backgroundColor: theme.cardBackground }]}
          onPress={showAbout}
        >
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              About Frigg's Gate
            </Text>
            <Text style={[styles.chevron, { color: theme.text }]}>›</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4
  },
  settingCard: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 16
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingInfo: {
    flex: 1,
    marginRight: 12
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300'
  }
});