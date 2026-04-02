import React, { useEffect, useState } from 'react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import { Plugin } from 'prosemirror-state';
import { Table } from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Math from '@aarkue/tiptap-math-extension';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Emoji from '@tiptap/extension-emoji';
import { common, createLowlight } from 'lowlight';
import { message, Modal, type UploadFile } from 'antd';
import ImageUploadWithCrop from '../common/ImageUploadWithCrop';
import articleService from '../../services/articleService';
import EditorToolbar from './EditorToolbar';

// 工具栏工具类型
interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

// 编辑器属性类型
interface RichTextEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  extensions?: Extension[];
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onContentChange,
  placeholder = '',
  disabled = false,
  extensions = [],
  className = ''
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  // 创建lowlight实例
  const lowlight = createLowlight(common);

  // 基础工具栏工具
  const defaultTools: Tool[] = [
    // 文本格式
    {
      id: 'bold',
      icon: 'B',
      label: '粗体',
      action: (editor) => editor.chain().focus().toggleBold().run(),
      isActive: (editor) => editor.isActive('bold')
    },
    {
      id: 'italic',
      icon: 'I',
      label: '斜体',
      action: (editor) => editor.chain().focus().toggleItalic().run(),
      isActive: (editor) => editor.isActive('italic')
    },
    {
      id: 'strike',
      icon: 'S',
      label: '删除线',
      action: (editor) => editor.chain().focus().toggleStrike().run(),
      isActive: (editor) => editor.isActive('strike')
    },
    {
      id: 'underline',
      icon: 'U',
      label: '下划线',
      action: (editor) => editor.chain().focus().toggleUnderline().run(),
      isActive: (editor) => editor.isActive('underline')
    },
    {
      id: 'code',
      icon: '</>',
      label: '行内代码',
      action: (editor) => editor.chain().focus().toggleCode().run(),
      isActive: (editor) => editor.isActive('code')
    },
    {
      id: 'emoji',
      icon: '😊',
      label: '表情符号',
      action: (editor) => editor.chain().focus().insertContent('😊').run()
    },

    // 段落格式
    {
      id: 'heading1',
      icon: 'H1',
      label: '标题 1',
      action: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 1 })
    },
    {
      id: 'heading2',
      icon: 'H2',
      label: '标题 2',
      action: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 2 })
    },
    {
      id: 'heading3',
      icon: 'H3',
      label: '标题 3',
      action: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 3 })
    },
    {
      id: 'heading4',
      icon: 'H4',
      label: '标题 4',
      action: (editor) => editor.chain().focus().setHeading({ level: 4 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 4 })
    },
    {
      id: 'heading5',
      icon: 'H5',
      label: '标题 5',
      action: (editor) => editor.chain().focus().setHeading({ level: 5 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 5 })
    },
    {
      id: 'paragraph',
      icon: 'P',
      label: '段落',
      action: (editor) => editor.chain().focus().setParagraph().run(),
      isActive: (editor) => editor.isActive('paragraph')
    },

    // 列表
    {
      id: 'bulletList',
      icon: '•',
      label: '无序列表',
      action: (editor) => editor.chain().focus().toggleBulletList().run(),
      isActive: (editor) => editor.isActive('bulletList')
    },
    {
      id: 'orderedList',
      icon: '1.',
      label: '有序列表',
      action: (editor) => editor.chain().focus().toggleOrderedList().run(),
      isActive: (editor) => editor.isActive('orderedList')
    },

    // 表格
    {
      id: 'table',
      icon: '⊞',
      label: '表格',
      action: (editor) => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()
    },

    // 数学公式
    {
      id: 'math',
      icon: '∑',
      label: '数学公式',
      action: (editor) => editor.chain().focus().insertContent('$E=mc^2$').run()
    },

    // 其他
    {
      id: 'codeBlock',
      icon: '{ }',
      label: '代码块',
      action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      isActive: (editor) => editor.isActive('codeBlock')
    },
    {
      id: 'blockquote',
      icon: '"',
      label: '引用',
      action: (editor) => editor.chain().focus().toggleBlockquote().run(),
      isActive: (editor) => editor.isActive('blockquote')
    }, // 其他
    {
      id: 'horizontalRule',
      icon: '—',
      label: '分隔线',
      action: (editor) => editor.chain().focus().setHorizontalRule().run()
    },
    // 图片上传
    {
      id: 'image',
      icon: '🖼️',
      label: '插入图片',
      action: () => setShowImageUploadModal(true)
    }
  ];

  // 处理图片上传
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const uploadResult = await articleService.uploadArticleImage(file);
      if (uploadResult.code === 200) {
        return uploadResult.data;
      } else {
        message.error('图片上传失败，请删除后重新上传');
        return '';
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  };

  // 处理图片删除
  const handleImageDelete = async (fileUrl: string): Promise<void> => {
    try {
      await articleService.deleteImage(fileUrl);
    } catch (error) {
      console.error('删除图片失败:', error);
    }
  };

  // 处理取消上传
  const handleCancelUpload = (): void => {
    setShowImageUploadModal(false);
  };

  const PasteMarkdownExtension = Extension.create({
    name: 'pasteMarkdown',
    addProseMirrorPlugins: function () {
      return [
        new Plugin({
          props: {
            handlePaste: (view, event): boolean => {
              const text = event.clipboardData?.getData('text/plain');
              if (!text) return false;

              // 检测是否包含 Markdown 语法
              const isMarkdown = /^#{1,6}\s|^\*|^-|^\d+\.|^>|`{3}|\*\*|\[.*]\(.*\)/m.test(text);
              if (!isMarkdown) return false;

              try {
                // 使用 this.editor 访问编辑器实例
                const json = this.editor.storage.markdown.manager.parse(text);
                const node = this.editor.schema.nodeFromJSON(json);
                view.dispatch(view.state.tr.replaceSelectionWith(node));
                event.preventDefault();
                return true;
              } catch {
                return false;
              }
            }
          }
        })
      ];
    }
  });

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      }),
      Markdown,
      Table.configure({
        resizable: true
      }),
      TableHeader,
      TableRow,
      TableCell,
      Image,
      Math,
      CodeBlockLowlight.configure({
        lowlight
      }),
      Emoji,
      PasteMarkdownExtension,
      ...extensions
    ],
    content: editorContent,
    editable: !disabled,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setEditorContent(newContent);
      onContentChange?.(newContent);
    }
  });

  // 当外部 content 变化时更新编辑器内容
  useEffect(() => {
    if (content !== editorContent && editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor, editorContent]);

  return (
    <div className={`border border-gray-100 bg-white ${className}`}>
      <EditorToolbar editor={editor} tools={defaultTools} />
      <div className="p-4 min-h-[500px]">
        <EditorContent editor={editor} />
      </div>

      {/* 图片上传模态框 */}
      <Modal title="上传图片" open={showImageUploadModal} onCancel={handleCancelUpload} okText="完成" cancelText="取消">
        <ImageUploadWithCrop
          uploadMode="immediate"
          customRequest={async (options) => {
            const { file, onSuccess, onError } = options;
            try {
              const imageUrl = await handleImageUpload(file as File);
              onSuccess?.({ data: imageUrl });
              // 插入图片到编辑器
              if (editor) {
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: 'image/jpeg',
                    attrs: {
                      src: imageUrl,
                      alt: '',
                      title: ''
                    }
                  })
                  .run();
              }
              message.success('图片上传成功');
            } catch {
              onError?.(new Error('图片上传失败'));
              message.error('图片上传失败，请重试');
            }
          }}
          onUploadSuccess={() => {}}
          onRemove={async (file: UploadFile) => {
            if (file.response?.data) {
              await handleImageDelete(file.response.data);
            }
          }}
          cropShape="rect"
          aspectRatio={4 / 3}
          placeholder="点击上传图片"
        />
      </Modal>
    </div>
  );
};

export default RichTextEditor;
