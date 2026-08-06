import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CelebrationModal } from '../../components/common/CelebrationModal';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [targetPath, setTargetPath] = useState('/');

  const handleLoginSuccess = (userRole: any) => {
    const isAdm = userRole === 1 || userRole === 'admin' || userRole === '1';
    const path = isAdm ? '/admin' : '/';
    setTargetPath(path);
    setShowCelebration(true);
  };

  const handleConfirmCelebration = () => {
    setShowCelebration(false);
    navigate(targetPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      handleLoginSuccess(res?.user?.role);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await login(userEmail, '123456');
      handleLoginSuccess(res?.user?.role);
    } catch (err: any) {
      setError(err.message || '快捷登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center p-4 font-sans selection:bg-[#0057FF]">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0057FF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1 group">
            <div className="bg-black text-white px-2.5 py-1 font-black text-base tracking-tighter rounded-sm">
              Leap
            </div>
            <div className="border border-black text-black px-2.5 py-1 font-bold text-base tracking-tighter rounded-sm">
              Lunar04
            </div>
          </Link>
          <p className="text-xs text-neutral-500">Behance 风格创意设计社区</p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">电子邮箱账号</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@leaplunar.com"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">登录密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0057FF]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '正在验证身份...' : '登录账号'}
          </button>
        </form>

        {/* Quick Preset Demo Login Box */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <div className="text-[10px] text-neutral-400 uppercase font-mono text-center flex items-center justify-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-[#0057FF]" /> 一键登录演示测试账号
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('creative.designer@leaplunar.com')}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 text-left hover:border-[#0057FF] transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-neutral-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> 普通创作者
              </div>
              <div className="text-[9px] text-neutral-500 truncate">creative.designer@leaplunar.com</div>
            </button>

            <button
              onClick={() => handleQuickLogin('admin@leaplunar.com')}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 text-left hover:border-rose-500 transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> 超级管理员
              </div>
              <div className="text-[9px] text-neutral-500 truncate">admin@leaplunar.com</div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-neutral-500">
          还没有社区账号？{' '}
          <Link to="/register" className="text-[#0057FF] hover:underline font-bold">
            立即注册新会员
          </Link>
        </div>
      </div>

      <CelebrationModal
        isOpen={showCelebration}
        title="登录成功！"
        subtitle="欢迎回到 LeapLunar04 创意社区，正在为您跳转..."
        onConfirm={handleConfirmCelebration}
      />
    </div>
  );
};
