import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useMemo, useRef, useState } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  Palette,
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
  Columns2,
  Columns3,
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

const EditableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: "",
        parseHTML: (element) => element.getAttribute("style") || "",
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
});

const TextGradient = Mark.create({
  name: "textGradient",

  addAttributes() {
    return {
      from: {
        default: "var(--bright-red)",
        parseHTML: (element) => element.style.getPropertyValue("--tw-gradient-from") || element.getAttribute("data-from"),
        renderHTML: (attributes) => ({ "data-from": attributes.from }),
      },
      to: {
        default: "var(--deep-red)",
        parseHTML: (element) => element.style.getPropertyValue("--tw-gradient-to") || element.getAttribute("data-to"),
        renderHTML: (attributes) => ({ "data-to": attributes.to }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const isGrad = el.classList.contains("text-gradient") || el.classList.contains("text-gradient-custom");
          if (!isGrad) return false;
          
          return {
            from: el.getAttribute("data-from") || "var(--bright-red)",
            to: el.getAttribute("data-to") || "var(--deep-red)",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { from, to, ...rest } = HTMLAttributes;
    
    // Check if it's the default/signature gradient
    const isDefault = 
      (from === "var(--bright-red)" && to === "var(--deep-red)") ||
      (from === "#ED1F24" && to === "#8B161A");

    if (isDefault) {
        return ["span", mergeAttributes(rest, { class: "text-gradient" }), 0];
    }

    // Direct background-image seems more stable than shorthand 'background' in some DOM environments.
    // Also adding vendor prefixes to ensure frontend compatibility.
    const styleString = [
      `background-image: linear-gradient(to right, ${from}, ${to})`,
      `background-clip: text`,
      `-webkit-background-clip: text`,
      `-webkit-text-fill-color: transparent`,
      `display: inline-block`
    ].join(";");

    return [
      "span",
      mergeAttributes(rest, { 
        class: "text-gradient-custom", 
        style: styleString,
        "data-from": from, 
        "data-to": to 
      }),
      0,
    ];
  },
});

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

type ImageLayoutWidth = 100 | 50 | 33;

const buildImageStyle = (opts?: {
  width?: number;
  height?: number;
  fit?: "cover" | "contain";
}) => {
  const width = Math.min(100, Math.max(10, opts?.width ?? 100));
  const height = Math.min(1000, Math.max(100, opts?.height ?? 260));
  const fit = opts?.fit === "contain" ? "contain" : "cover";
  return [
    "display:inline-block",
    "vertical-align:top",
    `width:${width}%`,
    `height:${height}px`,
    `object-fit:${fit}`,
    "margin:6px 6px 6px 0",
    "border-radius:12px",
  ].join(";");
};

const parseImageStyle = (style?: string) => {
  const safe = style || "";
  const widthMatch = safe.match(/width:\s*(\d+)%/i);
  const heightMatch = safe.match(/height:\s*(\d+)px/i);
  const fitMatch = safe.match(/object-fit:\s*(cover|contain)/i);

  return {
    width: widthMatch ? Number(widthMatch[1]) : 100,
    height: heightMatch ? Number(heightMatch[1]) : 260,
    fit: (fitMatch?.[1] as "cover" | "contain" | undefined) || "cover",
  };
};

// ─── Toolbar ──────────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadLayout, setUploadLayout] = useState<ImageLayoutWidth>(100);
  const uploadingRef = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGradientPicker, setShowGradientPicker] = useState(false);

  const [gradFrom, setGradFrom] = useState("#ED1F24");
  const [gradTo, setGradTo] = useState("#8B161A");

  const colors = [
    "#FFFFFF", "#000000", "#ED1F24", "#8B161A", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"
  ];

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || uploadingRef.current) return;
    uploadingRef.current = true;
    try {
      editor.chain().focus().run();
      for (const file of files) {
        const url = await blogsApi.uploadImage(file);
        editor
          .chain()
          .focus()
          .setImage({
            src: url,
            alt: file.name,
            style: buildImageStyle({ width: uploadLayout }),
          } as any)
          .insertContent(" ")
          .run();
      }
    } catch (err) {
      alert("Image upload failed. Please try again.");
    } finally {
      uploadingRef.current = false;
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

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

      <div className="relative">
        <ToolBtn
          onClick={() => setShowColorPicker(!showColorPicker)}
          active={editor.isActive("textStyle") && !!editor.getAttributes("textStyle").color}
          title="Text Color"
        >
          <Palette size={14} />
        </ToolBtn>
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 z-[100] p-3 bg-[#111] border border-white/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-40">
            <div className="grid grid-cols-4 gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setShowColorPicker(false);
                  }}
                  className="w-7 h-7 rounded-md border border-white/10 hover:scale-110 transition-transform cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <div className="relative w-7 h-7 rounded-md border border-white/10 overflow-hidden hover:scale-110 transition-transform">
                <input 
                  type="color" 
                  className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 outline-none"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                    setShowColorPicker(false);
                  }}
                  title="Custom Color"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <ToolBtn
          onClick={() => setShowGradientPicker(!showGradientPicker)}
          active={editor.isActive("textGradient")}
          title="Text Gradient"
        >
          <div className="flex flex-col gap-0.5">
            <span className="w-3.5 h-1 bg-gradient-to-r from-red-500 to-red-900 rounded-full" />
            <span className="w-3.5 h-1 bg-gradient-to-r from-blue-500 to-blue-900 rounded-full opacity-50" />
          </div>
        </ToolBtn>
        {showGradientPicker && (
          <div className="absolute top-full mt-1 left-0 z-50 p-4 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl w-48 space-y-3">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Presets</div>
            <button
               onClick={() => {
                 editor.chain().focus().toggleMark("textGradient", { from: "var(--bright-red)", to: "var(--deep-red)" }).run();
                 setShowGradientPicker(false);
               }}
               className="w-full h-8 rounded bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-[10px] text-white font-bold"
            >
               Custom 1 (Default)
            </button>
            <div className="h-px bg-white/5" />
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Custom Gradient</div>
            <div className="flex items-center gap-2">
               <input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} className="w-full h-6 rounded bg-transparent p-0 cursor-pointer" />
               <span className="text-gray-600">→</span>
               <input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} className="w-full h-6 rounded bg-transparent p-0 cursor-pointer" />
            </div>
            <button
               onClick={() => {
                 editor.chain().focus().setMark("textGradient", { from: gradFrom, to: gradTo }).run();
                 setShowGradientPicker(false);
               }}
               className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-bold"
            >
               Apply Custom
            </button>
          </div>
        )}
      </div>

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
        onClick={() => {
          setUploadLayout(100);
          imageInputRef.current?.click();
        }}
        title="Upload Image"
      >
        <ImageIcon size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => {
          setUploadLayout(50);
          imageInputRef.current?.click();
        }}
        title="Upload 2 Column Images"
      >
        <Columns2 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => {
          setUploadLayout(33);
          imageInputRef.current?.click();
        }}
        title="Upload 3 Column Images"
      >
        <Columns3 size={14} />
      </ToolBtn>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
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
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<Record<
    string,
    any
  > | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextGradient,
      EditableImage.configure({ inline: true, allowBase64: false }),
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
      handleClick(view, _pos, event) {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === "IMG") {
          const { state, dispatch } = view;
          const domPos = view.posAtDOM(target, 0);
          const directNode = state.doc.nodeAt(domPos);
          const prevNode = state.doc.nodeAt(Math.max(0, domPos - 1));
          const selectionPos =
            directNode?.type.name === "image"
              ? domPos
              : prevNode?.type.name === "image"
                ? Math.max(0, domPos - 1)
                : domPos;
          dispatch(
            state.tr.setSelection(
              NodeSelection.create(state.doc, selectionPos),
            ),
          );
          return true;
        }
        return false;
      },
      attributes: {
        class: [
          "min-h-[400px] max-h-[700px] overflow-y-auto",
          "outline-none text-gray-200 text-sm leading-7 px-6 py-5",
          // Headings
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-inherit [&_h1]:mt-6 [&_h1]:mb-3",
          "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-inherit [&_h2]:mt-5 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-inherit [&_h3]:mt-4 [&_h3]:mb-2",
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
          "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-2 [&_img]:align-top [&_img]:shadow-lg",
          // Links
          "[&_a]:text-blue-400 [&_a]:underline [&_a]:cursor-pointer",
          // Strong & em
          "[&_strong]:text-inherit [&_strong]:font-bold",
          "[&_em]:italic",
          // Custom Gradient
          "[&_.text-gradient]:bg-gradient-to-r [&_.text-gradient]:from-[color:var(--bright-red)] [&_.text-gradient]:to-[color:var(--deep-red)] [&_.text-gradient]:bg-clip-text [&_.text-gradient]:text-transparent [&_.text-gradient]:inline-block",
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

  useEffect(() => {
    if (!editor) return;

    const updateSelectedImageState = () => {
      if (editor.isActive("image")) {
        setSelectedImageAttrs(editor.getAttributes("image"));
      } else {
        setSelectedImageAttrs(null);
      }
    };

    updateSelectedImageState();
    editor.on("selectionUpdate", updateSelectedImageState);
    editor.on("update", updateSelectedImageState);

    return () => {
      editor.off("selectionUpdate", updateSelectedImageState);
      editor.off("update", updateSelectedImageState);
    };
  }, [editor]);

  const selectedImageStyle = useMemo(() => {
    if (!selectedImageAttrs) return null;
    return parseImageStyle(selectedImageAttrs.style);
  }, [selectedImageAttrs]);

  const updateSelectedImageStyle = (next: {
    width?: number;
    height?: number;
    fit?: "cover" | "contain";
  }) => {
    if (!editor || !selectedImageStyle) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        style: buildImageStyle({
          width: next.width ?? selectedImageStyle.width,
          height: next.height ?? selectedImageStyle.height,
          fit: next.fit ?? selectedImageStyle.fit,
        }),
      })
      .run();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-[color:var(--bright-red)] transition-colors">
        {editor && <Toolbar editor={editor} />}
        <div className="bg-[#0a0a0a]">
          <EditorContent editor={editor} />
        </div>
        {editor && selectedImageStyle && (
          <div className="px-4 py-3 bg-[#0d0d0d] border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2">
              Selected Image Controls
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ width: 33 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                3 Column
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ width: 50 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                2 Column
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ width: 100 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Full Width
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ height: 180 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Small
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ height: 260 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ height: 340 })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Large
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ fit: "cover" })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Crop
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle({ fit: "contain" })}
                className="px-3 py-1.5 text-xs rounded bg-white/5 text-white hover:bg-white/10"
              >
                Fit
              </button>
            </div>
          </div>
        )}
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
