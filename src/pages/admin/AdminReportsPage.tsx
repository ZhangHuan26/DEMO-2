import React, { useState, useEffect } from 'react';
import { Flag, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import { Report } from '../../types';
import { adminApi } from '../../api/admin';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getReports();
      // 确保返回的是数组
      setReports(Array.isArray(list) ? list : []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleHandleReport = async (reportId: number, status: number, deleteContent: boolean) => {
    try {
      await adminApi.handleReport(reportId, { status, handleResult: deleteContent ? '下架违规内容并记录违规扣分' : '忽略举报' });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      alert(status === 1 ? '已确认违规！违规作品已下架并记录扣分。' : '已忽略该举报。');
    } catch {
      alert('操作失败。');
    }
  };

  const getTargetTypeName = (type: number) => {
    switch (type) {
      case 0: return '文章';
      case 1: return '视频';
      case 2: return '文件';
      case 3: return '文章评论';
      case 4: return '视频评论';
      case 5: return '文件评论';
      case 6: return '用户';
      default: return '作品';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Flag className="w-6 h-6 text-amber-500" /> 违规举报处理中心
        </h1>
        <p className="text-sm text-neutral-500 mt-1">核实用户举报，对确定违规的作品/评论执行下架屏蔽与信誉扣分</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">举报目标</th>
              <th className="px-6 py-3.5">举报人</th>
              <th className="px-6 py-3.5">举报原因</th>
              <th className="px-6 py-3.5">状态</th>
              <th className="px-6 py-3.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">正在加载举报审核队列...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">暂无待处理的违规举报</td></tr>
            ) : (
              reports.map((r, idx) => (
                <tr key={`report-row-${r.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{r.id}</td>
                  <td className="px-6 py-4 font-mono text-neutral-900">
                    <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-[#0057FF]">
                      {getTargetTypeName(r.targetType)} #{r.targetId}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-700">用户 #{r.reporterId}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-neutral-600" title={r.reason}>{r.reason}</td>
                  <td className="px-6 py-4">
                    {r.status === 0 ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold">待审核</span>
                    ) : r.status === 1 ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">已处理违规</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-semibold">已忽略</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {r.status === 0 && (
                      <>
                        <button
                          onClick={() => handleHandleReport(r.id, 1, true)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        >
                          违规删除并扣分
                        </button>
                        <button
                          onClick={() => handleHandleReport(r.id, 2, false)}
                          className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
                        >
                          忽略
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
