import React, {useRef} from 'react';
import Carousel, {type CarouselRef} from 'antd/es/carousel';

interface BannerArticle {
    id: number;
    title: string;
    summary: string;
    coverImage: string;
}

interface BannerProps {
    articles?: BannerArticle[];
}

const Banner: React.FC<BannerProps> = ({
                                           articles = [
                                               {
                                                   id: 1,
                                                   title: 'React 19 新特性详解：并发渲染与服务器组件',
                                                   summary: '深入探索 React 19 带来的革命性变化，提升应用性能和开发体验',
                                                   coverImage: 'https://picsum.photos/id/1/1200/400'
                                               },
                                               {
                                                   id: 2,
                                                   title: 'TypeScript 5.9 实用技巧：提升代码质量与开发效率',
                                                   summary: '掌握 TypeScript 5.9 的高级特性，写出更安全、更可维护的代码',
                                                   coverImage: 'https://picsum.photos/id/20/1200/400'
                                               },
                                               {
                                                   id: 3,
                                                   title: 'Next.js 15 性能优化指南',
                                                   summary: '从代码优化到部署策略，全面提升 Next.js 应用的性能',
                                                   coverImage: 'https://picsum.photos/id/30/1200/400'
                                               }
                                           ]
                                       }) => {
    // 创建Carousel ref
    const carouselRef = useRef<CarouselRef>(null);

    return (
        <div className="relative mb-8 overflow-hidden rounded-lg shadow-md group">
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
                            <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover opacity-50"
                            />
                        </div>

                        {/* 内容 */}
                        <div className="relative px-[5%] py-12 md:py-16 text-white flex flex-col justify-center h-full">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 max-w-3xl leading-tight">
                                {article.title}
                            </h2>
                            <p className="text-sm md:text-base opacity-90 max-w-2xl leading-relaxed">
                                {article.summary}
                            </p>
                            <div className="mt-6">
                                <a
                                    href={`/article/${article.id}`}
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