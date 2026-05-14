import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import { CloseOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ColumnCard from '../../components/front/ColumnCard';
import InfiniteScrollContainer from '../../components/common/InfiniteScrollContainer';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { ColumnListVO } from '../../types/column';
import { normalizePageResponse } from '../../utils';
import { ROUTES } from '../../constants/routes';
import columnService from '../../services/columnService';

const ColumnListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const searchRef = useRef(debouncedKeyword);

  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);
    return () :void => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    searchRef.current = debouncedKeyword;
  }, [debouncedKeyword]);

  const fetcher = useCallback(async (pageNum: number, pageSize: number) => {
    const response = await columnService.getColumns({
      keyword: searchRef.current,
      pageNum,
      pageSize
    });

    if (response.code === 200 && response.data) {
      return normalizePageResponse<ColumnListVO>(response.data, pageNum, pageSize);
    }
    throw new Error(response.message || '获取专栏列表失败');
  }, []);

  const infiniteScroll = useInfiniteScroll<ColumnListVO>(fetcher, {
    pageSize,
    threshold: 0.1
  });

  const { refresh } = infiniteScroll;

  useEffect(() => {
    refresh();
  }, [debouncedKeyword, refresh]);

  const toggleSearch = (): void => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchKeyword('');
    }
  };

  const handleClearSearch = (): void => {
    setSearchKeyword('');
  };

  return (
    <>
      <Helmet>
        <title>专栏中心 - InkStage</title>
      </Helmet>
      <div className="flex min-h-screen flex-col bg-white dark:bg-gray-800 font-sans">
        <Header/>

        <main className="flex-1 py-6 px-[5%] bg-white dark:bg-gray-800">
          <div className="mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <p className="text-[16px] font-bold text-gray-500 dark:text-gray-400 mr-2">
                  发现优质专栏，开启深度阅读之旅
                </p>
                <span>
                  {isSearchVisible ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="搜索专栏..."
                        size={'middle'}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-48"
                        autoFocus
                        allowClear
                        onClear={handleClearSearch}
                      />
                      <span
                        onClick={toggleSearch}
                        className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <CloseOutlined/>
                      </span>
                    </div>
                  ) : (
                    <span
                      onClick={toggleSearch}
                      className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <SearchOutlined style={{ fontSize: '15px' }}/>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="solid" color="cyan" icon={<PlusOutlined/>}
                        onClick={() => navigate(ROUTES.CREATE_COLUMN)}>
                  创建专栏
                </Button>
              </div>
            </div>

            <InfiniteScrollContainer
              infiniteScroll={infiniteScroll}
              renderItem={(column) => <ColumnCard key={column.id} column={column}/>}
              emptyContent={
                <div className="text-center py-20">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">暂无相关专栏</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">试试其他关键词或分类</p>
                </div>
              }
              loadingContent={
                <div className="flex justify-center items-center py-20">
                  <Spin size="large"/>
                </div>
              }
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-10"
              itemGap="0"
            />
          </div>
        </main>

        <Footer/>
      </div>
    </>
  );
};

export default ColumnListPage;
