import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
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
      setError(err.message || '登录失败，请检查账号和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-neutral-900 text-neutral-900 font-sans selection:bg-[#0057FF] selection:text-white overflow-hidden">
      {/* Background Image with Dark Vignette */}
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

        {/* Right Side: Login Panel */}
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-neutral-100 flex flex-col justify-between relative z-20">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">登录</h1>
              <p className="text-sm text-neutral-600">
                新用户？{' '}
                <Link to="/register" className="text-[#0057FF] font-semibold hover:underline">
                  创建帐户
                </Link>
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  电子邮件地址
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入电子邮箱地址"
                  className="w-full bg-white border border-neutral-300 rounded-md p-3 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  密码
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-white border border-neutral-300 rounded-md p-3 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-98 text-white text-base font-bold rounded-full transition-all shadow-lg shadow-black/20 cursor-pointer disabled:opacity-60"
                >
                  {loading ? '处理中...' : '继续'}
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
    </div>
  );
};

