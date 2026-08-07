import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Film, Check, Play, Clock, AlertCircle } from 'lucide-react';
import { videosApi } from '../../api/videos';
import { resolveImageUrl } from '../../config/env';

interface BehanceVideoPickerProps {
  value: string;
  onChange: (url: string) => void;
  onDurationChange?: (duration: string) => void;
  onFileSizeChange?: (sizeInBytes: number) => void;
  label?: string;
}

export const BehanceVideoPicker: React.FC<BehanceVideoPickerProps> = ({
  value,
  onChange,
  onDurationChange,
  onFileSizeChange,
  label = '上传/设置视频素材',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Format seconds into MM:SS or HH:MM:SS
  const formatSecondsToDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      const durSecs = videoRef.current.duration;
      const formatted = formatSecondsToDuration(durSecs);
      if (onDurationChange && formatted) {
        onDurationChange(formatted);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadedFileName(file.name);
    if (onFileSizeChange) {
      onFileSizeChange(file.size);
    }
    
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileSize(`${sizeInMB} MB`);

    // Instant local preview via Blob URL
    const localBlobUrl = URL.createObjectURL(file);
    onChange(localBlobUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await videosApi.uploadVideo(formData);
      if (res && res.url) {
        let finalUrl = res.url;
        if (!/^(data:|blob:|https?:|\/)/i.test(finalUrl)) {
          if (finalUrl.startsWith('video/') || finalUrl.startsWith('uploads/')) {
            finalUrl = `/${finalUrl}`;
          }
        }
        onChange(finalUrl);
        setUrlInput(finalUrl);
      }
    } catch {
      // Local Blob URL is active as fallback
      setUploadError('上传出现波动，已为您应用本地实时预览。');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const isVideoSelected = Boolean(value && value.trim());
  const resolvedVideoSrc = resolveImageUrl(value);

  return (
    <div className="space-y-3.5 rounded-2xl p-4 bg-neutral-950/90 border border-neutral-800 text-white shadow-xl">
      {/* Hidden Video element for auto duration extraction */}
      {value && (
        <video
          ref={videoRef}
          src={resolvedVideoSrc}
          onLoadedMetadata={handleLoadedMetadata}
          className="hidden"
          preload="metadata"
        />
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800/80">
        <label className="text-xs font-bold tracking-wide flex items-center gap-1.5 text-neutral-200">
          <Film className="w-4 h-4 text-purple-400" />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>本地视频上传</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>网络 URL</span>
          </button>

        </div>
      </div>

      {/* Tab Content: Local File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div className="relative border-2 border-dashed rounded-2xl p-6 transition-all text-center border-neutral-700/80 hover:border-purple-500 bg-neutral-900/50 hover:bg-neutral-900/80 group">
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,video/x-flv,video/x-ms-wmv,video/m4v,video/mpeg,video/3gpp"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="video-upload-input"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-neutral-200">
                {uploading ? '正在处理并上传视频文件...' : '点击或拖拽视频文件到此处上传'}
              </div>
              <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed">
                支持 MP4, WEBM, MOV, AVI, MKV, FLV, WMV 等常规格式（最大支持 200MB）
              </p>
            </div>
          </div>

          {/* Upload Status / Progress */}
          {uploading && (
            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/50 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="flex-1 text-xs text-purple-200">
                <span className="font-bold">{uploadedFileName || '视频文件'}</span>
                {uploadedFileSize && <span className="text-purple-400 ml-2">({uploadedFileSize})</span>}
                <p className="text-[10px] text-purple-300/80 mt-0.5">正在上传至服务器 /video/ 目录...</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/50 flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Network URL */}
      {activeTab === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="请输入包含视频扩展名的 URL (如 https://domain.com/sample.mp4)"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 border bg-neutral-900 border-neutral-800"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              应用 URL
            </button>
          </div>
        </div>
      )}

      {/* Active Video Player Preview Section */}
      {isVideoSelected && (
        <div className="pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between pb-1.5 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1 text-purple-300 font-bold">
              <Play className="w-3.5 h-3.5 fill-purple-400" />
              当前视频播放预览
            </span>
            <span className="text-[10px] font-mono text-neutral-500 truncate max-w-xs">
              {value}
            </span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black border border-neutral-800 max-h-52 flex items-center justify-center">
            <video
              src={resolvedVideoSrc}
              controls
              className="w-full h-full max-h-52 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
