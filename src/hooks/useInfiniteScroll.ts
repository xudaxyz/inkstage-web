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
export function useInfiniteScroll<T> (
    fetcher: (page: number, pageSize: number) => Promise<ApiPageResponse<T>>,
    options: InfiniteScrollOptions = {}
): InfiniteScrollResult<T> {
    const {
        pageSize = 10,
        threshold = 0,
        autoLoad = true
    } = options;
    // 数据状态
    const [data, setData] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    // 使用 ref 来避免循环依赖
    const isLoadingRef = useRef(isLoading);
    const isLoadingMoreRef = useRef(isLoadingMore);
    const hasMoreRef = useRef(hasMore);
    const pageRef = useRef(page);
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
    const loadData = useCallback(async (targetPage: number, isRefresh = false) => {
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
                setData(prev => [...prev, ...response.record]);
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
    }, [fetcher, pageSize]);
    /**
     * 刷新数据
     */
    const refresh = useCallback(() => {
        setData([]);
        setPage(1);
        setHasMore(true);
        (async (): Promise<void> => {
            await loadData(1, true);
        })();
    }, [loadData]);
    /**
     * 设置页数（用于手动控制）
     */
    const setPageSize = useCallback(async (pageSize: number | ((pageSize: number) => number)) => {
        const newPageSize = typeof pageSize === 'function' ? pageSize(pageRef.current) : pageSize;
        if (newPageSize > pageRef.current) {
            await loadData(newPageSize, false);
        }
    }, [loadData]);
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
    return useMemo(() => ({
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
        total
    }), [data, isLoading, isLoadingMore, isError, error, hasMore, ref, refresh, pageSize, setPageSize, total]);
}

export default useInfiniteScroll;
