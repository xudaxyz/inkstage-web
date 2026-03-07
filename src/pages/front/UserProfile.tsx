import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Button, message, Dropdown, Spin } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    HeartOutlined,
    MessageOutlined,
    MoreOutlined,
    EyeOutlined,
    ManOutlined, WomanOutlined
} from '@ant-design/icons';
import Header from '../../components/common/Header.tsx';
import Footer from '../../components/common/Footer.tsx';
import type { IndexArticleList } from '../../services/articleService.ts';
import articleService from '../../services/articleService.ts';
import { getUserPublicProfile } from '../../services/userService.ts';
import {GenderEnum} from "../../types/enums";
import {formatDateOnly, formatDateTimeShort} from '../../utils/dateUtils';

// 作者信息类型定义
interface AuthorInfo {
  id: number;
  nickname: string;
  avatar: string;
  coverImage: string;
  signature: string;
  gender: GenderEnum;
  location: string;
  joinTime: string;
  articleCount: number;
  readCount: number;
  likeCount: number;
  commentCount: number;
  followerCount: number;
  followingCount: number;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorInfo>({
    id: 0,
    nickname: '',
    avatar: '',
    coverImage: '',
    signature: '',
    gender: GenderEnum.UNKNOWN,
    location: '',
    joinTime: '',
    articleCount: 0,
    readCount: 0,
    likeCount: 0,
    commentCount: 0,
    followerCount: 0,
    followingCount: 0,
    socialLinks: {}
  });
  const [articles, setArticles] = useState<IndexArticleList[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [showFullSignature, setShowFullSignature] = useState(false);

  // 获取作者信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (id) {
        try {
          setLoading(true);
          const userData = await getUserPublicProfile(Number(id));
          
          // 验证userData是否存在
          if (!userData) {
            throw new Error('获取用户数据失败：返回数据为空');
          }
          
          // 转换数据格式
          const formattedAuthor: AuthorInfo = {
            id: userData.id || 0,
            nickname: userData.nickname || '未知用户',
            avatar: userData.avatar || '',
            coverImage: userData.coverImage || '',
            signature: userData.signature || '',
            gender: userData.gender || GenderEnum.UNKNOWN,
            location: userData.location || '',
            joinTime: userData.registerTime ? formatDateOnly(userData.registerTime) : '',
            articleCount: userData.articleCount || 0,
            readCount: 0, // 暂时使用0，后续可以从API获取
            likeCount: userData.likeCount || 0,
            commentCount: userData.commentCount || 0,
            followerCount: userData.followerCount || 0,
            followingCount: userData.followCount || 0,
            socialLinks: {}
          };
          setAuthor(formattedAuthor);
        } catch (error) {
          console.error('获取用户资料失败:', error);
          message.error('获取用户资料失败');
          // 重置为默认值，避免页面显示异常
          setAuthor({
            id: 0,
            nickname: '未知用户',
            avatar: '',
            coverImage: '',
            signature: '',
            gender: GenderEnum.UNKNOWN,
            location: '',
            joinTime: '',
            articleCount: 0,
            readCount: 0,
            likeCount: 0,
            commentCount: 0,
            followerCount: 0,
            followingCount: 0,
            socialLinks: {}
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [id]);

  // 获取用户文章列表
  useEffect(() => {
    const fetchUserArticles = async () => {
      if (id) {
        try {
          setArticlesLoading(true);
          const response = await articleService.getUserArticles(Number(id));
          if (response && response.data && response.data.record) {
            setArticles(response.data.record);
          }
        } catch (error) {
          console.error('获取用户文章列表失败:', error);
          message.error('获取用户文章列表失败');
          setArticles([]);
        } finally {
          setArticlesLoading(false);
        }
      }
    };

    fetchUserArticles();
  }, [id]);

  // 处理关注/取消关注
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    message.success(isFollowing ? '已取消关注' : '关注成功');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容 */}
      <main className="flex-1 py-8 px-[10%]">
        {loading ? (
          <div className="flex justify-center items-center py-20 animate-fade-in-down">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <>
            {/* 封面图片区域 */}
            <div className="relative mb-12 overflow-hidden rounded-2xl shadow-xl">
              <div
                className="h-80 w-full bg-linear-to-r from-blue-500 to-purple-600"
                style={{
                  backgroundImage: author.coverImage ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${author.coverImage})` : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'background-position 0.5s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = 'center 10%';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = 'center';
                }}
              >
                {/* 关注按钮 */}
                <div className="absolute bottom-6 right-6">
                  <Button
                    type={isFollowing ? 'default' : 'primary'}
                    onClick={handleFollow}
                    className={`h-14 px-12 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${isFollowing ? 'bg-white/90 text-gray-800 hover:bg-white shadow-lg' : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'}`}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </Button>
                </div>

                {/* 用户信息叠加在封面图片上 */}
                <div className="absolute bottom-8 left-8 flex flex-col md:flex-row items-start gap-8 w-full max-w-5xl">
                  {/* 头像 */}
                  <div className="shrink-0">
                    <Avatar
                      size={140}
                      src={author.avatar}
                      className="border-4 border-white shadow-xl transform transition-transform duration-300 hover:scale-105"
                    >
                      {author.nickname?.charAt(0) || 'U'}
                    </Avatar>
                  </div>

                  {/* 基本信息 */}
                  <div className="text-white flex-1">
                    {/* 第一行：用户名和性别 */}
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl font-bold tracking-tight">{author.nickname}</h2>
                      <span className="text-sm px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                          {author?.gender === GenderEnum.MALE && (
                              <span><ManOutlined/></span>
                          )}
                          {author?.gender === GenderEnum.FEMALE && (
                              <span><WomanOutlined/></span>
                          )}
                      </span>
                    </div>
                    
                    {/* 第二行：个人简介 */}
                    <div className="mb-4 max-w-[600px]">
                      {author.signature ? (
                        <>
                          <p 
                            className={`text-gray-200 text-lg leading-relaxed transition-all duration-300 ${showFullSignature ? 'line-clamp-none' : 'line-clamp-1'}`}
                          >
                            {author.signature}
                          </p>
                          {author.signature.length > 50 && (
                            <button 
                              onClick={() => setShowFullSignature(!showFullSignature)}
                              className="text-blue-400 text-sm mt-1 hover:text-blue-300 transition-colors"
                            >
                              {showFullSignature ? '收起' : '查看详细资料'}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-200 text-lg leading-relaxed">
                          暂无简介
                        </p>
                      )}
                    </div>
                    
                    {/* 第三行：加入时间 */}
                    <div className="flex items-center gap-2 mb-6 text-sm text-gray-200">
                      <CalendarOutlined size={16} />
                      <span>加入于 {author.joinTime}</span>
                    </div>
                    
                    {/* 第四行：统计数据 - 水平放置 */}
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col items-center group">
                        <div className="font-semibold text-2xl mb-1 group-hover:text-blue-300 transition-colors">{author.articleCount}</div>
                        <div className="text-xs text-gray-200">文章</div>
                      </div>
                      <div className="flex flex-col items-center group">
                        <div className="font-semibold text-2xl mb-1 group-hover:text-blue-300 transition-colors">{author.readCount}</div>
                        <div className="text-xs text-gray-200">阅读</div>
                      </div>
                      <div className="flex flex-col items-center group">
                        <div className="font-semibold text-2xl mb-1 group-hover:text-blue-300 transition-colors">{author.followerCount}</div>
                        <div className="text-xs text-gray-200">粉丝</div>
                      </div>
                      <div className="flex flex-col items-center group">
                        <div className="font-semibold text-2xl mb-1 group-hover:text-blue-300 transition-colors">{author.followingCount}</div>
                        <div className="text-xs text-gray-200">关注</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 文章列表 */}
            <div className="mb-16">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border-0">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">TA的全部文章
                  </h3>
                </div>
                {articlesLoading ? (
                  <div className="py-16 text-center">
                    <Spin size="large" tip="加载文章中..." />
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-100">
                      {articles.map((article) => (
                        <div 
                          key={article.id} 
                          className="px-6 py-6 hover:bg-gray-50 transition-colors duration-300 group"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* 左侧内容 */}
                            <div className="flex-1">
                              {/* 文章标题 */}
                              <h3 className="text-xl font-semibold mb-3 leading-tight">
                                <a 
                                  href={`/article/${article.id}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-800 hover:text-blue-600 transition-colors duration-300 group-hover:translate-x-1"
                                >
                                  {article.title}
                                </a>
                              </h3>
                              
                              {/* 文章简介 */}
                              <p className="text-gray-600 mb-4 line-clamp-2 text-base leading-relaxed">
                                {article.summary || '暂无简介'}
                              </p>
                              
                              {/* 发布时间和互动数据 */}
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                  <span>{article.publishTime ? formatDateTimeShort(article.publishTime) : ''}</span>
                                  <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                                    <HeartOutlined size={16} />
                                    <span>{article.likeCount}</span>
                                  </div>
                                  <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                                    <MessageOutlined size={16} />
                                    <span>{article.commentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                                    <EyeOutlined size={16} />
                                    <span>{article.readCount}</span>
                                  </div>
                                </div>
                                
                                {/* 操作按钮 */}
                                <div className="flex items-center gap-3">
                                  <Dropdown
                                    menu={{
                                      items: [
                                        {
                                          key: 'share',
                                          label: '转发'
                                        },
                                        {
                                          key: 'report',
                                          label: '举报'
                                        }
                                      ]
                                    }}
                                    trigger={['click']}
                                  >
                                    <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 transform hover:scale-110">
                                      <MoreOutlined size={18} />
                                    </button>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                            
                            {/* 右侧封面图 */}
                            {article.coverImage && (
                              <div className="w-full md:w-56 h-36 rounded-lg overflow-hidden shrink-0 shadow-md transform transition-all duration-300 group-hover:scale-105">
                                <a href={`/article/${article.id}`} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 空状态 */}
                    {articles.length === 0 && (
                      <div className="py-16 text-center">
                        <UserOutlined size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500">暂无文章</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* 页脚信息 */}
      <Footer />
    </div>
  );
};

export default UserProfile;