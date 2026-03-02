const SIZE_MAP: Record<string, string> = {
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const applyInlineFormatting = (raw: string) => {
  let text = escapeHtml(raw);

  text = text.replace(
    /\[size=(sm|base|lg|xl|2xl)\]([\s\S]*?)\[\/size\]/g,
    (_, size: string, content: string) =>
      `<span style="font-size:${SIZE_MAP[size]}; line-height:1.5;">${content}</span>`
  );
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  return text;
};

export const renderRichTextToHtml = (input: string) => {
  if (!input?.trim()) return '';

  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      html.push(`<ul>${listItems.join('')}</ul>`);
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      html.push('<br />');
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = applyInlineFormatting(headingMatch[2]);
      html.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const listMatch = trimmed.match(/^- (.+)$/);
    if (listMatch) {
      listItems.push(`<li>${applyInlineFormatting(listMatch[1])}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${applyInlineFormatting(trimmed)}</p>`);
  }

  flushList();
  return html.join('');
};

export const stripRichText = (input: string) =>
  input
    .replace(/\[size=(sm|base|lg|xl|2xl)\]([\s\S]*?)\[\/size\]/g, '$2')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/(\*\*|\*|`)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^- /gm, '')
    .trim();
