import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user?.role === 1) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
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
          <p className="text-xs text-neutral-500">登录 Behance 创意设计社区</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">电子邮箱地址 *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
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
              placeholder="请输入密码"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0057FF]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? '正在登录...' : '立即登录'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          还没有账号？{' '}
          <Link to="/register" className="text-[#0057FF] hover:underline font-bold">
            注册新会员账号
          </Link>
        </div>
      </div>
    </div>
  );
};
