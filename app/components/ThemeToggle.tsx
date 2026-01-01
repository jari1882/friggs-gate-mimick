'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useFriggState } from '../hooks/useFriggState';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useFriggState();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none group ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <span className="sr-only">Toggle theme</span>
      <motion.span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform z-10 relative ${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        }`}
        animate={{
          x: isDarkMode ? 24 : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
      {/* Icons */}
      <SunIcon 
        className={`absolute left-1 h-3 w-3 transition-opacity ${
          isDarkMode ? 'opacity-30' : 'opacity-70'
        }`}
        color={isDarkMode ? 'white' : 'black'}
      />
      <MoonIcon 
        className={`absolute right-1 h-3 w-3 transition-opacity ${
          isDarkMode ? 'opacity-70' : 'opacity-30'
        }`}
        color={isDarkMode ? 'white' : 'black'}
      />
      {/* Custom tooltip positioned to the left of the toggle */}
      <div className={`absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap ${
        isDarkMode 
          ? 'bg-gray-700 text-white border border-gray-600' 
          : 'bg-gray-100 text-gray-800 border border-gray-300'
      }`}>
        Toggle Light/Dark Mode
        {/* Tooltip arrow pointing right towards the toggle */}
        <div className={`absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent ${
          isDarkMode ? 'border-l-gray-700' : 'border-l-gray-100'
        }`}></div>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;