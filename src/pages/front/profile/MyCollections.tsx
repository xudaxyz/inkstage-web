import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  notification,
  Popover,
  Radio,
  Space,
  Spin,
  Switch,
  Tag
} from 'antd';
import { Helmet } from 'react-helmet-async';
import InfiniteScrollContainer from '../../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FlagOutlined,
  FolderAddOutlined,
  FolderAddTwoTone,
  FolderOpenOutlined,
  FolderOutlined,
  FolderTwoTone,
  HolderOutlined,
  LikeOutlined,
  LockOutlined,
  MessageOutlined,
  MoreOutlined,
  SearchOutlined,
  ShareAltOutlined,
  SortAscendingOutlined,
  StarOutlined,
  UpOutlined
} from '@ant-design/icons';
import { ROUTES } from '../../../constants/routes';
import articleService from '../../../services/articleService';
import { type CollectionFolder, type MyArticleCollectionList } from '../../../types/article';
import { ArticleCollectionStatusEnum, ArticleOriginalMap, DefaultStatusEnum } from '../../../types/enums';
import { computePageResponse, formatDateTimeShort } from '../../../utils';
import { useTheme } from '../../../store';
import { CONSTANTS } from '../../../constants/common';

// 排序类型
type SortType = 'recent' | 'mostLiked' | 'mostViewed';
const MyCollections: React.FC = () => {
  // 状态管理
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [defaultFolderId, setDefaultFolderId] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [searchText, setSearchText] = useState('');
  const [showFolderList, setShowFolderList] = useState(true);
  const [totalCollectionCount, setTotalCollectionCount] = useState(0);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createFolderLoading, setCreateFolderLoading] = useState(false);
  const [form] = Form.useForm();
  // 移动功能相关状态
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);
  const [isCreateFolderForMove, setIsCreateFolderForMove] = useState(false);
  const [newFolderNameForMove, setNewFolderNameForMove] = useState('');
  const [newFolderDescriptionForMove, setNewFolderDescriptionForMove] = useState('');
  // 编辑收藏夹相关状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CollectionFolder | null>(null);
  const [editFolderLoading, setEditFolderLoading] = useState(false);
  const [editForm] = Form.useForm();
  // 删除收藏夹相关状态
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState<CollectionFolder | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<string>(CONSTANTS.COLLECT_DELETE_STRATEGY_MOVE_TO_DEFAULT);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // 排序模式相关状态
  const [isSortMode, setIsSortMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localFolders, setLocalFolders] = useState<CollectionFolder[]>([]);
  const originalFoldersRef = useRef<CollectionFolder[]>([]);
  // 无限滚动相关引用
  const selectedFolderRef = useRef(selectedFolder);
  const sortTypeRef = useRef(sortType);
  const searchTextRef = useRef(searchText);
  const defaultFolderIdRef = useRef(defaultFolderId);
  // 无限滚动配置
  const pageSize = 10;
  // 收藏文章列表获取函数
  const fetcher = useCallback(
    async (pageNum: number, pageSize: number) => {
      const folderId =
        selectedFolderRef.current === 'all'
          ? undefined
          : selectedFolderRef.current === 'default'
            ? defaultFolderIdRef.current
            : selectedFolderRef.current;
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
        return computePageResponse(formattedCollections, response.data.total, pageNum, pageSize);
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
      console.log('getCollectionFolders', response);
      if (response.code === 200 && response.data) {
        const formattedFolders: CollectionFolder[] = response.data.map(
          (folder: CollectionFolder) => ({
            id: folder.id,
            name: folder.name,
            description: folder.description || '',
            articleCount: folder.articleCount || 0,
            sortOrder: folder.sortOrder || 0,
            defaultFolder: folder.defaultFolder || DefaultStatusEnum.YES,
            status: folder.status || ArticleCollectionStatusEnum.PUBLIC
          })
        );
        setFolders(formattedFolders);
        // 提取默认收藏夹ID
        const defaultFolder = formattedFolders.find((f) => f.defaultFolder === DefaultStatusEnum.YES);
        if (defaultFolder) {
          setDefaultFolderId(defaultFolder.id);
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
    // 保存快照用于回滚
    const prevData = infiniteScroll.data;
    const prevFolders = [...folders];
    const prevTotal = totalCollectionCount;

    // 移除文章
    infiniteScroll.setData(prevData.filter((item) => item.articleId !== articleId));
    // 文件夹文章数 -1
    setFolders(prevFolders.map(f => {
      const collection = prevData.find(c => c.articleId === articleId);
      if (collection && collection.folderId === f.id && f.articleCount > 0) {
        return { ...f, articleCount: f.articleCount - 1 };
      }
      return f;
    }));
    // 总收藏数 -1
    setTotalCollectionCount(Math.max(0, prevTotal - 1));

    try {
      const result = await articleService.unCollectArticle(articleId);
      if (result.code !== 200) {
        // 如果后端取消收藏失败, 则数据回滚
        infiniteScroll.setData(prevData);
        setFolders(prevFolders);
        setTotalCollectionCount(prevTotal);
        message.error(result.message || '取消收藏失败');
      }
    } catch {
      // 回滚数据
      infiniteScroll.setData(prevData);
      setFolders(prevFolders);
      setTotalCollectionCount(prevTotal);
      message.error('取消收藏失败，请重试');
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
  const handleCreateFolder = async (values: {
    name: string;
    description?: string;
    isPublic?: boolean
  }): Promise<void> => {
    setCreateFolderLoading(true);
    try {
      const status = values.isPublic !== false ? ArticleCollectionStatusEnum.PUBLIC : ArticleCollectionStatusEnum.PRIVATE;
      const response = await articleService.createCollectionFolder({
        name: values.name,
        description: values.description,
        status
      });
      if (response.code === 200 && response.data) {
        message.success('收藏夹创建成功');
        setIsCreateModalVisible(false);
        // 重新获取文件夹列表
        await fetchFolders();
      } else {
        message.error(response.message || '创建收藏夹失败');
      }
    } catch {
      message.error('创建收藏夹失败，请重试');
    } finally {
      setCreateFolderLoading(false);
    }
  };
  // 打开编辑收藏夹模态框
  const handleOpenEditModal = (folder: CollectionFolder): void => {
    setEditingFolder(folder);
    editForm.setFieldsValue({
      name: folder.name,
      description: folder.description,
      isPublic: folder.status === ArticleCollectionStatusEnum.PUBLIC
    });
    setIsEditModalVisible(true);
  };

  // 关闭编辑收藏夹模态框
  const handleCloseEditModal = (): void => {
    setIsEditModalVisible(false);
    setEditingFolder(null);
  };

  // 提交编辑收藏夹表单
  const handleEditFolder = async (values: {
    name: string;
    description?: string;
    isPublic?: boolean
  }): Promise<void> => {
    if (!editingFolder) return;
    setEditFolderLoading(true);
    try {
      const status = values.isPublic ? ArticleCollectionStatusEnum.PUBLIC : ArticleCollectionStatusEnum.PRIVATE;
      const response = await articleService.updateCollectionFolder(editingFolder.id, {
        name: values.name,
        description: values.description,
        status
      });
      if (response.code === 200) {
        message.success('收藏夹更新成功');
        setIsEditModalVisible(false);
        await fetchFolders();
      } else {
        message.error(response.message || '更新收藏夹失败');
      }
    } catch (error) {
      message.error('更新收藏夹失败，请重试');
      console.error('更新收藏夹失败:', error);
    } finally {
      setEditFolderLoading(false);
    }
  };

  // 打开删除收藏夹模态框
  const handleOpenDeleteModal = (folder: CollectionFolder): void => {
    setDeletingFolder(folder);
    setDeleteStrategy(CONSTANTS.COLLECT_DELETE_STRATEGY_MOVE_TO_DEFAULT);
    setIsDeleteModalVisible(true);
  };

  // 关闭删除收藏夹模态框
  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalVisible(false);
    setDeletingFolder(null);
  };

  // 确认删除收藏夹
  const handleDeleteFolder = async (): Promise<void> => {
    if (!deletingFolder) return;
    // 保存快照用于回滚
    const prevFolders = [...folders];
    const prevTotal = totalCollectionCount;
    const prevSelectedFolder = selectedFolder;

    // 从文件夹列表中移除
    const updatedFolders = prevFolders.filter(f => f.id !== deletingFolder.id);
    // 根据策略调整默认文件夹文章数和总收藏数
    if (deleteStrategy === CONSTANTS.COLLECT_DELETE_STRATEGY_MOVE_TO_DEFAULT) {
      updatedFolders.forEach(f => {
        if (f.defaultFolder === DefaultStatusEnum.YES) {
          f.articleCount += deletingFolder.articleCount;
        }
      });
    } else {
      setTotalCollectionCount(Math.max(0, prevTotal - deletingFolder.articleCount));
    }
    setFolders(updatedFolders);
    // 如果删除的是当前选中的文件夹，切换到全部
    if (prevSelectedFolder === deletingFolder.id) {
      setSelectedFolder('all');
    }
    setIsDeleteModalVisible(false);

    setDeleteLoading(true);
    try {
      const response = await articleService.deleteCollectionFolder(deletingFolder.id, deleteStrategy);
      if (response.code !== 200) {
        // 回滚
        setFolders(prevFolders);
        setTotalCollectionCount(prevTotal);
        if (prevSelectedFolder === deletingFolder.id) {
          setSelectedFolder(prevSelectedFolder);
        }
        message.error(response.message || '删除收藏夹失败');
      }
    } catch {
      // 回滚
      setFolders(prevFolders);
      setTotalCollectionCount(prevTotal);
      if (prevSelectedFolder === deletingFolder.id) {
        setSelectedFolder(prevSelectedFolder);
      }
      message.error('删除收藏夹失败，请重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 进入排序模式
  const handleEnterSortMode = (): void => {
    const nonDefaultFolders = folders.filter(f => f.defaultFolder !== DefaultStatusEnum.YES);
    originalFoldersRef.current = [...nonDefaultFolders];
    setLocalFolders([...nonDefaultFolders]);
    setIsSortMode(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 取消排序
  const handleCancelSort = (): void => {
    setLocalFolders([...originalFoldersRef.current]);
    setIsSortMode(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 确认排序
  const handleConfirmSort = async (): Promise<void> => {
    const folderIds = localFolders.map(f => f.id);
    try {
      const response = await articleService.batchUpdateFolderSort(folderIds);
      if (response.code === 200) {
        message.success('排序更新成功');
        setIsSortMode(false);
        await fetchFolders();
      } else {
        message.error(response.message || '排序更新失败');
      }
    } catch (error) {
      message.error('排序更新失败，请重试');
      console.error('排序更新失败:', error);
    }
  };

  // 拖拽排序事件处理
  const handleDragStart = (e: React.DragEvent, index: number): void => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (): void => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newFolders = [...localFolders];
    const draggedItem = newFolders[draggedIndex];
    newFolders.splice(draggedIndex, 1);
    newFolders.splice(index, 0, draggedItem);
    setLocalFolders(newFolders);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 打开移动模态框
  const handleOpenMoveModal = (articleId: string): void => {
    setSelectedArticleId(articleId);
    setSelectedTargetFolderId('');
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
    if (!selectedArticleId) {
      message.error('文章ID无效');
      return;
    }
    if (!selectedTargetFolderId) {
      message.error('请选择目标收藏夹');
      return;
    }
    // 保存快照用于回滚
    const prevData = infiniteScroll.data;
    const prevFolders = [...folders];

    // 从当前文件夹视图中移除文章
    infiniteScroll.setData(prevData.filter((item) => item.articleId !== selectedArticleId));
    // 源文件夹文章数 -1，目标文件夹文章数 +1
    const movedCollection = prevData.find(c => c.articleId === selectedArticleId);
    setFolders(prevFolders.map(f => {
      if (movedCollection && movedCollection.folderId === f.id && f.articleCount > 0) {
        return { ...f, articleCount: f.articleCount - 1 };
      }
      if (f.id === selectedTargetFolderId) {
        return { ...f, articleCount: f.articleCount + 1 };
      }
      return f;
    }));

    setIsMoving(true);
    try {
      const response = await articleService.moveCollectionArticle(selectedArticleId, selectedTargetFolderId);
      if (response.code === 200 && response.data) {
        notification.success({
          title: '移动成功',
          description: (
            <div>
              <span>文章已成功移动到指定收藏夹</span>
              <Button
                type="link"
                size="small"
                onClick={() => setSelectedFolder(selectedTargetFolderId)}
              >
                点击查看
              </Button>
            </div>
          ),
          duration: 3,
          placement: 'top'
        });
        setMoveModalVisible(false);
      } else {
        // 回滚
        infiniteScroll.setData(prevData);
        setFolders(prevFolders);
        message.error(response.message || '移动失败');
      }
    } catch {
      // 回滚
      infiniteScroll.setData(prevData);
      setFolders(prevFolders);
      message.error('移动失败，请重试');
    } finally {
      setIsMoving(false);
    }
  };
  // 处理创建新文件夹并移动
  const handleCreateFolderAndMove = async (): Promise<void> => {
    if (!selectedArticleId) {
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
        name: newFolderNameForMove,
        description: newFolderDescriptionForMove
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
      <div className="mx-auto px-4 sm:px-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-secondary-800 dark:text-white">我的收藏</h1>
          <div className="text-gray-500 dark:text-gray-400">({totalCollectionCount})</div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* 左侧收藏夹列表 - 移动端可折叠 */}
          <div className="w-full lg:w-48 shrink-0">
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

                  {/* 我的收藏夹标题 / 排序模式标题 */}
                  <div className="flex items-center px-3 justify-between mb-3">
                    <div className="flex items-center">
                      {isSortMode ? (
                        <>
                          <SortAscendingOutlined className="mr-2" />
                          <span className="font-normal dark:text-gray-300">排序</span>
                        </>
                      ) : (
                        <>
                          <FolderOutlined className="mr-2" />
                          <span className="font-normal dark:text-gray-300">我的收藏夹</span>
                        </>
                      )}
                    </div>
                    {isSortMode ? (
                      <div className="flex items-center gap-1">
                        <Button variant="text" color="primary" size="small" onClick={handleConfirmSort}
                                className="text-xs text-green-600">
                          确认
                        </Button>
                        <Button variant="text" color="gold" size="small" onClick={handleCancelSort} className="text-xs">
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button type="text" size="small" onClick={handleEnterSortMode} title="排序">
                          <SortAscendingOutlined style={{ fontSize: '13px' }} />
                        </Button>
                        <Button type="text" size="small" onClick={() => setShowFolderList(!showFolderList)}>
                          {showFolderList ? (
                            <UpOutlined style={{ fontSize: '14px' }} />
                          ) : (
                            <DownOutlined style={{ fontSize: '14px' }} />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 我的收藏夹列表 */}
                  {(showFolderList || isSortMode) && (
                    <div className="space-y-1 pl-2 pr-3 max-h-80 overflow-y-auto scrollbar-thin">
                      {/* 默认收藏夹 */}
                      <div
                        className={`flex items-center px-4 p-2 rounded-lg cursor-pointer ${selectedFolder === 'default' ? 'bg-primary-50 dark:bg-primary-900/20 text-cyan-600' : 'hover:bg-secondary-50 dark:hover:bg-gray-800'}`}
                        onClick={() => setSelectedFolder('default')}
                      >
                        <FolderOutlined className="mr-2" />
                        <span className="flex-1">默认收藏夹</span>
                        {folders.find((f) => f.defaultFolder === DefaultStatusEnum.YES)?.status === ArticleCollectionStatusEnum.PRIVATE && (
                          <LockOutlined className="mr-1 text-xs text-gray-400" />
                        )}
                        <span>{folders.find((f) => f.defaultFolder === DefaultStatusEnum.YES)?.articleCount || 0}</span>
                      </div>

                      {/* 其他创建的收藏夹 */}
                      {(isSortMode ? localFolders : folders.filter((f) => f.defaultFolder !== DefaultStatusEnum.YES)).map((folder, index) => (
                        <div
                          key={folder.id}
                          className={`flex items-center px-4 p-2 rounded-lg cursor-pointer group ${
                            selectedFolder === folder.id ? 'bg-primary-50 dark:bg-primary-900/20 text-cyan-500' : 'hover:bg-secondary-50 dark:hover:bg-gray-800'
                          } ${isSortMode && dragOverIndex === index ? 'border-t-2 border-cyan-400' : ''}`}
                          onClick={() => !isSortMode && setSelectedFolder(folder.id)}
                          draggable={isSortMode}
                          onDragStart={isSortMode ? (e): void => handleDragStart(e, index) : undefined}
                          onDragOver={isSortMode ? (e): void => handleDragOver(e, index) : undefined}
                          onDragLeave={isSortMode ? handleDragLeave : undefined}
                          onDrop={isSortMode ? (e): void => handleDrop(e, index) : undefined}
                        >
                          {isSortMode && (
                            <HolderOutlined className="mr-1 cursor-grab text-gray-400" />
                          )}
                          <FolderOutlined className="mr-2" />
                          <span className="flex-1 truncate">{folder.name}</span>
                          {folder.status === ArticleCollectionStatusEnum.PRIVATE && (
                            <LockOutlined className="mr-1 text-xs text-gray-400" />
                          )}
                          {!isSortMode && (
                            <>
                              <span>{folder.articleCount}</span>
                              <span className="ml-1 hidden group-hover:inline-flex items-center gap-1">
                                <EditOutlined style={{ color: 'orange' }}
                                              className="text-gray-400 hover:text-blue-500 text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(folder);
                                              }}
                                />
                                <DeleteOutlined style={{ color: 'red' }}
                                                className="text-gray-400 hover:text-red-500 text-xs"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenDeleteModal(folder);
                                                }}
                                />
                              </span>
                            </>
                          )}
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
            <div
              className="border-b border-gray-200 dark:border-gray-700 flex flex-row sm:flex-row flex-wrap justify-between items-start sm:items-center pb-4 mb-6 gap-4">
              {/* 排序选项 */}
              <div className="flex flex-wrap gap-2">
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
              <div className="w-full sm:w-auto flex-1 sm:flex-initial">
                <Input
                  placeholder="搜索收藏的文章"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: '100%', maxWidth: 300 }}
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
                  <div
                    className={`flex ${collection.coverImage ? 'flex-col sm:flex-row' : 'flex-col'} items-start gap-4`}>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3
                          className="text-base sm:text-xl font-semibold text-secondary-800 dark:text-white hover:text-primary-600 transition-colors duration-200 flex-1">
                          <a href={ROUTES.ARTICLE_DETAIL(collection.articleId)} className="hover:underline"
                             target="_blank" rel="noopener noreferrer">
                            {collection.title}
                          </a>
                        </h3>
                      </div>
                      <div className="text-sm text-secondary-500 dark:text-gray-300 mb-4 line-clamp-2">
                        {collection.summary}
                      </div>
                      <div
                        className="hidden sm:flex flex-wrap items-center gap-3 text-sm text-secondary-500 dark:text-gray-400">
                        <div className="flex-1 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Tag variant="solid" color="gold">
                              {ArticleOriginalMap[collection.originalStatus]}
                            </Tag>
                            <span>{collection.categoryName || '无'}</span>
                          </div>
                          <div className="flex items-center">
                            <img src={collection.avatar} alt={collection.nickname}
                                 className="w-5 h-5 rounded-full object-cover mr-2" />
                            <span>{collection.nickname}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Space size={4}>
                              <EyeOutlined /> {collection.readCount}
                            </Space>
                            <Space size={4}>
                              <LikeOutlined /> {collection.likeCount}
                            </Space>
                            <Space size={4}>
                              <MessageOutlined /> {collection.commentCount}
                            </Space>
                          </div>
                          <div className="flex items-center">
                            <Space size={4}>
                              <StarOutlined />
                              {collection.collectTime ? formatDateTimeShort(collection.collectTime) : ''}
                            </Space>
                          </div>
                        </div>
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
                                <Button icon={<FolderOpenOutlined />} size="small" type="text"
                                        onClick={() => handleOpenMoveModal(collection.articleId)}>
                                  移动
                                </Button>
                                <Button icon={<DeleteOutlined />} size="small" type="text" danger
                                        onClick={() => handleSingleDelete(collection.articleId.toString())}>
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
                      <div className="sm:hidden flex flex-col gap-3 text-sm text-secondary-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Tag variant="solid" color="gold">
                            {ArticleOriginalMap[collection.originalStatus]}
                          </Tag>
                          <span>{collection.categoryName || '无'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center">
                            <img src={collection.avatar} alt={collection.nickname}
                                 className="w-5 h-5 rounded-full object-cover mr-2" />
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
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Space size={4}>
                              <StarOutlined />
                              {collection.collectTime ? formatDateTimeShort(collection.collectTime) : ''}
                            </Space>
                          </div>
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
                                  <Button icon={<FolderOpenOutlined />} size="small" type="text"
                                          onClick={() => handleOpenMoveModal(collection.articleId)}>
                                    移动
                                  </Button>
                                  <Button icon={<DeleteOutlined />} size="small" type="text" danger
                                          onClick={() => handleSingleDelete(collection.articleId.toString())}>
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
                    </div>
                    {collection.coverImage && (
                      <div className="shrink-0 w-full sm:w-48 h-24 sm:h-28">
                        <img src={collection.coverImage} alt={collection.title}
                             className="w-full h-full object-cover rounded-lg" />
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
            <Form.Item name="name" label="收藏夹名称" rules={[{ required: true, message: '请输入收藏夹名称' }]}>
              <Input placeholder="请输入收藏夹名称" />
            </Form.Item>
            <Form.Item name="description" label="收藏夹描述">
              <Input.TextArea placeholder="请输入收藏夹描述（可选）" rows={3} />
            </Form.Item>
            <Form.Item name="isPublic" label="公开收藏夹" valuePropName="checked" initialValue={true}>
              <Switch />
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

        {/* 编辑收藏夹模态框 */}
        <Modal title="编辑收藏夹" open={isEditModalVisible} onCancel={handleCloseEditModal} footer={null}>
          <Form form={editForm} layout="vertical" onFinish={handleEditFolder}>
            <Form.Item name="name" label="收藏夹名称" rules={[{ required: true, message: '请输入收藏夹名称' }]}>
              <Input placeholder="请输入收藏夹名称" />
            </Form.Item>
            <Form.Item name="description" label="收藏夹描述">
              <Input.TextArea placeholder="请输入收藏夹描述（可选）" rows={3} />
            </Form.Item>
            <Form.Item name="isPublic" label="公开收藏夹" valuePropName="checked">
              <Switch checkedChildren="公开" unCheckedChildren="私密" />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={handleCloseEditModal}>取消</Button>
                <Button type="primary" htmlType="submit" loading={editFolderLoading}>
                  保存
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 删除收藏夹确认模态框 */}
        <Modal
          title="删除收藏夹"
          open={isDeleteModalVisible}
          onCancel={handleCloseDeleteModal}
          onOk={handleDeleteFolder}
          okText="确认删除"
          cancelText="取消"
          okType="danger"
          confirmLoading={deleteLoading}
        >
          {deletingFolder && (
            <div className="space-y-4">
              <p>确定要删除收藏夹「{deletingFolder.name}」吗？</p>
              {deletingFolder.articleCount > 0 && (
                <div>
                  <p
                    className="text-sm text-gray-500 mb-2">该收藏夹下有 {deletingFolder.articleCount} 篇收藏文章，请选择处理方式：</p>
                  <Radio.Group value={deleteStrategy} onChange={(e) => setDeleteStrategy(e.target.value)}>
                    <Space orientation="vertical">
                      <Radio defaultChecked
                             value={CONSTANTS.COLLECT_DELETE_STRATEGY_MOVE_TO_DEFAULT}>移至默认收藏夹</Radio>
                      <Radio value={CONSTANTS.COLLECT_DELETE_STRATEGY_DELETE_COLLECTIONS}>同时取消收藏</Radio>
                    </Space>
                  </Radio.Group>
                </div>
              )}
            </div>
          )}
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
                      selectedTargetFolderId === folder.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTargetFolderId(folder.id)}
                  >
                    <FolderOutlined
                      className={`mr-3 ${folder.defaultFolder === DefaultStatusEnum.YES ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className="text-gray-800">{folder.name}</span>
                    {folder.defaultFolder === DefaultStatusEnum.YES && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">默认</span>
                    )}
                    {folder.status === ArticleCollectionStatusEnum.PRIVATE && (
                      <LockOutlined className="ml-1" style={{ fontSize: '12px' }} />)}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outlined" color="primary" icon={<FolderAddOutlined />}
                        onClick={() => setIsCreateFolderForMove(true)}>
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
