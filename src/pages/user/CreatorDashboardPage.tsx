import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Bookmark, Users, TrendingUp, BarChart, FileText, Video, Folder } from 'lucide-react';
import { creatorApi, CreatorStatsOverview, FollowerGrowth, ContentTrend } from '../../api/creator';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CreatorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<CreatorStatsOverview | null>(null);
  const [followerTrend, setFollowerTrend] = useState<FollowerGrowth[]>([]);
  const [contentTrend, setContentTrend] = useState<ContentTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        // 并行加载所有数据
        const [overviewData, followerData, contentData] = await Promise.all([
          creatorApi.getOverview(),
          creatorApi.getFollowerTrend('30d'),
          creatorApi.getContentTrend()
        ]);

        setOverview(overviewData);
        setFollowerTrend(followerData);
        setContentTrend(contentData);
      } catch (error) {
        console.error('Failed to load creator stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user, navigate]);

  if (!user) {
    return null;
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-600 font-medium">正在加载创作者数据...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-6xl">📊</div>
          <p className="text-sm text-neutral-600">无法加载统计数据</p>
        </div>
      </div>
    );
  }

  // 计算粉丝增长趋势的最大值（用于柱状图比例）
  const maxFollowers = Math.max(...followerTrend.map(f => f.newFollowers), 1);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-4">
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#0057FF]" />
            创作者数据中心
          </h1>
          <p className="text-sm text-neutral-600 mt-2">查看您的作品表现和粉丝增长趋势</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600 uppercase">总浏览量</span>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 font-mono">
              {overview.totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              所有作品的累计浏览次数
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600 uppercase">总获赞数</span>
              <ThumbsUp className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 font-mono">
              {overview.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              所有作品的累计点赞数
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600 uppercase">总收藏数</span>
              <Bookmark className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 font-mono">
              {overview.totalFavorites.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              所有作品的累计收藏数
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600 uppercase">粉丝总数</span>
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-neutral-900 font-mono">
              {overview.totalFollowers.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-500">
              关注您的用户总数
            </div>
          </div>
        </div>

        {/* Works Overview */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-[#0057FF]" />
            作品统计
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <FileText className="w-8 h-8 text-[#0057FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#0057FF]">
                {overview.totalArticles}
              </div>
              <div className="text-xs text-neutral-600 mt-1">图文作品</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <Video className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">
                {overview.totalVideos}
              </div>
              <div className="text-xs text-neutral-600 mt-1">视频作品</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <Folder className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {overview.totalFiles}
              </div>
              <div className="text-xs text-neutral-600 mt-1">设计资源</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <BarChart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {overview.totalWorks}
              </div>
              <div className="text-xs text-neutral-600 mt-1">作品总数</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Followers Growth */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              粉丝增长趋势 (近30天)
            </h3>

            {followerTrend.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2 border-b border-neutral-200">
                {followerTrend.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs text-neutral-600 font-mono">
                      {item.newFollowers}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                      style={{
                        height: `${Math.max((item.newFollowers / maxFollowers) * 100, 2)}%`,
                        minHeight: item.newFollowers > 0 ? '8px' : '2px'
                      }}
                    />
                    <span className="text-[10px] text-neutral-500 font-mono truncate max-w-full">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
                暂无粉丝增长数据
              </div>
            )}
          </div>

          {/* Content Trend */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-purple-500" />
              内容产出趋势
            </h3>

            {contentTrend.length > 0 ? (
              <div className="space-y-4">
                {contentTrend.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600 font-mono">{item.date}</span>
                      <span className="text-neutral-900 font-bold">
                        共 {item.articles + item.videos + item.files} 个作品
                      </span>
                    </div>
                    <div className="flex gap-2 h-6">
                      {item.articles > 0 && (
                        <div
                          className="bg-[#0057FF] rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ width: `${(item.articles / (item.articles + item.videos + item.files)) * 100}%` }}
                        >
                          {item.articles}文
                        </div>
                      )}
                      {item.videos > 0 && (
                        <div
                          className="bg-emerald-500 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ width: `${(item.videos / (item.articles + item.videos + item.files)) * 100}%` }}
                        >
                          {item.videos}视
                        </div>
                      )}
                      {item.files > 0 && (
                        <div
                          className="bg-amber-500 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ width: `${(item.files / (item.articles + item.videos + item.files)) * 100}%` }}
                        >
                          {item.files}文件
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
                暂无内容产出数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
