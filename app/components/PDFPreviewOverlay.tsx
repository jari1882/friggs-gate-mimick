"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';

// Configure PDF.js worker to use local file
pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.js';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  HStack,
  Text,
  IconButton,
  Box,
  Spinner,
  Center
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from '@chakra-ui/icons';
import { useFriggState } from '../hooks/useFriggState';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PDFPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: {
    name: string;
    type: string;
    url: string;
    blob: Blob;
  };
  markdownContent?: string;
}

export default function PDFPreviewOverlay({ isOpen, onClose, fileData, markdownContent }: PDFPreviewOverlayProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<number>(0);
  const { isDarkMode } = useFriggState();

  const isSpreadsheet = fileData.type.includes('excel') || fileData.type.includes('spreadsheet') || fileData.name.endsWith('.xlsx') || fileData.name.endsWith('.xlsm');
  const isImage = fileData.type.startsWith('image/');
  const isMarkdown = fileData.type === 'text/markdown';

  // Load spreadsheet data
  useEffect(() => {
    if (isSpreadsheet && isOpen) {
      loadSpreadsheetData();
    } else if (isImage && isOpen) {
      // For images, just set loading to false since they load immediately
      setLoading(false);
    } else if (isMarkdown && isOpen) {
      // For markdown, just set loading to false since content is already loaded
      setLoading(false);
    }
  }, [isSpreadsheet, isImage, isMarkdown, isOpen, fileData.blob]);

  const loadSpreadsheetData = async () => {
    setLoading(true);
    try {
      const arrayBuffer = await fileData.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets = workbook.SheetNames;
      setSheetNames(sheets);
      
      if (sheets.length > 0) {
        const worksheet = workbook.Sheets[sheets[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setSpreadsheetData(jsonData as any[][]);
        setCurrentSheet(0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Spreadsheet load error:', error);
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const goToPrevSheet = async () => {
    if (currentSheet > 0) {
      const newSheetIndex = currentSheet - 1;
      await loadSheet(newSheetIndex);
    }
  };

  const goToNextSheet = async () => {
    if (currentSheet < sheetNames.length - 1) {
      const newSheetIndex = currentSheet + 1;
      await loadSheet(newSheetIndex);
    }
  };

  const loadSheet = async (sheetIndex: number) => {
    try {
      const arrayBuffer = await fileData.blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[sheetNames[sheetIndex]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setSpreadsheetData(jsonData as any[][]);
      setCurrentSheet(sheetIndex);
    } catch (error) {
      console.error('Error loading sheet:', error);
    }
  };

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = fileData.url;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent 
        maxW="90vw" 
        maxH="90vh" 
        bg={isDarkMode ? "gray.800" : "white"}
        border={`2px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`}
      >
        <ModalHeader 
          pb={4}
          borderBottom={`1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`}
        >
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Text fontSize="lg" fontWeight="medium" color={isDarkMode ? "white" : "gray.800"}>
                {fileData.name}
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<DownloadIcon />}
                onClick={downloadFile}
                colorScheme="blue"
              >
                Download
              </Button>
            </HStack>
            <Box />
          </HStack>
        </ModalHeader>
        
        <ModalCloseButton color={isDarkMode ? "white" : "gray.800"} />
        
        <ModalBody p={0} display="flex" flexDirection="column" height="calc(90vh - 120px)">
          {loading && (
            <Center flex={1}>
              <Spinner size="xl" color="blue.500" />
            </Center>
          )}
          
          <Box 
            flex={1} 
            overflow="auto" 
            display="flex" 
            justifyContent="center" 
            alignItems="flex-start"
            bg={isDarkMode ? "gray.900" : "gray.50"}
            p={4}
          >
            {isImage ? (
              // Image View
              <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
                <img
                  src={fileData.url}
                  alt={fileData.name}
                  onLoad={handleImageLoad}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>
            ) : isMarkdown && markdownContent ? (
              // Markdown View
              <Box width="100%" height="100%" overflow="auto" px={8} py={6}>
                <Box
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
                    'p': {
                      mb: 3,
                      lineHeight: '1.7',
                      color: isDarkMode ? 'gray.200' : 'gray.700'
                    },
                    'ul, ol': {
                      mb: 3,
                      ml: 5,
                      color: isDarkMode ? 'gray.200' : 'gray.700'
                    },
                    'li': {
                      mb: 1,
                      lineHeight: '1.6'
                    },
                    'strong': {
                      fontWeight: 'bold',
                      color: isDarkMode ? 'white' : 'gray.900'
                    },
                    'code': {
                      bg: isDarkMode ? 'gray.700' : 'gray.200',
                      color: isDarkMode ? 'green.300' : 'green.700',
                      px: 1,
                      py: 0.5,
                      borderRadius: 'sm',
                      fontSize: 'sm',
                      fontFamily: 'monospace'
                    },
                    'pre': {
                      bg: isDarkMode ? 'gray.800' : 'gray.100',
                      border: '1px solid',
                      borderColor: isDarkMode ? 'gray.700' : 'gray.300',
                      borderRadius: 'md',
                      p: 4,
                      mb: 3,
                      overflow: 'auto'
                    },
                    'pre code': {
                      bg: 'transparent',
                      p: 0,
                      color: isDarkMode ? 'gray.100' : 'gray.800'
                    }
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </Box>
              </Box>
            ) : isSpreadsheet ? (
              // Spreadsheet View
              <Box width="100%" height="100%" overflow="auto">
                <Box 
                  bg={isDarkMode ? "gray.800" : "white"}
                  border={`1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`}
                  borderRadius="md"
                  overflow="auto"
                  maxHeight="100%"
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {spreadsheetData.slice(0, 100).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              style={{
                                padding: '8px',
                                border: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`,
                                fontSize: '12px',
                                color: isDarkMode ? 'white' : 'black',
                                backgroundColor: rowIndex === 0 ? (isDarkMode ? '#2D3748' : '#F7FAFC') : 'transparent',
                                fontWeight: rowIndex === 0 ? 'bold' : 'normal',
                                minWidth: '100px',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={String(cell || '')}
                            >
                              {String(cell || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            ) : (
              // PDF View
              <Document
                file={fileData.blob}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page
                  pageNumber={pageNumber}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={Math.min(window.innerWidth * 0.7, 800)}
                />
              </Document>
            )}
          </Box>
          
          {(numPages > 0 || sheetNames.length > 0) && (
            <HStack 
              justify="center" 
              p={4} 
              borderTop={`1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`}
              bg={isDarkMode ? "gray.800" : "white"}
            >
              {isSpreadsheet ? (
                // Spreadsheet navigation
                <>
                  <IconButton
                    aria-label="Previous sheet"
                    icon={<ChevronLeftIcon />}
                    onClick={goToPrevSheet}
                    disabled={currentSheet <= 0}
                    size="sm"
                  />
                  <Text fontSize="sm" color={isDarkMode ? "gray.300" : "gray.600"}>
                    Sheet: {sheetNames[currentSheet] || 'Unknown'} ({currentSheet + 1} of {sheetNames.length})
                  </Text>
                  <IconButton
                    aria-label="Next sheet"
                    icon={<ChevronRightIcon />}
                    onClick={goToNextSheet}
                    disabled={currentSheet >= sheetNames.length - 1}
                    size="sm"
                  />
                </>
              ) : (
                // PDF navigation
                <>
                  <IconButton
                    aria-label="Previous page"
                    icon={<ChevronLeftIcon />}
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    size="sm"
                  />
                  <Text fontSize="sm" color={isDarkMode ? "gray.300" : "gray.600"}>
                    Page {pageNumber} of {numPages}
                  </Text>
                  <IconButton
                    aria-label="Next page"
                    icon={<ChevronRightIcon />}
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    size="sm"
                  />
                </>
              )}
            </HStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}