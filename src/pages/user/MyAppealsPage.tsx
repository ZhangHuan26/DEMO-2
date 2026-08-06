import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Appeal } from '../../types';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const MyAppealsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [freezeLogId, setFreezeLogId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-bold text-neutral-900">请先登录</h2>
          <p className="text-sm text-neutral-600">您需要登录后才能查看申诉记录</p>
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

  useEffect(() => {
    const loadAppeals = async () => {
      setLoading(true);
      try {
        const list = await adminApi.getMyAppeals();
        // 确保返回的是数组
        setAppeals(Array.isArray(list) ? list : []);
      } catch {
        setAppeals([]);
      } finally {
        setLoading(false);
      }
    };
    loadAppeals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      const created = await adminApi.submitAppeal({
        targetType: 0, // 账号冻结申诉
        targetId: user?.id ?? 0,
        freezeLogId: freezeLogId ? Number(freezeLogId) : undefined,
        reason,
      });
      setAppeals(prev => [created, ...prev]);
      setReason('');
      setFreezeLogId('');
      alert('申诉提交成功！管理员将尽快为您审查复核。');
    } catch {
      alert('申诉提交失败。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-neutral-200 pb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-rose-500" />
        <h1 className="text-xl font-bold text-neutral-900">申诉中心与进度查询</h1>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">发起新申诉</h2>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">关联违规/冻结日志 ID (选填)</label>
          <input
            type="number"
            value={freezeLogId}
            onChange={(e) => setFreezeLogId(e.target.value)}
            placeholder="例如 12"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">申诉原因与详细说明 *</label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请详细说明您认为处置有误的原因及合理依据..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
          >
            <Send className="w-4 h-4" />
            {submitting ? '提交中...' : '提交申诉申请'}
          </button>
        </div>
      </form>

      {/* Appeals List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">历史申诉记录与进度</h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-500">正在加载申诉记录...</div>
        ) : appeals.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">暂无申诉记录</div>
        ) : (
          appeals.map((a) => (
            <div key={a.id} className="p-5 bg-white border border-neutral-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-500 font-semibold">申诉单号 #{a.id}</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                  a.status === 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  a.status === 1 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {a.status === 0 && <Clock className="w-3 h-3" />}
                  {a.status === 1 && <CheckCircle2 className="w-3 h-3" />}
                  {a.status === 2 && <XCircle className="w-3 h-3" />}
                  {a.status === 0 ? '待审核' : a.status === 1 ? '申诉通过' : '申诉驳回'}
                </span>
              </div>

              <p className="text-xs text-neutral-800 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80 leading-relaxed">{a.reason}</p>

              {a.reply && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block mb-1 text-[#0057FF]">管理员审核回复：</span>
                  {a.reply}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
