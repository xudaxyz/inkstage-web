import React, { useCallback, useState } from 'react';
import { message } from 'antd';
import articleService from '../services/articleService';
import type { CollectionFolder } from '../types/article';
import { ArticleCollectionStatusEnum, DefaultStatusEnum } from '../types/enums';
import { CONSTANTS } from '../constants/common';

// 文件夹API响应类型
interface FolderApiResponse {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  sortOrder: number;
  defaultFolder: DefaultStatusEnum;
  status: ArticleCollectionStatusEnum;
}

const useCollection = (): {
  isCollecting: boolean;
  isLoadingFolders: boolean;
  folders: CollectionFolder[];
  selectedFolderId: string;
  setSelectedFolderId: React.Dispatch<React.SetStateAction<string>>;
  fetchFolders: () => Promise<CollectionFolder[]>;
  collectArticle: (articleId: string, folderId?: string) => Promise<boolean>;
  unCollectArticle: (articleId: string) => Promise<boolean>;
  moveCollection: (articleId: string, targetFolderId: string) => Promise<boolean>;
  createFolder: (name: string, description?: string, status?: ArticleCollectionStatusEnum) => Promise<boolean>;
  updateFolder: (folderId: string, name: string, description?: string, status?: ArticleCollectionStatusEnum) => Promise<boolean>;
  deleteFolder: (folderId: string, strategy?: string) => Promise<boolean>;
  sortFolders: (folderIds: string[]) => Promise<boolean>;
  checkCollectionStatus: (articleId: string) => Promise<boolean>;
} => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  // 格式化文件夹数据
  const formatFolder = (folder: FolderApiResponse): CollectionFolder => ({
    id: folder.id,
    name: folder.name,
    description: folder.description || '',
    articleCount: folder.articleCount || 0,
    sortOrder: folder.sortOrder || 0,
    defaultFolder: folder.defaultFolder || DefaultStatusEnum.YES,
    status: folder.status || ArticleCollectionStatusEnum.PUBLIC
  });

  // 获取收藏文件夹列表
  const fetchFolders = useCallback(async (): Promise<CollectionFolder[]> => {
    setIsLoadingFolders(true);
    try {
      const response = await articleService.getCollectionFolders();
      if (response.code === 200 && response.data) {
        const formattedFolders: CollectionFolder[] = response.data.map(formatFolder);
        setFolders(formattedFolders);

        // 默认选择默认文件夹
        const defaultFolder = formattedFolders.find((folder) => folder.defaultFolder === DefaultStatusEnum.YES);
        if (defaultFolder) {
          setSelectedFolderId(defaultFolder.id);
        }

        return formattedFolders;
      }
      return [];
    } catch {
      message.error('获取收藏文件夹失败');
      return [];
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // 收藏文章
  const collectArticle = useCallback(async (articleId: string, folderId: string = ''): Promise<boolean> => {
    setIsCollecting(true);
    try {
      const response = await articleService.collectArticle({ articleId, folderId });
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '收藏失败');
        return false;
      }
    } catch {
      message.error('收藏失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 取消收藏
  const unCollectArticle = useCallback(async (articleId: string): Promise<boolean> => {
    setIsCollecting(true);
    try {
      const response = await articleService.unCollectArticle(articleId);
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '取消收藏失败');
        return false;
      }
    } catch {
      message.error('取消收藏失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 移动收藏到指定文件夹
  const moveCollection = useCallback(async (articleId: string, targetFolderId: string): Promise<boolean> => {
    setIsCollecting(true);
    try {
      const response = await articleService.moveCollectionArticle(articleId, targetFolderId);
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '移动失败');
        return false;
      }
    } catch {
      message.error('移动失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 创建新收藏夹
  const createFolder = useCallback(async (name: string, description?: string, status?: ArticleCollectionStatusEnum): Promise<boolean> => {
    try {
      const response = await articleService.createCollectionFolder({ name, description, status });
      if (response.code === 200 && response.data) {
        await fetchFolders();
        return true;
      } else {
        message.error(response.message || '创建收藏夹失败');
        return false;
      }
    } catch {
      message.error('创建收藏夹失败');
      return false;
    }
  }, [fetchFolders]);

  // 更新收藏夹
  const updateFolder = useCallback(async (folderId: string, name: string, description?: string, status?: ArticleCollectionStatusEnum): Promise<boolean> => {
    try {
      const response = await articleService.updateCollectionFolder(folderId, { name, description, status });
      if (response.code === 200) {
        await fetchFolders();
        return true;
      } else {
        message.error(response.message || '更新收藏夹失败');
        return false;
      }
    } catch {
      message.error('更新收藏夹失败');
      return false;
    }
  }, [fetchFolders]);

  // 删除收藏夹
  const deleteFolder = useCallback(async (folderId: string, strategy: string = CONSTANTS.COLLECT_DELETE_STRATEGY_MOVE_TO_DEFAULT): Promise<boolean> => {
    try {
      const response = await articleService.deleteCollectionFolder(folderId, strategy);
      if (response.code === 200) {
        await fetchFolders();
        return true;
      } else {
        message.error(response.message || '删除收藏夹失败');
        return false;
      }
    } catch {
      message.error('删除收藏夹失败');
      return false;
    }
  }, [fetchFolders]);

  // 批量更新收藏夹排序
  const sortFolders = useCallback(async (folderIds: string[]): Promise<boolean> => {
    try {
      const response = await articleService.batchUpdateFolderSort(folderIds);
      if (response.code === 200) {
        await fetchFolders();
        return true;
      } else {
        message.error(response.message || '排序更新失败');
        return false;
      }
    } catch {
      message.error('排序更新失败');
      return false;
    }
  }, [fetchFolders]);

  // 检查文章是否已收藏
  const checkCollectionStatus = useCallback(async (articleId: string): Promise<boolean> => {
    try {
      const response = await articleService.checkCollectStatus(articleId);
      if (response.code === 200) {
        return response.data;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    isCollecting,
    isLoadingFolders,
    folders,
    selectedFolderId,
    setSelectedFolderId,
    fetchFolders,
    collectArticle,
    unCollectArticle,
    moveCollection,
    createFolder,
    updateFolder,
    deleteFolder,
    sortFolders,
    checkCollectionStatus
  };
};

export default useCollection;
