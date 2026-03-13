import React, {useState} from 'react';
import type {FrontendCategory} from '../../services/categoryService.ts';

interface CategoriesProps {
    categories?: FrontendCategory[];
    onSelect?: (category: FrontendCategory | '全部') => void;
    selectedId?: number | undefined;
}

const Categories: React.FC<CategoriesProps> = ({
                                                   categories = [],
                                                   onSelect,
                                                   selectedId = 0 // 默认全部分类
                                               }) => {
    const allCategories = React.useMemo(() => [
        {id: 0, name: '全部'},
        ...categories
    ], [categories]);
    const [showMore, setShowMore] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('全部');
    // 显示的分类（默认显示前6个）
    const [displayCategories, setDisplayCategories] = useState<FrontendCategory[]>();
    // 剩余的分类
    const [moreCategories, setMoreCategories] = useState<FrontendCategory[]>();

    // 当 allCategories 变化时，更新 displayCategories 和 moreCategories
    React.useEffect(() => {
        setDisplayCategories(allCategories);
        setMoreCategories(allCategories.slice(7));
    }, [allCategories]);

    // 当 selectedId 变化时，更新 selectedCategory 状态
    React.useEffect(() => {
        const category = allCategories.find(c => c.id === selectedId) || allCategories[0];
        setSelectedCategory(category.name);
    }, [selectedId, allCategories]);

    // 处理分类选择
    const handleCategorySelect = (category: FrontendCategory) => {
        setSelectedCategory(category.name);
        if (onSelect) {
            onSelect(category.id === 0 ? '全部' : category);
        }
    };

    return (
        <div className="mt-4 mb-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-6 transition-all duration-300">
                    {displayCategories?.map((category) => (
                        <span
                            key={category.id}
                            onClick={() => handleCategorySelect(category)}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap transform ${selectedCategory === category.name ? 'bg-gray-100 text-gray-800 rounded-md scale-105' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {category.name}
                        </span>
                    ))}
                </div>

                {/* 更多分类按钮和下拉容器 */}
                {moreCategories !== undefined && moreCategories.length > 0 && (
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
                                        key={category.id}
                                        onClick={() => {
                                            // 将点击的分类添加到显示列表的最后，替换掉原来的最后一个分类
                                            const newDisplayCategories = [...(displayCategories || []), category];
                                            const removedCategory = newDisplayCategories.pop();
                                            if (removedCategory) {
                                                newDisplayCategories.push(category);
                                                setDisplayCategories(newDisplayCategories);
                                                // 将被替换的分类添加到更多分类列表
                                                setMoreCategories([...moreCategories.filter(c => c.id !== category.id), removedCategory]);
                                            }
                                            handleCategorySelect(category);
                                            setShowMore(false);
                                        }}
                                        className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${selectedCategory === category.name ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {category.name}
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