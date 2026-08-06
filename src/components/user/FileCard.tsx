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
        <img
          src={resolveImageUrl(file.coverImage)}
          alt={file.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />


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
