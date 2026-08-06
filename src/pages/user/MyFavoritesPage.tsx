import React, { useState, useEffect } from 'react';
import { Bookmark, FileText, Video as VideoIcon, Folder } from 'lucide-react';
import { Article, Video, FileItem } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';

export const MyFavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'files'>('articles');
  const [favArticles, setFavArticles] = useState<Article[]>([]);
  const [favVideos, setFavVideos] = useState<Video[]>([]);
  const [favFiles, setFavFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-bold text-neutral-900">请先登录</h2>
          <p className="text-sm text-neutral-600">您需要登录后才能查看收藏夹</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-full hover:bg-[#0046CC] transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadFavs = async () => {
      setLoading(true);
      try {
        const [arts, vids, fls] = await Promise.all([
          articlesApi.getFavoriteArticles(),
          videosApi.getFavoriteVideos(),
          filesApi.getFavoriteFiles()
        ]);
        setFavArticles(arts);
        setFavVideos(vids);
        setFavFiles(fls);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadFavs();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="border-b border-neutral-200 pb-4 flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h1 className="text-xl font-bold text-neutral-900">我的收藏夹</h1>
      </div>

      <div className="flex border-b border-neutral-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'articles' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" /> 收藏的文章 ({favArticles.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'videos' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <VideoIcon className="w-4 h-4" /> 收藏的动效 ({favVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'files' ? 'border-[#0057FF] text-[#0057FF] font-bold' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Folder className="w-4 h-4" /> 收藏的资源 ({favFiles.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500">正在加载收藏夹...</div>
      ) : activeTab === 'articles' ? (
        favArticles.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无收藏的文章作品</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favArticles.map((a, idx) => <ArticleCard key={`fav-art-${a.id ?? idx}-${idx}`} article={a} />)}
          </div>
        )
      ) : activeTab === 'videos' ? (
        favVideos.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无收藏的动效视频</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favVideos.map((v, idx) => <VideoCard key={`fav-vid-${v.id ?? idx}-${idx}`} video={v} />)}
          </div>
        )
      ) : (
        favFiles.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无收藏的资源文件</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favFiles.map((f, idx) => <FileCard key={`fav-file-${f.id ?? idx}-${idx}`} file={f} />)}
          </div>
        )
      )}
    </div>
  );
};
