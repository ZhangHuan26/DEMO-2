import React, { useState, useEffect } from 'react';
import { FileItem, Category } from '../../types';
import { filesApi } from '../../api/files';
import { FileCard } from '../../components/user/FileCard';
import { CategoryImageBar } from '../../components/common/CategoryImageBar';
import { Folder, Download } from 'lucide-react';

export const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cats, fls] = await Promise.all([
          filesApi.getCategories(),
          filesApi.getFiles({ categoryId: selectedCatId || undefined })
        ]);
        setCategories(cats);
        setFiles(fls.list || []);
      } catch {
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [selectedCatId]);

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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="py-24 text-center text-neutral-500 text-xs space-y-2 bg-neutral-50 rounded-2xl border border-neutral-200">
            <Folder className="w-10 h-10 mx-auto text-neutral-400" />
            <p className="font-semibold text-neutral-700">暂无该分类下的设计资源</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file, idx) => (
              <FileCard key={`file-${file.id ?? idx}-${idx}`} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
