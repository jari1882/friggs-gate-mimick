'use client';

import { create } from 'zustand';
import { content } from '../config/content';

interface FriggState {
  // Layout state
  structuredInputWidth: number;
  structuredOutputDockWidth: number;
  isStructuredOutputOpen: boolean;
  isStructuredInputMinimized: boolean;
  isStructuredOutputMinimized: boolean;
  
  // Theme state
  isDarkMode: boolean;
  selectedFont: string;
  
  // LLM Integration state
  isLLMIntegrationEnabled: boolean;
  
  // Layout actions
  setStructuredInputWidth: (width: number) => void;
  setStructuredOutputDockWidth: (width: number) => void;
  setStructuredOutputOpen: (open: boolean) => void;
  setStructuredInputMinimized: (minimized: boolean) => void;
  setStructuredOutputMinimized: (minimized: boolean) => void;
  
  // Theme actions
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setFont: (font: string) => void;
  
  // LLM Integration actions
  toggleLLMIntegration: () => void;
  setLLMIntegration: (enabled: boolean) => void;
  
  // Memory state
  memories: string[];
  selectedMemory: string | null;
  
  // Memory actions
  setMemories: (memories: string[]) => void;
  selectMemory: (memory: string) => void;
}

export const useFriggState = create<FriggState>((set) => ({
  // Initial layout state
  structuredInputWidth: 300,
  structuredOutputDockWidth: 300,
  isStructuredOutputOpen: true,
  isStructuredInputMinimized: false,
  isStructuredOutputMinimized: false,
  
  // Initial theme state
  isDarkMode: false,
  selectedFont: 'inter',
  
  // Initial LLM Integration state
  isLLMIntegrationEnabled: true,
  
  // Layout actions
  setStructuredInputWidth: (width) => set({ structuredInputWidth: width }),
  setStructuredOutputDockWidth: (width) => set({ structuredOutputDockWidth: width }),
  setStructuredOutputOpen: (open) => set({ isStructuredOutputOpen: open }),
  setStructuredInputMinimized: (minimized) => set({ isStructuredInputMinimized: minimized }),
  setStructuredOutputMinimized: (minimized) => set({ isStructuredOutputMinimized: minimized }),
  
  // Theme actions
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setTheme: (isDark) => set({ isDarkMode: isDark }),
  setFont: (font) => set({ selectedFont: font }),
  
  // LLM Integration actions
  toggleLLMIntegration: () => set((state) => ({ isLLMIntegrationEnabled: !state.isLLMIntegrationEnabled })),
  setLLMIntegration: (enabled) => set({ isLLMIntegrationEnabled: enabled }),
  
  // Initial memory state
  memories: Array(15).fill(content.labels.notActive),
  selectedMemory: null,
  
  // Memory actions
  setMemories: (memories) => set({ memories }),
  selectMemory: (memory) => set({ selectedMemory: memory }),
}));