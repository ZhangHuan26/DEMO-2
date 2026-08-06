import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, Lock, Trash2 } from 'lucide-react';
import { FreezeLog, ModerationLog } from '../../types';
import { adminApi } from '../../api/admin';

export const AdminLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'freeze' | 'moderation'>('freeze');
  const [freezeLogs, setFreezeLogs] = useState<FreezeLog[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const [fLogs, mLogs] = await Promise.all([
          adminApi.getFreezeLogs(),
          adminApi.getModerationLogs()
        ]);
        setFreezeLogs(fLogs);
        setModerationLogs(mLogs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <History className="w-6 h-6 text-purple-600" /> 审计日志轨迹
        </h1>
        <p className="text-sm text-neutral-500 mt-1">不可篡改的管理员操作轨迹、封禁记录与信誉扣分明细</p>
      </div>

      <div className="flex border-b border-neutral-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('freeze')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'freeze' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Lock className="w-4 h-4" /> 账号封禁日志 ({freezeLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'moderation' ? 'border-[#0057FF] text-[#0057FF]' : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> 内容处理日志 ({moderationLogs.length})
        </button>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        {activeTab === 'freeze' ? (
          <table className="w-full text-left text-sm text-neutral-800">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-3.5">日志 ID</th>
                <th className="px-6 py-3.5">被封禁用户</th>
                <th className="px-6 py-3.5">操作管理员</th>
                <th className="px-6 py-3.5">封禁时长</th>
                <th className="px-6 py-3.5">封禁原因</th>
                <th className="px-6 py-3.5">操作时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono text-xs">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500 font-sans">正在加载审计日志...</td></tr>
              ) : freezeLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500 font-sans">暂无账号封禁记录</td></tr>
              ) : (
                freezeLogs.map((log, idx) => (
                  <tr key={`flog-row-${log.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80">
                    <td className="px-6 py-4 text-neutral-500">#{log.id}</td>
                    <td className="px-6 py-4 font-bold text-neutral-900">{log.user?.nickName ? `${log.user.nickName} (#${log.userId})` : `用户 #${log.userId}`}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">管理员 #{log.adminId || (log as any).operatorId || 2}</td>
                    <td className="px-6 py-4 text-amber-600 font-bold">{(log as any).durationDays ? ((log as any).durationDays === 9999 ? '永久封禁' : `${(log as any).durationDays} 天`) : '永久/长期'}</td>
                    <td className="px-6 py-4 text-neutral-700 max-w-xs truncate font-sans text-xs">{log.reason}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm text-neutral-800">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-3.5">日志 ID</th>
                <th className="px-6 py-3.5">处置动作</th>
                <th className="px-6 py-3.5">目标对象</th>
                <th className="px-6 py-3.5">处理原因</th>
                <th className="px-6 py-3.5">操作管理员</th>
                <th className="px-6 py-3.5">操作时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono text-xs">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500 font-sans">正在加载处置日志...</td></tr>
              ) : moderationLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500 font-sans">暂无内容处置记录</td></tr>
              ) : (
                moderationLogs.map((log, idx) => (
                  <tr key={`mlog-row-${log.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80">
                    <td className="px-6 py-4 text-neutral-500">#{log.id}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold font-sans">
                      {log.action === 'hide' ? '下架/隐藏' : log.action === 'unhide' ? '解除隐藏' : log.action}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900 font-sans">{log.targetType} #{log.targetId}</td>
                    <td className="px-6 py-4 text-neutral-700 max-w-xs truncate font-sans text-xs">{log.reason || '管理员违规处置'}</td>
                    <td className="px-6 py-4 text-[#0057FF] font-bold font-sans">{log.adminName || `管理员 #${log.adminId || (log as any).operatorId || 2}`}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
