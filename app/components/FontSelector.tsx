'use client';

import { Select } from '@chakra-ui/react';
import { useFriggState } from '../hooks/useFriggState';
import { fontOptions } from '../config/fonts';
import { colors } from '../config/theme';

export default function FontSelector() {
  const { selectedFont, setFont, isDarkMode } = useFriggState();
  const themeColors = isDarkMode ? colors.dark : colors.light;

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = event.target.value;
    setFont(newFont);
    
    // Apply the font to the body immediately
    const selectedFontOption = fontOptions.find(font => font.value === newFont);
    if (selectedFontOption) {
      document.body.style.fontFamily = selectedFontOption.family;
    }
  };

  return (
    <Select
      value={selectedFont}
      onChange={handleFontChange}
      size="sm"
      width="180px"
      bg={isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.white}
      color={isDarkMode ? themeColors.chakra.white : themeColors.chakra.gray[800]}
      borderColor={isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]}
      _hover={{
        borderColor: isDarkMode ? themeColors.chakra.gray[500] : themeColors.chakra.gray[400]
      }}
      _focus={{
        borderColor: themeColors.primary,
        boxShadow: `0 0 0 1px ${themeColors.primary}99`
      }}
    >
      {fontOptions.map((font) => (
        <option 
          key={font.value} 
          value={font.value}
          style={{ 
            backgroundColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.white,
            color: isDarkMode ? themeColors.chakra.white : themeColors.chakra.gray[800]
          }}
        >
          {font.label}
        </option>
      ))}
    </Select>
  );
}