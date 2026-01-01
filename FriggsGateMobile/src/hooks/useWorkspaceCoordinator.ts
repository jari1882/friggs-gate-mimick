'use client';

import { create } from 'zustand';

// Centralized workspace coordination state
// Manages panel visibility, tool selection, and cross-panel communication

interface WorkspaceState {
  // Panel states
  isStructuredInputMinimized: boolean;
  isStructuredOutputMinimized: boolean;
  selectedTool: 'QuickQuote' | 'LifeExpectancy' | null;
  
  // UI state
  showEmptyStateButtons: boolean;
  structuredOutputContent: string;
  formValidationMessage: string | null;
  
  // Actions
  openStructuredInput: (tool: 'QuickQuote' | 'LifeExpectancy') => void;
  openStructuredOutput: (content?: string) => void;
  toggleStructuredInput: () => void;
  toggleStructuredOutput: () => void;
  hideEmptyStateButtons: () => void;
  setFormValidationMessage: (message: string | null) => void;
  resetToEmptyState: () => void;
}

export const useWorkspaceCoordinator = create<WorkspaceState>((set) => ({
  // Initial state - matches empty state requirements
  isStructuredInputMinimized: true,
  isStructuredOutputMinimized: true,
  selectedTool: null,
  showEmptyStateButtons: true,
  structuredOutputContent: 'This is where your structured result would appear.',
  formValidationMessage: null,
  
  // Actions
  openStructuredInput: (tool) => {
    console.log(`📱 Opening structured input with tool: ${tool}`);
    set({
      isStructuredInputMinimized: false,
      selectedTool: tool,
      showEmptyStateButtons: false
    });
  },
  
  openStructuredOutput: (content) => {
    console.log('📊 Opening structured output panel');
    set({
      isStructuredOutputMinimized: false,
      structuredOutputContent: content || 'This is where your structured result would appear.',
      showEmptyStateButtons: false
    });
  },
  
  toggleStructuredInput: () => {
    set(state => ({
      isStructuredInputMinimized: !state.isStructuredInputMinimized
    }));
  },
  
  toggleStructuredOutput: () => {
    set(state => ({
      isStructuredOutputMinimized: !state.isStructuredOutputMinimized
    }));
  },
  
  hideEmptyStateButtons: () => {
    set({ showEmptyStateButtons: false });
  },
  
  setFormValidationMessage: (message) => {
    set({ formValidationMessage: message });
  },
  
  
  /**
   * Reset workspace to initial empty state
   */
  resetToEmptyState: () => {
    console.log('🔄 Resetting to empty state');
    set({
      isStructuredInputMinimized: true,
      isStructuredOutputMinimized: true,
      selectedTool: null,
      showEmptyStateButtons: true,
      structuredOutputContent: 'This is where your structured result would appear.',
      formValidationMessage: null
    });
  }
}));