import React, { useState } from 'react';
import { Flag, X, Send, Upload, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { resolveImageUrl } from '../../config/env';

interface ReportModalProps {
  isOpen: boolean;
  targetType: number; // 0: Article, 1: Video, 2: File, 3: ArticleComment, 4: VideoComment, 5: FileComment, 6: User
  targetId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASON_TYPES = [
  { id: 0, label: '版权侵权 / 抄袭盗用' },
  { id: 1, label: '垃圾广告 / 色情低俗' },
  { id: 2, label: '辱骂攻击 / 不当言论' },
  { id: 3, label: '违法违规 / 政治敏感' },
  { id: 4, label: '其他违规类型' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetType,
  targetId,
  onClose,
  onSuccess,
}) => {
  const [reasonType, setReasonType] = useState<number>(0);
  const [reasonDetail, setReasonDetail] = useState('');
  const [evidenceImage, setEvidenceImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  // Local screenshot file upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEvidenceImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload via API
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.uploadImage(formData);
      if (res && res.url) {
        let finalUrl = res.url;
        if (!/^(data:|blob:|https?:|\/)/i.test(finalUrl)) {
          if (finalUrl.startsWith('uploads/')) {
            finalUrl = `/${finalUrl}`;
          }
        }
        setEvidenceImage(finalUrl);
      }
    } catch {
      // Local preview is already set as fallback
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonDetail.trim()) return;
    setLoading(true);
    try {
      await adminApi.submitReport({
        targetType: Number(targetType),
        targetId: Number(targetId),
        reasonType,
        reasonDetail: reasonDetail.trim(),
        evidenceImages: evidenceImage ? [evidenceImage] : [],
      });
      setSent(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSent(false);
        setReasonDetail('');
        setEvidenceImage('');
        setReasonType(0);
        onClose();
      }, 1500);
    } catch {
      alert('举报提交失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = ['图文作品', '视频作品', '资源文件', '图文评论', '视频评论', '文件评论', '用户资料'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/30 shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">提交违规举报</h3>
            <p className="text-xs text-neutral-400">举报对象: <span className="text-neutral-200 font-semibold">{typeLabels[targetType] || '内容'}</span> <span className="font-mono text-neutral-400">#{targetId}</span></p>
          </div>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-emerald-400 font-bold text-lg">举报已成功提交！</div>
            <p className="text-xs text-neutral-400">社区审核团队将在 24 小时内进行核查处理。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">违规类型 *</label>
              <div className="grid grid-cols-2 gap-1.5">
                {REASON_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setReasonType(type.id)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                      reasonType === type.id
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold shadow-xs'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Detail Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">违规原因详细说明 *</label>
              <textarea
                required
                rows={3}
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder="请详细描述该内容违规的原因（如侵犯版权、涉嫌垃圾广告、发布不当言论或违法内容）..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Local Image Upload Only */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  上传截图证据（选填，仅支持本地选择）
                </label>
                <span className="text-[10px] text-neutral-500 font-mono">本地文件上传</span>
              </div>

              {evidenceImage ? (
                <div className="relative group w-full h-28 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                  <img
                    src={resolveImageUrl(evidenceImage)}
                    alt="Evidence Screenshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setEvidenceImage('')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 删除截图
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-800 hover:border-rose-500/50 bg-neutral-950 rounded-xl p-4 text-center transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="report-evidence-upload"
                    className="hidden"
                  />
                  <label htmlFor="report-evidence-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-rose-400 group-hover:bg-rose-500/10 transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-neutral-300 font-medium">
                      {uploading ? '正在上传本地截图...' : '点击选择本地图片文件作为违规证据'}
                    </span>
                    <span className="text-[10px] text-neutral-500">仅支持本地电脑/设备选择上传（PNG, JPG, WEBP）</span>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? '正在提交...' : '确认提交举报'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

