import React, { useState } from 'react';
import { Card, Table, Button, message, Space, Empty } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// 阅读历史类型定义
interface ReadingHistory {
  id: string;
  articleId: string;
  title: string;
  author: string;
  readTime: string;
  readDate: string;
  duration: number; // 阅读时长（分钟）
  progress: number; // 阅读进度（百分比）
}

const ReadingHistory: React.FC = () => {
  // 模拟阅读历史数据
  const [histories] = useState<ReadingHistory[]>([
    {
      id: '1',
      articleId: '201',
      title: '如何提高写作技巧：实用指南',
      author: '张三',
      readTime: '2026-01-29 14:30',
      readDate: '2026-01-29',
      duration: 15,
      progress: 80
    },
    {
      id: '2',
      articleId: '202',
      title: 'React 18 新特性详解',
      author: '李四',
      readTime: '2026-01-29 10:15',
      readDate: '2026-01-29',
      duration: 25,
      progress: 100
    },
    {
      id: '3',
      articleId: '203',
      title: 'TypeScript 类型系统深入理解',
      author: '王五',
      readTime: '2026-01-28 16:45',
      readDate: '2026-01-28',
      duration: 20,
      progress: 60
    },
    {
      id: '4',
      articleId: '204',
      title: '前端性能优化最佳实践',
      author: '赵六',
      readTime: '2026-01-28 09:30',
      readDate: '2026-01-28',
      duration: 30,
      progress: 90
    },
    {
      id: '5',
      articleId: '205',
      title: 'CSS Grid 布局完全指南',
      author: '孙七',
      readTime: '2026-01-27 15:20',
      readDate: '2026-01-27',
      duration: 18,
      progress: 70
    }
  ]);

  // 按日期分组
  const groupedHistories = histories.reduce((groups: Record<string, ReadingHistory[]>, history) => {
    const date = history.readDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(history);
    return groups;
  }, {});

  // 清空所有历史
  const handleClearAll = () => {
    message.success('已清空所有阅读历史');
  };

  // 删除单个历史
  const handleDeleteSingle = () => {
    message.success('已删除阅读历史');
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
      title: '阅读时间',
      dataIndex: 'readTime',
      key: 'readTime'
    },
    {
      title: '阅读时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => <span>{duration} 分钟</span>
    },
    {
      title: '阅读进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small">
            继续阅读
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteSingle()}
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
        <h1 className="text-2xl font-bold text-gray-800">阅读历史</h1>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleClearAll}
          disabled={histories.length === 0}
        >
          清空历史
        </Button>
      </div>

      {/* 阅读历史列表 */}
      {histories.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedHistories).map(([date, items]) => (
            <Card key={date} title={date} className="mb-4">
              <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                pagination={false}
                className="mt-2"
              />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <Empty
            description="暂无阅读历史"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

export default ReadingHistory;