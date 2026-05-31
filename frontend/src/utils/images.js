export const resolveCoverImageSrc = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";

  const trimmed = value.trim();

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // fallback image
  return "/default-book.jpg";
};