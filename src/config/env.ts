// 后端 API 地址：优先读取 .env 中的 VITE_API_BASE_URL，否则默认 192.168.100.115:8080
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://192.168.100.115:8080';
// 后端 WebSocket 地址：优先读取 .env 中的 VITE_WS_BASE_URL，否则默认 ws://192.168.100.115:8080
export const WS_BASE_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://192.168.100.115:8080';
// 兼容旧代码：LOCAL_SERVER_HOST 指向后端 API 地址
export const LOCAL_SERVER_HOST = API_BASE_URL;
// 兼容旧代码：LOCAL_WS_HOST 指向后端 WebSocket 地址
export const LOCAL_WS_HOST = WS_BASE_URL;

/**
 * 解析图片地址：
 * - 本地上传的图片若为 Data URL、Blob URL、完整 http(s) URL 或斜杠开头的绝对路径，原样返回
 * - 若为相对路径（如 uploads/abc.jpg），自动补全前缀斜杠或拼接后端 API 地址
 */
export const resolveImageUrl = (value?: string | null): string => {
    if (!value) return '';
    const v = value.trim();
    if (!v) return '';
    // 完整 URL、Data URL、Blob URL 或绝对路径：原样返回
    if (/^(https?:|data:|blob:|\/)/i.test(v)) return v;
    // 如果是相对文件夹路径如 uploads/... 补充前缀 /
    if (v.startsWith('uploads/')) {
        return `/${v}`;
    }
    // 纯文件名：拼接后端公共路径
    return `${LOCAL_SERVER_HOST}/${v}`;
};


