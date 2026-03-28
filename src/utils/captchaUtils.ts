// 验证码工具函数

// 验证码图片路径数组
const captchaImagePaths = [
  '/src/assets/images/captcha/captcha-photo-1.jpg',
  '/src/assets/images/captcha/captcha-photo-2.jpg',
  '/src/assets/images/captcha/captcha-photo-3.jpg',
  '/src/assets/images/captcha/captcha-photo-4.jpg',
  '/src/assets/images/captcha/captcha-photo-5.jpg',
  '/src/assets/images/captcha/captcha-photo-6.jpg',
  '/src/assets/images/captcha/captcha-photo-7.jpg',
  '/src/assets/images/captcha/captcha-photo-8.jpg',
  '/src/assets/images/captcha/captcha-photo-9.jpg',
  '/src/assets/images/captcha/captcha-photo-10.jpg'
];

/**
 * 随机获取验证码图片路径
 * @returns 验证码图片路径
 */
export const getRandomCaptchaImage = (): string => {
  const randomIndex = Math.floor(Math.random() * captchaImagePaths.length);
  return captchaImagePaths[randomIndex];
};

/**
 * 动态导入验证码图片
 * @param index 图片索引
 * @returns 图片模块
 */
export const importCaptchaImage = async (index: number): Promise<string> => {
  try {
    const module = await import(`../assets/images/captcha/captcha-photo-${index}.jpg`);
    return module.default;
  } catch (error) {
    console.error('Failed to load captcha image:', error);
    //  fallback to a default image
    return captchaImagePaths[0];
  }
};

/**
 * 随机动态导入验证码图片
 * @returns 图片模块
 */
export const importRandomCaptchaImage = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * 10) + 1;
  return importCaptchaImage(randomIndex);
};
