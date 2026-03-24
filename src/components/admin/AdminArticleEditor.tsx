import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, Tabs, Input, Select, Button, message, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import articleService from '../../services/articleService';
import { type AdminArticleDetail, type UpdatedAdminArticleFields } from '../../types/article';
import {
    AllowStatusEnum, AllowTopMap, ArticleOriginalEnum, ArticleReviewStatusMap, ArticleStatusMap, ArticleVisibleEnum,
    RecommendedEnum, StatusEnum
} from '../../types/enums';
import type { FrontTag } from '../../types/tag';

const { Option } = Select;
const { TabPane } = Tabs;
// 状态选项
const statusOptions = Object.entries(ArticleStatusMap).map(([value, label]) => ({
    value,
    label
}));
// 可见性选项
const visibleOptions = [
    { value: ArticleVisibleEnum.PUBLIC, label: '公开' },
    { value: ArticleVisibleEnum.PRIVATE, label: '私有' },
    { value: ArticleVisibleEnum.FOLLOWERS_ONLY, label: '仅关注者可见' }
];
// 允许状态选项
const allowOptions = [
    { value: AllowStatusEnum.ALLOWED, label: '允许' },
    { value: AllowStatusEnum.PROHIBITED, label: '不允许' }
];
// 原创状态选项
const originalOptions = [
    { value: ArticleOriginalEnum.ORIGINAL, label: '原创' },
    { value: ArticleOriginalEnum.REPRINT, label: '转载' }
];

// 推荐状态选项
const recommendOptions = [
    { value: RecommendedEnum.RECOMMENDED, label: '已推荐' },
    { value: RecommendedEnum.NOT_RECOMMENDED, label: '未推荐' }
];

interface AdminArticleEditorProps {
    visible: boolean;
    article: AdminArticleDetail | null;
    categories: Array<{ value: number; label: string }>;
    tags: Array<{ value: string; label: string }>;
    onClose: () => void;
    onSave: () => void;
}

const AdminArticleEditor: React.FC<AdminArticleEditorProps> = ({
                                                                   visible,
                                                                   article,
                                                                   categories,
                                                                   tags,
                                                                   onClose,
                                                                   onSave
                                                               }) => {
    const [form] = Form.useForm();
    const originalArticleRef = useRef<AdminArticleDetail | null>(null);
    const [coverImageLoading, setCoverImageLoading] = useState(false);
    const [coverImageError, setCoverImageError] = useState(false);
    // 更新原始文章数据
    useEffect(() => {
        if (article) {
            originalArticleRef.current = article;
        }
    }, [article]);
    // 初始化表单数据和重置状态
    useEffect(() => {
        if (article) {
            // 查找分类ID
            const category = categories.find(cat => cat.label === article.categoryName);
            // 转换标签为ID数组
            const tagIds = article.tags?.map(tag => tag.id?.toString()) || [];
            // 重置表单所有字段
            form.resetFields();

            // 设置表单数据
            form.setFieldsValue({
                title: article.title,
                nickname: article.nickname,
                category: category?.value || 0,
                tags: tagIds,
                status: article.articleStatus,
                reviewStatus: article.reviewStatus,
                visible: article.visible,
                allowComment: article.allowComment,
                allowForward: article.allowForward,
                recommended: article.recommended,
                original: article.original,
                originalUrl: article.originalUrl,
                summary: article.summary,
                coverImage: article.coverImage || '',
                metaTitle: article.metaTitle,
                metaDescription: article.metaDescription,
                metaKeywords: article.metaKeywords,
                top: article.top,
                content: article.content
            });

            // 异步重置封面图加载状态，避免级联渲染
            setTimeout(() => {
                setCoverImageLoading(false);
                setCoverImageError(false);
            }, 100);
        }
    }, [article, categories, tags, form]);
    // 保存文章
    const handleSaveArticle = async (): Promise<void> => {
        form.validateFields().then(async values => {
            try {
                if (article && originalArticleRef.current) {
                    // 处理标签，与前台保持一致
                    const processedTags: FrontTag[] = [];

                    // 处理已存在的标签和新标签
                    for (const tagValue of values.tags) {
                        if (!isNaN(Number(tagValue))) {
                            // 已存在的标签，只包含id和name
                            const tagId = parseInt(tagValue);
                            const tag = tags.find(t => t.value === tagValue);
                            if (tag) {
                                processedTags.push({
                                    id: tagId,
                                    name: tag.label,
                                    slug: '',
                                    description: '',
                                    status: StatusEnum.ENABLED
                                });
                            }
                        } else {
                            // 新标签，只包含name
                            processedTags.push({
                                id: 0, // 0表示新标签
                                name: tagValue,
                                slug: '',
                                description: '',
                                status: StatusEnum.ENABLED
                            });
                        }
                    }

                    // 比较当前值与原始值，只保留修改的字段
                    const updatedFields: UpdatedAdminArticleFields = {};
                    const originalArticle = originalArticleRef.current;
                    // 标题
                    if (values.title !== originalArticle.title) {
                        updatedFields.title = values.title;
                    }
                    // 作者
                    if (values.nickname !== originalArticle.nickname) {
                        updatedFields.nickname = values.nickname;
                    }
                    // 分类
                    const category = categories.find(cat => cat.label === originalArticle.categoryName);
                    if (Number(values.category) !== (category?.value || 0)) {
                        updatedFields.categoryId = Number(values.category);
                    }
                    // 标签
                    const originalTagIds = originalArticle.tags?.map(tag => tag.id?.toString()) || [];
                    if (JSON.stringify(values.tags) !== JSON.stringify(originalTagIds)) {
                        updatedFields.tags = processedTags;
                    }
                    // 文章状态
                    if (values.status !== originalArticle.articleStatus) {
                        updatedFields.articleStatus = values.status;
                    }
                    // 审核状态
                    if (values.reviewStatus !== originalArticle.reviewStatus) {
                        updatedFields.reviewStatus = values.reviewStatus;
                    }
                    // 可见性
                    if (values.visible !== originalArticle.visible) {
                        updatedFields.visible = values.visible;
                    }
                    // 允许评论
                    if (values.allowComment !== originalArticle.allowComment) {
                        updatedFields.allowComment = values.allowComment;
                    }
                    // 允许转发
                    if (values.allowForward !== originalArticle.allowForward) {
                        updatedFields.allowForward = values.allowForward;
                    }
                    // 原创状态
                    if (values.original !== originalArticle.original) {
                        updatedFields.original = values.original;
                    }
                    // 推荐状态
                    if (values.recommended !== originalArticle.recommended) {
                        updatedFields.recommended = values.recommended;
                    }
                    // 原创链接
                    if (values.originalUrl !== originalArticle.originalUrl) {
                        updatedFields.originalUrl = values.originalUrl;
                    }
                    // 摘要
                    if (values.summary !== originalArticle.summary) {
                        updatedFields.summary = values.summary;
                    }
                    // 封面图
                    if (values.coverImage !== originalArticle.coverImage) {
                        updatedFields.coverImage = values.coverImage;
                    }
                    // SEO标题
                    if (values.metaTitle !== originalArticle.metaTitle) {
                        updatedFields.metaTitle = values.metaTitle;
                    }
                    // SEO关键词
                    if (values.metaKeywords !== originalArticle.metaKeywords) {
                        updatedFields.metaKeywords = values.metaKeywords;
                    }
                    // SEO描述
                    if (values.metaDescription !== originalArticle.metaDescription) {
                        updatedFields.metaDescription = values.metaDescription;
                    }
                    // 置顶状态
                    if (values.top !== originalArticle.top) {
                        updatedFields.top = values.top;
                    }
                    // 文章内容
                    if (values.content !== originalArticle.content) {
                        updatedFields.content = values.content;
                    }
                    // 如果没有修改任何字段，直接返回
                    if (Object.keys(updatedFields).length === 0) {
                        message.info('未修改任何内容');
                        onClose();
                        return;
                    }
                    // 编辑现有文章，只提交修改的字段
                    const response = await articleService.admin.updateArticle(article.id, updatedFields);
                    if (response.code === 200 && response.data) {
                        message.success('文章更新成功');
                        onSave();
                        onClose();
                    } else {
                        message.error('更新文章失败');
                    }
                }
            } catch (error) {
                console.error('保存文章失败:', error);
                message.error('保存文章失败');
            }
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };
    return (
        <Modal
            title={
                <div className="flex items-center">
                    <span className="text-xl font-bold mr-2">编辑文章</span>
                    <span className="text-lg text-gray-600">- {article?.title || ''}</span>
                </div>
            }
            open={visible}
            onOk={handleSaveArticle}
            onCancel={onClose}
            width={1200}
            okText="保存"
            cancelText="取消"
            style={{
                borderRadius: '12px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden'
            }}
            styles={{
                body: {
                    padding: 0,
                    maxHeight: '80vh',
                    overflow: 'hidden'
                }
            }}
        >
            <Form
                form={form}
                layout="horizontal"
                variant="outlined"
                initialValues={{
                    status: 'draft',
                    visible: ArticleVisibleEnum.PUBLIC,
                    allowComment: AllowStatusEnum.ALLOWED,
                    allowForward: AllowStatusEnum.ALLOWED,
                    original: ArticleOriginalEnum.ORIGINAL
                }}
            >
                <Tabs defaultActiveKey="basic" className="mt-0">
                    {/* 基本信息 */}
                    <TabPane tab="基本信息" key="basic">
                        <div className="space-y-3 px-2" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            {/* 第一行: 标题 */}
                            <div className="grid gap-5">
                                <div className="flex items-center">
                                    <Form.Item
                                        label="标题"
                                        name="title"
                                        className="w-full"
                                        rules={[
                                            { required: true, message: '请输入标题' },
                                            { min: 2, max: 100, message: '标题长度应在2-100个字符之间' }
                                        ]}
                                    >
                                        <Input variant="underlined" className="flex items-start font-medium text-lg"
                                               placeholder="请输入标题"/>
                                    </Form.Item>
                                </div>
                            </div>

                            {/* 第二行: 作者、分类、 标签 */}
                            <div className="grid grid-cols-24 items-center justify-between gap-5 w-full">
                                <div className="col-span-4">
                                    <div className="flex items-center justify-start">
                                        <Form.Item
                                            label="作者"
                                            name="nickname"
                                            className="w-[160px]"
                                            rules={[
                                                { required: true, message: '请输入作者' },
                                                { min: 2, max: 20, message: '作者名称长度应在2-20个字符之间' }
                                            ]}
                                        >
                                            <Input variant="underlined"
                                                   className="flex items-start font-medium text-lg"
                                                   placeholder="请输入作者"/>
                                        </Form.Item>
                                    </div>
                                </div>
                                <div className="col-span-4 flex justify-start">
                                    <Form.Item
                                        name="category"
                                        label="分类"
                                        className="w-full"
                                        rules={[{ required: true, message: '请选择分类' }]}
                                    >
                                        <Select placeholder="请选择分类">
                                            {categories.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-16 flex items-center justify-end">
                                    <Form.Item
                                        name="tags"
                                        label="标签"
                                        className=" w-full"
                                    >
                                        <Select
                                            mode="tags"
                                            placeholder="请选择标签，或输入新标签名称"
                                            style={{ width: '100%' }}
                                            variant='underlined'
                                            maxTagCount={8}
                                            tokenSeparators={[',', ' ']}
                                        >
                                            {tags.map(tag => (
                                                <Option key={tag.value} value={tag.value}>{tag.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>
                            {/* 第三行: 文章相关设置 */}
                            <div className="grid grid-cols-16 items-center justify-center gap-4 w-full">
                                <div className="col-span-3">
                                    <Form.Item
                                        name="status"
                                        label="文章状态"
                                        rules={[{ required: true, message: '请选择状态' }]}
                                    >
                                        <Select placeholder="请选择状态">
                                            {statusOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="reviewStatus"
                                        label="审核状态"
                                    >
                                        <Select placeholder="请选择审核状态">
                                            {Object.entries(ArticleReviewStatusMap).map(([value, label]) => (
                                                <Option key={value} value={value}>
                                                    {label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="visible"
                                        label="可见性"
                                    >
                                        <Select placeholder="请选择可见性">
                                            {visibleOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="top"
                                        label="置顶状态"
                                    >
                                        <Select placeholder="请选择置顶状态">
                                            {Object.entries(AllowTopMap).map(([value, label]) => (
                                                <Option key={value} value={value}>
                                                    {label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                            </div>
                            <div className="grid grid-cols-16 items-center justify-center gap-4 w-full">
                                <div className="col-span-3 pl-3">
                                    <Form.Item
                                        name="allowComment"
                                        label="允许评论"
                                    >
                                        <Select placeholder="请选择">
                                            {allowOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="allowForward"
                                        label="允许转发"
                                    >
                                        <Select placeholder="请选择">
                                            {allowOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="original"
                                        label="原创状态"
                                    >
                                        <Select placeholder="请选择">
                                            {originalOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-3">
                                    <Form.Item
                                        name="recommended"
                                        label="是否推荐"
                                    >
                                        <Select placeholder="请选择">
                                            {recommendOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>
                            {/* 第四行: 摘要 */}
                            <div className="grid ml-3">
                                <Form.Item
                                    name="summary"
                                    label="摘要"
                                    className="w-full"
                                >
                                    <Input.TextArea
                                        rows={2}
                                        variant={'outlined'}
                                        placeholder="请输入文章摘要"
                                        style={{ height: '75px', maxHeight: '75px' }}
                                    />
                                </Form.Item>
                            </div>
                            {/* 第四行：封面图 */}
                            <div className="px-3 col-span-6 items-center justify-between mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <label className="block text-sm font-medium text-gray-700">封面图片</label>
                                        {!form.getFieldValue('coverImage') && (
                                            <span className="ml-4 text-sm text-gray-500">无封面图</span>
                                        )}
                                    </div>
                                    {form.getFieldValue('coverImage') && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined/>}
                                            onClick={() => form.setFieldsValue({ coverImage: '' })}
                                        >
                                            移除
                                        </Button>
                                    )}
                                </div>
                                {form.getFieldValue('coverImage') && (
                                    <div className="relative border border-gray-100 rounded-lg p-1">
                                        <div className="relative">
                                            {coverImageLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                                                    <Spin size="default" />
                                                </div>
                                            )}
                                            <img
                                                src={form.getFieldValue('coverImage')}
                                                alt="封面图"
                                                className={`w-full h-44 object-cover rounded ${coverImageError ? 'hidden' : ''}`}
                                                onLoad={() => {
                                                    setCoverImageLoading(false);
                                                    setCoverImageError(false);
                                                }}
                                                onError={() => {
                                                    setCoverImageLoading(false);
                                                    setCoverImageError(true);
                                                }}
                                                onLoadStart={() => setCoverImageLoading(true)}
                                            />
                                            {coverImageError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                                                    <span className="text-gray-500">图片加载失败</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 第五行：文章正文 */}
                            <div className="px-3">
                                <Form.Item
                                    name="content"
                                    label="文章正文"
                                    className="block text-sm font-medium text-gray-700"
                                    layout="vertical"
                                >
                                    <Input.TextArea
                                        placeholder="请输入文章正文，支持Markdown格式"
                                        className="font-mono"
                                        style={{
                                            minHeight: '500px'
                                        }}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </TabPane>

                    {/* 其他管理 */}
                    <TabPane tab="SEO管理" key="other">
                        <div className="p-4 space-y-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            {/* SEO信息 */}
                            <div>
                                <div className="space-y-4">
                                    <Form.Item
                                        name="metaTitle"
                                        label="SEO标题"
                                        labelCol={{ span: 2 }}
                                        wrapperCol={{ span: 21 }}
                                    >
                                        <Input variant="underlined" placeholder="请输入SEO标题"/>
                                    </Form.Item>

                                    <Form.Item
                                        name="metaKeywords"
                                        label="SEO关键词"
                                        labelCol={{ span: 2 }}
                                        wrapperCol={{ span: 21 }}
                                    >
                                        <Input variant="underlined" placeholder="请输入SEO关键词，多个关键词用逗号分隔"/>
                                    </Form.Item>

                                    <Form.Item
                                        name="metaDescription"
                                        label="SEO描述"
                                        labelCol={{ span: 2 }}
                                        wrapperCol={{ span: 21 }}
                                    >
                                        <Input.TextArea rows={3} placeholder="请输入SEO描述"/>
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </Form>
        </Modal>
    );
};
export default AdminArticleEditor;
