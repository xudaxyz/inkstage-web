import React, { useEffect, useState } from 'react';
import { Button, Input, message, Modal, Spin, Switch } from 'antd';
import { CheckOutlined, FolderAddOutlined, FolderOutlined, LockOutlined } from '@ant-design/icons';
import type { CollectionFolder } from '../../types/article';
import { ArticleCollectionStatusEnum, DefaultStatusEnum } from '../../types/enums';

interface CollectionFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (folderId: string) => void;
  folders: CollectionFolder[];
  loading: boolean;
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: (name: string, description?: string, status?: ArticleCollectionStatusEnum) => Promise<boolean>;
}

const CollectionFolderModal: React.FC<CollectionFolderModalProps> = ({
  visible,
  onClose,
  onSave,
  folders,
  loading,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderPublic, setNewFolderPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderPublic(true);
    }
  }, [visible]);

  const handleCreateFolder = async (): Promise<void> => {
    if (!newFolderName.trim()) {
      message.info('请输入收藏夹名称');
      return;
    }

    setIsCreating(true);
    try {
      const status = newFolderPublic ? ArticleCollectionStatusEnum.PUBLIC : ArticleCollectionStatusEnum.PRIVATE;
      const success = await onCreateFolder(newFolderName, newFolderDescription || undefined, status);
      if (success) {
        setNewFolderName('');
        setNewFolderDescription('');
        setNewFolderPublic(true);
      }
    } catch (error) {
      console.error('创建收藏夹失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = (): void => {
    if (!selectedFolderId) {
      message.error('请选择收藏夹').then();
      return;
    }
    onSave(selectedFolderId);
  };

  return (
    <Modal
      title="选择收藏夹"
      open={visible}
      onOk={handleSave}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      width={480}
    >
      <div className="space-y-5">
        {/* 选择现有文件夹 */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700">选择收藏夹</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spin size="small" />
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    selectedFolderId === folder.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <div className="flex items-center">
                    <FolderOutlined className={`mr-3 ${folder.defaultFolder === DefaultStatusEnum.YES ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className="text-gray-800">{folder.name}</span>
                    {folder.status === ArticleCollectionStatusEnum.PRIVATE && (
                      <LockOutlined className="ml-1.5 text-xs text-gray-400" />
                    )}
                    {folder.defaultFolder === DefaultStatusEnum.YES && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">默认</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">{folder.articleCount || 0} 篇</span>
                    {selectedFolderId === folder.id && <CheckOutlined className="text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 创建新收藏夹 */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium mb-3 text-gray-700">创建新收藏夹</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="输入收藏夹名称"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                style={{ flex: 1 }}
                size="middle"
              />
              <Button
                type="primary"
                size="middle"
                onClick={handleCreateFolder}
                loading={isCreating}
                icon={<FolderAddOutlined />}
              >
                创建
              </Button>
            </div>
            <Input.TextArea
              placeholder="收藏夹描述（可选）"
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              rows={2}
            />
            <div className="flex mt-2 items-center justify-start">
              <span className="text-sm text-gray-500 mr-2">公开收藏夹</span>
              <Switch
                size="small"
                checked={newFolderPublic}
                onChange={setNewFolderPublic}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CollectionFolderModal;
