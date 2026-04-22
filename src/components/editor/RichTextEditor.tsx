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
import { message, Modal, Form, InputNumber, Button } from 'antd';
import EditorImageUploader from '../upload/EditorImageUploader';
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
  dropdown?: {
    items: {
      label: string;
      value: string;
      action: (editor: Editor) => void;
    }[];
  };
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
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableForm] = Form.useForm();
  // 创建lowlight实例
  const lowlight = createLowlight(common);

  // 支持的语言列表
  const supportedLanguages = [
    { value: 'plaintext', label: '纯文本' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' }
  ];

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
      id: 'heading6',
      icon: 'H6',
      label: '标题 6',
      action: (editor) => editor.chain().focus().setHeading({ level: 6 }).run(),
      isActive: (editor) => editor.isActive('heading', { level: 6 })
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
      action: () => setShowTableModal(true)
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
      isActive: (editor) => editor.isActive('codeBlock'),
      dropdown: {
        items: supportedLanguages.map((lang) => ({
          label: lang.label,
          value: lang.value,
          action: (editor) => editor.chain().focus().setCodeBlock({ language: lang.value }).run()
        }))
      }
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
  // 处理取消上传
  const handleCancelUpload = (): void => {
    setShowImageUploadModal(false);
  };
  // 处理表格设置
  const handleTableSettings = (values: { rows: number; cols: number; withHeaderRow: boolean }): void => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({
          rows: values.rows,
          cols: values.cols,
          withHeaderRow: values.withHeaderRow
        })
        .run();
    }
    setShowTableModal(false);
  };
  // 处理取消表格设置
  const handleCancelTableSettings = (): void => {
    setShowTableModal(false);
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
    <div className={`border border-gray-200 bg-white ${className}`}>
      <style>
        {`
          .editor-content img {
            max-width: 100%;
            height: auto;
            max-height: 600px;
            object-fit: contain;
          }
        `}
      </style>
      <EditorToolbar editor={editor} tools={defaultTools} className="sticky top-16 z-20" />
      <div className="p-4 min-h-87.5 max-w-full">
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 图片上传模态框 */}
      <Modal title="上传图片" open={showImageUploadModal} onCancel={handleCancelUpload} okText="完成" cancelText="取消">
        <EditorImageUploader
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
                    type: 'image',
                    attrs: {
                      src: imageUrl,
                      alt: '',
                      title: ''
                    }
                  })
                  .run();
              }
              // 关闭上传模态框
              setShowImageUploadModal(false);
              message.success('图片上传成功');
            } catch {
              onError?.(new Error('图片上传失败'));
              message.error('图片上传失败，请重试');
            }
          }}
          onUploadSuccess={() => {}}
        />
      </Modal>

      {/* 表格设置模态框 */}
      <Modal title="插入表格" open={showTableModal} onCancel={handleCancelTableSettings} footer={null} width={400}>
        <Form
          form={tableForm}
          layout="horizontal"
          onFinish={handleTableSettings}
          initialValues={{ rows: 4, cols: 4, withHeaderRow: true }}
        >
          <div className="flex items-center gap-4">
            <Form.Item name="rows" label="行数" rules={[{ required: true, message: '请输入行数' }]} className="flex-1">
              <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="1-10" />
            </Form.Item>
            <Form.Item name="cols" label="列数" rules={[{ required: true, message: '请输入列数' }]} className="flex-1">
              <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="1-10" />
            </Form.Item>
          </div>
          <Form.Item name="withHeaderRow" label="包含表头" valuePropName="checked" className="mb-2">
            <input type="checkbox" defaultChecked />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              插入表格
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default RichTextEditor;
