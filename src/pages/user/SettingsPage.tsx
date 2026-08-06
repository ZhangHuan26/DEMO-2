import React, { useState, useRef } from 'react';
import { User, Lock, Save, Check, Camera, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { adminApi } from '../../api/admin';
import { BehanceImagePicker } from '../../components/common/BehanceImagePicker';
import { resolveImageUrl } from '../../config/env';


export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-bold text-neutral-900">请先登录</h2>
          <p className="text-sm text-neutral-600">您需要登录后才能访问账号设置页面</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-full hover:bg-[#0046CC] transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  // Profile fields
  const [nickName, setNickName] = useState(user?.nickName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [gender, setGender] = useState<number>(user?.gender ?? 0);
  const [birthday, setBirthday] = useState(user?.birthday || '1998-05-20');
  const [signature, setSignature] = useState(user?.signature || '');
  // 手机号：PUT /users/me 支持 phone 字段（需唯一，若被占用返回 40900）
  const [phone, setPhone] = useState(user?.phone || '');


  // Local Avatar File Upload & Preview
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload via API
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.uploadImage(formData);
      if (res && res.url) {
        let finalUrl = res.url;
        // 如果不是 Data URL/Blob URL/HTTP/以 / 开头，且包含 uploads/，做规范化修正
        if (!/^(data:|blob:|https?:|\/)/i.test(finalUrl)) {
          if (finalUrl.startsWith('uploads/')) {
            finalUrl = `/${finalUrl}`;
          }
        }
        setAvatar(finalUrl);
      }
    } catch {
      // FileReader already set local Data URL preview
    } finally {
      setUploadingAvatar(false);
    }
  };


  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        nickName,
        avatar,
        gender,
        birthday,
        signature,
        phone,
      });

      updateUser(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch {
      alert('更新资料设置失败。');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await authApi.updatePassword({ oldPassword, newPassword });
      alert('密码更新成功！');
      setOldPassword('');
      setNewPassword('');
    } catch {
      alert('密码更新失败。');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0057FF]" />
          账号与个人资料设置
        </h1>
      </div>

      {/* Public Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">公开个人资料</h2>

        {/* Local Avatar Direct Upload & Real-time Preview Banner */}
        <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden shadow-lg">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0057FF] bg-neutral-800 shadow-xl relative flex items-center justify-center">
              {avatar ? (
                <img
                  src={resolveImageUrl(avatar)}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
                  }}
                />
              ) : (

                <span className="text-3xl font-black text-white">{nickName.slice(0, 1) || 'U'}</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-xs font-semibold text-white">
                  处理中...
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#0057FF] hover:bg-[#0046CC] text-white rounded-full shadow-lg border-2 border-neutral-900 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="点击上传更换本地头像图片"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base font-bold text-white">{nickName || '用户头像与形象'}</h3>
              <span className="px-2.5 py-0.5 bg-[#0057FF]/20 text-[#0057FF] text-[10px] font-mono font-bold rounded-full border border-[#0057FF]/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 实时本地预览
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              支持上传 PNG、JPG、GIF 或 WEBP 格式本地文件。上传后可立即在此处预览效果。
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/30"
              >
                <Upload className="w-3.5 h-3.5" />
                选择本地图片上传
              </button>
              {avatar && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 头像图片已就绪 (可直接预览)
                </span>
              )}
            </div>
          </div>
        </div>

        <BehanceImagePicker value={avatar} onChange={setAvatar} label="更多头像库 (预设模板、矢量设计或网络 URL)" isAvatar={true} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">昵称 *</label>
            <input
              type="text"
              required
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">性别</label>
            <select
              value={gender}
              onChange={(e) => setGender(Number(e.target.value))}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all cursor-pointer"
            >
              <option value={0}>0 - 保密</option>
              <option value={1}>1 - 男</option>
              <option value={2}>2 - 女</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">生日</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">个性签名 (最多 200 字)</label>
          <textarea
            rows={3}
            maxLength={200}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="分享你的设计理念或工作领域..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
          />
          <div className="text-[10px] text-neutral-400 text-right mt-1 font-mono">{signature.length}/200</div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedMsg ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> 个人资料保存成功！
            </span>
          ) : <div />}

          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0057FF]/20"
          >
            <Save className="w-4 h-4" />
            {savingProfile ? '正在保存...' : '保存修改'}
          </button>
        </div>
      </form>

      {/* Password & Security Form */}
      <form onSubmit={handleSavePassword} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" /> 账号安全与密码修改
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">绑定邮箱 (仅供查看)</label>
            <input
              type="text"
              readOnly
              value={user?.email || ''}
              className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">绑定手机 (可修改，需唯一)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
            />
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">原密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPassword || !oldPassword || !newPassword}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            更新密码
          </button>
        </div>
      </form>
    </div>
  );
};
