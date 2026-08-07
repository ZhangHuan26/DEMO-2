import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Check, AlertCircle, FileArchive, FolderArchive } from 'lucide-react';
import { resolveImageUrl } from '../../config/env';

interface BehanceFilePickerProps {
  fileUrl: string;
  onChangeUrl: (url: string) => void;
  fileName: string;
  onChangeFileName: (name: string) => void;
  fileSize: string;
  onChangeFileSize: (size: string) => void;
  fileType: string;
  onChangeFileType: (type: string) => void;
  selectedFile: File | null;
  onFileSelected: (file: File | null) => void;
  label?: string;
}

export const BehanceFilePicker: React.FC<BehanceFilePickerProps> = ({
  fileUrl,
  onChangeUrl,
  fileName,
  onChangeFileName,
  fileSize,
  onChangeFileSize,
  fileType,
  onChangeFileType,
  selectedFile,
  onFileSelected,
  label = '资源文件上传 / 设置',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(fileUrl);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    onFileSelected(file);

    // Derive name, size, type from selected file
    if (!fileName || fileName.startsWith('http')) {
      onChangeFileName(file.name);
    } else if (!fileName.trim()) {
      onChangeFileName(file.name);
    }
    onChangeFileSize(formatBytes(file.size));
    const ext = file.name.split('.').pop()?.toLowerCase() || 'zip';
    onChangeFileType(ext);

    // Temporary object URL for preview
    const tempUrl = URL.createObjectURL(file);
    onChangeUrl(tempUrl);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onFileSelected(null);
    onChangeUrl(urlInput.trim());
    
    // Auto infer file name and ext if possible
    if (!fileName) {
      const urlParts = urlInput.trim().split('/');
      const lastPart = urlParts[urlParts.length - 1]?.split('?')[0];
      if (lastPart) {
        onChangeFileName(lastPart);
        const ext = lastPart.split('.').pop()?.toLowerCase();
        if (ext && ext.length <= 5) onChangeFileType(ext);
      }
    }
  };

  const currentDisplayUrl = selectedFile ? selectedFile.name : (fileUrl ? resolveImageUrl(fileUrl) : '');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-300">{label}</label>
        <span className="text-[10px] text-neutral-500">支持本地文件上传 (POST /files) 或外部网盘/直链 URL</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#0057FF] text-white font-semibold shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          本地文件上传
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#0057FF] text-white font-semibold shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          网络资源链接
        </button>

      </div>

      {/* Tab 1: Upload Local File */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-800 hover:border-[#0057FF]/60 hover:bg-[#0057FF]/5 bg-neutral-900/60 rounded-xl p-5 text-center cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-[#0057FF]/20 text-neutral-400 group-hover:text-[#0057FF] flex items-center justify-center mx-auto mb-2 transition-colors">
              <FolderArchive className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-200 group-hover:text-white">
              点击选择本地任意格式文件或将其拖拽至此处
            </p>
            <p className="text-[10px] text-neutral-500 mt-1">
              支持上传任何类型的文件，不做格式过滤或类型校验（调用 POST /files multipart/form-data 接口直接发布）
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#0057FF]/20 text-[#0057FF] flex items-center justify-center shrink-0">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-neutral-400">
                    大小: {formatBytes(selectedFile.size)} · 准备在提交时上传至 POST /files
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onFileSelected(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1 bg-neutral-800 hover:bg-neutral-800/80 rounded-lg cursor-pointer"
              >
                更换
              </button>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Network URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://domain.com/resource.zip 或网盘下载链接"
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0057FF]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="bg-[#0057FF] hover:bg-[#0057FF]/90 text-white font-medium text-xs px-4 rounded-lg transition-colors cursor-pointer"
            >
              应用
            </button>
          </div>
          <p className="text-[10px] text-neutral-500">
            请输入可以直接下载该资源文件包的公网 HTTPS URL 或是第三方网盘存储地址。
          </p>
        </div>
      )}

    </div>
  );
};
