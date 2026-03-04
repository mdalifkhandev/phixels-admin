const SIZE_MAP: Record<string, string> = {
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
};

const IMG_TOKEN_REGEX =
  /\[img\s+src="([^"]+)"(?:\s+w="(\d{1,3})")?(?:\s+h="(\d{1,4})")?(?:\s+fit="(cover|contain)")?\s*\]/gi;

const sanitizeImageUrl = (url: string) => {
  const trimmed = (url || '').trim();
  if (!/^https?:\/\//i.test(trimmed)) return '';
  return trimmed.replace(/"/g, '&quot;');
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const applyInlineFormatting = (raw: string) => {
  const imageHtmlChunks: string[] = [];
  const withImagePlaceholders = raw.replace(
    IMG_TOKEN_REGEX,
    (_, src: string, w?: string, h?: string, fit?: string) => {
      const safeSrc = sanitizeImageUrl(src);
      if (!safeSrc) return '';

      const width = Math.min(100, Math.max(10, Number(w || 100)));
      const height = Math.min(1200, Math.max(80, Number(h || 280)));
      const objectFit = fit === 'contain' ? 'contain' : 'cover';

      const html = `<img src="${safeSrc}" alt="content image" data-rt-src="${safeSrc}" class="rt-inline-img" style="display:inline-block;vertical-align:top;width:${width}%;height:${height}px;object-fit:${objectFit};border-radius:10px;margin:6px 6px 6px 0;" />`;
      const token = `__RT_IMG_${imageHtmlChunks.length}__`;
      imageHtmlChunks.push(html);
      return token;
    },
  );

  let text = escapeHtml(withImagePlaceholders);

  text = text.replace(
    /\[size=(sm|base|lg|xl|2xl)\]([\s\S]*?)\[\/size\]/g,
    (_, size: string, content: string) =>
      `<span style="font-size:${SIZE_MAP[size]}; line-height:1.5;">${content}</span>`
  );
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  imageHtmlChunks.forEach((html, index) => {
    text = text.replace(`__RT_IMG_${index}__`, html);
  });

  return text;
};

export const renderRichTextToHtml = (input: string) => {
  if (!input?.trim()) return '';
  if (/<\/?[a-z][\s\S]*>/i.test(input)) return input;

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
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[size=(sm|base|lg|xl|2xl)\]([\s\S]*?)\[\/size\]/g, '$2')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/(\*\*|\*|`)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^- /gm, '')
    .trim();
