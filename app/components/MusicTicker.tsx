'use client';

import React from 'react';
import { useFriggState } from '../hooks/useFriggState';
import { colors } from '../config/theme';
import { content } from '../config/content';

const MusicTicker: React.FC = () => {
  const { isDarkMode } = useFriggState();
  const themeColors = isDarkMode ? colors.dark : colors.light;
  
  const songs = content.music.songs;
  const tickerContent = songs.join(' • ');

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-2">
        <span 
          className="text-xs font-medium"
          style={{ color: isDarkMode ? themeColors.chakra.gray[300] : themeColors.chakra.gray[700] }}
        >
          {content.buttons.musicTickerTitle}
        </span>
      </div>
      
      <div 
        className="w-full overflow-hidden relative"
        style={{ 
          maxWidth: '400px',
          height: '20px'
        }}
      >
        <div 
          className="whitespace-nowrap animate-scroll text-xs"
          style={{ 
            color: isDarkMode ? themeColors.chakra.gray[400] : themeColors.chakra.gray[600],
            animation: 'scroll-left 60s linear infinite'
          }}
        >
          {tickerContent} • {tickerContent}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll-left 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MusicTicker;