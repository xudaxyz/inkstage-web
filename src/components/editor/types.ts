import { Extension } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import React from 'react';

// 工具栏工具类型
export interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

// 编辑器配置类型
export interface EditorConfig {
  extensions?: Extension[];
  content?: string;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
}

// 编辑器属性类型
export interface RichTextEditorProps {
  content?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  extensions?: Extension[];
  className?: string;
}

// 工具栏属性类型
export interface EditorToolbarProps {
  editor: Editor;
  tools?: Tool[];
  className?: string;
}

// 编辑器扩展类型
export interface EditorExtension {
  name: string;
  extension: Extension;
  tools?: Tool[];
}

// 编辑器状态类型
export interface EditorState {
  content: string;
  isFocused: boolean;
  isLoading: boolean;
  error: string | null;
}
