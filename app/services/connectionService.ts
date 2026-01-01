// Clean connection service - pure transport layer
// Sends text → receives text, no business logic

export interface ConnectionService {
  sendMessage(content: string): Promise<string>;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  connect(): void;
  disconnect(): void;
}

export interface RainbowBridgeMessage {
  type: 'chat_message';
  payload: {
    content: string;
  };
}

export interface RainbowBridgeResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export class WebSocketConnectionService implements ConnectionService {
  private ws: WebSocket | null = null;
  private _status: ConnectionService['status'] = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private wsEndpoint: string;

  constructor(wsEndpoint: string = 'ws://localhost:8001/ws') {
    this.wsEndpoint = wsEndpoint;
  }

  get status(): ConnectionService['status'] {
    return this._status;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this._status = 'connecting';
    
    try {
      this.ws = new WebSocket(this.wsEndpoint);
      
      this.ws.onopen = () => {
        console.log('🔌 Connected to Rainbow Bridge');
        this._status = 'connected';
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Disconnected from Rainbow Bridge');
        this._status = 'disconnected';
        this.ws = null;

        // Auto-reconnect unless clean disconnect
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };

      this.ws.onerror = () => {
        console.error('❌ Rainbow Bridge connection error');
        this._status = 'error';
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this._status = 'error';
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this._status = 'disconnected';
    this.reconnectAttempts = 0;
  }

  async sendMessage(content: string): Promise<string> {
    console.log('🔍 sendMessage debug:', {
      content,
      hasWs: !!this.ws,
      wsReadyState: this.ws?.readyState,
      wsReadyStateOpen: WebSocket.OPEN,
      status: this._status,
      wsReadyStateMatch: this.ws?.readyState === WebSocket.OPEN
    });
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to Rainbow Bridge');
    }

    return new Promise((resolve, reject) => {
      const message: RainbowBridgeMessage = {
        type: 'chat_message',
        payload: { content }
      };

      const handleResponse = (event: MessageEvent) => {
        try {
          const response: RainbowBridgeResponse = JSON.parse(event.data);
          this.ws?.removeEventListener('message', handleResponse);

          if (response.success && response.content) {
            resolve(response.content);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      };

      this.ws!.addEventListener('message', handleResponse);
      this.ws!.send(JSON.stringify(message));
    });
  }
}