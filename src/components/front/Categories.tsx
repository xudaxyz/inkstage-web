import React, { useRef, useState, useEffect, useMemo } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { FrontendCategory } from '../../types/category';

interface CategoriesProps {
    categories?: FrontendCategory[];
    onSelect?: (category: FrontendCategory | '全部') => void;
    selectedId?: number | undefined;
}

const Categories: React.FC<CategoriesProps> = ({
  categories = [],
  onSelect,
  selectedId = 0 // 默认全部分类
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showArrows, setShowArrows] = useState(false);

  // 计算当前选中的分类名称
  const selectedCategory = useMemo(() => {
    const category = categories.find(c => c.id === selectedId) || { id: 0, name: '全部' };
    return selectedId === 0 ? '全部' : category.name;
  }, [selectedId, categories]);

  // 检测滚动位置
  useEffect(() => {
    const checkScrollPosition = (): void => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10); // 有一点余量，避免精度问题
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 有一点余量
      }
    };

    // 初始化检查
    checkScrollPosition();

    // 添加滚动事件监听器
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return (): void => container.removeEventListener('scroll', checkScrollPosition);
    }
    return undefined;
  }, []);

  // 动态检测是否需要显示箭头
  useEffect(() => {
    const checkShowArrows = (): void => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowArrows(scrollWidth > clientWidth + 10); // 有一点余量，避免精度问题
      }
    };

    // 初始化检查
    checkShowArrows();

    // 使用 ResizeObserver 监测尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    const container = scrollContainerRef.current;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        checkShowArrows();
      });
      resizeObserver.observe(container);

      // 同时监测内部内容的变化
      const contentElement = container.firstElementChild;
      if (contentElement) {
        resizeObserver.observe(contentElement);
      }
    }

    // 清理函数
    return (): void => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [categories]);

  // 处理分类选择
  const handleCategorySelect = (category: FrontendCategory | '全部'): void => {
    if (onSelect) {
      onSelect(category);
    }
  };

  // 处理滚动
  const handleScroll = (direction: 'left' | 'right'): void => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // 检查是否可以滚动
      if (direction === 'left' && scrollLeft <= 10) return;
      if (direction === 'right' && scrollLeft >= scrollWidth - clientWidth - 10) return;

      // 获取所有分类元素
      const categoryElements = container.querySelectorAll('span');
      if (categoryElements.length === 0) return;

      // 计算要滚动的分类数量
      const categoriesToScroll = 3;

      // 找到当前可见的第一个分类
      let currentVisibleIndex = 0;
      for (let i = 0; i < categoryElements.length; i++) {
        const element = categoryElements[i] as HTMLElement;
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.left >= containerRect.left && rect.left <= containerRect.right) {
          currentVisibleIndex = i;
          break;
        }
      }

      // 计算目标分类索引
      const targetIndex = direction === 'left'
        ? Math.max(0, currentVisibleIndex - categoriesToScroll)
        : Math.min(categoryElements.length - 1, currentVisibleIndex + categoriesToScroll);

      // 滚动到目标分类的位置
      const targetElement = categoryElements[targetIndex] as HTMLElement;
      if (targetElement) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const scrollToPosition = scrollLeft + (targetRect.left - containerRect.left);

        // 确保滚动位置不会超出范围
        const newScrollLeft = Math.max(0, Math.min(scrollToPosition, scrollWidth - clientWidth));

        // 执行滚动
        container.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="mt-4 mb-4 relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 全部分类 - 固定在左侧 */}
      <span
        onClick={() => handleCategorySelect('全部')}
        className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap transform ${selectedCategory === '全部' ? 'bg-gray-100 text-gray-800 rounded-md scale-105' : 'text-gray-600 hover:bg-gray-50'}`}
      >
        全部
      </span>

      {/* 滚动容器 - 右侧分类列表 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto whitespace-nowrap py-2 scrollbar-hide ml-4"
        style={{ maxWidth: 'calc(100% - 150px)' }} // 限制宽度，默认显示9个分类
      >
        <div className="inline-flex items-center gap-4">
          {/* 其他分类 */}
          {categories.map((category) => (
            <span
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap transform ${selectedCategory === category.name ? 'bg-gray-100 text-gray-800 rounded-md scale-105' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>

      {/* 箭头容器 - 固定在最右侧 */}
      {showArrows && (
        <div className="flex items-center gap-1 ml-2">
          {/* 左箭头 */}
          <motion.button
            className="z-10 bg-transparent p-1 hover:bg-gray-100 rounded-full"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{
              opacity: isHovered && canScrollLeft ? 0.8 : 0.1,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: canScrollLeft ? 'pointer' : 'default' } as React.CSSProperties}
          >
            <LeftOutlined className={!canScrollLeft ? 'text-gray-300' : ''} />
          </motion.button>

          {/* 右箭头 */}
          <motion.button
            className="z-10 bg-transparent p-1 hover:bg-gray-100 rounded-full"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{
              opacity: isHovered && canScrollRight ? 0.8 : 0.1,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: canScrollRight ? 'pointer' : 'default' } as React.CSSProperties}
          >
            <RightOutlined className={!canScrollRight ? 'text-gray-300' : ''} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Categories;
