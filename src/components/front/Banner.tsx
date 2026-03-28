import React, { useRef } from 'react';
import Carousel, { type CarouselRef } from 'antd/es/carousel';
import type { BannerArticle } from '../../types/article';
import LazyImage from '../common/LazyImage';

interface BannerProps {
    articles?: BannerArticle[];
}

const Banner: React.FC<BannerProps> = ({
  articles = []
}) => {
  // 创建Carousel ref
  const carouselRef = useRef<CarouselRef>(null);

  return (
    <div className="relative overflow-hidden rounded-lg shadow-md group">
      {/* 动态渐变背景 */}
      <div
        className="absolute inset-0 bg-linear-to-r from-blue-500 via-purple-500 to-indigo-600 opacity-90 animate-gradient-x"></div>

      {/* 左侧切换按钮 */}
      <button
        className="absolute top-1/2 left-6 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 cursor-pointer"
        onClick={() => carouselRef.current?.prev()}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      {/* 右侧切换按钮 */}
      <button
        className="absolute top-1/2 right-6 transform -translate-y-1/2 w-14 h-14 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 cursor-pointer"
        onClick={() => carouselRef.current?.next()}
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* 轮播图 */}
      <Carousel
        ref={carouselRef}
        autoplay
        effect="fade"
        speed={1500}
        autoplaySpeed={5000}
      >
        {articles.map((article) => (
          <div key={article.id} className="relative aspect-16/3">
            {/* 封面图 */}
            <div className="absolute inset-0 overflow-hidden">
              <LazyImage
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover opacity-50"
              />
            </div>

            {/* 内容 */}
            <div className="relative px-[5%] py-12 md:py-16 text-white flex flex-col justify-center h-full">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 max-w-3xl leading-tight">
                <a
                  href={`/article/${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-200 transition-colors no-underline"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  {article.title}
                </a>
              </h2>
              <p className="text-sm md:text-base opacity-90 max-w-2xl leading-relaxed">
                {article.summary}
              </p>
              <div className="mt-6">
                <a
                  href={`/article/${article.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-white text-blue-600 font-medium rounded-full hover:bg-opacity-90 transition-all duration-300"
                >
                                    阅读全文
                </a>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;
