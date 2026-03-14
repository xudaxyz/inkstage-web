import { useState, useCallback } from 'react';
import { message } from 'antd';
import articleService from '../services/articleService';

// 收藏文件夹类型定义
export interface CollectionFolder {
    id: number;
    name: string;
    articleCount: number;
    defaultFolder: boolean;
}

// 文件夹API响应类型
interface FolderApiResponse {
    id: number;
    name: string;
    articleCount: number;
    defaultFolder: number | string;
}

const useCollection = () => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<CollectionFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number>(0);

  // 获取收藏文件夹列表
  const fetchFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    try {
      const response = await articleService.getCollectionFolders();
      if (response.code === 200 && response.data) {
        const formattedFolders: CollectionFolder[] = response.data.map((folder: FolderApiResponse) => ({
          id: folder.id,
          name: folder.name,
          articleCount: folder.articleCount || 0,
          defaultFolder: folder.defaultFolder === 1 || folder.defaultFolder === 'YES'
        }));
        setFolders(formattedFolders);

        // 默认选择默认文件夹
        const defaultFolder = response.data.find((folder: FolderApiResponse) => folder.defaultFolder === 1 || folder.defaultFolder === 'YES');
        if (defaultFolder) {
          setSelectedFolderId(defaultFolder.id);
        }

        return formattedFolders;
      }
      return [];
    } catch (error) {
      console.error('获取收藏文件夹失败:', error);
      message.error('获取收藏文件夹失败');
      return [];
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // 收藏文章
  const collectArticle = useCallback(async (articleId: number, folderId: number = 0) => {
    setIsCollecting(true);
    try {
      const response = await articleService.collectArticle({ articleId, folderId });
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '收藏失败');
        return false;
      }
    } catch (error) {
      console.error('收藏失败:', error);
      message.error('收藏失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 取消收藏
  const unCollectArticle = useCallback(async (articleId: number) => {
    setIsCollecting(true);
    try {
      const response = await articleService.unCollectArticle(articleId);
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '取消收藏失败');
        return false;
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
      message.error('取消收藏失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 移动收藏到指定文件夹
  const moveCollection = useCallback(async (articleId: number, targetFolderId: number) => {
    setIsCollecting(true);
    try {
      const response = await articleService.moveCollectionArticle(articleId, targetFolderId);
      if (response.code === 200) {
        return true;
      } else {
        message.error(response.message || '移动失败');
        return false;
      }
    } catch (error) {
      console.error('移动收藏失败:', error);
      message.error('移动失败，请重试');
      return false;
    } finally {
      setIsCollecting(false);
    }
  }, []);

  // 创建新收藏夹
  const createFolder = useCallback(async (folderName: string) => {
    try {
      const response = await articleService.createCollectionFolder({ folderName });
      if (response.code === 200 && response.data) {
        // 重新获取文件夹列表
        await fetchFolders();
        return true;
      } else {
        message.error(response.message || '创建收藏夹失败');
        return false;
      }
    } catch (error) {
      console.error('创建收藏夹失败:', error);
      message.error('创建收藏夹失败');
      return false;
    }
  }, [fetchFolders]);

  // 检查文章是否已收藏
  const checkCollectionStatus = useCallback(async (articleId: number) => {
    try {
      const response = await articleService.checkCollectStatus(articleId);
      if (response.code === 200) {
        return response.data;
      }
      return false;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
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
    checkCollectionStatus
  };
};

export default useCollection;
