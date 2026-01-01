'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ViewOffIcon, ViewIcon } from '@chakra-ui/icons';
import { useFriggState } from '../hooks/useFriggState';
import { colors, scrollbarColors } from '../config/theme';
import { content } from '../config/content';

interface MemorySliderProps {
  memories: string[];
  onSelect: (memory: string) => void;
}

const MemorySlider: React.FC<MemorySliderProps> = ({ memories, onSelect }) => {
  const { isDarkMode } = useFriggState();
  const [isMinimized, setIsMinimized] = useState(true);
  const themeColors = isDarkMode ? colors.dark : colors.light;
  const scrollbar = isDarkMode ? scrollbarColors.dark : scrollbarColors.light;
  
  // Add dynamic CSS for dark mode scrollbar
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .memory-slider-scrollbar::-webkit-scrollbar-thumb {
        background: ${scrollbar.track};
      }
      .memory-slider-scrollbar::-webkit-scrollbar-thumb:hover {
        background: ${scrollbar.thumb};
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);
  
  if (isMinimized) {
    return (
      <div className="absolute right-7 top-14 z-10">
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 mt-2 relative group bg-white hover:bg-gray-100 text-gray-500 border border-gray-300"
        >
          <ViewIcon className="w-4 h-4" />
          {/* Custom tooltip positioned to the left */}
          <div className={`absolute bottom-full right-0 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap ${
            isDarkMode 
              ? 'bg-gray-700 text-white border border-gray-600' 
              : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}>
            Show Memory Slider
            {/* Tooltip arrow positioned to the right */}
            <div className={`absolute top-full right-2 border-4 border-transparent ${
              isDarkMode ? 'border-t-gray-700' : 'border-t-gray-100'
            }`}></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`border rounded-lg p-6 transition-colors duration-200 relative ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-800' 
          : 'border-gray-300 bg-white'
      }`}>
        <button 
          onClick={() => setIsMinimized(true)}
          className={`absolute top-1 right-1 p-1 rounded transition-colors duration-200 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <ViewOffIcon className="w-4 h-4" />
        </button>
        
        <div 
          className="flex gap-4 overflow-x-auto pb-6 memory-slider-scrollbar pr-12" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: scrollbar.scrollbarColor
          }}
        >
          {memories.map((memory, index) => (
            <motion.button
              key={index}
              onClick={() => onSelect(memory)}
              className={`flex-shrink-0 border rounded-lg px-6 py-4 text-base font-medium transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-white border-gray-600 text-gray-200 hover:bg-gray-100 hover:border-gray-500' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {memory}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemorySlider;