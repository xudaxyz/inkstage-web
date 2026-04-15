// 无限滚动相关类型定义
import type { ApiPageResponse } from './common';
import React from 'react';

/**
 * 无限滚动配置选项
 */
export interface InfiniteScrollOptions {
  /** 每页数据条数，默认10 */
  pageSize?: number;
  /** 触发加载的阈值（0-1），默认0 */
  threshold?: number;
  /** 是否重新验证第一页，默认false */
  revalidateFirstPage?: boolean;
  /** 是否保持size状态，默认true */
  persistSize?: boolean;
  /** 是否启用自动加载，默认true */
  autoLoad?: boolean;
  /** 是否启用自动重试，默认false */
  autoRetry?: boolean;
}

/**
 * 无限滚动返回结果
 */
export interface InfiniteScrollResult<T> {
  /** 所有已加载的数据 */
  data: T[];
  /** 是否正在加载初始数据 */
  isLoading: boolean;
  /** 是否正在加载更多数据 */
  isLoadingMore: boolean;
  /** 是否发生错误 */
  isError: boolean;
  /** 错误对象 */
  error: Error | null;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 加载更多元素的ref */
  loadMoreRef: (node: Element | null) => void;
  /** 刷新数据 */
  refresh: () => void;
  /** 总数 */
  total: number | 0;
  /** 当前加载的页数 */
  pageSize: number;
  /** 设置页数 */
  setPageSize: (pageSize: number | ((pageSize: number) => number)) => Promise<void>;
  /** 直接设置数据（用于乐观更新） */
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  /** 是否正在自动重试 */
  isAutoRetrying?: boolean;
  /** 当前重试次数 */
  retryCount?: number;
}

/**
 * 无限滚动列表项渲染函数类型
 */
export type RenderItemFn<T> = (item: T, index: number) => React.ReactNode;

/**
 * 获取数据的fetcher函数类型
 */
export type InfiniteFetcher<T> = (page: number, pageSize: number) => Promise<ApiPageResponse<T>>;
