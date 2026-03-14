/**
 * 格式化工具类
 * 提供各种数据格式化方法（除日期外）
 */

/**
 * 格式化数字为千分位
 * @param num 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (amount: number, currency: string = '¥'): string => {
  return currency + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 格式化手机号（隐藏中间4位）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化邮箱（隐藏部分字符）
 * @param email 邮箱
 * @returns 格式化后的邮箱
 */
export const formatEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 3) {
    return username[0] + '***@' + domain;
  }
  return username.substring(0, 3) + '***@' + domain;
};

/**
 * 格式化身份证号（隐藏中间部分）
 * @param idCard 身份证号
 * @returns 格式化后的身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (idCard.length !== 18) return idCard;
  return idCard.substring(0, 6) + '********' + idCard.substring(14);
};

/**
 * 格式化文本（截断并添加省略号）
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 格式化后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * 格式化URL（截断并添加省略号）
 * @param url URL地址
 * @param maxLength 最大长度
 * @returns 格式化后的URL
 */
export const truncateUrl = (url: string, maxLength: number): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};
