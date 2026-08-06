import React, { useState, useEffect } from 'react';
import { Folder, Pin, Trash2, Lock, Unlock } from 'lucide-react';
import { FileItem } from '../../types';
import { adminApi } from '../../api/admin';
import { filesApi } from '../../api/files';

export const AdminFilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await filesApi.getFiles();
      setFiles(res.list || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleToggleHide = async (f: FileItem) => {
    try {
      if (f.isHidden === 1) {
        await adminApi.unhideFile(f.id, '恢复展示');
      } else {
        await adminApi.hideFile(f.id, '违规内容下架');
      }
      setFiles(prev => prev.map(item => item.id === f.id ? { ...item, isHidden: item.isHidden === 1 ? 0 : 1 } : item));
    } catch {
      alert('切换隐藏状态失败');
    }
  };

  const handleToggleDownload = async (f: FileItem) => {
    try {
      const newAllow = f.allowDownload === 1 ? 0 : 1;
      await adminApi.toggleFileDownload(f.id, newAllow);
      setFiles(prev => prev.map(item => item.id === f.id ? { ...item, allowDownload: newAllow } : item));
    } catch {
      alert('切换下载权限失败');
    }
  };

  const handleDelete = async (f: FileItem) => {
    if (!confirm(`确认删除资源文件 "${f.title}"？`)) return;
    try {
      await adminApi.deleteFile(f.id);
      setFiles(prev => prev.filter(item => item.id !== f.id));
    } catch {
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Folder className="w-6 h-6 text-emerald-600" /> 资源文件管理与下载管控
        </h1>
        <p className="text-sm text-neutral-500 mt-1">全局控制资源文件下载权限，阻止未经授权的资源分发</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">资源 ID</th>
              <th className="px-6 py-3.5">资源标题与创作者</th>
              <th className="px-6 py-3.5">格式与大小</th>
              <th className="px-6 py-3.5">下载次数</th>
              <th className="px-6 py-3.5">下载权限</th>
              <th className="px-6 py-3.5 text-right">管控操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">正在加载资源文件列表...</td></tr>
            ) : files.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">暂无资源文件数据</td></tr>
            ) : (
              files.map((f, idx) => (
                <tr key={`file-row-${f.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{f.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-900 text-sm line-clamp-1">{f.title}</div>
                    <div className="text-xs text-neutral-500">创作者: {f.author?.nickName || `用户 #${f.userId}`}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <span className="px-2 py-0.5 bg-[#0057FF] text-white rounded text-[10px] uppercase font-bold mr-1.5">{f.fileType}</span>
                    <span className="text-neutral-500">{f.fileSize}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-600 text-xs">{f.downloadCount}</td>
                  <td className="px-6 py-4">
                    {f.allowDownload === 1 ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <Unlock className="w-3.5 h-3.5" /> 允许下载
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <Lock className="w-3.5 h-3.5" /> 禁止下载
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleHide(f)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      {f.isHidden === 1 ? '恢复展示' : '隐藏下架'}
                    </button>
                    <button
                      onClick={() => handleToggleDownload(f)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      {f.allowDownload === 1 ? '禁用下载' : '允许下载'}
                    </button>
                    <button
                      onClick={() => handleDelete(f)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      删除资源
                    </button>
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
