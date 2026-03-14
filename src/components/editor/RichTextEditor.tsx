import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
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
    },
    {
      id: 'horizontalRule',
      icon: '—',
      label: '分隔线',
      action: (editor) => editor.chain().focus().setHorizontalRule().run()
    }
  ];

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      }),
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
    <div className={`border-1 border-gray-100 bg-white ${className}`}>
      <EditorToolbar editor={editor} tools={defaultTools} />
      <div className="p-4 min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
