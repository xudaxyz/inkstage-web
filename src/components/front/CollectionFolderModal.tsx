import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Spin, message } from 'antd';
import {
  FolderOutlined,
  FolderAddOutlined,
  CheckOutlined
} from '@ant-design/icons';
import type { CollectionFolder } from '../../hooks/useCollection';

interface CollectionFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (folderId: number) => void;
    folders: CollectionFolder[];
    loading: boolean;
    selectedFolderId: number;
    onSelectFolder: (folderId: number) => void;
    onCreateFolder: (folderName: string) => Promise<boolean>;
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
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewFolderName('');
    }
  }, [visible]);

  const handleCreateFolder = async (): Promise<void> => {
    if (!newFolderName.trim()) {
      message.info('请输入收藏夹名称');
      return;
    }

    setIsCreating(true);
    try {
      const success = await onCreateFolder(newFolderName);
      if (success) {
        setNewFolderName('');
      }
    } catch (error) {
      console.error('创建收藏夹失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = (): void => {
    if (selectedFolderId === 0) {
      message.error('请选择收藏夹');
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
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <div className="flex items-center">
                    <FolderOutlined
                      className={`mr-3 ${folder.defaultFolder ? 'text-blue-500' : 'text-gray-500'}`}
                    />
                    <span className="text-gray-800">{folder.name}</span>
                    {folder.defaultFolder && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                      >
                                                默认
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-3">
                      {folder.articleCount || 0} 篇
                    </span>
                    {selectedFolderId === folder.id && (
                      <CheckOutlined className="text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 创建新收藏夹 */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium mb-3 text-gray-700">创建新收藏夹</h4>
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
        </div>
      </div>
    </Modal>
  );
};

export default CollectionFolderModal;
