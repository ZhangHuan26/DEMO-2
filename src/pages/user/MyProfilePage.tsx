import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  Key,
  ShieldAlert,
  Activity,
  Calendar,
  Phone,
  Mail,
  Info,
  Sparkles,
  Layers,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Hash,
  BarChart3,
  Folder,
  Bookmark,
  ArrowLeft,
  BadgeCheck,
  AtSign,
  RefreshCw,
  AlertTriangle,
  User as UserIcon,
  Users,
  UserPlus,
  ChevronRight,
  Clock,
  Quote,
  Copy,
  Check,
  Share2,
  Shield,
  Award,
  Lock,
  Globe,
  ExternalLink,
  Sliders
} from 'lucide-react';

import { User } from '../../types';
import { authApi } from '../../api/auth';
import { resolveImageUrl } from '../../config/env';
import { FollowerModal } from '../../components/common/FollowerModal';

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [contextUser, setContextUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerModalOpen, setFollowerModalOpen] = useState(false);
  const [followerModalTab, setFollowerModalTab] = useState<'followers' | 'following'>('followers');
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'actions'>('info');
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authApi.getMe();
        setContextUser(user);
        setProfile(user);
      } catch (err) {
        console.error('获取个人档案失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleCopyUid = () => {
    if (!profile) return;
    navigator.clipboard.writeText(String(profile.id));
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyProfileLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/user/${profile.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-neutral-50 flex flex-col items-center justify-center gap-4 font-sans text-neutral-900">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#0057FF]/20 animate-ping" />
          <div className="w-12 h-12 border-2 border-[#0057FF] border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="text-xs font-mono text-neutral-500 tracking-wider uppercase font-bold">Loading Profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] bg-neutral-50 flex flex-col items-center justify-center gap-4 font-sans px-4 text-center">
        <div className="w-16 h-16 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center text-neutral-400 shadow-sm">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-neutral-900">未获取到个人信息</p>
          <p className="text-xs text-neutral-500">登录凭证已失效或账号异常，请重新登录</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-[#0057FF]/20"
        >
          前往登录
        </button>
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return '未设置';
    try {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '暂无记录';
    try {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  const genderText = profile.gender === 1 ? '男' : profile.gender === 2 ? '女' : '保密';
  const isSuperAdmin = profile.role === 1 || (profile.role as unknown) === 'admin' || (profile.role as unknown) === '1';
  const roleText = isSuperAdmin ? '超级管理员' : '认证创作者';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-neutral-50/70 text-neutral-900 pb-24 font-sans selection:bg-[#0057FF] selection:text-white"
    >
      {/* Dynamic Top Glass Header */}
      <div className="border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-xs font-bold transition-all cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200/80 group-hover:border-neutral-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-[#0057FF] group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>返回</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-neutral-100 border border-neutral-200/80 text-neutral-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs">
              <BadgeCheck className="w-3.5 h-3.5 text-[#0057FF]" />
              个人核心档案
            </span>
            <button
              onClick={handleCopyProfileLink}
              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 text-neutral-700 rounded-full transition-all cursor-pointer relative"
              title="分享主页链接"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Luxury Banner & Avatar Header Block */}
        <div className="relative bg-white border border-neutral-200/80 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md">
          {/* Cover Banner */}
          <div className="h-48 sm:h-56 bg-gradient-to-r from-neutral-900 via-blue-950 to-neutral-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#0057FF_0,transparent_50%)] opacity-40" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
            
            {/* Top Right Badges */}
            <div className="absolute right-6 top-6 flex items-center gap-2 z-10">
              <button
                onClick={handleCopyUid}
                className="px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Hash className="w-3 h-3 text-[#0057FF]" />
                <span>UID: #{profile.id}</span>
                {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-300" />}
              </button>
            </div>
          </div>

          {/* User Profile Card Header */}
          <div className="px-6 sm:px-8 pb-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative shrink-0 group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-4 border-white bg-neutral-100 shadow-xl overflow-hidden ring-1 ring-neutral-200/80 relative">
                    <img
                      src={
                        resolveImageUrl(profile.avatar) ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                      }
                      alt={profile.nickName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  {/* Status Indicator */}
                  <div
                    className={`absolute bottom-1 right-1 px-2.5 py-0.5 rounded-full border-2 border-white shadow-md flex items-center gap-1 text-[10px] font-bold text-white ${
                      profile.status === 0
                        ? 'bg-emerald-500/90 backdrop-blur-md'
                        : 'bg-rose-500/90 backdrop-blur-md'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{profile.status === 0 ? '在线正常' : '账号冻结'}</span>
                  </div>
                </div>

                {/* Name & Identity Meta */}
                <div className="space-y-2 pb-1">
                  <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                      {profile.nickName}
                    </h1>

                    {isSuperAdmin ? (
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {roleText}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-50 text-[#0057FF] border border-blue-200/80 rounded-full text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {roleText}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 font-mono flex items-center justify-center sm:justify-start gap-2">
                    <AtSign className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{profile.username || profile.nickName}</span>
                    <span className="text-neutral-300">|</span>
                    <span>加入平台：{formatDate(profile.createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-md shadow-[#0057FF]/20 flex items-center gap-2 active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  修改个人资料
                </button>
                <button
                  onClick={() => navigate(`/user/${profile.id}`)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-bold rounded-2xl border border-neutral-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  公开预览主页
                </button>
              </div>
            </div>

            {/* Signature Quote */}
            {profile.signature ? (
              <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-start gap-3 text-xs text-neutral-700 leading-relaxed font-medium">
                <Quote className="w-4 h-4 text-[#0057FF] shrink-0 mt-0.5" />
                <p className="italic">{profile.signature}</p>
              </div>
            ) : (
              <div className="mt-6 p-3 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                暂未添加个性签名，点击“修改个人资料”补充个人简介
              </div>
            )}
          </div>
        </div>

        {/* Modern Statistics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setFollowerModalTab('followers');
              setFollowerModalOpen(true);
            }}
            className="p-5 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 hover:border-blue-300 rounded-3xl shadow-xs transition-all cursor-pointer text-left group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500">粉丝关注者</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
              {profile.followerCount ?? 0}
            </div>
            <p className="text-[11px] text-blue-600 font-bold mt-1.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              粉丝列表 <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          <button
            onClick={() => {
              setFollowerModalTab('following');
              setFollowerModalOpen(true);
            }}
            className="p-5 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 hover:border-emerald-300 rounded-3xl shadow-xs transition-all cursor-pointer text-left group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500">正在关注</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
              {profile.followingCount ?? 0}
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              关注账号 <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          <button
            onClick={() => navigate('/me/works')}
            className="p-5 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 hover:border-purple-300 rounded-3xl shadow-xs transition-all cursor-pointer text-left group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500">创作作品库</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
              作品管理
            </div>
            <p className="text-[11px] text-purple-600 font-bold mt-1.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              去管理 <ChevronRight className="w-3 h-3" />
            </p>
          </button>

          <button
            onClick={() => navigate('/me/favorites')}
            className="p-5 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-300 rounded-3xl shadow-xs transition-all cursor-pointer text-left group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-neutral-500">灵感收藏夹</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
              收藏灵感
            </div>
            <p className="text-[11px] text-amber-600 font-bold mt-1.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              查看收藏 <ChevronRight className="w-3 h-3" />
            </p>
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-200/60 rounded-2xl text-xs font-bold w-fit">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'info'
                ? 'bg-white text-neutral-900 shadow-xs font-extrabold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#0057FF]" />
            <span>基本属性档案</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-white text-neutral-900 shadow-xs font-extrabold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>账号安全与审计</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'actions'
                ? 'bg-white text-neutral-900 shadow-xs font-extrabold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>快捷工作台</span>
          </button>
        </div>

        {/* Tab Panes */}
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="tab-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-[#0057FF]" />
                  <h2 className="text-base font-bold text-neutral-900">个人属性与联系信息</h2>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">ACCOUNT METADATA</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-[#0057FF] rounded-xl shrink-0">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">唯一标识符 (ID)</div>
                    <div className="text-sm font-bold text-neutral-900 font-mono">#{profile.id}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">系统登录账号</div>
                    <div className="text-sm font-bold text-neutral-900 truncate font-mono">
                      {profile.username || '未单独设定'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">显示名称</div>
                    <div className="text-sm font-bold text-neutral-900 truncate">{profile.nickName}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">绑定邮箱</div>
                    <div className="text-sm font-bold text-neutral-900 truncate font-mono" title={profile.email}>
                      {profile.email || '未绑定'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">绑定手机</div>
                    <div className="text-sm font-bold text-neutral-900 font-mono">{profile.phone || '未绑定'}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">生理性别</div>
                    <div className="text-sm font-bold text-neutral-900">{genderText}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">出生日期</div>
                    <div className="text-sm font-bold text-neutral-900 font-mono">{formatDate(profile.birthday)}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 flex items-start gap-3.5">
                  <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-neutral-400 font-bold mb-0.5">账号权限级别</div>
                    <div className="text-sm font-bold text-neutral-900">{roleText}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="tab-security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-bold text-neutral-900">账号安全状态与活动日志</h2>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Security Status Normal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <Calendar className="w-4 h-4" />
                      <span>注册建账号时间</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-neutral-900">
                      {formatDateTime(profile.createdAt)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <Activity className="w-4 h-4" />
                      <span>最后一次登录活动</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-neutral-900">
                      {formatDateTime(profile.lastLoginAt)}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                      <RefreshCw className="w-4 h-4" />
                      <span>个人资料最近修改</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-neutral-900">
                      {formatDateTime(profile.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border border-neutral-200/80 text-amber-600 rounded-xl shrink-0 shadow-xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900">登录密码防护</div>
                      <div className="text-[11px] text-neutral-500">建议定期更新安全密码，保护个人账号资产</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-4 py-2 bg-white hover:bg-neutral-100 text-xs text-neutral-800 font-bold rounded-xl transition-all cursor-pointer shrink-0 border border-neutral-200/80 shadow-xs"
                  >
                    修改密码
                  </button>
                </div>
              </div>

              {/* Status Freeze Log if frozen */}
              {profile.status === 1 && (
                <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <h2 className="text-base font-bold text-rose-900">账号冻结提醒</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white/80 rounded-xl border border-rose-200">
                      <span className="text-neutral-500 block mb-1">冻结原因</span>
                      <span className="font-bold text-rose-900">{profile.frozenReason || '涉嫌违规风险'}</span>
                    </div>
                    <div className="p-3 bg-white/80 rounded-xl border border-rose-200">
                      <span className="text-neutral-500 block mb-1">冻结发生时间</span>
                      <span className="font-bold text-rose-900 font-mono">{formatDateTime(profile.frozenAt)}</span>
                    </div>
                    <div className="p-3 bg-white/80 rounded-xl border border-rose-200">
                      <span className="text-neutral-500 block mb-1">处理管理员</span>
                      <span className="font-bold text-rose-900 font-mono">
                        {profile.frozenBy ? `#${profile.frozenBy}` : '系统自动'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key="tab-actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[
                {
                  title: '我的作品库',
                  desc: '发布、编辑与管理个人图文与视频创意作品',
                  path: '/me/works',
                  icon: Layers,
                  color: 'text-[#0057FF]',
                  bg: 'bg-blue-50 border-blue-200/80',
                },
                {
                  title: '创作者中心',
                  desc: '深入分析作品曝光、赞同与社区互动指标',
                  path: '/creator',
                  icon: BarChart3,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50 border-emerald-200/80',
                },
                {
                  title: '我的收藏夹',
                  desc: '查阅您标记收藏的项目图文与设计素材',
                  path: '/me/favorites',
                  icon: Bookmark,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50 border-amber-200/80',
                },
                {
                  title: '我的云端文件',
                  desc: '管理上传的软件、设计源文件与素材附件',
                  path: '/me/files',
                  icon: Folder,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50 border-purple-200/80',
                },
                {
                  title: '申诉服务中心',
                  desc: '提交并追踪个人账号申诉与审核反馈状态',
                  path: '/me/appeals',
                  icon: ShieldAlert,
                  color: 'text-rose-600',
                  bg: 'bg-rose-50 border-rose-200/80',
                },
                {
                  title: '账号与安全设置',
                  desc: '更新个人头像、名字、安全邮箱与登录密码',
                  path: '/settings',
                  icon: Settings,
                  color: 'text-neutral-700',
                  bg: 'bg-neutral-100 border-neutral-200',
                },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.path)}
                    className="p-5 bg-white hover:bg-neutral-50/80 border border-neutral-200/80 hover:border-[#0057FF]/60 rounded-3xl shadow-xs transition-all text-left group cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${item.bg}`}>
                        <IconComp className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#0057FF] group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Follower Modal */}
      {profile && (
        <FollowerModal
          isOpen={followerModalOpen}
          userId={profile.id}
          initialTab={followerModalTab}
          onClose={() => setFollowerModalOpen(false)}
        />
      )}
    </motion.div>
  );
};
