export const LOCAL_SERVER_HOST = (import.meta as any).env?.VITE_API_BASE_URL || 'http://192.168.100.115:8080';
export const LOCAL_WS_HOST = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://192.168.100.115:8080';

export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('data:')) {
    return url;
  }

  // 如果已经包含 http:// 或 https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      // 仅当指向本地或局域网开发服务器 (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x) 时，才替换基准路径
      if (
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.startsWith('192.168.') ||
        parsed.hostname.startsWith('10.')
      ) {
        const base = LOCAL_SERVER_HOST.replace(/\/$/, '');
        return `${base}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      // 外部 CDN / Unsplash 等公网图片链接，直接原样返回
      return url;
    } catch {
      return url;
    }
  }

  const base = LOCAL_SERVER_HOST.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};
