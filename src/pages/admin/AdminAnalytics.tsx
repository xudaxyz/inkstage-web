import React, { useState } from 'react';
import { Card, Input, Select, Space, Typography, Row, Col, Statistic } from 'antd';
import { SearchOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined, UserOutlined, FileTextOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Title, Text } = Typography;

// 模拟统计数据
const mockStatistics = {
  totalUsers: 1234,
  totalArticles: 567,
  totalComments: 2345,
  totalViews: 123456
};

const AdminAnalytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');

  // 搜索处理
  const handleSearch = () : void => {
    // 这里可以添加搜索逻辑
  };

  // 时间范围变化处理
  const handleTimeRangeChange = (value: string) : void => {
    setSelectedTimeRange(value);
    // 这里可以添加时间范围变化逻辑
  };

  return (
    <div className="mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">数据分析</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <Search
            placeholder="搜索分析数据"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择时间范围"
            style={{ width: 150 }}
            onChange={handleTimeRangeChange}
            value={selectedTimeRange}
          >
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
            <Select.Option value="year">本年</Select.Option>
          </Select>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="border border-gray-100 shadow-sm">
            <Statistic
              title="总用户数"
              value={mockStatistics.totalUsers}
              prefix={<UserOutlined />}
              styles={{
                content:{
                  color: '#108ee9'
                }
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border border-gray-100 shadow-sm">
            <Statistic
              title="总文章数"
              value={mockStatistics.totalArticles}
              prefix={<FileTextOutlined />}
              styles={{
                content:{
                  color: '#52c41a'
                }
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border border-gray-100 shadow-sm">
            <Statistic
              title="总评论数"
              value={mockStatistics.totalComments}
              prefix={<MessageOutlined />}
              styles={{
                content:{
                  color: '#faad14'
                }
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border border-gray-100 shadow-sm">
            <Statistic
              title="总浏览量"
              value={mockStatistics.totalViews}
              prefix={<EyeOutlined />}
              styles={{
                content:{
                  color: '#f5222d'
                }
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="border border-gray-100 shadow-sm">
            <Title level={5} className="mb-4">文章浏览量趋势</Title>
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <Space orientation="vertical" align="center">
                <BarChartOutlined style={{ fontSize: 48, color: '#108ee9' }} />
                <Text>文章浏览量趋势图表</Text>
                <Text type="secondary">显示过去6个月的浏览量数据</Text>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="border border-gray-100 shadow-sm">
            <Title level={5} className="mb-4">用户增长趋势</Title>
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <Space orientation="vertical" align="center">
                <LineChartOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <Text>用户增长趋势图表</Text>
                <Text type="secondary">显示过去6个月的用户增长数据</Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="border border-gray-100 shadow-sm">
            <Title level={5} className="mb-4">文章分类分布</Title>
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <Space orientation="vertical" align="center">
                <PieChartOutlined style={{ fontSize: 48, color: '#faad14' }} />
                <Text>文章分类分布图表</Text>
                <Text type="secondary">显示各分类文章数量占比</Text>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="border border-gray-100 shadow-sm">
            <Title level={5} className="mb-4">用户活跃度分析</Title>
            <div className="h-80 bg-gray-50 rounded-md flex items-center justify-center">
              <Space orientation="vertical" align="center">
                <LineChartOutlined style={{ fontSize: 48, color: '#f5222d' }} />
                <Text>用户活跃度分析图表</Text>
                <Text type="secondary">显示用户活跃情况</Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据表格 */}
      <Card className="border border-gray-100 shadow-sm">
        <Title level={5} className="mb-4">热门文章排行榜</Title>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3">排名</th>
                <th className="px-4 py-3">文章标题</th>
                <th className="px-4 py-3">作者</th>
                <th className="px-4 py-3">浏览量</th>
                <th className="px-4 py-3">评论数</th>
                <th className="px-4 py-3">发布时间</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">1</td>
                <td className="px-4 py-3 font-medium">React最佳实践</td>
                <td className="px-4 py-3">张三</td>
                <td className="px-4 py-3">1234</td>
                <td className="px-4 py-3">56</td>
                <td className="px-4 py-3">2026-01-01</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">2</td>
                <td className="px-4 py-3 font-medium">TypeScript高级特性</td>
                <td className="px-4 py-3">李四</td>
                <td className="px-4 py-3">987</td>
                <td className="px-4 py-3">45</td>
                <td className="px-4 py-3">2026-01-02</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">3</td>
                <td className="px-4 py-3 font-medium">Node.js性能优化</td>
                <td className="px-4 py-3">王五</td>
                <td className="px-4 py-3">876</td>
                <td className="px-4 py-3">34</td>
                <td className="px-4 py-3">2026-01-03</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3">4</td>
                <td className="px-4 py-3 font-medium">Tailwind CSS使用指南</td>
                <td className="px-4 py-3">赵六</td>
                <td className="px-4 py-3">765</td>
                <td className="px-4 py-3">23</td>
                <td className="px-4 py-3">2026-01-04</td>
              </tr>
              <tr>
                <td className="px-4 py-3">5</td>
                <td className="px-4 py-3 font-medium">React Hooks深入理解</td>
                <td className="px-4 py-3">孙七</td>
                <td className="px-4 py-3">654</td>
                <td className="px-4 py-3">12</td>
                <td className="px-4 py-3">2026-01-05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
