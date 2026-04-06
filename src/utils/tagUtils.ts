import type { FrontTag } from '../types/tag';

// 预设标签颜色
export const tagColors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'purple'];

/**
 * 根据标签名称生成固定的颜色
 * @param tag 标签对象
 * @returns 颜色名称
 */
export const getTagColor = (tag: FrontTag): string => {
  // 基于标签名称生成一个固定的哈希值
  let hash = 0;
  for (let i = 0; i < tag.name.length; i++) {
    const char = tag.name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  // 使用哈希值获取颜色索引，确保每个标签都有固定的颜色
  const colorIndex = Math.abs(hash) % tagColors.length;
  return tagColors[colorIndex];
};
