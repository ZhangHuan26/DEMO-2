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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatFileSize = (size: any) => {
    if (!size) return '-';
    if (typeof size === 'number') {
      if (size >= 1024 * 1024 * 1024) return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
      return `${size} B`;
    }
    return String(size);
  };

  const getFileTypeLabel = (fileType: any) => {
    const map: Record<number, string> = {
      0: '文档',
      1: '图片',
      2: '音频',
      3: '视频',
      4: '压缩包',
      5: '其他'
    };
    if (typeof fileType === 'number') return map[fileType] || '其他';
    return String(fileType || '其他');
  };

  return (
    <div className="space-y-6 w-full">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Folder className="w-6 h-6 text-emerald-600" /> 资源文件管理与下载管控
        </h1>
        <p className="text-sm text-neutral-500 mt-1">全局控制资源文件下载权限，阻止未经授权的资源分发</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-800 whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">标题</th>
                <th className="px-6 py-3.5">作者</th>
                <th className="px-6 py-3.5">分类</th>
                <th className="px-6 py-3.5">文件类型</th>
                <th className="px-6 py-3.5">文件大小</th>
                <th className="px-6 py-3.5">点赞数</th>
                <th className="px-6 py-3.5">收藏数</th>
                <th className="px-6 py-3.5">下载次数</th>
                <th className="px-6 py-3.5">状态</th>
                <th className="px-6 py-3.5">隐藏状态</th>
                <th className="px-6 py-3.5">下载权限</th>
                <th className="px-6 py-3.5">创建时间</th>
                <th className="px-6 py-3.5">更新时间</th>
                <th className="px-6 py-3.5 text-right">管控操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={15} className="px-6 py-8 text-center text-neutral-500">正在加载资源文件列表...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={15} className="px-6 py-8 text-center text-neutral-500">暂无资源文件数据</td></tr>
              ) : (
                files.map((f, idx) => (
                  <tr key={`file-row-${f.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{f.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={f.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'}
                          alt={f.title}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 text-sm line-clamp-1 max-w-[160px]">{f.title}</div>
                          <div className="text-[11px] text-neutral-400 max-w-[160px] line-clamp-1">{(f as any).originalName || f.fileName || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {f.author?.nickName || `用户 #${f.userId}`}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {f.categoryName || f.category?.name || `#${f.categoryId}` || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-[#0057FF] text-white rounded text-[10px] uppercase font-bold">
                        {getFileTypeLabel((f as any).fileType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-600">{formatFileSize(f.fileSize)}</td>
                    <td className="px-6 py-4 text-neutral-500">{f.likeCount ?? 0}</td>
                    <td className="px-6 py-4 text-neutral-500">{f.favoriteCount ?? 0}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 text-xs">{f.downloadCount ?? 0}</td>
                    <td className="px-6 py-4">
                      {f.status === 1 ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold">私密</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">公开</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {f.isHidden === 1 ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">已隐藏</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">正常展示</span>
                      )}
                    </td>
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
                    <td className="px-6 py-4 text-neutral-500 text-xs">{formatDate(f.createdAt)}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">{formatDate((f as any).updatedAt)}</td>
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
    </div>
  );
};
