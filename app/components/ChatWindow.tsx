"use client";

import React, { useEffect, useRef, useState } from "react";

import { EmptyState } from "./EmptyState";
import { ChatMessageBubble, Message } from "./ChatMessageBubble";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import MemorySlider from "./MemorySlider";
import StructuredInput from "./StructuredInput";
import ThemeToggle from "./ThemeToggle";
import StructuredOutputDock from "./StructuredOutputDock";
import MusicTicker from "./MusicTicker";
import { useFriggState } from "../hooks/useFriggState";
import { useWorkspaceCoordinator } from "../hooks/useWorkspaceCoordinator";
import { marked } from "marked";
import { Renderer } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/gradient-dark.css";
import { colors, codeHighlight } from "../config/theme";
import { content } from "../config/content";
import { fontFamilies } from "../config/fonts";
import { commands } from "../config/commands";

import "react-toastify/dist/ReactToastify.css";
import {
  Spinner,
} from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { Source } from "./SourceBubble";
import { useWebSocket } from "../hooks/useWebSocket";


export function ChatWindow() {

  // Frigg state
  const {
    structuredInputWidth,
    structuredOutputDockWidth,
    isStructuredOutputOpen,
    isDarkMode,
    selectedFont,
    memories,
    isLLMIntegrationEnabled,
    setStructuredInputWidth,
    setStructuredOutputDockWidth,
    selectMemory,
    toggleLLMIntegration
  } = useFriggState();

  // Theme colors
  const themeColors = isDarkMode ? colors.dark : colors.light;

  // Workspace coordinator - handles agent-driven panel behavior
  const {
    isStructuredInputMinimized,
    isStructuredOutputMinimized,
    selectedTool,
    showEmptyStateButtons,
    hideEmptyStateButtons,
    toggleStructuredInput,
    toggleStructuredOutput
  } = useWorkspaceCoordinator();

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const mainChatRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mainChatWidth, setMainChatWidth] = useState(0);
  const [isSimMode, setIsSimMode] = useState(false);

  // Clean WebSocket connection - just send text, get text
  const { sendMessage: sendWebSocketMessage, status: wsStatus, error: wsError, isConnected } = useWebSocket();
  

  // Handle font changes
  useEffect(() => {
    const fontOptions = [
      { value: 'inter', family: 'Inter, sans-serif' },
      { value: 'roboto', family: 'Roboto, sans-serif' },
      { value: 'open-sans', family: 'Open Sans, sans-serif' },
      { value: 'lato', family: 'Lato, sans-serif' },
      { value: 'poppins', family: 'Poppins, sans-serif' },
      { value: 'montserrat', family: 'Montserrat, sans-serif' },
      { value: 'source-sans', family: 'Source Sans Pro, sans-serif' },
      { value: 'ubuntu', family: 'Ubuntu, sans-serif' },
      { value: 'nunito', family: 'Nunito, sans-serif' },
      { value: 'system', family: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
      { value: 'fira-code', family: 'Fira Code, Consolas, Monaco, monospace' },
      { value: 'jetbrains-mono', family: 'JetBrains Mono, Consolas, Monaco, monospace' }
    ];
    
    const selectedFontOption = fontOptions.find(font => font.value === selectedFont);
    if (selectedFontOption) {
      document.body.style.fontFamily = selectedFontOption.family;
    }
  }, [selectedFont]);

  // Track main chat area width
  useEffect(() => {
    const mainChatElement = mainChatRef.current;
    if (!mainChatElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMainChatWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(mainChatElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const sendMessage = async (message?: string) => {
    console.log('🔍 ChatWindow sendMessage called with:', message);
    console.log('🔍 WebSocket status:', wsStatus, 'isConnected:', isConnected, 'isLoading:', isLoading);
    
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (isLoading) {
      console.log('Exiting early - already loading');
      return;
    }
    if (!isConnected) {
      console.log('WebSocket not connected, status:', wsStatus);
      // Add error message to chat instead of silently failing
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: Math.random().toString(), 
          content: content.errors.websocketNotConnected, 
          role: "assistant" 
        },
      ]);
      return;
    }
    let messageValue = message ?? input;
    console.log('🔍 messageValue after assignment:', messageValue, 'message param:', message, 'input state:', input);
    if (messageValue === "") return;
    
    // Check for special commands first
    if (messageValue in commands.special) {
      if (messageValue === "/sim") {
        // Handle SIM-KB Test mode
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);

        if (isSimMode) {
          // Exit sim mode
          setIsSimMode(false);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "Exited SIM-KB mode. You're now back in the regular chat.",
              role: "assistant"
            }
          ]);
        } else {
          // Enter sim mode
          setIsSimMode(true);
          const welcomeMessage = `# Welcome to SIM-KB Test Mode

You're now in SIM-KB mode! Ask me anything about the insurance carriers in the knowledge base.

## Example Questions:
- "What carriers do we have data for?"
- "Tell me about Protective Life"
- "How did Protective Life perform in Annuities?"
- "What are the BPSer team roles?"

## Commands:
- **clear** - Clear conversation history
- **stats** - Show database statistics
- **help** - Show this help message
- **/sim** - Exit SIM-KB mode

Type your question below to get started!`;

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: welcomeMessage,
              role: "assistant"
            }
          ]);
        }

        hideEmptyStateButtons();
        return;
      }

      if (messageValue === "/pdf") {
        // Handle PDF generation command
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);
        
        // Load actual PDF file from public directory
        const pdfUrl = "/Life Product Model Manual v1.0.pdf";
        let pdfBlob: Blob;
        let downloadUrl: string;
        
        try {
          const response = await fetch(pdfUrl);
          if (!response.ok) {
            throw new Error(`Failed to load PDF: ${response.statusText}`);
          }
          pdfBlob = await response.blob();
          downloadUrl = URL.createObjectURL(pdfBlob);
        } catch (error) {
          console.error("Error loading PDF:", error);
          // Show error message if file can't be loaded
          setMessages((prevMessages) => [
            ...prevMessages,
            { 
              id: Math.random().toString(), 
              content: "Error loading PDF file", 
              role: "assistant"
            }
          ]);
          return;
        }
        
        // Add file message to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Math.random().toString(), 
            content: "", 
            role: "assistant",
            type: "file",
            fileData: {
              name: "Life Product Model Manual v1.0.pdf",
              type: "application/pdf",
              url: downloadUrl,
              blob: pdfBlob
            }
          },
        ]);
        
        hideEmptyStateButtons();
        return;
      }
      
      if (messageValue === "/spreadsheet") {
        // Handle Spreadsheet generation command
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);
        
        // Load actual spreadsheet file from public directory
        const spreadsheetUrl = "/North American_Distributor_Scorecards.xlsx";
        let spreadsheetBlob: Blob;
        let downloadUrl: string;
        
        try {
          const response = await fetch(spreadsheetUrl);
          if (!response.ok) {
            throw new Error(`Failed to load spreadsheet: ${response.statusText}`);
          }
          spreadsheetBlob = await response.blob();
          downloadUrl = URL.createObjectURL(spreadsheetBlob);
        } catch (error) {
          console.error("Error loading spreadsheet:", error);
          // Show error message if file can't be loaded
          setMessages((prevMessages) => [
            ...prevMessages,
            { 
              id: Math.random().toString(), 
              content: "Error loading spreadsheet file", 
              role: "assistant"
            }
          ]);
          return;
        }
        
        // Add file message to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Math.random().toString(), 
            content: "", 
            role: "assistant",
            type: "file",
            fileData: {
              name: "North American_Distributor_Scorecards.xlsx",
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              url: downloadUrl,
              blob: spreadsheetBlob
            }
          },
        ]);
        
        hideEmptyStateButtons();
        return;
      }
      
      if (messageValue === "/png") {
        // Handle PNG image command
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);

        // Load actual PNG file from public directory
        const pngUrl = "/ChatGPT Image Aug 10, 2025, 03_36_33 PM.png";
        let pngBlob: Blob;
        let downloadUrl: string;

        try {
          const response = await fetch(pngUrl);
          if (!response.ok) {
            throw new Error(`Failed to load PNG: ${response.statusText}`);
          }
          pngBlob = await response.blob();
          downloadUrl = URL.createObjectURL(pngBlob);
        } catch (error) {
          console.error("Error loading PNG:", error);
          // Show error message if file can't be loaded
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "Error loading PNG file",
              role: "assistant"
            }
          ]);
          return;
        }

        // Add file message to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Math.random().toString(),
            content: "",
            role: "assistant",
            type: "file",
            fileData: {
              name: "ChatGPT Image Aug 10, 2025, 03_36_33 PM.png",
              type: "image/png",
              url: downloadUrl,
              blob: pngBlob
            }
          },
        ]);

        hideEmptyStateButtons();
        return;
      }

      if (messageValue === "/md") {
        // Handle Markdown rendering command
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);

        // Load markdown file from public directory
        const markdownUrl = "/life-expectancy-calculator.md";

        try {
          const response = await fetch(markdownUrl);
          if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
          }
          const markdownText = await response.text();

          // Create blob for download
          const markdownBlob = new Blob([markdownText], { type: 'text/markdown' });
          const downloadUrl = URL.createObjectURL(markdownBlob);

          // Add markdown message to chat with both inline rendering and file data
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "",
              role: "assistant",
              type: "markdown",
              markdownContent: markdownText,
              fileData: {
                name: "life-expectancy-calculator.md",
                type: "text/markdown",
                url: downloadUrl,
                blob: markdownBlob
              }
            },
          ]);
        } catch (error) {
          console.error("Error loading markdown:", error);
          // Show error message if file can't be loaded
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "Error loading markdown file",
              role: "assistant"
            }
          ]);
        }

        hideEmptyStateButtons();
        return;
      }

      if (messageValue === "/md2") {
        // Handle Long Markdown rendering command for scroll testing
        setInput("");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Math.random().toString(), content: messageValue, role: "user" },
        ]);

        // Load long markdown file from public directory
        const markdownUrl = "/life-expectancy-calculator-long.md";

        try {
          const response = await fetch(markdownUrl);
          if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
          }
          const markdownText = await response.text();

          // Create blob for download
          const markdownBlob = new Blob([markdownText], { type: 'text/markdown' });
          const downloadUrl = URL.createObjectURL(markdownBlob);

          // Add markdown message to chat with both inline rendering and file data
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "",
              role: "assistant",
              type: "markdown",
              markdownContent: markdownText,
              fileData: {
                name: "life-expectancy-calculator-long.md",
                type: "text/markdown",
                url: downloadUrl,
                blob: markdownBlob
              }
            },
          ]);
        } catch (error) {
          console.error("Error loading markdown:", error);
          // Show error message if file can't be loaded
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Math.random().toString(),
              content: "Error loading markdown file",
              role: "assistant"
            }
          ]);
        }

        hideEmptyStateButtons();
        return;
      }
    }

    // Check for command aliases
    if (messageValue in commands.aliases) {
      messageValue = commands.aliases[messageValue as keyof typeof commands.aliases];
    }
    
    // Hide empty state buttons when user sends a message
    hideEmptyStateButtons();

    setInput("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Math.random().toString(), content: messageValue, role: "user" },
    ]);
    setIsLoading(true);

    try {
      let response: string;

      // Route to SIM-KB backend if in sim mode
      if (isSimMode) {
        console.log('🔍 In SIM mode, calling sim backend with:', messageValue);
        const simResponse = await fetch('http://localhost:5001/sim/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageValue,
            session_id: 'default'
          })
        });

        if (!simResponse.ok) {
          throw new Error(`SIM-KB server error: ${simResponse.statusText}`);
        }

        const simData = await simResponse.json();
        if (!simData.success) {
          throw new Error(simData.error || 'SIM-KB server returned error');
        }

        response = simData.response;
        console.log('🔍 Got response from SIM backend:', response);
      } else {
        // Send message directly to Rainbow Bridge - just text in, text out
        console.log('🔍 About to call sendWebSocketMessage with:', messageValue);
        response = await sendWebSocketMessage(messageValue);
        console.log('🔍 Got response from sendWebSocketMessage:', response);
      }
      
      // Setup markdown renderer
      let renderer = new Renderer();
      renderer.paragraph = (text) => {
        return text + "\n";
      };
      renderer.list = (text) => {
        return `${text}\n\n`;
      };
      renderer.listitem = (text) => {
        return `\n• ${text}`;
      };
      renderer.code = (code, language) => {
        const validLanguage = hljs.getLanguage(language || "")
          ? language
          : "plaintext";
        const highlightedCode = hljs.highlight(
          code,
          { language: validLanguage || "plaintext" },
        ).value;
        return `<pre class="highlight bg-gray-700" style="padding: 5px; border-radius: 5px; overflow: auto; overflow-wrap: anywhere; white-space: pre-wrap; max-width: 100%; display: block; line-height: 1.2"><code class="${language}" style="color: ${codeHighlight.text}; font-size: 12px; ">${highlightedCode}</code></pre>`;
      };
      marked.setOptions({ renderer });

      const parsedResult = marked.parse(response);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Math.random().toString(),
          content: parsedResult.trim(),
          role: "assistant",
        },
      ]);
      
    } catch (error) {
      // Remove user message on error and restore input
      setMessages((prevMessages) => prevMessages.slice(0, -1));
      setInput(messageValue);
      console.error("Connection error:", error);
      
      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: Math.random().toString(), 
          content: content.errors.generalWebsocketError.replace('{error}', error instanceof Error ? error.message : String(error)), 
          role: "assistant" 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInitialQuestion = async (question: string) => {
    console.log('=== sendInitialQuestion called ===');
    console.log('Question received:', question);
    console.log('Current WebSocket state:', { wsStatus, isConnected, error: wsError });
    try {
      await sendMessage(question);
    } catch (e) {
      console.error("Error sending initial question:", e);
    }
  };


  return (
    <div className={`flex flex-col h-screen transition-colors duration-200`}
      style={{ backgroundColor: themeColors.background }}>
      {/* Header with memory slider */}
      <div className={`flex-shrink-0 p-6 border-b transition-colors duration-200`}
        style={{ 
          backgroundColor: isDarkMode ? themeColors.chakra.gray[800] : themeColors.background,
          borderColor: isDarkMode ? themeColors.chakra.gray[700] : themeColors.chakra.gray[200]
        }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h1 className={`text-2xl font-medium transition-colors duration-200`}
              style={{ 
                color: themeColors.text,
                fontFamily: fontFamilies.roboto 
              }}>{content.app.appName}</h1>
            <img 
              src="/lns-logo.png" 
              alt="Life Nervous System Logo" 
              className="w-12 h-12 ml-3"
            />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Memory slider in header */}
        <div className="mb-2">
          <MemorySlider
            memories={memories}
            onSelect={selectMemory}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-row flex-1 min-h-0">
        {/* Left Sidebar - Structured Input */}
        <StructuredInput
          width={structuredInputWidth}
          onResize={setStructuredInputWidth}
          isMinimized={isStructuredInputMinimized}
          onToggleMinimize={toggleStructuredInput}
        />

        {/* Main Chat Area */}
        <div 
          ref={mainChatRef}
          className={`flex-1 flex flex-col min-w-0 transition-colors duration-200`}
          style={{ backgroundColor: themeColors.background }}
        >
          {mainChatWidth > 200 ? (
            <>
              {messages.length > 0 ? (
                <>
                  {/* Main question */}
                  <div className="flex-shrink-0 p-6">
                    <h2 className={`text-2xl font-medium text-center mb-6 transition-colors duration-200`}
                      style={{ color: themeColors.text }}
                      dangerouslySetInnerHTML={{ __html: content.app.mainQuestion }}>
                    </h2>
                  </div>

                  {/* Messages */}
                  <div
                    className="flex flex-col-reverse flex-1 overflow-auto px-4"
                    ref={messageContainerRef}
                  >
                    {[...messages]
                      .reverse()
                      .map((m, index) => (
                        <ChatMessageBubble
                          key={m.id}
                          message={{ ...m }}
                          aiEmoji="🦜"
                          isMostRecent={index === 0}
                          messageCompleted={!isLoading}
                        ></ChatMessageBubble>
                      ))}
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 p-4">
                    <div className="max-w-2xl mx-auto">
                      <div className={`relative rounded-3xl border p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0`}
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]
                        }}>
                        <div className="pr-12">
                          <AutoResizeTextarea
                            value={input}
                            maxRows={5}
                            placeholder={content.placeholders.chatInput}
                            textColor={themeColors.text}
                            borderColor={"transparent"}
                            backgroundColor={"transparent"}
                            focusBorderColor="transparent"
                            fontFamily="'Inter', sans-serif"
                            fontSize="md"
                            _placeholder={{
                              fontSize: content.styles.placeholderFontSize
                            }}
                            _focus={{
                              boxShadow: "none",
                              outline: "none",
                            }}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={async (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              try {
                                await sendMessage();
                              } catch (error) {
                                console.error("Error in onKeyDown:", error);
                              }
                            } else if (e.key === "Enter" && e.shiftKey) {
                              e.preventDefault();
                              setInput(input + "\n");
                            }
                          }}
                          />
                        </div>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await sendMessage();
                            } catch (error) {
                              console.error("Error in onClick:", error);
                            }
                          }}
                          disabled={isLoading || !isConnected}
                          title={!isConnected ? `${content.tooltips.websocketError} ${wsStatus}` : content.buttons.send}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50 bg-black text-white border-2 border-black ${!isConnected ? 'border-red-500' : ''}`}
                        >
                          {isLoading ? <Spinner size="sm" /> : <ArrowUpIcon strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* LLM Integration Toggle */}
                    <div className="text-center mt-2">
                      <button 
                        onClick={toggleLLMIntegration}
                        className="text-xs transition-colors duration-200 hover:opacity-80 cursor-pointer"
                      >
                        <span>LLM Integration: </span>
                        <span style={{ 
                          color: isLLMIntegrationEnabled ? '#006400' : '#8B0000'
                        }}>
                          {isLLMIntegrationEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Music Ticker */}
                  <MusicTicker />
                  
                  {/* Hidden Footer - View Source */}
                  {false && ( // TODO: Set to true to show View Source button
                  <footer className="flex justify-center p-4">
                    <a
                      href={content.navigation.githubLink}
                      target="_blank"
                      className={`flex items-center transition-colors duration-200`}
                      style={{
                        color: isDarkMode ? themeColors.chakra.gray[400] : themeColors.chakra.gray[600]
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[800];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDarkMode ? themeColors.chakra.gray[400] : themeColors.chakra.gray[600];
                      }}
                    >
                      <img src="/images/github-mark.svg" className="h-4 mr-1" alt="GitHub" />
                      <span>{content.buttons.viewSource}</span>
                    </a>
                  </footer>
                  )}
                </>
              ) : (
                /* Empty state - properly centered */
                <>
                  {/* Top spacer */}
                  <div className="flex-1"></div>
                  
                  {/* Centered content group */}
                  <div className="flex-shrink-0 px-4">
                    {/* Main question */}
                    <h2 className={`text-2xl font-medium text-center mb-12 transition-colors duration-200`}
                      style={{ color: themeColors.text }}
                      dangerouslySetInnerHTML={{ __html: content.app.mainQuestion }}>
                    </h2>
                    
                    {/* EmptyState buttons */}
                    <div className="flex justify-center mb-8">
                      {showEmptyStateButtons && <EmptyState onChoice={sendInitialQuestion} />}
                    </div>
                    
                    {/* Input centered below buttons */}
                    <div className="max-w-2xl mx-auto">
                      <div className={`relative rounded-3xl border p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-0`}
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: isDarkMode ? themeColors.chakra.gray[600] : themeColors.chakra.gray[300]
                        }}>
                        <div className="pr-12">
                          <AutoResizeTextarea
                            value={input}
                            maxRows={5}
                            placeholder={content.placeholders.chatInput}
                            textColor={themeColors.text}
                            borderColor={"transparent"}
                            backgroundColor={"transparent"}
                            focusBorderColor="transparent"
                            fontFamily="'Inter', sans-serif"
                            fontSize="md"
                            _placeholder={{
                              fontSize: content.styles.placeholderFontSize
                            }}
                            _focus={{
                              boxShadow: "none",
                              outline: "none",
                            }}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={async (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              try {
                                await sendMessage();
                              } catch (error) {
                                console.error("Error in onKeyDown:", error);
                              }
                            } else if (e.key === "Enter" && e.shiftKey) {
                              e.preventDefault();
                              setInput(input + "\n");
                            }
                          }}
                          />
                        </div>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await sendMessage();
                            } catch (error) {
                              console.error("Error in onClick:", error);
                            }
                          }}
                          disabled={isLoading || !isConnected}
                          title={!isConnected ? `${content.tooltips.websocketError} ${wsStatus}` : content.buttons.send}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full w-9 h-9 flex items-center justify-center disabled:opacity-50 bg-black text-white border-2 border-black ${!isConnected ? 'border-red-500' : ''}`}
                        >
                          {isLoading ? <Spinner size="sm" /> : <ArrowUpIcon strokeWidth={3} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* LLM Integration Toggle */}
                    <div className="text-center mt-2">
                      <button 
                        onClick={toggleLLMIntegration}
                        className="text-xs transition-colors duration-200 hover:opacity-80 cursor-pointer"
                      >
                        <span>LLM Integration: </span>
                        <span style={{ 
                          color: isLLMIntegrationEnabled ? '#006400' : '#8B0000'
                        }}>
                          {isLLMIntegrationEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Bottom spacer */}
                  <div className="flex-1"></div>
                  
                  {/* Music Ticker */}
                  <div className="flex-shrink-0">
                    <MusicTicker />
                  </div>
                  
                  {/* Hidden Footer - View Source */}
                  {false && ( // TODO: Set to true to show View Source button
                  <footer className="flex-shrink-0 flex justify-center p-4">
                    <a
                      href={content.navigation.githubLink}
                      target="_blank"
                      className={`flex items-center transition-colors duration-200`}
                      style={{
                        color: isDarkMode ? themeColors.chakra.gray[400] : themeColors.chakra.gray[600]
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = isDarkMode ? themeColors.chakra.gray[200] : themeColors.chakra.gray[800];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDarkMode ? themeColors.chakra.gray[400] : themeColors.chakra.gray[600];
                      }}
                    >
                      <img src="/images/github-mark.svg" className="h-4 mr-1" alt="GitHub" />
                      <span>{content.buttons.viewSource}</span>
                    </a>
                  </footer>
                  )}
                </>
              )}
            </>
          ) : (
            /* Drag indicator when too narrow */
            <div className="flex-1 flex items-center justify-center">
              <div className={`text-center select-none transition-colors duration-200`}
                style={{ color: isDarkMode ? themeColors.chakra.gray[500] : themeColors.chakra.gray[400] }}>
                <div className="flex items-center gap-2 text-sm">
                  <span>←</span>
                  <span>{content.labels.dragToDisplay}</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Structured Output */}
        {(isStructuredOutputOpen || !isStructuredOutputMinimized) && (
          <StructuredOutputDock
            isOpen={isStructuredOutputOpen || !isStructuredOutputMinimized}
            width={structuredOutputDockWidth}
            onResize={setStructuredOutputDockWidth}
            isMinimized={isStructuredOutputMinimized}
            onToggleMinimize={toggleStructuredOutput}
          />
        )}
      </div>
    </div>
  );
}
