import React, { useState, useEffect } from 'react';
import { Video as VideoIcon, Pin, Trash2 } from 'lucide-react';
import { Video } from '../../types';
import { adminApi } from '../../api/admin';
import { videosApi } from '../../api/videos';
import { showToast } from '../../components/common/Toast';

export const AdminVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await videosApi.getVideos();
      setVideos(res.list || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleToggleHide = async (v: Video) => {
    try {
      if (v.isHidden === 1) {
        await adminApi.unhideVideo(v.id, '恢复展示');
      } else {
        await adminApi.hideVideo(v.id, '违规内容下架');
      }
      setVideos(prev => prev.map(item => item.id === v.id ? { ...item, isHidden: item.isHidden === 1 ? 0 : 1 } : item));
    } catch {
      showToast({ message: '切换隐藏状态失败', type: 'error' });
    }
  };

  const handleToggleDownload = async (v: Video) => {
    try {
      const newAllow = v.allowDownload === 1 ? 0 : 1;
      await adminApi.toggleVideoDownload(v.id, newAllow);
      setVideos(prev => prev.map(item => item.id === v.id ? { ...item, allowDownload: newAllow } : item));
    } catch {
      showToast({ message: '切换下载权限失败', type: 'error' });
    }
  };

  const handleDelete = async (v: Video) => {
    try {
      await adminApi.deleteVideo(v.id);
      setVideos(prev => prev.filter(item => item.id !== v.id));
    } catch {
      showToast({ message: '删除失败', type: 'error' });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatDuration = (duration: any) => {
    if (!duration) return '-';
    if (typeof duration === 'number') {
      const h = Math.floor(duration / 3600);
      const m = Math.floor((duration % 3600) / 60);
      const s = duration % 60;
      return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }
    return String(duration);
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

  return (
    <div className="space-y-6 w-full">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <VideoIcon className="w-6 h-6 text-purple-600" /> 视频广场审查与精选
        </h1>
        <p className="text-sm text-neutral-500 mt-1">控制视频作品置顶与违规下架隔离</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-800 whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">标题</th>
                <th className="px-6 py-3.5">描述</th>
                <th className="px-6 py-3.5">作者</th>
                <th className="px-6 py-3.5">分类</th>
                <th className="px-6 py-3.5">时长</th>
                <th className="px-6 py-3.5">文件大小</th>
                <th className="px-6 py-3.5">浏览量</th>
                <th className="px-6 py-3.5">点赞数</th>
                <th className="px-6 py-3.5">收藏数</th>
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
                <tr><td colSpan={16} className="px-6 py-8 text-center text-neutral-500">正在加载视频列表...</td></tr>
              ) : videos.length === 0 ? (
                <tr><td colSpan={16} className="px-6 py-8 text-center text-neutral-500">暂无视频作品数据</td></tr>
              ) : (
                videos.map((v, idx) => (
                  <tr key={`vid-row-${v.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{v.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={v.coverImage} alt={v.title} className="w-14 h-9 rounded object-cover border border-neutral-200 shadow-2xs" />
                        <div>
                          <div className="font-bold text-neutral-900 text-sm line-clamp-1 max-w-[160px]">{v.title}</div>
                          <div className="text-[11px] text-neutral-400 max-w-[160px] line-clamp-1">{v.videoUrl || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 max-w-[150px] truncate" title={v.description || ''}>
                      {v.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {v.author?.nickName || `用户 #${v.userId}`}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {v.categoryName || v.category?.name || `#${v.categoryId}` || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-600">{formatDuration(v.duration)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-600">{formatFileSize((v as any).fileSize)}</td>
                    <td className="px-6 py-4 text-neutral-500">{v.viewCount ?? 0}</td>
                    <td className="px-6 py-4 text-neutral-500">{v.likeCount ?? 0}</td>
                    <td className="px-6 py-4 text-neutral-500">{v.favoriteCount ?? 0}</td>
                    <td className="px-6 py-4">
                      {v.status === 1 ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold">私密</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">公开</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {v.isHidden === 1 ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">已隐藏</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">正常展示</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-xs font-semibold">
                      {v.allowDownload === 1 ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">允许下载</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-full text-xs font-medium">禁止下载</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">{formatDate(v.createdAt)}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">{formatDate((v as any).updatedAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleHide(v)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                      >
                        {v.isHidden === 1 ? '恢复展示' : '隐藏下架'}
                      </button>
                      <button
                        onClick={() => handleToggleDownload(v)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                      >
                        {v.allowDownload === 1 ? '禁用下载' : '允许下载'}
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        删除视频
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
