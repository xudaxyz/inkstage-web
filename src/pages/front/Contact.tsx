import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, message } from 'antd';
import { useIsLoggedIn, useUser } from '../../store';
import { GithubOutlined, MailOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const Contact: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  const [formData, setFormData] = useState({
    name: user.nickname || '',
    email: user.email || '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // 这里可以添加表单验证和提交逻辑
    message.success('消息已发送，我会尽快回复您！').then();
    // 重置表单
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
      <main className="flex-1 py-16 px-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">联系我</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              无论您有什么问题、建议或合作意向，都可以通过以下方式与我联系。我会尽快回复您！
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 联系表单 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">发送消息</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoggedIn && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        您的姓名
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="请输入您的姓名"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                      >
                        您的邮箱
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="请输入您的邮箱"
                        className="w-full"
                        required
                      />
                    </div>
                  </>
                )}
                {isLoggedIn && (
                  <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.nickname || ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">{user.nickname?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user.nickname}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    消息
                  </label>
                  <TextArea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="请输入您的留言"
                    rows={5}
                    className="w-full"
                    required
                  />
                </div>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-linear-to-r mt-2 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300"
                >
                  发送内容
                </Button>
              </form>
            </div>

            {/* 联系信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">联系方式</h2>
              <div className="space-y-4">
                <div className="p-2 dark:bg-gray-700 rounded-lg items-center justify-between">
                  <div>
                    <MailOutlined /> <span className="pl-2 text-gray-600 dark:text-gray-300">xudaxyz@163.com</span>
                  </div>
                  <div>
                    <GithubOutlined />
                    <span className="pl-2 text-gray-600 dark:text-gray-300">https://github.com/xudaxyz</span>
                  </div>
                </div>
                <div className="p-2 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-white">其他方式</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">您也可以通过以下方式与我联系：</p>
                  <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                    <li>在文章下方留言评论</li>
                    <li>通过社交媒体私信</li>
                    <li>加入博客交流群</li>
                  </ul>
                </div>
                <div className="p-2 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-white">回复时间</h3>
                  <p className="text-gray-600 dark:text-gray-300">我将在收到消息后的72小时内回复您！</p>
                  <p className="text-gray-600 dark:text-gray-300">感谢您的理解与支持！</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;
