import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, FileText, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { articlesApi } from '../../api/articles';
import { Article } from '../../types';

export const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [hideReason, setHideReason] = useState('');
  const [showHideModal, setShowHideModal] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articlesApi.getAdminArticles({ search: searchTerm });
      setArticles(res.list || []);
    } catch (err) {
      console.error('Failed to load admin articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleHideClick = (article: Article) => {
    setSelectedArticle(article);
    setHideReason('');
    setShowHideModal(true);
  };

  const handleConfirmHide = async () => {
    if (!selectedArticle) return;
    try {
      await articlesApi.hideArticle(selectedArticle.id, hideReason || '违反社区规范');
      setShowHideModal(false);
      fetchArticles();
    } catch (err) {
      console.error('Failed to hide article:', err);
    }
  };

  const handleUnhide = async (id: number) => {
    try {
      await articlesApi.unhideArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Failed to unhide article:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确认要永久删除这篇文章吗？')) return;
    try {
      await articlesApi.deleteArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Failed to delete article:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0057FF]" />
          文章作品管理
        </h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">文章信息</th>
              <th className="py-3 px-4">作者</th>
              <th className="py-3 px-4">状态</th>
              <th className="py-3 px-4">数据（浏览/点赞）</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-neutral-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-400">
                  正在加载文章列表...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-400">
                  未找到相关文章记录
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop'}
                        alt={article.title}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-neutral-900 line-clamp-1">{article.title}</p>
                        <p className="text-[11px] text-neutral-400">{article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-CN') : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{article.author?.nickName || '未知用户'}</td>
                  <td className="py-3 px-4">
                    {article.isHidden === 1 ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-semibold text-[11px]">
                        已隐藏
                      </span>
                    ) : article.status === 1 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-semibold text-[11px]">
                        私密
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-semibold text-[11px]">
                        公开正常
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">
                    {article.viewCount ?? 0} 次浏览 / {article.likeCount ?? 0} 点赞
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {article.isHidden === 1 ? (
                        <button
                          onClick={() => handleUnhide(article.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="恢复显示"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideClick(article)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="隐藏此文章"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="删除文章"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showHideModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              隐藏违规作品
            </h3>
            <p className="text-xs text-neutral-500">
              请填写对作品《{selectedArticle?.title}》的隐藏处理说明：
            </p>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="请输入隐藏原因..."
              className="w-full h-24 p-3 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowHideModal(false)}
                className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmHide}
                className="px-4 py-2 text-xs bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 cursor-pointer"
              >
                确认隐藏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
