import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Heading1, Heading2, List, Quote, Code, Image as ImageIcon, Link as LinkIcon, Eye, Edit3, Save } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '请在此输入您的创作故事、设计思路或项目说明（支持 Markdown 格式）...',
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [draftSaved, setDraftSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save draft every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      if (value) {
        localStorage.setItem('leap_article_draft', value);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [value]);

  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || '文本';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 flex flex-col">
      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-neutral-800 bg-neutral-900/80 text-neutral-400 text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertFormat('**', '**')}
            title="加粗"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('*', '*')}
            title="斜体"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('<u>', '</u>')}
            title="下划线"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-800 my-auto mx-1" />
          <button
            type="button"
            onClick={() => insertFormat('# ')}
            title="一级标题"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors font-bold cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('## ')}
            title="二级标题"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors font-bold cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-800 my-auto mx-1" />
          <button
            type="button"
            onClick={() => insertFormat('- ')}
            title="列表"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('> ')}
            title="引用"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('```\n', '\n```')}
            title="代码块"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('[', '](https://)')}
            title="添加链接"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormat('![alt](', ')')}
            title="插入图片 URL"
            className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View mode & draft indicator */}
        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse">
              <Save className="w-3 h-3" /> 草稿已自动保存
            </span>
          )}
          <div className="flex border border-neutral-800 rounded bg-neutral-950 p-0.5">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                mode === 'edit' ? 'bg-[#0057FF] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" /> 编辑
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                mode === 'preview' ? 'bg-[#0057FF] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" /> 👁️ 作品效果预览
            </button>
          </div>
        </div>
      </div>

      {/* Editor or Preview Pane */}
      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-80 p-4 bg-neutral-950 text-neutral-100 text-sm font-mono focus:outline-none resize-y leading-relaxed"
        />
      ) : (
        <div className="p-6 h-80 overflow-y-auto bg-neutral-900/50 text-neutral-200 prose prose-invert max-w-none text-sm leading-relaxed space-y-4">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(value) }} />
          ) : (
            <p className="text-neutral-500 italic">暂无内容，切换至编辑模式编写...</p>
          )}
        </div>
      )}
    </div>
  );
};

// Helper simple markdown converter
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-3 mb-1">$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[#0057FF] pl-4 italic my-2 text-neutral-300">$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic text-neutral-300">$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" class="rounded-lg my-4 max-h-96 object-cover border border-neutral-800" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0057FF] hover:underline">$1</a>')
    .replace(/\n/g, '<br />');
}
