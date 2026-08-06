import React, { useState, useEffect } from 'react';
import { Eye, ThumbsUp, Bookmark, Users, TrendingUp, BarChart, Layers } from 'lucide-react';
import { CreatorStats } from '../../types';
import { adminApi } from '../../api/admin';

export const CreatorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  // 24.2 粉丝增长趋势（近30天）
  const [followerTrend, setFollowerTrend] = useState<{ date: string; newFollowers: number }[]>([]);
  // 24.3 内容产出趋势
  const [contentTrend, setContentTrend] = useState<{ date: string; articles: number; videos: number; files: number }[]>([]);
  // 24.4 获赞与收藏统计（当前时刻快照）
  const [favoriteStats, setFavoriteStats] = useState<{ totalLikes: number; totalFavorites: number }>({ totalLikes: 0, totalFavorites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // 24.1 总览
        const data = await adminApi.getCreatorStats();
        setStats(data);
        // 24.2 粉丝增长趋势
        const ft = await adminApi.getFollowerTrend('30d');
        setFollowerTrend(Array.isArray(ft) ? ft : []);
        // 24.3 内容产出趋势
        const ct = await adminApi.getContentTrend();
        setContentTrend(Array.isArray(ct) ? ct : []);
        // 24.4 获赞与收藏统计
        const fav = await adminApi.getFavoriteStats();
        setFavoriteStats(fav || { totalLikes: 0, totalFavorites: 0 });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);


  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-sm text-neutral-500">正在加载创作者数据看板...</div>;
  }

  if (!stats) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-sm text-neutral-500">无法获取数据统计。</div>;
  }

  return (
    <div className="w-full px-[20px] py-8 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0057FF]" />
          创作者数据中心
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-2 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase">
            <span>总浏览量</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">{stats.totalViews.toLocaleString()}</div>
          <span className="text-xs text-emerald-500 font-mono">↑ 较上周增长 12.4%</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-2 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase">
            <span>总获赞数</span>
            <ThumbsUp className="w-4 h-4 text-[#0057FF]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">{stats.totalLikes.toLocaleString()}</div>
          <span className="text-xs text-emerald-500 font-mono">↑ 较上周增长 8.2%</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-2 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase">
            <span>总被收藏</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">{stats.totalFavorites.toLocaleString()}</div>
          <span className="text-xs text-emerald-500 font-mono">↑ 较上周增长 15.0%</span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-2 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between text-neutral-600 text-xs font-semibold uppercase">
            <span>总粉丝数</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-neutral-900 font-mono">{stats.totalFollowers.toLocaleString()}</div>
          <span className="text-xs text-emerald-500 font-mono">今日新增 18 位关注</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Followers Growth */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 hover:shadow-xl transition-all">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> 粉丝增长趋势 (近30天)
          </h3>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-neutral-200">
            {stats.followerGrowth.map((g, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs text-neutral-600 font-mono">{g.count}</span>
                <div
                  className="w-full bg-[#0057FF] rounded-t-lg transition-all hover:bg-[#0046CC]"
                  style={{ height: `${(g.count / 1300) * 100}%` }}
                />
                <span className="text-xs text-neutral-500 font-mono">{g.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Distribution */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 hover:shadow-xl transition-all">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-purple-500" /> 创作分布与作品数
          </h3>

          <div className="space-y-4 pt-4">
            {stats.contentDistribution.map((cd, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-700">
                  <span>{cd.category}</span>
                  <span className="font-mono font-bold text-neutral-900">{cd.count} 个作品</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0057FF] to-purple-500 rounded-full"
                    style={{ width: `${(cd.count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
