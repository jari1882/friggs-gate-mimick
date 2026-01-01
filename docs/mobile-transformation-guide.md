# FrigsGate Mobile Transformation Guide

> **Complete guide for transforming FrigsGate from web-based frontend to native mobile application**

## Table of Contents
1. [Why React Native + Expo](#why-react-native--expo)
2. [Environment Setup](#environment-setup)
3. [Project Creation](#project-creation)
4. [Code Migration](#code-migration)
5. [Mobile-Specific Features](#mobile-specific-features)
6. [Testing Strategies](#testing-strategies)
7. [App Store Deployment](#app-store-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Why React Native + Expo

**Industry Standard Reasoning:**
- **Code Reuse**: 70-80% of existing React/TypeScript code can be directly migrated
- **Single Codebase**: Deploy to both iOS and Android from one codebase
- **Performance**: Native performance vs hybrid app compromises
- **Ecosystem**: Largest mobile development ecosystem with extensive third-party support
- **Maintainability**: One team can maintain web and mobile versions

**Major Companies Using This Approach:**
Facebook, Instagram, Airbnb, Tesla, Bloomberg, Discord all use React Native for this exact scenario.

---

## Environment Setup

### Required Software Installation

#### 1. Node.js (if not already installed)
```bash
# Download from: https://nodejs.org/
# Choose LTS version (recommended)
```

#### 2. Expo CLI
```bash
# Install Expo CLI globally (using npm for global packages is more reliable)
npm install -g @expo/cli

# Verify installation
expo --version

# Alternative: If you prefer yarn, add yarn global bin to PATH
# yarn global add @expo/cli
# export PATH="$(yarn global bin):$PATH"
```

#### 3. Development Tools

**For iOS Development (Mac only):**
- Install Xcode from Mac App Store (free, ~15GB download)
- Accept Xcode license: `sudo xcodebuild -license accept`

**For Android Development (any OS):**
- Install Android Studio from: https://developer.android.com/studio
- During installation, ensure these components are selected:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device

#### 4. Mobile Testing Apps
- **iOS**: Download "Expo Go" from App Store
- **Android**: Download "Expo Go" from Google Play Store

---

## Project Creation

### Step 1: Create New Mobile Project

```bash
# Navigate to your projects directory
cd /path/to/your/projects

# Create new Expo project
npx create-expo-app FriggsGateMobile --template typescript

# Navigate into project
cd FriggsGateMobile

# Start development server
npx expo start
```

**What happens:** A QR code appears in terminal. Scan with your phone's camera to open in Expo Go app.

### Step 2: Install Dependencies

```bash
# Core navigation (essential for mobile apps)
yarn add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Expo-specific navigation dependencies
npx expo install react-native-screens react-native-safe-area-context

# State management (same as your web app)
yarn add zustand

# WebSocket and networking
yarn add react-native-url-polyfill

# UI and styling
yarn add react-native-elements react-native-svg
npx expo install react-native-svg

# Text processing (for markdown)
yarn add react-native-render-html

# Gestures and animations
npx expo install react-native-gesture-handler react-native-reanimated

# Device capabilities
npx expo install expo-device expo-application expo-constants

# Additional utilities
yarn add react-native-safe-area-context
```

### Step 3: Project Structure Setup

Create this folder structure:
```
FriggsGateMobile/
├── src/
│   ├── components/           # UI components
│   │   ├── ChatWindow.tsx
│   │   ├── StructuredInput.tsx
│   │   ├── StructuredOutput.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/               # State management
│   │   ├── useFriggState.ts
│   │   ├── useWorkspaceCoordinator.ts
│   │   └── useWebSocket.ts
│   ├── services/           # API/WebSocket
│   │   └── connectionService.ts
│   ├── navigation/         # App navigation
│   │   └── AppNavigator.tsx
│   ├── screens/           # Full-screen views
│   │   ├── ChatScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── StructuredInputScreen.tsx
│   ├── config/            # Configuration
│   │   ├── content.ts
│   │   └── theme.ts
│   └── types/             # TypeScript definitions
│       └── index.ts
├── assets/               # Images, fonts, etc.
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── App.tsx              # Main app entry point
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

---

## Code Migration

### Step 1: Copy State Management (Direct Migration)

Your existing Zustand stores work as-is in React Native:

```bash
# Copy your existing state files
cp ../friggs-gate/app/hooks/useFriggState.ts ./src/hooks/
cp ../friggs-gate/app/hooks/useWorkspaceCoordinator.ts ./src/hooks/
cp ../friggs-gate/app/config/content.ts ./src/config/
```

### Step 2: Adapt WebSocket Service

Create `src/services/connectionService.ts`:
```typescript
import 'react-native-url-polyfill/auto'; // Required for React Native WebSocket

// Copy your existing connectionService.ts interfaces
export interface ConnectionService {
  sendMessage(content: string): Promise<string>;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  connect(): void;
  disconnect(): void;
}

export interface RainbowBridgeMessage {
  type: 'chat_message';
  payload: {
    content: string;
  };
}

export interface RainbowBridgeResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Enhanced mobile WebSocket service
export class MobileWebSocketService implements ConnectionService {
  private ws: WebSocket | null = null;
  private _status: ConnectionService['status'] = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private wsEndpoint: string;

  constructor(wsEndpoint: string = 'ws://localhost:8001/ws') {
    this.wsEndpoint = wsEndpoint;
  }

  get status(): ConnectionService['status'] {
    return this._status;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this._status = 'connecting';

    try {
      this.ws = new WebSocket(this.wsEndpoint);

      this.ws.onopen = () => {
        console.log('🔌 Connected to Rainbow Bridge');
        this._status = 'connected';
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Disconnected from Rainbow Bridge');
        this._status = 'disconnected';
        this.ws = null;

        // Auto-reconnect unless clean disconnect
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };

      this.ws.onerror = () => {
        console.error('❌ Rainbow Bridge connection error');
        this._status = 'error';
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this._status = 'error';
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this._status = 'disconnected';
    this.reconnectAttempts = 0;
  }

  async sendMessage(content: string): Promise<string> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Rainbow Bridge');
    }

    return new Promise((resolve, reject) => {
      const message: RainbowBridgeMessage = {
        type: 'chat_message',
        payload: { content }
      };

      const handleResponse = (event: MessageEvent) => {
        try {
          const response: RainbowBridgeResponse = JSON.parse(event.data);
          this.ws?.removeEventListener('message', handleResponse);

          if (response.success && response.content) {
            resolve(response.content);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      };

      this.ws!.addEventListener('message', handleResponse);
      this.ws!.send(JSON.stringify(message));
    });
  }
}
```

### Step 3: Create WebSocket Hook

Create `src/hooks/useWebSocket.ts`:
```typescript
import { useState, useEffect, useRef } from 'react';
import { MobileWebSocketService } from '../services/connectionService';

export const useWebSocket = () => {
  const [connectionService] = useState(() => new MobileWebSocketService());
  const [status, setStatus] = useState(connectionService.status);
  const [error, setError] = useState<string | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout>();

  // Monitor connection status
  useEffect(() => {
    statusCheckInterval.current = setInterval(() => {
      setStatus(connectionService.status);
    }, 100);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [connectionService]);

  // Auto-connect on mount
  useEffect(() => {
    connectionService.connect();

    return () => {
      connectionService.disconnect();
    };
  }, [connectionService]);

  const sendMessage = async (content: string): Promise<string> => {
    try {
      setError(null);
      const result = await connectionService.sendMessage(content);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    error,
    sendMessage,
    connect: () => connectionService.connect(),
    disconnect: () => connectionService.disconnect(),
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
};
```

### Step 4: Create Navigation Structure

Create `src/navigation/AppNavigator.tsx`:
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StructuredInputScreen } from '../screens/StructuredInputScreen';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Input') {
              iconName = focused ? 'create' : 'create-outline';
            } else {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "Frigg's Gate" }}
        />
        <Tab.Screen
          name="Input"
          component={StructuredInputScreen}
          options={{ title: "Tools" }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Settings" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### Step 5: Create Main Chat Screen

Create `src/screens/ChatScreen.tsx`:
```typescript
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
          </div>
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
```

### Step 6: Create Settings Screen

Create `src/screens/SettingsScreen.tsx`:
```typescript
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
```

### Step 7: Update Main App Entry Point

Update `App.tsx`:
```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useFriggState } from './src/hooks/useFriggState';

export default function App() {
  const { isDarkMode } = useFriggState();

  return (
    <>
      <AppNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}
```

---

## Mobile-Specific Features

### Push Notifications

```bash
npx expo install expo-notifications
```

Add to your service:
```typescript
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Send local notification
export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
};
```

### Device Capabilities

```bash
npx expo install expo-camera expo-document-picker expo-haptics
```

Example usage:
```typescript
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';

// Haptic feedback on button press
const handleButtonPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ... your button logic
};

// Document picker for file uploads
const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (result.type === 'success') {
    // Handle selected file
    console.log(result.uri, result.name);
  }
};
```

---

## Testing Strategies

### 1. Development Testing (Expo Go)

**Real Device Testing:**
```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
# Changes appear instantly on your phone
```

**Simulator Testing:**
```bash
# iOS Simulator (Mac only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

### 2. Production-Like Testing (Development Builds)

**Create Development Build:**
```bash
# Install EAS CLI
yarn global add @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

**Install Development Build:**
- Download the `.ipa` (iOS) or `.apk` (Android) file from EAS dashboard
- Install using TestFlight (iOS) or directly install APK (Android)

### 3. Internal Testing (Without App Store)

#### iOS Testing (TestFlight)
1. **Apple Developer Account Required** ($99/year)
2. Build app with production profile:
   ```bash
   eas build --profile preview --platform ios
   ```
3. Upload to TestFlight automatically
4. Invite up to 10,000 testers via email
5. Testers install TestFlight app and receive invitation

#### Android Testing (Internal Testing)
1. **Google Play Console Account Required** ($25 one-time)
2. Build app:
   ```bash
   eas build --profile preview --platform android
   ```
3. Upload to Google Play Console as "Internal Testing"
4. Add testers by email
5. Testers receive link to install

#### Direct Distribution (No Store Accounts)
**Android:**
- Build APK and distribute directly
- Users must enable "Unknown Sources" in settings
- Not recommended for production

**iOS:**
- Requires Apple Developer account
- Ad-hoc provisioning allows up to 100 devices
- Enterprise distribution available for internal company use

---

## App Store Deployment

### Prerequisites

#### Apple App Store
- **Apple Developer Account**: $99/year
- **Mac Computer**: Required for iOS development
- **Xcode**: Latest version from Mac App Store

#### Google Play Store
- **Google Play Console Account**: $25 one-time fee
- **Any Computer**: Mac, Windows, or Linux

### Step 1: Configure App Information

Update `app.json`:
```json
{
  "expo": {
    "name": "Frigg's Gate",
    "slug": "friggs-gate-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.friggs.gate",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.friggs.gate",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Step 2: Create App Icons and Splash Screens

**Required Assets:**
- `icon.png`: 1024x1024px (app icon)
- `splash.png`: 1284x2778px (splash screen)
- `adaptive-icon.png`: 1024x1024px (Android adaptive icon)

**Generate Assets:**
```bash
npx expo install @expo/prebuild

# This will generate all required icon sizes automatically
```

### Step 3: Configure Build Profiles

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 4: Build for Production

**iOS Build:**
```bash
# Production build for App Store
eas build --platform ios --profile production

# This creates an .ipa file ready for App Store submission
```

**Android Build:**
```bash
# Production build for Google Play
eas build --platform android --profile production

# This creates an .aab file ready for Google Play submission
```

### Step 5: Submit to App Stores

#### iOS Submission (Automatic)
```bash
# Submit directly to App Store Connect
eas submit --platform ios

# Follow prompts to provide:
# - Apple ID credentials
# - App Store Connect API key (recommended)
# - App metadata
```

#### Android Submission (Automatic)
```bash
# Submit directly to Google Play Console
eas submit --platform android

# Follow prompts to provide:
# - Google Service Account JSON key
# - App metadata
```

#### Manual Submission Alternative

**iOS (Manual):**
1. Download `.ipa` file from EAS dashboard
2. Open **Transporter** app (Mac App Store)
3. Drag and drop `.ipa` file
4. Wait for upload and processing
5. Go to App Store Connect to complete metadata

**Android (Manual):**
1. Download `.aab` file from EAS dashboard
2. Go to Google Play Console
3. Navigate to "Production" release
4. Upload `.aab` file
5. Complete store listing information

### Step 6: Store Listing Information

#### Required Information for Both Stores
- **App Name**: "Frigg's Gate"
- **Description**: Detailed description of app functionality
- **Keywords**: "life insurance", "cognitive system", "AI assistant"
- **Screenshots**: 3-5 screenshots for each device type
- **Privacy Policy**: URL to your privacy policy
- **Contact Information**: Support email address

#### iOS-Specific Requirements
- **App Category**: Business or Productivity
- **Age Rating**: Complete questionnaire
- **App Review Information**: Test account credentials if needed
- **Export Compliance**: Encryption usage declaration

#### Android-Specific Requirements
- **Content Rating**: Complete IARC questionnaire
- **Target Audience**: Age groups
- **Data Safety**: Data collection and sharing practices
- **App Signing**: Google Play App Signing (recommended)

### Step 7: App Review Process

#### iOS App Review
- **Timeline**: 24-48 hours typically
- **Review Guidelines**: Must comply with App Store Review Guidelines
- **Common Rejections**: Crashes, broken links, incomplete functionality
- **Appeals Process**: Available if rejected unfairly

#### Google Play Review
- **Timeline**: 1-3 days typically
- **Policy Compliance**: Must follow Google Play policies
- **Testing**: Automated and manual testing
- **Staged Rollout**: Option to release to percentage of users first

### Step 8: Post-Launch Monitoring

#### Analytics and Crashes
```bash
# Install analytics
npx expo install expo-analytics expo-application

# Install crash reporting
yarn add @bugsnag/expo
```

#### App Updates
```bash
# Build new version
eas build --platform all --profile production

# Submit updates
eas submit --platform all
```

#### Over-the-Air Updates (Minor Updates)
```bash
# Install Expo Updates
npx expo install expo-updates

# Publish update (for minor changes only)
eas update --branch production --message "Fix minor bug"
```

---

## Troubleshooting

### Common Development Issues

#### 1. WebSocket Connection Failed
**Problem**: Cannot connect to backend WebSocket
**Solutions:**
- Ensure backend is running on correct port
- Check network permissions in app.json
- Use device's IP address instead of localhost for physical device testing
- Add network security config for Android (if using HTTP)

#### 2. Navigation Not Working
**Problem**: Screens not navigating properly
**Solutions:**
```bash
# Reinstall navigation dependencies
npx expo install react-native-screens react-native-safe-area-context
```
- Clear Metro cache: `npx expo start --clear`
- Ensure all navigation dependencies are installed

#### 3. Styling Issues
**Problem**: Styles look different than expected
**Solutions:**
- Remember React Native uses different style properties than CSS
- Use `StyleSheet.create()` for better performance
- Test on actual devices, not just simulators

#### 4. Build Failures
**Problem**: EAS build fails
**Solutions:**
- Check `eas.json` configuration
- Ensure all dependencies are compatible with React Native
- Review build logs for specific error messages
- Update to latest Expo SDK version

### Performance Optimization

#### 1. Optimize Bundle Size
```bash
# Analyze bundle
npx expo bundle-analyze

# Remove unused dependencies
yarn remove unused-package
```

#### 2. Implement Code Splitting
```typescript
// Lazy load screens
const SettingsScreen = React.lazy(() => import('./SettingsScreen'));

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <SettingsScreen />
</Suspense>
```

#### 3. Optimize Images
```bash
# Install image optimization
npx expo install expo-image

# Use in components
import { Image } from 'expo-image';
```

### Deployment Issues

#### 1. App Store Rejection
**Common Reasons:**
- App crashes on launch
- Missing functionality described in metadata
- Privacy policy issues
- Invalid screenshots

**Solutions:**
- Test thoroughly before submission
- Ensure all described features work
- Include comprehensive privacy policy
- Use actual device screenshots

#### 2. Google Play Rejection
**Common Reasons:**
- Target SDK version too low
- Missing required permissions declarations
- Data safety form incomplete

**Solutions:**
- Update to latest Expo SDK
- Declare all permissions in app.json
- Complete data safety questionnaire accurately

### Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **Expo Discord**: https://discord.gg/expo
- **Stack Overflow**: Tag questions with 'expo' and 'react-native'
- **GitHub Issues**: Search existing issues in Expo repository

---

## Expected Timeline

- **Day 1**: Environment setup, project creation
- **Day 2-3**: File migration, basic structure
- **Day 4-5**: Core functionality working on device
- **Day 6-7**: Mobile-specific features and polish
- **Day 8-10**: Testing and bug fixes
- **Day 11-14**: App store preparation and submission
- **Day 15+**: App review and iteration

## Success Metrics

- **Functionality**: All core web features work on mobile
- **Performance**: App loads within 3 seconds
- **User Experience**: Intuitive mobile navigation
- **Stability**: No crashes during normal usage
- **Store Approval**: Successful submission to both app stores

This comprehensive guide provides everything needed to transform FrigsGate into a successful mobile application using industry-standard practices and tools.

---

## Immediate Next Steps

### macOS Update for Xcode

Since Xcode is the recommended approach for iOS development, the first step is updating your macOS to support the latest Xcode version:

1. **Check Current macOS Version**:
   - Click Apple menu → "About This Mac"
   - Note your current macOS version

2. **Update macOS**:
   - Go to **System Preferences** → **Software Update**
   - Install all available updates
   - Restart when prompted
   - Repeat until no more updates available

3. **Install Xcode**:
   - Open Mac App Store
   - Search for "Xcode"
   - Click "Install" (~15GB download)
   - Accept license agreement when installation completes

4. **Verify Xcode Installation**:
   ```bash
   xcode-select --install
   sudo xcodebuild -license accept
   ```

5. **Proceed with Mobile Development**:
   - Once Xcode is installed, follow the main guide starting from "Environment Setup"
   - You'll have full iOS development capabilities including simulator testing and App Store builds

### Executive Summary for Management

**Project Overview:**
We're adding mobile capability to FrigsGate using React Native, which is the industry-standard framework used by Facebook, Instagram, Tesla, and Discord. This means we'll create iPhone and Android apps that connect to our existing Life Nervous System backend, giving users the full FrigsGate experience on their phones.

**Technical Approach:**
React Native lets us write code once and deploy to both iOS and Android, rather than building two separate apps. We'll reuse 70-80% of our existing TypeScript code from the web version - our WebSocket connections, state management, and business logic transfer directly to mobile. The chat interface, structured input panels, and output displays will be redesigned for mobile screens but use the same underlying functionality.

**Development Process:**
1. **Environment Setup** (1-2 days): Install Xcode (Apple's development software) and React Native tools
2. **Project Creation** (1 day): Create new mobile project alongside existing web app (zero risk to current system)
3. **Code Migration** (3-4 days): Copy and adapt our existing components for mobile interfaces
4. **Mobile Features** (2-3 days): Add phone-specific capabilities like push notifications and touch interactions
5. **Testing** (2-3 days): Test on actual devices using development tools
6. **App Store Deployment** (1-2 days): Submit to Apple App Store and Google Play Store

**What Each Tool Does:**
- **React Native**: Framework that converts our web code into native mobile app code
- **Xcode**: Apple's required software for iOS development, testing, and App Store submission
- **Expo**: Development platform that simplifies building, testing, and deploying mobile apps
- **EAS Build**: Cloud service that compiles our code into installable iPhone/Android apps

**Business Benefits:**
This approach reduces mobile development time by 60% compared to building separate native apps, while delivering identical performance to platform-specific applications. We maintain one backend, one set of business logic, and can push updates to web and mobile simultaneously. The total timeline is approximately 2 weeks for a fully functional mobile app ready for app store submission.