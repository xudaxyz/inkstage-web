import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
      <main className="flex-1 py-16 px-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">关于我</h1>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              欢迎来到DaXu的个人博客！一个热爱技术、喜欢分享的开发者。 这个博客是我记录生活、分享知识和交流想法的地方。
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">我创建这个平台的初衷是：</p>
            <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300 space-y-2">
              <li>记录我的学习心得和技术探索</li>
              <li>分享我对生活、工作和技术的思考</li>
              <li>与志同道合的朋友交流和学习</li>
              <li>创建一个属于自己的数字空间</li>
            </ul>
          </div>

          <div className="dark:bg-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">博客内容</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">在这里，你可以找到以下类型的内容：</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">技术分享</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  包括编程技巧、框架使用、开发经验等技术相关内容。
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">生活感悟</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">记录生活中的点滴，分享个人成长和感悟。</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">读书笔记</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">分享我阅读的书籍和从中获得的启发。</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">项目经验</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">分享我参与的项目和从中学习到的经验。</p>
              </div>
            </div>
          </div>

          <div className="dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">欢迎参与</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              这个博客不仅是我的个人空间，也是一个开放的社区。我欢迎大家：
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>注册账号，成为社区的一员</li>
              <li>阅读和评论文章，分享你的观点</li>
              <li>发布自己的文章，与大家交流</li>
              <li>提出建议，帮助我改进这个平台</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              感谢你的访问和支持！希望在这里能找到对你有用的内容，也期待听到你的声音。
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
