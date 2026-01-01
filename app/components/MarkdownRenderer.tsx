'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useFriggState } from '../hooks/useFriggState';
import { Box } from '@chakra-ui/react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { isDarkMode } = useFriggState();

  return (
    <Box
      className="markdown-preview"
      bg={isDarkMode ? 'gray.800' : 'gray.50'}
      border="1px solid"
      borderColor={isDarkMode ? 'gray.600' : 'gray.300'}
      borderRadius="md"
      px={8}
      py={6}
      maxW="100%"
      overflow="auto"
      sx={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        // Headings
        'h1': {
          fontSize: '2xl',
          fontWeight: 'bold',
          mb: 4,
          mt: 4,
          color: isDarkMode ? 'white' : 'gray.900',
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'gray.600' : 'gray.300',
          pb: 2
        },
        'h2': {
          fontSize: 'xl',
          fontWeight: 'semibold',
          mb: 3,
          mt: 4,
          color: isDarkMode ? 'white' : 'gray.900'
        },
        'h3': {
          fontSize: 'lg',
          fontWeight: 'semibold',
          mb: 2,
          mt: 3,
          color: isDarkMode ? 'gray.100' : 'gray.800'
        },
        'h4, h5, h6': {
          fontSize: 'md',
          fontWeight: 'semibold',
          mb: 2,
          mt: 3,
          color: isDarkMode ? 'gray.100' : 'gray.800'
        },
        // Paragraphs
        'p': {
          mb: 3,
          lineHeight: '1.7',
          color: isDarkMode ? 'gray.200' : 'gray.700'
        },
        // Lists
        'ul, ol': {
          mb: 3,
          ml: 5,
          color: isDarkMode ? 'gray.200' : 'gray.700'
        },
        'li': {
          mb: 1,
          lineHeight: '1.6'
        },
        // Links
        'a': {
          color: isDarkMode ? 'blue.400' : 'blue.600',
          textDecoration: 'underline',
          _hover: {
            color: isDarkMode ? 'blue.300' : 'blue.800'
          }
        },
        // Code blocks
        'pre': {
          bg: isDarkMode ? 'gray.900' : 'gray.100',
          border: '1px solid',
          borderColor: isDarkMode ? 'gray.700' : 'gray.300',
          borderRadius: 'md',
          p: 4,
          mb: 3,
          overflow: 'auto'
        },
        'code': {
          bg: isDarkMode ? 'gray.900' : 'gray.100',
          color: isDarkMode ? 'green.300' : 'green.700',
          px: 1,
          py: 0.5,
          borderRadius: 'sm',
          fontSize: 'sm',
          fontFamily: 'monospace'
        },
        'pre code': {
          bg: 'transparent',
          p: 0,
          color: isDarkMode ? 'gray.100' : 'gray.800'
        },
        // Inline code
        'p code, li code': {
          bg: isDarkMode ? 'gray.700' : 'gray.200',
          color: isDarkMode ? 'green.300' : 'green.700'
        },
        // Blockquotes
        'blockquote': {
          borderLeft: '4px solid',
          borderColor: isDarkMode ? 'blue.500' : 'blue.400',
          pl: 4,
          py: 1,
          mb: 3,
          color: isDarkMode ? 'gray.300' : 'gray.600',
          fontStyle: 'italic'
        },
        // Tables
        'table': {
          width: '100%',
          mb: 3,
          borderCollapse: 'collapse'
        },
        'th, td': {
          border: '1px solid',
          borderColor: isDarkMode ? 'gray.600' : 'gray.300',
          px: 3,
          py: 2,
          textAlign: 'left'
        },
        'th': {
          bg: isDarkMode ? 'gray.700' : 'gray.200',
          fontWeight: 'semibold',
          color: isDarkMode ? 'white' : 'gray.900'
        },
        'td': {
          color: isDarkMode ? 'gray.200' : 'gray.700'
        },
        // Horizontal rule
        'hr': {
          my: 4,
          borderColor: isDarkMode ? 'gray.600' : 'gray.300'
        },
        // Strong/Bold
        'strong': {
          fontWeight: 'bold',
          color: isDarkMode ? 'white' : 'gray.900'
        },
        // Emphasis/Italic
        'em': {
          fontStyle: 'italic'
        },
        // Images
        'img': {
          maxW: '100%',
          borderRadius: 'md',
          my: 3
        }
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </Box>
  );
}
