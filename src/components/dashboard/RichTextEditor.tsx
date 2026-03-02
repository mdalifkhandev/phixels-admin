import { useMemo, useRef, useState } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Code } from 'lucide-react';
import { renderRichTextToHtml } from '../../utils/richText';
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const replaceSelection = (transform: (selected: string) => string, fallback = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? start;
    const selected = value.slice(start, end);
    const replacement = transform(selected || fallback);
    const nextValue = value.slice(0, start) + replacement + value.slice(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + replacement.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const applyWrap = (left: string, right: string) => {
    replaceSelection((selected) => `${left}${selected}${right}`, 'text');
  };

  const applyList = () => {
    replaceSelection((selected) => {
      const lines = selected.split('\n').filter((line) => line.trim().length > 0);
      if (lines.length === 0) return '- ';
      return lines.map((line) => `- ${line}`).join('\n');
    });
  };

  const applyLink = () => {
    const url = window.prompt('Enter URL', 'https://');
    if (!url) return;
    replaceSelection((selected) => `[${selected || 'link text'}](${url})`);
  };

  const applySize = (size: 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    replaceSelection((selected) => `[size=${size}]${selected || 'text'}[/size]`);
  };

  const previewHtml = useMemo(() => renderRichTextToHtml(value), [value]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-white/5 border border-white/10 rounded-t-xl">
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => applyWrap('**', '**')}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Bold">

          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyWrap('*', '*')}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Italic">

          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={applyList}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="List">

          <List size={16} />
        </button>
        <button
          type="button"
          onClick={applyLink}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Link">

          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => applyWrap('`', '`')}
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Code">

          <Code size={16} />
        </button>
          <select
            defaultValue=""
            onChange={(e) => {
              const size = e.target.value as 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '';
              if (!size) return;
              applySize(size);
              e.currentTarget.value = '';
            }}
            className="ml-2 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
            style={{ color: '#FFFFFF', backgroundColor: '#141414' }}
            title="Text Size"
          >
            <option value="" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>Text Size</option>
            <option value="sm" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>Small</option>
            <option value="base" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>Normal</option>
            <option value="lg" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>Large</option>
            <option value="xl" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>XL</option>
            <option value="2xl" style={{ color: '#111111', backgroundColor: '#FFFFFF' }}>2XL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-xs rounded ${mode === 'edit' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-xs rounded ${mode === 'preview' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          className="w-full bg-white/5 border border-white/10 border-t-0 rounded-b-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors resize-none font-mono text-sm"
        />
      ) : (
        <div
          className="w-full min-h-[294px] bg-white/5 border border-white/10 border-t-0 rounded-b-xl px-4 py-3 text-gray-200 [&_p]:mb-3 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_li]:mb-1 [&_a]:text-blue-400 [&_a]:underline [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded"
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Nothing to preview yet.</p>' }}
        />
      )}

    </div>);

}
