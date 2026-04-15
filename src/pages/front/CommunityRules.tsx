import React from 'react';
import { motion } from 'framer-motion';

const CommunityRules: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
      <main className="flex-1 py-16 px-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">社区规范</h1>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">社区公约</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              欢迎来到 DaXu 的个人博客！为了营造一个友好、积极、有价值的社区环境， 请大家遵守以下规范：
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">尊重友善</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  尊重其他用户的观点和意见，使用友善、文明的语言交流。 不进行人身攻击、恶意揣测或散布谣言。
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">遵守法律法规</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  遵守国家法律法规和社区规则，不发布违法违规内容，
                  不从事任何危害国家安全、社会稳定或侵犯他人合法权益的行为。
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">真诚分享</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  分享真实、有价值的内容，不发布虚假信息、误导性内容或未经证实的消息。
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">保护隐私</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  尊重他人隐私，不公开或传播他人的个人信息， 不进行人肉搜索或其他侵犯隐私的行为。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">内容发布指南</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">鼓励原创</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  鼓励发布原创内容，尊重知识产权。引用他人内容时，应注明出处。 禁止抄袭、剽窃他人作品。
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">内容质量</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  发布内容应具有一定的思想性、艺术性或实用性，避免发布低质量、重复或无意义的内容。
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">禁止内容</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">禁止发布以下内容：</p>
                <ul className="list-disc pl-6 mt-2 text-gray-600 dark:text-gray-300 text-sm space-y-1">
                  <li>违法违规内容</li>
                  <li>色情、暴力、血腥内容</li>
                  <li>歧视性内容</li>
                  <li>垃圾广告、营销推广内容</li>
                  <li>恶意攻击、诽谤他人的内容</li>
                  <li>侵犯他人知识产权的内容</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">违规处理</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              对于违反社区规范的行为，我将根据情节轻重采取以下措施：
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>提醒：对于轻微违规行为，我会给予善意提醒</li>
              <li>内容删除：对于违规内容，我将予以删除</li>
              <li>账号限制：对于严重违规行为，我将限制账号功能</li>
              <li>账号封禁：对于多次违规或严重违法违规行为，我将封禁账号</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">我欢迎大家举报违规内容，共同维护良好的社区环境。</p>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              让我们一起努力，把这里打造成一个积极、健康、有价值的交流平台！
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CommunityRules;
