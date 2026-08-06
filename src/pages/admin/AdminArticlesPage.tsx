import React, { useState, useEffect } from 'react';
import { FileText, Pin, Trash2, Download, Lock, Eye, ThumbsUp } from 'lucide-react';
import { Article } from '../../types';
import { adminApi } from '../../api/admin';
import { articlesApi } from '../../api/articles';

export const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await articlesApi.getArticles();
      setArticles(res.list || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleToggleHide = async (a: Article) => {
    try {
      if (a.isHidden === 1) {
        await adminApi.unhideArticle(a.id, '恢复展示');
      } else {
        await adminApi.hideArticle(a.id, '违规内容下架');
      }
      setArticles(prev => prev.map(item => item.id === a.id ? { ...item, isHidden: item.isHidden === 1 ? 0 : 1 } : item));
    } catch {
      alert('隐藏状态切换失败');
    }
  };

  const handleDelete = async (a: Article) => {
    if (!confirm(`确认要将作品 "${a.title}" 违规下架隔离吗？`)) return;
    try {
      await adminApi.deleteArticle(a.id);
      setArticles(prev => prev.filter(item => item.id !== a.id));
    } catch {
      alert('下架操作失败');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#0057FF]" /> 图文作品审查与精选
        </h1>
        <p className="text-sm text-neutral-500 mt-1">控制作品置顶展示、下载权限开关与违规下架隔离</p>
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">作品 ID</th>
              <th className="px-6 py-3.5">作品标题与创作者</th>
              <th className="px-6 py-3.5">所属分类</th>
              <th className="px-6 py-3.5">可见状态</th>
              <th className="px-6 py-3.5 text-right">管控操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">正在加载作品列表...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">暂无图文作品数据</td></tr>
            ) : (
              articles.map((a, idx) => (
                <tr key={`art-row-${a.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{a.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={a.coverImage} alt={a.title} className="w-11 h-11 rounded-lg object-cover border border-neutral-200 shadow-2xs" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm line-clamp-1">{a.title}</div>
                        <div className="text-xs text-neutral-500">作者: {a.author?.nickName || `用户 #${a.userId}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-700">{a.categoryName || '未分类'}</td>
                  <td className="px-6 py-4">
                    {a.isHidden === 1 ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">已隐藏</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold">正常展示</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleHide(a)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-bold transition-colors cursor-pointer"
                    >
                      {a.isHidden === 1 ? '恢复展示' : '隐藏下架'}
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      删除作品
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
