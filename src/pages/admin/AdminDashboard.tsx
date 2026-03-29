import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, Space, Typography, Table, Avatar, List } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  TagOutlined,
  MessageOutlined,
  EyeOutlined,
  StarOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

// 模拟统计数据
const mockStats = {
  users: {
    total: 1234,
    growth: 12.5,
    trend: 'up'
  },
  articles: {
    total: 5678,
    growth: 8.2,
    trend: 'up'
  },
  tags: {
    total: 123,
    growth: 5.8,
    trend: 'up'
  },
  comments: {
    total: 9876,
    growth: -2.1,
    trend: 'down'
  },
  views: {
    total: 125000,
    growth: 15.3,
    trend: 'up'
  },
  collections: {
    total: 3456,
    growth: 7.8,
    trend: 'up'
  }
};

// 模拟最近活动数据
const mockActivities = [
  {
    id: 1,
    user: '张三',
    action: '发布了新文章',
    target: '《React最佳实践》',
    time: '2分钟前',
    status: 'success',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    user: '李四',
    action: '评论了文章',
    target: '《TypeScript高级特性》',
    time: '15分钟前',
    status: 'info',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    user: '王五',
    action: '注册了新账号',
    target: '',
    time: '1小时前',
    status: 'success',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    user: '赵六',
    action: '更新了个人资料',
    target: '',
    time: '2小时前',
    status: 'info',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: 5,
    user: '孙七',
    action: '收藏了文章',
    target: '《Node.js性能优化》',
    time: '3小时前',
    status: 'info',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  }
];

// 模拟热门文章数据
const mockHotArticles = [
  {
    key: '1',
    title: 'React最佳实践',
    nickname: '张三',
    views: 1234,
    comments: 56,
    date: '2026-03-01',
    status: 'published'
  },
  {
    key: '2',
    title: 'TypeScript高级特性',
    nickname: '李四',
    views: 987,
    comments: 45,
    date: '2026-03-02',
    status: 'published'
  },
  {
    key: '3',
    title: 'Node.js性能优化',
    nickname: '王五',
    views: 876,
    comments: 34,
    date: '2026-03-03',
    status: 'published'
  },
  {
    key: '4',
    title: 'Tailwind CSS使用指南',
    nickname: '赵六',
    views: 765,
    comments: 23,
    date: '2026-03-04',
    status: 'draft'
  },
  {
    key: '5',
    title: 'React Hooks深入理解',
    nickname: '孙七',
    views: 654,
    comments: 12,
    date: '2026-03-05',
    status: 'published'
  }
];

// 模拟浏览量趋势数据
const mockViewsData = [
  { date: '2026-02-29', views: 8500 },
  { date: '2026-03-01', views: 9200 },
  { date: '2026-03-02', views: 8800 },
  { date: '2026-03-03', views: 10500 },
  { date: '2026-03-04', views: 11200 },
  { date: '2026-03-05', views: 9800 },
  { date: '2026-03-06', views: 12000 },
  { date: '2026-03-07', views: 11500 },
  { date: '2026-03-08', views: 13000 }
];

// 模拟文章分类数据
const mockArticleCategoryData = [
  { category: '前端开发', value: 35 },
  { category: '后端开发', value: 25 },
  { category: '移动开发', value: 15 },
  { category: 'DevOps', value: 10 },
  { category: '其他', value: 15 }
];

// 模拟用户增长数据
const mockUserGrowthData = [
  { month: '1月', users: 850 },
  { month: '2月', users: 920 },
  { month: '3月', users: 1234 }
];

const AdminDashboard: React.FC = () => {
  const [stats] = useState(mockStats);
  const [activities] = useState(mockActivities);
  const [hotArticles] = useState(mockHotArticles);

  // 模拟数据加载
  useEffect(() => {
  }, []);


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

  // 热门文章表格列配置
  const columns = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string): React.ReactNode => <Text ellipsis={{ tooltip: text }}>{text}</Text>
    },
    {
      title: '作者',
      dataIndex: 'nickname',
      key: 'nickname'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views: number): React.ReactNode => (
        <div className="flex items-center gap-1">
          <EyeOutlined className="text-gray-400"/>
          <span>{views}</span>
        </div>
      )
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments',
      render: (comments: number): React.ReactNode => (
        <div className="flex items-center gap-1">
          <MessageOutlined className="text-gray-400"/>
          <span>{comments}</span>
        </div>
      )
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string): React.ReactNode => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      )
    }
  ];

  return (
    <div>
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Title level={2} className="text-gray-800 mb-2">控制台</Title>
          </div>
          <Space className="mt-4 md:mt-0">
            <Button
              type="default"
              size="middle"
              icon={<CalendarOutlined/>}
            >
                            今日
            </Button>
            <Button
              type="default"
              size="middle"
              icon={<BarChartOutlined/>}
            >
                            数据报表
            </Button>
          </Space>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 gap-2 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="用户总数"
              value={stats.users.total}
              precision={0}
              prefix={<UserOutlined/>}
              styles={{ content: { color: 'red' } }}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.users.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.users.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.users.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="文章总数"
              value={stats.articles.total}
              precision={0}
              styles={{ content: { color: '#2362b3' } }}
              prefix={<FileTextOutlined/>}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.articles.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.articles.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.articles.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="标签总数"
              value={stats.tags.total}
              precision={0}
              styles={{ content: { color: '#fa8c16' } }}
              prefix={<TagOutlined/>}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.tags.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.tags.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.tags.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="评论总数"
              value={stats.comments.total}
              precision={0}
              styles={{ content: { color: '#722ed1' } }}
              prefix={<MessageOutlined/>}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.comments.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.comments.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.comments.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="总浏览量"
              value={stats.views.total}
              precision={0}
              styles={{ content: { color: '#13c2c2' } }}
              prefix={<EyeOutlined/>}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.views.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.views.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.views.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title="收藏总数"
              value={stats.collections.total}
              precision={0}
              styles={{ content: { color: '#eb2f96' } }}
              prefix={<StarOutlined/>}
              suffix={
                <span
                  className={`inline-flex items-center gap-1 ${stats.collections.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.collections.trend === 'up' ? '↑' : '↓'}
                  <span>{Math.abs(stats.collections.growth)}%</span>
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 浏览量趋势 */}
        <Col xs={24} md={12}>
          <Card
            title="浏览量趋势"
            className="border border-gray-100 shadow-sm"
            size="small"
          >
            <div style={{ height: 300 }}>
              <Line
                data={mockViewsData}
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
          <Card
            title="文章分类分布"
            className="border border-gray-100 shadow-sm"
            size="small"
          >
            <div style={{ height: 300 }}>
              <Pie
                data={mockArticleCategoryData}
                angleField="value"
                colorField="category"
                radius={0.8}
                label={{
                  type: 'inner',
                  content: '{name}: {value}%'
                }}
                tooltip={{
                  formatter: (datum: { category: string; value: number }) => {
                    return {
                      name: datum.category,
                      value: `${datum.value}%`
                    };
                  }
                }}
                color={[
                  '#1677ff',
                  '#52c41a',
                  '#fa8c16',
                  '#722ed1',
                  '#13c2c2'
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        {/* 用户增长趋势 */}
        <Col xs={24} md={12}>
          <Card
            title="用户增长趋势"
            className="border border-gray-100 shadow-sm"
            size="small"
          >
            <div style={{ height: 300 }}>
              <Column
                data={mockUserGrowthData}
                xField="month"
                yField="users"
                columnStyle={{
                  fill: '#722ed1'
                }}
                label={{
                  position: 'top',
                  formatter: (datum: { month: string; users: number }) => datum.users
                }}
                tooltip={{
                  formatter: (datum: { month: string; users: number }) => {
                    return {
                      name: datum.month,
                      value: datum.users
                    };
                  }
                }}
                grid={{
                  y: {
                    line: {
                      style: {
                        stroke: '#f0f0f0'
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} md={12}>
          <Card
            title="最近活动"
            className="border border-gray-100 shadow-sm"
            size="small"
          >
            <List
              size="small"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item className="py-3">
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar}/>}
                    title={
                      <div className="flex items-center gap-2">
                        <Text className="font-medium">{item.user}</Text>
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
                        <ClockCircleOutlined className="text-gray-400"/>
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

      <Row gutter={[16, 16]} className="mb-6">
        {/* 热门文章 */}
        <Col xs={24}>
          <Card
            title="热门文章"
            className="border border-gray-100 shadow-sm"
            size="small"
          >
            <Table
              columns={columns}
              dataSource={hotArticles}
              size="small"
              pagination={false}
              rowKey="key"
            />
            <div className="mt-4 text-center">
              <Button type="text" className="text-primary">
                                查看全部文章
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
