import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Download, Lock, FileText, Share2, Bookmark, Flag, ArrowLeft, Send, Trash2, Pencil, Globe } from 'lucide-react';

import { FileItem, Comment, User } from '../../types';
import { filesApi } from '../../api/files';
import { useAuth } from '../../context/AuthContext';
import { AppreciateButton } from '../../components/common/AppreciateButton';
import { ReportModal } from '../../components/common/ReportModal';
import { ChatDrawer } from '../../components/user/ChatDrawer';
import { resolveImageUrl } from '../../config/env';


export const FileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState<FileItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const item = await filesApi.getFileById(Number(id));
        setFile(item);
        const comms = await filesApi.getComments(Number(id));
        setComments(comms);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">正在加载资源大厅...</div>;
  }

  if (!file) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-500">未找到该资源文件</div>;
  }

  const isOwner = user?.id === file.userId;
  const canDownload = file.allowDownload === 1 || isOwner || user?.role === 1;

  const handleDownload = async () => {
    if (!canDownload) return alert('该资源已被管理员或作者关闭下载权限');
    setDownloading(true);
    try {
      const res = await filesApi.downloadFile(file.id);
      setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      window.open(res.downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.message || '下载资源失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!file) return;
    try {
      if (file.isLiked) {
        setFile(prev => prev ? { ...prev, isLiked: false, likeCount: Math.max(0, prev.likeCount - 1) } : null);
      } else {
        await filesApi.likeFile(file.id);
        setFile(prev => prev ? { ...prev, isLiked: true, likeCount: prev.likeCount + 1 } : null);
      }
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const created = await filesApi.createComment(file.id, { content: newCommentText });
      setComments(prev => [created, ...prev]);
      setNewCommentText('');
    } catch {
      alert('发表评论失败');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans relative">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-neutral-900 truncate max-w-md">{file.title}</h1>
        </div>

        {/* Author Info - 仅非当前用户作品时显示 */}
        {!isOwner && (
          <div className="flex items-center gap-3">
            <Link to={`/users/${file.userId}`} className="flex items-center gap-2 group">
              <img src={resolveImageUrl(file.author?.avatar)} alt="Author" className="w-8 h-8 rounded-full object-cover border border-neutral-200 shadow-xs" />

              <span className="text-xs font-semibold text-neutral-900 group-hover:text-[#0057FF] transition-colors">{file.author?.nickName}</span>
            </Link>
          </div>
        )}

      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 flex gap-8">
        <div className="flex-1 space-y-8">
          {/* Cover & Download Box */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white p-6 flex flex-col md:flex-row gap-6 items-center shadow-xs">
            <img src={resolveImageUrl(file.coverImage)} alt={file.title} className="w-full md:w-80 h-52 object-cover rounded-xl border border-neutral-200" />


            <div className="flex-1 space-y-4">
              <h1 className="text-xl font-bold text-neutral-900">{file.title}</h1>
              <p className="text-xs text-neutral-600 leading-relaxed">{file.description || '设计资源文件包。'}</p>

              <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                <span className="px-2.5 py-1 bg-[#0057FF] text-white rounded font-bold uppercase">{file.fileType}</span>
                <span>{file.fileSize}</span>
                <span>📥 {file.downloadCount} 次下载</span>
              </div>

              {canDownload ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? '正在准备下载...' : `📥 下载资源文件 (${file.fileName})`}
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>该资源文件已被作者或管理员禁止下载。</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 space-y-6 shadow-xs">
            <h3 className="text-base font-bold text-neutral-900">资源讨论交流 ({comments.length})</h3>
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="向作者提问或分享此资源的使用心得..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0057FF] focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#0057FF]/20">
                  <Send className="w-3.5 h-3.5" /> 发表评论
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-4 border-t border-neutral-200">
              {comments.map((c, idx) => (
                <div key={`fcomment-${c.id ?? idx}-${idx}`} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1">
                  <div className="font-semibold text-neutral-900">{c.author?.nickName || '创作者'}</div>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Floating Action Bar - 仅自己可见 */}
      {isOwner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-xl border border-neutral-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('确定要删除该资源文件吗？')) {
                filesApi.deleteFile(file.id).then(() => {
                  alert('资源文件已删除');
                  navigate('/profile');
                });
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> 删除
          </button>
          <button
            onClick={() => navigate(`/files/${file.id}/edit`)}
            className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> 修改
          </button>
          <button
            onClick={() => {
              const newStatus = file.status === 1 ? 0 : 1;
              filesApi.updateFileStatus(file.id, newStatus).then(() => {
                setFile(prev => prev ? { ...prev, status: newStatus } : null);
                alert(newStatus === 1 ? '资源已发布' : '资源已下架');
              });
            }}
            className={`px-4 py-2 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              file.status === 1 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'
            }`}
          >
            {file.status === 1 ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {file.status === 1 ? '下架' : '发布'}
          </button>
        </div>
      )}

      <ReportModal isOpen={isReportOpen} targetType={2} targetId={file.id} onClose={() => setIsReportOpen(false)} />
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} targetUser={chatTarget} />

    </div>
  );
};
