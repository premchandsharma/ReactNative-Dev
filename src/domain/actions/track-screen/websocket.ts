import {EventEmitter} from 'events';
import {WebSocketClientConfig} from "./types";

class WebSocketClient extends EventEmitter {
  private webSocket: WebSocket | null = null;
  private isConnected = false;
  private readonly TAG = 'WebSocketClient';

  constructor() {
    super();
    this.setMaxListeners(100); // Equivalent to extraBufferCapacity in Kotlin
  }

  connect(config: WebSocketClientConfig): boolean {
    try {
      const wsUrl = new URL(config.url);

      this.webSocket = new WebSocket(wsUrl.toString(), [], {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Session-ID': config.sessionID,
        },
      });

      this.webSocket.onopen = () => {
        // console.log(`${this.TAG}: WebSocket connection opened`);
        this.isConnected = true;
        this.emit('open');
      };

      this.webSocket.onmessage = (event) => {
        // console.log(`${this.TAG}: WebSocket message received: ${event.data}`);
        this.emit('message', event.data);
      };

      this.webSocket.onclose = (event) => {
        // console.log(`${this.TAG}: WebSocket closed: ${event.code} ${event.reason}`);
        this.isConnected = false;
        this.emit('close', event);
      };

      this.webSocket.onerror = (event) => {
        // console.error(`${this.TAG}: WebSocket error:`, event);
        this.isConnected = false;
        this.emit('error', event);
      };

      return true;
    } catch (error) {
      console.error(`${this.TAG}: Error connecting to WebSocket:`, error);
      return false;
    }
  }

  isConnectedStatus(): boolean {
    return this.isConnected && this.webSocket !== null;
  }

  disconnect(): void {
    try {
      if (this.webSocket) {
        this.webSocket.close(1000, 'Disconnecting');
        this.webSocket = null;
      }
      this.isConnected = false;
      // console.log(`${this.TAG}: WebSocket disconnected`);
    } catch (error) {
      console.error(`${this.TAG}: Error disconnecting WebSocket:`, error);
    }
  }

  // Method to get message observable equivalent
  onMessage(callback: (message: string) => void): () => void {
    this.on('message', callback);
    return () => this.off('message', callback);
  }
}

export default WebSocketClient;
