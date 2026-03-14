/**
 * 验证工具类
 * 提供各种数据验证方法
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式
 * @param phone 手机号码
 * @returns 是否为有效手机号
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度等级（0-弱，1-中，2-强）
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;

  // 长度检查
  if (password.length >= 8) strength++;

  // 包含数字
  if (/\d/.test(password)) strength++;

  // 包含字母
  if (/[a-zA-Z]/.test(password)) strength++;

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 3);
};

/**
 * 验证是否为空
 * @param value 值
 * @returns 是否为空
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * 验证字符串长度
 * @param value 字符串
 * @param min 最小长度
 * @param max 最大长度
 * @returns 是否在指定长度范围内
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * 验证是否为数字
 * @param value 值
 * @returns 是否为数字
 */
export const isNumber = (value: unknown): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * 验证是否为整数
 * @param value 值
 * @returns 是否为整数
 */
export const isInteger = (value: unknown): boolean => {
  return Number.isInteger(Number(value));
};

/**
 * 验证是否为正整数
 * @param value 值
 * @returns 是否为正整数
 */
export const isPositiveInteger = (value: unknown): boolean => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否为有效URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证身份证号格式
 * @param idCard 身份证号
 * @returns 是否为有效身份证号
 */
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idCardRegex.test(idCard);
};
