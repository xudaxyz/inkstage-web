import { create } from 'zustand';
import notificationService from '../services/notificationService';
import { ReadStatus } from '../types/enums';
import type { Notification } from '../types/notification';

export interface NotificationState {
  // 状态
  unreadCount: number;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // 操作
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: number) => Promise<boolean>;
  setNotifications: (notifications: Notification[]) => void;
  resetError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 初始状态
  unreadCount: 0,
  notifications: [],
  isLoading: false,
  error: null,

  // 获取未读通知数量
  fetchUnreadCount: async () : Promise<void> => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.getUnreadCount();
      if (response.code === 200) {
        set({ unreadCount: response.data, isLoading: false });
      } else {
          new Error(response.message || '获取未读通知数量失败');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '网络错误',
        isLoading: false
      });
    }
  },

  // 设置未读通知数量
  setUnreadCount: (count: number) : void => {
    set({ unreadCount: count });
  },

  // 标记通知为已读
  markAsRead: async (id: number): Promise<boolean> => {
    const { notifications, unreadCount, setNotifications, setUnreadCount } = get();

    // 保存原始状态用于回滚
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

    // 乐观更新：立即更新本地状态
    const updatedNotifications = notifications.map((item) =>
      item.id === id ? { ...item, readStatus: ReadStatus.READ } : item
    );
    setNotifications(updatedNotifications);
    setUnreadCount(Math.max(0, unreadCount - 1));

    try {
      const response = await notificationService.markAsRead(id);
      if (response.code !== 200 || !response.data) {
         new Error(response.message || '标记已读失败');
      }
      return true;
    } catch (error) {
      // 回滚到原始状态
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
      set({ error: error instanceof Error ? error.message : '网络错误' });
      return false;
    }
  },

  // 标记所有通知为已读
  markAllAsRead: async (): Promise<boolean> => {
    const { notifications, setNotifications, setUnreadCount } = get();

    // 保存原始状态用于回滚
    const originalNotifications = [...notifications];
    const originalUnreadCount = get().unreadCount;

    // 乐观更新：立即更新本地状态
    const updatedNotifications = notifications.map((item) => ({
      ...item,
      readStatus: ReadStatus.READ
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);

    try {
      const response = await notificationService.markAllAsRead();
      if (response.code !== 200 || !response.data) {
         new Error(response.message || '标记全部已读失败');
      }
      return true;
    } catch (error) {
      // 回滚到原始状态
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
      set({ error: error instanceof Error ? error.message : '网络错误' });
      return false;
    }
  },

  // 删除通知
  deleteNotification: async (id: number): Promise<boolean> => {
    const { notifications, unreadCount, setNotifications, setUnreadCount } = get();

    // 保存原始状态用于回滚
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    const deletedNotification = notifications.find((n) => n.id === id);

    // 乐观更新：立即更新本地状态
    const updatedNotifications = notifications.filter((item) => item.id !== id);
    setNotifications(updatedNotifications);
    if (deletedNotification?.readStatus === ReadStatus.UNREAD) {
      setUnreadCount(Math.max(0, unreadCount - 1));
    }

    try {
      const response = await notificationService.deleteNotification(id);
      if (response.code !== 200 || !response.data) {
         new Error(response.message || '删除通知失败');
      }
      return true;
    } catch (error) {
      // 回滚到原始状态
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
      set({ error: error instanceof Error ? error.message : '网络错误' });
      return false;
    }
  },

  // 设置通知列表
  setNotifications: (notifications: Notification[]) : void => {
    set({ notifications });
  },

  // 重置错误
  resetError: () :void => {
    set({ error: null });
  }
}));

// 导出常用的选择器
export const useUnreadCount = () : number => useNotificationStore((state) => state.unreadCount);
export const useNotifications = () : Notification[] => useNotificationStore((state) => state.notifications);
export const useNotificationLoading = () :boolean => useNotificationStore((state) => state.isLoading);
export const useNotificationError = (): string | null => useNotificationStore((state) => state.error);
export const useMarkAsRead = (): (id: number) => Promise<boolean> => useNotificationStore((state) => state.markAsRead);
export const useMarkAllAsRead = (): () => Promise<boolean> => useNotificationStore((state) => state.markAllAsRead);
export const useDeleteNotification = (): (id: number) => Promise<boolean> => useNotificationStore((state) => state.deleteNotification);
export const useSetUnreadCount = (): (count: number) => void => useNotificationStore((state) => state.setUnreadCount);
export const useSetNotifications = (): (notifications: Notification[]) => void => useNotificationStore((state) => state.setNotifications);
export const useFetchUnreadCount = (): () => Promise<void> => useNotificationStore((state) => state.fetchUnreadCount);
