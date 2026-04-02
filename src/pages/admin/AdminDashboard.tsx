import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Col, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  SyncOutlined,
  TagOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardStatsVO } from '../../types/admin';

const { Title, Text } = Typography;

// 管理员代办事项类型定义
interface TodoItem {
  id: number;
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const AdminDashboard: React.FC = () => {
  // 状态管理
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsVO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);

  // 管理员代办事项
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

  // 数据加载
  useEffect(() => {
    loadDashboardStats().then();
  }, []);

  // 加载仪表盘数据
  const loadDashboardStats = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDashboardStats();
      if (response.code === 200) {
        setDashboardStats(response.data);

        // 构建代办事项数据
        if (response.data.pendingStats) {
          const items: TodoItem[] = [
            {
              id: 1,
              title: '文章待审核',
              count: response.data.pendingStats.pendingArticles,
              icon: <FileTextOutlined className="text-blue-500" />,
              color: 'blue',
              route: '/admin/articles'
            },
            {
              id: 2,
              title: '标签待审核',
              count: response.data.pendingStats.pendingTags,
              icon: <TagOutlined className="text-orange-500" />,
              color: 'orange',
              route: '/admin/tags'
            },
            {
              id: 3,
              title: '评论待审核',
              count: response.data.pendingStats.pendingComments,
              icon: <MessageOutlined className="text-purple-500" />,
              color: 'purple',
              route: '/admin/comments'
            },
            {
              id: 4,
              title: '用户待审核',
              count: response.data.pendingStats.pendingUsers,
              icon: <UserOutlined className="text-green-500" />,
              color: 'green',
              route: '/admin/users'
            }
          ];
          setTodoItems(items);
        }
      }
    } catch (err) {
      setError('加载仪表盘数据失败');
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 刷新仪表盘数据
  const refreshDashboardStats = async (): Promise<void> => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;

    // 检查是否在5秒内已刷新过
    if (timeSinceLastRefresh < 5000) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.refreshDashboardStats();
      if (response.code === 200 && response.data) {
        // 刷新成功后重新加载数据
        await loadDashboardStats();
        // 设置最后刷新时间
        setLastRefreshTime(now);
        // 开始倒计时
        setCountdown(5);

        // 倒计时逻辑
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message || '刷新仪表盘数据失败');
      }
    } catch {
      setError('刷新仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'green';
      case 'info':
        return 'blue';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'default';
    }
  };

  // 处理加载状态
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 处理错误状态
  if (error || !dashboardStats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{error || '加载失败'}</h2>
          <p className="text-gray-500 mb-6">很抱歉，无法加载仪表盘数据。</p>
          <Button
            onClick={loadDashboardStats}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  const { coreStats, viewsTrend, userGrowthTrend, articleCategoryDistribution, recentActivities } = dashboardStats;

  return (
    <div>
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Title level={2} className="text-gray-800 mb-2">
              控制台
            </Title>
          </div>
          <Space className="mt-4 md:mt-0">
            <Button type="default" size="middle" icon={<CalendarOutlined />}>
              今日
            </Button>
            <Button
              variant="text"
              color="blue"
              size="middle"
              onClick={refreshDashboardStats}
              icon={<SyncOutlined />}
              disabled={countdown > 0}
            ></Button>
          </Space>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="用户总数"
              value={coreStats.totalUsers}
              precision={0}
              prefix={<UserOutlined />}
              styles={{ content: { color: 'red' } }}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.usersGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.usersGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.usersGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="文章总数"
              value={coreStats.totalArticles}
              precision={0}
              styles={{ content: { color: '#2362b3' } }}
              prefix={<FileTextOutlined />}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.articlesGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.articlesGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.articlesGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="标签总数"
              value={coreStats.totalTags}
              precision={0}
              styles={{ content: { color: '#fa8c16' } }}
              prefix={<TagOutlined />}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.tagsGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.tagsGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.tagsGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="评论总数"
              value={coreStats.totalComments}
              precision={0}
              styles={{ content: { color: '#722ed1' } }}
              prefix={<MessageOutlined />}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.commentsGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.commentsGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.commentsGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="总浏览量"
              value={coreStats.totalViews}
              precision={0}
              styles={{ content: { color: '#13c2c2' } }}
              prefix={<EyeOutlined />}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.viewsGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.viewsGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.viewsGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="收藏总数"
              value={coreStats.totalCollections}
              precision={0}
              styles={{ content: { color: '#eb2f96' } }}
              prefix={<StarOutlined />}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${coreStats.collectionsGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  {coreStats.collectionsGrowthRate >= 0 ? '↑' : '↓'}
                  <span>{Math.abs(coreStats.collectionsGrowthRate)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 管理员代办事项 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card title="管理员代办事项" variant={'borderless'} className=" shadow-sm" size="small">
            <Row gutter={[16, 16]}>
              {todoItems.map((item) => (
                <Col key={item.id} xs={24} sm={12} md={6}>
                  <Link to={item.route} className="block">
                    <Card
                      variant={'borderless'}
                      className={'hover:shadow-md transition-all duration-300 hover:border-cyan-300'}
                      hoverable
                    >
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className={`text-${item.color}-500 text-2xl mb-3`}>{item.icon}</div>
                        <h3 className="text-lg font-medium mb-2 text-gray-800">{item.title}</h3>
                        <div className={`text-${item.color}-600 text-2xl font-bold mb-2`}>{item.count}</div>
                        <div className="text-sm text-gray-500">点击查看详情</div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 浏览量趋势 */}
        <Col xs={24} md={12}>
          <Card title="浏览量趋势" className="border border-gray-100 shadow-sm" size="small">
            <div style={{ height: 300 }}>
              <Line
                data={viewsTrend.map((item) => ({ date: item.timeValue, views: item.value }))}
                xField="date"
                yField="views"
                smooth
                lineStyle={{
                  stroke: '#1677ff',
                  lineWidth: 2
                }}
                pointStyle={{
                  fill: '#1677ff',
                  stroke: '#fff',
                  lineWidth: 2
                }}
                tooltip={{
                  formatter: (datum: { date: string; views: number }) => {
                    return {
                      name: datum.date,
                      value: datum.views
                    };
                  }
                }}
                grid={{}}
              />
            </div>
          </Card>
        </Col>

        {/* 文章分类分布 */}
        <Col xs={24} md={12}>
          <Card title="文章分类分布" className="border border-gray-100 shadow-sm" size="small">
            <div style={{ height: 300 }}>
              <Pie
                data={articleCategoryDistribution}
                angleField="value"
                colorField="name"
                radius={0.8}
                label={{
                  position: 'outside',
                  text: 'name',
                  offsetY: 10
                }}
                tooltip={{
                  title: 'name',
                  items: ['value']
                }}
                color={['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2']}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        {/* 用户增长趋势 */}
        <Col xs={24} md={12}>
          <Card title="用户增长趋势" className="border border-gray-100 shadow-sm" size="small">
            <div style={{ height: 300 }}>
              <Line
                data={userGrowthTrend.map((item) => ({ date: item.timeValue, users: item.value }))}
                xField="date"
                yField="users"
                smooth
                lineStyle={{
                  stroke: '#722ed1',
                  lineWidth: 2
                }}
                pointStyle={{
                  fill: '#722ed1',
                  stroke: '#fff',
                  lineWidth: 2
                }}
                tooltip={{
                  formatter: (datum: { date: string; users: number }) => {
                    return {
                      name: datum.date,
                      value: datum.users
                    };
                  }
                }}
                grid={{}}
              />
            </div>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card title="最近活动" className="border border-gray-100 shadow-sm" size="small">
            <List
              size="small"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item className="py-3">
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={
                      <div className="flex items-center gap-2">
                        <Text className="font-medium">{item.nickname}</Text>
                        <Text className="text-gray-500">{item.action}</Text>
                        {item.target && (
                          <Tag color={getStatusColor(item.status)} className="ml-2">
                            {item.target}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-gray-400" />
                        <Text className="text-xs text-gray-500">{item.time}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div className="mt-4 text-center">
              <Button type="text" className="text-primary">
                查看全部活动
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
