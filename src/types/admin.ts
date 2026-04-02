/**
 * 后台管理相关类型定义
 */

// 核心统计数据
export interface CoreStatsVO {
  totalUsers: number;
  usersGrowthRate: number;
  totalArticles: number;
  articlesGrowthRate: number;
  totalTags: number;
  tagsGrowthRate: number;
  totalComments: number;
  commentsGrowthRate: number;
  totalViews: number;
  viewsGrowthRate: number;
  totalCollections: number;
  collectionsGrowthRate: number;
}

// 待审核数据
export interface PendingStatsVO {
  pendingArticles: number;
  pendingTags: number;
  pendingComments: number;
  pendingUsers: number;
}

// 趋势数据
export interface TrendDataVO {
  timeValue: string;
  value: number;
}

// 分布数据
export interface DistributionDataVO {
  name: string;
  value: number;
  percentage: number;
}

// 活动数据
export interface ActivityStatVO {
  id: number;
  userId: number;
  nickname: string;
  action: string;
  target: string;
  status: string;
  avatar: string;
  time: string;
}

// 仪表盘统计数据
export interface DashboardStatsVO {
  coreStats: CoreStatsVO;
  pendingStats: PendingStatsVO;
  viewsTrend: TrendDataVO[];
  userGrowthTrend: TrendDataVO[];
  articleCategoryDistribution: DistributionDataVO[];
  recentActivities: ActivityStatVO[];
}
