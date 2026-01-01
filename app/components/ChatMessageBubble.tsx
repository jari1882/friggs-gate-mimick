import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { emojisplosion } from "emojisplosion";
import { useState, useRef } from "react";
import DOMPurify from "dompurify";
import { SourceBubble, Source } from "./SourceBubble";
import {
  VStack,
  Flex,
  Heading,
  HStack,
  Box,
  Button,
  Divider,
  Spacer,
} from "@chakra-ui/react";
// HTTP API features removed for pure WebSocket implementation
import { InlineCitation } from "./InlineCitation";
import { useFriggState } from '../hooks/useFriggState';
import { DownloadIcon } from '@chakra-ui/icons';
import dynamic from 'next/dynamic';

// Dynamically import PDF component to avoid SSR issues
const PDFPreviewOverlay = dynamic(() => import('./PDFPreviewOverlay'), {
  ssr: false,
  loading: () => <div>Loading PDF viewer...</div>
});

// Dynamically import Markdown component
const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: false,
  loading: () => <div>Loading markdown...</div>
});

export type Message = {
  id: string;
  createdAt?: Date;
  content: string;
  role: "system" | "user" | "assistant" | "function";
  runId?: string;
  sources?: Source[];
  name?: string;
  function_call?: { name: string };
  type?: "file" | "markdown";
  fileData?: {
    name: string;
    type: string;
    url: string;
    blob: Blob;
  };
  markdownContent?: string;
};
export type Feedback = {
  feedback_id: string;
  run_id: string;
  key: string;
  score: number;
  comment?: string;
};

const filterSources = (sources: Source[]) => {
  const filtered: Source[] = [];
  const urlMap = new Map<string, number>();
  const indexMap = new Map<number, number>();
  sources.forEach((source, i) => {
    const { url } = source;
    const index = urlMap.get(url);
    if (index === undefined) {
      urlMap.set(url, i);
      indexMap.set(i, filtered.length);
      filtered.push(source);
    } else {
      const resolvedIndex = indexMap.get(index);
      if (resolvedIndex !== undefined) {
        indexMap.set(i, resolvedIndex);
      }
    }
  });
  return { filtered, indexMap };
};

const createAnswerElements = (
  content: string,
  filteredSources: Source[],
  sourceIndexMap: Map<number, number>,
  highlighedSourceLinkStates: boolean[],
  setHighlightedSourceLinkStates: React.Dispatch<
    React.SetStateAction<boolean[]>
  >,
) => {
  const matches = Array.from(content.matchAll(/\[\^?\$?{?(\d+)}?\^?\]/g));
  const elements: JSX.Element[] = [];
  let prevIndex = 0;

  matches.forEach((match) => {
    const sourceNum = parseInt(match[1], 10);
    const resolvedNum = sourceIndexMap.get(sourceNum) ?? 10;
    if (match.index !== null && resolvedNum < filteredSources.length) {
      elements.push(
        <span
          key={`content:${prevIndex}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content.slice(prevIndex, match.index)),
          }}
        ></span>,
      );
      elements.push(
        <InlineCitation
          key={`citation:${prevIndex}`}
          source={filteredSources[resolvedNum]}
          sourceNumber={resolvedNum}
          highlighted={highlighedSourceLinkStates[resolvedNum]}
          onMouseEnter={() =>
            setHighlightedSourceLinkStates(
              filteredSources.map((_, i) => i === resolvedNum),
            )
          }
          onMouseLeave={() =>
            setHighlightedSourceLinkStates(filteredSources.map(() => false))
          }
        />,
      );
      prevIndex = (match?.index ?? 0) + match[0].length;
    }
  });
  elements.push(
    <span
      key={`content:${prevIndex}`}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content.slice(prevIndex)),
      }}
    ></span>,
  );
  return elements;
};

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  isMostRecent: boolean;
  messageCompleted: boolean;
}) {
  const { role, content, runId, type, fileData, markdownContent } = props.message;
  const isUser = role === "user";
  const isFileMessage = type === "file";
  const isMarkdownMessage = type === "markdown";
  // Feedback and trace features removed for pure WebSocket implementation
  const { isDarkMode } = useFriggState();
  const [showFilePreview, setShowFilePreview] = useState(false);

  const cumulativeOffset = function (element: HTMLElement | null) {
    var top = 0,
      left = 0;
    do {
      top += element?.offsetTop || 0;
      left += element?.offsetLeft || 0;
      element = (element?.offsetParent as HTMLElement) || null;
    } while (element);

    return {
      top: top,
      left: left,
    };
  };

  // HTTP API functions removed for pure WebSocket implementation

  const sources = props.message.sources ?? [];
  const { filtered: filteredSources, indexMap: sourceIndexMap } =
    filterSources(sources);

  // Use an array of highlighted states as a state since React
  // complains when creating states in a loop
  const [highlighedSourceLinkStates, setHighlightedSourceLinkStates] = useState(
    filteredSources.map(() => false),
  );
  const answerElements =
    role === "assistant"
      ? createAnswerElements(
          content,
          filteredSources,
          sourceIndexMap,
          highlighedSourceLinkStates,
          setHighlightedSourceLinkStates,
        )
      : [];

  const animateButton = (buttonId: string, buttonRef: React.RefObject<HTMLButtonElement>, emoji: string[]) => {
    const button = buttonRef.current;
    if (!button) return;
    
    button.classList.add("animate-ping");
    setTimeout(() => {
      button.classList.remove("animate-ping");
    }, 500);

    emojisplosion({
      emojiCount: 10,
      uniqueness: 1,
      position() {
        const offset = cumulativeOffset(button);
        return {
          x: offset.left + button.clientWidth / 2,
          y: offset.top + button.clientHeight / 2,
        };
      },
      emojis: emoji,
    });
  };

  return (
    <VStack align="start" spacing={5} pb={5}>
      {!isUser && filteredSources.length > 0 && (
        <>
          <Flex direction={"column"} width={"100%"}>
            <VStack spacing={"5px"} align={"start"} width={"100%"}>
              <Heading
                fontSize="lg"
                fontWeight={"medium"}
                mb={1}
                color={"blue.300"}
                paddingBottom={"10px"}
              >
                Sources
              </Heading>
              <HStack spacing={"10px"} maxWidth={"100%"} overflow={"auto"}>
                {filteredSources.map((source, index) => (
                  <Box key={index} alignSelf={"stretch"} width={40}>
                    <SourceBubble
                      source={source}
                      highlighted={highlighedSourceLinkStates[index]}
                      onMouseEnter={() =>
                        setHighlightedSourceLinkStates(
                          filteredSources.map((_, i) => i === index),
                        )
                      }
                      onMouseLeave={() =>
                        setHighlightedSourceLinkStates(
                          filteredSources.map(() => false),
                        )
                      }
                      runId={runId}
                    />
                  </Box>
                ))}
              </HStack>
            </VStack>
          </Flex>

          <Heading size="lg" fontWeight="medium" color="blue.300">
            Answer
          </Heading>
        </>
      )}

      {isUser ? (
        <Heading size="lg" fontWeight="medium" color={isDarkMode ? "white" : "gray.800"}>
          {content}
        </Heading>
      ) : isMarkdownMessage && markdownContent ? (
        <MarkdownRenderer content={markdownContent} />
      ) : (
        <Box className="whitespace-pre-wrap" color={isDarkMode ? "white" : "gray.800"}>
          {answerElements}
        </Box>
      )}

      {/* HTTP API feedback buttons removed for pure WebSocket implementation */}

      {/* File link rendering - for both file type and markdown type with fileData */}
      {(isFileMessage || isMarkdownMessage) && fileData && (
        <Box>
          <HStack spacing={3} align="center">
            <Button
              variant="link"
              color="blue.500"
              fontWeight="medium"
              onClick={() => {
                if (fileData.type === "application/pdf" ||
                    fileData.type.includes("spreadsheet") ||
                    fileData.type.includes("excel") ||
                    fileData.type.startsWith("image/") ||
                    fileData.type === "text/markdown") {
                  setShowFilePreview(true);
                }
              }}
              _hover={{ textDecoration: "underline" }}
            >
              {fileData.name}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileData.url;
                link.download = fileData.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              title="Download file"
            >
              <DownloadIcon />
            </Button>
          </HStack>
        </Box>
      )}

      {/* File Preview Overlay - for both file type and markdown type */}
      {(isFileMessage || isMarkdownMessage) && fileData && showFilePreview && (
        <PDFPreviewOverlay
          isOpen={showFilePreview}
          onClose={() => setShowFilePreview(false)}
          fileData={fileData}
          markdownContent={markdownContent}
        />
      )}

      {!isUser && <Divider mt={4} mb={4} />}
    </VStack>
  );
}
