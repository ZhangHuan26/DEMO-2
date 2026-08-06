import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, ThumbsUp, Clock } from 'lucide-react';
import { Video } from '../../types';
import { resolveImageUrl } from '../../config/env';

export const VideoCard: React.FC<{ video: Video }> = ({ video }) => {

  return (
    <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* 16:9 Cover Image */}
      <Link to={`/videos/${video.id}`} className="relative aspect-video overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(video.coverImage)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />


        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
          <div className="w-10 h-10 bg-[#0057FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0057FF]/40 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 backdrop-blur-md text-[10px] font-mono text-white rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-neutral-300" />
          {video.duration || '03:15'}
        </span>
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/videos/${video.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1">
              {video.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{video.description || '精选动态视觉设计与视频创作'}</p>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <Link to={`/users/${video.userId}`} className="flex items-center gap-2 hover:text-black transition-colors">
            <img
              src={resolveImageUrl(video.author?.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'}
              alt="创作者"
              className="w-5 h-5 rounded-full object-cover border border-neutral-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop';
              }}
            />

            <span className="font-semibold text-xs text-neutral-700 truncate max-w-[100px]">{video.author?.nickName || '动效设计师'}</span>
          </Link>

          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-neutral-500">
              <Eye className="w-3.5 h-3.5" /> {video.viewCount}
            </span>
            <span className="flex items-center gap-1 text-[#0057FF] font-bold">
              <ThumbsUp className="w-3.5 h-3.5" /> {video.likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
