import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { resolveImageUrl } from '../../config/env';


interface CategoryItem {
  id: number;
  name: string;
  coverImage?: string;
}

interface CategoryImageBarProps {
  categories: CategoryItem[];
  selectedCatId: number | null;
  onSelectCategory: (id: number | null) => void;
  allLabel?: string;
  allIcon?: React.ElementType;
}


export const CategoryImageBar: React.FC<CategoryImageBarProps> = ({
  categories,
  selectedCatId,
  onSelectCategory,
  allLabel = '全部分类',
  allIcon: AllIcon = Star,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [categories]);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleItemClick = (catId: number | null, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(catId);
    if (e.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  };

  const allItems = [
    {
      id: null,
      name: allLabel,
      isAll: true,
      coverImage: '',
    },
    ...(Array.isArray(categories) ? categories : []).map((c) => ({
      id: c.id,
      name: c.name,
      isAll: false,
      coverImage: c.coverImage || '',
    })),
  ];

  return (
    <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 py-3.5 px-[20px] shadow-xs">
      <div className="w-full relative group/nav">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => scrollByAmount('left')}
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-800 shadow-lg border border-neutral-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="向左滚动"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-3.5 -mx-1"
        >
          {allItems.map((cat, idx) => {
            const isSelected = selectedCatId === cat.id;

            return (
              <button
                key={`cat-pill-${cat.id ?? 'all'}-${idx}`}
                onClick={(e) => handleItemClick(cat.id, e)}
                className={`h-14 px-4.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 relative overflow-hidden group/item transition-all duration-300 border select-none ${
                  isSelected
                    ? 'border-[#0057FF] ring-2 ring-[#0057FF] ring-offset-2 scale-[1.03] shadow-md'
                    : 'border-white/20 hover:scale-[1.02] opacity-90 hover:opacity-100 shadow-2xs'
                }`}
                style={{
                  backgroundImage: cat.isAll && isSelected
                    ? 'linear-gradient(135deg, #0057FF 0%, #3B82F6 100%)'
                    : `url(${resolveImageUrl(cat.coverImage)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}

              >
                {/* Dark Overlay Gradient */}
                <div
                  className={`absolute inset-0 transition-colors ${
                    isSelected
                      ? cat.isAll
                        ? 'bg-transparent'
                        : 'bg-black/45 group-hover/item:bg-black/35'
                      : 'bg-black/55 group-hover/item:bg-black/40'
                  }`}
                />

                {/* Label */}
                <div className="relative z-10 flex items-center gap-2 text-white">
                  {cat.isAll && AllIcon && (
                    <AllIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-white'}`} />
                  )}
                  <span className="text-sm font-bold tracking-wide whitespace-nowrap drop-shadow-sm">
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => scrollByAmount('right')}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 text-neutral-800 shadow-lg border border-neutral-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="向右滚动"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
