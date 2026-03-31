import React from 'react';
import { Typography } from 'antd';
import MarkdownIt from 'markdown-it';
// 初始化Markdown渲染器
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// 为标题添加ID的插件
md.use((md) => {
  const defaultHeadingOpen =
    md.renderer.rules.heading_open ||
    ((tokens, idx, options, _env, self): string => self.renderToken(tokens, idx, options));

  md.renderer.rules.heading_open = (tokens, idx, options, env, self): string => {
    const token = tokens[idx];
    const headingText = tokens[idx + 1].content;

    // 生成与目录相同的ID
    let id = headingText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    // 确保ID唯一性
    if (env?.existingIds) {
      if (env.existingIds.has(id)) {
        let count = 1;
        while (env.existingIds.has(`${id}-${count}`)) {
          count++;
        }
        id = `${id}-${count}`;
      }
      env.existingIds.add(id);
    }

    // 添加ID属性
    token.attrSet('id', id);
    return defaultHeadingOpen(tokens, idx, options, env, self);
  };
});

// 处理HTML内容，为标题添加ID
const processHtmlContent = (content: string): string => {
  if (!content) return '';

  // 检查内容是否主要是HTML格式
  const isHtml = content.includes('<h') && content.includes('</h');

  if (isHtml) {
    const existingIds = new Set<string>();

    // 为HTML标题添加ID
    return content.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (_match, level, attributes, text) => {
      // 移除HTML标签，获取纯文本
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      // 生成与目录相同的ID
      let id = cleanText
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      // 确保ID唯一性
      if (existingIds.has(id)) {
        let count = 1;
        while (existingIds.has(`${id}-${count}`)) {
          count++;
        }
        id = `${id}-${count}`;
      }
      existingIds.add(id);

      // 检查是否已有ID属性
      if (attributes.includes('id=')) {
        // 替换现有ID
        return `<h${level}${attributes.replace(/id="[^"]*"/, `id="${id}"`)}>${text}</h${level}>`;
      } else {
        // 添加新ID
        return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
      }
    });
  }

  return content;
};

interface ArticleContentProps {
  content: string;
  className?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content, className = '' }) => {
  // 处理HTML内容，为标题添加ID
  const processedContent = processHtmlContent(content || '');
  // 渲染内容
  const renderedContent = md.render(processedContent, { existingIds: new Set() });

  return (
    <div className={`article-content mb-12 ${className}`}>
      <Typography
        className="prose max-w-none"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          lineHeight: 1.75,
          letterSpacing: 0.5,
          fontSize: '16px'
        }}
      >
        <div
          className={`
            prose max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-base
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-em:italic prose-em:text-gray-700
            prose-del:line-through prose-del:text-gray-500
            prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline
            prose-ul:list-disc prose-ul:mb-8 prose-ol:list-decimal prose-ol:mb-8
            prose-img:rounded-xl prose-img:my-10 prose-img:shadow-lg prose-img:max-w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-8 prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-8 prose-pre:shadow-lg prose-pre:font-mono
            prose-table:border prose-table:border-gray-200 prose-table:w-full prose-table:my-8 prose-table:shadow-sm
            prose-hr:border-gray-200 prose-hr:my-8
          `}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </Typography>
    </div>
  );
};

export default ArticleContent;
