import React, { useEffect, useState } from 'react';
import type { UploadFile } from 'antd';
import { Button, Card, Form, Input, message, Modal, Radio, Select, Switch } from 'antd';
import { Helmet } from 'react-helmet-async';
import {
  EyeOutlined,
  MoonOutlined,
  SaveOutlined,
  SendOutlined,
  SunOutlined,
  SwapLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import articleService from '../../services/articleService';
import tagService from '../../services/tagService';
import { type FrontTag } from '../../types/tag';
import categoryService from '../../services/categoryService';
import { useAppStore, useTheme, useUserStore } from '../../store';
import {
  AllowStatusEnum,
  AllowTopEnum,
  ArticleOriginalEnum,
  ArticleReviewStatusEnum,
  ArticleStatusEnum,
  ArticleVisibleEnum,
  StatusEnum
} from '../../types/enums';
import RichTextEditor from '../../components/editor/RichTextEditor';
import './CreateArticle.css';
import Footer from '../../components/common/Footer.tsx';
import ArticleCoverUploader from '../../components/upload/ArticleCoverUploader';

const { Option } = Select;
const CreateArticle: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const { toggleTheme } = useAppStore();
  const [form] = Form.useForm();
  const [, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<{ value: string; label: string }[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [, setFileList] = useState<UploadFile[]>([]);
  const [serverCoverImageUrl, setServerCoverImageUrl] = useState<string>('');
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewCover, setPreviewCover] = useState('');
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { articleId } = useParams<{ articleId: string }>();
  const isEditMode = !!articleId;
  // 切换主题模式
  const handleThemeToggle = (): void => {
    toggleTheme();
  };
  // 加载分类和标签数据
  useEffect(() => {
    const loadCategoriesAndTags = async (): Promise<void> => {
      try {
        setLoading(true);
        setError('');
        // 并行加载分类和标签数据
        const [categoryRes, tagRes] = await Promise.all([
          categoryService.getActiveCategories(),
          tagService.getActiveTags()
        ]);
        if (categoryRes.code != 200) {
          message.error(categoryRes.message || '获取分类列表失败');
        }
        if (tagRes.code != 200) {
          message.error(tagRes.message || '获取标签列表失败');
        }
        // 转换分类数据格式
        const formattedCategories = categoryRes.data.map((category) => ({
          value: category.id.toString(),
          label: category.name
        }));
        // 转换标签数据格式
        const formattedTags = tagRes.data.map((tag) => ({
          value: tag.id?.toString() || '',
          label: tag.name
        }));
        setCategories(formattedCategories);
        setAvailableTags(formattedTags);
        // 如果是编辑模式，加载文章详情
        if (isEditMode && articleId) {
          await loadArticleDetail(articleId);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    // 加载文章详情
    const loadArticleDetail = async (id: string): Promise<void> => {
      try {
        const articleRes = await articleService.getArticleDetail(parseInt(id));
        if (articleRes.code === 200 && articleRes.data) {
          const article = articleRes.data;
          // 填充表单数据
          form.setFieldsValue({
            title: article.title,
            category: article.categoryId.toString(),
            tags: article.tags.map((tag: FrontTag) => tag.id?.toString()),
            allowComment: article.allowComment,
            allowForward: article.allowForward,
            original: article.original,
            visible: article.visible,
            top: article.top
          });
          // 设置其他状态
          setSummary(article.summary);
          setEditorContent(article.content || article.contentHtml);
          // 设置封面图
          if (article.coverImage) {
            setCoverImage(article.coverImage);
            setServerCoverImageUrl(article.coverImage);
            setFileList([
              {
                uid: Date.now().toString(),
                name: 'cover-image.jpg',
                status: 'done',
                url: article.coverImage
              }
            ]);
          }
          // 设置标签
          setSelectedTags(article.tags.map((tag: FrontTag) => tag.id));
        } else {
          message.error(articleRes.message || '获取文章详情失败');
        }
      } catch (err) {
        console.error('获取文章详情失败:', err);
        message.error('获取文章详情失败，请重试');
      }
    };
    void loadCategoriesAndTags();
  }, [isEditMode, articleId, form]);
  // 处理标签选择
  const handleTagChange = (values: string[]): void => {
    // 分离已存在的标签ID和新输入的标签名称
    const existingTags = values.filter((v) => !isNaN(Number(v))).map((v) => parseInt(v));
    setSelectedTags(existingTags);
  };
  // 处理表单提交
  const handleSubmit = async (values: {
    title: string;
    category: string;
    tags: string[];
    visible: string;
    allowComment: string;
    allowForward: string;
    original: string;
    top: string;
  }): Promise<void> => {
    setIsSubmitting(true);
    try {
      // 构建标签数组
      const tags: FrontTag[] = [];
      // 处理已存在的标签和新标签
      if (values.tags) {
        for (const tagValue of values.tags) {
          if (!isNaN(Number(tagValue))) {
            // 已存在的标签，只包含id和name
            const tagId = parseInt(tagValue);
            const tag = availableTags.find((t) => t.value === tagValue);
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
            // 新标签，只包含name
            tags.push({
              id: 0, // 0表示新标签
              name: tagValue,
              slug: '',
              description: '',
              status: StatusEnum.ENABLED
            });
          }
        }
      }
      // 处理封面图(如果有)
      let coverImageUrl = serverCoverImageUrl; // 初始值(使用局部变量, 避免异步执行文章封面图上传无法及时赋值给serverCoverImageUrl)
      if (croppedFile) {
        const uploadResult = await articleService.uploadArticleCoverImage(croppedFile);
        if (uploadResult.code === 200) {
          coverImageUrl = uploadResult.data;
          setCoverImage(uploadResult.data);
        } else {
          message.error('封面上传失败：' + uploadResult.message);
          setIsSubmitting(false);
          return;
        }
      }
      // 准备文章数据，包含所有标签信息
      const articleData = {
        title: values.title,
        content: editorContent,
        contentHtml: editorContent,
        summary: summary,
        categoryId: parseInt(values.category),
        tags: tags,
        coverImage: coverImageUrl || coverImage,
        status: ArticleStatusEnum.PUBLISHED,
        reviewStatus: ArticleReviewStatusEnum.PENDING,
        visible: values.visible as ArticleVisibleEnum,
        allowComment: values.allowComment as AllowStatusEnum,
        allowForward: values.allowForward as AllowStatusEnum,
        original: values.original as ArticleOriginalEnum,
        top: values.top as AllowTopEnum
      };
      let result;
      if (isEditMode && articleId) {
        result = await articleService.updateArticle(Number(articleId), articleData);
      } else {
        result = await articleService.createArticle(articleData);
      }
      if (result.code !== 200) {
        message.error(result.message || (isEditMode ? '文章更新失败！' : '文章发布失败！'));
      } else {
        message.success(result.message || (isEditMode ? '文章更新成功！' : '文章发布成功！'));
        // 操作成功后导航到我的创作页面
        navigate('/profile/creations');
      }
    } catch (error) {
      console.error('提交文章失败:', error);
      message.error(isEditMode ? '更新失败，请重试' : '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 处理保存草稿
  const handleSaveDraft = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      // 1. 先上传封面图(如果有)
      if (croppedFile) {
        const uploadResult = await articleService.uploadArticleCoverImage(croppedFile);
        if (uploadResult.code === 200) {
          setServerCoverImageUrl(uploadResult.data); // 存储服务器返回的URL
        }
      }
      const values = await form.validateFields();
      const articleData = {
        id: Number(articleId),
        title: values.title || '未命名文章',
        content: editorContent,
        contentHtml: editorContent,
        summary: summary,
        categoryId: parseInt(values.category || '0'), // 默认分类
        tags: [], // 草稿文章不保存标签
        coverImage: serverCoverImageUrl || coverImage,
        status: ArticleStatusEnum.DRAFT,
        reviewStatus: undefined,
        visible: (values.visible || ArticleVisibleEnum.PUBLIC) as ArticleVisibleEnum,
        allowComment: (values.allowComment || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
        allowForward: (values.allowForward || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
        original: (values.original || ArticleOriginalEnum.ORIGINAL) as ArticleOriginalEnum,
        top: (values.top || AllowTopEnum.NOT_TOP) as AllowTopEnum
      };
      const response = await articleService.saveDraft(articleData);
      if (response.code === 200) {
        message.success(response.message || '草稿保存成功！');
      } else {
        message.error(response.message || '草稿保存失败，请重试');
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  // 处理预览
  const handlePreview = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setPreviewTitle(values.title || '未命名文章');
      setPreviewContent(editorContent);
      setPreviewCover(serverCoverImageUrl || coverImage);
      setPreviewVisible(true);
    } catch (error) {
      console.error('预览失败:', error);
      message.error('预览失败，请检查表单数据');
    }
  };
  return (
    <>
      <Helmet>
        <title>{isEditMode ? '编辑文章 - InkStage' : '写文章 - InkStage'}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
        {/* 顶部导航栏 */}
        <header className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b dark:border-b border-gray-200 dark:border-gray-700 flex items-center px-3 md:px-[5%] sticky top-0 z-30 shadow-sm">
          {/* 左侧：Logo和标题 */}
          <div className="flex items-center">
            <span
              className="text-lg md:text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => navigate('/')}
            >
              InkStage
            </span>
            <span className="mx-1 md:mx-2 items-center text-sm md:text-base text-gray-400 hidden sm:block">\</span>
            <span className="text-sm md:text-base items-center font-medium text-gray-800 dark:text-gray-300 hidden sm:block">
              {isEditMode ? '编辑文章' : '写文章'}
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
                onClick={() => navigate('/')}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                size="middle"
              >
                <span className="hidden md:inline">返回首页</span>
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
                <span className="hidden md:inline">发布</span>
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
                <span className="text-purple-600 font-medium text-sm hidden lg:inline-block truncate max-w-[100px]">
                  {user.nickname}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="px-[5%] bg-white dark:bg-gray-800">
          <Card
            variant="borderless"
            style={{
              backgroundColor: `${isDarkMode ? '#364153' : 'transparent'}`
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* 第二层：文章标题 */}
              <div className="mb-4">
                <div className="flex items-center gap-10">
                  <div className="flex-2">
                    <Form.Item
                      name="title"
                      rules={[
                        { required: true, message: '文章标题不能为空' },
                        {
                          max: 100,
                          message: '标题不能超过100字'
                        }
                      ]}
                    >
                      <Input
                        placeholder="请输入文章标题..."
                        className="placeholder:text-gray-400/70"
                        maxLength={100}
                        showCount
                        size="large"
                        variant="underlined"
                        style={{
                          fontSize: '30px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          fontFamily: 'sans-serif'
                        }}
                      />
                    </Form.Item>
                  </div>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    className=" bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 whitespace-nowrap mt-1 transition-all duration-200 shadow-sm"
                  >
                    预览
                  </Button>
                </div>
              </div>

              {/* 第三层：分类和标签 - 移动端垂直堆叠 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
                {/* 分类 */}
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
                  <Form.Item name="category" rules={[{ required: true, message: '请选择文章分类' }]}>
                    <Select placeholder="请选择分类" className="w-full" loading={loading}>
                      {categories.map((category) => (
                        <Option key={category.value} value={category.value}>
                          {category.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* 标签 */}
                <div className="w-full md:flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标签</label>
                  <div>
                    <Form.Item name="tags" noStyle>
                      <Select
                        mode="tags"
                        placeholder="请选择标签，或输入新标签名称"
                        style={{ width: '100%' }}
                        onChange={handleTagChange}
                        maxTagCount={10}
                        loading={loading}
                        tokenSeparators={[',', ' ']}
                        tagRender={(props) => {
                          const { label, value, closable, onClose } = props;
                          const tag = availableTags.find((t) => t.value === value);
                          const displayLabel = tag ? tag.label : label;
                          return (
                            <span className="ant-select-selection-item">
                              {displayLabel}
                              {closable && (
                                <span className="ant-select-selection-item-remove" onClick={onClose}>
                                  ×
                                </span>
                              )}
                            </span>
                          );
                        }}
                      >
                        {availableTags.map((tag) => (
                          <Option key={tag.value} value={tag.value}>
                            {tag.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* 错误信息显示 */}
              {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}

              {/* 第四层：富文本编辑器 */}
              <div className="mb-8">
                <RichTextEditor
                  content={editorContent}
                  onContentChange={setEditorContent}
                  placeholder="开始撰写你的文章..."
                />
              </div>

              {/* 文章简介和发布设置 - 移动端垂直堆叠 */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
                {/* 文章简介 */}
                <div className="w-full lg:w-2/5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">文章简介</label>
                  <Input.TextArea
                    placeholder="请输入文章简介"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    maxLength={200}
                    showCount
                    className="resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-2">内容为空时默认显示文章前200字</div>
                </div>

                {/* 发布设置 */}
                <div className="w-full lg:w-3/5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">发布设置</label>
                  <div className="space-y-4">
                    {/* 文章类型 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-full sm:w-32 text-sm text-[#595959] dark:text-gray-400 font-medium shrink-0">
                        文章类型
                      </span>
                      <div className="flex-1 text-[#595959]">
                        <Form.Item name="original" initialValue={ArticleOriginalEnum.ORIGINAL} noStyle>
                          <Radio.Group className="flex flex-wrap gap-2">
                            <Radio value={ArticleOriginalEnum.ORIGINAL}>原创</Radio>
                            <Radio value={ArticleOriginalEnum.REPRINT}>转载</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    </div>

                    {/* 是否允许评论 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-full sm:w-32 text-sm text-[#595959] dark:text-gray-400 font-medium shrink-0">
                        允许评论
                      </span>
                      <div className="flex-1 text-[#595959]">
                        <Form.Item name="allowComment" initialValue={AllowStatusEnum.ALLOWED} noStyle>
                          <Radio.Group className="flex flex-wrap gap-2">
                            <Radio value={AllowStatusEnum.ALLOWED}>允许</Radio>
                            <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    </div>

                    {/* 是否允许转发 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-full sm:w-32 text-sm text-[#595959] dark:text-gray-400 font-medium shrink-0">
                        允许转发
                      </span>
                      <div className="flex-1 text-[#595959]">
                        <Form.Item name="allowForward" initialValue={AllowStatusEnum.ALLOWED} noStyle>
                          <Radio.Group className="flex flex-wrap gap-2">
                            <Radio value={AllowStatusEnum.ALLOWED}>允许</Radio>
                            <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    </div>

                    {/* 是否置顶 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-full sm:w-32 text-sm text-[#595959] dark:text-gray-400 font-medium shrink-0">
                        是否置顶
                      </span>
                      <div className="flex-1 text-[#595959]">
                        <Form.Item name="top" initialValue={AllowTopEnum.NOT_TOP} noStyle>
                          <Radio.Group className="flex flex-wrap gap-2">
                            <Radio value={AllowTopEnum.TOP}>置顶</Radio>
                            <Radio value={AllowTopEnum.NOT_TOP}>不置顶</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    </div>

                    {/* 是否公开 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-full sm:w-32 text-sm text-[#595959] dark:text-gray-400 font-medium shrink-0">
                        是否公开
                      </span>
                      <div className="flex-1 text-[#595959]">
                        <Form.Item name="visible" initialValue={ArticleVisibleEnum.PUBLIC} noStyle>
                          <Radio.Group className="flex flex-wrap gap-2">
                            <Radio value={ArticleVisibleEnum.PUBLIC}>公开</Radio>
                            <Radio value={ArticleVisibleEnum.PRIVATE}>不公开</Radio>
                            <Radio value={ArticleVisibleEnum.FOLLOWERS_ONLY}>仅粉丝可见</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 封面图 */}
              <div className="mb-4 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-4">封面图</label>
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="预览"
                    className="w-full max-w-[640px] h-auto aspect-[16/9] object-cover rounded-lg"
                  />
                ) : null}
                <Form.Item valuePropName="coverImage">
                  <ArticleCoverUploader
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
            </Form>
          </Card>
        </div>
        {/* 页脚信息 */}
        <Footer />

        {/* 预览模态框 */}
        <Modal
          title="文章预览"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              关闭
            </Button>
          ]}
          width="95%"
          style={{
            top: 20
          }}
          className="preview-modal"
        >
          <div className="preview-container">
            {/* 预览标题 */}
            <h1 className="text-xl md:text-2xl font-bold mb-4">{previewTitle}</h1>

            {/* 预览封面图 */}
            {previewCover && (
              <div className="mb-6">
                <img src={previewCover} alt="文章封面" className="w-full h-48 md:h-64 object-cover rounded" />
              </div>
            )}

            {/* 预览内容 */}
            <div
              className="preview-content prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </Modal>
      </div>
    </>
  );
};
export default CreateArticle;
