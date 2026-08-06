import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, HardDrive, MessageSquare, Bell, Save, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { SystemSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'LeapLunar04 Creative Community',
    openRegistration: true,
    maxFileUploadSizeMb: 100,
    allowPublicComments: true,
    announcement: '欢迎使用 LeapLunar04 全景创作者社区系统！',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    adminApi.getSystemSettings().then((res) => {
      if (res) {
        setSettings(res);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSystemSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-neutral-500 py-10">正在加载系统全局配置...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0057FF]" /> 后台系统设置 (API v2)
          </h1>
          <p className="text-sm text-neutral-500 mt-1">控制站点基本信息、开放注册状态、文件上传阈值及全局公告</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> 配置保存成功！
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Site Info */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-[#0057FF]" /> 站点基本信息
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">站点名称 (siteName) *</label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">全局全站顶部公告 (announcement)</label>
              <textarea
                value={settings.announcement || ''}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                rows={2}
                placeholder="例如：本周日 02:00-04:00 进行系统例行维护更新..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* System & Registration Toggles */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-3">
            <HardDrive className="w-4 h-4 text-[#0057FF]" /> 注册与资源限制
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-neutral-900">开放用户注册</div>
                <div className="text-xs text-neutral-500 mt-0.5">关闭后禁止新用户通过 `/auth/register` 注册</div>
              </div>
              <input
                type="checkbox"
                checked={settings.openRegistration}
                onChange={(e) => setSettings({ ...settings, openRegistration: e.target.checked })}
                className="w-5 h-5 accent-[#0057FF] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl">
              <div>
                <div className="font-bold text-sm text-neutral-900">允许公开评论</div>
                <div className="text-xs text-neutral-500 mt-0.5">关闭后禁止全站作品与文件发帖讨论</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowPublicComments}
                onChange={(e) => setSettings({ ...settings, allowPublicComments: e.target.checked })}
                className="w-5 h-5 accent-[#0057FF] rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">单文件上传上限 (maxFileUploadSizeMb / MB) *</label>
            <input
              type="number"
              required
              value={settings.maxFileUploadSizeMb}
              onChange={(e) => setSettings({ ...settings, maxFileUploadSizeMb: Number(e.target.value) })}
              className="w-full max-w-xs bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#0057FF] hover:bg-[#0046CC] text-white text-sm font-bold rounded-full shadow-md shadow-[#0057FF]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '正在保存...' : '保存系统设置'}
          </button>
        </div>
      </form>
    </div>
  );
};
