import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Activity,
  Hash,
  Sparkles,
  Pencil,
  Key,
  Info,
  Bookmark,
  ArrowLeft,
  BadgeCheck,
  CircleUser,
  AtSign,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Settings,
  CheckCircle2,
  XCircle,
  Layers,
  Folder,
  User as UserIcon,
  Users,
  UserPlus,
} from 'lucide-react';

import { User } from '../../types';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../config/env';
import { FollowerModal } from '../../components/common/FollowerModal';

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerModalOpen, setFollowerModalOpen] = useState(false);
  const [followerModalTab, setFollowerModalTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const me = await authApi.getMySummary();
        setProfile(me);
      } catch {
        if (contextUser) {
          setProfile(contextUser);
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [contextUser]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0057FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-neutral-600">加载个人信息中...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center gap-4">
        <UserIcon className="w-16 h-16 text-neutral-300" />
        <p className="text-lg font-bold text-neutral-800">未获取到个人信息</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-full text-sm transition-all cursor-pointer shadow-lg shadow-[#0057FF]/20"
        >
          请先登录
        </button>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return '未设置';
    try {
      return new Date(date).toLocaleDateString('zh-CN');
    } catch {
      return date;
    }
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '未记录';
    try {
      return new Date(date).toLocaleString('zh-CN');
    } catch {
      return date;
    }
  };

  const genderText = profile.gender === 1 ? '男' : profile.gender === 2 ? '女' : '保密';
  const roleText = profile.role === 1 ? '管理员' : '普通用户';
  const statusText = profile.status === 0 ? '正常' : '已冻结';

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-neutral-50">
      {/* 顶部返回按钮 */}
      <div className="border-b border-neutral-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <BadgeCheck className="w-4 h-4 text-[#0057FF]" />
            <span>个人信息档案</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 头像和基本信息卡片 */}
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-200/60 overflow-hidden mb-8">
          {/* 顶部渐变背景 */}
          <div className="h-32 bg-gradient-to-br from-[#0057FF] via-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          </div>

          {/* 头像和名称 */}
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                  <img
                    src={resolveImageUrl(profile.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                    alt={profile.nickName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${
                  profile.status === 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {profile.status === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl font-black text-neutral-900">
                    {profile.nickName}
                  </h1>
                  {profile.role === 1 ? (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      管理员
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold border border-neutral-200">
                      普通用户
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile.status === 0 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {statusText}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 font-mono mb-3">
                  @{profile.username || profile.nickName} • UID #{profile.id}
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="px-5 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-sm font-bold rounded-full transition-all cursor-pointer shadow-lg shadow-[#0057FF]/20 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  编辑资料
                </button>
              </div>
            </div>

            {/* 个性签名 */}
            {profile.signature && (
              <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  "{profile.signature}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 主要信息区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：账号基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 账号详细信息 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/60 p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-200">
                <Key className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-bold text-neutral-900">账号信息</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Hash className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">用户 ID</div>
                    <div className="text-sm font-bold text-neutral-900 font-mono">#{profile.id}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <AtSign className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">用户名</div>
                    <div className="text-sm font-bold text-neutral-900 truncate">{profile.username || '未设定'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Sparkles className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">显示昵称</div>
                    <div className="text-sm font-bold text-neutral-900 truncate">{profile.nickName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Mail className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">邮箱地址</div>
                    <div className="text-sm font-bold text-neutral-900 truncate" title={profile.email}>
                      {profile.email || '未设置'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Phone className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">手机号码</div>
                    <div className="text-sm font-bold text-neutral-900">{profile.phone || '未设置'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Info className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">性别</div>
                    <div className="text-sm font-bold text-neutral-900">{genderText}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Calendar className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">出生日期</div>
                    <div className="text-sm font-bold text-neutral-900">{formatDate(profile.birthday)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <ShieldCheck className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">账号角色</div>
                    <div className="text-sm font-bold text-neutral-900">{roleText}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 账号时间信息 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/60 p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-200">
                <RefreshCw className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-bold text-neutral-900">时间记录</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Calendar className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">注册时间</div>
                    <div className="text-xs font-semibold text-neutral-900 font-mono">{formatDateTime(profile.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <Activity className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">最后登录</div>
                    <div className="text-xs font-semibold text-neutral-900 font-mono">{formatDateTime(profile.lastLoginAt)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-50">
                  <RefreshCw className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-neutral-500 font-medium mb-1">资料更新</div>
                    <div className="text-xs font-semibold text-neutral-900 font-mono">{formatDateTime(profile.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 冻结信息（如有） */}
            {profile.status === 1 && (
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl shadow-lg border-2 border-rose-200 p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-rose-900">账号冻结信息</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-rose-700 font-medium">冻结原因</span>
                    <span className="text-sm font-bold text-rose-900">{profile.frozenReason || '未提供'}</span>
                  </div>
                  <div className="flex items-start justify-between p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-rose-700 font-medium">冻结时间</span>
                    <span className="text-xs font-mono font-semibold text-rose-900">{formatDateTime(profile.frozenAt)}</span>
                  </div>
                  <div className="flex items-start justify-between p-3 bg-white/60 rounded-lg">
                    <span className="text-sm text-rose-700 font-medium">操作管理员</span>
                    <span className="text-sm font-mono font-semibold text-rose-900">
                      {profile.frozenBy ? `管理员 #${profile.frozenBy}` : '未记录'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：快捷入口 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 粉丝和关注数据卡片 */}
            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/60 p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-200">
                <Users className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-bold text-neutral-900">社交数据</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setFollowerModalTab('followers');
                    setFollowerModalOpen(true);
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 transition-all text-center cursor-pointer group"
                >
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-blue-600 font-mono mb-1">
                    {profile.followerCount ?? 0}
                  </div>
                  <div className="text-xs font-semibold text-neutral-700">粉丝</div>
                </button>

                <button
                  onClick={() => {
                    setFollowerModalTab('following');
                    setFollowerModalOpen(true);
                  }}
                  className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200/50 transition-all text-center cursor-pointer group"
                >
                  <UserPlus className="w-6 h-6 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-black text-emerald-600 font-mono mb-1">
                    {profile.followingCount ?? 0}
                  </div>
                  <div className="text-xs font-semibold text-neutral-700">关注</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-200/60 p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-200">
                <CircleUser className="w-5 h-5 text-[#0057FF]" />
                <h2 className="text-lg font-bold text-neutral-900">快捷入口</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/me/works')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200/50 transition-all text-left cursor-pointer group"
                >
                  <Layers className="w-5 h-5 text-[#0057FF] mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">我的作品</div>
                  <div className="text-xs text-neutral-600 mt-1">管理全部作品</div>
                </button>

                <button
                  onClick={() => navigate('/creator')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200/50 transition-all text-left cursor-pointer group"
                >
                  <BarChart3 className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">创作者中心</div>
                  <div className="text-xs text-neutral-600 mt-1">查看数据统计</div>
                </button>

                <button
                  onClick={() => navigate('/me/favorites')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-200/50 transition-all text-left cursor-pointer group"
                >
                  <Bookmark className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">我的收藏</div>
                  <div className="text-xs text-neutral-600 mt-1">收藏的内容</div>
                </button>

                <button
                  onClick={() => navigate('/me/files')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200/50 transition-all text-left cursor-pointer group"
                >
                  <Folder className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">我的资源</div>
                  <div className="text-xs text-neutral-600 mt-1">上传的文件</div>
                </button>

                <button
                  onClick={() => navigate('/me/appeals')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border border-rose-200/50 transition-all text-left cursor-pointer group"
                >
                  <ShieldAlert className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">申诉记录</div>
                  <div className="text-xs text-neutral-600 mt-1">查看我的申诉</div>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-200 border border-neutral-200/50 transition-all text-left cursor-pointer group"
                >
                  <Settings className="w-5 h-5 text-neutral-600 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-neutral-900">账号设置</div>
                  <div className="text-xs text-neutral-600 mt-1">修改密码与资料</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 粉丝/关注列表弹窗 */}
      {profile && (
        <FollowerModal
          isOpen={followerModalOpen}
          userId={profile.id}
          initialTab={followerModalTab}
          onClose={() => setFollowerModalOpen(false)}
        />
      )}
    </div>
  );
};
