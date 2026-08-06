import React, { useState, useEffect } from 'react';
import { Video as VideoIcon, Pin, Trash2 } from 'lucide-react';
import { Video } from '../../types';
import { adminApi } from '../../api/admin';
import { videosApi } from '../../api/videos';

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
      alert('切换隐藏状态失败');
    }
  };

  const handleDelete = async (v: Video) => {
    if (!confirm(`确认下架删除视频作品 "${v.title}"？`)) return;
    try {
      await adminApi.deleteVideo(v.id);
      setVideos(prev => prev.filter(item => item.id !== v.id));
    } catch {
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <VideoIcon className="w-6 h-6 text-purple-600" /> 视频广场审查与精选
        </h1>
        <p className="text-sm text-neutral-500 mt-1">控制视频作品置顶与违规下架隔离</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">视频 ID</th>
              <th className="px-6 py-3.5">视频标题与创作者</th>
              <th className="px-6 py-3.5">视频时长</th>
              <th className="px-6 py-3.5">可见状态</th>
              <th className="px-6 py-3.5 text-right">管控操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">正在加载视频列表...</td></tr>
            ) : videos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">暂无视频作品数据</td></tr>
            ) : (
              videos.map((v, idx) => (
                <tr key={`vid-row-${v.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{v.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={v.coverImage} alt={v.title} className="w-14 h-9 rounded object-cover border border-neutral-200 shadow-2xs" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm line-clamp-1">{v.title}</div>
                        <div className="text-xs text-neutral-500">创作者: {v.author?.nickName || `用户 #${v.userId}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-600">{v.duration}</td>
                  <td className="px-6 py-4">
                    {v.isHidden === 1 ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">已隐藏</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">正常展示</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleHide(v)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      {v.isHidden === 1 ? '恢复展示' : '隐藏下架'}
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
  );
};
