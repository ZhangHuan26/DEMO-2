import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, FileText, Video, FolderOpen } from 'lucide-react';
import { Category } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { BehanceImagePicker } from '../../components/common/BehanceImagePicker';

type CategoryType = 'article' | 'video' | 'file';

const TYPE_META: Record<CategoryType, { label: string; icon: React.ElementType; color: string }> = {
  article: { label: '图文', icon: FileText, color: 'text-[#0057FF]' },
  video: { label: '视频', icon: Video, color: 'text-purple-400' },
  file: { label: '文件', icon: FolderOpen, color: 'text-emerald-400' },
};

const TYPE_ORDER: CategoryType[] = ['article', 'video', 'file'];

export const AdminCategoriesPage: React.FC = () => {
  const [activeType, setActiveType] = useState<CategoryType>('article');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<CategoryType>('article');
  const [catCover, setCatCover] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const loadCategories = async (type: CategoryType) => {
    setLoading(true);
    try {
      let list: Category[] = [];
      if (type === 'article') list = await articlesApi.getCategories();
      else if (type === 'video') list = await videosApi.getCategories();
      else list = await filesApi.getCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(activeType);
  }, [activeType]);

  const handleSwitchType = (type: CategoryType) => {
    setActiveType(type);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatType(activeType);
    setCatCover('');
    setCatDesc('');
    setSortOrder('0');
    setIsOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatType((c.type as CategoryType) || activeType);
    setCatCover(c.coverImage || '');
    setCatDesc(c.description || '');
    setSortOrder(String(c.sortOrder || 0));
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const payload = { name: catName.trim(), coverImage: catCover, description: catDesc.trim(), sortOrder: Number(sortOrder) };
    try {
      if (editingCategory) {
        if (catType === 'article') await articlesApi.updateCategory(editingCategory.id, payload);
        else if (catType === 'video') await videosApi.updateCategory(editingCategory.id, payload);
        else await filesApi.updateCategory(editingCategory.id, payload);
      } else {
        if (catType === 'article') await articlesApi.createCategory(payload);
        else if (catType === 'video') await videosApi.createCategory(payload);
        else await filesApi.createCategory(payload);
      }
      setIsOpen(false);
      loadCategories(catType);
    } catch {
      alert('保存分类失败。');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该分类吗？')) return;
    try {
      if (activeType === 'article') await articlesApi.deleteCategory(id);
      else if (activeType === 'video') await videosApi.deleteCategory(id);
      else await filesApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('删除失败。');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#0057FF]" /> 分类与标签集中设置
          </h1>
          <p className="text-sm text-neutral-500 mt-1">管理图文、视频及资源专区的分类全域字典</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-md shadow-[#0057FF]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 添加分类
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-full p-1.5 w-fit">
        {TYPE_ORDER.map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          const isActive = activeType === type;
          return (
            <button
              key={type}
              onClick={() => handleSwitchType(type)}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive ? 'bg-[#0057FF] text-white shadow-md shadow-[#0057FF]/20' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" /> {meta.label}分类
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">ID</th>
              <th className="px-6 py-3.5">封面</th>
              <th className="px-6 py-3.5">分类名称</th>
              <th className="px-6 py-3.5">描述</th>
              <th className="px-6 py-3.5">类型</th>
              <th className="px-6 py-3.5">排序权重</th>
              <th className="px-6 py-3.5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-neutral-500">正在加载分类字典...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-neutral-500">暂未配置分类</td></tr>
            ) : (
              categories.map((c, idx) => {
                const meta = TYPE_META[(c.type as CategoryType) || activeType];
                const Icon = meta.icon;
                return (
                  <tr key={`admin-cat-${c.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{c.id}</td>
                    <td className="px-6 py-4">
                      {c.coverImage ? (
                        <img src={c.coverImage} alt={c.name} className="w-14 h-10 rounded-lg object-cover border border-neutral-200 shadow-2xs" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-900">{c.name}</td>
                    <td className="px-6 py-4 text-neutral-500 max-w-[220px] truncate" title={c.description || ''}>
                      {c.description || <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs ${meta.color}`}>
                        <Icon className="w-3.5 h-3.5" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-600 font-bold">{c.sortOrder || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 text-neutral-600 hover:text-[#0057FF] rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-neutral-600 hover:text-rose-600 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900">{editingCategory ? '编辑分类' : '创建新分类'}</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">分类类型 *</label>
                <div className="flex items-center gap-2">
                  {TYPE_ORDER.map((type) => {
                    const meta = TYPE_META[type];
                    const Icon = meta.icon;
                    const isActive = catType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCatType(type)}
                        className={`flex-1 px-3 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0057FF] border-[#0057FF] text-white shadow-xs'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">分类名称 *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="例如 UI/UX 设计"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">分类描述</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="简要描述该分类的定位与内容方向"
                  rows={2}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">排序权重 (0-99，数字越大越靠前)</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#0057FF]"
                />
              </div>

              <div>
                <BehanceImagePicker
                  value={catCover}
                  onChange={setCatCover}
                  label="分类封面图片"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full shadow-md shadow-[#0057FF]/20 cursor-pointer"
                >
                  保存分类
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
