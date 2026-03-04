import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Code2,
} from "lucide-react";
import { blogsApi } from "../../services/api";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

// ─── Toolbar Button ────────────────────────────────────────────────────────
function ToolBtn({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        active
          ? "bg-[color:var(--bright-red)] text-white"
          : "text-gray-400 hover:text-white hover:bg-white/10"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-white/10 mx-1" />;
}

// ─── Toolbar ──────────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = [false, (_: boolean) => {}];
  const uploadingRef = useRef(false);

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prev || "https://");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingRef.current) return;
    uploadingRef.current = true;
    try {
      const url = await blogsApi.uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      alert("Image upload failed. Please try again.");
    } finally {
      uploadingRef.current = false;
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  void uploading;
  void setUploading; // suppress lint warnings on the quick shim

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-[#0d0d0d] border border-white/10 rounded-t-xl">
      {/* History */}
      <ToolBtn
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <Undo size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <Redo size={14} />
      </ToolBtn>

      <Sep />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </ToolBtn>

      <Sep />

      {/* Inline formatting */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
      >
        <Code size={14} />
      </ToolBtn>

      <Sep />

      {/* Lists */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code2 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </ToolBtn>

      <Sep />

      {/* Alignment */}
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={14} />
      </ToolBtn>

      <Sep />

      {/* Link & Image */}
      <ToolBtn
        onClick={setLink}
        active={editor.isActive("link")}
        title="Insert/Edit Link"
      >
        <LinkIcon size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => imageInputRef.current?.click()}
        title="Upload Image"
      >
        <ImageIcon size={14} />
      </ToolBtn>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

// ─── Main Editor Component ─────────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline cursor-pointer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder || "Write your blog content here...",
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "min-h-[400px] max-h-[700px] overflow-y-auto",
          "outline-none text-gray-200 text-sm leading-7 px-6 py-5",
          // Headings
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_h3]:mb-2",
          // Paragraph
          "[&_p]:mb-3 [&_p]:leading-7",
          // Text align
          "[&_.tiptap-text-left]:text-left",
          "[&_.tiptap-text-center]:text-center",
          "[&_.tiptap-text-right]:text-right",
          // Lists
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul_li]:mb-1",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol_li]:mb-1",
          // Blockquote
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[color:var(--bright-red)] [&_blockquote]:pl-4 [&_blockquote]:text-gray-400 [&_blockquote]:italic [&_blockquote]:my-4",
          // Inline code
          "[&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-pink-300",
          // Code block
          "[&_pre]:bg-[#0a0a0a] [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto",
          "[&_pre_code]:bg-transparent [&_pre_code]:text-green-300 [&_pre_code]:p-0",
          // Horizontal rule
          "[&_hr]:border-white/10 [&_hr]:my-6",
          // Images
          "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4 [&_img]:mx-auto [&_img]:block [&_img]:shadow-lg",
          // Links
          "[&_a]:text-blue-400 [&_a]:underline [&_a]:cursor-pointer",
          // Strong & em
          "[&_strong]:text-white [&_strong]:font-bold",
          "[&_em]:italic",
        ].join(" "),
      },
    },
  });

  // Sync external value changes (e.g., when editing an existing blog)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml !== value && value !== undefined) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-[color:var(--bright-red)] transition-colors">
        {editor && <Toolbar editor={editor} />}
        <div className="bg-[#0a0a0a]">
          <EditorContent editor={editor} />
        </div>
        {editor && (
          <div className="px-4 py-1.5 bg-[#0d0d0d] border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {editor.storage.characterCount?.characters?.() ??
                editor.getText().length}{" "}
              chars
            </span>
            <span className="text-xs text-gray-600">
              {editor.getText().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
