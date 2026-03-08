import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Switch, message, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, PlusOutlined, TagOutlined, CalendarOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 标签类型定义
interface TagItem {
    key: string;
    id: number;
    name: string;
    slug: string;
    description: string;
    status: boolean;
    articleCount: number;
    createdAt: string;
    updatedAt: string;
}

// 模拟标签数据
const mockTags: TagItem[] = [
    {
        key: '1',
        id: 1,
        name: 'React',
        slug: 'react',
        description: 'React 相关内容',
        status: true,
        articleCount: 45,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '2',
        id: 2,
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TypeScript 相关内容',
        status: true,
        articleCount: 38,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '3',
        id: 3,
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Node.js 相关内容',
        status: true,
        articleCount: 32,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '4',
        id: 4,
        name: 'Tailwind CSS',
        slug: 'tailwind-css',
        description: 'Tailwind CSS 相关内容',
        status: true,
        articleCount: 28,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '5',
        id: 5,
        name: 'Docker',
        slug: 'docker',
        description: 'Docker 相关内容',
        status: true,
        articleCount: 25,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '6',
        id: 6,
        name: 'Vue',
        slug: 'vue',
        description: 'Vue 相关内容',
        status: true,
        articleCount: 22,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '7',
        id: 7,
        name: 'MongoDB',
        slug: 'mongodb',
        description: 'MongoDB 相关内容',
        status: true,
        articleCount: 18,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '8',
        id: 8,
        name: 'DevOps',
        slug: 'devops',
        description: 'DevOps 相关内容',
        status: true,
        articleCount: 15,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    }
];

const AdminTags: React.FC = () => {
    const [tags, setTags] = useState<TagItem[]>(mockTags);
    const [filteredTags, setFilteredTags] = useState<TagItem[]>(mockTags);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentTag, setCurrentTag] = useState<TagItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选标签
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterTags(value);
    };

    const filterTags = (search: string) => {
        let filtered = [...tags];

        if (search) {
            filtered = filtered.filter(tag => 
                tag.name.toLowerCase().includes(search.toLowerCase()) ||
                tag.slug.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredTags(filtered);
    };

    // 打开编辑标签模态框
    const handleEditTag = (tag: TagItem) => {
        setIsEditing(true);
        setCurrentTag(tag);
        form.setFieldsValue({
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            status: tag.status
        });
        setIsModalVisible(true);
    };

    // 打开查看标签模态框
    const handleViewTag = (tag: TagItem) => {
        setCurrentTag(tag);
        setIsViewModalVisible(true);
    };

    // 删除标签
    const handleDeleteTag = (id: number) => {
        setTags(tags.filter(tag => tag.id !== id));
        setFilteredTags(filteredTags.filter(tag => tag.id !== id));
        message.success('标签删除成功');
    };

    // 切换标签状态
    const handleToggleStatus = (id: number, status: boolean) => {
        const updatedTags = tags.map(tag => 
            tag.id === id ? { ...tag, status: !status } : tag
        );
        setTags(updatedTags);
        filterTags(searchText);
        message.success(`标签已${status ? '禁用' : '启用'}`);
    };

    // 保存标签
    const handleSaveTag = () => {
        form.validateFields().then(values => {
            if (isEditing && currentTag) {
                // 编辑现有标签
                const updatedTags = tags.map(tag => 
                    tag.id === currentTag.id ? { 
                        ...tag, 
                        ...values,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : tag
                );
                setTags(updatedTags);
                filterTags(searchText);
                message.success('标签更新成功');
            } else {
                // 添加新标签
                const newTag: TagItem = {
                    key: String(tags.length + 1),
                    id: tags.length + 1,
                    ...values,
                    articleCount: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                setTags([...tags, newTag]);
                filterTags(searchText);
                message.success('标签添加成功');
            }
            setIsModalVisible(false);
        }).catch(error => {
            console.error('验证失败:', error);
        });
    };

    // 表格列配置
    const columns = [
        {
            title: '序号',
            key: 'index',
            width: 60,
            render: (_: unknown, __: unknown, index: number) => index + 1
        },
        {
            title: '标签名称',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            render: (text: string) => <Text className="font-medium">{text}</Text>
        },
        {
            title: '别名',
            dataIndex: 'slug',
            key: 'slug',
            width: 120
        },
        {
            title: '标签描述',
            dataIndex: 'description',
            key: 'description',
            width: 240
        },
        {
            title: '文章数量',
            dataIndex: 'articleCount',
            key: 'articleCount',
            width: 100
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: boolean, record: TagItem) => (
                <Switch 
                    checked={status}
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                    onChange={(checked) => handleToggleStatus(record.id, checked)}
                />
            )
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_: unknown, record: TagItem) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewTag(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditTag(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteTag(record.id)}
                        className="text-red-500"
                    >
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">标签管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card variant={"borderless"} className="border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Search
                        placeholder="搜索标签名称或别名"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsEditing(false);
                            setCurrentTag(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        新增标签
                    </Button>
                </div>
            </Card>

            {/* 标签列表 */}
            <Card variant={"borderless"}>
                <Table
                    columns={columns}
                    dataSource={filteredTags}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        placement: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 个标签`
                    }}
                />
            </Card>

            {/* 添加/编辑标签模态框 */}
            <Modal
                title={isEditing ? '编辑标签' : '添加标签'}
                open={isModalVisible}
                onOk={handleSaveTag}
                onCancel={() => setIsModalVisible(false)}
                width={500}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: true
                    }}
                >
                    <Form.Item
                        name="name"
                        label="标签名称"
                        rules={[
                            { required: true, message: '请输入标签名称' },
                            { min: 2, max: 50, message: '标签名称长度应在2-50个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入标签名称" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label="别名"
                        rules={[
                            { required: true, message: '请输入别名' },
                            { min: 2, max: 50, message: '别名长度应在2-50个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入别名，用于URL" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[
                            { max: 200, message: '描述长度不能超过200个字符' }
                        ]}
                    >
                        <Input.TextArea rows={3} placeholder="请输入标签描述" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看标签模态框 */}
            <Modal
                title="标签详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={500}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentTag && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <TagOutlined className="text-gray-500" />
                            <span className="font-medium">标签名称:</span>
                            <span>{currentTag.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TagOutlined className="text-gray-500" />
                            <span className="font-medium">别名:</span>
                            <span>{currentTag.slug}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <TagOutlined className="text-gray-500 mt-1" />
                            <span className="font-medium">描述:</span>
                            <span>{currentTag.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TagOutlined className="text-gray-500" />
                            <span className="font-medium">文章数量:</span>
                            <span>{currentTag.articleCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TagOutlined className="text-gray-500" />
                            <span className="font-medium">状态:</span>
                            <Tag color={currentTag.status ? 'green' : 'red'}>
                                {currentTag.status ? '启用' : '禁用'}
                            </Tag>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">创建时间:</span>
                            <span>{currentTag.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">更新时间:</span>
                            <span>{currentTag.updatedAt}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminTags;