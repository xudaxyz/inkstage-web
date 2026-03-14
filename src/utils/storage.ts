/**
 * 存储工具类
 * 提供本地存储的统一操作方法
 */

/**
 * 存储数据到本地存储
 * @param key 存储键名
 * @param value 存储值
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('存储数据失败:', error);
  }
};

/**
 * 从本地存储获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的数据或默认值
 */
export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('获取数据失败:', error);
    return defaultValue;
  }
};

/**
 * 从本地存储移除数据
 * @param key 存储键名
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('移除数据失败:', error);
  }
};

/**
 * 清空本地存储
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('清空存储失败:', error);
  }
};

/**
 * 存储数据到会话存储
 * @param key 存储键名
 * @param value 存储值
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('存储会话数据失败:', error);
  }
};

/**
 * 从会话存储获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的数据或默认值
 */
export const getSessionStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error('获取会话数据失败:', error);
    return defaultValue;
  }
};

/**
 * 从会话存储移除数据
 * @param key 存储键名
 */
export const removeSessionStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('移除会话数据失败:', error);
  }
};

/**
 * 清空会话存储
 */
export const clearSessionStorage = (): void => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('清空会话存储失败:', error);
  }
};
