export const resolveCoverImageSrc = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';

  const trimmed = value.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5555').replace(/\/$/, '');

  // Keep existing backend paths untouched.
  if (trimmed.startsWith('/uploads/')) {
    return `${baseURL}${trimmed}`;
  }

  // Bare filenames from seeded data are assumed to be in /uploads/covers.
  if (!trimmed.startsWith('/')) {
    return `${baseURL}/uploads/covers/${trimmed}`;
  }

  return `${baseURL}${trimmed}`;
};
