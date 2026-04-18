import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, message, Modal, type PaginationProps, Select, Space, Spin, Table, Tag } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import {
  DefaultStatusEnum,
  HandleReportResultEnum,
  HandleReportResultMap,
  ReportStatusEnum,
  ReportStatusMap,
  ReportTargetTypeEnum,
  ReportTargetTypeMap,
  ReportTypeEnum,
  ReportTypeMap
} from '../../types/enums';
import { formatDateTime, formatDateTimeShort } from '../../utils';
import reportService from '../../services/reportService';
import type { AdminReportVO } from '../../types/report';
import { ROUTES } from '../../constants/routes';

const { Search } = Input;

const AdminReports: React.FC = () => {
  const [filteredReports, setFilteredReports] = useState<AdminReportVO[]>([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isHandleModalVisible, setIsHandleModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<AdminReportVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportedType, setReportedType] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [form] = Form.useForm();

  // 加载举报数据
  const loadReports = useCallback(
    async (
      pageNum: number = 1,
      pageSize: number = 10,
      currentReportStatus: string = reportStatus,
      currentReportType: string = reportType,
      currentReportedType: string = reportedType,
      currentSearchKeyword: string = searchKeyword
    ): Promise<void> => {
      setLoading(true);
      try {
        const response = await reportService.adminGetReportList({
          pageNum,
          pageSize,
          reportStatus: (currentReportStatus as ReportStatusEnum) || null,
          reportType: (currentReportType as ReportTypeEnum) || null,
          reportedType: (currentReportedType as ReportTargetTypeEnum) || null,
          reportedContent: currentSearchKeyword || null
        });

        if (response.code === 200) {
          const formattedReports = response.data.record.map((report: AdminReportVO) => ({
            ...report,
            key: report.id.toString()
          }));

          setFilteredReports(formattedReports);
          setPagination({
            pageNum,
            pageSize,
            total: response.data.total
          });
        } else {
          message.error(response.message || '加载举报失败');
        }
      } catch (error) {
        console.error('加载举报失败:', error);
      } finally {
        setLoading(false);
      }
    },
    [reportStatus, reportType, reportedType, searchKeyword]
  );

  // 组件挂载时加载数据
  useEffect((): void => {
    void loadReports();
  }, [loadReports]);

  // 处理分页变化
  const handleTableChange = async (pagination: PaginationProps): Promise<void> => {
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 10;
    await loadReports(current, pageSize);
  };

  // 搜索和筛选举报
  const handleSearch = async (value: string): Promise<void> => {
    setSearchKeyword(value);
    await loadReports(1, pagination.pageSize, reportStatus, reportType, reportedType, value);
  };

  // 筛选举报类型
  const handleReportTypeChange = async (value: ReportTypeEnum): Promise<void> => {
    setReportType(value);
    await loadReports(1, pagination.pageSize, reportStatus, value, reportedType, searchKeyword);
  };

  // 筛选被举报类型
  const handleReportedTypeChange = async (value: ReportTargetTypeEnum): Promise<void> => {
    setReportedType(value);
    await loadReports(1, pagination.pageSize, reportStatus, reportType, value, searchKeyword);
  };
  // 筛选举报状态
  const handleReportedStatusChange = async (value: ReportStatusEnum): Promise<void> => {
    setReportStatus(value);
    await loadReports(1, pagination.pageSize, value, reportType, reportedType, searchKeyword);
  };

  // 打开查看举报模态框
  const handleViewReport = async (report: AdminReportVO): Promise<void> => {
    try {
      const response = await reportService.adminGetReportById(report.id);
      if (response.code === 200) {
        setCurrentReport(response.data);
        setIsViewModalVisible(true);
      } else {
        message.error(response.message || '获取举报详情失败');
      }
    } catch (error) {
      console.error('获取举报详情失败:', error);
      message.error('获取举报详情失败');
    }
  };

  // 打开处理举报模态框
  const handleHandleReport = (report: AdminReportVO): void => {
    setCurrentReport(report);
    form.resetFields();
    setIsHandleModalVisible(true);
  };

  // 处理举报
  const handleSaveHandle = async (): Promise<void> => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          if (!currentReport) return;
          const response = await reportService.adminHandleReport(currentReport.id, {
            reportStatus:
              values.handleResult === HandleReportResultEnum.REJECTED
                ? ReportStatusEnum.REJECTED
                : ReportStatusEnum.ACCEPTED,
            handleResult: values.handleResult,
            handleReason: values.handleReason
          });
          console.log('adminHandleReport', response);

          if (response.code === 200) {
            message.success(response.message || '举报处理成功');
            setIsHandleModalVisible(false);
            await loadReports(pagination.pageNum, pagination.pageSize);
          } else {
            message.error(response.message || '处理举报失败');
          }
        } catch (error) {
          console.error('处理举报失败:', error);
        }
      })
      .catch((error) => {
        console.error('验证失败:', error);
      });
  };

  // 表格列配置
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number): number =>
        (pagination.pageNum - 1) * pagination.pageSize + index + 1
    },
    {
      title: '举报类型',
      dataIndex: 'reportedType',
      key: 'reportedType',
      width: 120,
      render: (type: ReportTargetTypeEnum): React.ReactNode => (
        <Tag color="blue">{ReportTargetTypeMap[type] || type}</Tag>
      )
    },
    {
      title: '举报内容',
      dataIndex: 'reportedContent',
      key: 'reportedContent',
      width: 200,
      render: (text: string, record: AdminReportVO): React.ReactNode => (
        <a
          href={ROUTES.ARTICLE_DETAIL(record.relatedId)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium truncate text-blue-600 hover:text-blue-700 transition-colors"
        >
          {text}
        </a>
      )
    },
    {
      title: '举报原因',
      dataIndex: 'reportType',
      key: 'reportType',
      width: 120,
      render: (type: ReportTypeEnum): React.ReactNode => <Tag color="orange">{ReportTypeMap[type] || type}</Tag>
    },
    {
      title: '举报人',
      dataIndex: 'reporterName',
      key: 'reporterName',
      width: 120
    },
    {
      title: '举报状态',
      dataIndex: 'reportStatus',
      key: 'reportStatus',
      width: 100,
      render: (status: ReportStatusEnum): React.ReactNode => {
        let color = 'default';
        switch (status) {
          case ReportStatusEnum.PENDING:
            color = 'blue';
            break;
          case ReportStatusEnum.IN_PROGRESS:
            color = 'orange';
            break;
          case ReportStatusEnum.ACCEPTED:
            color = 'green';
            break;
          case ReportStatusEnum.REJECTED:
            color = 'red';
            break;
          case ReportStatusEnum.CLOSED:
            color = 'purple';
            break;
        }
        return <Tag color={color}>{ReportStatusMap[status]}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (createTime: string): string => formatDateTimeShort(createTime)
    },
    {
      title: '处理结果',
      dataIndex: 'handleResult',
      key: 'handleResult',
      width: 100,
      render: (result: HandleReportResultEnum): React.ReactNode => {
        let color = 'default';
        switch (result) {
          case HandleReportResultEnum.DELETE_CONTENT:
            color = 'blue';
            break;
          case HandleReportResultEnum.BAN_USER:
            color = 'orange';
            break;
          case HandleReportResultEnum.WARNING:
            color = 'green';
            break;
          case HandleReportResultEnum.OTHER:
            color = 'red';
            break;
          case HandleReportResultEnum.UNHANDLED:
            color = 'default';
            break;
        }
        return <Tag color={color}>{HandleReportResultMap[result] || '未处理'}</Tag>;
      }
    },
    {
      title: '处理时间',
      dataIndex: 'handleTime',
      key: 'handleTime',
      width: 180,
      render: (handleTime: string): string => (handleTime ? formatDateTimeShort(handleTime) : '未处理')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center' as const,
      render: (_: unknown, record: AdminReportVO): React.ReactNode => (
        <Space size="middle">
          <Button
            variant={'text'}
            color={'green'}
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
            className="text-blue-500"
          >
            查看
          </Button>
          <Button
            variant={'text'}
            color={'orange'}
            icon={<EditOutlined />}
            onClick={() => handleHandleReport(record)}
            className="text-green-500"
          >
            处理
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">举报管理</h2>
      </div>

      {/* 搜索和筛选 */}
      <Card variant="borderless" className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-8 justify-start items-center ">
          <Search
            placeholder="搜索被举报名称"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <div className="flex gap-4">
            <Select
              placeholder="举报类型"
              allowClear
              style={{ width: 150 }}
              onChange={handleReportedTypeChange}
              options={Object.entries(ReportTargetTypeMap).map(([value, label]) => ({
                value,
                label
              }))}
            />
            <Select
              placeholder="举报原因"
              allowClear
              style={{ width: 150 }}
              onChange={handleReportTypeChange}
              options={Object.entries(ReportTypeMap).map(([value, label]) => ({
                value,
                label
              }))}
            />
            <Select
              placeholder="举报状态"
              allowClear
              style={{ width: 150 }}
              onChange={handleReportedStatusChange}
              options={Object.entries(ReportStatusMap).map(([value, label]) => ({
                value,
                label
              }))}
            />
          </div>
        </div>
      </Card>

      {/* 举报列表 */}
      <Card variant="borderless">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              current: pagination.pageNum,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              placement: ['bottomCenter'],
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total) => `共 ${total} 个举报`
            }}
          />
        )}
      </Card>

      {/* 查看举报模态框 */}
      <Modal
        title="举报详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentReport && (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">被举报用户:</span>
              <span>{currentReport.reportedName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24 truncate">被举报内容:</span>
              <span>{currentReport.reportedContent}</span>
              <a
                href={ROUTES.ARTICLE_DETAIL(currentReport.relatedId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span className="text-blue-500 hover:text-blue-800 text-xs">查看详情</span>
              </a>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">举报类型:</span>
              <Tag color="blue">{ReportTargetTypeMap[currentReport.reportedType] || currentReport.reportedType}</Tag>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">举报原因:</span>
              <Tag color="orange">{ReportTypeMap[currentReport.reportType] || currentReport.reportType}</Tag>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">举报理由:</span>
              <span>{currentReport.reason}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">举报证据:</span>
              <span>{currentReport.evidence || '无'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">举报人:</span>
              <span>{currentReport.anonymous === DefaultStatusEnum.YES ? '匿名' : currentReport.reporterName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">状态:</span>
              <Tag color={currentReport.reportStatus === ReportStatusEnum.ACCEPTED ? 'green' : 'blue'}>
                {ReportStatusMap[currentReport.reportStatus]}
              </Tag>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">处理结果:</span>
              <span>{currentReport.handleResult || '未处理'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">处理理由:</span>
              <span>{currentReport.handleReason || '无'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">处理人:</span>
              <span>{currentReport.handlerName || '无'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">处理时间:</span>
              <span>{currentReport.handleTime || '未处理'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium w-24">创建时间:</span>
              <span>{formatDateTime(currentReport.createTime || '')}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* 处理举报模态框 */}
      <Modal
        title="处理举报"
        open={isHandleModalVisible}
        onOk={handleSaveHandle}
        onCancel={() => setIsHandleModalVisible(false)}
        width={500}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="handleResult" label="处理结果" rules={[{ required: true, message: '请选择处理结果' }]}>
            <Select placeholder="请选择处理结果">
              <Select.Option value={HandleReportResultEnum.WARNING}>
                {HandleReportResultMap[HandleReportResultEnum.WARNING]}
              </Select.Option>
              <Select.Option value={HandleReportResultEnum.DELETE_CONTENT}>
                {HandleReportResultMap[HandleReportResultEnum.DELETE_CONTENT]}
              </Select.Option>
              <Select.Option value={HandleReportResultEnum.BAN_USER}>
                {HandleReportResultMap[HandleReportResultEnum.BAN_USER]}
              </Select.Option>
              <Select.Option value={HandleReportResultEnum.REJECTED}>
                {HandleReportResultMap[HandleReportResultEnum.REJECTED]}
              </Select.Option>
              <Select.Option value={HandleReportResultEnum.OTHER}>
                {HandleReportResultMap[HandleReportResultEnum.OTHER]}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="handleReason" label="处理理由" rules={[{ required: true, message: '请填写处理理由' }]}>
            <Input.TextArea rows={3} placeholder="请详细描述处理理由" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminReports;
