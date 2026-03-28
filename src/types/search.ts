import type { ApiPageResponse } from './common';
import type { IndexArticleList } from './article';

// 搜索文章的请求参数接口
export interface SearchArticlesParams {
    keyword: string;
    pageNum?: number;
    pageSize?: number;
    sortBy?: 'relevance' | 'publishTime' | 'readCount';
}

// 搜索文章的数据接口
export type SearchArticlesData = ApiPageResponse<IndexArticleList>;

// 热门搜索词的数据接口
export interface HotWord {
    id: number;
    word: string;
    count: number;
}

export type HotWordsData = HotWord[];

// 搜索历史的数据接口
export interface SearchHistory {
    id: number;
    keyword: string;
    searchTime: string;
}

export type SearchHistoryData = SearchHistory[];
