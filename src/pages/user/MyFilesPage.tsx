import React, { useState, useEffect } from 'react';
import { Folder, Download, Trash2, Lock, Unlock } from 'lucide-react';
import { FileItem } from '../../types';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileCard } from '../../components/user/FileCard';

export const MyFilesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="text-6xl">🔒</div>
          <h2 className="text-xl font-bold text-neutral-900">请先登录</h2>
          <p className="text-sm text-neutral-600">您需要登录后才能查看上传的资源文件</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2.5 bg-[#0057FF] text-white text-sm font-bold rounded-full hover:bg-[#0046CC] transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const loadMyFiles = async () => {
      setLoading(true);
      try {
        const list = await filesApi.getMyFiles();
        setFiles(list);
      } catch {
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    loadMyFiles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个上传的资源文件吗？')) return;
    try {
      await filesApi.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch {
      alert('删除失败');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-6">
      <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-neutral-900">我的上传资源文件</h1>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500">正在加载资源列表...</div>
      ) : files.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">您尚未上传任何资源文件包</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              <FileCard file={file} />
              <button
                onClick={() => handleDelete(file.id)}
                className="absolute top-3 left-3 p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-md"
                title="删除资源"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
