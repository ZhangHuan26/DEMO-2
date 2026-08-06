import React, { useState } from 'react';
import { Flag, X, Send } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { BehanceImagePicker } from './BehanceImagePicker';

interface ReportModalProps {
  isOpen: boolean;
  targetType: number; // 0: Article, 1: Video, 2: File, 3: ArticleComment, 4: VideoComment, 5: FileComment, 6: User
  targetId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  targetType,
  targetId,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [evidenceImage, setEvidenceImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await adminApi.submitReport({
        targetType,
        targetId,
        reason,
        evidenceImages: evidenceImage ? [evidenceImage] : undefined,
      });
      setSent(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSent(false);
        setReason('');
        setEvidenceImage('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-500/20 text-rose-500 rounded-lg">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">提交违规举报</h3>
            <p className="text-xs text-neutral-400">举报对象: {typeLabels[targetType] || '内容'} #{targetId}</p>
          </div>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-[#0057FF] font-bold text-lg">举报已成功提交！</div>
            <p className="text-xs text-neutral-400">社区审核团队将在 24 小时内进行核查处理。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">违规原因详细说明 *</label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请详细描述该内容违规的原因（如侵犯版权、涉嫌垃圾广告、发布不当言论或违法内容）..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#0057FF]"
              />
            </div>

            <BehanceImagePicker
              value={evidenceImage}
              onChange={setEvidenceImage}
              label="上传截图证据（选填）"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
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
