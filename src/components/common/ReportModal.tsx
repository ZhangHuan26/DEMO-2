import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { reportsApi } from '../../api/reports';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: number; // 1-文章 2-视频 3-文件 4-评论 5-用户
  targetId: number;
  targetTitle?: string;
}

const TARGET_TYPE_NAMES: Record<number, string> = {
  1: '文章',
  2: '视频',
  3: '文件',
  4: '评论',
  5: '用户'
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('请填写举报原因');
      return;
    }

    setSubmitting(true);
    try {
      await reportsApi.submitReport({
        targetType,
        targetId,
        reason: reason.trim()
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
      }, 2000);
    } catch (error: any) {
      alert(error.message || '举报提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setReason('');
      setSubmitted(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-bold">举报内容</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold text-neutral-900">举报已提交</h3>
              <p className="text-sm text-neutral-600">
                感谢您的反馈，我们会尽快处理
              </p>
            </div>
          ) : (
            <>
              {/* 举报对象信息 */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">举报对象类型</div>
                    <div className="font-bold text-neutral-900">
                      {TARGET_TYPE_NAMES[targetType] || '未知'}
                    </div>
                  </div>
                  {targetTitle && (
                    <div className="text-right max-w-xs">
                      <div className="text-xs text-neutral-500 mb-1">标题</div>
                      <div className="text-sm text-neutral-700 truncate">{targetTitle}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 举报原因 */}
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  举报原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请详细描述您举报的原因，例如：涉及违规内容、侵权、虚假信息等（最少10个字）"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  rows={6}
                  disabled={submitting}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-neutral-500 text-right">
                  {reason.length}/500
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>温馨提示：</strong>恶意举报或虚假举报可能导致您的账号受到限制。请确保举报内容真实有效。
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-2.5 text-neutral-700 font-bold hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || reason.trim().length < 10}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold rounded-lg hover:from-rose-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '提交举报'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
