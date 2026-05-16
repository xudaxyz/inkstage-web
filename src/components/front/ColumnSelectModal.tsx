import React, { useCallback, useEffect, useState } from 'react';
import { Button, message, Modal, Spin } from 'antd';
import { CheckOutlined, FolderOutlined, SwapOutlined } from '@ant-design/icons';
import columnService from '../../services/columnService';
import type { ArticleColumn } from '../../types/column';

interface ColumnSelectModalProps {
  visible: boolean;
  articleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ColumnSelectModal: React.FC<ColumnSelectModalProps> = ({
  visible,
  articleId,
  onClose,
  onSuccess
}) => {
  const [columns, setColumns] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [articleColumn, setArticleColumn] = useState<ArticleColumn | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [operating, setOperating] = useState(false);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [columnsRes, articleColumnRes] = await Promise.all([
        columnService.getMyColumnOptions(),
        columnService.getArticleColumn(articleId)
      ]);
      if (columnsRes.code === 200) {
        setColumns(columnsRes.data || []);
      }
      if (articleColumnRes.code === 200 && articleColumnRes.data) {
        setArticleColumn(articleColumnRes.data);
        setSelectedColumnId(articleColumnRes.data.columnId);
      } else {
        setArticleColumn(null);
        setSelectedColumnId('');
      }
    } catch {
      message.error('加载专栏信息失败');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (visible && articleId) {
      void loadData();
    }
  }, [visible, articleId, loadData]);

  const handleAddToColumn = async (): Promise<void> => {
    if (!selectedColumnId) {
      message.info('请选择一个专栏');
      return;
    }
    setOperating(true);
    try {
      const response = await columnService.addArticleToColumn({
        columnId: selectedColumnId,
        articleId
      });
      if (response.code === 200) {
        message.success('文章已加入专栏');
        onSuccess();
        onClose();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setOperating(false);
    }
  };

  const handleRemoveFromColumn = async (): Promise<void> => {
    if (!articleColumn) return;
    setOperating(true);
    try {
      const response = await columnService.removeArticleFromColumn(
        articleColumn.columnId,
        articleId
      );
      if (response.code === 200) {
        message.success('文章已移出专栏');
        onSuccess();
        onClose();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setOperating(false);
    }
  };

  const handleMoveToColumn = async (): Promise<void> => {
    if (!selectedColumnId) {
      message.info('请选择目标专栏');
      return;
    }
    if (articleColumn && selectedColumnId === articleColumn.columnId) {
      message.info('文章已在该专栏中');
      return;
    }
    setOperating(true);
    try {
      const response = await columnService.moveArticleToColumn(
        articleId,
        selectedColumnId
      );
      if (response.code === 200) {
        message.success('文章已移动到目标专栏');
        onSuccess();
        onClose();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch {
      message.error('操作失败，请重试');
    } finally {
      setOperating(false);
    }
  };

  const renderFooter = (): React.ReactNode => {
    if (articleColumn) {
      return (
        <div className="flex justify-between">
          <Button danger onClick={handleRemoveFromColumn} loading={operating}>
            移出专栏
          </Button>
          <div className="flex gap-2">
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              onClick={handleMoveToColumn}
              loading={operating}
              disabled={!selectedColumnId || selectedColumnId === articleColumn.columnId}
              icon={<SwapOutlined />}
            >
              移动到此专栏
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>取消</Button>
        <Button
          type="primary"
          onClick={handleAddToColumn}
          loading={operating}
          disabled={!selectedColumnId}
        >
          加入专栏
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={articleColumn ? '移动到其他专栏' : '加入专栏'}
      open={visible}
      onCancel={onClose}
      footer={renderFooter()}
      width={480}
      destroyOnHidden={true}
    >
      <div className="space-y-4">
        {articleColumn && (
          <div className="px-3 py-2 bg-cyan-50 dark:bg-gray-700 rounded-lg text-sm text-cyan-700 dark:text-cyan-300">
            当前专栏：<span className="font-medium">{columns.find(c => c.id === articleColumn.columnId)?.name || '未知专栏'}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : columns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无专栏，请先创建专栏
          </div>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {columns.map((column) => (
              <div
                key={column.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  selectedColumnId === column.id
                    ? 'bg-cyan-50 border border-cyan-200 dark:bg-gray-700 dark:border-cyan-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedColumnId(column.id)}
              >
                <div className="flex items-center">
                  <FolderOutlined className={`mr-3 ${selectedColumnId === column.id ? 'text-cyan-500' : 'text-gray-500'}`} />
                  <span className="text-gray-800 dark:text-gray-200">{column.name}</span>
                  {articleColumn && column.id === articleColumn.columnId && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 rounded-full">
                      当前
                    </span>
                  )}
                </div>
                {selectedColumnId === column.id && (
                  <CheckOutlined className="text-cyan-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ColumnSelectModal;
