import React, { useState } from 'react';
import { ShieldAlert, FileText, ArrowRight, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { adminApi } from '../../api/admin';

interface FreezeModalProps {
  isOpen: boolean;
  user?: User | null;
  reason?: string;
  freezeLogId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FreezeModal: React.FC<FreezeModalProps> = ({
  isOpen,
  user,
  reason: initialReason = '您的账号因违反社区规定已被暂时冻结，无法进行敏感操作。',
  freezeLogId,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [adminReason, setAdminReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Admin Freeze Action Mode
  if (user) {
    const handleAdminFreeze = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminReason.trim()) return;
      setLoading(true);
      try {
        await adminApi.freezeUser(user.id, adminReason);
        alert(`已成功冻结封禁用户 "${user.nickName}"！`);
        if (onSuccess) onSuccess();
        setAdminReason('');
        onClose();
      } catch {
        alert('冻结操作失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 border-b border-neutral-800 pb-4">
            <div className="p-2 bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">执行账号冻结封禁</h3>
              <p className="text-xs text-neutral-400">目标用户: <span className="text-white font-semibold">{user.nickName}</span> (#{user.id})</p>
            </div>
          </div>

          <form onSubmit={handleAdminFreeze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">违规冻结原因说明 *</label>
              <textarea
                required
                rows={4}
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="例如：多次发布违规垃圾广告、侵犯他人版权、涉嫌违规刷量行为..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {loading ? '正在处理...' : '确认冻结账号'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // User Frozen Notice Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-neutral-900 border border-rose-900/50 rounded-2xl p-6 relative text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">账号已被冻结</h3>
        <p className="text-xs text-neutral-300 mb-6 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-left leading-relaxed">
          <span className="font-semibold text-rose-400 block mb-1">冻结原因:</span>
          {initialReason}
          {freezeLogId && <span className="block mt-2 text-[10px] text-neutral-500">冻结流水单号: #{freezeLogId}</span>}
        </p>

        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              navigate('/me/appeals');
            }}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
          >
            <FileText className="w-4 h-4" />
            提交申诉复核
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs rounded-xl transition-colors"
          >
            了解并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
