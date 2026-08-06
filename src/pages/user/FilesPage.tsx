import React, { useState, useEffect, useMemo } from 'react';
import { FileItem, Category } from '../../types';
import { filesApi } from '../../api/files';
import { FileCard } from '../../components/user/FileCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { CreateWorkModal } from '../../components/common/CreateWorkModal';
import { Folder, Download, Search, X, SlidersHorizontal, Plus, ThumbsUp, Bookmark, Clock } from 'lucide-react';

export const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'downloads' | 'favorites'>('latest');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const [cats, fls] = await Promise.all([
        filesApi.getCategories(),
        filesApi.getFiles({ categoryId: selectedCatId || undefined })
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setFiles(Array.isArray(fls?.list) ? fls.list : Array.isArray(fls) ? fls : []);
    } catch {
      setCategories([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedCatId]);

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        f =>
          f.title.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          (f.fileName && f.fileName.toLowerCase().includes(q)) ||
          (f.fileType && f.fileType.toLowerCase().includes(q)) ||
          (f.author?.nickName && f.author.nickName.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'popular') return (b.likeCount || 0) - (a.likeCount || 0);
      if (sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sortBy === 'favorites') return (b.favoriteCount || 0) - (a.favoriteCount || 0);
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [files, searchQuery, sortBy]);

  return (
    <div className="bg-white min-h-screen pb-16 font-sans">
      {/* Top Image Category Bar */}
      <CategoryImageBar
        categories={categories}
        selectedCatId={selectedCatId}
        onSelectCategory={setSelectedCatId}
        allLabel="全部设计资源"
        allIcon={Download}
      />

      <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Toolbar: Search, Sort Filter, and Publish File Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50/90 p-4 rounded-2xl border border-neutral-200/80">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索资源文件标题、文件名、后缀或创作者..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort Filter & Publish Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
              <span className="text-[11px] text-neutral-400 px-2 font-mono flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" /> 排序:
              </span>
              {[
                { id: 'latest', label: '最新发布', icon: Clock },
                { id: 'popular', label: '最多点赞', icon: ThumbsUp },
                { id: 'downloads', label: '最多下载', icon: Download },
                { id: 'favorites', label: '最多收藏', icon: Bookmark },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-neutral-900 text-white font-bold shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Publish Button with Fixed Type "file" */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#0057FF]/20 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>发布资源文件</span>
            </button>
          </div>
        </div>

        {/* File Grid Canvas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-xs space-y-2 bg-neutral-50 rounded-2xl border border-neutral-200">
            <Folder className="w-10 h-10 mx-auto text-neutral-400" />
            <p className="font-semibold text-neutral-700">
              {searchQuery ? '未检索到符合条件的设计资源' : '暂无该分类下的设计资源'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#0057FF] hover:underline font-medium"
              >
                清空搜索关键词
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedFiles.map((file, idx) => (
              <FileCard key={`file-${file.id ?? idx}-${idx}`} file={file} />
            ))}
          </div>
        )}
      </div>

      {/* Modal for creating work with fixed file type */}
      <CreateWorkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialType="file"
        lockType={true}
        onSuccess={fetchFiles}
      />
    </div>
  );
};
