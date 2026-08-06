# LeapLunar04 创意作品分享平台

## 项目概述

LeapLunar04 是一个类似 Behance 的创意作品分享平台，允许用户发布、展示、管理创意作品。

- **系统名称**：LeapLunar04
- **技术栈**：React
- **语言**：全中文
- **UI参考**：https://www.behance.net/

---

## 1. 后端配置

### API 服务器
```
后台接口地址：http://192.168.100.115:8080
WebSocket地址：ws://192.168.100.115:8080
```

### 环境配置
- 配置文件：`.env`
- **重点**：不使用任何模拟数据，所有数据来自后台接口

---

## 2. 用户系统

### 2.1 系统架构
- **两个独立系统**：
  - 系统1：普通用户系统（role == 0）
  - 系统2：管理员系统（role == 1）
- **无关联**：两个系统完全独立，用户登录时根据角色判断进入相应系统

### 2.2 身份认证
- 登录、注册**独立页面**
- 登录/注册成功**使用弹窗提醒**
- Token 管理：登录后存储 token 用于后续请求验证

### 2.3 权限管理
- 用户只能对**自己创建的作品**进行以下操作：
  - ✏️ 修改
  - 🗑️ 删除
  - 🔄 改变状态

---

## 3. 图片和媒体处理

### 3.1 图片上传策略

**三种封面类型**：

1. **在线路径**：直接输入线上图片URL
   - 上传：存储完整URL
   - 展示：直接显示该URL图片

2. **本地上传**：用户从本地选择图片
   - 上传：仅保存文件路径（不存储文件内容）
   - 展示：`http://192.168.100.115:8080/图片名称`

3. **预存图片选择**：从平台预存库中选择
   - 每个类型预存20张照片
   - 支持类型：照片、视频、图文、文件

### 3.2 图片预览
- 所有本地上传的图片通过以下方式预览：
  ```
  http://192.168.100.115:8080/图片名称
  ```

### 3.3 支持的媒体类型
- 照片（20张预存）
- 视频（20张预存）
- 图文（20张预存）
- 文件（20张预存）

---

## 4. 富文本编辑器

### 4.1 功能需求
富文本编辑器**必须功能齐全**，支持以下功能：

- 📝 **文本格式**：字体大小、颜色、加粗、斜体、下划线等
- 🎨 **背景设置**：背景颜色、背景图片
- 📋 **列表**：有序列表、无序列表
- 🖼️ **媒体**：图片插入、视频嵌入
- 🔗 **链接**：超链接、书签
- 其他：引用、代码块等常用功能

### 4.2 预览功能
- 必须包含**预览页面**
- 用户可在发布前查看最终效果

---

## 5. API 响应状态码

| 状态码 | 说明 | HTTP状态 |
|-------|------|---------|
| 200 | 成功 | 200 |
| 40001 | 参数校验失败 / 业务参数错误 / 上传失败 | 400 |
| 40100 | 未登录或 token 失效 | 401 |
| 40300 | 无权限（非管理员/非本人） | 403 |
| 40301 | 账号被冻结 | 403 |
| 40400 | 资源不存在 | 404 |
| 40900 | 资源冲突（重复关注/点赞等） | 409 |
| 50000 | 服务器内部错误（兜底） | 500 |

---

## 6. 数据规范

### 6.1 API接口规范
- **严格遵循**：API接口文档中的字段定义
- **禁止**：凭空捏造字段及数据
- **原则**：所有字段与后端保持一致

### 6.2 数据流向
```
前端 <--HTTP/WebSocket--> 后端接口 (http://192.168.100.115:8080)
           |
           └─→ 不使用Mock数据
```

---

## 7. UI/UX 设计

### 7.1 设计参考
- **参考网站**：https://www.behance.net/
- **设计风格**：现代、专业、创意

### 7.2 组件要求
- ✨ **下拉框样式**：需要高级、现代的设计
- 🎬 **交互动画**：所有页面需要平滑的交互动画
- 📱 **响应式设计**：适配不同屏幕尺寸

### 7.3 页面通知
- 登录/注册成功：弹窗提醒
- 其他操作反馈：合适的交互提示

---

## 8. 功能模块

### 8.1 普通用户系统（role == 0）
- [ ] 用户注册/登录
- [ ] 个人资料管理
- [ ] 作品发布
  - [ ] 支持三种封面上传方式
  - [ ] 富文本内容编辑
  - [ ] 作品预览
- [ ] 作品管理
  - [ ] 查看自己的作品列表
  - [ ] 编辑作品
  - [ ] 删除作品
  - [ ] 改变作品状态（草稿、发布、归档等）
- [ ] 发现/浏览
  - [ ] 作品流浏览
  - [ ] 作品搜索
  - [ ] 分类浏览
- [ ] 社交功能
  - [ ] 关注/取消关注
  - [ ] 点赞/收藏
  - [ ] 评论

### 8.2 管理员系统（role == 1）
- [ ] 管理员登录
- [ ] 用户管理
  - [ ] 用户列表
  - [ ] 冻结/解冻账号
  - [ ] 用户信息审核
- [ ] 作品管理
  - [ ] 审核待审作品
  - [ ] 删除违规作品
  - [ ] 作品统计
- [ ] 预存资源管理
  - [ ] 照片库管理
  - [ ] 视频库管理
  - [ ] 图文库管理
  - [ ] 文件库管理
- [ ] 系统管理
  - [ ] 数据统计
  - [ ] 系统日志

---

## 9. 页面清单

### 9.1 公共页面
- [ ] 登录页面
- [ ] 注册页面

### 9.2 用户系统页面（role == 0）
- [ ] 首页/发现页
- [ ] 个人资料页
- [ ] 作品详情页
- [ ] 作品发布/编辑页
- [ ] 作品管理页面
- [ ] 用户主页（他人）
- [ ] 搜索结果页

### 9.3 管理员系统页面（role == 1）
- [ ] 管理员首页/仪表板
- [ ] 用户管理页面
- [ ] 作品审核页面
- [ ] 作品管理页面
- [ ] 资源库管理页面
- [ ] 系统统计页面

---

## 10. 技术要求

### 10.1 框架与库
- **前端框架**：React
- **HTTP客户端**：axios（或fetch）
- **富文本编辑**：TipTap / Draft.js / Quill（根据需求选择）
- **状态管理**：Redux / Zustand（根据需求选择）
- **路由**：React Router v6+
- **UI组件库**：Ant Design / Material-UI（根据设计风格选择）
- **动画库**：Framer Motion / React Spring（用于交互动画）

### 10.2 开发规范
- TypeScript（推荐）
- ESLint + Prettier 代码规范
- 环境变量管理（.env）
- API 请求拦截与错误处理
- Token 管理与自动刷新

### 10.3 项目结构建议
```
leaplunar04/
├── public/
├── src/
│   ├── api/              # API 接口调用
│   ├── components/       # 可复用组件
│   ├── pages/           # 页面
│   ├── styles/          # 全局样式
│   ├── utils/           # 工具函数
│   ├── hooks/           # 自定义hooks
│   ├── store/           # 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── constants/       # 常量配置
│   └── App.jsx
├── .env
├── .env.example
├── package.json
└── vite.config.js       # 或 webpack.config.js
```

---

## 11. API 接口完整清单

> 基于后端实际API设计，所有接口统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`

### 11.1 认证模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 用户注册 | POST | `/auth/register` | 无 | 注册后直接签发token |
| 用户登录 | POST | `/auth/login` | 无 | 支持email/account字段登录 |
| 退出登录 | POST | `/auth/logout` | 是 | token被置为revoked |
| 获取当前用户 | GET | `/auth/me` | 是 | 含文章数、粉丝数、关注数统计 |

### 11.2 用户模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 更新个人资料 | PUT | `/users/me` | 是 | 可选字段更新 |
| 修改密码 | PUT | `/users/me/password` | 是 | 需校验原密码 |
| 获取公开资料 | GET | `/users/{id}` | 否 | 不返回邮箱/手机等私密字段 |
| 推荐创作者 | GET | `/users/recommend` | 否 | 按热度推荐，支持limit参数 |
| 我的收藏文件 | GET | `/users/me/favorite-files` | 是 | 分页返回 |
| 我上传的文件 | GET | `/users/me/files` | 是 | 分页返回，支持筛选 |

### 11.3 关注模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 关注用户 | POST | `/users/{id}/follow` | 是 | 不能关注自己 |
| 取消关注 | DELETE | `/users/{id}/follow` | 是 | - |
| 查询关注状态 | GET | `/users/{id}/follow/status` | 是 | 返回isFollowing |
| 粉丝列表 | GET | `/users/{id}/followers` | 否 | 分页返回 |
| 关注列表 | GET | `/users/{id}/following` | 否 | 分页返回 |
| 我的收藏文章 | GET | `/users/me/favorite-articles` | 是 | 分页返回 |
| 我的收藏视频 | GET | `/users/me/favorite-videos` | 是 | 分页返回 |

### 11.4 文章模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 文章列表 | GET | `/articles` | 否 | 支持筛选/搜索/排序，分页 |
| 文章详情 | GET | `/articles/{id}` | 否 | 每访问view_count+1 |
| 发布文章 | POST | `/articles` | 是 | 作者必须是登录用户 |
| 更新文章 | PUT | `/articles/{id}` | 是 | 仅作者本人可修改 |
| 删除文章 | DELETE | `/articles/{id}` | 是 | 作者本人或管理员 |
| 修改文章状态 | PUT | `/articles/{id}/status` | 是 | 0-公共 1-私人 |
| 点赞文章 | POST | `/articles/{id}/like` | 是 | - |
| 取消点赞 | DELETE | `/articles/{id}/like` | 是 | - |
| 收藏文章 | POST | `/articles/{id}/favorite` | 是 | - |
| 取消收藏 | DELETE | `/articles/{id}/favorite` | 是 | - |

### 11.5 视频模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 视频列表 | GET | `/videos` | 否 | 支持筛选/搜索/排序，分页 |
| 视频详情 | GET | `/videos/{id}` | 否 | 每访问view_count+1 |
| 发布视频 | POST | `/videos` | 是 | 作者必须是登录用户 |
| 更新视频 | PUT | `/videos/{id}` | 是 | 仅作者本人可修改 |
| 删除视频 | DELETE | `/videos/{id}` | 是 | 作者本人或管理员 |
| 修改视频状态 | PUT | `/videos/{id}/status` | 是 | 0-公共 1-私人 |
| 点赞视频 | POST | `/videos/{id}/like` | 是 | - |
| 取消点赞 | DELETE | `/videos/{id}/like` | 是 | - |
| 收藏视频 | POST | `/videos/{id}/favorite` | 是 | - |
| 取消收藏 | DELETE | `/videos/{id}/favorite` | 是 | - |

### 11.6 文件模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 文件列表 | GET | `/files` | 否 | 支持筛选/搜索，分页 |
| 文件详情 | GET | `/files/{id}` | 否 | 返回完整元数据 |
| 上传文件 | POST | `/files` | 是 | multipart/form-data |
| 更新文件 | PUT | `/files/{id}` | 是 | 仅上传者本人 |
| 删除文件 | DELETE | `/files/{id}` | 是 | 上传者本人或管理员 |
| 修改文件状态 | PUT | `/files/{id}/status` | 是 | 0-公共 1-私人 |
| 修改下载权限 | PUT | `/files/{id}/allow-download` | 是 | 0-禁止 1-允许 |
| 下载文件 | GET | `/files/{id}/download` | 否 | 返回文件二进制流 |
| 点赞文件 | POST | `/files/{id}/like` | 是 | - |
| 取消点赞 | DELETE | `/files/{id}/like` | 是 | - |
| 收藏文件 | POST | `/files/{id}/favorite` | 是 | - |
| 取消收藏 | DELETE | `/files/{id}/favorite` | 是 | - |

### 11.7 评论模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 文章评论列表 | GET | `/articles/{articleId}/comments` | 否 | 楼层结构，支持排序 |
| 发表文章评论 | POST | `/articles/{articleId}/comments` | 是 | 支持回复功能 |
| 删除文章评论 | DELETE | `/article-comments/{id}` | 是 | 评论者本人或管理员 |
| 点赞文章评论 | POST | `/article-comments/{id}/like` | 是 | - |
| 取消点赞评论 | DELETE | `/article-comments/{id}/like` | 是 | - |
| 视频评论列表 | GET | `/videos/{videoId}/comments` | 否 | 楼层结构，支持排序 |
| 发表视频评论 | POST | `/videos/{videoId}/comments` | 是 | 支持回复功能 |
| 删除视频评论 | DELETE | `/video-comments/{id}` | 是 | 评论者本人或管理员 |
| 点赞视频评论 | POST | `/video-comments/{id}/like` | 是 | - |
| 取消点赞视频评论 | DELETE | `/video-comments/{id}/like` | 是 | - |
| 文件评论列表 | GET | `/files/{fileId}/comments` | 否 | 楼层结构，支持排序 |
| 发表文件评论 | POST | `/files/{fileId}/comments` | 是 | 支持回复功能 |
| 删除文件评论 | DELETE | `/file-comments/{id}` | 是 | 评论者本人或管理员 |
| 点赞文件评论 | POST | `/file-comments/{id}/like` | 是 | - |
| 取消点赞文件评论 | DELETE | `/file-comments/{id}/like` | 是 | - |

### 11.8 分类模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 获取全站分类 | GET | `/categories/all` | 否 | 一次返回所有分类 |
| 文章分类列表 | GET | `/article-categories` | 否 | 不分页 |
| 文件分类列表 | GET | `/file-categories` | 否 | 不分页 |
| 视频分类列表 | GET | `/video-categories` | 否 | 不分页 |
| 创建文章分类(管理) | POST | `/admin/article-categories` | 管理 | - |
| 更新文章分类(管理) | PUT | `/admin/article-categories/{id}` | 管理 | - |
| 删除文章分类(管理) | DELETE | `/admin/article-categories/{id}` | 管理 | 分类id置空，文章保留 |
| 创建文件分类(管理) | POST | `/admin/file-categories` | 管理 | - |
| 更新文件分类(管理) | PUT | `/admin/file-categories/{id}` | 管理 | - |
| 删除文件分类(管理) | DELETE | `/admin/file-categories/{id}` | 管理 | - |
| 创建视频分类(管理) | POST | `/admin/video-categories` | 管理 | - |
| 更新视频分类(管理) | PUT | `/admin/video-categories/{id}` | 管理 | - |
| 删除视频分类(管理) | DELETE | `/admin/video-categories/{id}` | 管理 | - |

### 11.9 内容聚合&搜索

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 内容广场聚合 | GET | `/content/feed` | 否 | 混合文章/视频/文件 |
| 全局搜索 | GET | `/search` | 否 | 按type筛选结果 |
| 管理员搜索 | GET | `/admin/search` | 管理 | 不受隐藏/状态限制 |

### 11.10 聊天&好友

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 会话列表 | GET | `/chat/conversations` | 是 | 含最近消息和未读数 |
| 聊天记录 | GET | `/chat/conversations/{peerId}` | 是 | 与某用户的双向记录 |
| 标记已读 | PUT | `/chat/conversations/{peerId}/read` | 是 | - |
| 未读消息总数 | GET | `/chat/unread-count` | 是 | - |
| 聊天好友列表 | GET | `/chat/friends` | 是 | 互相关注的用户 |
| 搜索用户(聊天) | GET | `/chat/users` | 是 | 按昵称搜索 |

### 11.11 通知模块

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 通知列表 | GET | `/notifications` | 是 | 支持筛选，分页 |
| 未读通知数 | GET | `/notifications/unread-count` | 是 | - |
| 标记单条已读 | PUT | `/notifications/{id}/read` | 是 | - |
| 全部标记已读 | PUT | `/notifications/read-all` | 是 | - |
| 删除通知 | DELETE | `/notifications/{id}` | 是 | - |

### 11.12 举报&申诉&审核(管理)

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 提交举报 | POST | `/reports` | 是 | 举报内容/用户 |
| 举报列表(管理) | GET | `/admin/reports` | 管理 | 分页返回 |
| 举报详情(管理) | GET | `/admin/reports/{id}` | 管理 | - |
| 处理举报(管理) | PUT | `/admin/reports/{id}/handle` | 管理 | 联动隐藏内容 |
| 提交申诉 | POST | `/appeals` | 是 | 对处罚提出异议 |
| 我的申诉列表 | GET | `/appeals` | 是 | 分页返回 |
| 申诉列表(管理) | GET | `/admin/appeals` | 管理 | 分页返回 |
| 申诉详情(管理) | GET | `/admin/appeals/{id}` | 管理 | - |
| 处理申诉(管理) | PUT | `/admin/appeals/{id}/handle` | 管理 | 通过则撤销处罚 |

### 11.13 管理员后台

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 用户列表(管理) | GET | `/admin/users` | 管理 | 支持筛选 |
| 冻结用户(管理) | PUT | `/admin/users/{id}/freeze` | 管理 | 用户无法登录 |
| 解冻用户(管理) | PUT | `/admin/users/{id}/unfreeze` | 管理 | 用户可重新登录 |
| 冻结日志(管理) | GET | `/admin/users/{id}/freeze-logs` | 管理 | 分页返回 |
| 文章列表(管理) | GET | `/admin/articles` | 管理 | 含隐藏的和私人的 |
| 隐藏文章(管理) | PUT | `/admin/articles/{id}/hide` | 管理 | 普通用户看不到 |
| 恢复文章(管理) | PUT | `/admin/articles/{id}/unhide` | 管理 | - |
| 文章评论列表(管理) | GET | `/admin/article-comments` | 管理 | 含隐藏的 |
| 隐藏文章评论(管理) | PUT | `/admin/article-comments/{id}/hide` | 管理 | - |
| 恢复文章评论(管理) | PUT | `/admin/article-comments/{id}/unhide` | 管理 | - |
| 文件列表(管理) | GET | `/admin/files` | 管理 | 支持筛选 |
| 隐藏文件(管理) | PUT | `/admin/files/{id}/hide` | 管理 | - |
| 设置下载权限(管理) | PUT | `/admin/files/{id}/allow-download` | 管理 | - |
| 视频列表(管理) | GET | `/admin/videos` | 管理 | 含隐藏的和私人的 |
| 隐藏视频(管理) | PUT | `/admin/videos/{id}/hide` | 管理 | - |
| 恢复视频(管理) | PUT | `/admin/videos/{id}/unhide` | 管理 | - |
| 视频下载权限(管理) | PUT | `/admin/videos/{id}/allow-download` | 管理 | - |
| 视频评论列表(管理) | GET | `/admin/video-comments` | 管理 | 含隐藏的 |
| 隐藏视频评论(管理) | PUT | `/admin/video-comments/{id}/hide` | 管理 | - |
| 恢复视频评论(管理) | PUT | `/admin/video-comments/{id}/unhide` | 管理 | - |
| 文件评论列表(管理) | GET | `/admin/file-comments` | 管理 | 含隐藏的 |
| 隐藏文件评论(管理) | PUT | `/admin/file-comments/{id}/hide` | 管理 | - |
| 恢复文件评论(管理) | PUT | `/admin/file-comments/{id}/unhide` | 管理 | - |
| 管理员列表(管理) | GET | `/admin/admins` | 管理 | - |
| 设置管理员(管理) | POST | `/admin/admins` | 管理 | 提升用户为管理员 |
| 撤销管理员(管理) | DELETE | `/admin/admins/{id}` | 管理 | 不能撤销自己 |
| 审核日志(管理) | GET | `/admin/moderation-logs` | 管理 | 分页返回 |
| 后台统计(管理) | GET | `/admin/dashboard` | 管理 | 核心统计数据 |
| 获取系统设置(管理) | GET | `/admin/settings` | 管理 | - |
| 更新系统设置(管理) | PUT | `/admin/settings` | 管理 | - |

### 11.14 创作者统计

| 功能 | 方法 | 接口 | 鉴权 | 说明 |
|------|------|------|------|------|
| 内容总览 | GET | `/creator/statistics/overview` | 是 | 作品数、浏览、点赞、收藏统计 |
| 粉丝增长 | GET | `/creator/statistics/followers` | 是 | 按天统计，支持时间范围 |
| 内容产出 | GET | `/creator/statistics/content` | 是 | 按天统计，支持时间范围 |
| 点赞收藏统计 | GET | `/creator/statistics/favorites` | 是 | 总量快照 |

### 11.16 接口鉴权总结

#### **无需登录的接口**（可直接调用，不需要Bearer token）

| 接口 | 方法 | 路径 |
|------|------|------|
| 用户注册 | POST | `/auth/register` |
| 用户登录 | POST | `/auth/login` |
| 获取全站分类 | GET | `/categories/all` |
| 文章分类列表 | GET | `/article-categories` |
| 文件分类列表 | GET | `/file-categories` |
| 视频分类列表 | GET | `/video-categories` |
| 文章分类详情 | GET | `/article-categories/{id}` |
| 文件分类详情 | GET | `/file-categories/{id}` |
| 文章列表（广场） | GET | `/articles` |
| 文章详情 | GET | `/articles/{id}` |
| 视频列表（广场） | GET | `/videos` |
| 视频详情 | GET | `/videos/{id}` |
| 文件列表（广场） | GET | `/files` |
| 文件详情 | GET | `/files/{id}` |
| 文件下载 | GET | `/files/{id}/download` |
| 文章评论列表 | GET | `/articles/{articleId}/comments` |
| 视频评论列表 | GET | `/videos/{videoId}/comments` |
| 文件评论列表 | GET | `/files/{fileId}/comments` |
| 内容广场聚合 | GET | `/content/feed` |
| 全局搜索 | GET | `/search` |
| 获取用户公开资料 | GET | `/users/{id}` |
| 推荐创作者 | GET | `/users/recommend` |
| 粉丝列表 | GET | `/users/{id}/followers` |
| 关注列表 | GET | `/users/{id}/following` |

**小计**：24个接口

---

#### **需要登录的接口**（必须在请求头中传递 `Authorization: Bearer {token}`）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 退出登录 | POST | `/auth/logout` | - |
| 获取当前用户 | GET | `/auth/me` | 含统计数据 |
| 更新个人资料 | PUT | `/users/me` | - |
| 修改密码 | PUT | `/users/me/password` | - |
| 我的收藏文件 | GET | `/users/me/favorite-files` | - |
| 我上传的文件 | GET | `/users/me/files` | - |
| 关注用户 | POST | `/users/{id}/follow` | - |
| 取消关注 | DELETE | `/users/{id}/follow` | - |
| 查询关注状态 | GET | `/users/{id}/follow/status` | - |
| 我的收藏文章 | GET | `/users/me/favorite-articles` | - |
| 我的收藏视频 | GET | `/users/me/favorite-videos` | - |
| 发布文章 | POST | `/articles` | - |
| 更新文章 | PUT | `/articles/{id}` | 仅作者本人 |
| 删除文章 | DELETE | `/articles/{id}` | 作者本人或管理员 |
| 修改文章状态 | PUT | `/articles/{id}/status` | 仅作者本人 |
| 点赞文章 | POST | `/articles/{id}/like` | - |
| 取消点赞文章 | DELETE | `/articles/{id}/like` | - |
| 收藏文章 | POST | `/articles/{id}/favorite` | - |
| 取消收藏文章 | DELETE | `/articles/{id}/favorite` | - |
| 发表文章评论 | POST | `/articles/{articleId}/comments` | - |
| 删除文章评论 | DELETE | `/article-comments/{id}` | 评论者本人或管理员 |
| 点赞文章评论 | POST | `/article-comments/{id}/like` | - |
| 取消点赞文章评论 | DELETE | `/article-comments/{id}/like` | - |
| 发布视频 | POST | `/videos` | - |
| 更新视频 | PUT | `/videos/{id}` | 仅作者本人 |
| 删除视频 | DELETE | `/videos/{id}` | 作者本人或管理员 |
| 修改视频状态 | PUT | `/videos/{id}/status` | 仅作者本人 |
| 点赞视频 | POST | `/videos/{id}/like` | - |
| 取消点赞视频 | DELETE | `/videos/{id}/like` | - |
| 收藏视频 | POST | `/videos/{id}/favorite` | - |
| 取消收藏视频 | DELETE | `/videos/{id}/favorite` | - |
| 发表视频评论 | POST | `/videos/{videoId}/comments` | - |
| 删除视频评论 | DELETE | `/video-comments/{id}` | 评论者本人或管理员 |
| 点赞视频评论 | POST | `/video-comments/{id}/like` | - |
| 取消点赞视频评论 | DELETE | `/video-comments/{id}/like` | - |
| 上传文件 | POST | `/files` | - |
| 更新文件 | PUT | `/files/{id}` | 仅上传者本人 |
| 删除文件 | DELETE | `/files/{id}` | 上传者本人或管理员 |
| 修改文件状态 | PUT | `/files/{id}/status` | 仅上传者本人 |
| 修改文件下载权限 | PUT | `/files/{id}/allow-download` | 仅上传者本人 |
| 点赞文件 | POST | `/files/{id}/like` | - |
| 取消点赞文件 | DELETE | `/files/{id}/like` | - |
| 收藏文件 | POST | `/files/{id}/favorite` | - |
| 取消收藏文件 | DELETE | `/files/{id}/favorite` | - |
| 发表文件评论 | POST | `/files/{fileId}/comments` | - |
| 删除文件评论 | DELETE | `/file-comments/{id}` | 评论者本人或管理员 |
| 点赞文件评论 | POST | `/file-comments/{id}/like` | - |
| 取消点赞文件评论 | DELETE | `/file-comments/{id}/like` | - |
| 会话列表 | GET | `/chat/conversations` | - |
| 聊天记录 | GET | `/chat/conversations/{peerId}` | - |
| 标记会话已读 | PUT | `/chat/conversations/{peerId}/read` | - |
| 未读消息总数 | GET | `/chat/unread-count` | - |
| 聊天好友列表 | GET | `/chat/friends` | - |
| 搜索用户(聊天) | GET | `/chat/users` | - |
| 通知列表 | GET | `/notifications` | 仅本人 |
| 未读通知数 | GET | `/notifications/unread-count` | - |
| 标记单条已读 | PUT | `/notifications/{id}/read` | 仅本人 |
| 全部标记已读 | PUT | `/notifications/read-all` | - |
| 删除通知 | DELETE | `/notifications/{id}` | 仅本人 |
| 提交举报 | POST | `/reports` | - |
| 提交申诉 | POST | `/appeals` | - |
| 我的申诉列表 | GET | `/appeals` | 仅本人 |
| 上传图片素材 | POST | `/uploads/image` | - |
| 内容总览 | GET | `/creator/statistics/overview` | - |
| 粉丝增长 | GET | `/creator/statistics/followers` | - |
| 内容产出 | GET | `/creator/statistics/content` | - |
| 点赞收藏统计 | GET | `/creator/statistics/favorites` | - |

**小计**：63个接口

---

#### **需要管理员权限的接口**（需要Bearer token + role==1）

| 接口 | 方法 | 路径 |
|------|------|------|
| 创建文章分类 | POST | `/admin/article-categories` |
| 更新文章分类 | PUT | `/admin/article-categories/{id}` |
| 删除文章分类 | DELETE | `/admin/article-categories/{id}` |
| 创建文件分类 | POST | `/admin/file-categories` |
| 更新文件分类 | PUT | `/admin/file-categories/{id}` |
| 删除文件分类 | DELETE | `/admin/file-categories/{id}` |
| 创建视频分类 | POST | `/admin/video-categories` |
| 更新视频分类 | PUT | `/admin/video-categories/{id}` |
| 删除视频分类 | DELETE | `/admin/video-categories/{id}` |
| 文章列表(管理) | GET | `/admin/articles` |
| 隐藏文章 | PUT | `/admin/articles/{id}/hide` |
| 恢复文章 | PUT | `/admin/articles/{id}/unhide` |
| 文章评论列表(管理) | GET | `/admin/article-comments` |
| 隐藏文章评论 | PUT | `/admin/article-comments/{id}/hide` |
| 恢复文章评论 | PUT | `/admin/article-comments/{id}/unhide` |
| 文件列表(管理) | GET | `/admin/files` |
| 隐藏文件 | PUT | `/admin/files/{id}/hide` |
| 设置文件下载权限 | PUT | `/admin/files/{id}/allow-download` |
| 视频列表(管理) | GET | `/admin/videos` |
| 隐藏视频 | PUT | `/admin/videos/{id}/hide` |
| 恢复视频 | PUT | `/admin/videos/{id}/unhide` |
| 视频下载权限 | PUT | `/admin/videos/{id}/allow-download` |
| 视频评论列表(管理) | GET | `/admin/video-comments` |
| 隐藏视频评论 | PUT | `/admin/video-comments/{id}/hide` |
| 恢复视频评论 | PUT | `/admin/video-comments/{id}/unhide` |
| 文件评论列表(管理) | GET | `/admin/file-comments` |
| 隐藏文件评论 | PUT | `/admin/file-comments/{id}/hide` |
| 恢复文件评论 | PUT | `/admin/file-comments/{id}/unhide` |
| 用户列表(管理) | GET | `/admin/users` |
| 冻结用户 | PUT | `/admin/users/{id}/freeze` |
| 解冻用户 | PUT | `/admin/users/{id}/unfreeze` |
| 冻结日志 | GET | `/admin/users/{id}/freeze-logs` |
| 举报列表(管理) | GET | `/admin/reports` |
| 举报详情(管理) | GET | `/admin/reports/{id}` |
| 处理举报 | PUT | `/admin/reports/{id}/handle` |
| 申诉列表(管理) | GET | `/admin/appeals` |
| 申诉详情(管理) | GET | `/admin/appeals/{id}` |
| 处理申诉 | PUT | `/admin/appeals/{id}/handle` |
| 管理员列表 | GET | `/admin/admins` |
| 设置管理员 | POST | `/admin/admins` |
| 撤销管理员 | DELETE | `/admin/admins/{id}` |
| 审核日志 | GET | `/admin/moderation-logs` |
| 后台统计 | GET | `/admin/dashboard` |
| 获取系统设置 | GET | `/admin/settings` |
| 更新系统设置 | PUT | `/admin/settings` |
| 全局搜索(管理) | GET | `/admin/search` |

**小计**：47个接口

---

#### **统计汇总**

| 类型 | 数量 | 占比 |
|------|------|------|
| 无需登录 | 24 | 16% |
| 需要登录 | 63 | 42% |
| 需要管理员 | 47 | 31% |
| 其他 | 16 | 11% |
| **总计** | **150+** | **100%** |

---

---

## 12. 数据结构定义

### 12.1 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | Integer | 状态码（0=成功，其他为错误） |
| message | String | 响应消息（成功/错误描述） |
| data | Object/Array | 返回数据，失败时可为null或包含错误详情 |

### 12.2 主要数据结构

#### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户id |
| email | String | 注册邮箱（登录账号） |
| phone | String | 手机号 |
| nickName | String | 昵称 |
| avatar | String | 头像URL |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| birthday | LocalDate | 出生日期 |
| signature | String | 个性签名（最长200字符） |
| role | Integer | 角色：0-普通用户 1-管理员 |
| status | Integer | 账号状态：0-正常 1-已冻结 |
| frozenReason | String | 冻结原因 |
| frozenAt | LocalDateTime | 冻结时间 |
| lastLoginAt | LocalDateTime | 最后登录时间 |
| createdAt | LocalDateTime | 注册时间 |
| updatedAt | LocalDateTime | 资料更新时间 |

#### Article（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 文章id |
| title | String | 标题 |
| content | String | 正文内容（支持HTML富文本） |
| coverImage | String | 封面图URL |
| summary | String | 摘要 |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| commentCount | Integer | 评论数 |
| userId | Long | 作者用户id |
| categoryId | Long | 分类id |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| author | UserBriefVO | 作者简要信息 |
| category | CategoryBriefVO | 分类简要信息 |
| attachments | List\<FileBriefVO\> | 附件列表 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

#### Video（视频）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 视频id |
| title | String | 标题 |
| description | String | 描述 |
| videoUrl | String | 视频播放URL |
| coverImage | String | 封面图URL |
| duration | Integer | 时长（秒） |
| fileSize | Long | 文件大小（字节） |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| commentCount | Integer | 评论数 |
| userId | Long | 作者用户id |
| categoryId | Long | 分类id |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| allowDownload | Integer | 是否允许下载：0-禁止 1-允许 |
| author | UserBriefVO | 作者简要信息 |
| category | CategoryBriefVO | 分类简要信息 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

#### File（文件）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 文件id |
| userId | Long | 上传者用户id |
| articleId | Long | 关联文章id |
| categoryId | Long | 文件分类id |
| originalName | String | 原始文件名 |
| filePath | String | 文件存储路径或访问URL |
| fileExt | String | 文件扩展名 |
| mimeType | String | MIME类型 |
| fileType | Integer | 文件大类：0-其他 1-图片 2-文档 3-视频 4-音频 5-压缩包 |
| fileSize | Long | 文件大小（字节） |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| downloadCount | Integer | 下载次数 |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| allowDownload | Integer | 是否允许下载：0-禁止 1-允许 |
| author | UserBriefVO | 上传者简要信息 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

#### Comment（评论）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 评论id |
| content | String | 评论内容（最长800字符） |
| parentId | Long | 父评论id（为空表示一级评论） |
| rootId | Long | 根评论id（楼层标识） |
| likeCount | Integer | 点赞数 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| user | UserBriefVO | 评论者简要信息 |
| replyTo | UserBriefVO | 被回复的用户信息 |
| replies | List\<CommentVO\> | 子回复列表 |
| replyCount | Integer | 回复数 |
| createdAt | LocalDateTime | 创建时间 |

#### Category（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 分类id |
| name | String | 分类名称 |
| description | String | 分类简介 |
| coverImage | String | 分类封面图URL |
| sortOrder | Integer | 排序值，越小越靠前 |
| articleCount | Long | 文章数量（文章分类） |
| fileCount | Long | 文件数量（文件分类） |
| videoCount | Long | 视频数量（视频分类） |
| createdAt | LocalDateTime | 创建时间 |

#### PrivateMessage（私信）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 消息id |
| senderId | Long | 发送者用户id |
| receiverId | Long | 接收者用户id |
| content | String | 消息内容 |
| isRead | Integer | 是否已读：0-未读 1-已读 |
| readAt | LocalDateTime | 已读时间 |
| createdAt | LocalDateTime | 发送时间 |
| senderNickName | String | 发送者昵称 |
| senderAvatar | String | 发送者头像 |
| receiverNickName | String | 接收者昵称 |
| receiverAvatar | String | 接收者头像 |

#### Notification（通知）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 通知id |
| type | Integer | 通知类型（点赞、评论、关注等） |
| sender | UserBriefVO | 触发通知的用户 |
| targetType | Integer | 关联对象类型 |
| targetId | Long | 关联对象id |
| content | String | 通知内容 |
| isRead | Boolean | 是否已读 |
| createdAt | LocalDateTime | 创建时间 |

#### Report（举报）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 举报id |
| reporterId | Long | 举报人id |
| targetType | Integer | 被举报对象类型 |
| targetId | Long | 被举报对象id |
| reason | String | 举报原因 |
| status | Integer | 处理状态：0-待处理 1-已处理 |
| result | Integer | 处理结果：0-不属实 1-属实 |
| handleResult | String | 处理说明 |
| handledBy | Long | 处理管理员id |
| handledAt | LocalDateTime | 处理时间 |
| createdAt | LocalDateTime | 举报时间 |

---

## 13. 错误处理规范

### 13.1 HTTP 状态码与业务状态码映射

| HTTP状态 | code | message | 说明 |
|---------|------|---------|------|
| 200 | 0 | success | 请求成功 |
| 400 | 40001 | 参数校验失败 | 参数格式错误、缺少必填字段等 |
| 400 | 40001 | 业务参数错误 | 如关注自己、重复点赞等 |
| 400 | 40001 | 上传失败 | 文件格式不支持、大小超限等 |
| 401 | 40100 | 未登录或token失效 | token过期、被撤销或无效 |
| 403 | 40300 | 无权限 | 非管理员/非本人进行操作 |
| 403 | 40301 | 账号被冻结 | 登录时返回，包含冻结原因 |
| 404 | 40400 | 资源不存在 | 访问的资源不存在 |
| 409 | 40900 | 资源冲突 | 重复关注、重复点赞、邮箱重复等 |
| 500 | 50000 | 服务器内部错误 | 后端异常，需记录日志并联系管理员 |

### 13.2 错误响应示例

```json
{
  "code": 40100,
  "message": "未登录或token失效",
  "data": null
}
```

```json
{
  "code": 40301,
  "message": "账号被冻结",
  "data": {
    "frozenReason": "违反社区规则",
    "frozenAt": "2026-08-01T10:30:00"
  }
}
```

### 13.3 常见错误处理

| 场景 | 状态码 | 处理方式 |
|------|--------|---------|
| Token过期 | 401 | 刷新token或重新登录 |
| 账号冻结 | 403 | 显示冻结原因，禁止访问 |
| 资源被隐藏 | 404 | 表现为不存在 |
| 无权限操作 | 403 | 禁止操作，提示"无权限" |
| 重复点赞/关注 | 409 | 提示已操作过，可切换为取消操作 |
| 网络错误 | - | 自动重试，显示加载中或离线提示 |

---

## 14. WebSocket 实时通信

### 14.1 WebSocket 连接

- **地址**：`ws://192.168.100.115:8080/ws/chat`
- **认证**：连接时在Query参数中传递 `token=xxx`
- **消息格式**：JSON

### 14.2 客户端发送消息

```json
{
  "type": "message",
  "receiverId": 123456,
  "content": "你好",
  "timestamp": 1722945600000
}
```

### 14.3 服务端推送消息

```json
{
  "type": "message",
  "senderId": 123456,
  "senderNickName": "张三",
  "senderAvatar": "http://...",
  "content": "你好",
  "timestamp": 1722945600000
}
```

### 14.4 其他WebSocket事件

```json
{
  "type": "online",
  "userId": 123456,
  "nickName": "张三"
}
```

```json
{
  "type": "typing",
  "userId": 123456,
  "isTyping": true
}
```

---

## 15. Token 管理规范

### 15.1 Token 存储

- **存储位置**：`localStorage.setItem('token', token)`
- **请求头携带**：`Authorization: Bearer {token}`
- **过期时间**：从 `expiresAt` 字段读取

### 15.2 Token 刷新机制

```
登录成功 → 返回token + expiresAt
↓
定时检查token过期 → 距过期<5分钟时主动刷新
↓
若刷新失败 → 清空token，重定向到登录页
```

### 15.3 Token 失效处理

- 接收到401响应 → 清空localStorage中的token
- 重定向用户到登录页
- 提示"登录已过期，请重新登录"

---

## 16. 请求/响应示例

### 16.1 注册示例

**请求**：
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "nickName": "张三"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 1001,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-08-13T08:44:00"
  }
}
```

### 16.2 发布文章示例

**请求**：
```bash
POST /articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "我的第一篇文章",
  "content": "<p>文章正文内容，支持HTML富文本</p>",
  "coverImage": "http://192.168.100.115:8080/uploads/article-cover-123.jpg",
  "categoryId": 5,
  "status": 0
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2001,
    "title": "我的第一篇文章",
    "content": "<p>文章正文内容，支持HTML富文本</p>",
    "coverImage": "http://192.168.100.115:8080/uploads/article-cover-123.jpg",
    "viewCount": 0,
    "likeCount": 0,
    "favoriteCount": 0,
    "userId": 1001,
    "categoryId": 5,
    "status": 0,
    "isHidden": 0,
    "author": {
      "id": 1001,
      "nickName": "张三",
      "avatar": "http://..."
    },
    "createdAt": "2026-08-06T08:44:00",
    "updatedAt": "2026-08-06T08:44:00"
  }
}
```

### 16.3 上传图片示例

**请求**：
```bash
POST /uploads/image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: <binary>
scene: article_cover
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "http://192.168.100.115:8080/uploads/article-cover-123.jpg"
  }
}
```

---

## 17. 开发流程

### 17.1 阶段一：基础架构（1-2天）
- [ ] 项目初始化（Vite + React + TypeScript）
- [ ] 安装依赖：axios、react-router、zustand、antd等
- [ ] 项目文件结构搭建
- [ ] .env 环境变量配置
- [ ] API基础类封装（请求拦截、token管理、错误处理）
- [ ] 基础路由配置（登录、用户、管理员三条线）
- [ ] 全局样式和设计tokens设置

### 17.2 阶段二：身份认证（2-3天）
- [ ] 登录页面开发（包含账号/密码输入、记住密码）
- [ ] 注册页面开发（包含邮箱验证、密码强度提示）
- [ ] 密码修改功能
- [ ] Token自动刷新机制
- [ ] 路由权限控制（根据role判断跳转）
- [ ] 登录/注册成功弹窗提醒
- [ ] 账号冻结提示和处理

### 17.3 阶段三：用户系统（2-3天）
- [ ] 个人资料页面
- [ ] 编辑个人资料功能
- [ ] 头像上传（调用 `/uploads/image`）
- [ ] 个人信息展示（粉丝数、关注数、文章数等）
- [ ] 用户公开资料页
- [ ] 关注/取消关注功能
- [ ] 粉丝列表和关注列表

### 17.4 阶段四：核心作品功能（4-5天）
- [ ] 作品列表页（支持分页、筛选、排序）
- [ ] 作品详情页（含作者信息、互动数据）
- [ ] 发布文章页面
  - [ ] 富文本编辑器集成（TipTap/Draft.js）
  - [ ] 封面三种上传方式UI
  - [ ] 分类选择
  - [ ] 草稿/发布状态切换
  - [ ] 发布预览
- [ ] 编辑文章功能
- [ ] 删除文章功能
- [ ] 文章可见性管理（公开/私人）
- [ ] 发布视频页面（类似文章）
- [ ] 文件上传/管理页面

### 17.5 阶段五：互动功能（3-4天）
- [ ] 点赞/取消点赞（文章/视频/文件）
- [ ] 收藏/取消收藏
- [ ] 评论列表（楼层结构展示）
- [ ] 发表评论/回复
- [ ] 删除评论功能
- [ ] 点赞评论
- [ ] 内容广场聚合页面

### 17.6 阶段六：社交功能（2-3天）
- [ ] 搜索功能（全局搜索）
- [ ] 推荐创作者列表
- [ ] 消息会话列表
- [ ] 与用户的聊天窗口
- [ ] WebSocket实时消息接收
- [ ] 未读消息提示

### 17.7 阶段七：管理员系统（4-5天）
- [ ] 管理员后台首页/仪表板
- [ ] 用户管理（列表、冻结/解冻）
- [ ] 内容审核（隐藏/恢复文章/视频/评论）
- [ ] 举报管理（列表、处理）
- [ ] 申诉管理（列表、处理）
- [ ] 分类管理（增删改）
- [ ] 系统设置
- [ ] 数据统计

### 17.8 阶段八：通知与提示（2天）
- [ ] 通知中心页面
- [ ] 实时通知推送（WebSocket）
- [ ] 未读通知标记
- [ ] Toast/弹窗提示系统

### 17.9 阶段九：优化与完善（3-5天）
- [ ] 性能优化（图片懒加载、虚拟滚动等）
- [ ] 动画效果（页面过渡、按钮交互等）
- [ ] 错误处理和用户提示完善
- [ ] 响应式设计适配
- [ ] 网络离线处理
- [ ] SEO优化（如适用）

### 17.10 阶段十：测试与部署（2-3天）
- [ ] 功能测试
- [ ] 兼容性测试
- [ ] 性能测试
- [ ] 安全测试（XSS/CSRF防护）
- [ ] 打包构建
- [ ] 部署到生产环境

---

## 18. 前端技术规范

### 18.1 代码组织

**文件结构**：
```
src/
├── api/                  # API调用，分模块
│   ├── auth.ts          # 认证相关
│   ├── user.ts          # 用户相关
│   ├── article.ts       # 文章相关
│   ├── video.ts         # 视频相关
│   ├── file.ts          # 文件相关
│   └── index.ts         # 统一导出
├── components/          # 可复用组件
│   ├── common/          # 通用组件（Header、Footer等）
│   ├── form/            # 表单组件
│   ├── card/            # 卡片组件
│   └── modal/           # 模态框组件
├── pages/               # 页面组件
│   ├── auth/            # 登录注册
│   ├── user/            # 用户中心
│   ├── article/         # 文章相关页面
│   ├── admin/           # 管理后台
│   └── not-found.tsx    # 404页面
├── hooks/               # 自定义hooks
│   ├── useApi.ts        # API请求hook
│   ├── useAuth.ts       # 认证hook
│   └── ...
├── store/               # 状态管理（Zustand）
│   ├── authStore.ts     # 认证状态
│   ├── userStore.ts     # 用户状态
│   └── index.ts         # 统一导出
├── styles/              # 全局样式
│   ├── variables.css    # CSS变量
│   ├── global.css       # 全局样式
│   └── animations.css   # 动画
├── types/               # TypeScript类型定义
│   ├── api.ts           # API响应类型
│   ├── models.ts        # 数据模型
│   └── ...
├── utils/               # 工具函数
│   ├── request.ts       # HTTP请求工具
│   ├── storage.ts       # 本地存储工具
│   ├── format.ts        # 格式化函数
│   └── ...
├── constants/           # 常量
│   ├── config.ts        # 配置常量
│   ├── enum.ts          # 枚举值
│   └── ...
├── App.tsx              # 根组件
└── main.tsx             # 入口文件
```

### 18.2 API请求工具

```typescript
// utils/request.ts
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

// 请求拦截
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截
instance.interceptors.response.use(
  response => {
    const { code, data, message } = response.data
    if (code === 0) {
      return data
    } else if (code === 40100) {
      // token失效，清除本地存储并重定向到登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(message)
  },
  error => Promise.reject(error)
)

export default instance
```

### 18.3 状态管理

使用Zustand管理认证、用户、列表等全局状态，而非Context。

### 18.4 命名规范

- 文件名：PascalCase（组件）/ camelCase（工具函数）
- 变量名：camelCase
- 常量名：UPPER_SNAKE_CASE
- 接口名：I + PascalCase
- 类型名：PascalCase

### 18.5 代码注释

- 复杂逻辑：添加注释说明意图
- 函数参数：使用JSDoc注释
- 避免过度注释：代码应该自说明

---

## 19. 安全与防护

### 19.1 XSS防护

- 对用户输入进行转义，避免HTML注入
- 富文本编辑器使用信任库（如DOMPurify）
- 评论内容展示时进行HTML转义

### 19.2 CSRF防护

- Token放在Authorization header中（不使用cookie）
- 重要操作使用POST/PUT/DELETE而非GET

### 19.3 认证与授权

- Token存储在localStorage（而非cookie）
- 敏感操作需要检查当前用户权限
- 管理员操作需要验证role==1

### 19.4 数据验证

- 客户端进行基础验证（格式、长度等）
- 依赖服务器端的严格验证
- 不信任客户端传来的userId等数据

---

## 20. 性能优化

### 20.1 列表优化

- 使用虚拟滚动（react-window）展示大列表
- 图片懒加载
- 分页加载，避免一次性加载全部

### 20.2 包体积

- 动态导入（code splitting）
- 去除未使用的依赖
- 使用Tree-shaking

### 20.3 网络优化

- 请求复用和去重
- 图片压缩和格式优化（webp）
- 缓存策略（HTTP缓存+本地缓存）

### 20.4 渲染优化

- React.memo 避免不必要重渲染
- useCallback 缓存回调函数
- useMemo 缓存计算结果

---

## 21. 常见问题与注意事项

### 21.1 关键要点

✅ **必做**：
- 所有API调用都要处理401响应，自动登出
- 上传文件前检查文件类型和大小
- 富文本编辑器必须支持图片插入和视频嵌入
- 评论显示需要按楼层结构展示，支持展开/收起
- 管理员操作需要二次确认
- 用户操作需要实时反馈（loading/toast）

❌ **禁止**：
- 在localStorage中存储敏感信息（密码、邮箱等）
- 直接在URL中传递用户id作为标识
- 信任用户传来的status/role字段
- 未经验证就执行删除操作
- 在前端显示后端错误的敏感细节

### 21.2 兼容性

- 支持主流浏览器（Chrome/Firefox/Safari/Edge）
- IE11及以下不需要支持
- 移动端（iOS Safari/Android Chrome）适配

### 21.3 可访问性

- 重要按钮支持键盘快捷键
- 图片提供alt属性
- 颜色不是唯一识别方式

---

## 22. 环境变量配置

### 22.1 .env.example

```env
VITE_API_URL=http://192.168.100.115:8080
VITE_WS_URL=ws://192.168.100.115:8080
VITE_APP_NAME=LeapLunar04
VITE_APP_DESC=创意作品分享平台
VITE_MAX_UPLOAD_SIZE=10485760
VITE_SUPPORTED_IMAGE_TYPES=jpg,jpeg,png,gif,webp
VITE_SUPPORTED_VIDEO_TYPES=mp4,webm,avi
```

### 22.2 .env.development

```env
VITE_API_URL=http://192.168.100.115:8080
VITE_WS_URL=ws://192.168.100.115:8080
VITE_APP_NAME=LeapLunar04 (Dev)
```

### 22.3 .env.production

```env
VITE_API_URL=https://api.leaplunar04.com
VITE_WS_URL=wss://api.leaplunar04.com
VITE_APP_NAME=LeapLunar04
```

---

## 23. 依赖清单

### 23.1 核心依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "antd": "^5.11.0",
    "@ant-design/icons": "^5.2.0",
    "classnames": "^2.3.0",
    "dayjs": "^1.11.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### 23.2 可选依赖

| 库 | 版本 | 用途 |
|----|------|------|
| @tiptap/react | ^2.0.0 | 富文本编辑器 |
| @tiptap/starter-kit | ^2.0.0 | Tiptap核心功能 |
| @tiptap/extension-image | ^2.0.0 | Tiptap图片扩展 |
| @tiptap/extension-link | ^2.0.0 | Tiptap链接扩展 |
| react-window | ^8.8.0 | 虚拟滚动 |
| react-lazy-load-image-component | ^1.6.0 | 图片懒加载 |
| dompurify | ^3.0.0 | HTML净化 |
| nprogress | ^0.2.0 | 进度条 |
| react-hot-toast | ^2.4.0 | Toast通知 |

---

## 24. 参考资源

### 24.1 API文档与服务

| 资源 | 地址 | 说明 |
|------|------|------|
| UI参考 | https://www.behance.net/ | 作品展示平台UI设计参考 |
| 后端API服务器 | http://192.168.100.115:8080 | 开发环境后端服务 |
| WebSocket服务 | ws://192.168.100.115:8080/ws/chat | 实时消息通信 |

### 24.2 技术文档

| 库/框架 | 文档链接 | 说明 |
|--------|--------|------|
| React | https://react.dev | React官方文档 |
| React Router | https://reactrouter.com | 路由库文档 |
| Ant Design | https://ant.design | UI组件库文档 |
| TypeScript | https://www.typescriptlang.org | TypeScript官方文档 |
| Zustand | https://github.com/pmndrs/zustand | 状态管理库 |
| Axios | https://axios-http.com | HTTP客户端库 |
| Vite | https://vitejs.dev | 前端构建工具 |
| Tiptap | https://tiptap.dev | 富文本编辑器 |
| Framer Motion | https://www.framer.com/motion | 动画库 |

---

## 25. 部署建议

### 25.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:5173
```

### 25.2 生产环境

```bash
# 打包构建
npm run build

# 预览打包结果
npm run preview

# 部署到服务器（例如Nginx）
```

---

## 26. 项目体检清单

### 26.1 功能完成度

- [ ] 用户注册/登录/登出
- [ ] 个人资料编辑
- [ ] 发布文章/视频/文件
- [ ] 编辑/删除作品
- [ ] 作品列表展示
- [ ] 作品详情页
- [ ] 点赞/收藏功能
- [ ] 评论/回复功能
- [ ] 关注/粉丝功能
- [ ] 私信聊天
- [ ] 搜索功能
- [ ] 管理后台（用户/内容/审核）
- [ ] 通知系统
- [ ] 数据统计

### 26.2 质量检查

- [ ] 代码无console.log
- [ ] 无未使用的导入
- [ ] TypeScript类型完整
- [ ] 所有API错误都有处理
- [ ] UI响应式适配
- [ ] 性能指标达标
- [ ] 无内存泄漏
- [ ] 安全审计完成

---

## 27. 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v2.0 | 2026-08-06 | 基于完整API文档完善，补充数据结构、错误处理、技术规范 |
| v1.0 | 2026-08-06 | 初始项目需求文档 |

---

**文档生成日期**：2026年8月6日  
**最后更新**：2026年8月6日  
**文档状态**：已完成  
**项目状态**：待开发  

---

## 附录：为AI代码生成准备

### A. 文档使用指南

将本完整文档发送给AI代码生成工具（如Claude），并使用以下提示词：

```
我有一个创意作品分享平台项目（LeapLunar04），需要你帮我完成React前端开发。

请基于以下项目需求文档进行开发：

[粘贴本文档的所有内容]

核心要求：
1. 严格按照第11章API接口完整清单实现所有功能
2. 遵循第12章数据结构定义，确保类型正确
3. 参考第13-15章的请求/响应示例
4. 实现第18章前端技术规范的项目结构和API工具
5. 遵循第19章的安全防护措施
6. 应用第20章的性能优化方案
7. 使用第22章的环境变量配置

优先级：
- 第一优先：基础架构 + 身份认证 + 用户系统
- 第二优先：核心作品功能 + 互动功能
- 第三优先：管理员系统 + 其他功能

请按阶段逐步开发，每个阶段完成后给我提交检查清单。
```

### B. 快速启动命令

```bash
# 1. 创建项目
npm create vite@latest leaplunar04 -- --template react-ts

# 2. 进入项目目录
cd leaplunar04

# 3. 安装依赖
npm install

# 4. 按需安装额外依赖
npm install react-router-dom zustand antd @ant-design/icons axios framer-motion

# 5. 创建环境文件
echo 'VITE_API_URL=http://192.168.100.115:8080' > .env.development
echo 'VITE_WS_URL=ws://192.168.100.115:8080' >> .env.development

# 6. 启动开发服务器
npm run dev
```

### C. 项目文件夹结构初始化脚本

```bash
#!/bin/bash
mkdir -p src/{api,components/{common,form,card,modal},pages/{auth,user,article,admin},hooks,store,styles,types,utils,constants}
touch src/{api/index.ts,hooks/useApi.ts,store/index.ts,types/index.ts,utils/request.ts,constants/config.ts}
echo "✅ 项目结构已初始化"
```

---

**文档完成日期**：2026年8月6日 08:44:00  
**适用版本**：LeapLunar04 v2.0  
**作者**：AI Assistant  
**语言**：简体中文  

---

*本文档为LeapLunar04创意作品分享平台的完整项目需求与技术规范文档。包含系统设计、API接口、数据结构、开发流程、技术规范等全面的开发指导。可直接用于AI代码生成或人工开发参考。*