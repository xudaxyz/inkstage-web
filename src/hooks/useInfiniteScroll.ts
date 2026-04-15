import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { InfiniteScrollOptions, InfiniteScrollResult } from '../types/infiniteScroll';
import type { ApiPageResponse } from '../types/common';

/**
 * 通用无限滚动 Hook
 * 基于 react-intersection-observer 实现滚动加载
 *
 * @param fetcher 获取数据的函数
 * @param options 配置选项
 * @returns 无限滚动状态和操作
 */
export function useInfiniteScroll<T>(
  fetcher: (page: number, pageSize: number) => Promise<ApiPageResponse<T>>,
  options: InfiniteScrollOptions = {}
): InfiniteScrollResult<T> {
  const { pageSize = 10, threshold = 0, autoLoad = true, autoRetry = false } = options;
  // 数据状态
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  // 重试相关状态
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  // 重试配置
  const RETRY_INTERVALS = useMemo(() => [5000, 10000, 20000], []);
  const MAX_RETRY_COUNT = useMemo(() => RETRY_INTERVALS.length, [RETRY_INTERVALS]);
  // 使用 ref 来避免循环依赖
  const isLoadingRef = useRef(isLoading);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const hasMoreRef = useRef(hasMore);
  const pageRef = useRef(page);
  const retryCountRef = useRef(retryCount);
  // 同步 ref 和 state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);
  // 使用 intersection observer 检测滚动到底部
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false
  });
  /**
   * 加载数据
   * @param targetPage 目标页码
   * @param isRefresh 是否为刷新操作
   */
  const loadData = useCallback(
    async (targetPage: number, isRefresh = false) => {
      // 防止重复加载
      if (isLoadingRef.current || isLoadingMoreRef.current) return;
      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setIsError(false);
      setError(null);
      try {
        const response = await fetcher(targetPage, pageSize);
        if (isRefresh) {
          setData(response.record);
        } else {
          setData((prev) => [...prev, ...response.record]);
        }
        setTotal(response.total);
        setHasMore(!response.isLastPage && response.record.length > 0);
        setPage(targetPage);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error('加载数据失败'));
        console.error('无限滚动加载数据失败:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetcher, pageSize]
  );
  /**
   * 刷新数据
   */
  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setRetryCount(0);
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
    (async (): Promise<void> => {
      await loadData(1, true);
    })();
  }, [loadData, retryTimer]);
  /**
   * 设置页数（用于手动控制）
   */
  const setPageSize = useCallback(
    async (pageSize: number | ((pageSize: number) => number)) => {
      const newPageSize = typeof pageSize === 'function' ? pageSize(pageRef.current) : pageSize;
      if (newPageSize > pageRef.current) {
        await loadData(newPageSize, false);
      }
    },
    [loadData]
  );
  // 自动加载：当元素进入视口时加载更多
  useEffect(() => {
    if (autoLoad && inView && hasMoreRef.current && !isLoadingRef.current && !isLoadingMoreRef.current) {
      (async (): Promise<void> => {
        await loadData(pageRef.current + 1, false);
      })();
    }
  }, [autoLoad, inView, loadData]);
  // 初始加载
  useEffect(() => {
    if (data.length === 0 && !isLoadingRef.current && !isError) {
      (async (): Promise<void> => {
        await loadData(1, true);
      })();
    }
  }, [data.length, isError, loadData]);
  // 自动重试逻辑
  useEffect((): (() => void) => {
    // 清除之前的定时器
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }

    // 当数据为空、不在加载中、没有错误且未达到最大重试次数时，触发自动重试
    if (autoRetry && data.length === 0 && !isLoading && !isError && retryCount < MAX_RETRY_COUNT) {
      setIsAutoRetrying(true);
      const interval = RETRY_INTERVALS[retryCount];
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        loadData(1, true).then();
      }, interval);
      setRetryTimer(timer);
    } else {
      setIsAutoRetrying(false);
    }

    // 当获取到数据时，重置重试计数
    if (data.length > 0) {
      setRetryCount(0);
    }

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [autoRetry, data.length, isLoading, isError, retryCount, loadData, retryTimer, MAX_RETRY_COUNT, RETRY_INTERVALS]);
  return useMemo(
    () => ({
      data,
      isLoading,
      isLoadingMore,
      isError,
      error,
      hasMore,
      loadMoreRef: ref,
      refresh,
      pageSize: pageSize,
      setPageSize,
      total,
      setData,
      isAutoRetrying,
      retryCount
    }),
    [
      data,
      isLoading,
      isLoadingMore,
      isError,
      error,
      hasMore,
      ref,
      refresh,
      pageSize,
      setPageSize,
      total,
      setData,
      isAutoRetrying,
      retryCount
    ]
  );
}

export default useInfiniteScroll;
