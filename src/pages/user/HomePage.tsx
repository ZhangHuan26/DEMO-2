import React, { useState, useEffect } from 'react';
import { Article, Category } from '../../types';
import { articlesApi } from '../../api/articles';
import { ArticleCard } from '../../components/user/ArticleCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { Layers, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, arts] = await Promise.all([
          articlesApi.getCategories(),
          articlesApi.getArticles({ categoryId: selectedCatId || undefined })
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setArticles(Array.isArray(arts?.list) ? arts.list : Array.isArray(arts) ? arts : []);
      } catch {
        setCategories([]);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [selectedCatId]);

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      {/* Top Image Category Bar */}
      <CategoryImageBar
        categories={categories}
        selectedCatId={selectedCatId}
        onSelectCategory={setSelectedCatId}
        allLabel="全部图文作品"
        allIcon={Star}
      />

      <div className="max-w-[1700px] mx-auto px-4 lg:px-10 py-6 space-y-8">
        {/* Grid Canvas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-sm space-y-3 bg-neutral-50 rounded-2xl border border-neutral-200">
            <Layers className="w-12 h-12 mx-auto text-neutral-400" />
            <p className="font-bold text-base text-neutral-800">暂无该分类下的图文作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {articles.map((art, idx) => (
              <ArticleCard key={`home-art-${art.id ?? idx}-${idx}`} article={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
