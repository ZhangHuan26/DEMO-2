import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  Users, 
  TrendingUp, 
  BarChart, 
  FileText, 
  Video, 
  Folder,
  MessageCircle,
  Award,
  Zap,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0057FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-600 font-semibold">加载数据中心...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart className="w-16 h-16 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-600">无法加载统计数据</p>
        </div>
      </div>
    );
  }

  const maxFollowers = Math.max(...followerTrend.map(f => f.newFollowers), 1);

  // 核心数据卡片配置
  const coreStats = [
    { 
      label: '总浏览量', 
      value: overview.totalViews,
      icon: Eye, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-500'
    },
    { 
      label: '总获赞数', 
      value: overview.totalLikes,
      icon: ThumbsUp, 
      color: 'from-rose-500 to-rose-600',
      bgColor: 'from-rose-50 to-rose-100',
      textColor: 'text-rose-600',
      iconBg: 'bg-rose-500'
    },
    { 
      label: '总收藏数', 
      value: overview.totalFavorites,
      icon: Bookmark, 
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-500'
    },
    { 
      label: '粉丝总数', 
      value: overview.totalFollowers,
      icon: Users, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500'
    },
  ];

  // 作品统计配置
  const worksStats = [
    { label: '图文作品', value: overview.totalArticles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '视频作品', value: overview.totalVideos, icon: Video, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: '设计资源', value: overview.totalFiles, icon: Folder, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '作品总数', value: overview.totalWorks, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/20 to-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0057FF] to-blue-600 flex items-center justify-center shadow-lg shadow-[#0057FF]/30">
                <BarChart className="w-7 h-7 text-white" />
              </div>
              创作者数据中心
            </h1>
            <p className="text-sm text-neutral-600">实时查看您的作品表现和影响力数据</p>
          </div>
        </div>

        {/* 核心数据卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreStats.map((stat, idx) => (
            <div 
              key={idx} 
              className="group bg-white border border-neutral-200/60 rounded-2xl p-6 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300 relative overflow-hidden"
            >
              {/* 背景装饰 */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgColor} opacity-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className={`text-4xl font-black font-mono ${stat.textColor} mb-2`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>持续增长中</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 作品统计 */}
        <div className="bg-white border border-neutral-200/60 rounded-3xl shadow-xl shadow-neutral-200/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">作品统计</h2>
              <p className="text-xs text-neutral-500">各类型作品数量分布</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {worksStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center p-6 bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-200/50 hover:shadow-lg transition-all group"
              >
                <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-black ${stat.color} font-mono mb-2`}>
                  {stat.value}
                </div>
                <div className="text-xs text-neutral-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 粉丝增长趋势 */}
          <div className="bg-white border border-neutral-200/60 rounded-3xl shadow-xl shadow-neutral-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">粉丝增长趋势</h2>
                <p className="text-xs text-neutral-500">近30天粉丝增长情况</p>
              </div>
            </div>

            {followerTrend.length > 0 ? (
              <div className="h-72 flex items-end justify-between gap-1.5 pt-4 border-b-2 border-neutral-200">
                {followerTrend.map((item, idx) => {
                  const heightPercent = Math.max((item.newFollowers / maxFollowers) * 100, 3);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                          +{item.newFollowers}
                        </div>
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 rounded-t-xl transition-all hover:from-emerald-600 hover:via-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] text-neutral-500 font-mono font-semibold truncate max-w-full rotate-45 mt-2">
                        {item.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无粉丝增长数据</p>
                </div>
              </div>
            )}
          </div>

          {/* 内容产出趋势 */}
          <div className="bg-white border border-neutral-200/60 rounded-3xl shadow-xl shadow-neutral-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">内容产出趋势</h2>
                <p className="text-xs text-neutral-500">最近发布的作品统计</p>
              </div>
            </div>

            {contentTrend.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {contentTrend.slice(0, 10).map((item, idx) => {
                  const total = item.articles + item.videos + item.files;
                  return (
                    <div key={idx} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/50 hover:border-neutral-300 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono font-semibold text-neutral-600">{item.date}</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-neutral-900">{total} 个作品</span>
                        </div>
                      </div>
                      <div className="flex gap-2 h-8">
                        {item.articles > 0 && (
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md group-hover:scale-105"
                            style={{ width: `${(item.articles / total) * 100}%` }}
                          >
                            {item.articles}文
                          </div>
                        )}
                        {item.videos > 0 && (
                          <div
                            className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:from-rose-600 hover:to-rose-700 transition-all shadow-md group-hover:scale-105"
                            style={{ width: `${(item.videos / total) * 100}%` }}
                          >
                            {item.videos}视
                          </div>
                        )}
                        {item.files > 0 && (
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md group-hover:scale-105"
                            style={{ width: `${(item.files / total) * 100}%` }}
                          >
                            {item.files}文件
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-neutral-400">
                <div className="text-center">
                  <BarChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无内容产出数据</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 数据洞察提示 */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">数据洞察</h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                您的内容正在持续增长！继续创作优质作品，与粉丝互动，您的影响力将不断提升。
                建议定期查看数据趋势，优化创作方向，创造更多价值。
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
