import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Sparkles } from 'lucide-react';
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

export const BehanceImagePicker: React.FC<BehanceImagePickerProps> = ({
  value,
  onChange,
  label = '选择封面图片',
  isAvatar = false,
  workType = 'article',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [urlInput, setUrlInput] = useState(value);
  const [uploading, setUploading] = useState(false);

  // Combine galleries strictly based on workType / isAvatar
  const getGalleryImages = (): { item: PresetImage; catType: 'article' | 'video' | 'file' | 'avatar' }[] => {
    if (isAvatar || workType === 'avatar') {
      return PRESET_AVATARS.map((url, idx) => ({
        item: { url, title: `精选创作者头像 #${idx + 1}`, tag: '个人头像' },
        catType: 'avatar' as const,
      }));
    }

    if (workType === 'video') {
      return VIDEO_PRESET_IMAGES.map((item) => ({ item, catType: 'video' as const }));
    }
    if (workType === 'file') {
      return FILE_PRESET_IMAGES.map((item) => ({ item, catType: 'file' as const }));
    }

    // Default 'article'
    return ARTICLE_PRESET_IMAGES.map((item) => ({ item, catType: 'article' as const }));
  };

  const galleryList = getGalleryImages();

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
        let finalUrl = res.url;
        if (!/^(data:|blob:|https?:|\/)/i.test(finalUrl)) {
          if (finalUrl.startsWith('uploads/')) {
            finalUrl = `/${finalUrl}`;
          }
        }
        onChange(finalUrl);
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
    <div className="space-y-3.5 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-bold text-neutral-800 tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0057FF]" />
            {label}
          </label>
        )}
        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
          HD 高精视觉库
        </span>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#0057FF] text-white font-bold shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
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
              ? 'bg-[#0057FF] text-white font-bold shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
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
              ? 'bg-[#0057FF] text-white font-bold shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>网络 URL</span>
        </button>
      </div>

      {/* Active Selected Image Preview Box */}
      {value && (
        <div className="relative group w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-inner">
          <img src={resolveImageUrl(value)} alt="Selected Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#0057FF] text-white text-[10px] font-bold rounded-full shadow-xs flex items-center gap-1">
                <Check className="w-3 h-3" /> 当前选中
              </span>
              <span className="text-[11px] text-white/90 truncate max-w-xs font-mono">{value}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-neutral-200 hover:text-rose-300 bg-black/60 hover:bg-black/90 px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-sm transition-colors cursor-pointer"
            >
              清除重新选择
            </button>
          </div>
        </div>
      )}

      {/* Presets Gallery Mode */}
      {activeTab === 'presets' && (
        <div className="space-y-3 pt-1">
          {/* Gallery Grid - NO SCROLLBAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-1.5 bg-neutral-50 rounded-xl border border-neutral-200">
            {galleryList.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-neutral-500">
                暂无预设图库素材
              </div>
            ) : (
              galleryList.map(({ item, catType }, idx) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={`${item.url}-${idx}`}
                    type="button"
                    onClick={() => onChange(item.url)}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-200 text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#0057FF] ring-2 ring-[#0057FF] shadow-md scale-[0.98]'
                        : 'border-neutral-200 opacity-90 hover:opacity-100 hover:border-neutral-400 hover:scale-[1.02]'
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-1.5 transition-opacity duration-200">
                      <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{item.title}</span>
                      <span className="text-[9px] text-neutral-200 font-mono">{item.tag}</span>
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
            <span>共 {galleryList.length} 张预设图库素材</span>
            <span>点击图片即可直接选中</span>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="border-2 border-dashed border-neutral-300 hover:border-[#0057FF] rounded-xl p-6 text-center transition-all bg-neutral-50 group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            id="file-upload-input"
            className="hidden"
          />
          <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-neutral-200 group-hover:bg-[#0057FF]/10 text-neutral-600 group-hover:text-[#0057FF] flex items-center justify-center transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral-800 font-semibold">
              {uploading ? '正在处理并上传图片...' : '点击或拖拽作品封面文件到此处上传'}
            </span>
            <span className="text-[10px] text-neutral-500">支持 PNG, JPG, WEBP 格式，最大 10MB</span>
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
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF]"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2 bg-[#0057FF] hover:bg-[#0046CC] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
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

