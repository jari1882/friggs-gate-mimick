export const colors = {
  light: {
    // Primary brand colors
    primary: '#305cde',
    primaryHover: '#2747b8',
    
    // Backgrounds
    background: '#ffffff',
    surface: '#ffffff',
    
    // Text colors
    text: '#374151',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#ffffff',
    
    // Borders
    border: '#D1D5DB',
    borderSecondary: '#E5E7EB',
    borderFocus: '#305cde',
    
    // Interactive states
    hover: '#F3F4F6',
    hoverSecondary: '#F9FAFB',
    
    // Status colors
    link: '#2d7bd4',
    code: '#ffa500',
    
    // Chakra UI equivalents for existing components
    chakra: {
      white: 'white',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      }
    }
  },
  dark: {
    // Primary brand colors
    primary: '#305cde',
    primaryHover: '#2747b8',
    
    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textQuaternary: '#6B7280',
    
    // Borders
    border: '#374151',
    borderSecondary: '#4B5563',
    borderFocus: '#305cde',
    
    // Interactive states
    hover: '#374151',
    hoverSecondary: '#4B5563',
    
    // Status colors
    link: '#60A5FA',
    code: '#FCD34D',
    
    // Chakra UI equivalents for existing components
    chakra: {
      white: '#ffffff',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      }
    }
  }
};

// Scrollbar colors for MemorySlider
export const scrollbarColors = {
  light: {
    track: '#D1D5DB',
    thumb: '#9CA3AF',
    scrollbarColor: '#D1D5DB #F9FAFB'
  },
  dark: {
    track: '#4B5563',
    thumb: '#6B7280',
    scrollbarColor: '#4B5563 #1F2937'
  }
};

// Code highlighting colors
export const codeHighlight = {
  background: '#374151', // bg-gray-700
  text: '#d6e2ef'
};

// Helper function to get colors based on theme
export const getColors = (isDarkMode: boolean) => ({
  ...(isDarkMode ? colors.dark : colors.light),
  scrollbar: isDarkMode ? scrollbarColors.dark : scrollbarColors.light
});