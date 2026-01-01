import { useState, useEffect, useRef } from 'react';
import { WebSocketConnectionService } from '../services/connectionService';

export const useWebSocket = () => {
  const [connectionService] = useState(() => new WebSocketConnectionService());
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
    console.log('🔍 useWebSocket sendMessage called with:', content);
    console.log('🔍 Current connection status:', status);
    try {
      setError(null);
      const result = await connectionService.sendMessage(content);
      console.log('🔍 useWebSocket got result:', result);
      return result;
    } catch (err) {
      console.log('🔍 useWebSocket caught error:', err);
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