import React, { useState, useEffect } from 'react';
import { Video, Category } from '../../types';
import { videosApi } from '../../api/videos';
import { VideoCard } from '../../components/user/VideoCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { Video as VideoIcon, Play } from 'lucide-react';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, vids] = await Promise.all([
          videosApi.getCategories(),
          videosApi.getVideos({ categoryId: selectedCatId || undefined })
        ]);
        setCategories(cats);
        setVideos(vids.list || []);
      } catch {
        setVideos([]);
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
        allLabel="全部动效视频"
        allIcon={Play}
      />

      <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-xs space-y-2 bg-neutral-50 rounded-2xl border border-neutral-200">
            <VideoIcon className="w-10 h-10 mx-auto text-neutral-400" />
            <p className="font-semibold text-neutral-700">暂无该分类下的视频作品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((vid, idx) => (
              <VideoCard key={`vid-${vid.id ?? idx}-${idx}`} video={vid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
