// WebSocket 事件类型
export type WebSocketEvent = 'notification' | 'unreadCount';

// 通知类型
export interface NotificationMessage {
  id: number;
  type: string;
  title: string;
  content: string;
  relatedId: number;
  actionUrl: string;
  readStatus: string;
  createTime: string;
}

// WebSocket 消息处理器类型
export type MessageHandler = (data: unknown) => void;
