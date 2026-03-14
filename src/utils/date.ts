/**
 * 日期工具类
 * 提供日期格式化、解析等功能
 */

// 日期格式化选项类型
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
}

/**
 * 格式化日期为指定格式
 * @param date 日期对象、时间戳或日期字符串
 * @param options 格式化选项
 * @param locale 语言环境，默认为中文
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | number | string,
  options: DateFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
  locale: string = 'zh-CN'
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '无效日期';
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '无效日期';
  }
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDateOnly = (date: Date | number | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 格式化日期为 YYYY-MM-DD HH:mm:ss 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | number | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 格式化日期为 YYYY-MM-DD HH:mm 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTimeShort = (date: Date | number | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 格式化时间为 HH:mm:ss 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的时间字符串
 */
export const formatTimeOnly = (date: Date | number | string): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 格式化时间为 HH:mm 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的时间字符串
 */
export const formatTimeShort = (date: Date | number | string): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 获取相对时间描述
 * @param date 日期对象、时间戳或日期字符串
 * @returns 相对时间描述
 */
export const getRelativeTime = (date: Date | number | string): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}个月前`;
    } else {
      return `${Math.floor(diffDays / 365)}年前`;
    }
  } catch (error) {
    console.error('相对时间计算失败:', error);
    return '无效日期';
  }
};

/**
 * 解析日期字符串为日期对象
 * @param dateString 日期字符串
 * @returns 日期对象
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * 检查日期是否有效
 * @param date 日期对象、时间戳或日期字符串
 * @returns 是否有效
 */
export const isValidDate = (date: Date | number | string): boolean => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};
