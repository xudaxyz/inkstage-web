import React, { useState } from 'react';
import { Card, Table, Button, Tag, message, Space, Statistic, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';

// 文章类型定义
interface Article {
  id: string;
  title: string;
  publishTime: string;
  status: 'published' | 'draft' | 'pending';
  views: number;
  likes: number;
  comments: number;
}

const MyCreations: React.FC = () => {
  // 模拟文章数据
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: '如何提高写作技巧：实用指南',
      publishTime: '2026-01-25',
      status: 'published',
      views: 1200,
      likes: 89,
      comments: 23
    },
    {
      id: '2',
      title: 'React 18 新特性详解',
      publishTime: '2026-01-20',
      status: 'published',
      views: 2500,
      likes: 156,
      comments: 45
    },
    {
      id: '3',
      title: 'TypeScript 类型系统深入理解',
      publishTime: '2026-01-15',
      status: 'draft',
      views: 0,
      likes: 0,
      comments: 0
    },
    {
      id: '4',
      title: '前端性能优化最佳实践',
      publishTime: '2026-01-10',
      status: 'published',
      views: 3200,
      likes: 210,
      comments: 67
    }
  ]);

  // 创作统计数据
  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    totalLikes: articles.reduce((sum, a) => sum + a.likes, 0)
  };

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <a href="#" className="text-primary-600 hover:underline">{text}</a>
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'published':
            color = 'green';
            text = '已发布';
            break;
          case 'draft':
            color = 'blue';
            text = '草稿';
            break;
          case 'pending':
            color = 'orange';
            text = '待审核';
            break;
          default:
            color = 'gray';
            text = '未知';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views'
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes'
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Article) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => {
              message.success('文章已删除');
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的创作</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-primary-600 hover:bg-primary-700"
        >
          写文章
        </Button>
      </div>

      {/* 统计数据卡片 */}
      <Row gutter={16} className="mb-8">
        <Col span={6}>
          <Card>
            <Statistic title="总文章数" value={stats.totalArticles} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已发布" value={stats.publishedArticles} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总浏览量" value={stats.totalViews} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总点赞数" value={stats.totalLikes} />
          </Card>
        </Col>
      </Row>

      {/* 文章列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="mt-4"
        />
      </Card>
    </div>
  );
};

export default MyCreations;