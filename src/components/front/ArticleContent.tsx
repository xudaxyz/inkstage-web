import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import MarkdownIt from 'markdown-it';
import { codeToHtml } from 'shiki';
// 初始化Markdown渲染器
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});
// 启用表格插件
md.enable(['table']);
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
// 处理HTML内容，为标题添加ID和表格添加边框样式
const processHtmlContent = (content: string): string => {
  if (!content) return '';
  let processedContent = content;
  // 为HTML标题添加ID
  const existingIds = new Set<string>();
  processedContent = processedContent.replace(
    /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi,
    (_match, level, attributes, text) => {
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
    }
  );
  // 为表格添加边框样式
  processedContent = processedContent
    .replace(
      /<table([^>]*)>/gi,
      '<table$1 class="border border-collapse border-gray-200 dark:border-gray-700 w-full my-6 shadow-sm">'
    )
    .replace(/<th([^>]*)>/gi, '<th$1 class="border border-gray-200 dark:border-gray-700 p-3">')
    .replace(/<td([^>]*)>/gi, '<td$1 class="border border-gray-200 dark:border-gray-700 p-3">');
  return processedContent;
};

interface ArticleContentProps {
  content: string;
  className?: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content, className = '' }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const renderContent = async (): Promise<void> => {
      try {
        setLoading(true);
        // 处理HTML内容，为标题添加ID
        const processedContent = processHtmlContent(content || '');
        // 渲染Markdown
        const mdContent = md.render(processedContent, { existingIds: new Set() });
        // 匹配代码块
        const codeBlockRegex = /<pre><code(?: class="language-(\w+)")?>(.*?)<\/code><\/pre>/gs;
        const codeBlocks = [];
        let match;
        // 收集所有代码块
        while ((match = codeBlockRegex.exec(mdContent)) !== null) {
          // 清理代码内容，移除可能的嵌套HTML标签
          const codeContent = match[2]
            .replace(/<pre><code[^>]*>/g, '')
            .replace(/<\/code><\/pre>/g, '')
            .replace(/<p><\/p>/g, '');
          codeBlocks.push({
            fullMatch: match[0],
            lang: match[1],
            code: codeContent
          });
        }
        // 处理所有代码块
        if (codeBlocks.length > 0) {
          const processedBlocks = await Promise.all(
            codeBlocks.map(async (block) => {
              try {
                // 解码HTML实体
                let decodedCode = block.code
                  .replace(/<[^>]*>/g, '')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .replace(/&nbsp;/g, ' ');
                // 再次解码，确保处理双重转义
                decodedCode = decodedCode.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                // 清理可能的剩余HTML标签和实体
                decodedCode = decodedCode
                  .replace(/<pre[^>]*>/gi, '')
                  .replace(/<\/pre>/gi, '')
                  .replace(/<code[^>]*>/gi, '')
                  .replace(/<\/code>/gi, '')
                  .replace(/<p[^>]*>/gi, '')
                  .replace(/<\/p>/gi, '')
                  .trim();
                // 使用shiki生成高亮HTML
                const highlightedHtml = await codeToHtml(decodedCode, {
                  lang: block.lang || 'text',
                  theme: 'github-dark' // 使用黑色主题
                });
                return {
                  original: block.fullMatch,
                  replacement: highlightedHtml
                };
              } catch {
                return {
                  original: block.fullMatch,
                  replacement: block.fullMatch
                };
              }
            })
          );
          // 替换所有代码块
          let finalContent = mdContent;
          processedBlocks.forEach((block) => {
            finalContent = finalContent.replace(block.original, block.replacement);
          });
          setRenderedContent(finalContent);
        } else {
          setRenderedContent(mdContent);
        }
      } catch (error) {
        console.error('渲染内容失败:', error);
        setRenderedContent(md.render(content || '', { existingIds: new Set() }));
      } finally {
        setLoading(false);
      }
    };
    renderContent().then();
  }, [content]);
  if (loading) {
    return (
      <div className={`article-content mb-12 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  return (
    <div className={`article-content mb-12 ${className}`}>
      <Typography
        className="prose max-w-none"
        style={{
          lineHeight: 1.65,
          letterSpacing: 0.5,
          fontSize: '16px'
        }}
      >
        <div
          className="prose max-w-none mx-auto prose-headings:text-gray-800 prose-headings:font-bold
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs
            prose-h1:mb-6 prose-h2:mb-5 prose-h3:mb-4 prose-h4:mb-3
            prose-h1:mt-10 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-5
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
            prose-strong:text-gray-800 prose-strong:font-bold
            prose-em:italic prose-em:text-gray-700
            prose-del:line-through prose-del:text-gray-500
            prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline
            prose-ul:list-disc prose-ul:mb-6 prose-ul:pl-5
            prose-ol:list-decimal prose-ol:mb-6 prose-ol:pl-5
            prose-li:mb-2
            prose-img:rounded-lg prose-img:my-8 prose-img:shadow-md prose-img:max-w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-6 prose-blockquote:text-gray-600
            prose-code:bg-idea-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-idea-text prose-code:font-mono
            prose-table:border prose-table:border-collapse prose-table:border-gray-200 prose-th:border prose-th:border-gray-200 prose-td:border prose-td:border-gray-200 prose-table:w-full prose-table:my-6 prose-table:shadow-sm
            prose-hr:border-gray-200 prose-hr:my-8
            dark:prose-invert dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300
            dark:prose-strong:text-gray-100 dark:prose-em:text-gray-300
            dark:prose-blockquote:text-gray-400 dark:prose-code:bg-idea-bg dark:prose-code:text-idea-text
            dark:prose-table:border-gray-700 dark:prose-th:border-gray-700 dark:prose-td:border-gray-700
            dark:prose-hr:border-gray-700
            "
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </Typography>
    </div>
  );
};
export default ArticleContent;
