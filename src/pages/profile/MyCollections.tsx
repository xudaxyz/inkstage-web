import React, { useState } from 'react';
import { Card, Table, Button, message, Space, Empty, Tag } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// 收藏文章类型定义
interface Collection {
  id: string;
  articleId: string;
  title: string;
  author: string;
  collectTime: string;
  status: 'public' | 'private';
  views: number;
  likes: number;
}

const MyCollections: React.FC = () => {
  // 模拟收藏数据
  const [collections] = useState<Collection[]>([
    {
      id: '1',
      articleId: '101',
      title: '如何提高写作技巧：实用指南',
      author: '张三',
      collectTime: '2026-01-25',
      status: 'public',
      views: 1200,
      likes: 89
    },
    {
      id: '2',
      articleId: '102',
      title: 'React 18 新特性详解',
      author: '李四',
      collectTime: '2026-01-20',
      status: 'public',
      views: 2500,
      likes: 156
    },
    {
      id: '3',
      articleId: '103',
      title: 'TypeScript 类型系统深入理解',
      author: '王五',
      collectTime: '2026-01-15',
      status: 'private',
      views: 1800,
      likes: 120
    },
    {
      id: '4',
      articleId: '104',
      title: '前端性能优化最佳实践',
      author: '赵六',
      collectTime: '2026-01-10',
      status: 'public',
      views: 3200,
      likes: 210
    }
  ]);

  // 选中的收藏项
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 处理全选
  const onSelectChange = (newSelectedRowKeys: string[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 批量取消收藏
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要取消收藏的文章');
      return;
    }
    message.success(`已取消收藏 ${selectedRowKeys.length} 篇文章`);
    setSelectedRowKeys([]);
  };

  // 取消单个收藏
  const handleSingleDelete = () => {
    message.success('已取消收藏');
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
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
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      render: (text: string) => <span className="text-gray-600">{text}</span>
    },
    {
      title: '收藏时间',
      dataIndex: 'collectTime',
      key: 'collectTime'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return (
          <Tag color={status === 'public' ? 'green' : 'blue'}>
            {status === 'public' ? '公开' : '私密'}
          </Tag>
        );
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
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Collection) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleSingleDelete(record.id)}
          >
            取消收藏
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">我的收藏</h1>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          批量取消收藏
        </Button>
      </div>

      {/* 收藏列表 */}
      <Card>
        {collections.length > 0 ? (
          <>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={collections}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="mt-4"
            />
            <div className="mt-4 text-sm text-gray-500">
              已选择 {selectedRowKeys.length} 项
            </div>
          </>
        ) : (
          <Empty
            description="暂无收藏的文章"
            className="py-12"
          />
        )}
      </Card>
    </div>
  );
};

export default MyCollections;