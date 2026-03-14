import { message } from 'antd';
import { useUserStore } from '../store';

/**
 * 错误类型定义
 */
export const ErrorType = {
  AUTH_ERROR: 'AUTH_ERROR',      // 认证错误
  NETWORK_ERROR: 'NETWORK_ERROR',  // 网络错误
  SERVER_ERROR: 'SERVER_ERROR',    // 服务器错误
  CLIENT_ERROR: 'CLIENT_ERROR',    // 客户端错误
  VALIDATION_ERROR: 'VALIDATION_ERROR', // 验证错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'   // 未知错误
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * 错误处理配置
 */
interface ErrorHandlerConfig {
  showMessage?: boolean;           // 是否显示错误消息
  redirectToLogin?: boolean;        // 是否跳转到登录页
  redirectDelay?: number;           // 跳转延迟时间（毫秒）
  customMessage?: string;           // 自定义错误消息
}

/**
 * 全局错误处理服务
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor () {}

  /**
   * 获取单例实例
   */
  public static getInstance (): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   * @param error 错误对象
   * @param config 错误处理配置
   */
  public handleError (error: unknown, config?: ErrorHandlerConfig): void {
    const { showMessage = true, redirectToLogin = false, redirectDelay = 1500, customMessage } = config || {};

    // 分析错误类型
    const errorInfo = this.analyzeError(error);
    const errorMessage = customMessage || errorInfo.message;

    // 显示错误消息
    if (showMessage) {
      this.showErrorMessage(errorInfo.type, errorMessage);
    }

    // 处理认证错误
    if (errorInfo.type === ErrorType.AUTH_ERROR || redirectToLogin) {
      this.redirectToLogin(redirectDelay);
    }
  }

  /**
   * 分析错误类型和消息
   * @param error 错误对象
   */
  private analyzeError (error: unknown): { type: ErrorType; message: string } {
    if (error instanceof Error) {
      // 处理标准Error对象
      const errorMessage = error.message;

      // 检查是否是认证错误
      if (errorMessage.includes('登录') || errorMessage.includes('认证') || errorMessage.includes('401')) {
        return { type: ErrorType.AUTH_ERROR, message: errorMessage };
      }

      // 检查是否是网络错误
      if (errorMessage.includes('网络') || errorMessage.includes('Network') || errorMessage.includes('timeout')) {
        return { type: ErrorType.NETWORK_ERROR, message: errorMessage };
      }

      return { type: ErrorType.UNKNOWN_ERROR, message: errorMessage };
    }

    // 处理其他类型的错误
    if (typeof error === 'string') {
      return { type: ErrorType.UNKNOWN_ERROR, message: error };
    }

    // 处理对象类型的错误
    if (typeof error === 'object' && error !== null) {
      const errorMessage = (error as Error).message || '未知错误';
      return { type: ErrorType.UNKNOWN_ERROR, message: String(errorMessage) };
    }

    return { type: ErrorType.UNKNOWN_ERROR, message: '未知错误' };
  }

  /**
   * 显示错误消息
   * @param errorType 错误类型
   * @param errorMessage 错误消息
   */
  private showErrorMessage (errorType: ErrorType, errorMessage: string): void {
    switch (errorType) {
      case ErrorType.AUTH_ERROR:
        void message.error(errorMessage);
        break;
      case ErrorType.NETWORK_ERROR:
        void message.warning(errorMessage);
        break;
      case ErrorType.SERVER_ERROR:
        void message.error(errorMessage);
        break;
      case ErrorType.CLIENT_ERROR:
        void message.info(errorMessage);
        break;
      case ErrorType.VALIDATION_ERROR:
        void message.warning(errorMessage);
        break;
      default:
        void message.warning(errorMessage);
    }
  }

  /**
   * 处理认证错误
   * @param delay 跳转延迟时间
   */
  private redirectToLogin (delay: number): void {
    // 使用userStore的logout方法清除用户信息
    useUserStore.getState().logout();

    // 延迟跳转到登录页
    setTimeout(() => {
      window.location.href = '/login';
    }, delay);
  }

  /**
   * 处理API响应错误
   * @param error API错误对象
   */
  public handleApiError (error: unknown): void {
    this.handleError(error, {
      showMessage: true,
      redirectToLogin: false
    });
  }

  /**
   * 处理认证相关错误
   * @param error 认证错误对象
   */
  public handleAuthError (error: unknown): void {
    this.handleError(error, {
      showMessage: true,
      redirectToLogin: true,
      redirectDelay: 1500
    });
  }

}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

export default errorHandler;
