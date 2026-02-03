import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Input, Select, Upload, message, Space, Form, Radio, Modal} from 'antd';
import type {UploadFile} from 'antd';
import {
    SaveOutlined,
    EyeOutlined,
    SendOutlined,
    SwapLeftOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import {useNavigate, useParams} from 'react-router-dom';
import articleService from '../../services/articleService.ts';
import tagService from '../../services/tagService.ts';
import type {Tag} from '../../services/tagService.ts';
import categoryService from '../../services/categoryService.ts';
import {useUser} from '../../store';
import {ArticleStatusEnum, ArticleOriginalEnum, ArticleVisibleEnum, AllowStatusEnum} from '../../types/enums';
import RichTextEditor from '../../components/editor/RichTextEditor.tsx';
import './CreateArticle.css';

const {Option} = Select;
const {Dragger} = Upload;


// 预览数据类型定义
interface PreviewData {
    title: string;
    content: string;
    summary: string;
    coverImage: string;
    category: string;
    tags: string[];
    authorName: string;
    publishTime: string;
}

const CreateArticle: React.FC = () => {
    const [form] = Form.useForm();
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [availableTags, setAvailableTags] = useState<{ value: string, label: string }[]>([]);
    const [coverImage, setCoverImage] = useState<string>('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [serverCoverImageUrl, setServerCoverImageUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summary, setSummary] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [categories, setCategories] = useState<{ value: string, label: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [articleId, setArticleId] = useState<string | undefined>();
    const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastSavedTime, setLastSavedTime] = useState<string>('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const navigate = useNavigate();
    const {user} = useUser();
    const params = useParams<{ id: string }>();
    // 兼容/create/:id和/edit-article/:id路径
    const id = params.id;

    // 加载分类和标签数据，以及编辑模式下的文章数据
    useEffect(() => {
        const loadData = async () => {
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
                    value: tag.id.toString(),
                    label: tag.name
                }));

                setCategories(formattedCategories);
                setAvailableTags(formattedTags);

                // 如果是编辑模式，加载文章数据
                if (id) {
                    setArticleId(id);
                    try {
                        const articleRes = await articleService.getArticleDetail(parseInt(id));
                        if (articleRes.code === 200) {
                            const articleData = articleRes.data;
                            // 设置表单数据
                            form.setFieldsValue({
                                title: articleData.title,
                                category: articleData.category?.id.toString(),
                                allowComment: articleData.allowComment,
                                allowForward: articleData.allowForward,
                                original: articleData.original,
                                visible: articleData.visible
                            });
                            // 设置其他状态
                            setEditorContent(articleData.content);
                            setSummary(articleData.summary);
                            // 处理标签数据
                            const tagIds = articleData.tags && Array.isArray(articleData.tags)
                                ? articleData.tags.map((tag: Tag) => tag.id)
                                : [];
                            setSelectedTags(tagIds);
                            // 设置标签表单值
                            form.setFieldsValue({
                                tags: tagIds.map(id => id.toString())
                            });
                            if (articleData.coverImage) {
                                setServerCoverImageUrl(articleData.coverImage);
                                setCoverImage(articleData.coverImage);
                                setFileList([{
                                    uid: Date.now().toString(),
                                    name: 'cover-image.jpg',
                                    status: 'done',
                                    url: articleData.coverImage
                                }]);
                            }
                        } else {
                            message.error(articleRes.message || '获取文章详情失败');
                            setError(articleRes.message || '获取文章详情失败');
                        }
                    } catch (error) {
                        console.error('加载文章详情失败:', error);
                        message.error('加载文章详情失败，请重试');
                        setError('加载文章详情失败，请重试');
                    }
                }

            } catch (err) {
                console.error('加载数据失败:', err);
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [id, form]);


    // 处理标签选择
    const handleTagChange = (values: string[]) => {
        setSelectedTags(values.map(v => parseInt(v)));
    };

    // 构建文章数据的公共函数
    const buildArticleData = useCallback((values: {
        title?: string;
        category?: string;
        allowComment?: AllowStatusEnum;
        allowForward?: AllowStatusEnum;
        original?: ArticleOriginalEnum;
    }, status: ArticleStatusEnum = ArticleStatusEnum.DRAFT) => {
        return {
            id: articleId,
            title: values.title || '未命名文章',
            content: editorContent,
            summary: summary,
            categoryId: parseInt(values.category || '0'), // 默认分类
            tagIds: selectedTags,
            coverImage: serverCoverImageUrl || coverImage,
            status: status,
            visible: ArticleVisibleEnum.PUBLIC,
            allowComment: (values.allowComment || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
            allowForward: (values.allowForward || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
            original: (values.original || ArticleOriginalEnum.ORIGINAL) as ArticleOriginalEnum,
        };
    }, [articleId, editorContent, summary, selectedTags, serverCoverImageUrl, coverImage]);

    // 自动保存草稿函数
    const autoSaveDraft = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const articleData = buildArticleData(values);

            setAutoSaveStatus('saving');
            const result = await articleService.saveDraft(articleData);
            if (result.code === 200) {
                setAutoSaveStatus('saved');
                setLastSavedTime(new Date().toLocaleTimeString());
                // 如果是新文章，保存后获取文章ID
                if (!articleId && result.data?.id) {
                    setArticleId(result.data.id.toString());
                }
                // 3秒后重置保存状态
                setTimeout(() => {
                    setAutoSaveStatus('idle');
                }, 3000);
            } else {
                console.error('自动保存失败:', result.message);
                setAutoSaveStatus('idle');
            }
        } catch (error) {
            console.error('自动保存失败:', error);
            setAutoSaveStatus('idle');
        }
    }, [form, buildArticleData, articleId]);

    // 监听内容变化，触发自动保存
    useEffect(() => {
        // 清除之前的定时器
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        // 设置新的定时器，8秒后自动保存（减少保存频率）
        const timer = setTimeout(() => {
            void autoSaveDraft();
        }, 8000);

        setAutoSaveTimer(timer);

        // 清理函数
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [editorContent, summary, selectedTags, serverCoverImageUrl, coverImage, articleId, autoSaveTimer, autoSaveDraft]);

    // 组件卸载时清除定时器
    useEffect(() => {
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [autoSaveTimer]);

    // 处理文章预览
    const handlePreview = async () => {
        const values = await form.validateFields();
        const previewData: PreviewData = {
            title: values.title || '未命名文章',
            content: editorContent,
            summary: summary,
            coverImage: serverCoverImageUrl || coverImage,
            category: categories.find(cat => cat.value === values.category)?.label || '未分类',
            tags: selectedTags.map(tagId => {
                const tag = availableTags.find(t => t.value === tagId.toString());
                return tag?.label || '';
            }).filter(Boolean) as string[],
            authorName: user?.nickname || '匿名用户',
            publishTime: new Date().toLocaleString(),
        };
        setPreviewData(previewData);
        setPreviewVisible(true);
    };

    // 表单值类型定义
    interface FormValues {
        title: string;
        category: string;
        visible: ArticleVisibleEnum;
        allowComment: AllowStatusEnum;
        allowForward: AllowStatusEnum;
        original: ArticleOriginalEnum;
    }

    // 处理表单提交
    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        const articleData = {
            title: values.title,
            content: editorContent,
            summary: summary,
            categoryId: parseInt(values.category),
            tagIds: selectedTags,
            coverImage: serverCoverImageUrl || coverImage,
            status: ArticleStatusEnum.PENDING,
            visible: values.visible as ArticleVisibleEnum,
            allowComment: values.allowComment as AllowStatusEnum,
            allowForward: values.allowForward as AllowStatusEnum,
            original: values.original as ArticleOriginalEnum,
        };

        let result;
        try {
            if (articleId) {
                // 编辑模式，调用更新文章接口
                result = await articleService.updateArticle(articleId, articleData);
            } else {
                // 创建模式，调用创建文章接口
                result = await articleService.createArticle(articleData);
            }

            if (result.code !== 200) {
                const errorMessage = result.message || (articleId ? '文章更新失败！' : '文章发布失败！');
                message.error(errorMessage);
                setError(errorMessage);
            } else {
                message.success(result.message || (articleId ? '文章更新成功！' : '文章发布成功！'));
                // 操作成功后导航到我的创作页面
                navigate('/profile/creations');
            }
        } catch (error) {
            console.error('提交失败:', error);
            const errorMessage = '操作失败，请重试';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 处理保存草稿
    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            const values = await form.validateFields();
            const articleData = buildArticleData(values);

            const result = await articleService.saveDraft(articleData);
            if (result.code === 200) {
                message.success('草稿保存成功！');
                // 如果是新文章，保存后获取文章ID
                if (!articleId && result.data?.id) {
                    setArticleId(result.data.id.toString());
                }
            } else {
                message.error(result.message || '保存失败，请重试');
            }
        } catch (error) {
            console.error('保存草稿失败:', error);
            message.error('保存失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航栏 */}
            <header
                className="h-16 bg-white border-b border-gray-200 flex items-center px-[5%] sticky top-0 z-10 shadow-sm">
                {/* 左侧：Logo和标题 */}
                <div className="flex items-baseline">
                <span
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide">
        InkStage
                </span>
                    <span className="mx-2 items-center text-base text-gray-400">\</span>
                    <span
                        className="text-base items-center font-medium text-gray-800">{articleId ? '编辑文章' : '写文章'}</span>
                </div>

                {/* 右侧：操作按钮和用户信息 */}
                <div className="flex items-center gap-4 ml-auto">
                    {/* 自动保存状态 */}
                    <div className="flex items-center mr-4">
                        {autoSaveStatus === 'saving' && (
                            <span className="text-sm text-blue-500 flex items-center">
                            <div
                                className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                            正在自动保存...
                        </span>
                        )}
                        {autoSaveStatus === 'saved' && lastSavedTime && (
                            <span className="text-sm text-green-500">
                            已自动保存 ({lastSavedTime})
                        </span>
                        )}
                    </div>

                    {/* 操作按钮 */}
                    <Space size="middle">
                        <Button
                            icon={<SwapLeftOutlined/>}
                            onClick={() => navigate('/')}
                            disabled={isSubmitting || loading}
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-sm"
                        >
                            返回首页
                        </Button>
                        <Button
                            icon={<SaveOutlined/>}
                            onClick={handleSaveDraft}
                            loading={isSubmitting}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm"
                        >
                            保存草稿
                        </Button>
                        <Button
                            icon={<SendOutlined/>}
                            onClick={() => form.submit()}
                            loading={isSubmitting}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-sm"
                        >
                            {articleId ? '更新' : '发布'}
                        </Button>
                    </Space>

                    {/* 用户信息 */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-sm">
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
                            <span
                                className="text-purple-600 font-medium text-sm hidden w-[100px] md:inline-block truncate">{user.nickname}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* 主要内容区域 */}
            <div className="px-[5%] py-8">
                <Card
                    className="mb-8 bg-white rounded-xl shadow-md border-none overflow-hidden"
                    variant='outlined'
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">加载中...</p>
                            </div>
                        </div>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            className="p-6"
                        >
                            {/* 第二层：文章标题 */}
                            <div className="mb-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                    <div className="flex-1 w-full">
                                        <Form.Item
                                            name="title"
                                            rules={[{required: true, message: '文章标题不能为空'}, {
                                                max: 100,
                                                message: '标题不能超过100字'
                                            }]}
                                        >
                                            <Input
                                                placeholder="请输入文章标题..."
                                                className="placeholder:text-gray-400/70 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                maxLength={100}
                                                showCount
                                                size="large"
                                                style={{
                                                    fontSize: "24px",
                                                    fontStyle: "normal",
                                                    fontWeight: 500,
                                                    fontFamily: "sans-serif",
                                                    padding: "16px 20px",
                                                }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <Button
                                        icon={<EyeOutlined/>}
                                        onClick={handlePreview}
                                        disabled={loading}
                                        className=" bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 whitespace-nowrap px-6 py-2 rounded-lg transition-all duration-200 shadow-sm mt-2 md:mt-0"
                                    >
                                        预览
                                    </Button>
                                </div>
                            </div>

                            {/* 第三层：分类和标签 */}
                            <div className="flex flex-col md:flex-row gap-6 mb-10">
                                {/* 左侧：分类 */}
                                <div className="w-full md:w-1/4 min-w-[150px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">分类</label>
                                    <Form.Item
                                        name="category"
                                        rules={[{required: true, message: '请选择文章分类'}]}
                                    >
                                        <Select
                                            placeholder="请选择分类"
                                            className="w-full rounded-lg border-gray-200 focus:border-blue-500"
                                            loading={loading}
                                        >
                                            {categories.map(category => (
                                                <Option key={category.value} value={category.value}>
                                                    {category.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>

                                {/* 右侧：标签 */}
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">标签</label>
                                    <div>
                                        <Form.Item name="tags" noStyle>
                                            <Select
                                                mode="multiple"
                                                placeholder="请选择标签"
                                                style={{width: '100%'}}
                                                onChange={handleTagChange}
                                                maxTagCount={5}
                                                loading={loading}
                                                className="rounded-lg border-gray-200 focus:border-blue-500"
                                            >
                                                {availableTags.map(tag => (
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
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* 第四层：富文本编辑器 */}
                            <div className="mb-10">
                                <div className="block text-sm font-medium text-gray-700 mb-3">文章内容</div>
                                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <RichTextEditor
                                        content={editorContent}
                                        onContentChange={setEditorContent}
                                        placeholder="开始撰写你的文章..."
                                        className="min-h-[600px]"
                                    />
                                </div>
                            </div>

                            {/* 文章简介和发布设置 */}
                            <div className="flex flex-col lg:flex-row gap-8 mb-10">
                                {/* 左侧：文章简介 */}
                                <div className="w-full lg:w-2/5">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">文章简介</label>
                                    <Input.TextArea
                                        placeholder="请输入文章简介"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        rows={5}
                                        maxLength={200}
                                        showCount
                                        className="resize-none rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                    <div
                                        className="text-xs text-gray-500 mt-2">内容为空时默认显示文章前200字，您可以手动更改
                                    </div>
                                </div>

                                {/* 右侧：发布设置 */}
                                <div className="w-full lg:w-2/5">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">发布设置</label>
                                    <div className="space-y-6 bg-gray-50 p-5 rounded-lg">
                                        {/* 是否允许评论 */}
                                        <div className="flex items-center">
                                            <span
                                                className="w-32 text-sm text-gray-700 font-medium">是否允许评论</span>
                                            <div className="flex-1">
                                                <Form.Item name="allowComment"
                                                           initialValue={AllowStatusEnum.ALLOWED} noStyle>
                                                    <Radio.Group className="text-gray-700">
                                                        <Radio value={AllowStatusEnum.ALLOWED}
                                                               className="mr-4">允许</Radio>
                                                        <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* 文章类型 */}
                                        <div className="flex items-center">
                                            <span className="w-32 text-sm text-gray-700 font-medium">文章类型</span>
                                            <div className="flex-1">
                                                <Form.Item name="original"
                                                           initialValue={ArticleOriginalEnum.ORIGINAL} noStyle>
                                                    <Radio.Group className="text-gray-700">
                                                        <Radio value={ArticleOriginalEnum.ORIGINAL}
                                                               className="mr-4">原创</Radio>
                                                        <Radio value={ArticleOriginalEnum.REPRINT}
                                                               className="mr-4">转载</Radio>
                                                        <Radio value={ArticleOriginalEnum.OTHER}>其他</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* 是否允许转发 */}
                                        <div className="flex items-center">
                                            <span
                                                className="w-32 text-sm text-gray-700 font-medium">是否允许转发</span>
                                            <div className="flex-1">
                                                <Form.Item name="allowForward"
                                                           initialValue={AllowStatusEnum.ALLOWED} noStyle>
                                                    <Radio.Group className="text-gray-700">
                                                        <Radio value={AllowStatusEnum.ALLOWED}
                                                               className="mr-4">允许</Radio>
                                                        <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                        </div>

                                        {/* 是否公开 */}
                                        <div className="flex items-center">
                                            <span className="w-32 text-sm text-gray-700 font-medium">是否公开</span>
                                            <div className="flex-1">
                                                <Form.Item name="visible" initialValue={ArticleVisibleEnum.PUBLIC}
                                                           noStyle>
                                                    <Radio.Group className="text-gray-700">
                                                        <Radio value={ArticleVisibleEnum.PUBLIC}
                                                               className="mr-4">公开</Radio>
                                                        <Radio value={ArticleVisibleEnum.PRIVATE}
                                                               className="mr-4">不公开</Radio>
                                                        <Radio
                                                            value={ArticleVisibleEnum.FOLLOWERS_ONLY}>仅粉丝可见</Radio>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 封面图 */}
                            <div className="mb-8 w-full">
                                <label className=" block text-sm font-medium text-gray-700 mb-3">封面图</label>
                                <Form.Item valuePropName="coverImage">
                                    <Dragger
                                        fileList={fileList}
                                        name="coverImage"
                                        multiple={false}
                                        customRequest={async (options) => {
                                            const {file, onSuccess, onError} = options;
                                            try {
                                                setLoading(true);
                                                // 调用服务层上传方法
                                                const result = await articleService.uploadImage(file as File);
                                                if (result.code === 200) {
                                                    setServerCoverImageUrl(result.data);
                                                    // 生成本地预览
                                                    if (file instanceof File) {
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            if (e.target?.result) {
                                                                setCoverImage(e.target.result as string);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                    onSuccess?.(result.data);
                                                    // 更新 fileList
                                                    setFileList([{
                                                        uid: Date.now().toString(),
                                                        name: 'cover-image.jpg',
                                                        status: 'done',
                                                        url: result.data
                                                    }]);
                                                    message.success('图片上传成功');
                                                } else {
                                                    const errorMsg = result.message || '图片上传失败';
                                                    onError?.(new Error(errorMsg));
                                                    message.error(errorMsg);
                                                }
                                            } catch (error) {
                                                const errorMsg = error instanceof Error ? error.message : '上传失败，请重试';
                                                onError?.(new Error(errorMsg));
                                                message.error(errorMsg);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        onRemove={() => {
                                            setFileList([]);
                                            setCoverImage('');
                                            setServerCoverImageUrl('');
                                        }}
                                        beforeUpload={(file) => {
                                            // 验证文件类型
                                            const isImage = file.type.startsWith('image/');
                                            if (!isImage) {
                                                void message.error('只能上传图片文件！');
                                                return Upload.LIST_IGNORE;
                                            }
                                            // 验证文件大小
                                            const isLt10M = file.size / 1024 / 1024 < 10;
                                            if (!isLt10M) {
                                                void message.error('图片大小不能超过 10MB！');
                                                return Upload.LIST_IGNORE;
                                            }
                                            return true;
                                        }}
                                        onChange={(info) => {
                                            if (info.file?.status === 'uploading') {
                                                setLoading(true);
                                            } else if (info.file?.status === 'done') {
                                                setLoading(false);
                                            } else if (info.file?.status === 'error') {
                                                setLoading(false);
                                            }
                                        }}
                                        className="rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-500 transition-colors bg-gray-50"
                                    >
                                        {fileList.length > 0 ? (
                                            <div className="flex justify-center items-center p-4">
                                                <img
                                                    src={coverImage}
                                                    alt="封面预览"
                                                    className="max-w-full max-h-60 object-contain rounded-md shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <p className="ant-upload-drag-icon text-blue-500">
                                                    <InboxOutlined style={{fontSize: '48px'}}/>
                                                </p>
                                                <p className="ant-upload-text text-gray-700 font-medium">点击或拖动图片文件到此区域上传封面图片</p>
                                                <p className="ant-upload-hint text-gray-500">
                                                    支持上传单张图片，最大10MB
                                                </p>
                                            </>
                                        )}
                                    </Dragger>
                                </Form.Item>
                            </div>
                        </Form>
                    )}
                </Card>
            </div>

            {/* 预览模态框 */}
            <Modal
                title="文章预览"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        关闭预览
                    </Button>
                ]}
                width={800}
                className="article-preview-modal"
            >
                {previewData && (
                    <div className="article-preview-content">
                        {/* 文章标题 */}
                        <h1 className="text-2xl font-bold mb-4 text-gray-800">{previewData.title}</h1>

                        {/* 作者信息 */}
                        <div className="flex items-center mb-6 text-gray-600">
                            <div
                                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white mr-2">
                                {previewData.authorName.charAt(0)}
                            </div>
                            <span className="mr-4">{previewData.authorName}</span>
                            <span className="mr-4">·</span>
                            <span className="mr-4">{previewData.publishTime}</span>
                            <span className="mr-4">·</span>
                            <span>{previewData.category}</span>
                        </div>

                        {/* 封面图 */}
                        {previewData.coverImage && (
                            <div className="mb-6">
                                <img
                                    src={previewData.coverImage}
                                    alt="文章封面"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* 文章摘要 */}
                        {previewData.summary && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{previewData.summary}</p>
                            </div>
                        )}

                        {/* 文章内容 */}
                        <div className="mb-6 article-content"
                             dangerouslySetInnerHTML={{__html: previewData.content}}/>

                        {/* 标签 */}
                        {previewData.tags && previewData.tags.length > 0 && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">标签：</div>
                                <div className="flex flex-wrap gap-2">
                                    {previewData.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                                        >
                                        {tag}
                                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CreateArticle;