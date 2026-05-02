import React, { useEffect, useState } from 'react';
import type { UploadFile } from 'antd';
import { Button, Card, Form, Input, message, Select, Switch } from 'antd';
import { Helmet } from 'react-helmet-async';
import { MoonOutlined, SaveOutlined, SendOutlined, SunOutlined, SwapLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import tagService from '../../services/tagService';
import type { FrontTag } from '../../types/tag';
import { useAppStore, useTheme, useUserStore } from '../../store';
import { StatusEnum } from '../../types/enums';
import ColumnCoverUploader from '../../components/upload/ColumnCoverUploader';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;

const CreateColumn: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const { toggleTheme } = useAppStore();
  const [form] = Form.useForm();
  const [availableTags, setAvailableTags] = useState<{ value: string; label: string }[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [, setFileList] = useState<UploadFile[]>([]);
  const [serverCoverImageUrl, setServerCoverImageUrl] = useState<string>('');
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { columnId } = useParams<{ columnId: string }>();
  const isEditMode = !!columnId;

  // 切换主题模式
  const handleThemeToggle = (): void => {
    toggleTheme();
  };

  // 加载标签数据
  useEffect(() => {
    const loadTags = async (): Promise<void> => {
      try {
        setLoading(true);
        setError('');
        const tagRes = await tagService.getActiveTags();
        if (tagRes.code != 200) {
          message.error(tagRes.message || '获取标签列表失败');
        }
        const formattedTags = tagRes.data.map((tag) => ({
          value: tag.id?.toString() || '',
          label: tag.name
        }));
        setAvailableTags(formattedTags);

        // 如果是编辑模式，加载专栏详情
        if (isEditMode && columnId) {
          await loadColumnDetail(columnId);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    // 加载专栏详情（模拟数据）
    const loadColumnDetail = async (id: string): Promise<void> => {
      try {
        // 这里应该调用专栏服务获取详情
        // 先使用模拟数据演示
        const mockColumn = {
          id: parseInt(id),
          name: 'React源码解析',
          description: '深入解析React源码，带你理解React的核心原理',
          coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640',
          tags: ['React', '源码'],
          author: {
            id: 1,
            nickname: '前端极客',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64'
          },
          articleCount: 12,
          subscriberCount: 580,
          createdAt: '2024-01-15',
          updatedAt: '2024-03-20'
        };

        // 填充表单数据
        form.setFieldsValue({
          name: mockColumn.name,
          description: mockColumn.description,
          tags: mockColumn.tags
        });

        // 设置封面图
        if (mockColumn.coverImage) {
          setCoverImage(mockColumn.coverImage);
          setServerCoverImageUrl(mockColumn.coverImage);
          setFileList([
            {
              uid: Date.now().toString(),
              name: 'cover-image.jpg',
              status: 'done',
              url: mockColumn.coverImage
            }
          ]);
        }
      } catch (err) {
        console.error('获取专栏详情失败:', err);
        message.error('获取专栏详情失败，请重试');
      }
    };
    void loadTags();
  }, [isEditMode, columnId, form]);

  // 处理标签选择
  const handleTagChange = (values: string[]): void => {
    // 标签值处理
    console.log(values);
  };

  // 处理表单提交
  const handleSubmit = async (values: { name: string; description: string; tags: string[] }): Promise<void> => {
    setIsSubmitting(true);
    try {
      // 构建标签数组
      const tags: FrontTag[] = [];
      if (values.tags) {
        for (const tagValue of values.tags) {
          if (!isNaN(Number(tagValue))) {
            const tagId = parseInt(tagValue);
            const tag = availableTags.find((t) => t.value === tagValue.toString());
            if (tag) {
              tags.push({
                id: tagId,
                name: tag.label,
                slug: '',
                description: '',
                status: StatusEnum.ENABLED
              });
            }
          } else {
            tags.push({
              id: 0,
              name: tagValue,
              slug: '',
              description: '',
              status: StatusEnum.ENABLED
            });
          }
        }
      }

      // 处理封面图
      let coverImageUrl = serverCoverImageUrl;
      if (croppedFile) {
        // 这里应该调用专栏服务上传封面图
        coverImageUrl = coverImage;
      }

      // 准备专栏数据
      const columnData = {
        name: values.name,
        description: values.description,
        tags: tags,
        coverImage: coverImageUrl || coverImage,
        articleCount: 0,
        subscriberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log(columnData);

      if (isEditMode && columnId) {
        message.success('专栏更新成功！');
      } else {
        message.success('专栏创建成功！');
      }

      navigate(ROUTES.COLUMN_LIST);
    } catch (error) {
      console.error('提交专栏失败:', error);
      message.error(isEditMode ? '更新失败，请重试' : '创建失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理保存草稿
  const handleSaveDraft = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      await form.validateFields();
      message.success('草稿保存成功！');
    } catch (error) {
      console.error('保存草稿失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? '编辑专栏 - InkStage' : '创建专栏 - InkStage'}</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-800">
        {/* 顶部导航栏 */}
        <header className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b dark:border-b border-gray-200 dark:border-gray-700 flex items-center px-3 md:px-[5%] sticky top-0 z-30 shadow-sm shrink-0">
          {/* 左侧：Logo和标题 */}
          <div className="flex items-center">
            <span
              className="text-lg md:text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => navigate(ROUTES.HOME)}
            >
              InkStage
            </span>
            <span className="mx-1 md:mx-2 items-center text-sm md:text-base text-gray-400 hidden sm:block">\</span>
            <span className="text-sm md:text-base items-center font-medium text-gray-800 dark:text-gray-300 hidden sm:block">
              {isEditMode ? '编辑专栏' : '创建专栏'}
            </span>
          </div>

          {/* 右侧：操作按钮和用户信息 */}
          <div className="flex items-center gap-2 md:gap-5 ml-auto">
            {/* 主题切换按钮 */}
            <div className="flex items-center gap-2">
              {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
              <Switch checked={isDarkMode} onChange={handleThemeToggle} size="small" className="hidden sm:block" />
            </div>
            {/* 操作按钮 - 移动端使用图标按钮 */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                icon={<SwapLeftOutlined />}
                onClick={() => navigate(ROUTES.COLUMN_LIST)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                size="middle"
              >
                <span className="hidden md:inline">返回专栏</span>
              </Button>
              <Button
                color="cyan"
                variant="solid"
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={isSubmitting}
                className="hover:bg-blue-600"
                size="middle"
              >
                <span className="hidden md:inline">保存草稿</span>
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => form.submit()}
                loading={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
                size="middle"
              >
                <span className="hidden md:inline">创建专栏</span>
              </Button>
            </div>

            {/* 用户信息 */}
            {user && (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nickname || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs md:text-sm font-medium">{user.nickname?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="text-purple-600 font-medium text-sm hidden lg:inline-block truncate max-w-25">
                  {user.nickname}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="flex-1 px-[5%] bg-white dark:bg-gray-800">
          <Card
            variant="borderless"
            style={{
              backgroundColor: `${isDarkMode ? '#364153' : 'transparent'}`
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* 专栏名称 */}
              <div className="mb-6">
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: '专栏名称不能为空' },
                    {
                      max: 100,
                      message: '专栏名称不能超过100字'
                    }
                  ]}
                >
                  <Input
                    placeholder="请输入专栏名称..."
                    className="placeholder:text-gray-400/70"
                    maxLength={100}
                    showCount
                    size="large"
                    variant="underlined"
                    style={{
                      fontSize: '28px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontFamily: 'sans-serif'
                    }}
                  />
                </Form.Item>
              </div>

              {/* 错误信息显示 */}
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}

              {/* 专栏简介 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专栏简介</label>
                <Form.Item name="description" rules={[{ required: true, message: '请输入专栏简介' }]} noStyle>
                  <Input.TextArea
                    placeholder="请介绍一下你的专栏..."
                    rows={3}
                    maxLength={300}
                    showCount
                    className="resize-none"
                  />
                </Form.Item>
                <div className="text-xs text-gray-500 mt-1">简洁有力的简介能吸引更多读者关注</div>
              </div>

              {/* 专栏标签 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专栏标签</label>
                <Form.Item name="tags" noStyle>
                  <Select
                    mode="tags"
                    placeholder="请选择标签，或输入新标签名称"
                    style={{ width: '100%' }}
                    onChange={handleTagChange}
                    maxTagCount={5}
                    loading={loading}
                    tokenSeparators={[',', ' ']}
                  >
                    {availableTags.map((tag) => (
                      <Option key={tag.value} value={tag.value}>
                        {tag.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <div className="text-xs text-gray-500 mt-1">建议选择3-5个标签，帮助读者找到你的专栏</div>
              </div>

              {/* 专栏封面 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专栏封面</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-48">
                    <Form.Item valuePropName="coverImage">
                      <ColumnCoverUploader
                        currentCover={coverImage}
                        onCropComplete={({ file, previewUrl }) => {
                          setCroppedFile(file);
                          setCoverImage(previewUrl);
                          setFileList([
                            {
                              uid: Date.now().toString(),
                              name: 'cover-image.jpg',
                              status: 'done',
                              url: previewUrl
                            }
                          ]);
                        }}
                        onRemove={() => {
                          setCroppedFile(null);
                          setCoverImage('');
                          setServerCoverImageUrl('');
                          setFileList([]);
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="flex-1">
                    {coverImage && (
                      <img
                        src={coverImage}
                        alt="预览"
                        className="w-full max-w-md aspect-video object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateColumn;
