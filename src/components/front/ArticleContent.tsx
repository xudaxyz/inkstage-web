import React from 'react';
import { Typography } from 'antd';
import MarkdownIt from 'markdown-it';

// 初始化Markdown渲染器
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

interface ArticleContentProps {
  content: string;
  className?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content, className = '' }) => {
  const renderedContent = md.render(content || '');

  return (
    <div className={`article-content mb-12 ${className}`}>
      <Typography
        className="prose max-w-none"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
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
