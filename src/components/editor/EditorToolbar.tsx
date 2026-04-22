import React from 'react';
import { Button, Dropdown } from 'antd';
import { Editor } from '@tiptap/react';

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

interface EditorToolbarProps {
  editor: Editor;
  tools?: Tool[];
  className?: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, tools, className = '' }) => {
  if (!editor) return null;

  return (
    <div className={`border-b border-b-gray-300 p-1 flex flex-wrap bg-gray-50 ${className}`}>
      {tools?.map((tool, index) => {
        const isActive = tool.isActive?.(editor) || false;
        const isDisabled = tool.isDisabled?.(editor) || false;

        if (tool.dropdown) {
          const menuProps = {
            items: tool.dropdown.items.map((item) => ({
              key: item.value,
              label: item.label,
              onClick: (): void => item.action(editor)
            }))
          };

          return (
            <React.Fragment key={tool.id}>
              {index > 0 && <div className="h-6 w-px bg-gray-300 my-auto mx-1"></div>}
              <Dropdown
                menu={menuProps}
                placement="bottom"
                trigger={['click']}
                styles={{
                  root: {
                    maxHeight: '300px',
                    overflow: 'auto'
                  }
                }}
              >
                <Button
                  size="small"
                  type="text"
                  disabled={isDisabled}
                  className={`
                     px-1 py-1 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  title={tool.label}
                >
                  {tool.icon}
                </Button>
              </Dropdown>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={tool.id}>
            {index > 0 && <div className="h-6 w-px bg-gray-300 my-auto mx-1"></div>}
            <Button
              size="small"
              type="text"
              onClick={() => tool.action(editor)}
              disabled={isDisabled}
              className={`
                 px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={tool.label}
            >
              {tool.icon}
            </Button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default EditorToolbar;
