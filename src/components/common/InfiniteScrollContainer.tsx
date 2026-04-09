import React from 'react';
import { Button, Spin } from 'antd';
import type { InfiniteScrollResult } from '../../types/infiniteScroll';

interface InfiniteScrollContainerProps<T> {
  /** 无限滚动hook返回的结果 */
  infiniteScroll: InfiniteScrollResult<T>;
  /** 渲染列表项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 空状态显示内容 */
  emptyContent?: React.ReactNode;
  /** 加载中显示内容 */
  loadingContent?: React.ReactNode;
  /** 加载更多时显示内容 */
  loadingMoreContent?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 列表项之间的间距 */
  itemGap?: string;
  /** 是否显示加载更多按钮（而非自动加载） */
  showLoadMoreButton?: boolean;
  /** 加载更多按钮文字 */
  loadMoreText?: string;
  /** 没有更多数据时显示的文字 */
  noMoreText?: string;
}

/**
 * 无限滚动容器组件
 * 封装了无限滚动的通用UI逻辑
 */
export function InfiniteScrollContainer<T>({
  infiniteScroll,
  renderItem,
  emptyContent,
  loadingContent,
  loadingMoreContent,
  className = '',
  itemGap = '16px',
  showLoadMoreButton = false,
  loadMoreText = '加载更多',
  noMoreText = '没有更多数据了'
}: InfiniteScrollContainerProps<T>): React.ReactNode {
  const { data, isLoading, isLoadingMore, isError, error, hasMore, loadMoreRef, refresh } = infiniteScroll;

  // 默认加载中内容
  const defaultLoadingContent = (
    <div className="py-12 flex justify-center">
      <Spin size="large" tip="加载中..." />
    </div>
  );

  // 默认加载更多内容
  const defaultLoadingMoreContent = (
    <div className="py-6 flex justify-center">
      <Spin size="small" tip="加载更多..." />
    </div>
  );

  // 默认空状态
  const defaultEmptyContent = <div className="py-12 text-center text-gray-500">暂无数据</div>;

  // 错误状态
  if (isError && data.length === 0) {
    console.log(error);
    // 错误状态或网络状态不显示错误
  }

  // 初始加载中
  if (isLoading && data.length === 0) {
    return loadingContent || defaultLoadingContent;
  }

  // 空状态
  if (!isLoading && data.length === 0) {
    return emptyContent || defaultEmptyContent;
  }

  return (
    <div className={className}>
      {/* 数据列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {data.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))}
      </div>

      {/* 加载更多区域 */}
      <div ref={loadMoreRef} className="mt-4">
        {isLoadingMore && (loadingMoreContent || defaultLoadingMoreContent)}

        {!isLoadingMore && !hasMore && data.length > 0 && (
          <div className="py-4 text-center text-gray-400 text-sm">{noMoreText}</div>
        )}

        {showLoadMoreButton && hasMore && !isLoadingMore && (
          <div className="py-4 flex justify-center">
            <Button type="primary" onClick={refresh}>
              {loadMoreText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfiniteScrollContainer;
