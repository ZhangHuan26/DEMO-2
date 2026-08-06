import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ThumbsUp } from 'lucide-react';
import { Article } from '../../types';
import { resolveImageUrl } from '../../config/env';
import { openAuthorModal } from '../common/AuthorProfileModal';

export const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="group bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-neutral-300 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1.5">
      {/* Cover Image */}
      <Link to={`/articles/${article.id}`} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={resolveImageUrl(article.coverImage)}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {article.categoryName && (
          <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-black/75 backdrop-blur-md text-xs font-bold text-white rounded-full shadow-xs">
            {article.categoryName}
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/articles/${article.id}`}>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#0057FF] transition-colors line-clamp-2 leading-snug mb-2">
              {article.title}
            </h3>
          </Link>
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-5">
            {article.summary || article.content.slice(0, 80)}
          </p>
        </div>

        {/* Author Footer & Stats */}
        <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-600">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (article.userId) {
                openAuthorModal(article.userId);
              }
            }}
            className="flex items-center gap-2.5 hover:text-black transition-colors cursor-pointer text-left"
          >
            <img
              src={resolveImageUrl(article.author?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
              alt={article.author?.nickName || '创作者'}
              className="w-7 h-7 rounded-full object-cover border border-neutral-200 shadow-xs hover:ring-2 hover:ring-[#0057FF] transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
              }}
            />

            <span className="font-semibold text-sm text-neutral-800 truncate max-w-[110px]">{article.author?.nickName || '创作者'}</span>
          </button>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-neutral-500">
              <Eye className="w-4 h-4 text-neutral-400" />
              {article.viewCount}
            </span>
            <span className="flex items-center gap-1 text-[#0057FF] font-bold">
              <ThumbsUp className="w-4 h-4 fill-[#0057FF]/20" />
              {article.likeCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
