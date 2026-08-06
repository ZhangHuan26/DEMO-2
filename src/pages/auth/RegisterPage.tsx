import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BehanceImagePicker } from '../../components/common/BehanceImagePicker';
import { PRESET_AVATARS } from '../../config/presets';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email, password, nickName, avatar });
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册新账号失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center p-4 font-sans selection:bg-[#0057FF]">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1 group">
            <div className="bg-black text-white px-2.5 py-1 font-black text-base tracking-tighter rounded-sm">
              Leap
            </div>
            <div className="border border-black text-black px-2.5 py-1 font-bold text-base tracking-tighter rounded-sm">
              Lunar04
            </div>
          </Link>
          <p className="text-xs text-neutral-500">加入 Behance 创意设计社区</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <BehanceImagePicker value={avatar} onChange={setAvatar} label="选择您的个性头像" isAvatar={true} />

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">创作者昵称 *</label>
            <input
              type="text"
              required
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="例如：赛博雕塑家"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">电子邮箱地址 *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@leaplunar.com"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">登录密码 *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6个字符"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0057FF]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? '正在注册...' : '立即注册会员账号'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          已有社区账号？{' '}
          <Link to="/login" className="text-[#0057FF] hover:underline font-bold">
            返回直接登录
          </Link>
        </div>
      </div>
    </div>
  );
};
