export function formatPublishTime(dateStr?: string): string {
  if (!dateStr) return '发布于最近';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return `发布于${dateStr}`;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `发布于${year}年${month}月${day}日 ${hours}:${minutes}`;
}
