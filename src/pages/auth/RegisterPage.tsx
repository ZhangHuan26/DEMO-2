import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CelebrationModal } from '../../components/common/CelebrationModal';
import { PRESET_AVATARS } from '../../config/presets';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Pick a random avatar preset
      const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      await register({ email, password, nickName, avatar: randomAvatar });
      setShowCelebration(true);
    } catch (err: any) {
      setError(err.message || '注册新账号失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCelebration = () => {
    setShowCelebration(false);
    navigate('/');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-neutral-900 text-neutral-900 font-sans selection:bg-[#0057FF] selection:text-white overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: LF Logo & Branding */}
        <div className="flex-1 flex flex-col items-start justify-center text-white py-8 lg:py-0">
          <Link to="/" className="flex items-center group mb-4">
            <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-md group-hover:opacity-90 transition-opacity">
              LeapLunar04
            </span>
          </Link>
        </div>

        {/* Right Side: Register Panel */}
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-neutral-100 flex flex-col justify-between relative z-20 my-6">
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">创建帐户</h1>
              <p className="text-sm text-neutral-600">
                已有帐户？{' '}
                <Link to="/login" className="text-[#0057FF] font-semibold hover:underline">
                  登录
                </Link>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  创作者昵称
                </label>
                <input
                  type="text"
                  required
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder="例如：数字艺术家"
                  className="w-full bg-white border border-neutral-300 rounded-md p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  电子邮件地址
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入电子邮箱地址"
                  className="w-full bg-white border border-neutral-300 rounded-md p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6个字符）"
                  className="w-full bg-white border border-neutral-300 rounded-md p-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-98 text-white text-base font-bold rounded-full transition-all shadow-lg shadow-black/20 cursor-pointer disabled:opacity-60"
                >
                  {loading ? '创建中...' : '继续'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Left Watermark */}
      <div className="relative z-10 px-6 pb-6 hidden md:block">
        <div className="inline-flex items-center gap-2 text-white/80 text-xs bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10">
          <span className="bg-black text-white font-bold px-1.5 py-0.5 text-[10px] rounded">LF</span>
          <span>LeapLunar04</span>
        </div>
      </div>

      <CelebrationModal
        isOpen={showCelebration}
        title="欢迎加入 LeapLunar04！"
        subtitle="您的会员账号注册成功，正在为您跳转至社区大厅..."
        onConfirm={handleConfirmCelebration}
      />
    </div>
  );
};

