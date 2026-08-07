/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** HTTP 接口基础路径 */
  readonly VITE_API_BASE_URL: string;
  /** WebSocket 基础地址 */
  readonly VITE_WS_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
