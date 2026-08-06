import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Lock } from 'lucide-react';
import { FileItem } from '../../types';
import { resolveImageUrl } from '../../config/env';

export const FileCard: React.FC<{ file: FileItem }> = ({ file }) => {

  return (
    <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Preview Image */}
      <Link to={`/files/${file.id}`} className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {file.coverImage ? (
          <img
            src={resolveImageUrl(file.coverImage)}
            alt={file.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // 图片加载失败时显示默认图标
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-xs font-mono font-semibold">${file.fileType || 'FILE'}</span>
                </div>`;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <span className="text-xs font-mono font-semibold">{file.fileType || 'FILE'}</span>
          </div>
        )}


        {/* File Type & Size Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-[#0057FF] text-white text-[10px] font-bold uppercase rounded tracking-wider shadow-xs">
            {file.fileType || 'ZIP'}
          </span>
          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono rounded">
            {file.fileSize || '10 MB'}
          </span>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/files/${file.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1">
              {file.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{file.description || file.fileName}</p>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-mono text-[11px] font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>{file.downloadCount} 次下载</span>
          </div>

          {file.allowDownload === 0 ? (
            <span className="text-[10px] text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
              <Lock className="w-3 h-3" /> 禁止下载
            </span>
          ) : (
            <Link
              to={`/files/${file.id}`}
              className="px-3 py-1 bg-neutral-100 hover:bg-[#0057FF] hover:text-white text-neutral-700 rounded-full text-[11px] font-semibold transition-colors"
            >
              获取资源
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
