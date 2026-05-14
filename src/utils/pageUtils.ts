import type { ApiPageResponse } from '../types/common';

export function normalizePageResponse<T>(
  data: Partial<ApiPageResponse<T>> | null | undefined,
  fallbackPageNum: number,
  fallbackPageSize: number
): ApiPageResponse<T> {
  const pageNum = data?.pageNum || fallbackPageNum;
  const total = data?.total || 0;
  const pages = data?.pages || Math.ceil(total / fallbackPageSize);

  return {
    record: data?.record || [],
    total,
    pageNum,
    pageSize: data?.pageSize || fallbackPageSize,
    pages,
    isFirstPage: data?.isFirstPage ?? (pageNum === 1),
    isLastPage: data?.isLastPage ?? (pageNum >= pages),
    prePage: data?.prePage || 1,
    nextPage: data?.nextPage || (pageNum + 1)
  };
}

export function emptyPageResponse<T>(pageSize: number): ApiPageResponse<T> {
  return {
    record: [],
    total: 0,
    pageNum: 1,
    pageSize,
    pages: 0,
    isFirstPage: true,
    isLastPage: true,
    prePage: 1,
    nextPage: 1
  };
}

export function computePageResponse<T>(
  record: T[],
  total: number,
  pageNum: number,
  pageSize: number
): ApiPageResponse<T> {
  const pages = Math.ceil(total / pageSize);
  return {
    record,
    total,
    pageNum,
    pageSize,
    pages,
    isFirstPage: pageNum === 1,
    isLastPage: pageNum * pageSize >= total,
    prePage: pageNum > 1 ? pageNum - 1 : 1,
    nextPage: pageNum * pageSize < total ? pageNum + 1 : pageNum
  };
}
