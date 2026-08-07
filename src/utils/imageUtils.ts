import { LOCAL_SERVER_HOST } from '../config/env';

export function formatImageUrl(
  url?: string,
  fallback = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Data URLs
  if (trimmed.startsWith('data:')) return trimmed;

  // Online URL or already formatted preview URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Local file name or path
  const fileName = trimmed.replace(/^\/+/, '');
  return `${LOCAL_SERVER_HOST.replace(/\/$/, '')}/${fileName}`;
}
