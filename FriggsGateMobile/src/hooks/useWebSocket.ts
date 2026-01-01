import { useState, useEffect, useRef } from 'react';
import { MobileWebSocketService } from '../services/connectionService';

export const useWebSocket = () => {
  const [connectionService] = useState(() => new MobileWebSocketService());
  const [status, setStatus] = useState(connectionService.status);
  const [error, setError] = useState<string | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout>();

  // Monitor connection status
  useEffect(() => {
    statusCheckInterval.current = setInterval(() => {
      setStatus(connectionService.status);
    }, 100);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [connectionService]);

  // Auto-connect on mount
  useEffect(() => {
    connectionService.connect();

    return () => {
      connectionService.disconnect();
    };
  }, [connectionService]);

  const sendMessage = async (content: string): Promise<string> => {
    try {
      setError(null);
      const result = await connectionService.sendMessage(content);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    status,
    error,
    sendMessage,
    connect: () => connectionService.connect(),
    disconnect: () => connectionService.disconnect(),
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
  };
};