import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { User } from '../../types';

interface FreezeModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const FreezeModal: React.FC<FreezeModalProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('1'); // days
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      const fullReason = `${reason} (封禁时长: ${duration === '-1' ? '永久' : `${duration}天`})`;
      await adminApi.freezeUser(user.id, fullReason);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to freeze user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            冻结用户账号：{user.nickName}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">选择封禁时长</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
            >
              <option value="1">1 天 (警告提醒)</option>
              <option value="3">3 天 (严重违规)</option>
              <option value="7">7 天 (多次违规)</option>
              <option value="30">30 天 (恶意违规)</option>
              <option value="-1">永久封禁</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">封禁冻结原因 *</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入具体的违规判定原因..."
              className="w-full h-24 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer flex items-center gap-1"
            >
              {loading ? '正在处理...' : '确认冻结'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
