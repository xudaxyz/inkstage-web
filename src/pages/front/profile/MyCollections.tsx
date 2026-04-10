import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Form, Input, message, Modal, notification, Popover, Space, Spin, Tag } from 'antd';
import { Helmet } from 'react-helmet-async';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import {
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  FlagOutlined,
  FolderAddOutlined,
  FolderAddTwoTone,
  FolderOpenOutlined,
  FolderOutlined,
  FolderTwoTone,
  LikeOutlined,
  MessageOutlined,
  MoreOutlined,
  SearchOutlined,
  ShareAltOutlined,
  UpOutlined
} from '@ant-design/icons';
import { ROUTES } from '../../../constants/routes';
import articleService from '../../../services/articleService';
import { type MyArticleCollectionList } from '../../../types/article';
import { type ApiPageResponse } from '../../../types/common';
import { ArticleOriginalMap, DefaultStatusEnum } from '../../../types/enums';
import { formatDateTimeShort } from '../../../utils';
import { useTheme } from '../../../store';

// 收藏夹类型定义
interface CollectionFolder {
  id: string;
  name: string;
  count: number;
  isDefault: boolean;
}

// 排序类型
type SortType = 'recent' | 'mostLiked' | 'mostViewed';
const MyCollections: React.FC = () => {
  // 状态管理
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [defaultFolderId, setDefaultFolderId] = useState<number>(0);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [searchText, setSearchText] = useState('');
  const [showFolderList, setShowFolderList] = useState(false);
  const [totalCollectionCount, setTotalCollectionCount] = useState(0);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createFolderLoading, setCreateFolderLoading] = useState(false);
  const [form] = Form.useForm();
  // 移动功能相关状态
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number>(0);
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState<number>(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isCreateFolderForMove, setIsCreateFolderForMove] = useState(false);
  const [newFolderNameForMove, setNewFolderNameForMove] = useState('');
  const [newFolderDescriptionForMove, setNewFolderDescriptionForMove] = useState('');
  // 无限滚动相关引用
  const selectedFolderRef = useRef(selectedFolder);
  const sortTypeRef = useRef(sortType);
  const searchTextRef = useRef(searchText);
  const defaultFolderIdRef = useRef(defaultFolderId);
  // 无限滚动配置
  const pageSize = 10;
  // 收藏文章列表获取函数
  const fetcher = useCallback(
    async (pageNum: number, pageSize: number): Promise<ApiPageResponse<MyArticleCollectionList>> => {
      const folderId =
        selectedFolderRef.current === 'all'
          ? undefined
          : selectedFolderRef.current === 'default'
            ? defaultFolderIdRef.current
            : Number(selectedFolderRef.current);
      const response = await articleService.getMyCollections({
        folderId: folderId,
        pageNum: pageNum,
        pageSize: pageSize,
        sortBy:
          sortTypeRef.current === 'recent'
            ? 'collectTime'
            : sortTypeRef.current === 'mostLiked'
              ? 'likeCount'
              : 'readCount',
        sortOrder: 'desc',
        keyword: searchTextRef.current
      });
      if (response.code === 200 && response.data) {
        // 转换数据格式以匹配前端接口
        const formattedCollections = response.data.record.map((result) => ({
          collectionId: result.collectionId,
          articleId: result.articleId,
          title: result.title,
          summary: result.summary,
          coverImage: result.coverImage,
          userId: result.userId,
          nickname: result.nickname,
          avatar: result.avatar,
          categoryName: result.categoryName,
          articleStatus: result.articleStatus,
          originalStatus: result.originalStatus,
          collectTime: result.collectTime,
          publishTime: result.publishTime,
          readCount: result.readCount,
          likeCount: result.likeCount,
          commentCount: result.commentCount,
          collectionStatus: result.collectionStatus,
          folderId: result.folderId,
          folderName: result.folderName
        }));
        return {
          record: formattedCollections,
          total: response.data.total,
          pageNum: pageNum,
          pageSize: pageSize,
          pages: Math.ceil(response.data.total / pageSize),
          isFirstPage: pageNum === 1,
          isLastPage: pageNum * pageSize >= response.data.total,
          prePage: pageNum > 1 ? pageNum - 1 : 1,
          nextPage: pageNum * pageSize < response.data.total ? pageNum + 1 : pageNum
        };
      } else {
        throw new Error(response.message || '获取收藏文章失败');
      }
    },
    []
  );
  // 使用无限滚动hook
  const infiniteScroll = useInfiniteScroll<MyArticleCollectionList>(fetcher, {
    pageSize
  });
  const { refresh } = infiniteScroll;
  // 获取收藏文件夹列表
  const fetchFolders = useCallback(async (): Promise<void> => {
    setLoadingFolders(true);
    try {
      const response = await articleService.getCollectionFolders();
      if (response.code === 200 && response.data) {
        const formattedFolders: CollectionFolder[] = response.data.map(
          (folder: { id: number; name: string; articleCount: number; defaultFolder: DefaultStatusEnum | string }) => ({
            id: folder.id.toString(),
            name: folder.name,
            count: folder.articleCount || 0,
            isDefault: folder.defaultFolder === DefaultStatusEnum.YES || folder.defaultFolder === 'YES'
          })
        );
        setFolders(formattedFolders);
        // 提取默认收藏夹ID
        const defaultFolder = formattedFolders.find((f) => f.isDefault);
        if (defaultFolder) {
          setDefaultFolderId(Number(defaultFolder.id));
        }
      }
    } catch (err) {
      console.error('获取收藏文件夹失败:', err);
    } finally {
      setLoadingFolders(false);
    }
  }, []);
  // 获取总收藏数
  const fetchTotalCollectionCount = useCallback(async (): Promise<void> => {
    try {
      const response = await articleService.getTotalCollectionCount();
      if (response.code === 200 && response.data) {
        setTotalCollectionCount(response.data);
      }
    } catch (err) {
      console.error('获取总收藏数失败:', err);
    }
  }, []);
  // 初始加载
  useEffect(() => {
    // 获取文件夹列表和总收藏数
    void fetchFolders();
    void fetchTotalCollectionCount();
  }, [fetchFolders, fetchTotalCollectionCount]);
  // 当参数变化时更新ref并刷新数据
  useEffect(() => {
    selectedFolderRef.current = selectedFolder;
    sortTypeRef.current = sortType;
    searchTextRef.current = searchText;
    defaultFolderIdRef.current = defaultFolderId;
    refresh();
  }, [selectedFolder, sortType, searchText, defaultFolderId, refresh]);
  // 取消单个收藏
  const handleSingleDelete = async (articleId: string): Promise<void> => {
    try {
      const result = await articleService.unCollectArticle(Number(articleId));
      if (result.code !== 200) {
        message.error(result.message || '取消收藏失败');
        return;
      }
      message.success(result.message || '已取消收藏');
      // 重新加载数据
      refresh();
      // 重新获取文件夹列表和总收藏数
      await fetchFolders();
      await fetchTotalCollectionCount();
    } catch (error) {
      message.error('取消收藏失败，请重试');
      console.error('取消收藏失败:', error);
    }
  };
  // 分享文章
  const handleShare = (): void => {
    void message.success('分享功能已触发');
  };
  // 举报文章
  const handleReport = (): void => {
    void message.success('举报功能已触发');
  };
  // 打开新建收藏夹模态框
  const handleOpenCreateModal = (): void => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };
  // 关闭新建收藏夹模态框
  const handleCloseCreateModal = (): void => {
    setIsCreateModalVisible(false);
  };
  // 提交新建收藏夹表单
  const handleCreateFolder = async (values: { folderName: string; folderDescription?: string }): Promise<void> => {
    setCreateFolderLoading(true);
    try {
      const response = await articleService.createCollectionFolder({
        folderName: values.folderName,
        folderDescription: values.folderDescription
      });
      if (response.code === 200 && response.data) {
        message.success('收藏夹创建成功');
        setIsCreateModalVisible(false);
        // 重新获取文件夹列表
        await fetchFolders();
      } else {
        message.error(response.message || '创建收藏夹失败');
      }
    } catch (error) {
      message.error('创建收藏夹失败，请重试');
      console.error('创建收藏夹失败:', error);
    } finally {
      setCreateFolderLoading(false);
    }
  };
  // 打开移动模态框
  const handleOpenMoveModal = (articleId: number): void => {
    setSelectedArticleId(articleId);
    setSelectedTargetFolderId(0);
    setIsCreateFolderForMove(false);
    setNewFolderNameForMove('');
    setNewFolderDescriptionForMove('');
    setMoveModalVisible(true);
  };
  // 关闭移动模态框
  const handleCloseMoveModal = (): void => {
    setMoveModalVisible(false);
  };
  // 处理移动操作
  const handleMoveArticle = async (): Promise<void> => {
    if (selectedArticleId <= 0) {
      message.error('文章ID无效');
      return;
    }
    if (selectedTargetFolderId <= 0) {
      message.error('请选择目标收藏夹');
      return;
    }
    setIsMoving(true);
    try {
      const response = await articleService.moveCollectionArticle(selectedArticleId, selectedTargetFolderId);
      if (response.code === 200 && response.data) {
        notification.success({
          title: '移动成功',
          description: '文章已成功移动到指定收藏夹',
          duration: 3,
          placement: 'top'
        });
        setMoveModalVisible(false);
        // 重新加载数据
        refresh();
        await fetchFolders();
      } else {
        message.error(response.message || '移动失败');
      }
    } catch (error) {
      message.error('移动失败，请重试');
      console.error('移动收藏失败:', error);
    } finally {
      setIsMoving(false);
    }
  };
  // 处理创建新文件夹并移动
  const handleCreateFolderAndMove = async (): Promise<void> => {
    if (selectedArticleId <= 0) {
      message.error('文章ID无效');
      return;
    }
    if (!newFolderNameForMove || newFolderNameForMove.trim().length === 0) {
      message.error('请输入新收藏夹名称');
      return;
    }
    setIsMoving(true);
    try {
      // 创建新收藏夹
      const createResponse = await articleService.createCollectionFolder({
        folderName: newFolderNameForMove,
        folderDescription: newFolderDescriptionForMove
      });
      if (createResponse.code === 200 && createResponse.data) {
        const newFolderId = createResponse.data;
        // 移动文章到新文件夹
        const moveResponse = await articleService.moveCollectionArticle(selectedArticleId, newFolderId);
        if (moveResponse.code === 200 && moveResponse.data) {
          notification.success({
            title: '移动成功',
            description: '文章已成功移动到新收藏夹',
            duration: 3,
            placement: 'top'
          });
          setMoveModalVisible(false);
          // 重新加载数据
          await fetchFolders();
          refresh();
        } else {
          message.error(moveResponse.message || '移动失败');
        }
      } else {
        message.error(createResponse.message || '创建收藏夹失败');
      }
    } catch (error) {
      message.error('操作失败，请重试');
      console.error('创建文件夹并移动失败:', error);
    } finally {
      setIsMoving(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>我的收藏 - InkStage</title>
      </Helmet>
      <div className="mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-secondary-800 dark:text-white">我的收藏</h1>
          <div className="text-gray-500 dark:text-gray-400">({totalCollectionCount})</div>
        </div>

        <div className="flex gap-4">
          {/* 左侧收藏夹列表 */}
          <div className="w-48 shrink-0">
            <Card
              title="收藏夹列表"
              variant={'borderless'}
              style={{
                backgroundColor: `${isDarkMode ? '#364153' : 'transparent'}`
              }}
              styles={{
                header: { padding: '12px', fontSize: '1.25rem' },
                body: { padding: '4px' }
              }}
            >
              {loadingFolders ? (
                <div className="py-4 flex justify-center">
                  <Spin size="small" />
                </div>
              ) : (
                <>
                  {/* 全部收藏 */}
                  <div
                    className={
                      'flex items-center px-3 py-2 pr-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 mb-2'
                    }
                    onClick={() => setSelectedFolder('all')}
                  >
                    <FolderTwoTone className="mr-2" />
                    <span className="font-medium flex-1">全部收藏</span>
                    <span className={'font-medium'}>{totalCollectionCount}</span>
                  </div>

                  <div
                    className="flex items-center px-3 py-2 rounded-lg cursor-pointer mb-2 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                    onClick={handleOpenCreateModal}
                  >
                    <FolderAddTwoTone className="mr-2" />
                    <span>新建收藏夹</span>
                  </div>

                  {/* 我的收藏夹标题 */}
                  <div className="flex items-center px-3 justify-between mb-3">
                    <div className="flex items-center">
                      <FolderOutlined className="mr-2" />
                      <span className="font-medium text-secondary-500 dark:text-gray-300">我的收藏夹</span>
                    </div>
                    <Button type="text" size="small" onClick={() => setShowFolderList(!showFolderList)}>
                      {showFolderList ? (
                        <UpOutlined style={{ fontSize: '14px' }} />
                      ) : (
                        <DownOutlined style={{ fontSize: '14px' }} />
                      )}
                    </Button>
                  </div>

                  {/* 我的收藏夹列表 */}
                  {showFolderList && (
                    <div className="space-y-1 pl-2 pr-3">
                      {/* 默认收藏夹 */}
                      <div
                        className={`flex items-center px-4 p-2 rounded-lg cursor-pointer ${selectedFolder === 'default' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-secondary-50 dark:hover:bg-gray-800'}`}
                        onClick={() => setSelectedFolder('default')}
                      >
                        <FolderOutlined className="mr-2" />
                        <span className="flex-1">默认收藏夹</span>
                        <span>{folders.find((f) => f.isDefault)?.count || 0}</span>
                      </div>

                      {/* 其他创建的收藏夹 */}
                      {folders
                        .filter((f) => !f.isDefault)
                        .map((folder) => (
                          <div
                            key={folder.id}
                            className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedFolder === folder.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-secondary-50 dark:hover:bg-gray-800'}`}
                            onClick={() => setSelectedFolder(folder.id)}
                          >
                            <FolderOutlined className="mr-2" />
                            <span className="flex-1">{folder.name}</span>
                            <span>{folder.count}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* 右侧文章列表 */}
          <div className="flex-1">
            {/* 排序和搜索区域 */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center pb-4 mb-6">
              {/* 排序选项 */}
              <div className="flex space-x-4 mb-2 md:mb-0">
                <Button
                  color={sortType === 'recent' ? 'cyan' : 'default'}
                  variant={sortType === 'recent' ? 'solid' : 'text'}
                  size="large"
                  onClick={() => setSortType('recent')}
                >
                  最近收藏
                </Button>
                <Button
                  color={sortType === 'mostLiked' ? 'cyan' : 'default'}
                  variant={sortType === 'mostLiked' ? 'solid' : 'text'}
                  size="large"
                  onClick={() => setSortType('mostLiked')}
                >
                  最多点赞
                </Button>
                <Button
                  color={sortType === 'mostViewed' ? 'cyan' : 'default'}
                  variant={sortType === 'mostViewed' ? 'solid' : 'text'}
                  size="large"
                  onClick={() => setSortType('mostViewed')}
                >
                  最多浏览
                </Button>
              </div>

              {/* 搜索框 */}
              <div className="flex items-center gap-24">
                <Input
                  placeholder="搜索收藏的文章"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                />
              </div>
            </div>

            {/* 文章列表 */}
            <InfiniteScrollContainer
              infiniteScroll={infiniteScroll}
              renderItem={(collection) => (
                <Card
                  key={collection.collectionId}
                  variant="borderless"
                  style={{
                    backgroundColor: `${isDarkMode ? '#1e2939' : 'transparent'}`
                  }}
                  styles={{
                    body: {
                      padding: '20px 12px',
                      borderBottom: `1px solid ${isDarkMode ? '#6a7282' : '#e8e8e8'}`,
                      borderRadius: 0,
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* 文章内容 */}
                    <div className="flex-1">
                      {/* 第一行：文章标题 */}
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-secondary-800 dark:text-white hover:text-primary-600 transition-colors duration-200 flex-1">
                          <a
                            href={ROUTES.ARTICLE_DETAIL(collection.articleId)}
                            className="hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {collection.title}
                          </a>
                        </h3>
                      </div>

                      {/* 第二行：简介 */}
                      <div className="text-sm text-secondary-500 dark:text-gray-300 mb-4 line-clamp-2">
                        {collection.summary}
                      </div>

                      {/* 第三行：收藏时间、作者信息、统计数据 */}
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center gap-3 justify-between text-sm text-secondary-500 dark:text-gray-400">
                          {/*原创*/}
                          <div className="flex items-center">
                            <Tag variant="solid" color={'gold'}>
                              {ArticleOriginalMap[collection.originalStatus]}
                            </Tag>
                            <Divider orientation="vertical" className={'bg-gray-300'} style={{ height: '16px' }} />
                            {/*分类*/}
                            <span>{collection.categoryName || '无'}</span>
                            <Divider orientation="vertical" className={'bg-gray-300'} style={{ height: '16px' }} />
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <img
                                src={collection.avatar}
                                alt={collection.nickname}
                                className="w-7 h-7 rounded-full object-cover mr-2"
                              />
                              <span>{collection.nickname}</span>
                            </div>
                            <Space size={4}>
                              <EyeOutlined /> {collection.readCount}
                            </Space>
                            <Space size={4}>
                              <LikeOutlined /> {collection.likeCount}
                            </Space>
                            <Space size={4}>
                              <MessageOutlined /> {collection.commentCount}
                            </Space>
                            <div className="flex items-center pl-2">
                              <span>
                                收藏于: {collection.collectTime ? formatDateTimeShort(collection.collectTime) : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 更多操作 */}
                        <div className="flex items-center space-x-2">
                          <Popover
                            placement="bottom"
                            content={
                              <Space orientation="vertical">
                                <Button icon={<ShareAltOutlined />} size="small" type="text" onClick={handleShare}>
                                  转发
                                </Button>
                                <Button icon={<FlagOutlined />} size="small" type="text" onClick={handleReport}>
                                  举报
                                </Button>
                                <Button
                                  icon={<FolderOpenOutlined />}
                                  size="small"
                                  type="text"
                                  onClick={() => handleOpenMoveModal(collection.articleId)}
                                >
                                  移动
                                </Button>
                                <Button
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  type="text"
                                  danger
                                  onClick={() => handleSingleDelete(collection.articleId.toString())}
                                >
                                  取消收藏
                                </Button>
                              </Space>
                            }
                            trigger="click"
                          >
                            <Button icon={<MoreOutlined />} size="small" type="text" />
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {/* 文章封面图 */}
                    {collection.coverImage && (
                      <div className="shrink-0">
                        <img
                          src={collection.coverImage}
                          alt={collection.title}
                          className="w-48 h-28 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              )}
              emptyContent={
                <div className="py-12 text-center">
                  <p>暂无收藏的文章</p>
                </div>
              }
            />
          </div>
        </div>

        {/* 新建收藏夹模态框 */}
        <Modal title="新建收藏夹" open={isCreateModalVisible} onCancel={handleCloseCreateModal} footer={null}>
          <Form form={form} layout="vertical" onFinish={handleCreateFolder}>
            <Form.Item name="folderName" label="收藏夹名称" rules={[{ required: true, message: '请输入收藏夹名称' }]}>
              <Input placeholder="请输入收藏夹名称" />
            </Form.Item>
            <Form.Item name="folderDescription" label="收藏夹描述">
              <Input.TextArea placeholder="请输入收藏夹描述（可选）" rows={3} />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={handleCloseCreateModal}>取消</Button>
                <Button type="primary" htmlType="submit" loading={createFolderLoading}>
                  创建
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 移动收藏模态框 */}
        <Modal
          title="移动收藏"
          open={moveModalVisible}
          onCancel={handleCloseMoveModal}
          onOk={isCreateFolderForMove ? handleCreateFolderAndMove : handleMoveArticle}
          okText={isCreateFolderForMove ? '创建并移动' : '移动'}
          cancelText="取消"
          confirmLoading={isMoving}
        >
          {!isCreateFolderForMove ? (
            <div className="space-y-4">
              <p>请选择目标收藏夹：</p>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTargetFolderId === Number(folder.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTargetFolderId(Number(folder.id))}
                  >
                    <FolderOutlined className={`mr-3 ${folder.isDefault ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className="text-gray-800">{folder.name}</span>
                    {folder.isDefault && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">默认</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button type="text" icon={<FolderAddOutlined />} onClick={() => setIsCreateFolderForMove(true)}>
                  新建收藏夹
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>创建新收藏夹并移动：</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收藏夹名称</label>
                  <Input
                    placeholder="输入收藏夹名称"
                    value={newFolderNameForMove}
                    onChange={(e) => setNewFolderNameForMove(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收藏夹描述（可选）</label>
                  <Input.TextArea
                    placeholder="输入收藏夹描述"
                    rows={3}
                    value={newFolderDescriptionForMove}
                    onChange={(e) => setNewFolderDescriptionForMove(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <Button type="text" icon={<FolderOutlined />} onClick={() => setIsCreateFolderForMove(false)}>
                    选择现有收藏夹
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};
export default MyCollections;
