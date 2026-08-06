import React, { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, FileText, Video, FolderPlus, Sparkles, Search, Layers } from 'lucide-react';
import { ARTICLE_PRESET_IMAGES, VIDEO_PRESET_IMAGES, FILE_PRESET_IMAGES, PRESET_AVATARS, PresetImage } from '../../config/presets';
import { adminApi } from '../../api/admin';
import { resolveImageUrl } from '../../config/env';


interface BehanceImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  isAvatar?: boolean;
  workType?: 'article' | 'video' | 'file' | 'avatar';
}

type GalleryCategory = 'all' | 'article' | 'video' | 'file' | 'avatar';

export const BehanceImagePicker: React.FC<BehanceImagePickerProps> = ({
  value,
  onChange,
  label = '选择封面图片',
  isAvatar = false,
  workType = 'article',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>(
    isAvatar ? 'avatar' : workType || 'article'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [urlInput, setUrlInput] = useState(value);
  const [uploading, setUploading] = useState(false);

  // Sync gallery category when workType or isAvatar changes
  useEffect(() => {
    if (isAvatar) {
      setGalleryCategory('avatar');
    } else if (workType) {
      setGalleryCategory(workType);
    }
  }, [workType, isAvatar]);

  // Combine galleries based on selection
  const getGalleryImages = (): { item: PresetImage; catType: 'article' | 'video' | 'file' | 'avatar' }[] => {
    if (isAvatar || galleryCategory === 'avatar') {
      return PRESET_AVATARS.map((url, idx) => ({
        item: { url, title: `精选创作者头像 #${idx + 1}`, tag: '个人头像' },
        catType: 'avatar' as const,
      }));
    }

    if (galleryCategory === 'article') {
      return ARTICLE_PRESET_IMAGES.map((item) => ({ item, catType: 'article' as const }));
    }
    if (galleryCategory === 'video') {
      return VIDEO_PRESET_IMAGES.map((item) => ({ item, catType: 'video' as const }));
    }
    if (galleryCategory === 'file') {
      return FILE_PRESET_IMAGES.map((item) => ({ item, catType: 'file' as const }));
    }

    // 'all' category
    return [
      ...ARTICLE_PRESET_IMAGES.map((item) => ({ item, catType: 'article' as const })),
      ...VIDEO_PRESET_IMAGES.map((item) => ({ item, catType: 'video' as const })),
      ...FILE_PRESET_IMAGES.map((item) => ({ item, catType: 'file' as const })),
    ];
  };

  const rawGallery = getGalleryImages();

  // Extract unique tags for filtering
  const availableTags = ['全部', ...Array.from(new Set(rawGallery.map((g) => g.item.tag)))].slice(0, 8);

  // Filter gallery
  const filteredGallery = rawGallery.filter(({ item }) => {
    const matchesQuery = searchQuery.trim() === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '全部' || item.tag === selectedTag;
    return matchesQuery && matchesTag;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // 2. Process via uploadImage API
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.uploadImage(formData);
      if (res && res.url) {
        // 本地上传只存文件名（如 "abc.jpg"），展示时由 resolveImageUrl 拼接后端公共路径
        const url = res.url;
        const filename = url.split('/').pop() || url;
        onChange(filename);
      }
    } catch {
      // Local preview already active via FileReader
    } finally {
      setUploading(false);
    }
  };


  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="space-y-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-neutral-200 tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0057FF]" />
            {label}
          </label>
        )}
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
          HD 800px 高精视觉库
        </span>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>预设图库</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>本地上传</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#0057FF] text-white font-bold shadow-md shadow-[#0057FF]/30'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>网络 URL</span>
        </button>
      </div>

      {/* Active Selected Image Preview Box */}
      {value && (
        <div className="relative group w-full h-36 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-inner">
          <img src={resolveImageUrl(value)} alt="Selected Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#0057FF] text-white text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1">
                <Check className="w-3 h-3" /> 当前选中
              </span>
              <span className="text-[11px] text-neutral-300 truncate max-w-xs font-mono">{value}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-neutral-400 hover:text-rose-400 bg-black/60 hover:bg-black/90 px-2.5 py-1 rounded-lg border border-neutral-700 backdrop-blur-sm transition-colors cursor-pointer"
            >
              清除重新选择
            </button>
          </div>
        </div>
      )}

      {/* Presets Gallery Mode */}
      {activeTab === 'presets' && (
        <div className="space-y-3 pt-1">
          {/* Preset Category Selection Bar (Only if not in Avatar mode) */}
          {!isAvatar && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCategory('article');
                    setSelectedTag('全部');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    galleryCategory === 'article'
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>图文作品 (20)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCategory('video');
                    setSelectedTag('全部');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    galleryCategory === 'video'
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>视频秀场 (20)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCategory('file');
                    setSelectedTag('全部');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    galleryCategory === 'file'
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>资源文件 (20)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCategory('all');
                    setSelectedTag('全部');
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    galleryCategory === 'all'
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>全库 (60)</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 min-w-[140px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="搜索风格或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF]"
                />
              </div>
            </div>
          )}

          {/* Sub-tag filter pills */}
          {!isAvatar && availableTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
              <span className="text-neutral-500 text-[10px] font-mono mr-1">风格筛选:</span>
              {availableTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === t
                      ? 'bg-[#0057FF]/20 text-[#0057FF] border border-[#0057FF]/50 font-semibold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1.5 bg-neutral-950/90 rounded-xl border border-neutral-800/80 scrollbar-thin">
            {filteredGallery.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-neutral-500">
                未找到匹配的图库素材
              </div>
            ) : (
              filteredGallery.map(({ item, catType }, idx) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={`${item.url}-${idx}`}
                    type="button"
                    onClick={() => onChange(item.url)}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-200 text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#0057FF] ring-2 ring-[#0057FF] shadow-lg shadow-[#0057FF]/40 scale-[0.98]'
                        : 'border-neutral-800 opacity-80 hover:opacity-100 hover:border-neutral-600 hover:scale-[1.02]'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Category color accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 ${
                        catType === 'article'
                          ? 'bg-blue-500'
                          : catType === 'video'
                          ? 'bg-purple-500'
                          : catType === 'file'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />

                    {/* Hover info gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-1.5 transition-opacity duration-200">
                      <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{item.title}</span>
                      <span className="text-[9px] text-neutral-300 font-mono">{item.tag}</span>
                    </div>

                    {/* Tag badge top-right */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-md text-[8px] font-mono font-medium text-neutral-300 rounded border border-neutral-700/80 group-hover:opacity-0 transition-opacity">
                        {item.tag}
                      </span>
                    </div>

                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0057FF]/30 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#0057FF] text-white flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono px-1">
            <span>显示 {filteredGallery.length} 张高清精选 Preset 素材</span>
            <span>点击任意图片即刻选中</span>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="border-2 border-dashed border-neutral-800 hover:border-[#0057FF] rounded-xl p-8 text-center transition-all bg-neutral-900/50 group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            id="file-upload-input"
            className="hidden"
          />
          <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-[#0057FF]/20 text-neutral-400 group-hover:text-[#0057FF] flex items-center justify-center transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs text-neutral-200 font-semibold">
              {uploading ? '正在处理并上传图片...' : '点击或拖拽作品封面文件到此处上传'}
            </span>
            <span className="text-[10px] text-neutral-500">支持 PNG, JPG, WEBP 格式高清晰度文件，最大 10MB</span>
          </label>
        </div>
      )}

      {/* URL Mode */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0057FF]"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-5 py-2.5 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-[#0057FF]/30"
            >
              应用 URL
            </button>
          </div>
          <p className="text-[10px] text-neutral-500">支持直接输入 Unsplash、CDN 或公开图片链接</p>
        </div>
      )}
    </div>
  );
};
