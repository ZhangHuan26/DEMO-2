# 页面功能与接口使用文档

本文档汇总了前端所有页面（用户端 + 管理端）的功能说明，以及每个页面所调用的后端接口。

> 说明：所有接口均通过 `src/api/*.ts` 中的封装方法调用。后端统一返回 `Result<T>` 结构：`{ code, data, message }`，其中 `code === 0` 表示成功，业务数据在 `data` 字段中。列表类接口的 `data` 通常为 `PageResult`：`{ total, list }`。

---

## 目录

- [一、用户端页面](#一用户端页面)
  - [1. 探索页 ExplorePage](#1-探索页-explorepage)
  - [2. 首页/文章列表 HomePage](#2-首页文章列表-homepage)
  - [3. 视频列表 VideosPage](#3-视频列表-videospage)
  - [4. 文件列表 FilesPage](#4-文件列表-filespage)
  - [5. 关注动态 FeedPage](#5-关注动态-feedpage)
  - [6. 推荐创作者 CreatorsPage](#6-推荐创作者-creatorspage)
  - [7. 搜索 SearchPage](#7-搜索-searchpage)
  - [8. 文章详情 ArticleDetailPage](#8-文章详情-articledetailpage)
  - [9. 视频详情 VideoDetailPage](#9-视频详情-videodetailpage)
  - [10. 文件详情 FileDetailPage](#10-文件详情-filedetailpage)
  - [11. 用户主页 UserProfilePage](#11-用户主页-userprofilepage)
  - [12. 创作者中心 CreatorDashboardPage](#12-创作者中心-creatordashboardpage)
  - [13. 通知中心 NotificationsPage](#13-通知中心-notificationspage)
  - [14. 个人设置 SettingsPage](#14-个人设置-settingspage)
  - [15. 我的收藏 MyFavoritesPage](#15-我的收藏-myfavoritespage)
  - [16. 我的文件 MyFilesPage](#16-我的文件-myfilespage)
  - [17. 我的申诉 MyAppealsPage](#17-我的申诉-myappealspage)
- [二、认证页面](#二认证页面)
  - [18. 登录 LoginPage](#18-登录-loginpage)
  - [19. 注册 RegisterPage](#19-注册-registerpage)
- [三、管理端页面](#三管理端页面)
  - [20. 管理后台框架 AdminShell](#20-管理后台框架-adminshell)
  - [21. 仪表盘 AdminDashboardHome](#21-仪表盘-admindashboardhome)
  - [22. 用户管理 AdminUsersPage](#22-用户管理-adminuserspage)
  - [23. 文章管理 AdminArticlesPage](#23-文章管理-adminarticlespage)
  - [24. 视频管理 AdminVideosPage](#24-视频管理-adminvideospage)
  - [25. 文件管理 AdminFilesPage](#25-文件管理-adminfilespage)
  - [26. 举报管理 AdminReportsPage](#26-举报管理-adminreportspage)
  - [27. 申诉管理 AdminAppealsPage](#27-申诉管理-adminappealspage)
  - [28. 日志管理 AdminLogsPage](#28-日志管理-adminlogspage)
  - [29. 分类管理 AdminCategoriesPage](#29-分类管理-admincategoriespage)
- [四、公共组件](#四公共组件)
- [五、API 封装模块总览](#五api-封装模块总览)

---

## 一、用户端页面

### 1. 探索页 ExplorePage

**路由**：`/` 或 `/explore`

**功能**：
- 展示文章、视频、文件三类作品的混合信息流
- 支持按分类筛选、按热度/最新排序
- 支持"热门"、"最新"等标签切换
- 展示作品卡片（封面、标题、作者、点赞数等）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文章列表 | `articlesApi.getArticles()` | `GET /articles` |
| 获取视频列表 | `videosApi.getVideos()` | `GET /videos` |
| 获取文件列表 | `filesApi.getFiles()` | `GET /files` |
| 获取全部分类 | `categoriesApi.getAllCategories()` | `GET /categories/all` |

---

### 2. 首页/文章列表 HomePage

**路由**：`/articles`

**功能**：
- 展示文章列表，支持按分类筛选
- 展示文章卡片（封面、标题、摘要、作者、点赞/收藏数）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文章列表 | `articlesApi.getArticles()` | `GET /articles` |
| 获取文章分类 | `articlesApi.getCategories()` | `GET /article-categories` |

---

### 3. 视频列表 VideosPage

**路由**：`/videos`

**功能**：
- 展示视频列表，支持按分类筛选
- 展示视频卡片（封面、标题、时长、作者）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取视频列表 | `videosApi.getVideos()` | `GET /videos` |
| 获取视频分类 | `videosApi.getCategories()` | `GET /video-categories` |

---

### 4. 文件列表 FilesPage

**路由**：`/files`

**功能**：
- 展示资源文件列表，支持按分类筛选
- 展示文件卡片（封面、标题、文件类型、大小）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文件列表 | `filesApi.getFiles()` | `GET /files` |
| 获取文件分类 | `filesApi.getCategories()` | `GET /file-categories` |

---

### 5. 关注动态 FeedPage

**路由**：`/feed`

**功能**：
- 展示当前用户关注的人发布的最新作品动态
- 需要登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取关注动态文章 | `articlesApi.getFeedArticles()` | `GET /articles/feed` |

---

### 6. 推荐创作者 CreatorsPage

**路由**：`/creators`

**功能**：
- 展示推荐创作者榜单（按作品数 × 粉丝数加权排序）
- 展示创作者头像、昵称、签名、粉丝数、作品数
- 支持一键关注/取消关注创作者
- 点击创作者可进入其主页

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取推荐创作者列表 | `authApi.getRecommendedCreators()` | `GET /users/recommend` |
| 查询关注状态 | `authApi.getFollowStatus(id)` | `GET /users/{id}/follow/status` |
| 关注创作者 | `authApi.followUser(id)` | `POST /users/{id}/follow` |
| 取消关注 | `authApi.unfollowUser(id)` | `DELETE /users/{id}/follow` |

---

### 7. 搜索 SearchPage

**路由**：`/search`

**功能**：
- 全局搜索文章、视频、文件、用户
- 支持按类型切换搜索结果

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 全局搜索 | `adminApi.globalSearch(keyword, type)` | `GET /search` |

---

### 8. 文章详情 ArticleDetailPage

**路由**：`/articles/:id`

**功能**：
- 展示文章完整内容（标题、作者、封面、正文）
- 支持点赞、收藏
- 支持评论、回复评论、删除自己的评论
- 展示相关文章

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文章详情 | `articlesApi.getArticleById(id)` | `GET /articles/{id}` |
| 点赞文章 | `articlesApi.likeArticle(id)` | `POST /articles/{id}/like` |
| 取消点赞 | `articlesApi.unlikeArticle(id)` | `DELETE /articles/{id}/like` |
| 收藏文章 | `articlesApi.favoriteArticle(id)` | `POST /articles/{id}/favorite` |
| 取消收藏 | `articlesApi.unfavoriteArticle(id)` | `DELETE /articles/{id}/favorite` |
| 获取评论 | `articlesApi.getComments(id)` | `GET /articles/{id}/comments` |
| 发表评论 | `articlesApi.createComment(id, data)` | `POST /articles/{id}/comments` |
| 删除评论 | `articlesApi.deleteComment(id)` | `DELETE /article-comments/{id}` |
| 评论点赞 | `articlesApi.likeComment(id)` | `POST /article-comments/{id}/like` |
| 评论取消点赞 | `articlesApi.unlikeComment(id)` | `DELETE /article-comments/{id}/like` |
| 获取作者信息 | `authApi.getUserById(userId)` | `GET /users/{id}` |

---

### 9. 视频详情 VideoDetailPage

**路由**：`/videos/:id`

**功能**：
- 播放视频，展示视频信息（标题、作者、时长）
- 支持点赞、收藏
- 支持评论、回复评论

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取视频详情 | `videosApi.getVideoById(id)` | `GET /videos/{id}` |
| 点赞视频 | `videosApi.likeVideo(id)` | `POST /videos/{id}/like` |
| 收藏视频 | `videosApi.favoriteVideo(id)` | `POST /videos/{id}/favorite` |
| 获取评论 | `videosApi.getComments(id)` | `GET /videos/{id}/comments` |
| 发表评论 | `videosApi.createComment(id, data)` | `POST /videos/{id}/comments` |

---

### 10. 文件详情 FileDetailPage

**路由**：`/files/:id`

**功能**：
- 展示文件信息（标题、类型、大小、作者）
- 支持下载文件
- 支持点赞、收藏
- 支持评论、回复评论、删除评论

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文件详情 | `filesApi.getFileById(id)` | `GET /files/{id}` |
| 下载文件 | `filesApi.downloadFile(id)` | `GET /files/{id}/download` |
| 点赞文件 | `filesApi.likeFile(id)` | `POST /files/{id}/like` |
| 收藏文件 | `filesApi.favoriteFile(id)` | `POST /files/{id}/favorite` |
| 获取评论 | `filesApi.getComments(id)` | `GET /files/{id}/comments` |
| 发表评论 | `filesApi.createComment(id, data)` | `POST /files/{id}/comments` |
| 删除评论 | `filesApi.deleteComment(id)` | `DELETE /file-comments/{id}` |

---

### 11. 用户主页 UserProfilePage

**路由**：`/users/:id`

**功能**：
- 展示用户公开资料（头像、昵称、签名、粉丝数、关注数、作品数）
- 展示该用户发布的文章、视频、文件（按 Tab 切换）
- 支持关注/取消关注
- 支持查看粉丝/关注列表（弹窗）
- 支持私信交流（聊天抽屉）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取用户资料 | `authApi.getUserById(id)` | `GET /users/{id}` |
| 获取文章列表 | `articlesApi.getArticles()` | `GET /articles` |
| 获取视频列表 | `videosApi.getVideos()` | `GET /videos` |
| 获取文件列表 | `filesApi.getFiles()` | `GET /files` |
| 关注用户 | `authApi.followUser(id)` | `POST /users/{id}/follow` |
| 取消关注 | `authApi.unfollowUser(id)` | `DELETE /users/{id}/follow` |
| 获取粉丝列表 | `authApi.getFollowers(id)` | `GET /users/{id}/followers` |
| 获取关注列表 | `authApi.getFollowing(id)` | `GET /users/{id}/following` |
| 获取聊天记录 | `chatApi.getPeerMessages(id)` | `GET /chat/conversations/{peerId}` |
| 获取会话列表 | `chatApi.getConversations()` | `GET /chat/conversations` |
| 标记会话已读 | `chatApi.markConversationRead(id)` | `PUT /chat/conversations/{peerId}/read` |
| 获取未读消息数 | `chatApi.getUnreadChatCount()` | `GET /chat/unread-count` |
| 发送消息 | `chatApi.sendMessage()` / WebSocket | `WS /ws/chat` |

---

### 12. 创作者中心 CreatorDashboardPage

**路由**：`/creator`

**功能**：
- 创作者数据统计（总浏览量、点赞数、收藏数、粉丝数）
- 粉丝增长趋势图、内容分布图、点赞收藏快照
- 需要创作者/登录身份

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取创作者统计数据 | `adminApi.getCreatorStats()` | `GET /creator/statistics/overview` |

---

### 13. 通知中心 NotificationsPage

**路由**：`/notifications`

**功能**：
- 展示系统通知列表
- 支持标记单条已读、全部已读
- 支持删除通知

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取通知列表 | `adminApi.getNotifications()` | `GET /notifications` |
| 获取未读通知数 | `adminApi.getUnreadNotificationCount()` | `GET /notifications/unread-count` |
| 标记已读 | `adminApi.markNotificationRead(id)` | `PUT /notifications/{id}/read` |
| 全部已读 | `adminApi.markAllNotificationsRead()` | `PUT /notifications/read-all` |
| 删除通知 | `adminApi.deleteNotification(id)` | `DELETE /notifications/{id}` |

---

### 14. 个人设置 SettingsPage

**路由**：`/settings`

**功能**：
- 修改个人资料（昵称、头像、性别、生日、签名、手机号）
- 修改密码

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取当前用户 | `authApi.getMe()` | `GET /auth/me` |
| 更新资料 | `authApi.updateProfile(data)` | `PUT /users/me` |
| 修改密码 | `authApi.updatePassword(data)` | `PUT /users/me/password` |
| 上传图片 | `adminApi.uploadImage(formData)` | `POST /uploads/image` |

---

### 15. 我的收藏 MyFavoritesPage

**路由**：`/me/favorites`

**功能**：
- 展示我收藏的文章、视频、文件（按 Tab 切换）
- 需要登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取收藏的文章 | `articlesApi.getFavoriteArticles()` | `GET /users/me/favorite-articles` |
| 获取收藏的视频 | `videosApi.getFavoriteVideos()` | `GET /users/me/favorite-videos` |
| 获取收藏的文件 | `filesApi.getFavoriteFiles()` | `GET /users/me/favorite-files` |

---

### 16. 我的文件 MyFilesPage

**路由**：`/me/files`

**功能**：
- 展示我上传的文件（含私人文件）
- 支持删除文件
- 需要登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取我的文件 | `filesApi.getMyFiles()` | `GET /users/me/files` |
| 删除文件 | `filesApi.deleteFile(id)` | `DELETE /files/{id}` |

---

### 17. 我的申诉 MyAppealsPage

**路由**：`/me/appeals`

**功能**：
- 展示我提交的申诉记录
- 支持提交新申诉
- 需要登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取我的申诉 | `adminApi.getMyAppeals()` | `GET /appeals` |
| 提交申诉 | `adminApi.submitAppeal(data)` | `POST /appeals` |

---

## 二、认证页面

### 18. 登录 LoginPage

**路由**：`/login`

**功能**：
- 邮箱 + 密码登录
- 登录成功后跳转（管理员跳转 `/admin`，普通用户跳转首页）
- 处理账号冻结错误提示

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 登录 | `authApi.login(data)` | `POST /auth/login` |

---

### 19. 注册 RegisterPage

**路由**：`/register`

**功能**：
- 邮箱 + 密码 + 昵称注册
- 注册成功后自动登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 注册 | `authApi.register(data)` | `POST /auth/register` |

---

## 三、管理端页面

### 20. 管理后台框架 AdminShell

**路由**：`/admin`（父路由）

**功能**：
- 管理后台布局（侧边栏导航 + 内容区）
- 校验管理员身份，非管理员跳转登录页
- 提供退出登录

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取当前用户 | `authApi.getMe()` | `GET /auth/me` |
| 退出登录 | `authApi.logout()` | `POST /auth/logout` |

---

### 21. 仪表盘 AdminDashboardHome

**路由**：`/admin`（首页）

**功能**：
- 展示平台统计数据（用户数、冻结用户数、文章数、视频数、文件数）
- 待处理举报数、待处理申诉数
- 最近操作日志

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取仪表盘统计 | `adminApi.getAdminDashboard()` | `GET /admin/dashboard` |
| 获取操作日志 | `adminApi.getModerationLogs()` | `GET /admin/moderation-logs` |

---

### 22. 用户管理 AdminUsersPage

**路由**：`/admin/users`

**功能**：
- 用户列表（支持关键字、状态、角色筛选）
- 冻结/解冻用户
- 查看冻结日志
- 授予/撤销管理员
- 查看用户详情

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取用户列表 | `adminApi.getUsers(params)` | `GET /admin/users` |
| 冻结用户 | `authApi.freezeUser(id, reason)` | `PUT /admin/users/{id}/freeze` |
| 解冻用户 | `authApi.unfreezeUser(id)` | `PUT /admin/users/{id}/unfreeze` |
| 获取冻结日志 | `authApi.getFreezeLogs(id)` | `GET /admin/users/{id}/freeze-logs` |
| 授予管理员 | `adminApi.grantAdmin({ userId })` | `POST /admin/admins` |
| 撤销管理员 | `adminApi.revokeAdmin(id)` | `DELETE /admin/admins/{id}` |
| 获取管理员列表 | `adminApi.getAdmins()` | `GET /admin/admins` |

---

### 23. 文章管理 AdminArticlesPage

**路由**：`/admin/articles`

**功能**：
- 文章列表（支持筛选）
- 隐藏/取消隐藏文章
- 删除文章

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文章列表 | `articlesApi.getAdminArticles(params)` | `GET /admin/articles` |
| 隐藏文章 | `articlesApi.hideArticle(id, reason)` | `PUT /admin/articles/{id}/hide` |
| 取消隐藏 | `articlesApi.unhideArticle(id)` | `PUT /admin/articles/{id}/unhide` |
| 删除文章 | `articlesApi.deleteArticle(id)` | `DELETE /articles/{id}` |

---

### 24. 视频管理 AdminVideosPage

**路由**：`/admin/videos`

**功能**：
- 视频列表（支持筛选）
- 隐藏/取消隐藏视频
- 允许/禁止下载
- 删除视频

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取视频列表 | `videosApi.getAdminVideos(params)` | `GET /admin/videos` |
| 隐藏视频 | `videosApi.hideVideo(id, reason)` | `PUT /admin/videos/{id}/hide` |
| 取消隐藏 | `videosApi.unhideVideo(id, reason)` | `PUT /admin/videos/{id}/unhide` |
| 允许下载 | `videosApi.toggleVideoDownload(id, allowDownload)` | `PUT /admin/videos/{id}/allow-download` |
| 删除视频 | `videosApi.deleteVideo(id)` | `DELETE /videos/{id}` |

---

### 25. 文件管理 AdminFilesPage

**路由**：`/admin/files`

**功能**：
- 文件列表（支持筛选）
- 隐藏/取消隐藏文件
- 允许/禁止下载
- 删除文件

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取文件列表 | `filesApi.getAdminFiles(params)` | `GET /admin/files` |
| 隐藏文件 | `filesApi.hideFile(id, reason)` | `PUT /admin/files/{id}/hide` |
| 取消隐藏 | `filesApi.unhideFile(id, reason)` | `PUT /admin/files/{id}/unhide` |
| 允许下载 | `filesApi.toggleAllowDownload(id, allowDownload)` | `PUT /admin/files/{id}/allow-download` |
| 删除文件 | `filesApi.deleteFile(id)` | `DELETE /files/{id}` |

---

### 26. 举报管理 AdminReportsPage

**路由**：`/admin/reports`

**功能**：
- 举报列表
- 查看举报详情
- 处理举报（通过/驳回，可隐藏目标内容）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取举报列表 | `adminApi.getAdminReports()` | `GET /admin/reports` |
| 获取举报详情 | `adminApi.getAdminReportById(id)` | `GET /admin/reports/{id}` |
| 处理举报 | `adminApi.handleReport(id, data)` | `PUT /admin/reports/{id}/handle` |

---

### 27. 申诉管理 AdminAppealsPage

**路由**：`/admin/appeals`

**功能**：
- 申诉列表
- 查看申诉详情
- 处理申诉（通过/驳回）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取申诉列表 | `adminApi.getAdminAppeals()` | `GET /admin/appeals` |
| 获取申诉详情 | `adminApi.getAdminAppealById(id)` | `GET /admin/appeals/{id}` |
| 处理申诉 | `adminApi.handleAppeal(id, data)` | `PUT /admin/appeals/{id}/handle` |

---

### 28. 日志管理 AdminLogsPage

**路由**：`/admin/logs`

**功能**：
- 展示冻结日志（用户冻结记录）
- 展示操作日志（内容审核记录）

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取冻结日志 | `adminApi.getFreezeLogs()` | `GET /admin/users/{id}/freeze-logs` |
| 获取操作日志 | `adminApi.getModerationLogs()` | `GET /admin/moderation-logs` |

---

### 29. 分类管理 AdminCategoriesPage

**路由**：`/admin/categories`

**功能**：
- 管理文章、视频、文件三类分类
- 支持新增、编辑、删除分类

**使用的接口**：
| 功能 | 封装方法 | 后端接口 |
|------|---------|---------|
| 获取全部分类 | `categoriesApi.getAllCategories()` | `GET /categories/all` |
| 新增文章分类 | `articlesApi.createCategory(data)` | `POST /admin/article-categories` |
| 编辑文章分类 | `articlesApi.updateCategory(id, data)` | `PUT /admin/article-categories/{id}` |
| 删除文章分类 | `articlesApi.deleteCategory(id)` | `DELETE /admin/article-categories/{id}` |
| 新增视频分类 | `videosApi.createCategory(data)` | `POST /admin/video-categories` |
| 编辑视频分类 | `videosApi.updateCategory(id, data)` | `PUT /admin/video-categories/{id}` |
| 删除视频分类 | `videosApi.deleteCategory(id)` | `DELETE /admin/video-categories/{id}` |
| 新增文件分类 | `filesApi.createCategory(data)` | `POST /admin/file-categories` |
| 编辑文件分类 | `filesApi.updateCategory(id, data)` | `PUT /admin/file-categories/{id}` |
| 删除文件分类 | `filesApi.deleteCategory(id)` | `DELETE /admin/file-categories/{id}` |

---

## 四、公共组件

以下公共组件也会调用接口：

| 组件 | 功能 | 使用的接口 |
|------|------|-----------|
| `CreateWorkModal` | 发布作品（文章/视频/文件） | `articlesApi.createArticle`、`videosApi.createVideo`、`filesApi.createFile`、`adminApi.uploadImage` |
| `ChatDrawer` | 私信聊天抽屉 | `chatApi.getPeerMessages`、`chatApi.getConversations`、`chatApi.markConversationRead`、`chatApi.getUnreadChatCount`、WebSocket |
| `FollowerModal` | 粉丝/关注列表弹窗 | `authApi.getFollowers`、`authApi.getFollowing` |
| `ReportModal` | 举报弹窗 | `adminApi.submitReport` |
| `ProtectedRoute` | 路由守卫（管理员） | `authApi.getMe` |

---

## 五、API 封装模块总览

| 模块 | 文件 | 主要职责 |
|------|------|---------|
| `authApi` | `src/api/auth.ts` | 认证、用户资料、关注、推荐创作者 |
| `articlesApi` | `src/api/articles.ts` | 文章、文章分类、文章评论、文章点赞收藏 |
| `videosApi` | `src/api/videos.ts` | 视频、视频分类、视频评论、视频点赞收藏 |
| `filesApi` | `src/api/files.ts` | 文件、文件分类、文件评论、文件点赞收藏、下载 |
| `adminApi` | `src/api/admin.ts` | 通知、举报、申诉、用户管理、内容管理、日志、仪表盘、管理员、上传、搜索、创作者统计、系统设置 |
| `categoriesApi` | `src/api/categories.ts` | 全部分类聚合 |
| `chatApi` | `src/api/chat.ts` | 私信会话、消息、WebSocket 聊天 |
| `apiClient` | `src/api/client.ts` | Axios 实例（携带 JWT、统一错误处理） |

---

## 附：接口响应结构约定

后端所有接口统一返回：

```json
{
  "code": 0,          // 0 表示成功，非 0 表示业务错误
  "data": { ... },    // 业务数据；列表类为 { total, list }
  "message": "操作成功"
}
```

前端封装方法已统一处理该包装结构，页面直接使用返回的业务数据即可。
