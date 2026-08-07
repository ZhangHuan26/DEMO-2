-- ============================================================
-- LeapLunar04 - 10篇高质量富文本文章
-- 包含完整HTML内容、图片、表格、代码等元素
-- ============================================================

USE blog_backend;
SET NAMES utf8mb4;

-- 获取用户ID（使用已有用户）
SET @user1 = (SELECT id FROM user WHERE email = 'jason.chen@design.studio' LIMIT 1);
SET @user2 = (SELECT id FROM user WHERE email = 'emma.liu@creative.com' LIMIT 1);
SET @user3 = (SELECT id FROM user WHERE email = 'david.wang@brandstudio.cn' LIMIT 1);
SET @user4 = (SELECT id FROM user WHERE email = 'sophia.zhang@photo.art' LIMIT 1);
SET @user5 = (SELECT id FROM user WHERE email = 'alex.motion@animator.io' LIMIT 1);

-- ============================================================
-- 文章1: 人工智能 - AI绘画工具深度测评
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user1,
  (SELECT id FROM article_category WHERE name = '人工智能' LIMIT 1),
  'AI绘画工具深度测评｜Midjourney vs Stable Diffusion vs DALL-E 3',
  '<article class="rich-content">
    <div class="article-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; border-radius: 16px; margin-bottom: 40px;">
      <h1 style="color: white; font-size: 36px; font-weight: 900; margin: 0 0 16px 0;">2024年AI绘画工具全面对比</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">从技术原理到实战应用，帮你选择最适合的AI创作工具</p>
    </div>

    <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=90" alt="AI绘画概念图" style="width: 100%; border-radius: 12px; margin: 30px 0;" />

    <h2 style="font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 40px 0 20px 0;">一、AI绘画工具对比总览</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <tr>
          <th style="padding: 16px; text-align: left; color: white; font-weight: 700;">工具名称</th>
          <th style="padding: 16px; text-align: left; color: white; font-weight: 700;">画质评分</th>
          <th style="padding: 16px; text-align: left; color: white; font-weight: 700;">创意度</th>
          <th style="padding: 16px; text-align: left; color: white; font-weight: 700;">易用性</th>
          <th style="padding: 16px; text-align: left; color: white; font-weight: 700;">价格</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8f9fa;">
          <td style="padding: 16px; font-weight: 600;">Midjourney V6</td>
          <td style="padding: 16px;">⭐⭐⭐⭐⭐ 9.5/10</td>
          <td style="padding: 16px;">⭐⭐⭐⭐⭐ 9.8/10</td>
          <td style="padding: 16px;">⭐⭐⭐⭐ 8.5/10</td>
          <td style="padding: 16px;">$10-60/月</td>
        </tr>
        <tr>
          <td style="padding: 16px; font-weight: 600;">DALL-E 3</td>
          <td style="padding: 16px;">⭐⭐⭐⭐ 8.8/10</td>
          <td style="padding: 16px;">⭐⭐⭐⭐ 8.5/10</td>
          <td style="padding: 16px;">⭐⭐⭐⭐⭐ 9.5/10</td>
          <td style="padding: 16px;">$20/月</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 16px; font-weight: 600;">Stable Diffusion</td>
          <td style="padding: 16px;">⭐⭐⭐⭐ 8.5/10</td>
          <td style="padding: 16px;">⭐⭐⭐⭐⭐ 9.5/10</td>
          <td style="padding: 16px;">⭐⭐⭐ 7.0/10</td>
          <td style="padding: 16px;">免费（开源）</td>
        </tr>
      </tbody>
    </table>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 16px; color: #856404;"><strong>💡 核心观点：</strong> Midjourney适合追求极致画质的创作者，DALL-E 3最易上手，Stable Diffusion最具可定制性。</p>
    </div>

    <h2 style="font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 40px 0 20px 0;">二、Midjourney V6 深度解析</h2>

    <img src="https://images.unsplash.com/photo-1686191128892-c0708d54b9cf?w=1200&q=90" alt="Midjourney作品示例" style="width: 100%; border-radius: 12px; margin: 20px 0;" />

    <h3 style="font-size: 22px; font-weight: 700; color: #333; margin: 30px 0 15px 0;">核心优势</h3>
    <ul style="font-size: 16px; line-height: 1.8; color: #444;">
      <li><strong>极致画质：</strong>V6版本在细节渲染、光影处理上达到商业级水准</li>
      <li><strong>艺术风格：</strong>天然偏向艺术化表达，非常适合插画和概念设计</li>
      <li><strong>社区生态：</strong>Discord社区活跃，大量优质prompt可参考</li>
      <li><strong>快速迭代：</strong>生成速度快，支持Vary Region局部重绘</li>
    </ul>

    <div style="background: #e7f3ff; padding: 25px; border-radius: 12px; margin: 30px 0;">
      <h4 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #0066cc;">📝 实战Prompt模板</h4>
      <pre style="background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: \'Courier New\', monospace; font-size: 14px;">/imagine a serene Japanese garden in autumn, golden maple leaves falling, 
traditional stone lanterns, koi pond with crystal clear water reflecting the sky, 
soft morning light filtering through trees, photorealistic, 8k, highly detailed 
--ar 16:9 --style raw --v 6</pre>
    </div>

    <h3 style="font-size: 22px; font-weight: 700; color: #333; margin: 30px 0 15px 0;">定价策略分析</h3>
    <p style="font-size: 16px; line-height: 1.8; color: #555;">Midjourney采用订阅制，基础版$10/月（200张），标准版$30/月（无限慢速），Pro版$60/月（无限快速+隐私模式）。对于商业用途建议选择Pro版，性价比高。</p>

  </article>',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=90',
  15678, 2341, 1876, 234,
  0,
  NOW() - INTERVAL 2 DAY,
  NOW()
WHERE @user1 IS NOT NULL;

-- ============================================================
-- 文章2: 科技数码 - 智能手机选购指南
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user2,
  (SELECT id FROM article_category WHERE name = '科技数码' LIMIT 1),
  '2024年旗舰手机选购完全指南｜性能、拍照、续航全面对比',
  '<article class="rich-content">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 30px; text-align: center; border-radius: 16px; margin-bottom: 30px;">
      <h1 style="color: white; font-size: 32px; font-weight: 900; margin: 0;">2024旗舰手机横评</h1>
      <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 15px 0 0 0;">iPhone 15 Pro Max vs 小米14 Ultra vs 华为Mate 60 Pro</p>
    </div>

    <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=90" alt="智能手机对比" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">📱 核心参数对比</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
      <thead style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <tr>
          <th style="padding: 12px; color: white; text-align: left;">机型</th>
          <th style="padding: 12px; color: white;">处理器</th>
          <th style="padding: 12px; color: white;">相机</th>
          <th style="padding: 12px; color: white;">续航</th>
          <th style="padding: 12px; color: white;">价格</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8f9fa;">
          <td style="padding: 12px; font-weight: 600;">iPhone 15 Pro Max</td>
          <td style="padding: 12px;">A17 Pro 3nm</td>
          <td style="padding: 12px;">4800万主摄</td>
          <td style="padding: 12px;">29小时</td>
          <td style="padding: 12px;">¥9999起</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600;">小米14 Ultra</td>
          <td style="padding: 12px;">骁龙8 Gen 3</td>
          <td style="padding: 12px;">5000万一英寸</td>
          <td style="padding: 12px;">5300mAh</td>
          <td style="padding: 12px;">¥6499起</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 12px; font-weight: 600;">华为Mate 60 Pro</td>
          <td style="padding: 12px;">麒麟9000s</td>
          <td style="padding: 12px;">5000万超光</td>
          <td style="padding: 12px;">5000mAh</td>
          <td style="padding: 12px;">¥6999起</td>
        </tr>
      </tbody>
    </table>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">📷 拍照能力深度测试</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
      <div>
        <img src="https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=600&q=85" alt="夜景拍照" style="width: 100%; border-radius: 8px;" />
        <p style="text-align: center; margin: 10px 0 0 0; font-size: 14px; color: #666;">夜景模式对比</p>
      </div>
      <div>
        <img src="https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=600&q=85" alt="人像拍照" style="width: 100%; border-radius: 8px;" />
        <p style="text-align: center; margin: 10px 0 0 0; font-size: 14px; color: #666;">人像模式对比</p>
      </div>
    </div>

    <h3 style="font-size: 20px; font-weight: 700; color: #333; margin: 25px 0 15px 0;">夜景拍摄结论</h3>
    <ul style="font-size: 15px; line-height: 1.7; color: #555;">
      <li><strong>iPhone 15 Pro Max：</strong>色彩还原最准确，但高光压制一般</li>
      <li><strong>小米14 Ultra：</strong>整体亮度最高，细节保留最好</li>
      <li><strong>华为Mate 60 Pro：</strong>计算摄影最激进，画面通透性强</li>
    </ul>

    <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 18px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0; color: #155724; font-size: 15px;"><strong>🏆 综合推荐：</strong>预算充足选iPhone，性价比选小米，商务用户选华为</p>
    </div>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">💰 购买建议与时机</h2>
    <p style="font-size: 15px; line-height: 1.7; color: #555;">建议等待618或双11大促，iPhone通常降价500-1000元，安卓旗舰降幅可达1500-2000元。此外，各品牌以旧换新政策也值得关注，最高可抵扣2000元。</p>

    <img src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=90" alt="手机购物" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

  </article>',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&q=90',
  23456, 3421, 2567, 412,
  0,
  NOW() - INTERVAL 3 DAY,
  NOW()
WHERE @user2 IS NOT NULL;

-- ============================================================
-- 文章3: 职场干货 - 高效工作方法
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user3,
  (SELECT id FROM article_category WHERE name = '职场干货' LIMIT 1),
  '我是如何在8小时内完成别人2天工作的？｜时间管理与效率提升实战',
  '<article class="rich-content">
    <div style="background: linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%); padding: 45px 30px; border-radius: 16px; margin-bottom: 30px;">
      <h1 style="color: white; font-size: 30px; font-weight: 900; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">高效工作的10个黄金法则</h1>
      <p style="color: white; font-size: 15px; margin: 12px 0 0 0;">从拖延症晚期到效率达人的蜕变之路</p>
    </div>

    <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=90" alt="高效办公" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 24px; font-weight: 800; color: #1a1a1a; margin: 30px 0 18px 0;">⏰ 时间管理四象限法则</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
      <tr>
        <td style="width: 50%; padding: 20px; background: #fff3cd; border: 2px solid #ffc107; vertical-align: top;">
          <h3 style="margin: 0 0 12px 0; color: #856404; font-size: 18px;">🔥 重要且紧急</h3>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li>客户投诉处理</li>
            <li>项目deadline</li>
            <li>突发危机</li>
          </ul>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #856404;"><strong>策略：</strong>立即执行</p>
        </td>
        <td style="width: 50%; padding: 20px; background: #d1ecf1; border: 2px solid #17a2b8; vertical-align: top;">
          <h3 style="margin: 0 0 12px 0; color: #0c5460; font-size: 18px;">📈 重要不紧急</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
            <li>战略规划</li>
            <li>技能学习</li>
            <li>关系维护</li>
          </ul>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #0c5460;"><strong>策略：</strong>计划安排</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background: #f8d7da; border: 2px solid #dc3545; vertical-align: top;">
          <h3 style="margin: 0 0 12px 0; color: #721c24; font-size: 18px;">📞 紧急不重要</h3>
          <ul style="margin: 0; padding-left: 20px; color: #721c24;">
            <li>大部分电话</li>
            <li>临时会议</li>
            <li>他人请求</li>
          </ul>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #721c24;"><strong>策略：</strong>委托他人</p>
        </td>
        <td style="padding: 20px; background: #d4edda; border: 2px solid #28a745; vertical-align: top;">
          <h3 style="margin: 0 0 12px 0; color: #155724; font-size: 18px;">❌ 不重要不紧急</h3>
          <ul style="margin: 0; padding-left: 20px; color: #155724;">
            <li>刷社交媒体</li>
            <li>闲聊八卦</li>
            <li>无意义会议</li>
          </ul>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #155724;"><strong>策略：</strong>坚决拒绝</p>
        </td>
      </tr>
    </table>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; font-size: 20px;">💡 我的一天时间分配</h3>
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">09:00-11:00</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700;">深度工作（核心任务）</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">11:00-12:00</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700;">会议与沟通</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">14:00-16:00</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700;">项目执行</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">16:00-18:00</p>
          <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700;">复盘与学习</p>
        </div>
      </div>
    </div>

    <h2 style="font-size: 24px; font-weight: 800; color: #1a1a1a; margin: 30px 0 18px 0;">🛠️ 效率工具推荐</h2>

    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90" alt="工作工具" style="width: 100%; border-radius: 12px; margin: 20px 0;" />

    <ol style="font-size: 15px; line-height: 1.8; color: #444;">
      <li><strong>Notion：</strong>个人知识库与项目管理一体化解决方案</li>
      <li><strong>Todoist：</strong>GTD任务管理，支持自然语言输入</li>
      <li><strong>Forest：</strong>番茄钟+专注力训练，种树培养专注习惯</li>
      <li><strong>RescueTime：</strong>自动追踪时间使用，生成效率报告</li>
      <li><strong>Grammarly：</strong>英文写作助手，提升邮件专业度</li>
    </ol>

    <div style="background: #f0f8ff; border: 2px dashed #4a90e2; padding: 20px; border-radius: 12px; margin: 25px 0;">
      <h4 style="margin: 0 0 12px 0; color: #2c5aa0; font-size: 18px;">📊 效率提升数据</h4>
      <p style="margin: 0; line-height: 1.7; color: #555;">实施以上方法3个月后，我的工作效率提升了<strong style="color: #e74c3c; font-size: 20px;">237%</strong>，加班时间减少<strong style="color: #27ae60; font-size: 20px;">68%</strong>，工作满意度提升至<strong style="color: #f39c12; font-size: 20px;">9.2/10</strong>。</p>
    </div>

  </article>',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1600&q=90',
  31245, 4567, 3421, 521,
  0,
  NOW() - INTERVAL 1 DAY,
  NOW()
WHERE @user3 IS NOT NULL;

-- ============================================================
-- 文章4: 美食探店 - 成都美食攻略
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user4,
  (SELECT id FROM article_category WHERE name = '美食探店' LIMIT 1),
  '成都美食48小时完全攻略｜从街头小吃到米其林餐厅的完美路线',
  '<article class="rich-content">
    <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%); padding: 50px 30px; text-align: center; border-radius: 16px; margin-bottom: 30px;">
      <h1 style="color: #2C3E50; font-size: 32px; font-weight: 900; margin: 0;">🌶️ 成都48小时美食地图</h1>
      <p style="color: #2C3E50; font-size: 16px; margin: 12px 0 0 0; font-weight: 600;">15家必吃餐厅 × 8条美食街 × 1份保姆级攻略</p>
    </div>

    <img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=1200&q=90" alt="成都火锅" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🔥 Day 1：街头小吃巡礼</h2>

    <div style="background: linear-gradient(135deg, #FEE140 0%, #FA709A 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: white;">
      <h3 style="margin: 0 0 15px 0; font-size: 22px;">早餐 07:00-09:00｜宽窄巷子</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
          <h4 style="margin: 0 0 8px 0; font-size: 18px;">😋 三大炮</h4>
          <p style="margin: 0; font-size: 14px; opacity: 0.95;">¥12/份 | 现做现卖，软糯香甜</p>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
          <h4 style="margin: 0 0 8px 0; font-size: 18px;">🥟 钟水饺</h4>
          <p style="margin: 0; font-size: 14px; opacity: 0.95;">¥18/碗 | 皮薄馅大，红油麻辣</p>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <thead style="background: linear-gradient(135deg, #FF6B6B 0%, #C44569 100%);">
        <tr>
          <th style="padding: 14px; color: white; text-align: left;">时间段</th>
          <th style="padding: 14px; color: white; text-align: left;">美食推荐</th>
          <th style="padding: 14px; color: white;">人均消费</th>
          <th style="padding: 14px; color: white;">推荐指数</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #FFF5F5;">
          <td style="padding: 14px; font-weight: 600;">10:00</td>
          <td style="padding: 14px;">冒椒火辣（火锅）</td>
          <td style="padding: 14px; text-align: center;">¥120</td>
          <td style="padding: 14px; text-align: center;">⭐⭐⭐⭐⭐</td>
        </tr>
        <tr>
          <td style="padding: 14px; font-weight: 600;">14:00</td>
          <td style="padding: 14px;">陈麻婆豆腐（川菜）</td>
          <td style="padding: 14px; text-align: center;">¥80</td>
          <td style="padding: 14px; text-align: center;">⭐⭐⭐⭐⭐</td>
        </tr>
        <tr style="background: #FFF5F5;">
          <td style="padding: 14px; font-weight: 600;">16:30</td>
          <td style="padding: 14px;">文殊院小吃（下午茶）</td>
          <td style="padding: 14px; text-align: center;">¥50</td>
          <td style="padding: 14px; text-align: center;">⭐⭐⭐⭐</td>
        </tr>
        <tr>
          <td style="padding: 14px; font-weight: 600;">19:00</td>
          <td style="padding: 14px;">玉林串串香</td>
          <td style="padding: 14px; text-align: center;">¥90</td>
          <td style="padding: 14px; text-align: center;">⭐⭐⭐⭐⭐</td>
        </tr>
      </tbody>
    </table>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 25px 0;">
      <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=85" alt="火锅" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
      <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=85" alt="小吃" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
      <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=85" alt="甜品" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
    </div>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🏆 Day 2：高端餐厅体验</h2>

    <div style="background: #2C3E50; color: white; padding: 25px; border-radius: 12px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #FFD700;">⭐ 米其林一星推荐</h3>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.7;">松云泽（日料融合川菜）| 人均 ¥800-1200</p>
      <ul style="margin: 0; line-height: 1.8; font-size: 14px;">
        <li>📍 地址：锦江区东大街芷泉段6号</li>
        <li>⏰ 营业时间：11:30-14:00, 17:30-22:00</li>
        <li>📞 预订：需提前3天预订</li>
        <li>🌟 必点：黑松露烧卖、四川辣子鸡创意料理</li>
      </ul>
    </div>

    <div style="background: #FFE5E5; border-left: 5px solid #FF6B6B; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 12px 0; color: #C44569; font-size: 18px;">🌶️ 辣度等级说明</h4>
      <p style="margin: 0; line-height: 1.7; color: #444;"><strong>微辣：</strong>外地人可接受 | <strong>中辣：</strong>本地人标配 | <strong>特辣：</strong>资深吃货挑战</p>
    </div>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">💰 预算与tips</h2>
    <ul style="font-size: 15px; line-height: 1.8; color: #555;">
      <li><strong>人均花费：</strong>¥500-800（含住宿交通）</li>
      <li><strong>最佳季节：</strong>3-5月或9-11月，避开暑期和春节</li>
      <li><strong>必备App：</strong>大众点评（提前排队）、高德地图</li>
      <li><strong>防踩坑：</strong>景区内餐厅慎选，价格是外面2-3倍</li>
    </ul>

  </article>',
  'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=1600&q=90',
  28934, 3912, 4123, 678,
  0,
  NOW() - INTERVAL 4 DAY,
  NOW()
WHERE @user4 IS NOT NULL;

-- ============================================================
-- 文章5: 健身健康 - 健身房新手指南
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user5,
  (SELECT id FROM article_category WHERE name = '健身健康' LIMIT 1),
  '健身房新手完全指南｜从0到1的90天蜕变计划',
  '<article class="rich-content">
    <div style="background: linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%); padding: 50px 30px; border-radius: 16px; margin-bottom: 30px; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80) center/cover; opacity: 0.3;"></div>
      <div style="position: relative; z-index: 1;">
        <h1 style="color: white; font-size: 34px; font-weight: 900; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">💪 90天健身蜕变计划</h1>
        <p style="color: white; font-size: 16px; margin: 15px 0 0 0;">科学训练 × 营养搭配 × 持续进步</p>
      </div>
    </div>

    <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=90" alt="健身训练" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">📋 训练计划总览</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <tr>
          <th style="padding: 15px; color: white; text-align: left;">阶段</th>
          <th style="padding: 15px; color: white;">周期</th>
          <th style="padding: 15px; color: white;">训练重点</th>
          <th style="padding: 15px; color: white;">预期效果</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #F8F9FA;">
          <td style="padding: 15px; font-weight: 700; color: #667eea;">Phase 1：适应期</td>
          <td style="padding: 15px; text-align: center;">第1-4周</td>
          <td style="padding: 15px;">基础动作学习、心肺耐力</td>
          <td style="padding: 15px;">建立训练习惯</td>
        </tr>
        <tr>
          <td style="padding: 15px; font-weight: 700; color: #667eea;">Phase 2：增长期</td>
          <td style="padding: 15px; text-align: center;">第5-8周</td>
          <td style="padding: 15px;">肌肉力量提升、体脂下降</td>
          <td style="padding: 15px;">体重-3~5kg</td>
        </tr>
        <tr style="background: #F8F9FA;">
          <td style="padding: 15px; font-weight: 700; color: #667eea;">Phase 3：塑形期</td>
          <td style="padding: 15px; text-align: center;">第9-12周</td>
          <td style="padding: 15px;">肌肉线条雕刻、针对性训练</td>
          <td style="padding: 15px;">体脂率-5%</td>
        </tr>
      </tbody>
    </table>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🏋️ 每周训练安排</h2>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 25px 0;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">周一：胸 + 三头</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>卧推 4×8</li>
          <li>上斜哑铃推 3×12</li>
          <li>绳索夹胸 3×15</li>
          <li>三头下压 3×12</li>
        </ul>
      </div>
      <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 12px; color: white;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">周三：背 + 二头</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>硬拉 4×6</li>
          <li>引体向上 3×max</li>
          <li>划船 3×10</li>
          <li>弯举 3×12</li>
        </ul>
      </div>
      <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 20px; border-radius: 12px; color: white;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px;">周五：腿 + 肩</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li>深蹲 4×8</li>
          <li>腿举 3×12</li>
          <li>推举 3×10</li>
          <li>侧平举 3×15</li>
        </ul>
      </div>
    </div>

    <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=90" alt="健身房器械" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🥗 营养搭配方案</h2>

    <div style="background: linear-gradient(135deg, #FFE985 0%, #FA742B 100%); padding: 30px; border-radius: 12px; margin: 25px 0; color: white;">
      <h3 style="margin: 0 0 20px 0; font-size: 22px;">每日宏量营养素分配</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
        <div>
          <div style="font-size: 42px; font-weight: 900; margin-bottom: 8px;">35%</div>
          <div style="font-size: 18px; font-weight: 700;">蛋白质</div>
          <div style="font-size: 13px; opacity: 0.9; margin-top: 8px;">约170g（体重70kg）</div>
        </div>
        <div>
          <div style="font-size: 42px; font-weight: 900; margin-bottom: 8px;">45%</div>
          <div style="font-size: 18px; font-weight: 700;">碳水化合物</div>
          <div style="font-size: 13px; opacity: 0.9; margin-top: 8px;">约220g</div>
        </div>
        <div>
          <div style="font-size: 42px; font-weight: 900; margin-bottom: 8px;">20%</div>
          <div style="font-size: 18px; font-weight: 700;">健康脂肪</div>
          <div style="font-size: 13px; opacity: 0.9; margin-top: 8px;">约45g</div>
        </div>
      </div>
    </div>

    <h3 style="font-size: 20px; font-weight: 700; color: #333; margin: 25px 0 15px 0;">示例食谱（增肌期）</h3>
    <ul style="font-size: 15px; line-height: 1.8; color: #555;">
      <li><strong>早餐 07:00：</strong>燕麦100g + 鸡蛋3个 + 香蕉1根 + 牛奶250ml</li>
      <li><strong>加餐 10:00：</strong>全麦面包2片 + 花生酱 + 蛋白粉30g</li>
      <li><strong>午餐 12:30：</strong>糙米200g + 鸡胸肉150g + 西兰花200g + 橄榄油10ml</li>
      <li><strong>训练前 15:30：</strong>香蕉1根 + 黑咖啡</li>
      <li><strong>训练后 18:00：</strong>蛋白粉40g + 葡萄糖粉30g</li>
      <li><strong>晚餐 19:30：</strong>红薯150g + 三文鱼150g + 生菜沙拉</li>
      <li><strong>睡前 22:00：</strong>酪蛋白蛋白粉30g</li>
    </ul>

    <div style="background: #E8F5E9; border-left: 5px solid #4CAF50; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 12px 0; color: #2E7D32; font-size: 18px;">✅ 训练小贴士</h4>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #2E7D32;">
        <li>每组动作之间休息60-90秒</li>
        <li>训练前热身10分钟，训练后拉伸10分钟</li>
        <li>保证每晚7-8小时睡眠</li>
        <li>每周至少1-2次有氧训练（30分钟）</li>
        <li>记录每次训练重量和组数，持续进步</li>
      </ul>
    </div>

  </article>',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=90',
  19823, 2876, 3245, 389,
  0,
  NOW() - INTERVAL 5 DAY,
  NOW()
WHERE @user5 IS NOT NULL;

-- ============================================================
-- 文章6: 旅行攻略 - 日本深度游
-- ============================================================
INSERT INTO article (user_id, category_id, title, content, cover_image, view_count, like_count, favorite_count, comment_count, status, created_at, updated_at)
SELECT 
  @user1,
  (SELECT id FROM article_category WHERE name = '旅行攻略' LIMIT 1),
  '日本关西7日深度游｜京都-大阪-奈良完整攻略含交通住宿',
  '<article class="rich-content">
    <div style="background: url(https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80) center/cover; padding: 60px 30px; border-radius: 16px; margin-bottom: 30px; position: relative;">
      <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); border-radius: 16px;"></div>
      <div style="position: relative; z-index: 1; text-align: center; color: white;">
        <h1 style="font-size: 36px; font-weight: 900; margin: 0; text-shadow: 2px 2px 8px rgba(0,0,0,0.6);">🇯🇵 关西7日深度之旅</h1>
        <p style="font-size: 17px; margin: 15px 0 0 0;">从古都京都到繁华大阪，感受传统与现代的完美融合</p>
      </div>
    </div>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">📅 7日行程一览</h2>

    <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
      <thead style="background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);">
        <tr>
          <th style="padding: 14px; color: white;">Day</th>
          <th style="padding: 14px; color: white; text-align: left;">城市</th>
          <th style="padding: 14px; color: white; text-align: left;">主要行程</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #FFF5F7;">
          <td style="padding: 14px; text-align: center; font-weight: 700;">1</td>
          <td style="padding: 14px;">京都</td>
          <td style="padding: 14px;">清水寺 → 二年坂三年坂 → 八坂神社 → 祗园</td>
        </tr>
        <tr>
          <td style="padding: 14px; text-align: center; font-weight: 700;">2</td>
          <td style="padding: 14px;">京都</td>
          <td style="padding: 14px;">伏见稻荷大社 → 金阁寺 → 岚山竹林 → 天龙寺</td>
        </tr>
        <tr style="background: #FFF5F7;">
          <td style="padding: 14px; text-align: center; font-weight: 700;">3</td>
          <td style="padding: 14px;">京都</td>
          <td style="padding: 14px;">哲学之道 → 银阁寺 → 京都御所 → 锦市场</td>
        </tr>
        <tr>
          <td style="padding: 14px; text-align: center; font-weight: 700;">4</td>
          <td style="padding: 14px;">奈良</td>
          <td style="padding: 14px;">奈良公园喂小鹿 → 东大寺 → 春日大社 → 奈良町</td>
        </tr>
        <tr style="background: #FFF5F7;">
          <td style="padding: 14px; text-align: center; font-weight: 700;">5-6</td>
          <td style="padding: 14px;">大阪</td>
          <td style="padding: 14px;">大阪城 → 心斋桥 → 道顿堀 → 梅田蓝天大厦</td>
        </tr>
        <tr>
          <td style="padding: 14px; text-align: center; font-weight: 700;">7</td>
          <td style="padding: 14px;">大阪</td>
          <td style="padding: 14px;">环球影城USJ → 黑门市场 → 返程</td>
        </tr>
      </tbody>
    </table>

    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=90" alt="京都街景" style="width: 100%; border-radius: 12px; margin: 25px 0;" />

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🚄 交通攻略</h2>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; color: white;">
      <h3 style="margin: 0 0 15px 0; font-size: 20px;">🎫 JR关西周游券（Kansai Area Pass）</h3>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.7;">最划算的交通方式，涵盖京都、大阪、奈良、神户、姬路所有JR线路</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; margin-bottom: 5px;">1日券</div>
          <div style="font-size: 14px;">¥360（约180元）</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; margin-bottom: 5px;">3日券</div>
          <div style="font-size: 14px;">¥780（约390元）</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; margin-bottom: 5px;">5日券</div>
          <div style="font-size: 14px;">¥1100（约550元）</div>
        </div>
      </div>
    </div>

    <h2 style="font-size: 26px; font-weight: 800; color: #1a1a1a; margin: 35px 0 20px 0;">🏨 住宿推荐</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
      <div style="border: 2px solid #E0E0E0; border-radius: 12px; overflow: hidden;">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=85" alt="京都民宿" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 15px;">
          <h4 style="margin: 0 0 10px 0; font-size: 18px; color: #C06C84;">京都町屋民宿</h4>
          <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">传统日式庭院，榻榻米房间，体验地道京都生活。约¥500/晚</p>
        </div>
      </div>
      <div style="border: 2px solid #E0E0E0; border-radius: 12px; overflow: hidden;">
        <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=85" alt="大阪酒店" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 15px;">
          <h4 style="margin: 0 0 10px 0; font-size: 18px; color: #C06C84;">大阪商务酒店</h4>
          <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">心斋桥附近，交通便利，购物方便。约¥400/晚</p>
        </div>
      </div>
    </div>

    <div style="background: #FFF3E0; border-left: 5px solid #FF9800; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 12px 0; color: #E65100; font-size: 18px;">💰 预算参考（单人）</h4>
      <ul style="margin: 0; padding-left: 20px; color: #E65100; line-height: 1.8;">
        <li>机票：¥2500-4000（往返）</li>
        <li>住宿：¥3000（7晚×¥430）</li>
        <li>交通：¥600（周游券+市内交通）</li>
        <li>餐饮：¥2100（¥300/天）</li>
        <li>门票：¥800（寺庙+USJ）</li>
        <li>购物：¥3000（药妆+手信）</li>
        <li><strong>总计：约¥12000-15000</strong></li>
      </ul>
    </div>

  </article>',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=90',
  26734, 3678, 4234, 523,
  0,
  NOW() - INTERVAL 6 DAY,
  NOW()
WHERE @user1 IS NOT NULL;

