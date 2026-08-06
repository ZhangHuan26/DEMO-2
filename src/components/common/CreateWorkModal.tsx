import React, { useState, useEffect } from 'react';

import { X, FileText, Video, FolderPlus, Send, Globe, Lock, ChevronDown, Sparkles, Tag } from 'lucide-react';
import { Category, Article, Video as VideoType, FileItem } from '../../types';
import { articlesApi } from '../../api/articles';
import { videosApi } from '../../api/videos';
import { filesApi } from '../../api/files';
import { BehanceImagePicker } from './BehanceImagePicker';
import { BehanceVideoPicker } from './BehanceVideoPicker';
import { BehanceFilePicker } from './BehanceFilePicker';
import { RichTextEditor } from './RichTextEditor';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: 'article' | 'video' | 'file';
  lockType?: boolean;
  // 编辑模式：传入要编辑的作品数据
  editData?: {
    type: 'article' | 'video' | 'file';
    article?: Article;
    video?: VideoType;
    file?: FileItem;
  } | null;
}

export const CreateWorkModal: React.FC<CreateWorkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType,
  lockType = false,
  editData,
}) => {
  const [workType, setWorkType] = useState<'article' | 'video' | 'file'>(initialType || 'article');
  const [categories, setCategories] = useState<{ article: Category[]; video: Category[]; file: Category[] }>({
    article: [],
    video: [],
    file: [],
  });

  // Shared Form Fields
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [status, setStatus] = useState<number>(0); // 0: Public, 1: Private
  const [loading, setLoading] = useState(false);

  // Article Specific
  const [summary, setSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');

  // Video Specific
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [videoDesc, setVideoDesc] = useState('');
  const [duration, setDuration] = useState('03:45');
  const [videoFileSize, setVideoFileSize] = useState<number | undefined>(undefined);

  // File Specific
  const [fileUrl, setFileUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [fileName, setFileName] = useState('设计资源包_Design_Resource.zip');
  const [fileSize, setFileSize] = useState('24.8 MB');
  const [fileType, setFileType] = useState('zip');
  const [fileDesc, setFileDesc] = useState('');
  const [allowDownload, setAllowDownload] = useState<number>(1);
  const [selectedResourceFile, setSelectedResourceFile] = useState<File | null>(null);

  const isEditMode = !!editData;

  // 当弹窗打开或 editData 变化时，初始化表单数据
  useEffect(() => {
    if (!isOpen) return;

    // 重置表单
    if (initialType && !editData) {
      setWorkType(initialType);
    }
    setTitle('');
    setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');
    setCategoryId(1);
    setStatus(0);
    setSummary('');
    setArticleContent('');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setVideoDesc('');
    setDuration('03:45');
    setFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setFileName('设计资源包_Design_Resource.zip');
    setFileSize('24.8 MB');
    setFileType('zip');
    setFileDesc('');
    setAllowDownload(1);

    // 编辑模式：预填充数据
    if (editData) {
      setWorkType(editData.type);
      if (editData.type === 'article' && editData.article) {
        const a = editData.article;
        setTitle(a.title);
        setCoverImage(a.coverImage);
        setCategoryId(a.categoryId);
        setStatus(a.status);
        // 后端没有独立的 summary 字段，列表接口的 summary 是从 content 截取的
        // 详情接口返回 content，所以优先从 content 截取作为简介
        setSummary(a.summary || (a.content ? a.content.slice(0, 120) : ''));
        setArticleContent(a.content || '');
      } else if (editData.type === 'video' && editData.video) {

        const v = editData.video;
        setTitle(v.title);
        setCoverImage(v.coverImage);
        setCategoryId(v.categoryId);
        setStatus(v.status);
        setVideoUrl(v.videoUrl);
        setVideoDesc(v.description || '');
        setDuration(v.duration);
        setAllowDownload(v.allowDownload);
      } else if (editData.type === 'file' && editData.file) {
        const f = editData.file;
        setTitle(f.title);
        setCoverImage(f.coverImage);
        setCategoryId(f.categoryId);
        setStatus(f.status);
        setFileUrl(f.fileUrl);
        setFileName(f.fileName);
        setFileSize(f.fileSize);
        setFileType(f.fileType);
        setFileDesc(f.description || '');
        setAllowDownload(f.allowDownload);
      }
    }

    const fetchCats = async () => {
      try {
        const all = await videosApi.getAllCategories();
        setCategories({
          article: all.articleCategories,
          video: all.videoCategories,
          file: all.fileCategories,
        });
        if (all.articleCategories.length > 0) setCategoryId(prev => prev || all.articleCategories[0].id);
      } catch {
        // fallback
      }
    };
    fetchCats();
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const currentCategories = categories[workType] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('请输入作品标题');
    setLoading(true);

    try {
      if (isEditMode && editData) {
        // 编辑模式：更新作品
        if (editData.type === 'article' && editData.article) {
          await articlesApi.updateArticle(editData.article.id, {
            title,
            summary,
            content: articleContent,
            coverImage,
            categoryId,
            status,
          });
        } else if (editData.type === 'video' && editData.video) {
          await videosApi.updateVideo(editData.video.id, {
            title,
            description: videoDesc,
            videoUrl,
            coverImage,
            duration,
            categoryId,
            allowDownload,
            status,
          });
        } else if (editData.type === 'file' && editData.file) {
          await filesApi.updateFile(editData.file.id, {
            title,
            description: fileDesc,
            fileUrl,
            fileName,
            fileSize,
            fileType,
            coverImage,
            categoryId,
            allowDownload,
            status,
          });
        }
        alert('作品修改成功');
      } else {
        // 新增模式：创建作品
        if (workType === 'article') {
          if (!articleContent.trim()) throw new Error('文章正文内容不能为空');
          await articlesApi.createArticle({
            title,
            summary,
            content: articleContent,
            coverImage,
            categoryId,
            status,
          });
        } else if (workType === 'video') {
          await videosApi.createVideo({
            title,
            description: videoDesc,
            videoUrl,
            coverImage,
            duration,
            fileSize: videoFileSize,
            categoryId,
            allowDownload,
            status,
          });
        } else if (workType === 'file') {
          if (selectedResourceFile) {
            // uploadFile 内部已经处理 title, description, allowDownload 的更新
            await filesApi.uploadFile({
              file: selectedResourceFile,
              categoryId,
              status,
              title,
              description: fileDesc,
              coverImage,
              allowDownload,
            });
          } else {
            await filesApi.createFile({
              title,
              description: fileDesc,
              fileUrl,
              fileName,
              fileSize,
              fileType,
              coverImage,
              categoryId,
              allowDownload,
              status,
            });
          }
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || (isEditMode ? '修改作品失败' : '发布作品失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="max-w-3xl w-full max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl p-6 my-8 relative shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          {isEditMode ? '修改作品' : '发布与分享新作品'}
        </h2>
        <p className="text-xs text-neutral-400 mb-6">
          {isEditMode ? '修改您已发布的作品内容，保存后立即生效。' : '向 LeapLunar04 创意社区发布您最新的设计项目、动效秀场或设计资源。'}
        </p>

        {/* Work Type Selection Tabs - 编辑模式或类型写死锁定模式下调整 */}
        {!isEditMode && lockType && (
          <div className="mb-6 p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-white">
              {workType === 'article' && <FileText className="w-4 h-4 text-[#0057FF]" />}
              {workType === 'video' && <Video className="w-4 h-4 text-[#0057FF]" />}
              {workType === 'file' && <FolderPlus className="w-4 h-4 text-[#0057FF]" />}
              <span className="font-bold text-sm">
                发布类型：{workType === 'article' ? '图文作品' : workType === 'video' ? '视频秀场作品' : '设计资源文件'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full font-mono">
              对应页面发布类型已锁定
            </span>
          </div>
        )}

        {!isEditMode && !lockType && (
          <div className="grid grid-cols-3 gap-3 mb-6 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setWorkType('article');
                setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');
                if (categories.article[0]) setCategoryId(categories.article[0].id);
              }}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                workType === 'article' ? 'bg-[#0057FF] text-white shadow-lg shadow-[#0057FF]/30 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>图文作品</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">20预设</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkType('video');
                setCoverImage('https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop');
                if (categories.video[0]) setCategoryId(categories.video[0].id);
              }}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                workType === 'video' ? 'bg-[#0057FF] text-white shadow-lg shadow-[#0057FF]/30 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>视频作品</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">20预设</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkType('file');
                setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');
                if (categories.file[0]) setCategoryId(categories.file[0].id);
              }}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                workType === 'file' ? 'bg-[#0057FF] text-white shadow-lg shadow-[#0057FF]/30 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>资源文件</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-mono">20预设</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Visibility: Public / Private */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1 tracking-wider">作品可见性</label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatus(0)}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  status === 0 ? 'bg-[#0057FF] text-white shadow-lg shadow-[#0057FF]/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                公共作品
              </button>
              <button
                type="button"
                onClick={() => setStatus(1)}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  status === 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                私人作品
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5">
              {status === 0 ? '公共作品将对所有社区成员公开可见。' : '私人作品仅您自己可见，不会出现在社区公开列表中。'}
            </p>
          </div>

          {/* Title - Full Width */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 tracking-wider">
              作品标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：赛博朋克风格桌面设计系统"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all"
            />
          </div>

          {/* Category - 编辑模式下隐藏 */}
          {!isEditMode && (
            <div className="space-y-4 relative z-30 bg-neutral-950/90 border border-neutral-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-200 tracking-wider flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#0057FF]" />
                  所属分类 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                  {workType === 'article' ? '图文专区' : workType === 'video' ? '视频专区' : '资源专区'} • {currentCategories.length} 个分类
                </span>
              </div>

              {/* Custom Styled Select Dropdown with cover images */}
              <div className="relative z-40">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] shadow-lg transition-all flex items-center gap-2.5"
                >
                  {(() => {
                    const selected = currentCategories.find(c => c.id === categoryId);
                    if (selected) {
                      return (
                        <>
                          {selected.coverImage ? (
                            <img src={selected.coverImage} alt={selected.name} className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-neutral-700" />
                          ) : (
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-neutral-800 shrink-0">{selected.name.charAt(0)}</span>
                          )}
                          <span className="truncate">{selected.name}</span>
                        </>
                      );
                    }
                    return <span className="text-neutral-500">请选择分类</span>;
                  })()}
                </button>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {categoryDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 max-h-56 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 py-1.5">
                    {currentCategories.map((c, idx) => {
                      const isSelected = categoryId === c.id;
                      return (
                        <button
                          key={`cat-drop-${c.id ?? idx}-${idx}`}
                          type="button"
                          onClick={() => {
                            setCategoryId(c.id);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#0057FF]/15 text-white font-bold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                          }`}
                        >
                          {c.coverImage ? (
                            <img src={c.coverImage} alt={c.name} className="w-7 h-7 rounded-lg object-cover shrink-0 ring-1 ring-neutral-700" />
                          ) : (
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-neutral-800 shrink-0">{c.name.charAt(0)}</span>
                          )}
                          <span className="truncate">{c.name}</span>
                          {isSelected && <span className="ml-auto text-[#0057FF] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Quick Selector Chips with cover images */}
              <div className="pt-2">
                <div className="text-[10px] text-neutral-400 font-mono mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>快捷选分类:</span>
                </div>
                <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-2 bg-neutral-900/60 rounded-xl border border-neutral-800/60">
                  {currentCategories.map((c, idx) => {
                    const isSelected = categoryId === c.id;
                    return (
                      <button
                        key={`cat-chip-${c.id ?? idx}-${idx}`}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/30 ring-1 ring-[#0057FF]'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {c.coverImage ? (
                          <img
                            src={c.coverImage}
                            alt={c.name}
                            className={`w-7 h-7 rounded-lg object-cover shrink-0 ${isSelected ? 'ring-1 ring-white/60' : 'ring-1 ring-neutral-700'}`}
                          />
                        ) : (
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${isSelected ? 'bg-white/20' : 'bg-neutral-800'}`}>
                            {c.name.charAt(0)}
                          </span>
                        )}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Cover Image Selection with workType pass */}
          <BehanceImagePicker
            value={coverImage}
            onChange={setCoverImage}
            label={`作品封面图 (自动匹配 ${workType === 'article' ? '图文视觉' : workType === 'video' ? '视频秀场' : '资源文件'} 20 张高清图库)`}
            workType={workType}
            theme="dark"
          />

          {/* Type Specific Fields */}
          {workType === 'article' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 tracking-wider">作品简介</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="用简短的一句话概括您的作品亮点..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1 tracking-wider">作品正文内容（支持 Markdown 语法）</label>
                <RichTextEditor value={articleContent} onChange={setArticleContent} />
              </div>
            </div>
          )}

          {workType === 'video' && (
            <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <BehanceVideoPicker
                value={videoUrl}
                onChange={setVideoUrl}
                onDurationChange={(newDuration) => {
                  if (newDuration) setDuration(newDuration);
                }}
                onFileSizeChange={setVideoFileSize}
                label="动效视频素材上传 / 设置"
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">视频时长标记</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="例如：04:35（上传本地视频后将自动检测）"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">视频作品描述</label>
                <textarea
                  rows={3}
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  placeholder="描述您的动效作品、使用的设计软件及创作过程..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                />
              </div>
            </div>
          )}

          {workType === 'file' && (
            <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <BehanceFilePicker
                fileUrl={fileUrl}
                onChangeUrl={setFileUrl}
                fileName={fileName}
                onChangeFileName={setFileName}
                fileSize={fileSize}
                onChangeFileSize={setFileSize}
                fileType={fileType}
                onChangeFileType={setFileType}
                selectedFile={selectedResourceFile}
                onFileSelected={setSelectedResourceFile}
                label="设计资源文件上传 / 设置"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">资源显示名称</label>
                  <input
                    type="text"
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="例如：设计资源包_Design_Resource.zip"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">文件大小与格式</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fileSize}
                      onChange={(e) => setFileSize(e.target.value)}
                      placeholder="24.8 MB"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                    />
                    <input
                      type="text"
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      placeholder="zip"
                      className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">资源文件描述</label>
                <textarea
                  rows={2}
                  value={fileDesc}
                  onChange={(e) => setFileDesc(e.target.value)}
                  placeholder="描述该设计资源包包含的内容、适用软件及使用说明..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#0057FF]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowDownloadCheck"
                  checked={allowDownload === 1}
                  onChange={(e) => setAllowDownload(e.target.checked ? 1 : 0)}
                  className="rounded border-neutral-800 bg-neutral-900 text-[#0057FF] focus:ring-[#0057FF]"
                />
                <label htmlFor="allowDownloadCheck" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  允许社区成员直接下载此资源文件
                </label>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#0057FF]/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? (isEditMode ? '正在保存修改...' : '正在发布作品...') : (isEditMode ? '保存修改' : '发布作品到社区')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
