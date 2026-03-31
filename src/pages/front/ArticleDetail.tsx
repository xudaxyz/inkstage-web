import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Divider, Dropdown, List, message, Modal, notification, Tooltip } from 'antd';
import { formatDateTimeShort } from '../../utils';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LikeOutlined,
  LikeTwoTone,
  LinkOutlined,
  MessageOutlined,
  PlusOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarTwoTone,
  UpOutlined
} from '@ant-design/icons';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import CommentSection from '../../components/front/CommentSection';
import CollectionFolderModal from '../../components/front/CollectionFolderModal';
import ArticleContent from '../../components/front/ArticleContent';
import { useArticleStore, useTheme, useUserStore } from '../../store';
import useCollection from '../../hooks/useCollection';
import articleService from '../../services/articleService';
import readingHistoryService from '../../services/readingHistoryService';
import { checkFollowStatus, followUser, unfollowUser } from '../../services/userService';
import type { FrontTag } from '../../types/tag';

const ArticleDetail: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  // 阅读历史相关状态
  const readingStartTimeRef = useRef<number>(0);
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  // 回到顶部按钮显示状态
  const [showBackToTop, setShowBackToTop] = useState(false);
  // 当前活动目录项ID
  const [activeTocId, setActiveTocId] = useState<string>('');
  // 关注状态
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  // 获取当前用户信息
  const { user, isLoggedIn } = useUserStore();
  // 获取文章状态
  const {
    article,
    loading,
    error,
    relatedArticles,
    relatedArticlesLoading,
    likeLoading,
    collectLoading,
    fetchArticleDetail,
    fetchRelatedArticles,
    incrementReadCount,
    updateCommentCount,
    reset
  } = useArticleStore();
  // 使用收藏Hook
  const {
    isLoadingFolders,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    fetchFolders,
    moveCollection,
    createFolder
  } = useCollection();
  // 获取文章操作方法
  const { likeArticle, unLikeArticle, collectArticle, unCollectArticle } = useArticleStore();
  // 生成唯一ID的辅助函数
  const generateUniqueId = (text: string, idMap: Map<string, number>): string => {
    let id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    // 确保ID唯一性
    if (idMap.has(id)) {
      const count = Number(idMap.get(id)) + 1;
      idMap.set(id, count);
      id = `${id}-${count}`;
    } else {
      idMap.set(id, 0);
    }
    return id;
  };

  // 生成目录
  const toc = React.useMemo(() => {
    if (!article) return [];
    const newToc: Array<{ id: string; text: string; level: number }> = [];
    const idMap = new Map<string, number>();

    // 尝试从HTML内容中提取标题
    const htmlHeadingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let htmlMatch;

    while ((htmlMatch = htmlHeadingRegex.exec(article.content)) !== null) {
      const level = parseInt(htmlMatch[1]);
      const text = htmlMatch[2].replace(/<[^>]*>/g, '').trim(); // 移除HTML标签
      const id = generateUniqueId(text, idMap);
      newToc.push({ id, text, level });
    }

    // 如果没有从HTML中提取到标题，尝试从Markdown中提取
    if (newToc.length === 0) {
      const mdHeadingRegex = /^(#{1,6})\s+(.+)$/gm;
      let mdMatch;
      while ((mdMatch = mdHeadingRegex.exec(article.content)) !== null) {
        const level = mdMatch[1].length;
        const text = mdMatch[2].trim();
        const id = generateUniqueId(text, idMap);
        newToc.push({ id, text, level });
      }
    }

    return newToc;
  }, [article]);
  // 计算阅读进度
  const calculateProgress = useCallback((): number => {
    if (!contentRef.current) return 0;
    const content = contentRef.current;
    const scrollTop = window.scrollY;
    const contentHeight = content.scrollHeight - window.innerHeight;
    // 控制回到顶部按钮显示/隐藏
    setShowBackToTop(scrollTop > 300);
    // 当内容高度小于等于窗口高度时，说明文章很短，不需要滚动就能阅读完整，进度为100%
    if (contentHeight <= 0) {
      setScrollPosition(scrollTop);
      return 100;
    }
    const progress = Math.min(Math.round((scrollTop / contentHeight) * 100), 100);
    setScrollPosition(scrollTop);
    return progress;
  }, []);

  // 更新当前活动目录项
  const updateActiveTocItem = useCallback((): void => {
    if (toc.length === 0) return;

    const headings = toc.map((item) => document.getElementById(item.id));
    const visibleHeadings = headings
      .filter((heading): heading is HTMLElement => heading !== null)
      .filter((heading) => {
        const rect = heading.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 0;
      });

    if (visibleHeadings.length > 0) {
      // 选择最顶部的可见标题
      const topHeading = visibleHeadings.reduce((prev, current) => {
        const prevRect = prev.getBoundingClientRect();
        const currentRect = current.getBoundingClientRect();
        return prevRect.top < currentRect.top ? prev : current;
      });
      setActiveTocId(topHeading.id);
    }
  }, [toc]);

  // 保存阅读历史
  const saveReadingHistory = useCallback(async (): Promise<void> => {
    if (!id || !isLoggedIn) return;
    const progress = calculateProgress();
    const duration = Math.round((Date.now() - readingStartTimeRef.current) / 60000); // 转换为分钟
    try {
      await readingHistoryService.saveReadingHistory({
        articleId: Number(id),
        progress,
        duration,
        scrollPosition
      });
    } catch (error) {
      console.error('保存阅读历史失败:', error);
    }
  }, [id, isLoggedIn, calculateProgress, scrollPosition]);

  // 当文章ID变化时获取文章详情和增加阅读量
  useEffect(() => {
    if (id) {
      void fetchArticleDetail(Number(id));
      void incrementReadCount(Number(id));
    }
    // 重置阅读开始时间
    readingStartTimeRef.current = Date.now();
    // 组件卸载时重置状态
    return (): void => {
      reset();
    };
  }, [id, fetchArticleDetail, incrementReadCount, reset]);

  // 当文章数据变化时获取作者相关文章
  useEffect(() => {
    if (article && id) {
      void fetchRelatedArticles(article.userId, Number(id));
    }
  }, [article, id, fetchRelatedArticles]);

  // 监听滚动事件，计算阅读进度和更新活动目录项
  useEffect(() => {
    // 节流函数，限制滚动事件处理频率
    let lastCall = 0;
    const throttledScroll = (): void => {
      const now = Date.now();
      if (now - lastCall > 100) {
        // 每100ms执行一次
        calculateProgress();
        updateActiveTocItem();
        lastCall = now;
      }
    };
    window.addEventListener('scroll', throttledScroll);
    // 初始加载时更新活动目录项
    updateActiveTocItem();
    return (): void => window.removeEventListener('scroll', throttledScroll);
  }, [calculateProgress, updateActiveTocItem]);

  // 定期保存阅读历史（每10秒）
  useEffect(() => {
    if (!id || !isLoggedIn) return;
    const timer = setInterval(saveReadingHistory, 10000);
    return (): void => clearInterval(timer);
  }, [id, isLoggedIn, saveReadingHistory]);

  // 页面离开时保存阅读历史
  useEffect(() => {
    if (!id || !isLoggedIn) return;
    const handleBeforeUnload = (): void => {
      void saveReadingHistory();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return (): void => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, isLoggedIn, saveReadingHistory]);

  // 检查关注状态
  useEffect(() => {
    const checkFollow = async (): Promise<void> => {
      if (!isLoggedIn || !article || !article.userId) {
        setIsFollowing(false);
        return;
      }
      // 不能关注自己
      if (user?.id && Number(user.id) === article.userId) {
        setIsFollowing(false);
        return;
      }
      try {
        const response = await checkFollowStatus(article.userId);
        if (response.code === 200) {
          setIsFollowing(response.data);
        }
      } catch (error) {
        console.error('检查关注状态失败:', error);
      }
    };
    void checkFollow();
  }, [isLoggedIn, article, user?.id]);

  // 处理关注/取消关注
  const handleFollow = async (): Promise<void> => {
    if (!isLoggedIn) {
      message.info('请先登录');
      return;
    }
    if (!article || !article.userId) {
      message.error('作者信息不存在');
      return;
    }
    // 不能关注自己
    if (user?.id && Number(user.id) === article.userId) {
      message.info('不能关注自己');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // 取消关注
        const response = await unfollowUser(article.userId);
        if (response.code === 200) {
          setIsFollowing(false);
          message.success('已取消关注');
        } else {
          message.error(response.message || '取消关注失败');
        }
      } else {
        // 关注
        const response = await followUser(article.userId);
        if (response.code === 200) {
          setIsFollowing(true);
          message.success('关注成功');
        } else {
          message.error(response.message || '关注失败');
        }
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      message.error('操作失败，请重试');
    } finally {
      setFollowLoading(false);
    }
  };

  const scrollToHeading = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const headerOffset = 100; // 留出header的高度
      const scrollPosition = window.scrollY + rect.top - headerOffset;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLike = async (): Promise<void> => {
    if (!isLoggedIn || !article) {
      message.info('请先登录');
      return;
    }
    const articleId = Number(id);
    if (isNaN(articleId)) {
      message.error('文章ID无效');
      return;
    }
    if (article.isLiked) {
      // 取消点赞
      await unLikeArticle(articleId);
    } else {
      // 点赞
      await likeArticle(articleId);
    }
  };

  const handleCollect = async (): Promise<void> => {
    if (!isLoggedIn || !article) {
      message.info('请先登录');
      return;
    }
    // 检查文章ID是否有效
    const articleId = Number(id);
    if (isNaN(articleId)) {
      message.error('文章ID无效');
      return;
    }
    if (article.isCollected) {
      // 取消收藏
      await unCollectArticle(articleId);
      notification.success({
        title: '取消收藏成功',
        duration: 2,
        placement: 'top'
      });
    } else {
      // 默认收藏到默认文件夹
      await collectArticle(articleId);
      // 显示收藏成功提示，并提供选择收藏夹的选项
      notification.success({
        title: '收藏成功',
        description: (
          <div>
            <p>文章已成功收藏到默认收藏夹</p>
            <Button type="link" onClick={() => openFolderModal(articleId)} style={{ marginLeft: 0, padding: 0 }}>
              选择其他收藏夹
            </Button>
          </div>
        ),
        duration: 3,
        placement: 'top'
      });
    }
  };

  // 保存收藏到指定文件夹
  const handleSaveToFolder = async (folderId: number): Promise<void> => {
    const articleId = Number(id);
    if (isNaN(articleId)) {
      message.error('文章ID无效');
      return;
    }
    const success = await moveCollection(articleId, folderId);
    if (success) {
      notification.success({
        title: '移动成功',
        description: '文章已成功移动到指定收藏夹',
        duration: 3,
        placement: 'top'
      });
      setFolderModalVisible(false);
    }
  };

  // 打开文件夹选择模态框
  const openFolderModal = async (articleId: number): Promise<void> => {
    if (!articleId) {
      message.error('文章ID不存在');
      return;
    }
    // 获取收藏文件夹列表
    await fetchFolders();
    setFolderModalVisible(true);
  };

  const handleShare = (): void => {
    void message.info('分享功能即将上线');
  };

  // 回到顶部函数
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  // 处理文章编辑
  const handleEdit = (): void => {
    navigate(`/edit-article/${id}`);
  };
  // 处理文章删除
  const handleDelete = (): void => {
    setDeleteModalVisible(true);
  };
  // 确认删除文章
  const confirmDelete = async (): Promise<void> => {
    try {
      setDeleteModalVisible(false);
      if (!id) {
        message.error('文章ID不存在');
        return;
      }
      const result = await articleService.deleteArticle(Number(id));
      if (result.code === 200) {
        message.success('文章删除成功');
        // 跳转到我的创作页面
        navigate('/profile/creations');
      } else {
        message.error(result.message || '文章删除失败');
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      message.error('删除失败，请重试');
    }
  };
  // 检查当前用户是否是文章作者
  const isArticleUser = user && user.id && article && Number(user.id) === article.userId;
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">正在加载文章详情...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col bg-white font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{error || '文章不存在'}</h2>
            <p className="text-gray-500 mb-6">很抱歉，您访问的文章可能已被删除或不存在。</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftOutlined className="mr-1" />
                返回上一页
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                回到首页
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* 顶部导航栏 */}
      <Header />

      {/* 删除确认对话框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okType="danger"
      >
        <p>您确定要删除这篇文章吗？此操作不可恢复。</p>
      </Modal>

      {/* 主体内容 */}
      <main className="bg-gray-50 dark:bg-gray-800 flex-1 pt-8 px-[5%]">
        {/* 三栏布局：左侧互动按钮 + 中间文章内容 + 右侧边栏 */}
        <div className="flex flex-col lg:flex-row">
          {/* 左侧互动按钮区域 */}
          <div className="hidden lg:block lg:w-[2%] ">
            <div className="sticky top-36 flex flex-col items-end gap-6 max-h-[400px]">
              {/* 点赞按钮 */}
              <div className="flex flex-col items-center gap-1">
                <Tooltip title="点赞">
                  <Button
                    type="text"
                    variant="outlined"
                    size="large"
                    onClick={handleLike}
                    loading={likeLoading}
                    icon={article.isLiked ? <LikeTwoTone /> : <LikeOutlined />}
                  />
                </Tooltip>
                <span className="text-xs text-gray-500">{article.likeCount || 0}</span>
              </div>

              {/* 收藏按钮 */}
              <div className="flex flex-col items-center gap-1">
                <Tooltip title="收藏">
                  <Button
                    type="text"
                    variant="outlined"
                    size="large"
                    onClick={handleCollect}
                    loading={collectLoading}
                    icon={article.isCollected ? <StarTwoTone /> : <StarOutlined />}
                  />
                </Tooltip>
                <span className="text-xs text-gray-500">{article.collectionCount || 0}</span>
              </div>

              {/* 评论按钮 */}
              <div className="flex flex-col items-center gap-1">
                <Tooltip title="评论">
                  <Button type="text" variant="outlined" size="large" icon={<MessageOutlined />} />
                </Tooltip>
                <span className="text-xs text-gray-500">{article.commentCount || 0}</span>
              </div>

              {/* 转发按钮 */}
              <div className="flex flex-col items-center gap-1">
                <Tooltip title="转发">
                  <Button
                    type="text"
                    variant="outlined"
                    size="large"
                    onClick={handleShare}
                    icon={<ShareAltOutlined />}
                  />
                </Tooltip>
              </div>

              {/* 举报按钮 */}
              <div className="flex flex-col items-end gap-1">
                <Tooltip title="举报">
                  <Button type="text" variant="outlined" size="large" icon={<ExclamationCircleOutlined />} />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* 中间文章详情 */}
          <div className="bg-white dark:bg-gray-800 px-10 pt-8 lg:w-3/4 lg:mr-12 rounded-2xl">
            {/* 响应式调整 */}
            <div className="md:pr-4">
              {/* 文章标题 */}
              <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-100 leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* 作者信息和统计数据 */}
              <div className="flex flex-wrap items-center justify-between gap-5 mb-8 text-gray-500 pb-4 border-b dark:border-b border-gray-100 dark:border-gray-600">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      src={article.avatar || undefined}
                      alt={article.nickname}
                      className="border border-gray-100 shadow-sm"
                    />
                    <div>
                      {article.userId ? (
                        <a
                          href={`/user/${article.userId}`}
                          className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {article.nickname || '未知作者'}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-800">{article.nickname || '未知作者'}</span>
                      )}
                    </div>
                  </div>
                  {article.categoryName && (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-4xl">
                      {article.categoryName}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <Tooltip title="阅读量">
                      <div className="flex items-center gap-2">
                        <EyeOutlined className="text-gray-400" />
                        <span>{article.readCount || 0}</span>
                      </div>
                    </Tooltip>
                    <Tooltip title="点赞数">
                      <div className="flex items-center gap-2">
                        <LikeOutlined className={`${article.isLiked ? 'text-red-500' : 'text-gray-400'}`} />
                        <span>{article.likeCount || 0}</span>
                      </div>
                    </Tooltip>
                    <Tooltip title="评论数">
                      <div className="flex items-center gap-1">
                        <MessageOutlined className="text-gray-400" />
                        <span>{article.commentCount || 0}</span>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-sm text-gray-400">
                      {article.publishTime ? formatDateTimeShort(article.publishTime) : ''}
                    </span>
                  </div>
                </div>
                {isArticleUser && (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          icon: <EditOutlined />,
                          label: '修改',
                          onClick: handleEdit
                        },
                        {
                          key: 'delete',
                          icon: <DeleteOutlined />,
                          label: '删除',
                          onClick: handleDelete
                        }
                      ]
                    }}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      className="text-gray-400 dark:text-gray-200 hover:text-gray-600 transition-colors"
                    >
                      管理 <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </div>

              {/* 文章摘要 */}
              {article.summary && (
                <div className="mb-8 text-sm text-gray-600 dark:text-gray-300 dark:border-blue-400 italic border-l-4 border-blue-200 pl-6 py-4 bg-blue-50 dark:bg-gray-600 rounded-r-lg shadow-sm">
                  {article.summary}
                </div>
              )}

              {/* 文章封面图 */}
              {article.coverImage && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-72 md:h-96 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}

              {/* 文章内容 */}
              <div ref={contentRef}>
                <ArticleContent content={article.content || ''} />
              </div>

              {/* 文章标签 */}
              {article.tags && Array.isArray(article.tags) && (
                <div className="mb-12 flex flex-wrap gap-3">
                  {article.tags.map((tag: FrontTag, index: number) => (
                    <span
                      key={tag.id || index}
                      className="text-xs bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-8 border-t dark:border-t border-gray-100 dark:border-gray-500">
                <Button
                  onClick={handleLike}
                  size="large"
                  shape="round"
                  loading={likeLoading}
                  icon={<LikeOutlined className={article.isLiked ? 'text-red-500' : ''} />}
                  className={`${article.isLiked ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-600 border-gray-200'} px-6 py-2.5 rounded-full hover:shadow-md transition-all duration-300`}
                >
                  {article.isLiked ? '已点赞' : '点赞'}
                </Button>
                <Button
                  onClick={handleCollect}
                  size="large"
                  shape="round"
                  loading={collectLoading}
                  icon={<StarOutlined className={article.isCollected ? 'text-yellow-500' : ''} />}
                  className={`${article.isCollected ? 'text-yellow-500 bg-yellow-50 border-yellow-200' : 'text-gray-600 border-gray-200'} px-6 py-2.5 rounded-full hover:shadow-md transition-all duration-300`}
                >
                  {article.isCollected ? '已收藏' : '收藏'}
                </Button>
                <Button
                  onClick={handleShare}
                  size="large"
                  shape="round"
                  icon={<ShareAltOutlined />}
                  className="text-gray-600 border-gray-200 px-6 py-2.5 rounded-full hover:shadow-md transition-all duration-300"
                >
                  分享
                </Button>
              </div>

              {/* 评论区 */}
              <CommentSection
                articleId={Number(id)}
                currentUserId={isLoggedIn ? Number(user.id) : undefined}
                currentUserNickname={user.nickname}
                currentUserAvatar={user.avatar}
                onCommentCountChange={updateCommentCount}
              />
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="lg:w-1/4">
            {/* 响应式调整 */}
            <div className="mb-10">
              {/* 作者信息 */}
              <Card
                style={{
                  marginBottom: '32px',
                  backgroundColor: `${isDarkMode ? '#4a5565' : 'white'}`
                }}
              >
                <div className="text-center">
                  <Avatar
                    size={88}
                    src={article.avatar || undefined}
                    alt={article.nickname}
                    className="border-2 border-gray-100 shadow-md"
                  />
                  {article.userId ? (
                    <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      <a href={`/user/${article.userId}`} className="font-semibold text-gray-800 transition-colors">
                        {article.nickname || '未知作者'}
                      </a>
                    </h3>
                  ) : (
                    <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {article.nickname || '未知作者'}
                    </h3>
                  )}
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="mt-2">{article.signature || '暂无简介'}</p>
                  </div>
                  <Divider className="my-6" />
                  {isLoggedIn && user?.id && article?.userId && (
                    <Button
                      type={isFollowing ? 'default' : 'primary'}
                      loading={followLoading}
                      onClick={handleFollow}
                      icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
                      className={`w-[60%] py-2 rounded-lg shadow-sm hover:shadow-md transition-colors ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isFollowing ? '已关注' : '关注作者'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* 作者相关文章 */}
              <Card
                style={{
                  backgroundColor: `${isDarkMode ? '#4a5565' : 'white'}`
                }}
                className="mb-8 border border-gray-100 rounded-lg shadow-sm"
                title="作者相关文章"
              >
                {relatedArticlesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : relatedArticles.length > 0 ? (
                  <List
                    size="small"
                    dataSource={relatedArticles}
                    renderItem={(item): React.ReactNode => (
                      <List.Item className="py-3">
                        <List.Item.Meta
                          title={
                            <a
                              href={`/article/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {item.title}
                            </a>
                          }
                          description={
                            <span className="text-gray-400 text-xs">
                              {item.publishTime ? formatDateTimeShort(item.publishTime) : ''}
                            </span>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">暂无相关文章</div>
                )}
              </Card>

              {/* 文章目录 */}
              {toc.length > 0 && (
                <Card
                  variant={'borderless'}
                  style={{
                    backgroundColor: `${isDarkMode ? '#4a5565' : 'white'}`,
                    marginTop: '32px',
                    position: 'sticky',
                    top: '150px'
                  }}
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">文章目录</h3>
                  <div className="text-sm max-h-[400px] overflow-y-auto pr-2">
                    {toc.map((item, index) => (
                      <div
                        key={index}
                        className={`mb-2 pl-${(item.level - 1) * 6} cursor-pointer transition-colors py-1 px-2 rounded-md ${activeTocId === item.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                        onClick={() => scrollToHeading(item.id)}
                      >
                        <LinkOutlined
                          className={`mr-1 ${activeTocId === item.id ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 回到顶部按钮 */}
              {showBackToTop && (
                <div className="fixed bottom-24 right-24 z-50">
                  <Button
                    variant={'text'}
                    color={'cyan'}
                    shape="circle"
                    icon={<UpOutlined />}
                    onClick={scrollToTop}
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                    size="large"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 收藏成功提示使用Ant Design的message组件 */}
      {/* 文件夹选择模态框 */}
      <CollectionFolderModal
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        onSave={handleSaveToFolder}
        folders={folders}
        loading={isLoadingFolders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={createFolder}
      />

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};
export default ArticleDetail;
