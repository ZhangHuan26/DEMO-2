import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, Calendar } from 'lucide-react';
import { Article } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from '../common/AuthorProfileModal';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1">
      {/* Cover Image */}
      <Link to={`/articles/${article.id}`} className="relative aspect-[16/10] overflow-hidden bg-neutral-100 shrink-0">
        <img
          src={resolveImageUrl(article.coverImage)}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {article.categoryName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/75 backdrop-blur-md text-[11px] font-bold text-white rounded-full shadow-xs">
            {article.categoryName}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/articles/${article.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
              {article.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-2 min-h-[2rem]">
            {article.summary || article.content?.slice(0, 80) || '精选图文设计灵感'}
          </p>
          
          {/* Published Date under Description */}
          {article.createdAt && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono mb-3">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Author Footer & Stats */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 mt-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (article.userId) {
                openAuthorModal(article.userId);
              }
            }}
            className="flex items-center gap-2 hover:text-black transition-colors cursor-pointer text-left"
          >
            <img
              src={resolveImageUrl(article.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={article.author?.nickName || '创作者'}
              className="w-5 h-5 rounded-full object-cover border border-neutral-200 hover:ring-2 hover:ring-[#0057FF] transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
              }}
            />

            <span className="font-semibold text-xs text-neutral-700 truncate max-w-[100px]">{article.author?.nickName || '创作者'}</span>
          </button>

          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-neutral-500">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              {article.viewCount}
            </span>
            <span className="flex items-center gap-1 text-[#0057FF] font-bold">
              <ThumbsUp className="w-3.5 h-3.5 fill-[#0057FF]/20" />
              {article.likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

