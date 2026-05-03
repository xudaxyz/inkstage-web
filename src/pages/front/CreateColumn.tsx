import React, { useEffect, useState } from 'react';
import type { UploadFile } from 'antd';
import { Button, Card, Form, Input, message, Spin, Switch } from 'antd';
import { Helmet } from 'react-helmet-async';
import { MoonOutlined, SunOutlined, SwapLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppStore, useTheme, useUserStore } from '../../store';
import ColumnCoverUploader from '../../components/upload/ColumnCoverUploader';
import { ROUTES } from '../../constants/routes';
import columnService from '../../services/columnService';
import type { ColumnCreateDTO, MyColumnVO } from '../../types/column';

const CreateColumn: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme === 'dark';
  const { toggleTheme } = useAppStore();
  const [form] = Form.useForm();
  const [coverImage, setCoverImage] = useState<string>('');
  const [serverCoverImageUrl, setServerCoverImageUrl] = useState<string>('');
  const [, setFileList] = useState<UploadFile[]>([]);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { columnId } = useParams<{ columnId: string }>();
  const isEditMode = !!columnId;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const from = searchParams.get('from');

  // 确定返回的目标路径
  const getReturnPath = (): string => {
    return from === 'my' ? ROUTES.MY_COLUMNS : ROUTES.COLUMN_LIST;
  };

  // 切换主题模式
  const handleThemeToggle = (): void => {
    toggleTheme();
  };

  // 加载专栏详情
  useEffect(() => {
    const loadColumnDetail = async (id: number): Promise<void> => {
      try {
        setLoading(true);
        // 先使用我的专栏列表获取，找到对应的专栏
        const response = await columnService.getMyColumns();
        if (response.code === 200 && response.data) {
          const column = response.data.find((c: MyColumnVO) => c.id === id);
          if (column) {
            form.setFieldsValue({
              name: column.name,
              description: column.description
            });
            if (column.coverImage) {
              setCoverImage(column.coverImage);
              setServerCoverImageUrl(column.coverImage);
              setFileList([
                {
                  uid: Date.now().toString(),
                  name: 'cover-image.jpg',
                  status: 'done',
                  url: column.coverImage
                }
              ]);
            }
          }
        }
      } catch (err) {
        console.error('获取专栏详情失败:', err);
        message.error('获取专栏详情失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode && columnId) {
      loadColumnDetail(Number(columnId)).then();
    }
  }, [isEditMode, columnId, form]);

  // 处理表单提交
  const handleSubmit = async (values: ColumnCreateDTO): Promise<void> => {
    setIsSubmitting(true);
    try {
      let coverImageUrl = serverCoverImageUrl;

      if (croppedFile) {
        const uploadResult = await columnService.uploadColumnCoverImage(croppedFile);
        if (uploadResult.code === 200) {
          coverImageUrl = uploadResult.data;
          setCoverImage(uploadResult.data);
        } else {
          message.error('封面上传失败：' + uploadResult.message);
          setIsSubmitting(false);
          return;
        }
      }

      const columnData: ColumnCreateDTO = {
        name: values.name,
        description: values.description,
        coverImage: coverImageUrl || coverImage
      };

      if (isEditMode && columnId) {
        const response = await columnService.updateColumn(Number(columnId), columnData);
        if (response.code === 200 && response.data) {
          message.success('专栏更新成功！');
          navigate(getReturnPath());
        } else {
          message.error(response.message || '更新专栏失败');
        }
      } else {
        const response = await columnService.createColumn(columnData);
        if (response.code === 200 && response.data) {
          message.success('专栏创建成功！');
          navigate(getReturnPath());
        } else {
          message.error(response.message || '创建专栏失败');
        }
      }
    } catch (error) {
      console.error('提交专栏失败:', error);
      message.error(isEditMode ? '更新失败，请重试' : '创建失败，请重试');
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
        <header
          className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 md:px-[5%] sticky top-0 z-30 shadow-sm shrink-0">
          <div className="flex items-center">
            <span
              className="text-lg md:text-xl font-bold bg-linear-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-wide cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => navigate(ROUTES.HOME)}
            >
              InkStage
            </span>
            <span className="mx-1 md:mx-2 items-center text-sm md:text-base text-gray-400 hidden sm:block">\</span>
            <span
              className="text-sm md:text-base items-center font-medium text-gray-800 dark:text-gray-300 hidden sm:block">
              {isEditMode ? '编辑专栏' : '创建专栏'}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-5 ml-auto">
            <div className="flex items-center gap-2">
              {isDarkMode ? <MoonOutlined/> : <SunOutlined/>}
              <Switch checked={isDarkMode} onChange={handleThemeToggle} size="small" className="hidden sm:block"/>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                icon={<SwapLeftOutlined/>}
                onClick={() => navigate(getReturnPath())}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                size="middle"
              >
                <span className="hidden md:inline">返回专栏</span>
              </Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                loading={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
                size="middle"
              >
                <span className="hidden md:inline">{isEditMode ? '保存修改' : '创建专栏'}</span>
              </Button>
            </div>

            {user && (
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white">
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

        <div className="flex-1 px-[5%] bg-white dark:bg-gray-800">
          <Card
            variant="borderless"
            style={{
              backgroundColor: isDarkMode ? '#364153' : 'transparent'
            }}
          >
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Spin size="large"/>
              </div>
            )}
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ display: loading ? 'none' : 'block' }}>
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">简洁有力的简介能吸引更多读者关注</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专栏封面</label>
                <div className="flex flex-col gap-4">
                  {coverImage && (
                    <div className="max-w-2xl">
                      <img
                        src={coverImage}
                        alt="封面预览"
                        className="w-full aspect-video object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
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
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateColumn;
