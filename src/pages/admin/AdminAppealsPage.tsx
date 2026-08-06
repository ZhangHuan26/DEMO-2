import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Send } from 'lucide-react';
import { Appeal } from '../../types';
import { adminApi } from '../../api/admin';

export const AdminAppealsPage: React.FC = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<{ [key: number]: string }>({});

  const loadAppeals = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getAppeals();
      // 确保返回的是数组
      setAppeals(Array.isArray(list) ? list : []);
    } catch {
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  const handleHandleAppeal = async (appealId: number, status: number) => {
    const reply = replies[appealId] || (status === 1 ? '申诉核实通过，已解除处罚限制' : '申诉审核驳回');
    try {
      await adminApi.handleAppeal(appealId, { status, handleResult: reply });
      setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, status, handleResult: reply } : a));
      alert(status === 1 ? '申诉通过！已为该用户解除限制/恢复作品。' : '申诉已被驳回。');
    } catch {
      alert('操作失败。');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600" /> 申诉复核队列
        </h1>
        <p className="text-sm text-neutral-500 mt-1">复核用户被封禁或违规下架的申诉单，支持填写意见并解除处罚</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">正在加载申诉复核队列...</div>
        ) : appeals.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">暂无待处理的申诉单</div>
        ) : (
          appeals.map((a, idx) => (
            <div key={`appeal-item-${a.id ?? idx}-${idx}`} className="bg-white border border-neutral-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-neutral-900">申诉单 #{a.id}</span>
                  <span className="text-neutral-500 text-xs">用户 #{a.userId}</span>
                  {a.freezeLogId && <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold font-mono">关联违规日志 #{a.freezeLogId}</span>}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  a.status === 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  a.status === 1 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {a.status === 0 ? '待复核' : a.status === 1 ? '已同意解封' : '已驳回'}
                </span>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 text-sm text-neutral-800">
                <span className="text-xs text-neutral-500 font-bold block mb-1">申诉理由：</span>
                {a.reason}
              </div>

              {a.status === 0 ? (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={replies[a.id] || ''}
                    onChange={(e) => setReplies({ ...replies, [a.id]: e.target.value })}
                    placeholder="请输入给用户的处理意见或复核说明..."
                    className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF]"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleHandleAppeal(a.id, 2)}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-rose-600 text-xs font-bold rounded-full transition-colors cursor-pointer"
                    >
                      驳回申诉
                    </button>
                    <button
                      onClick={() => handleHandleAppeal(a.id, 1)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      同意申诉并解封账号
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-50/80 rounded-xl text-xs text-neutral-600 border border-neutral-200">
                  <span className="font-bold text-neutral-900 block mb-0.5">审核回复：</span>
                  {a.handleResult || a.reply || '已处理'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
