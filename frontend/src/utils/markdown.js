const escapeHtml = (raw = "") =>
  String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeUrl = (url = "") => {
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|#|\/)/i.test(trimmed)) return trimmed;
  return "#";
};

const renderInline = (text = "") => {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+?)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+?)\*/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) =>
      `<a href="${sanitizeUrl(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`,
  );
  return out;
};

export const renderMarkdownToHtml = (source = "") => {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const pushParagraph = (chunk) => {
    const text = chunk.join(" ").trim();
    if (!text) return;
    blocks.push(`<p>${renderInline(text)}</p>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      i += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      const level = Math.min(6, trimmed.match(/^#+/)[0].length);
      const text = trimmed.replace(/^#{1,6}\s+/, "");
      blocks.push(`<h${level}>${renderInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      blocks.push(`<blockquote>${renderInline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push("<hr />");
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${renderInline(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${renderInline(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s+|>\s?|[-*]\s+|\d+\.\s+|```|(-{3,}|\*{3,}))/.test(lines[i].trim())) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    pushParagraph(paragraphLines);
  }

  return blocks.join("");
};
