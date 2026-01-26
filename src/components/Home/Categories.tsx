import React, { useState } from 'react';

interface CategoriesProps {
  categories?: string[];
}

const Categories: React.FC<CategoriesProps> = ({ 
  categories = ['全部', '前端', '后端', '大数据', '人工智能', '移动开发', '云计算', '区块链', '物联网', 'DevOps', 'AI', '游戏开发', '技术分享'] 
}) => {
  const [showMore, setShowMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  // 显示的分类（默认显示前6个）
  const [displayCategories, setDisplayCategories] = useState<string[]>(categories.slice(0, 6));
  // 剩余的分类
  const [moreCategories, setMoreCategories] = useState<string[]>(categories.slice(6));
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-6 transition-all duration-300">
          {displayCategories.map((category) => (
            <span
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap transform ${selectedCategory === category ? 'bg-gray-100 text-gray-800 rounded-md scale-105' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {category}
            </span>
          ))}
        </div>
        
        {/* 更多分类按钮和下拉容器 */}
        {moreCategories.length > 0 && (
          <div className="relative inline-block group">
            {/* 更多分类按钮 */}
            <span
              onClick={() => setShowMore(!showMore)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap text-gray-600 hover:bg-gray-50`}
            >
              ...
            </span>
            
            {/* 下拉分类容器 */}
            {showMore && (
              <div 
                className="absolute left-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-sm py-1 min-w-[150px] z-20 transition-all duration-200 opacity-100 visible"
              >
                {moreCategories.map((category) => (
                  <span
                    key={category}
                    onClick={() => {
                      // 将点击的分类添加到显示列表的最后，替换掉原来的最后一个分类
                      const newDisplayCategories = [...displayCategories];
                      const removedCategory = newDisplayCategories.pop();
                      if (removedCategory) {
                        newDisplayCategories.push(category);
                        setDisplayCategories(newDisplayCategories);
                        // 将被替换的分类添加到更多分类列表
                        setMoreCategories([...moreCategories.filter(c => c !== category), removedCategory]);
                      }
                      setSelectedCategory(category);
                      setShowMore(false);
                    }}
                    className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${selectedCategory === category ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;