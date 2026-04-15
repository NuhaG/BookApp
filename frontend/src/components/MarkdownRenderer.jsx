import React, { useMemo } from "react";
import { renderMarkdownToHtml } from "../utils/markdown";

const MarkdownRenderer = ({ content = "", className = "" }) => {
  const html = useMemo(() => renderMarkdownToHtml(content), [content]);

  return (
    <div
      className={`md-content text-[var(--text-soft)] ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownRenderer;
