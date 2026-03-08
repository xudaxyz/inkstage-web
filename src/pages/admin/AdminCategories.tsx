import React, { useState } from 'react';
import { Card, Table, Input, Button, Space, Tag, Modal, Form, Switch, message, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined, EyeOutlined, EditOutlined, PlusOutlined, AppstoreOutlined, CalendarOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 分类类型定义
interface Category {
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

// 模拟分类数据
const mockCategories: Category[] = [
    {
        key: '1',
        id: 1,
        name: '前端开发',
        slug: 'frontend',
        description: '前端开发相关内容',
        status: true,
        articleCount: 128,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '2',
        id: 2,
        name: '后端开发',
        slug: 'backend',
        description: '后端开发相关内容',
        status: true,
        articleCount: 96,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '3',
        id: 3,
        name: '移动开发',
        slug: 'mobile',
        description: '移动开发相关内容',
        status: true,
        articleCount: 64,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '4',
        id: 4,
        name: 'DevOps',
        slug: 'devops',
        description: 'DevOps相关内容',
        status: true,
        articleCount: 48,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    },
    {
        key: '5',
        id: 5,
        name: '其他',
        slug: 'other',
        description: '其他相关内容',
        status: true,
        articleCount: 32,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
    }
];

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>(mockCategories);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    // 搜索和筛选分类
    const handleSearch = (value: string) => {
        setSearchText(value);
        filterCategories(value);
    };

    const filterCategories = (search: string) => {
        let filtered = [...categories];

        if (search) {
            filtered = filtered.filter(category => 
                category.name.toLowerCase().includes(search.toLowerCase()) ||
                category.slug.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredCategories(filtered);
    };

    // 打开编辑分类模态框
    const handleEditCategory = (category: Category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        form.setFieldsValue({
            name: category.name,
            slug: category.slug,
            description: category.description,
            status: category.status
        });
        setIsModalVisible(true);
    };

    // 打开查看分类模态框
    const handleViewCategory = (category: Category) => {
        setCurrentCategory(category);
        setIsViewModalVisible(true);
    };

    // 删除分类
    const handleDeleteCategory = (id: number) => {
        setCategories(categories.filter(category => category.id !== id));
        setFilteredCategories(filteredCategories.filter(category => category.id !== id));
        message.success('分类删除成功');
    };

    // 切换分类状态
    const handleToggleStatus = (id: number, status: boolean) => {
        const updatedCategories = categories.map(category => 
            category.id === id ? { ...category, status: !status } : category
        );
        setCategories(updatedCategories);
        filterCategories(searchText);
        message.success(`分类已${status ? '禁用' : '启用'}`);
    };

    // 保存分类
    const handleSaveCategory = () => {
        form.validateFields().then(values => {
            if (isEditing && currentCategory) {
                // 编辑现有分类
                const updatedCategories = categories.map(category => 
                    category.id === currentCategory.id ? { 
                        ...category, 
                        ...values,
                        updatedAt: new Date().toISOString().split('T')[0]
                    } : category
                );
                setCategories(updatedCategories);
                filterCategories(searchText);
                message.success('分类更新成功');
            } else {
                // 添加新分类
                const newCategory: Category = {
                    key: String(categories.length + 1),
                    id: categories.length + 1,
                    ...values,
                    articleCount: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                setCategories([...categories, newCategory]);
                filterCategories(searchText);
                message.success('分类添加成功');
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
            title: '分类名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text className="font-medium">{text}</Text>
        },
        {
            title: '别名',
            dataIndex: 'slug',
            key: 'slug',
            width: 120
        },
        {
            title: '分类描述',
            dataIndex: 'description',
            key: 'description',
            width: 200
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
            render: (status: boolean, record: Category) => (
                <Switch 
                    checked={status} 
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
            render: (_: unknown, record: Category) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewCategory(record)}
                        className="text-blue-500"
                    >
                        查看
                    </Button>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditCategory(record)}
                        className="text-green-500"
                    >
                        编辑
                    </Button>
                    <Button 
                        type="text" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteCategory(record.id)}
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
                <h2 className="text-2xl font-semibold text-gray-800">分类管理</h2>
            </div>

            {/* 搜索和筛选 */}
            <Card variant={"borderless"} className="border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Search
                        placeholder="搜索分类名称或别名"
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
                            setCurrentCategory(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        新增分类
                    </Button>
                </div>
            </Card>

            {/* 分类列表 */}
            <Card variant={"borderless"}>
                <Table
                    columns={columns}
                    dataSource={filteredCategories}
                    rowKey="id"
                    pagination={{
                        showSizeChanger: true,
                        placement: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50'],
                        defaultPageSize: 10,
                        showTotal: (total) => `共 ${total} 个分类`
                    }}
                />
            </Card>

            {/* 添加/编辑分类模态框 */}
            <Modal
                title={isEditing ? '编辑分类' : '添加分类'}
                open={isModalVisible}
                onOk={handleSaveCategory}
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
                        label="分类名称"
                        rules={[
                            { required: true, message: '请输入分类名称' },
                            { min: 2, max: 50, message: '分类名称长度应在2-50个字符之间' }
                        ]}
                    >
                        <Input placeholder="请输入分类名称" />
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
                        <Input.TextArea rows={3} placeholder="请输入分类描述" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 查看分类模态框 */}
            <Modal
                title="分类详情"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                width={500}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentCategory && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AppstoreOutlined className="text-gray-500" />
                            <span className="font-medium">分类名称:</span>
                            <span>{currentCategory.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppstoreOutlined className="text-gray-500" />
                            <span className="font-medium">别名:</span>
                            <span>{currentCategory.slug}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <AppstoreOutlined className="text-gray-500 mt-1" />
                            <span className="font-medium">描述:</span>
                            <span>{currentCategory.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppstoreOutlined className="text-gray-500" />
                            <span className="font-medium">文章数量:</span>
                            <span>{currentCategory.articleCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppstoreOutlined className="text-gray-500" />
                            <span className="font-medium">状态:</span>
                            <Tag color={currentCategory.status ? 'green' : 'red'}>
                                {currentCategory.status ? '启用' : '禁用'}
                            </Tag>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">创建时间:</span>
                            <span>{currentCategory.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-500" />
                            <span className="font-medium">更新时间:</span>
                            <span>{currentCategory.updatedAt}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminCategories;