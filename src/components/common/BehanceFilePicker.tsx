import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, FileText, Check, Sparkles, AlertCircle, FileArchive, FolderArchive } from 'lucide-react';
import { resolveImageUrl } from '../../config/env';

export interface PresetFile {
  title: string;
  url: string;
  fileName: string;
  fileSize: string;
  fileType: string;
}

export const PRESET_SAMPLE_FILES: PresetFile[] = [
  {
    title: '3D 拟态玻璃 UI 组件库 (Figma)',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Glassmorphism_UI_Kit_v2.fig',
    fileSize: '45.8 MB',
    fileType: 'fig',
  },
  {
    title: 'iOS 18 动效图标与音效源文件包',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'iOS18_Motion_Assets_Pack.zip',
    fileSize: '128.5 MB',
    fileType: 'zip',
  },
  {
    title: '赛博朋克风矢量插画与底纹库',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Cyberpunk_Vector_Pattern.ai',
    fileSize: '82.3 MB',
    fileType: 'ai',
  },
  {
    title: '高精 C4D 3D 抽象流体噪波材质',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'C4D_Fluid_Noise_Materials.c4d',
    fileSize: '210.0 MB',
    fileType: 'c4d',
  },
];

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
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
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

  const handleSelectPreset = (preset: PresetFile) => {
    onFileSelected(null);
    onChangeUrl(preset.url);
    onChangeFileName(preset.fileName);
    onChangeFileSize(preset.fileSize);
    onChangeFileType(preset.fileType);
    setUrlInput(preset.url);
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

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#0057FF] text-white font-semibold shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          示范素材预设
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

      {/* Tab 3: Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_SAMPLE_FILES.map((preset, idx) => {
            const isSelected = fileUrl === preset.url;
            return (
              <div
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#0057FF]/15 border-[#0057FF] text-white'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-white">{preset.title}</p>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {preset.fileName} ({preset.fileSize})
                  </p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#0057FF] shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
