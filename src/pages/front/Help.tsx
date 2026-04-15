import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const Help: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string[]>([]);

  const faqs = [
    {
      key: '1',
      title: '如何注册和登录？',
      content: '您可以通过点击页面右上角的"注册"按钮，填写相关信息完成注册。注册后，使用您的邮箱/手机号或密码登录博客。'
    },
    {
      key: '2',
      title: '如何发布文章？',
      content:
        '登录后，点击页面右上角的"写文章"按钮，进入文章编辑器。您可以在编辑器中撰写内容，添加图片等媒体文件，设置文章分类和标签，最后点击"发布"按钮即可。'
    },
    {
      key: '3',
      title: '如何修改个人资料？',
      content:
        '登录后，点击页面右上角的用户头像，选择"个人中心"，然后点击"账号设置"，您可以修改头像、昵称、个人简介等信息。'
    },
    {
      key: '4',
      title: '如何收藏文章？',
      content: '在文章详情页，点击文章左侧的"收藏"按钮，您可以将文章添加到默认收藏夹或创建新的收藏夹。'
    },
    {
      key: '5',
      title: '如何查看阅读历史？',
      content: '登录后，点击页面右上角的用户头像，选择"个人中心"，然后点击"阅读历史"，您可以查看最近阅读过的文章。'
    },
    {
      key: '6',
      title: '如何联系我？',
      content: '您可以通过"联系我"页面的表单提交问题，或者在文章下方留言，我会尽快回复您。'
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
      <main className="flex-1 py-16 px-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">使用指南</h1>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">常见问题</h2>
            <Collapse
              activeKey={activeKey}
              onChange={(key) => setActiveKey(key as string[])}
              className="dark:bg-gray-800"
            >
              {faqs.map((faq) => (
                <Panel
                  header={<span className="text-gray-800 dark:text-white">{faq.title}</span>}
                  key={faq.key}
                  className="dark:bg-gray-800 dark:border-gray-700"
                >
                  <p className="text-gray-600 dark:text-gray-300">{faq.content}</p>
                </Panel>
              ))}
            </Collapse>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">使用指南</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">文章创作</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  我们的富文本编辑器支持多种格式和功能，包括文字格式化、图片插入、代码块、表格等。
                  您可以使用编辑器工具栏上的按钮来调整文本格式，或者直接使用键盘快捷键。
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">社区互动</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  您可以在文章下方发表评论，与我和其他读者交流。您也可以对文章和评论进行点赞，
                  表达您的支持和认可。同时，您可以关注其他创作者，及时获取他们的最新动态。
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">内容管理</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  您可以在"我的创作"中查看和管理您发布的所有文章，包括编辑、删除和统计数据。
                  在"我的收藏"中，您可以查看和管理您收藏的文章，创建自定义收藏夹。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Help;
