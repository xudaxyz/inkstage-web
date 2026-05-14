import SockJS from 'sockjs-client';
import * as Stomp from '@stomp/stompjs';
import type { MessageHandler, WebSocketEvent } from '../types/websocket';

class WebSocketService {
  private stompClient: Stomp.Client | null = null;
  private messageHandlers: Map<WebSocketEvent, MessageHandler[]> = new Map();

  isConnected(): boolean {
    return this.stompClient?.active ?? false;
  }

  connect(): Promise<void> {
    if (this.isConnected()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const socket = new SockJS(`${baseUrl}/ws`);
        this.stompClient = new Stomp.Client({
          webSocketFactory: (): WebSocket => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          onConnect: (): void => {
            const userId = localStorage.getItem('userId');
            if (userId) {
              this.stompClient?.subscribe(`/user/${userId}/notification/new`, (message) => {
                this.handleMessage('notification', JSON.parse(message.body));
              });
              this.stompClient?.subscribe(`/user/${userId}/notification/unread-count`, (message) => {
                this.handleMessage('unreadCount', parseInt(message.body));
              });
            }
            resolve();
          },
          onStompError: (error): void => {
            console.error('WebSocket connection error:', error);
            reject(error);
          },
          onWebSocketClose: (): void => {
            console.log('WebSocket connection closed');
          }
        });
        this.stompClient.activate();
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  reconnect(): Promise<void> {
    this.disconnect();
    return this.connect();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate().then();
      this.stompClient = null;
    }
  }

  on(event: WebSocketEvent, handler: MessageHandler): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(handler);
  }

  off(event: WebSocketEvent, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      this.messageHandlers.set(
        event,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  private handleMessage(type: WebSocketEvent, data: unknown): void {
    const handlers = this.messageHandlers.get(type);
    handlers?.forEach((handler) => handler(data));
  }
}

export default new WebSocketService();
