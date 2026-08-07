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
  Award,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers,
  UserCheck,
  FolderArchive,
  Plus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { creatorApi, CreatorStatsOverview, FollowerGrowth, ContentTrend } from '../../api/creator';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';

export const CreatorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<CreatorStatsOverview | null>(null);
  const [followerTrend, setFollowerTrend] = useState<FollowerGrowth[]>([]);
  const [contentTrend, setContentTrend] = useState<ContentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadStats();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (loading && !overview) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-900 text-white font-sans selection:bg-[#0057FF] selection:text-white overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
        </div>

        <div className="relative z-10 text-center space-y-4 bg-white rounded-2xl shadow-2xl p-8 border border-neutral-100 max-w-sm w-full mx-4 text-neutral-900">
          <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-600 uppercase tracking-widest font-semibold">正在载入创作者中心...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-neutral-900 text-white font-sans selection:bg-[#0057FF] selection:text-white overflow-hidden">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
        </div>

        <div className="relative z-10 text-center space-y-4 bg-white rounded-2xl shadow-2xl p-8 border border-neutral-100 max-w-sm w-full mx-4 text-neutral-900">
          <BarChart className="w-12 h-12 text-neutral-400 mx-auto" />
          <p className="text-sm text-neutral-700 font-bold">无法获取创作者数据，请稍后重试</p>
          <button 
            onClick={() => loadStats()}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            重试加载
          </button>
        </div>
      </div>
    );
  }

  const maxFollowers = Math.max(...followerTrend.map(f => f.newFollowers), 1);

  // 核心数据卡片配置 - 玻璃UI高质感风格
  const coreStats = [
    { 
      label: '累计作品浏览', 
      value: overview.totalViews, 
      icon: Eye, 
      accentColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border border-blue-500/30',
      badge: '+12.4% 近7日',
    },
    { 
      label: '收获点赞支持', 
      value: overview.totalLikes,
      icon: ThumbsUp, 
      accentColor: 'text-rose-400',
      bgColor: 'bg-rose-500/20 border border-rose-500/30',
      badge: '保持高互动',
    },
    { 
      label: '作品被收藏数', 
      value: overview.totalFavorites,
      icon: Bookmark, 
      accentColor: 'text-amber-400',
      bgColor: 'bg-amber-500/20 border border-amber-500/30',
      badge: '价值沉淀',
    },
    { 
      label: '关注粉丝总量', 
      value: overview.totalFollowers,
      icon: Users, 
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 border border-emerald-500/30',
      badge: '+8 增量',
    },
  ];

  // 作品分类统计配置
  const worksStats = [
    { label: '图文专栏', value: overview.totalArticles, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/20 border border-blue-500/30' },
    { label: '视频案例', value: overview.totalVideos, icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/20 border border-purple-500/30' },
    { label: '设计资源', value: overview.totalFiles, icon: FolderArchive, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border border-emerald-500/30' },
    { label: '作品总数', value: overview.totalArticles + overview.totalVideos + overview.totalFiles, icon: Award, color: 'text-amber-300', bg: 'bg-amber-500/20 border border-amber-500/30' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-[#0057FF] selection:text-white pb-20 overflow-x-hidden">
      {/* Background Image with Ambient Glow & Vignette */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105 pointer-events-none z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Top Header Bar & Branding (Glass UI) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/40 backdrop-blur-2xl border border-white/15 p-4 sm:px-6 sm:py-4 rounded-2xl text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white" title="返回首页">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-black font-extrabold px-2 py-0.5 text-xs rounded shadow-sm">LF</span>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none flex items-center gap-2">
                  LeapLunar04 创作者中心
                </h1>
                <p className="text-[11px] text-white/60 font-mono mt-0.5">CREATOR DASHBOARD & ANALYTICS</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => loadStats()}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="刷新所有统计数据"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>刷新数据</span>
            </button>

            <button
              onClick={() => navigate('/me/works')}
              className="px-4.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>作品管理</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2 bg-white hover:bg-neutral-100 text-neutral-900 rounded-full text-xs font-extrabold transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>发布新作品</span>
            </button>
          </div>
        </div>

        {/* Creator Hero Card - Frosted Glass Panel */}
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/15 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left: User Identity */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative group">
                <img
                  src={resolveImageUrl(user.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={user.nickName || user.username}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-white/20 shadow-2xl bg-neutral-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 p-1 bg-[#0057FF] text-white rounded-lg shadow-md ring-2 ring-black">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {user.nickName || user.username || '创作者'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                    <UserCheck className="w-3 h-3 text-blue-400" /> PRO CREATOR
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 max-w-lg line-clamp-1">
                  {user.signature || '欢迎来到创作工坊 · 实时作品表现与数据监控中心'}
                </p>

                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>数据同步正常</span>
                  </span>
                  <span>•</span>
                  <span>创作等级 Lv.4</span>
                  <span>•</span>
                  <span>UID: #{user.id}</span>
                </div>
              </div>
            </div>

            {/* Right: Creator Action Highlights */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-white/10 md:border-none pt-4 md:pt-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-neutral-200 text-black text-sm font-black rounded-full transition-all shadow-xl hover:scale-102 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>立即创作</span>
              </button>
            </div>
          </div>
        </div>

        {/* Core Stats Grid (Frosted Glass UI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {coreStats.map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-black/40 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 border border-white/15 hover:border-white/30 hover:bg-black/55 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${stat.bgColor} ${stat.accentColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight my-2">
                {stat.value.toLocaleString()}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px]">
                <span className="text-neutral-400 font-mono">至今汇总</span>
                <span className={`font-semibold flex items-center gap-1 ${stat.accentColor}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Creation Overview Section (Frosted Glass) */}
        <div className="bg-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/15 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center shadow-md">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">创作概览</h3>
                <p className="text-xs text-neutral-400">已公开发布的各类别创作成果汇总</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/me/works')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              管理我的全部作品 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {worksStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">TYPE</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color} font-mono mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-neutral-300 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Grid: Follower Growth & Release Rhythm (Frosted Glass) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Follower Growth Trend Chart */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/15 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">粉丝增长趋势</h3>
                <p className="text-xs text-neutral-400">近 30 天新增关注数据变动曲线</p>
              </div>
            </div>

            {followerTrend.length > 0 ? (
              <div className="h-60 flex items-end justify-between gap-2 pt-4 border-b border-white/10">
                {followerTrend.map((item, idx) => {
                  const heightPercent = Math.max((item.newFollowers / maxFollowers) * 100, 6);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 pointer-events-none">
                        <div className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap font-mono">
                          +{item.newFollowers}
                        </div>
                      </div>
                      <div
                        className="w-full bg-white/20 group-hover:bg-[#0057FF] rounded-t-lg transition-all cursor-pointer"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] text-neutral-400 font-mono truncate max-w-full mt-1">
                        {item.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-neutral-400">
                <div className="text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto opacity-30 text-white" />
                  <p className="text-xs text-neutral-400">暂无近期关注增长记录</p>
                </div>
              </div>
            )}
          </div>

          {/* Release Rhythm Analytics */}
          <div className="bg-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/15 flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">创作发布节奏</h3>
                <p className="text-xs text-neutral-400">近段时间各类作品产出轨迹</p>
              </div>
            </div>

            {contentTrend.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {contentTrend.slice(0, 10).map((item, idx) => {
                  const total = item.articles + item.videos + item.files;
                  return (
                    <div key={idx} className="bg-white/5 rounded-xl p-3.5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono font-bold text-neutral-300">{item.date}</span>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-white">{total} 项更新</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 h-5">
                        {item.articles > 0 && (
                          <div
                            className="bg-blue-500/80 rounded-md flex items-center justify-center text-white text-[10px] font-bold font-mono"
                            style={{ width: `${(item.articles / total) * 100}%` }}
                          >
                            {item.articles} 图文
                          </div>
                        )}
                        {item.videos > 0 && (
                          <div
                            className="bg-purple-500/80 rounded-md flex items-center justify-center text-white text-[10px] font-bold font-mono"
                            style={{ width: `${(item.videos / total) * 100}%` }}
                          >
                            {item.videos} 视频
                          </div>
                        )}
                        {item.files > 0 && (
                          <div
                            className="bg-emerald-500/80 rounded-md flex items-center justify-center text-white text-[10px] font-bold font-mono"
                            style={{ width: `${(item.files / total) * 100}%` }}
                          >
                            {item.files} 资源
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-neutral-400">
                <div className="text-center space-y-2">
                  <BarChart className="w-8 h-8 mx-auto opacity-30 text-white" />
                  <p className="text-xs text-neutral-400">暂无近期发布轨迹</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRO Creator Acceleration Banner (Frosted Glass Luxe Accent) */}
        <div className="bg-black/50 backdrop-blur-2xl border border-white/15 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">PRO 创作者影响力加速计划</h3>
              <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                保持每周至少发布 1 篇优质图文或设计资源，可获得首页“创作灵感”优先推荐权重及专属创作者标识认证。
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-black rounded-full transition-all shadow-lg cursor-pointer whitespace-nowrap active:scale-95 shrink-0 relative z-10"
          >
            立刻发布作品
          </button>
        </div>

        {/* Bottom Watermark - Consistent with LoginPage */}
        <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between text-white/80 text-xs gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
            <span className="bg-black text-white font-bold px-1.5 py-0.5 text-[10px] rounded">LF</span>
            <span className="font-semibold text-white">LeapLunar04 创作者中心</span>
          </div>
          <div className="flex items-center gap-4 text-white/60 font-mono text-[11px]">
            <span>CREATOR ENGINE v2.0</span>
            <span>•</span>
            <span>ANALYTICS & PUBLISHING</span>
          </div>
        </div>

      </div>

      {/* Create Work Modal */}
      <CreateWorkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadStats();
        }}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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


