import { Bold, Italic, List, Link as LinkIcon, Code } from 'lucide-react';
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
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-t-xl">
        <button
          type="button"
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Bold">

          <Bold size={16} />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Italic">

          <Italic size={16} />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="List">

          <List size={16} />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Link">

          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Code">

          <Code size={16} />
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
        className="w-full bg-white/5 border border-white/10 border-t-0 rounded-b-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none transition-colors resize-none font-mono text-sm" />

    </div>);

}