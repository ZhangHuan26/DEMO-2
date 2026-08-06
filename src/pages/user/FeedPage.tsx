import React, { useState, useEffect } from 'react';
import { Article, Video, FileItem } from '../../types';
import { feedApi, FeedType } from '../../api/feed';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
import { Heart, FileText, Play, FolderOpen } from 'lucide-react';

type TabKey = 'article' | 'video' | 'file';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'article', label: '文章动态', icon: <FileText className="w-4 h-4" /> },
  { key: 'video', label: '视频动态', icon: <Play className="w-4 h-4" /> },
  { key: 'file', label: '文件动态', icon: <FolderOpen className="w-4 h-4" /> },
];

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('article');
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        // GET /feed 泛化接口，按 type 切换三类关注动态
        const [art, vid, fil] = await Promise.all([
          feedApi.getFeed('article'),
          feedApi.getFeed('video'),
          feedApi.getFeed('file'),
        ]);
        setArticles(Array.isArray(art) ? art : []);
        setVideos(Array.isArray(vid) ? vid : []);
        setFiles(Array.isArray(fil) ? fil : []);
      } catch {
        setArticles([]);
        setVideos([]);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  const currentList = activeTab === 'article' ? articles : activeTab === 'video' ? videos : files;

  return (
    <div className="w-full px-[20px] py-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-4">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        <h1 className="text-lg font-bold text-neutral-900">已关注创作者动态</h1>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#0057FF] text-white shadow-md shadow-[#0057FF]/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-72 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-24 text-center text-neutral-600 text-sm bg-neutral-50 rounded-2xl border border-neutral-200">
          您关注的创作者暂无最新{activeTab === 'article' ? '文章' : activeTab === 'video' ? '视频' : '文件'}发布，去关注更多优秀创作者吧！
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {activeTab === 'article' &&
            articles.map((art, idx) => (
              <ArticleCard key={`feed-art-${art.id ?? idx}-${idx}`} article={art} />
            ))}
          {activeTab === 'video' &&
            videos.map((vid, idx) => (
              <VideoCard key={`feed-vid-${vid.id ?? idx}-${idx}`} video={vid} />
            ))}
          {activeTab === 'file' &&
            files.map((fil, idx) => (
              <FileCard key={`feed-file-${fil.id ?? idx}-${idx}`} file={fil} />
            ))}
        </div>
      )}
    </div>
  );
};
