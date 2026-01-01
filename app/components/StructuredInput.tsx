'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useFriggState } from '../hooks/useFriggState';
import { useWorkspaceCoordinator } from '../hooks/useWorkspaceCoordinator';

type ToolType = 'QuickQuote' | 'LifeExpectancy';

interface QuickQuoteParams {
  age: string;
  gender: 'male' | 'female' | '';
  smoker: 'yes' | 'no' | '';
  coverageAmount: string;
}

interface LifeExpectancyParams {
  age: string;
  gender: 'male' | 'female' | '';
  healthConditions: string;
  lifestyle: 'sedentary' | 'active' | 'very_active' | '';
  generateImage: boolean;
}

interface StructuredInputProps {
  width: number;
  onResize: (width: number) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const StructuredInput: React.FC<StructuredInputProps> = ({ 
  width, 
  onResize,
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [quickQuoteParams, setQuickQuoteParams] = useState<QuickQuoteParams>({
    age: '',
    gender: '',
    smoker: '',
    coverageAmount: ''
  });
  const [lifeExpectancyParams, setLifeExpectancyParams] = useState<LifeExpectancyParams>({
    age: '',
    gender: '',
    healthConditions: '',
    lifestyle: '',
    generateImage: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useFriggState();
  const { selectedTool, formValidationMessage, setFormValidationMessage, openStructuredOutput, openStructuredInput } = useWorkspaceCoordinator();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      // Remove artificial limits - allow full screen width
      const clampedWidth = Math.max(200, Math.min(window.innerWidth - 50, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onResize]);

  // Auto-focus first input when tool is selected
  useEffect(() => {
    if (selectedTool && firstInputRef.current) {
      // Small delay to ensure the form is rendered
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [selectedTool]);

  const handleQuickQuoteChange = (field: keyof QuickQuoteParams, value: string) => {
    setQuickQuoteParams(prev => ({ ...prev, [field]: value }));
    // Clear validation message when user starts editing
    if (formValidationMessage) {
      setFormValidationMessage(null);
    }
  };

  const handleLifeExpectancyChange = (field: keyof LifeExpectancyParams, value: string | boolean) => {
    setLifeExpectancyParams(prev => ({ ...prev, [field]: value }));
    // Clear validation message when user starts editing
    if (formValidationMessage) {
      setFormValidationMessage(null);
    }
  };

  // Form validation functions
  const validateQuickQuoteForm = (): boolean => {
    const { age, gender, smoker, coverageAmount } = quickQuoteParams;
    return age !== '' && gender !== '' && smoker !== '' && coverageAmount !== '';
  };

  const validateLifeExpectancyForm = (): boolean => {
    const { age, gender, lifestyle } = lifeExpectancyParams;
    return age !== '' && gender !== '' && lifestyle !== '';
  };

  const handleFormSubmit = (toolType: ToolType) => {
    const isValid = toolType === 'QuickQuote' 
      ? validateQuickQuoteForm() 
      : validateLifeExpectancyForm();
    
    if (!isValid) {
      setFormValidationMessage('This form is missing required fields');
      return;
    }
    
    // Form is valid - open structured output with placeholder content
    const content = toolType === 'QuickQuote'
      ? `Quick Quote Results:\n\nAge: ${quickQuoteParams.age}\nGender: ${quickQuoteParams.gender}\nSmoker: ${quickQuoteParams.smoker}\nCoverage: $${quickQuoteParams.coverageAmount}\n\nEstimated monthly premium: $XX.XX`
      : `Life Expectancy Results:\n\nAge: ${lifeExpectancyParams.age}\nGender: ${lifeExpectancyParams.gender}\nLifestyle: ${lifeExpectancyParams.lifestyle}\n\nEstimated life expectancy: XX years`;
    
    openStructuredOutput(content);
  };

  // Handle Enter key to submit form
  const handleKeyDown = (event: React.KeyboardEvent, toolType: ToolType) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleFormSubmit(toolType);
    }
  };

  // Helper functions for consistent theming
  const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#305cde] transition-colors duration-200 ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;
  
  const labelClassName = `block text-sm font-medium mb-1 transition-colors duration-200 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;
  
  const buttonClassName = (color: string) => `w-full text-white py-2 px-4 rounded-md transition-colors ${
    color === 'blue' 
      ? 'bg-[#305cde] hover:bg-[#2747b8]' 
      : 'bg-green-600 hover:bg-green-700'
  }`;

  const renderQuickQuoteForm = () => (
    <div className="space-y-4" onKeyDown={(e) => handleKeyDown(e, 'QuickQuote')}>
      <div>
        <label className={labelClassName}>Age</label>
        <input
          ref={firstInputRef}
          type="number"
          value={quickQuoteParams.age}
          onChange={(e) => handleQuickQuoteChange('age', e.target.value)}
          className={inputClassName}
          placeholder="Enter age"
          tabIndex={1}
        />
      </div>
      
      <div>
        <label className={labelClassName}>Gender</label>
        <select
          value={quickQuoteParams.gender}
          onChange={(e) => handleQuickQuoteChange('gender', e.target.value)}
          className={inputClassName}
          tabIndex={2}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      
      <div>
        <label className={labelClassName}>Smoker</label>
        <select
          value={quickQuoteParams.smoker}
          onChange={(e) => handleQuickQuoteChange('smoker', e.target.value)}
          className={inputClassName}
          tabIndex={3}
        >
          <option value="">Select smoking status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      
      <div>
        <label className={labelClassName}>Coverage Amount ($)</label>
        <input
          type="number"
          value={quickQuoteParams.coverageAmount}
          onChange={(e) => handleQuickQuoteChange('coverageAmount', e.target.value)}
          className={inputClassName}
          placeholder="Enter coverage amount"
          tabIndex={4}
        />
      </div>
      
      <button 
        className={buttonClassName('blue')}
        onClick={() => handleFormSubmit('QuickQuote')}
        tabIndex={5}
      >
        Get Quote
      </button>
    </div>
  );

  const renderLifeExpectancyForm = () => (
    <div className="space-y-4" onKeyDown={(e) => handleKeyDown(e, 'LifeExpectancy')}>
      <div>
        <label className={labelClassName}>Age</label>
        <input
          ref={firstInputRef}
          type="number"
          value={lifeExpectancyParams.age}
          onChange={(e) => handleLifeExpectancyChange('age', e.target.value)}
          className={inputClassName}
          placeholder="Enter age"
          tabIndex={1}
        />
      </div>
      
      <div>
        <label className={labelClassName}>Gender</label>
        <select
          value={lifeExpectancyParams.gender}
          onChange={(e) => handleLifeExpectancyChange('gender', e.target.value)}
          className={inputClassName}
          tabIndex={2}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      
      <div>
        <label className={labelClassName}>Health Conditions</label>
        <textarea
          value={lifeExpectancyParams.healthConditions}
          onChange={(e) => handleLifeExpectancyChange('healthConditions', e.target.value)}
          className={`${inputClassName} resize-none`}
          rows={3}
          placeholder="List any health conditions"
          tabIndex={3}
        />
      </div>
      
      <div>
        <label className={labelClassName}>Lifestyle</label>
        <select
          value={lifeExpectancyParams.lifestyle}
          onChange={(e) => handleLifeExpectancyChange('lifestyle', e.target.value)}
          className={inputClassName}
          tabIndex={4}
        >
          <option value="">Select lifestyle</option>
          <option value="sedentary">Sedentary</option>
          <option value="active">Active</option>
          <option value="very_active">Very Active</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={lifeExpectancyParams.generateImage}
            onChange={(e) => handleLifeExpectancyChange('generateImage', e.target.checked)}
            className="w-4 h-4 text-[#305cde] border-gray-300 rounded focus:ring-[#305cde]"
            tabIndex={5}
          />
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>Generate visualization image</span>
        </label>
      </div>
      
      <button 
        className={buttonClassName('blue')}
        onClick={() => handleFormSubmit('LifeExpectancy')}
        tabIndex={6}
      >
        Calculate Life Expectancy
      </button>
    </div>
  );

  if (isMinimized) {
    return (
      <div className={`h-full border-r shadow-sm relative flex-shrink-0 w-12 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-2 border-b flex items-center justify-center transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button 
            onClick={onToggleMinimize}
            className={`p-1 rounded transition-colors duration-200 ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ChevronUpIcon className={`w-5 h-5 transform rotate-90 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`h-full border-r shadow-sm relative flex-shrink-0 flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={{ width }}
    >
      <div 
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors ${
          isDarkMode 
            ? 'bg-gray-600 hover:bg-gray-500' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onMouseDown={() => setIsResizing(true)}
      />
      
      <div className={`p-4 border-b flex items-center justify-center relative transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Structured Input</h3>
        <button 
          onClick={onToggleMinimize}
          className={`absolute right-4 p-1 rounded transition-colors duration-200 ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ChevronDownIcon className={`w-5 h-5 transform rotate-90 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`} />
        </button>
      </div>
      
      <div className={`p-4 border-b transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Select Tool</label>
        <select
          value={selectedTool || ''}
          onChange={(e) => {
            const value = e.target.value as 'QuickQuote' | 'LifeExpectancy' | '';
            if (value) {
              openStructuredInput(value);
            }
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#305cde] transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Choose a tool</option>
          <option value="QuickQuote">Quick Quote</option>
          <option value="LifeExpectancy">Life Expectancy Calculator</option>
        </select>
        <p className={`text-sm mt-2 transition-colors duration-200 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Tools can also be selected automatically based on your conversation
        </p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto min-h-0">
        {formValidationMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {formValidationMessage}
          </div>
        )}
        
        {selectedTool ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTool === 'QuickQuote' ? renderQuickQuoteForm() : renderLifeExpectancyForm()}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className={`text-center py-8 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p className="mb-2">No tool selected</p>
            <p className="text-sm">
              Start a conversation to activate the appropriate tool based on your needs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StructuredInput;