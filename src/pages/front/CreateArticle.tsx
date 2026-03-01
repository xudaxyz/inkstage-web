import React, {useState, useEffect} from 'react';
import {Button, Card, Input, Select, Upload, message, Space, Form, Radio} from 'antd';
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
import tagService, {type Tag} from '../../services/tagService.ts';
import categoryService from '../../services/categoryService.ts';
import {useUser} from '../../store';
import {ArticleStatusEnum, ArticleOriginalEnum, ArticleVisibleEnum, AllowStatusEnum} from '../../types/enums';
import RichTextEditor from '../../components/editor/RichTextEditor.tsx';
import './CreateArticle.css';

const {Option} = Select;
const {Dragger} = Upload;


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
    const navigate = useNavigate();
    const {user} = useUser();
    const {articleId} = useParams<{ articleId: string }>();
    const isEditMode = !!articleId;

    // 加载分类和标签数据
    useEffect(() => {
        const loadCategoriesAndTags = async () => {
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
        const loadArticleDetail = async (id: string) => {
            try {
                const articleRes = await articleService.getArticleDetail(parseInt(id));
                if (articleRes.code === 200 && articleRes.data) {
                    const article = articleRes.data;

                    // 填充表单数据
                    form.setFieldsValue({
                        title: article.title,
                        category: article.categoryId.toString(),
                        tags: article.tags.map((tag: Tag) => tag.id.toString()),
                        allowComment: article.allowComment,
                        allowForward: article.allowForward,
                        original: article.original,
                        visible: article.visible
                    });

                    // 设置其他状态
                    setSummary(article.summary);
                    setEditorContent(article.content || article.contentHtml);

                    // 设置封面图
                    if (article.coverImage) {
                        setCoverImage(article.coverImage);
                        setServerCoverImageUrl(article.coverImage);
                        setFileList([{
                            uid: Date.now().toString(),
                            name: 'cover-image.jpg',
                            status: 'done',
                            url: article.coverImage
                        }]);
                    }

                    // 设置标签
                    setSelectedTags(article.tags.map((tag: Tag) => tag.id));
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
    const handleTagChange = (values: string[]) => {
        setSelectedTags(values.map(v => parseInt(v)));
    };

    // 处理表单提交
    const handleSubmit = async (values: {
        title: string;
        category: string;
        tagIds: number[];
        visible: string;
        allowComment: string
        allowForward: string
        original: string
    }) => {
        setIsSubmitting(true);
        try {
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
            if (isEditMode && articleId) {
                result = await articleService.updateArticle(Number(articleId), articleData);
            } else {
                console.log("articleData", articleData)
                result = await articleService.createArticle(articleData);
            }

            if (result.code !== 200) {
                message.error(result.message || (isEditMode ? '文章更新失败！' : '文章发布失败！'));
            } else {
                message.success(result.message || (isEditMode ? '文章更新成功！' : '文章发布成功！'));
                // 操作成功后导航到我的创作页面
                navigate('/profile/creations');
            }
        } catch {
            message.error(isEditMode ? '更新失败，请重试' : '发布失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 处理保存草稿
    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            const values = await form.validateFields();
            const articleData = {
                id: articleId,
                title: values.title || '未命名文章',
                content: editorContent,
                summary: summary,
                categoryId: parseInt(values.category || '0'), // 默认分类
                tagIds: selectedTags,
                coverImage: serverCoverImageUrl || coverImage,
                status: ArticleStatusEnum.DRAFT,
                visible: (values.visible || ArticleVisibleEnum.PUBLIC) as ArticleVisibleEnum,
                allowComment: (values.allowComment || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
                allowForward: (values.allowForward || AllowStatusEnum.ALLOWED) as AllowStatusEnum,
                original: (values.original || ArticleOriginalEnum.ORIGINAL) as ArticleOriginalEnum,
            };

            await articleService.saveDraft(articleData);
            message.success('草稿保存成功！');
        } catch {
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
                        className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide">
            InkStage
                    </span>
                    <span className="mx-2 items-center text-base text-gray-400">\</span>
                    <span
                        className="text-base items-center font-medium text-gray-800">{isEditMode ? '编辑文章' : '写文章'}</span>
                </div>

                {/* 右侧：操作按钮和用户信息 */}
                <div className="flex items-center gap-5 ml-auto">


                    {/* 操作按钮 */}
                    <Space size="middle">
                        <Button
                            icon={<SwapLeftOutlined/>}
                            onClick={() => navigate('/')}
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            返回首页
                        </Button>
                        <Button
                            color="cyan"
                            variant="solid"
                            icon={<SaveOutlined/>}
                            onClick={handleSaveDraft}
                            loading={isSubmitting}
                            className=" hover:bg-blue-600"
                        >
                            保存草稿
                        </Button>
                        <Button
                            type="primary"
                            icon={<SendOutlined/>}
                            onClick={() => form.submit()}
                            loading={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            发布
                        </Button>
                    </Space>

                    {/* 用户信息 */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
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
            <div className="px-[5%] bg-white">
                <Card className="mb-8 bg-white"
                      variant='borderless'>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        {/* 第二层：文章标题 */}
                        <div className="mb-4">
                            <div className="flex items-center gap-10">
                                <div className="flex-2">
                                    <Form.Item
                                        name="title"
                                        rules={[{required: true, message: '文章标题不能为空'}, {
                                            max: 100,
                                            message: '标题不能超过100字'
                                        }]}
                                    >
                                        <Input
                                            placeholder="请输入文章标题..."
                                            className="placeholder:text-gray-400/70"
                                            maxLength={100}
                                            showCount
                                            size="large"
                                            variant="underlined"
                                            style={{
                                                fontSize: "30px",
                                                fontStyle: "normal",
                                                fontWeight: 500,
                                                fontFamily: "sans-serif",
                                            }}

                                        />
                                    </Form.Item>
                                </div>
                                <Button
                                    icon={<EyeOutlined/>}
                                    className=" bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 whitespace-nowrap mt-1 transition-all duration-200 shadow-sm"
                                >
                                    预览
                                </Button>
                            </div>
                        </div>

                        {/* 第三层：分类和标签 */}
                        <div className="flex gap-16 mb-6">
                            {/* 左侧：分类 */}
                            <div className="w-1/5 min-w-[120px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                                <Form.Item
                                    name="category"
                                    rules={[{required: true, message: '请选择文章分类'}]}
                                >
                                    <Select placeholder="请选择分类" className="w-full" loading={loading}>
                                        {categories.map(category => (
                                            <Option key={category.value} value={category.value}>
                                                {category.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            {/* 右侧：标签 */}
                            <div className="flex-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                                <div>
                                    <Form.Item name="tags" noStyle>
                                        <Select
                                            mode="multiple"
                                            placeholder="请选择标签"
                                            style={{width: '100%'}}
                                            onChange={handleTagChange}
                                            maxTagCount={5}
                                            loading={loading}
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
                            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* 第四层：富文本编辑器 */}
                        <div className="mb-8">
                            <RichTextEditor
                                content={editorContent}
                                onContentChange={setEditorContent}
                                placeholder="开始撰写你的文章..."
                            />
                        </div>

                        {/* 文章简介和发布设置 */}
                        <div className="flex gap-32 mb-8">
                            {/* 左侧：文章简介 */}
                            <div className="w-2/5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">文章简介</label>
                                <Input.TextArea
                                    placeholder="请输入文章简介"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={5}
                                    maxLength={200}
                                    showCount
                                    className="resize-none"
                                />
                                <div
                                    className="text-xs text-gray-500 mt-2">内容为空时默认显示文章前200字，您可以手动更改
                                </div>
                            </div>

                            {/* 右侧：发布设置 */}
                            <div className="w-2/5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">发布设置</label>
                                <div className="space-y-5">
                                    {/* 是否允许评论 */}
                                    <div className="flex items-center">
                                        <span className="w-32 text-sm text-[#595959] font-medium">是否允许评论</span>
                                        <div className="flex-1 text-[#595959]">
                                            <Form.Item name="allowComment" initialValue={AllowStatusEnum.ALLOWED}
                                                       noStyle>
                                                <Radio.Group>
                                                    <Radio value={AllowStatusEnum.ALLOWED}>允许</Radio>
                                                    <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* 文章类型 */}
                                    <div className="flex items-center">
                                        <span className="w-32 text-sm text-[#595959] font-medium">文章类型</span>
                                        <div className="flex-1 text-[#595959]">
                                            <Form.Item name="original" initialValue={ArticleOriginalEnum.ORIGINAL}
                                                       noStyle>
                                                <Radio.Group>
                                                    <Radio value={ArticleOriginalEnum.ORIGINAL}>原创</Radio>
                                                    <Radio value={ArticleOriginalEnum.REPRINT}>转载</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* 是否允许转发 */}
                                    <div className="flex items-center">
                                        <span className="w-32 text-sm text-[#595959] font-medium">是否允许转发</span>
                                        <div className="flex-1 text-[#595959]">
                                            <Form.Item name="allowForward" initialValue={AllowStatusEnum.ALLOWED}
                                                       noStyle>
                                                <Radio.Group>
                                                    <Radio value={AllowStatusEnum.ALLOWED}>允许</Radio>
                                                    <Radio value={AllowStatusEnum.PROHIBITED}>禁止</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </div>
                                    </div>

                                    {/* 是否公开 */}
                                    <div className="flex items-center">
                                        <span className="w-32 text-sm text-[#595959] font-medium">是否公开</span>
                                        <div className="flex-1 text-[#595959]">
                                            <Form.Item name="visible" initialValue={ArticleVisibleEnum.PUBLIC} noStyle>
                                                <Radio.Group>
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
                        <div className="mb-8 w-[80%]">
                            <label className=" block text-sm font-medium text-gray-700 mb-4">封面图</label>
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
                                >
                                    {fileList.length > 0 ? (
                                        <div className="flex justify-center items-center">
                                            <img
                                                src={coverImage}
                                                alt="封面预览"
                                                className="max-w-full max-h-60 object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined/>
                                            </p>
                                            <p className="ant-upload-text">点击或拖动图片文件到此区域上传封面图片</p>
                                            <p className="ant-upload-hint">
                                                支持上传单张图片，最大5MB
                                            </p>
                                        </>
                                    )}
                                </Dragger>
                            </Form.Item>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default CreateArticle;