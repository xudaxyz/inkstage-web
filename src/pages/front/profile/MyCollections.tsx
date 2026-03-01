import React, { useState } from 'react';
import { Button, message, Tag, Empty } from 'antd';
import { HeartOutlined, EyeOutlined, DeleteOutlined, LockOutlined, UserOutlined,EyeTwoTone, LikeOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 批量取消收藏
  const handleBatchDelete = () => {
    if (selectedItems.length === 0) {
      message.warning('请选择要取消收藏的文章');
      return;
    }
    message.success(`已取消收藏 ${selectedItems.length} 篇文章`);
    setSelectedItems([]);
  };

  // 取消单个收藏
  const handleSingleDelete = () => {
    message.success('已取消收藏');
  };

  // 切换选择状态
  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === collections.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(collections.map(item => item.id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <HeartOutlined className="text-accent-500 text-2xl" />
          <h1 className="text-2xl font-bold text-secondary-800">我的收藏</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="default"
            onClick={toggleSelectAll}
            disabled={collections.length === 0}
            className="border-secondary-300 hover:border-primary-500"
          >
            {selectedItems.length === collections.length ? '取消全选' : '全选'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedItems.length === 0}
          >
            批量取消收藏
          </Button>
        </div>
      </div>

      {/* 收藏列表 */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-secondary-100 relative ${selectedItems.includes(collection.id) ? 'ring-2 ring-primary-500' : ''}`}
              >
                {/* 选择复选框 */}
                <div className="absolute top-3 right-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(collection.id)}
                    onChange={() => toggleSelect(collection.id)}
                    className="w-5 h-5 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                  />
                </div>

                {/* 卡片内容 */}
                <div className="p-6">
                  {/* 状态标签 */}
                  <div className="mb-3">
                    <Tag 
                      color={collection.status === 'public' ? 'success' : 'primary'} 
                      className="text-xs"
                    >
                      {collection.status === 'public' ? '公开' : '私密'}
                    </Tag>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-secondary-800 mb-2 hover:text-primary-600 transition-colors duration-200">
                    <a href="#" className="block hover:underline">{collection.title}</a>
                  </h3>

                  {/* 作者信息 */}
                  <div className="flex items-center text-sm text-secondary-500 mb-4">
                    <UserOutlined className="mr-1" />
                    <span>{collection.author}</span>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <LockOutlined className="mr-1" />
                        <span>{collection.collectTime}</span>
                      </div>
                      <div className="flex items-center">
                        <EyeTwoTone className="mr-1" />
                        <span>{collection.views}</span>
                      </div>
                      <div className="flex items-center">
                        <LikeOutlined className="mr-1" />
                        <span>{collection.likes}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      icon={<EyeOutlined />}
                      size="small"
                      className="flex-1 border-secondary-200 hover:border-primary-500 hover:text-primary-600"
                    >
                      查看
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={handleSingleDelete}
                    >
                      取消收藏
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-secondary-100">
          <Empty
            description="暂无收藏的文章"
            className="py-8"
          />
          <Button type="primary" className="mt-4">
            去浏览文章
          </Button>
        </div>
      )}

      {/* 选择状态提示 */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <span>已选择 {selectedItems.length} 项</span>
          <Button
            danger
            size="small"
            onClick={handleBatchDelete}
          >
            取消收藏
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default MyCollections;