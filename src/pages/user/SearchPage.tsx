import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, Video as VideoIcon, Folder, Users } from 'lucide-react';
import { searchApi } from '../../api/search';
import { Article, Video, FileItem, User } from '../../types';

import { ArticleCard } from '../../components/user/ArticleCard';
import { VideoCard } from '../../components/user/VideoCard';
import { FileCard } from '../../components/user/FileCard';
import { resolveImageUrl } from '../../config/env';


export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'files' | 'users'>('articles');
  const [results, setResults] = useState<{
    articles: Article[];
    videos: Video[];
    files: FileItem[];
    users: User[];
  }>({ articles: [], videos: [], files: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    const doSearch = async () => {
      setLoading(true);
      try {
        const res = await searchApi.globalSearch(query);

        setResults(res);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [query]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 lg:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-[#0057FF]" />
          搜索关键词: <span className="text-[#0057FF]">"{query}"</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'articles' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" /> 图文作品 ({results.articles.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'videos' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <VideoIcon className="w-4 h-4" /> 视频动效 ({results.videos.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'files' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Folder className="w-4 h-4" /> 设计资源 ({results.files.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" /> 创作者 ({results.users.length})
        </button>
      </div>

      {/* Tab Results */}
      {loading ? (
        <div className="py-20 text-center text-sm text-neutral-500">正在全站检索中...</div>
      ) : activeTab === 'articles' ? (
        results.articles.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">未检索到匹配的图文作品</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.articles.map((a, idx) => (
              <ArticleCard key={`search-art-${a.id ?? idx}-${idx}`} article={a} />
            ))}
          </div>
        )
      ) : activeTab === 'videos' ? (
        results.videos.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">未检索到匹配的视频动效</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.videos.map((v, idx) => (
              <VideoCard key={`search-vid-${v.id ?? idx}-${idx}`} video={v} />
            ))}
          </div>
        )
      ) : activeTab === 'files' ? (
        results.files.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">未检索到匹配的设计资源</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.files.map((f, idx) => (
              <FileCard key={`search-file-${f.id ?? idx}-${idx}`} file={f} />
            ))}
          </div>
        )
      ) : (
        results.users.length === 0 ? (
          <div className="py-20 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">未检索到匹配的创作者</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.users.map((u, idx) => (
              <Link
                key={`search-user-${u.id ?? idx}-${idx}`}
                to={`/users/${u.id}`}
                className="p-4 bg-white border border-neutral-200 rounded-2xl flex items-center gap-3 hover:border-neutral-300 hover:shadow-xl transition-all"
              >
                <img src={resolveImageUrl(u.avatar)} alt={u.nickName} className="w-12 h-12 rounded-full object-cover border border-neutral-200" />

                <div>
                  <div className="font-bold text-neutral-900 text-sm">{u.nickName}</div>
                  <div className="text-xs text-neutral-500">{u.signature || '社区创作者'}</div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};
