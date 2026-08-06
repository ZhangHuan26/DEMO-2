import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Cookie, Check } from 'lucide-react';

export type LegalTab = 'terms' | 'cookies' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);

  // Cookie states
  const [cookieSettings, setCookieSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('cookie_preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      necessary: true,
      analytics: true,
      personalization: true,
    };
  });
  const [cookieSaved, setCookieSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveCookieSettings = () => {
    localStorage.setItem('cookie_preferences', JSON.stringify(cookieSettings));
    setCookieSaved(true);
    setTimeout(() => {
      setCookieSaved(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white px-2 py-0.5 rounded font-black text-xs">LF</div>
            <h2 className="text-base font-bold text-neutral-900">LeapLunar04 法律与条款中心</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            使用条款
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Cookie className="w-4 h-4" />
            Cookie 偏好设置
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            隐私政策
          </button>
        </div>

        {/* Modal Body / Content */}
        <div className="p-6 overflow-y-auto flex-1 text-neutral-700 text-xs space-y-4 leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">1. 服务协议的范围与接受</h3>
                <p>欢迎使用 LeapLunar04 创意设计与作品分享平台（以下简称“本平台”）。访问或使用本平台提供的任何服务，即表示您已阅读、理解并同意接受本《使用条款》的所有约束。若您不同意本条款，请立即停止使用本平台。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">2. 用户账号与安全</h3>
                <p>用户注册时应提供真实有效的信息。您须妥善保管您的账号及密码，并对在您账号下发生的所有活动负全部责任。如发现任何未经授权使用您账号的情况，请立即通知平台管理员。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">3. 知识产权与作品归属</h3>
                <p>平台创作者在 LeapLunar04 上发布的各类原创设计作品、视频、设计素材及文章，其著作权及相关知识产权归原作者所有。未经作者明确书面授权，任何单位或个人不得非法复制、转载、传播或用于商业用途。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">4. 社区规范与内容合规</h3>
                <p>严禁在平台上发布含有政治敏感、色情低俗、暴恐血腥、侵犯他人隐私或虚假广告等违规内容。平台保留对违规作品进行下架、限制展示以及对违规账号实行冻结或注销的权利。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">5. 免责声明与服务变更</h3>
                <p>本平台按“现状”提供服务。对于因不可抗力、网络攻击或系统维护等原因导致的服务中断、数据损失或响应延迟，本平台将在法律允许的最大范围内免责。</p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-5">
              <p className="text-neutral-600">
                LeapLunar04 使用 Cookie 及相关本地存储技术来改善您的浏览体验、保持登录状态并分析社区流量。您可以根据需要调整下方各分类的偏好：
              </p>

              <div className="space-y-3 pt-2">
                {/* Switch 1: Necessary */}
                <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="space-y-0.5 max-w-md">
                    <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                      必要 Cookie
                      <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded font-mono">必需</span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">包含身份验证、系统安全性防护及基本网络请求所需的必要的 Cookie，无法关闭。</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 accent-[#0057FF] cursor-not-allowed mt-1"
                  />
                </div>

                {/* Switch 2: Analytics */}
                <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="space-y-0.5 max-w-md">
                    <div className="font-bold text-neutral-900 text-xs">性能与分析 Cookie</div>
                    <p className="text-neutral-500 text-[11px]">帮助我们了解创作者与访客如何与页面交互、衡量作品浏览量及优化加载速率。</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookieSettings.analytics}
                    onChange={(e) => setCookieSettings({ ...cookieSettings, analytics: e.target.checked })}
                    className="w-4 h-4 accent-[#0057FF] cursor-pointer mt-1"
                  />
                </div>

                {/* Switch 3: Personalization */}
                <div className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="space-y-0.5 max-w-md">
                    <div className="font-bold text-neutral-900 text-xs">个性化推荐 Cookie</div>
                    <p className="text-neutral-500 text-[11px]">用于记住您的界面偏好（如浏览模式）并推荐符合您兴趣的创意设计与作品动态。</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cookieSettings.personalization}
                    onChange={(e) => setCookieSettings({ ...cookieSettings, personalization: e.target.checked })}
                    className="w-4 h-4 accent-[#0057FF] cursor-pointer mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-400">
                  {cookieSaved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 已成功保存 Cookie 偏好设置！
                    </span>
                  ) : (
                    '偏好更改将保存在您的浏览器本地环境中'
                  )}
                </span>
                <button
                  onClick={handleSaveCookieSettings}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold px-5 py-2 rounded-lg shadow transition-all cursor-pointer"
                >
                  保存设置
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">1. 个人信息收集范围</h3>
                <p>我们收集的信息包括您主动提供的注册数据（如电子邮箱、创作者昵称、头像、个人简介），以及您在使用过程中上传的作品内容、评论、点赞互动及访问日志。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">2. 信息的安全防护</h3>
                <p>LeapLunar04 采用业界标准的安全加密（如 HTTPS 传输加密与数据库安全防护），防止您的个人隐私遭受未经授权的访问、泄露、篡改或毁损。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">3. 信息的使用目的</h3>
                <p>收集的信息仅用于：提供与优化社区服务、管理创作者账号、向您提供个性化作品推荐、发送安全通知及处理违规申诉等事项。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">4. 第三方共享与披露</h3>
                <p>除取得您的明确同意、法律法规强制要求或为保障本平台合法权益外，我们绝不会将您的个人身份信息出售、出租或转让给任何第三方。</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">5. 您的隐私管理权利</h3>
                <p>您有权随时在“个人设置”页面查阅、更正或更新您的个人资料，亦可申请注销账号并删除关联的发布数据。</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>LeapLunar04 创意设计社区条款 • 最新修订日期：2026年8月</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-md font-semibold cursor-pointer transition-colors"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
