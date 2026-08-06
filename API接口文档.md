# 博客系统接口功能详解（一）

> 本文档基于后端实际代码（Controller / DTO / Entity）整理，罗列所有接口的功能、能做什么、返回字段名及注释、传参及注释。
> 统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`，`code=0` 表示成功。
> 鉴权方式：除标注"无需登录"外，均需请求头 `Authorization: Bearer {token}`。

---

## 目录

- [1. 认证模块](#1-认证模块)
- [2. 用户模块](#2-用户模块)
- [3. 关注模块](#3-关注模块)

---

## 1. 认证模块

### 1.1 用户注册

- **接口**：`POST /auth/register`
- **鉴权**：无需登录
- **功能**：注册新用户，注册成功后直接签发登录态（返回 token），前端可直接使用。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| email | string | 是 | 注册邮箱（作为登录账号），需唯一 |
| password | string | 是 | 明文密码，服务端做哈希，长度建议6~20 |
| nickName | string | 否 | 昵称，为空时用邮箱前缀生成 |
| phone | string | 否 | 手机号，需唯一 |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| userId | Long | 用户id |
| token | String | 登录令牌，前端存于 localStorage/Header 中携带 |
| expiresAt | LocalDateTime | token 过期时间 |

---

### 1.2 用户登录

- **接口**：`POST /auth/login`
- **鉴权**：无需登录
- **功能**：用户登录，签发 token。登录成功后返回 token 和用户信息，前端后续请求都要带上这个 token。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| email | string | 否 | 登录邮箱（与 account 等价，二选一） |
| account | string | 否 | 登录账号（兼容前端传 account 字段，与 email 等价） |
| password | string | 是 | 登录密码 |

> 账号被冻结（`user.status=1`）时返回 `code=40301`，data 中附带 `frozenReason`。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| userId | Long | 用户id |
| token | String | 登录令牌 |
| expiresAt | LocalDateTime | token 过期时间 |
| user | User | 用户信息（见下方 User 实体字段） |

**User 实体字段**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| email | String | 注册邮箱 |
| phone | String | 手机号 |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| birthday | LocalDate | 出生日期 |
| signature | String | 个性签名/个人简介 |
| role | Integer | 角色：0-普通用户 1-管理员 |
| status | Integer | 账号状态：0-正常 1-已冻结 |
| frozenReason | String | 冻结原因 |
| frozenAt | LocalDateTime | 冻结时间 |
| frozenBy | Long | 执行冻结操作的管理员id |
| lastLoginAt | LocalDateTime | 最后登录时间 |
| createdAt | LocalDateTime | 注册时间 |
| updatedAt | LocalDateTime | 资料更新时间 |

---

### 1.3 退出登录

- **接口**：`POST /auth/logout`
- **鉴权**：登录
- **功能**：把当前请求携带的 token 从数据库删除（置为 revoked=1），之后这个 token 就失效了。
- **传参**：无（仅需请求头携带 token）
- **返回**：data 为 null

---

### 1.4 获取当前登录用户信息

- **接口**：`GET /auth/me`
- **鉴权**：登录
- **功能**：返回当前登录用户自己的资料和统计信息（作品数、邮箱、出生年月、作品收藏数、作品评论数、粉丝数、关注数）。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| signature | String | 个性签名 |
| role | Integer | 角色：0-普通用户 1-管理员 |
| status | Integer | 账号状态：0-正常 1-已冻结 |
| email | String | 邮箱（仅当前用户自己的资料返回） |
| birthday | LocalDate | 出生日期（仅当前用户自己的资料返回） |
| articleCount | Long | 文章数 |
| videoCount | Long | 视频数 |
| fileCount | Long | 文件数 |
| worksCount | Long | 作品总数（文章+视频+文件） |
| favoriteCount | Long | 作品收藏总数（我收藏的文章+视频+文件） |
| commentCount | Long | 作品评论总数（我发表的文章+视频+文件评论） |
| followerCount | Long | 粉丝数 |
| followingCount | Long | 关注数 |


---

## 2. 用户模块

### 2.1 更新我的资料

- **接口**：`PUT /users/me`
- **鉴权**：登录
- **功能**：更新当前登录用户的资料，请求体里的字段都是可选的，传了哪个就改哪个。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| nickName | string | 否 | 昵称 |
| avatar | string | 否 | 头像URL（需先调用 `POST /uploads/image (scene=avatar)` 拿到URL再传入） |
| gender | int | 否 | 性别：0-保密 1-男 2-女 |
| birthday | date | 否 | 出生日期 YYYY-MM-DD |
| signature | string | 否 | 个性签名，最长200字符 |
| phone | string | 否 | 手机号，需唯一 |

- **返回**：data 为 null

---

### 2.2 修改密码

- **接口**：`PUT /users/me/password`
- **鉴权**：登录
- **功能**：修改当前登录用户的密码，需要提供原密码做校验。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| oldPassword | string | 是 | 原密码 |
| newPassword | string | 是 | 新密码 |

- **返回**：data 为 null

---

### 2.3 我收藏的文件列表

- **接口**：`GET /users/me/favorite-files`
- **鉴权**：登录
- **功能**：返回当前登录用户收藏过的所有文件，按收藏时间倒序，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `FileVO` 列表（见 10.3 文件详情字段）

---

### 2.4 我上传的文件列表

- **接口**：`GET /users/me/files`
- **鉴权**：登录
- **功能**：返回当前登录用户自己上传的所有文件（含私人文件），支持筛选，分页返回。用于"个人中心-我的文件"。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| categoryId | Long | 否 | - | 按文件分类筛选 |
| fileType | Integer | 否 | - | 按文件类型筛选（0~5） |
| keyword | string | 否 | - | 按文件名关键字搜索 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `FileVO` 列表

---

### 2.5 推荐创作者

- **接口**：`GET /users/recommend`
- **鉴权**：无需登录（登录态下会过滤掉当前用户自己与已关注的创作者）
- **功能**：按近期作品数 × 粉丝增速的简单加权排序推荐创作者，过滤掉当前用户自己、**已关注的创作者**、无作品无粉丝的用户以及被冻结的用户。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| limit | int | 否 | 10 | 返回数量，最大30 |

**返回字段（data）**：`UserBriefVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| signature | String | 个性签名 |
| followerCount | Long | 粉丝数 |
| articleCount | Long | 文章数 |
| isFollowing | Boolean | 恒为 false（已关注的创作者已被过滤，不会出现在推荐列表中） |




---

## 3. 关注模块

### 3.1 获取用户公开资料

- **接口**：`GET /users/{id}`
- **鉴权**：无需登录（登录态下会附带 `isFollowing` 字段）
- **功能**：查看指定用户（创作者）的公开资料和统计信息。私密字段（邮箱、手机号、生日）不返回。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要查看的用户id |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| signature | String | 个性签名 |
| role | Integer | 角色：0-普通用户 1-管理员 |
| status | Integer | 账号状态：0-正常 1-已冻结 |
| articleCount | Long | 文章数 |
| videoCount | Long | 视频数 |
| fileCount | Long | 文件数 |
| worksCount | Long | 作品总数（文章+视频+文件） |
| favoriteCount | Long | 作品收藏总数（该创作者收藏的文章+视频+文件） |
| commentCount | Long | 作品评论总数（该创作者发表的文章+视频+文件评论） |
| followerCount | Long | 粉丝数 |
| followingCount | Long | 关注数 |
| isFollowing | Boolean | 当前登录用户是否已关注此人（未登录为 false） |


---

### 3.2 关注用户

- **接口**：`POST /users/{id}/follow`
- **鉴权**：登录
- **功能**：当前登录用户关注指定用户，不能关注自己。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要关注的用户id |

- **返回**：data 为 null

---

### 3.3 取消关注

- **接口**：`DELETE /users/{id}/follow`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定用户的关注。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消关注的用户id |

- **返回**：data 为 null

---

### 3.4 查询关注状态

- **接口**：`GET /users/{id}/follow/status`
- **鉴权**：登录
- **功能**：返回当前登录用户是否已关注指定用户。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要查询的用户id |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| isFollowing | Boolean | 是否已关注 |

---

### 3.5 粉丝列表

- **接口**：`GET /users/{id}/followers`
- **鉴权**：无需登录
- **功能**：查看指定用户的粉丝列表，分页返回。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| id | Long | 是 | - | 要查看的用户id |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `UserBriefVO` 列表（id/nickName/avatar/signature）

---

### 3.6 关注列表

- **接口**：`GET /users/{id}/following`
- **鉴权**：无需登录
- **功能**：查看指定用户关注了哪些人，分页返回。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| id | Long | 是 | - | 要查看的用户id |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `UserBriefVO` 列表

---

### 3.7 我收藏的文章

- **接口**：`GET /users/me/favorite-articles`
- **鉴权**：登录
- **功能**：返回当前登录用户收藏过的所有文章，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ArticleCardVO` 列表（见 6.1 文章列表字段）

---

### 3.8 我收藏的视频

- **接口**：`GET /users/me/favorite-videos`
- **鉴权**：登录
- **功能**：返回当前登录用户收藏过的所有视频，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `VideoCardVO` 列表（见 14.1 视频列表字段）
# 博客系统接口功能详解（二）

> 本文档基于后端实际代码（Controller / DTO / Entity）整理，罗列所有接口的功能、能做什么、返回字段名及注释、传参及注释。
> 统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`，`code=0` 表示成功。
> 鉴权方式：除标注"无需登录"外，均需请求头 `Authorization: Bearer {token}`。

---

## 目录

- [4. 全站分类聚合](#4-全站分类聚合)
- [5. 文章分类模块](#5-文章分类模块)
- [6. 文章模块](#6-文章模块)
- [7. 内容广场聚合](#7-内容广场聚合)
  - [7.1 内容广场聚合列表](#71-内容广场聚合列表)
  - [7.2 用户作品列表](#72-用户作品列表)
- [8. 搜索模块](#8-搜索模块)


---

## 4. 全站分类聚合

### 4.1 获取全站所有分类

- **接口**：`GET /categories/all`
- **鉴权**：无需登录
- **功能**：一次返回文章（图文）、文件、视频三套分类，供前端首页/发布页一次性拉取所有分类。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| articles | List\<UserCategory\> | 文章分类列表（含 articleCount） |
| files | List\<FileCategory\> | 文件分类列表（含 fileCount） |
| videos | List\<VideoCategory\> | 视频分类列表（含 videoCount） |

**UserCategory 字段**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 分类id |
| name | String | 分类名称 |
| description | String | 分类简介 |
| coverImage | String | 分类图片链接 |
| sortOrder | Integer | 排序值，越小越靠前 |
| createdAt | LocalDateTime | 创建时间 |
| articleCount | Long | 该分类下的文章数量 |

**FileCategory 字段**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 分类id |
| name | String | 分类名称 |
| description | String | 分类简介 |
| coverImage | String | 分类图片链接 |
| sortOrder | Integer | 排序值 |
| createdAt | LocalDateTime | 创建时间 |
| fileCount | Long | 该分类下的文件数量 |

**VideoCategory 字段**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 分类id |
| name | String | 分类名称 |
| coverImage | String | 分类图片链接 |
| sortOrder | Integer | 排序值 |
| createdAt | LocalDateTime | 创建时间 |
| videoCount | Long | 该分类下视频数量 |

---

## 5. 文章分类模块

### 5.1 文章分类列表

- **接口**：`GET /article-categories`
- **鉴权**：无需登录
- **功能**：返回所有文章分类，附带各分类下的文章数量。数量通常不多，不分页。
- **返回字段（data）**：`UserCategory` 列表（见 4.1）

---

### 5.2 文章分类详情

- **接口**：`GET /article-categories/{id}`
- **鉴权**：无需登录
- **功能**：返回指定文章分类的详细信息。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 分类id |

**返回字段（data）**：`UserCategory` 对象

---

### 5.3 管理员-创建文章分类

- **接口**：`POST /admin/article-categories`
- **鉴权**：管理员
- **功能**：创建新的文章分类（全站统一分类，由管理员维护）。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| name | string | 是 | 分类名，全站唯一 |
| description | string | 否 | 简介 |
| coverImage | string | 否 | 封面图URL（需先调用 `POST /uploads/image (scene=category_cover)` 拿到URL） |
| sortOrder | int | 否 | 排序值，默认0 |

**返回字段（data）**：创建后的 `UserCategory` 对象

---

### 5.4 管理员-更新文章分类

- **接口**：`PUT /admin/article-categories/{id}`
- **鉴权**：管理员
- **功能**：更新指定文章分类的信息。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的分类id |
| name | string | 否 | 分类名 |
| description | string | 否 | 简介 |
| coverImage | string | 否 | 封面图URL |
| sortOrder | int | 否 | 排序值 |

- **返回**：data 为 null

---

### 5.5 管理员-删除文章分类

- **接口**：`DELETE /admin/article-categories/{id}`
- **鉴权**：管理员
- **功能**：删除指定文章分类，该分类下的文章 `category_id` 自动置空（不会被删除）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的分类id |

- **返回**：data 为 null

---

## 6. 文章模块

### 6.1 文章列表（广场）

- **接口**：`GET /articles`
- **鉴权**：无需登录（登录态下会返回 `isLiked`/`isFavorited`）
- **功能**：文章广场列表，支持按作者、分类、关键字筛选，以及按时间/热度排序，分页返回。只返回公共且未隐藏的文章。**已冻结作者（`user.status=1`）的文章不可查看**：传 `userId` 时若该作者已冻结则返回空列表；不传 `userId` 时自动排除所有已冻结作者的文章。


**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| userId | Long | 否 | - | 按作者筛选 |
| categoryId | Long | 否 | - | 按分类筛选 |
| keyword | string | 否 | - | 按标题关键字搜索 |
| sort | string | 否 | - | 排序方式：latest（最新）/hot（最热） |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ArticleCardVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 文章id |
| title | String | 标题 |
| coverImage | String | 封面图 |
| summary | String | 摘要 |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| author | UserBriefVO | 作者简要信息（id/nickName/avatar/signature） |
| category | CategoryBriefVO | 分类简要信息（id/name） |
| createdAt | LocalDateTime | 创建时间 |
| isLiked | Boolean | 当前用户是否已点赞 |
| isFavorited | Boolean | 当前用户是否已收藏 |

---

### 6.2 关注动态

- **接口**：`GET /content/follow-feed`
- **鉴权**：登录
- **功能**：返回当前登录用户关注的人发布的公共且未隐藏的文章/视频/文件，按创建时间倒序合并分页返回。**需要登录**。与内容广场聚合接口 `GET /content/feed`（见 7.1）不同，本接口只返回关注对象发布的内容。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| type | string | 否 | - | 内容类型筛选：article-文章 / video-视频 / file-文件，为空返回全部 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ContentCardVO` 列表（字段见 7.1）




---

### 6.3 文章详情

- **接口**：`GET /articles/{id}`
- **鉴权**：无需登录（私人文章仅作者本人可见，被隐藏文章仅作者与管理员可见）
- **功能**：返回文章的完整内容，包括作者信息、点赞数、收藏数等。每次访问 `view_count += 1`。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文章id |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 文章id |
| title | String | 标题 |
| content | String | 正文内容 |
| coverImage | String | 封面图 |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| author | UserBriefVO | 作者简要信息（id/nickName/avatar/signature/isFollowing） |
| category | CategoryBriefVO | 分类简要信息 |
| attachments | List\<FileBriefVO\> | 附件列表（id/originalName/fileSize/allowDownload） |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |
| isLiked | Boolean | 当前用户是否已点赞 |
| isFavorited | Boolean | 当前用户是否已收藏 |

**author（UserBriefVO）字段**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 作者用户id |
| nickName | String | 作者昵称 |
| avatar | String | 作者头像 |
| signature | String | 作者个性签名 |
| isFollowing | Boolean | 当前登录用户是否已关注该作者（未登录为 false） |


---

### 6.4 发布文章

- **接口**：`POST /articles`
- **鉴权**：登录
- **功能**：当前登录用户发布一篇新文章。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| title | string | 是 | 标题 |
| content | string | 是 | 正文 |
| coverImage | string | 否 | 封面图URL（需先调用 `POST /uploads/image (scene=article_cover)` 拿到URL） |
| categoryId | Long | 否 | 分类id，需是存在的分类 |
| status | int | 否 | 可见状态：0-公共 1-私人，默认0 |

**返回字段（data）**：发布后的 `ArticleDetailVO` 对象

---

### 6.5 更新文章

- **接口**：`PUT /articles/{id}`
- **鉴权**：登录（仅作者本人）
- **功能**：更新自己发布的文章。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的文章id |
| title | string | 否 | 标题 |
| content | string | 否 | 正文 |
| coverImage | string | 否 | 封面图URL |
| categoryId | Long | 否 | 分类id |
| status | int | 否 | 可见状态 |

**返回字段（data）**：更新后的 `ArticleDetailVO` 对象

---

### 6.6 删除文章

- **接口**：`DELETE /articles/{id}`
- **鉴权**：登录（仅作者本人或管理员）
- **功能**：删除文章，级联删除该文章下的点赞/收藏/评论/关联文件（article_id 置空，文件本身不删）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的文章id |

- **返回**：data 为 null

---

### 6.7 修改文章可见状态

- **接口**：`PUT /articles/{id}/status`
- **鉴权**：登录（仅作者本人）
- **功能**：在公共和私人之间切换文章的可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要修改的文章id |
| status | int | 是 | 0-公共 1-私人 |

- **返回**：data 为 null

---

### 6.8 管理员-文章列表

- **接口**：`GET /admin/articles`
- **鉴权**：管理员
- **功能**：查看全站所有文章，包括被隐藏的和私人的，支持多种条件筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按标题模糊匹配 |
| userId | Long | 否 | - | 按作者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| status | Integer | 否 | - | 按可见状态筛选：0-公共 1-私人 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Article` 实体列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 文章id |
| title | String | 标题 |
| content | String | 正文 |
| viewCount | Integer | 浏览量 |
| coverImage | String | 封面图 |
| userId | Long | 作者用户id |
| categoryId | Long | 分类id |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| status | Integer | 可见状态：0-公共 1-私人 |
| frozenReason | String | 隐藏/冻结原因 |
| frozenAt | LocalDateTime | 冻结操作时间 |
| frozenBy | Long | 执行冻结操作的管理员id |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |
| creator | String | 作者昵称（联表带出） |
| frozenByName | String | 执行冻结操作的管理员昵称 |
| categoryName | String | 分类名称 |
| commentCount | Integer | 评论数 |

---

### 6.9 管理员-隐藏文章

- **接口**：`PUT /admin/articles/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏文章，隐藏后普通用户就看不到这篇文章了。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的文章id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 6.10 管理员-恢复文章

- **接口**：`PUT /admin/articles/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的文章恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的文章id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

## 7. 内容广场聚合

### 7.1 内容广场聚合列表

- **接口**：`GET /content/feed`
- **鉴权**：无需登录（登录态下会过滤掉私人/隐藏内容）
- **功能**：把文章、视频、文件三种内容统一查询，按指定排序方式合并后分页返回。用于"内容广场"等需要混合展示多种内容的场景。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| type | string | 否 | - | 内容类型筛选：article-文章 / video-视频 / file-文件，为空返回全部 |
| keyword | string | 否 | - | 按标题/文件名关键字搜索 |
| sort | string | 否 | latest | 排序方式：latest-最新 / hot-最热 / view-最多浏览 |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ContentCardVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| contentType | Integer | 内容类型：1-图文(文章) / 2-视频 / 3-文件 |
| id | Long | 内容id（对应文章/视频/文件的主键id） |
| title | String | 标题（文章/视频标题，文件为原始文件名） |
| coverImage | String | 封面图（文章/视频封面；文件可为空） |
| summary | String | 摘要/描述（文章摘要、视频描述、文件可为空） |
| viewCount | Integer | 阅读量（文章/视频浏览量；文件为下载量） |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| commentCount | Integer | 评论数 |
| authorId | Long | 创作者id |
| authorName | String | 创作者名称（昵称） |
| authorAvatar | String | 创作者头像 |
| categoryId | Long | 分类id |
| categoryName | String | 分类名称（文字） |
| categoryCover | String | 分类封面图 |
| duration | Integer | 视频时长（秒），仅视频有 |
| fileSize | Long | 文件大小（字节），视频和文件都有 |
| fileType | Integer | 文件大类：0-其他 1-图片 2-文档 3-视频 4-音频 5-压缩包，仅文件有 |
| fileExt | String | 文件扩展名，仅文件有 |
| filePath | String | 文件访问路径，仅文件有 |
| createdAt | LocalDateTime | 创建时间 |

---

### 7.2 用户作品列表

- **接口**：`GET /content/user/{userId}`
- **鉴权**：无需登录（登录态下作者本人可看到自己的私人作品）
- **功能**：返回某个用户的全部作品（文章/视频/文件聚合），支持按类型筛选、排序、分页。**作者本人**（登录且 `userId` 等于自己）可以看到自己的公共+私人作品；**其他人**只能看到该作者的公共且未隐藏的作品；**已冻结作者**的作品对他人不可见。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| userId | Long | 是 | - | 要查看的用户id |
| type | string | 否 | - | 内容类型筛选：article-文章 / video-视频 / file-文件，为空返回全部 |
| sort | string | 否 | latest | 排序方式：latest-最新 / hot-最热 / view-最多浏览 |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ContentCardVO` 列表（字段见 7.1）

---

## 8. 搜索模块


### 8.1 全局搜索（普通用户）

- **接口**：`GET /search`
- **鉴权**：无需登录
- **功能**：站内全局搜索，仅返回 `is_hidden=0` 且 `status=0` 的公共内容。支持按类型筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 是 | - | 搜索关键词 |
| type | string | 否 | all | 搜索类型：all/article/video/file/user |
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 10 | 每页条数 |

**返回字段（data）**：`Map`，包含各类型搜索结果（文章/视频/文件/用户），每类为分页结构。

---

### 8.2 管理员-全局搜索

- **接口**：`GET /admin/search`
- **鉴权**：管理员
- **功能**：管理员全局搜索，不受 `is_hidden`/`status` 限制，可额外搜索用户邮箱/手机号。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 是 | - | 搜索关键词 |
| type | string | 否 | all | 搜索类型：all/article/video/file/user |
| page | int | 否 | 1 | 页码 |
| pageSize | int | 否 | 10 | 每页条数 |

**返回字段（data）**：`Map`，包含各类型搜索结果（文章/视频/文件/用户），每类为分页结构。
# 博客系统接口功能详解（三）

> 本文档基于后端实际代码（Controller / DTO / Entity）整理，罗列所有接口的功能、能做什么、返回字段名及注释、传参及注释。
> 统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`，`code=0` 表示成功。
> 鉴权方式：除标注"无需登录"外，均需请求头 `Authorization: Bearer {token}`。

---

## 目录

- [7. 文章互动模块](#7-文章互动模块)
- [8. 文章评论模块](#8-文章评论模块)
- [9. 文件分类模块](#9-文件分类模块)
- [10. 文件模块](#10-文件模块)
- [11. 聊天/好友模块](#11-聊天好友模块)

---

## 7. 文章互动模块

### 7.1 点赞文章

- **接口**：`POST /articles/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定文章点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的文章id |

- **返回**：data 为 null

---

### 7.2 取消点赞

- **接口**：`DELETE /articles/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定文章的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的文章id |

- **返回**：data 为 null

---

### 7.3 收藏文章

- **接口**：`POST /articles/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户收藏指定文章。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要收藏的文章id |

- **返回**：data 为 null

---

### 7.4 取消收藏

- **接口**：`DELETE /articles/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定文章的收藏。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消收藏的文章id |

- **返回**：data 为 null

---

## 8. 文章评论模块

### 8.1 评论列表

- **接口**：`GET /articles/{articleId}/comments`
- **鉴权**：无需登录
- **功能**：返回某篇文章下的所有评论（楼层结构），支持按时间/热度排序，分页返回。只返回未隐藏的评论。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| articleId | Long | 是 | - | 所属文章id |
| sort | string | 否 | - | 排序方式：latest（最新）/hot（最热） |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `CommentVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 评论id |
| user | UserBriefVO | 评论者简要信息 |
| content | String | 评论内容 |
| likeCount | Integer | 点赞数 |
| isLiked | Boolean | 当前用户是否已点赞 |
| createdAt | LocalDateTime | 评论时间 |
| replyToUser | UserBriefVO | 被回复的用户信息 |
| replies | List\<CommentVO\> | 子回复列表 |
| replyCount | Integer | 回复数 |

---

### 8.2 发表评论/回复

- **接口**：`POST /articles/{articleId}/comments`
- **鉴权**：登录
- **功能**：当前登录用户在指定文章下发表评论，可以回复别人的评论。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| articleId | Long | 是 | 所属文章id |
| content | string | 是 | 评论内容，最长800字符 |
| parentId | Long | 否 | 回复的父评论id，为空代表发表一级评论 |

**返回字段（data）**：发表后的 `CommentVO` 对象

---

### 8.3 删除评论

- **接口**：`DELETE /article-comments/{id}`
- **鉴权**：登录（仅评论作者本人或管理员）
- **功能**：删除评论，级联删除其所有子回复。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的评论id |

- **返回**：data 为 null

---

### 8.4 点赞评论

- **接口**：`POST /article-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定评论点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的评论id |

- **返回**：data 为 null

---

### 8.5 取消点赞评论

- **接口**：`DELETE /article-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定评论的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的评论id |

- **返回**：data 为 null

---

### 8.6 管理员-隐藏评论

- **接口**：`PUT /admin/article-comments/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏评论，隐藏后普通用户就看不到这条评论了。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的评论id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 8.7 管理员-恢复评论

- **接口**：`PUT /admin/article-comments/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的评论恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的评论id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

### 8.8 管理员-评论列表

- **接口**：`GET /admin/article-comments`
- **鉴权**：管理员
- **功能**：查看全站所有文章评论，包括被隐藏的，支持多种条件筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| articleId | Long | 否 | - | 按所属文章筛选 |
| userId | Long | 否 | - | 按评论者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| keyword | string | 否 | - | 按评论内容关键字搜索 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的评论列表（含评论者昵称、所属文章标题、隐藏状态等）

---

## 9. 文件分类模块

### 9.1 文件分类列表

- **接口**：`GET /file-categories`
- **鉴权**：无需登录
- **功能**：返回所有文件分类，附带各分类下的文件数量。数量通常不多，不分页。
- **返回字段（data）**：`FileCategory` 列表（见 4.1 FileCategory 字段）

---

### 9.2 文件分类详情

- **接口**：`GET /file-categories/{id}`
- **鉴权**：无需登录
- **功能**：返回指定文件分类的详细信息。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 分类id |

**返回字段（data）**：`FileCategory` 对象

---

### 9.3 管理员-创建文件分类

- **接口**：`POST /admin/file-categories`
- **鉴权**：管理员
- **功能**：创建新的文件分类（全站统一分类，由管理员维护）。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| name | string | 是 | 分类名，全站唯一 |
| description | string | 否 | 简介 |
| coverImage | string | 否 | 封面图URL |
| sortOrder | int | 否 | 排序值，默认0 |

**返回字段（data）**：创建后的 `FileCategory` 对象

---

### 9.4 管理员-更新文件分类

- **接口**：`PUT /admin/file-categories/{id}`
- **鉴权**：管理员
- **功能**：更新指定文件分类的信息。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的分类id |
| name | string | 否 | 分类名 |
| description | string | 否 | 简介 |
| coverImage | string | 否 | 封面图URL |
| sortOrder | int | 否 | 排序值 |

- **返回**：data 为 null

---

### 9.5 管理员-删除文件分类

- **接口**：`DELETE /admin/file-categories/{id}`
- **鉴权**：管理员
- **功能**：删除指定文件分类，该分类下的文件 `category_id` 自动置空（不会被删除）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的分类id |

- **返回**：data 为 null

---

## 10. 文件模块

### 10.1 文件列表（广场）

- **接口**：`GET /files`
- **鉴权**：无需登录（登录态下会返回 `isLiked`/`isFavorited`）
- **功能**：文件广场列表，支持按作者、关联文章、分类、文件类型、关键字筛选，分页返回。未登录只能看到公共且未隐藏的文件；传 userId 时返回该作者的文件（本人可看到自己的私人文件）。**已冻结上传者（`user.status=1`）的文件不可查看**：传 `userId` 时若该上传者已冻结则返回空列表；不传 `userId` 时自动排除所有已冻结上传者的文件。


**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| userId | Long | 否 | - | 按作者筛选 |
| articleId | Long | 否 | - | 按关联文章筛选 |
| categoryId | Long | 否 | - | 按文件分类筛选 |
| fileType | Integer | 否 | - | 按文件类型筛选（0~5） |
| keyword | string | 否 | - | 按文件名关键字搜索 |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `FileVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 文件id |
| userId | Long | 上传者用户id |
| articleId | Long | 关联文章id |
| categoryId | Long | 文件分类id |
| originalName | String | 原始文件名 |
| coverImage | String | 封面图URL（通过 POST /uploads/image 获取后写入，可为 null） |
| filePath | String | 文件存储路径或访问URL |
| fileExt | String | 文件扩展名 |
| mimeType | String | 文件MIME类型 |
| fileType | Integer | 文件大类：0-其他 1-图片 2-文档 3-视频 4-音频 5-压缩包 |
| fileSize | Long | 文件大小（字节） |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| allowDownload | Integer | 是否允许下载：0-禁止 1-允许 |
| downloadCount | Integer | 累计下载次数 |
| moderationLogId | Long | 最近一次审核日志id（被隐藏/恢复时关联的 ContentModerationLog，可为 null） |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |
| author | UserBriefVO | 上传者简要信息（id/nickName/avatar/isFollowing） |



---

### 10.2 文件详情

- **接口**：`GET /files/{id}`
- **鉴权**：无需登录（私人和被隐藏的文件只有上传者本人或管理员能看）
- **功能**：返回文件的完整信息，包括上传者、下载次数等。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文件id |

**返回字段（data）**：`FileVO` 对象（字段见 10.1）

> `author.isFollowing`：当前登录用户是否已关注该上传者。未登录或未关注时为 `false`，仅登录态下有意义。


> **前端交互要求（下载按钮）**：详情页根据返回字段 `allowDownload` 控制下载按钮状态——
> - `allowDownload = 1`（允许下载）：下载按钮正常显示，可点击下载。
> - `allowDownload = 0`（禁止下载）：下载按钮置灰/变红，文字展示为「禁止下载」，且不可点击。
> 后端下载接口 `GET /files/{id}/download` 也会校验 `allow_download=1`，若为 0 会返回错误，前端需提前禁用按钮避免误操作。


---

### 10.3 上传文件

- **接口**：`POST /files`
- **鉴权**：登录（**必须携带请求头 `Authorization: Bearer {token}`**，否则返回 400 "未登录或登录已过期"）
- **功能**：当前登录用户上传一个新文件。使用 `multipart/form-data` 提交。

**请求头（Header）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 登录令牌，格式固定为 `Bearer {token}`。缺失、格式错误或 token 过期都会返回 400 "未登录或登录已过期" |

**传参（Form Data，multipart/form-data）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| file | file | 是 | 上传的文件二进制（字段名必须为 `file`） |
| articleId | Long | 否 | 关联文章id |
| categoryId | Long | 否 | 文件分类id |
| status | int | 否 | 可见状态：0-公共 1-私人，默认公共 |
| coverImage | string | 否 | 封面图URL（通过 POST /uploads/image 获取后传入，可为空） |

**请求示例（curl）**：

```bash
curl -X POST http://192.168.100.115:8080/files \
  -H "Authorization: Bearer <你的token>" \
  -F "file=@/path/to/your/file.pdf" \
  -F "categoryId=2" \
  -F "status=0" \
  -F "coverImage=https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop"
```

**常见错误**：

| 错误信息 | 原因 | 解决 |
| --- | --- | --- |
| 未登录或登录已过期 | 请求头缺少 `Authorization`，或 token 缺失/格式错误/已过期 | 在请求头加上 `Authorization: Bearer {token}`，确保 token 有效 |
| 上传失败: 请求不是有效的文件上传请求，请使用 multipart/form-data 格式提交 | 请求未按 `multipart/form-data` 格式发送（如误用 application/json） | 改用 `multipart/form-data`，文件字段名必须为 `file` |
| 上传失败: 文件大小超出限制（单文件最大10MB，单次请求最大20MB） | 文件超过大小限制 | 压缩文件或分片上传 |

**返回字段（data）**：上传后的 `FileVO` 对象（字段见 10.1）


---

### 10.4 更新文件

- **接口**：`PUT /files/{id}`
- **鉴权**：登录（仅上传者本人）
- **功能**：更新自己上传的文件信息。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的文件id |
| originalName | string | 否 | 原始文件名 |
| categoryId | Long | 否 | 文件分类id |
| articleId | Long | 否 | 关联文章id |

**返回字段（data）**：更新后的 `FileVO` 对象

---

### 10.5 删除文件

- **接口**：`DELETE /files/{id}`
- **鉴权**：登录（仅上传者本人或管理员）
- **功能**：删除文件，同时删除物理文件。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的文件id |

- **返回**：data 为 null

---

### 10.6 修改文件可见状态

- **接口**：`PUT /files/{id}/status`
- **鉴权**：登录（仅上传者本人）
- **功能**：在公共和私人之间切换文件的可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要修改状态的文件id |
| status | int | 是 | 0-公共 1-私人 |

- **返回**：data 为 null

---

### 10.7 修改文件下载权限

- **接口**：`PUT /files/{id}/allow-download`
- **鉴权**：登录（仅上传者本人）
- **功能**：在允许下载和禁止下载之间切换文件的下载权限。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要修改下载权限的文件id |
| allowDownload | int | 是 | 0-禁止 1-允许 |

- **返回**：data 为 null

---

### 10.8 下载文件

- **接口**：`GET /files/{id}/download`
- **鉴权**：无需登录（未登录也可以下载公共文件）
- **功能**：下载文件，校验 `allow_download=1` 且 `is_hidden=0`，成功后记录下载次数并返回文件二进制流。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要下载的文件id |

- **返回**：文件二进制流（Content-Disposition: attachment）

---

### 10.9 点赞文件

- **接口**：`POST /files/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定文件点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的文件id |

- **返回**：data 为 null

---

### 10.10 取消点赞文件

- **接口**：`DELETE /files/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定文件的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的文件id |

- **返回**：data 为 null

---

### 10.11 收藏文件

- **接口**：`POST /files/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户收藏指定文件。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要收藏的文件id |

- **返回**：data 为 null

---

### 10.12 取消收藏文件

- **接口**：`DELETE /files/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定文件的收藏。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消收藏的文件id |

- **返回**：data 为 null

---

## 11. 聊天/好友模块

> 实时收发消息走 WebSocket（`/ws/chat`），本模块提供历史消息、会话列表、好友列表、未读数等 REST 接口。

### 11.1 我的会话列表

- **接口**：`GET /chat/conversations`
- **鉴权**：登录
- **功能**：返回当前登录用户与每个对端用户最近一条消息，按最近消息时间倒序。每项含对端用户信息（昵称/头像）与未读数。

**返回字段（data）**：`PrivateMessage` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 消息id |
| senderId | Long | 发送者用户id |
| receiverId | Long | 接收者用户id |
| content | String | 消息内容 |
| isRead | Integer | 是否已读：0-未读 1-已读 |
| readAt | LocalDateTime | 已读时间 |
| createdAt | LocalDateTime | 发送时间 |
| senderNickName | String | 发送者昵称（联表带出） |
| senderAvatar | String | 发送者头像（联表带出） |
| receiverNickName | String | 接收者昵称（联表带出） |
| receiverAvatar | String | 接收者头像（联表带出） |
| unreadCount | Long | 该会话的未读消息数（仅会话列表接口返回） |

---

### 11.2 与某用户的聊天记录


- **接口**：`GET /chat/conversations/{peerId}`
- **鉴权**：登录
- **功能**：返回当前登录用户与指定对端用户的双向聊天记录，按时间倒序分页。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| peerId | Long | 是 | - | 对端用户id |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 20 | 每页条数 |

**返回字段（data）**：分页的 `PrivateMessage` 列表（字段见 11.1）

---

### 11.3 与某用户的聊天记录（别名接口）

- **接口**：`GET /chat/messages`
- **鉴权**：登录
- **功能**：与某用户的聊天记录（双向），按时间倒序分页。**等价于** `GET /chat/conversations/{peerId}`，是前端约定的消息列表接口。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| peerId | Long | 是 | - | 对端用户id |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 20 | 每页条数 |

**返回字段（data）**：分页的 `PrivateMessage` 列表（字段见 11.1）

---

### 11.4 发送私信消息（REST 方式）

- **接口**：`POST /chat/messages`
- **鉴权**：登录
- **功能**：发送一条私信消息（REST 方式），**等价于 WebSocket 发送**。消息落库保存，若接收者在线则实时推送。不能给自己发送私信，消息内容不超过2000字符。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| receiverId | Long | 是 | 接收者用户id |
| content | string | 是 | 消息内容，不超过2000字符 |

**请求示例**：
```json
{ "receiverId": 2, "content": "你好" }
```

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| message | PrivateMessage | 已保存的消息对象（字段见 11.1） |
| delivered | Boolean | 接收者是否在线并成功投递 |

---

### 11.5 标记会话已读

- **接口**：`PUT /chat/conversations/{peerId}/read`

- **鉴权**：登录
- **功能**：将当前用户与指定对端之间的所有未读消息标记为已读。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| peerId | Long | 是 | 对端用户id |

- **返回**：data 为 null

---

### 11.6 我的未读消息总数

- **接口**：`GET /chat/unread-count`

- **鉴权**：登录
- **功能**：返回当前登录用户的未读消息总数。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| count | Long | 未读消息总数 |

---

### 11.7 我的聊天好友列表


- **接口**：`GET /chat/friends`
- **鉴权**：登录
- **功能**：返回当前登录用户的聊天好友列表。好友定义为互相关注的用户（我关注了对方，且对方也关注了我）。支持按昵称关键字搜索，不分页，一次性返回全部。每项含用户详细信息与未读数、最近消息。

**传参（Query）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| keyword | string | 否 | 按昵称模糊搜索 |

**返回字段（data）**：`ChatFriendVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| signature | String | 个性签名 |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| role | Integer | 角色：0-普通用户 1-管理员 |
| articleCount | Long | 文章数 |
| followerCount | Long | 粉丝数 |
| followingCount | Long | 关注数 |
| unreadCount | Long | 与当前用户的未读消息数 |
| lastMessage | String | 最近一条消息内容（可为空） |
| lastMessageAt | LocalDateTime | 最近一条消息时间（可为空） |

---

### 11.8 搜索用户（用于单独找某个人聊天）


- **接口**：`GET /chat/users`
- **鉴权**：登录
- **功能**：按昵称模糊搜索用户，不分页，返回用户简要信息（含未读数与最近消息）。排除当前登录用户自己，只返回正常状态用户。

**传参（Query）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| keyword | string | 是 | 搜索关键字（昵称） |

**返回字段（data）**：`ChatFriendVO` 列表（字段见 11.7）

---

### 11.9 WebSocket 实时消息格式


> 实时收发消息走 WebSocket，连接地址：`ws://host:port/ws/chat?token={登录token}`。
> 鉴权：通过 query 参数 `token` 校验登录态，无效则拒绝连接。

**客户端发送消息格式（JSON）**：

| 字段 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| receiverId | Long | 是 | 接收者用户id |
| content | String | 是 | 消息内容（不超过2000字符） |

示例：
```json
{ "receiverId": 1002, "content": "你好" }
```

**服务端推送给接收者的消息格式（type=message）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| type | String | 固定为 `message` |
| message | PrivateMessage | 消息对象（字段见 11.1） |

示例：
```json
{
  "type": "message",
  "message": {
    "id": 1,
    "senderId": 1001,
    "receiverId": 1002,
    "content": "你好",
    "isRead": 0,
    "readAt": null,
    "createdAt": "2026-08-06T18:09:38"
  }
}
```

**服务端回执给发送者的消息格式（type=ack）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| type | String | 固定为 `ack` |
| message | PrivateMessage | 已保存的消息对象（字段见 11.1） |
| delivered | Boolean | 接收者是否在线并成功投递 |

示例：
```json
{
  "type": "ack",
  "message": {
    "id": 1,
    "senderId": 1001,
    "receiverId": 1002,
    "content": "你好",
    "isRead": 0,
    "readAt": null,
    "createdAt": "2026-08-06T18:09:38"
  },
  "delivered": true
}
```

**连接成功推送消息格式（type=connected）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| type | String | 固定为 `connected` |
| userId | Long | 当前登录用户id |
| nickName | String | 当前登录用户昵称 |

**错误消息格式（type=error）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| type | String | 固定为 `error` |
| message | String | 错误提示信息 |

> **说明**：`PrivateMessage` 中的 `createdAt`（发送时间）与 `readAt`（已读时间）为 `LocalDateTime` 类型，服务端序列化为 ISO-8601 字符串格式（如 `2026-08-06T18:09:38`），前端可直接解析。

# 博客系统接口功能详解（四）

> 本文档基于后端实际代码（Controller / DTO / Entity）整理，罗列所有接口的功能、能做什么、返回字段名及注释、传参及注释。
> 本文档为「接口功能详解（一）（二）（三）」的**补充篇**，补齐此前遗漏的模块：视频分类、视频、视频互动、视频评论、文件评论、通知、举报、申诉、管理员后台、创作者数据统计、静态素材上传。
> 统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`，`code=0` 表示成功。
> 鉴权方式：除标注"无需登录"外，均需请求头 `Authorization: Bearer {token}`。

---

## 目录

- [12. 视频分类模块](#12-视频分类模块)
- [13. 视频模块](#13-视频模块)
- [14. 视频互动模块](#14-视频互动模块)
- [15. 视频评论模块](#15-视频评论模块)
- [16. 文件评论模块](#16-文件评论模块)
- [17. 通知模块](#17-通知模块)
- [18. 举报模块](#18-举报模块)
- [19. 申诉模块](#19-申诉模块)
- [20. 管理员后台模块](#20-管理员后台模块)
- [21. 创作者数据统计模块](#21-创作者数据统计模块)
- [22. 静态素材上传模块](#22-静态素材上传模块)

---

## 12. 视频分类模块

### 12.1 视频分类列表

- **接口**：`GET /video-categories`
- **鉴权**：无需登录
- **功能**：返回所有视频分类，公开接口。数量通常不多，不分页。
- **返回字段（data）**：`VideoCategory` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 分类id |
| name | String | 分类名称 |
| coverImage | String | 分类图片链接 |
| sortOrder | Integer | 排序值，越小越靠前 |
| createdAt | LocalDateTime | 创建时间 |
| videoCount | Long | 该分类下视频数量 |

---

### 12.2 管理员-创建视频分类

- **接口**：`POST /admin/video-categories`
- **鉴权**：管理员
- **功能**：创建新的视频分类（全站统一分类，由管理员维护）。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| name | string | 是 | 分类名，全站唯一 |
| coverImage | string | 否 | 封面图URL（需先调用 `POST /uploads/image (scene=category_cover)` 拿到URL） |
| sortOrder | int | 否 | 排序值，默认0 |

**返回字段（data）**：创建后的 `VideoCategory` 对象

---

### 12.3 管理员-更新视频分类

- **接口**：`PUT /admin/video-categories/{id}`
- **鉴权**：管理员
- **功能**：更新指定视频分类的信息。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的分类id |
| name | string | 否 | 分类名 |
| coverImage | string | 否 | 封面图URL |
| sortOrder | int | 否 | 排序值 |

**返回字段（data）**：更新后的 `VideoCategory` 对象

---

### 12.4 管理员-删除视频分类

- **接口**：`DELETE /admin/video-categories/{id}`
- **鉴权**：管理员
- **功能**：删除指定视频分类，该分类下的视频 `category_id` 自动置空（不会被删除）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的分类id |

- **返回**：data 为 null

---

## 13. 视频模块

### 13.1 视频列表（广场）

- **接口**：`GET /videos`
- **鉴权**：无需登录（登录态下会返回 `isLiked`/`isFavorited`）
- **功能**：视频广场列表，支持按作者、分类、关键字筛选，以及按时间/热度排序，分页返回。只返回公共且未隐藏的视频。**已冻结作者（`user.status=1`）的视频不可查看**：传 `userId` 时若该作者已冻结则返回空列表；不传 `userId` 时自动排除所有已冻结作者的视频。


**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| userId | Long | 否 | - | 按作者筛选 |
| categoryId | Long | 否 | - | 按分类筛选 |
| keyword | string | 否 | - | 按标题关键字搜索 |
| sort | string | 否 | - | 排序方式：latest（最新）/hot（最热） |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `VideoCardVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 视频id |
| title | String | 标题 |
| coverImage | String | 封面图 |
| duration | Integer | 视频时长（秒） |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| author | UserBriefVO | 作者简要信息（id/nickName/avatar/signature） |
| category | CategoryBriefVO | 分类简要信息（id/name） |
| createdAt | LocalDateTime | 创建时间 |

---

### 13.2 视频详情

- **接口**：`GET /videos/{id}`
- **鉴权**：无需登录（私人视频仅作者本人可见，被隐藏视频仅作者与管理员可见）
- **功能**：返回视频的完整信息，包括作者信息、点赞数、收藏数等。每次访问 `view_count += 1`。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 视频id |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 视频id |
| title | String | 标题 |
| description | String | 视频描述 |
| videoUrl | String | 视频播放地址 |
| coverImage | String | 封面图 |
| duration | Integer | 视频时长（秒） |
| fileSize | Long | 文件大小（字节） |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| status | Integer | 可见状态：0-公共 1-私人 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| allowDownload | Integer | 是否允许下载：0-禁止 1-允许 |
| author | UserBriefVO | 作者简要信息（id/nickName/avatar/isFollowing） |
| category | CategoryBriefVO | 分类简要信息 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |
| isLiked | Boolean | 当前用户是否已点赞 |
| isFavorited | Boolean | 当前用户是否已收藏 |

> `author.isFollowing`：当前登录用户是否已关注该作者。未登录或未关注时为 `false`，仅登录态下有意义。


---

### 13.3 发布视频

- **接口**：`POST /videos`
- **鉴权**：登录
- **功能**：当前登录用户发布一个新视频。

> ⚠️ **重要：本接口接收的是 JSON 请求体，不是视频文件本身。**
> 请勿把视频二进制直接 POST 到本接口（不要使用 `Content-Type: video/mp4`），否则会因无法反序列化而报错。
> 正确流程是**两步**：
> 1. 先调用 `POST /uploads/video`（`multipart/form-data`）上传视频文件，拿到返回的 `url`；
> 2. 再把该 `url` 作为本接口的 `videoUrl` 字段，以 JSON 形式提交。

**传参（JSON Body，`Content-Type: application/json`）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| title | string | 是 | 标题 |
| description | string | 否 | 视频描述 |
| videoUrl | string | 是 | 视频播放地址（**需先调用 `POST /uploads/video` 上传视频拿到 URL 再传入**） |
| coverImage | string | 否 | 封面图URL（需先调用 `POST /uploads/image (scene=video_cover)` 拿到URL） |
| duration | int | 否 | 视频时长（秒） |
| fileSize | Long | 否 | 文件大小（字节） |
| categoryId | Long | 否 | 分类id，需是存在的分类 |
| status | int | 否 | 可见状态：0-公共 1-私人，默认0 |

**请求示例**：

```http
POST /videos
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "我的第一个视频",
  "videoUrl": "/video/xxxx.mp4",
  "description": "视频描述",
  "coverImage": "/images/xxxx.jpg",
  "duration": 120,
  "fileSize": 1048576,
  "categoryId": 1,
  "status": 0
}
```

**返回字段（data）**：发布后的 `VideoDetailVO` 对象


---

### 13.4 更新视频

- **接口**：`PUT /videos/{id}`
- **鉴权**：登录（仅作者本人）
- **功能**：更新自己发布的视频。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要更新的视频id |
| title | string | 否 | 标题 |
| description | string | 否 | 视频描述 |
| videoUrl | string | 否 | 视频播放地址 |
| coverImage | string | 否 | 封面图URL |
| duration | int | 否 | 视频时长（秒） |
| fileSize | Long | 否 | 文件大小（字节） |
| categoryId | Long | 否 | 分类id |
| status | int | 否 | 可见状态 |

**返回字段（data）**：更新后的 `VideoDetailVO` 对象

---

### 13.5 删除视频

- **接口**：`DELETE /videos/{id}`
- **鉴权**：登录（仅作者本人或管理员）
- **功能**：删除视频，级联删除该视频下的点赞/收藏/评论。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的视频id |

- **返回**：data 为 null

---

### 13.6 修改视频可见状态

- **接口**：`PUT /videos/{id}/status`
- **鉴权**：登录（仅作者本人）
- **功能**：在公共和私人之间切换视频的可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要修改的视频id |
| status | int | 是 | 0-公共 1-私人 |

- **返回**：data 为 null

---

## 14. 视频互动模块

### 14.1 点赞视频

- **接口**：`POST /videos/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定视频点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的视频id |

- **返回**：data 为 null

---

### 14.2 取消点赞视频

- **接口**：`DELETE /videos/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定视频的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的视频id |

- **返回**：data 为 null

---

### 14.3 收藏视频

- **接口**：`POST /videos/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户收藏指定视频。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要收藏的视频id |

- **返回**：data 为 null

---

### 14.4 取消收藏视频

- **接口**：`DELETE /videos/{id}/favorite`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定视频的收藏。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消收藏的视频id |

- **返回**：data 为 null

---

### 14.5 我收藏的视频

- **接口**：`GET /users/me/favorite-videos`
- **鉴权**：登录
- **功能**：返回当前登录用户收藏过的所有视频，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `VideoCardVO` 列表（见 13.1 视频列表字段）

---

## 15. 视频评论模块

### 15.1 视频评论列表

- **接口**：`GET /videos/{videoId}/comments`
- **鉴权**：无需登录（登录态下会附带 `isLiked` 字段）
- **功能**：返回某个视频下的所有评论，支持按时间/热度排序，分页返回。未登录也能看，但看不到被隐藏的评论。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| videoId | Long | 是 | - | 所属视频id |
| sort | string | 否 | - | 排序方式：latest（最新）/hot（最热） |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `CommentVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 评论id |
| content | String | 评论内容 |
| parentId | Long | 父评论id（回复的评论），一级评论为 null |
| rootId | Long | 根评论id（楼层id），一级评论为自身id |
| likeCount | Integer | 点赞数 |
| isLiked | Boolean | 当前用户是否已点赞 |
| isHidden | Integer | 是否隐藏：0-正常 1-已隐藏 |
| user | UserBriefVO | 评论者简要信息 |
| replyTo | UserBriefVO | 被回复的用户简要信息（回复场景） |
| createdAt | LocalDateTime | 创建时间 |

---

### 15.2 发表视频评论

- **接口**：`POST /videos/{videoId}/comments`
- **鉴权**：登录
- **功能**：当前登录用户在指定视频下发表评论，可以回复别人的评论。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| videoId | Long | 是 | 所属视频id |
| content | string | 是 | 评论内容 |
| parentId | Long | 否 | 回复的父评论id |

**返回字段（data）**：发表后的 `CommentVO` 对象

---

### 15.3 删除视频评论

- **接口**：`DELETE /video-comments/{id}`
- **鉴权**：登录（仅评论者本人或管理员）
- **功能**：删除指定视频评论，管理员可以删除任意评论。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的评论id |

- **返回**：data 为 null

---

### 15.4 点赞视频评论

- **接口**：`POST /video-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定视频评论点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的评论id |

- **返回**：data 为 null

---

### 15.5 取消点赞视频评论

- **接口**：`DELETE /video-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定视频评论的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的评论id |

- **返回**：data 为 null

---

### 15.6 管理员-全站视频评论列表

- **接口**：`GET /admin/video-comments`
- **鉴权**：管理员
- **功能**：查看所有视频下的评论，支持按关键字、视频、用户、隐藏状态筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按评论内容模糊匹配 |
| videoId | Long | 否 | - | 按所属视频筛选 |
| userId | Long | 否 | - | 按评论作者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `VideoComment` 实体列表

---

### 15.7 管理员-隐藏视频评论

- **接口**：`PUT /admin/video-comments/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏视频评论，隐藏后普通用户就看不到这条评论了。按 `root_id` 一次性级联隐藏整棵楼层。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的评论id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 15.8 管理员-恢复视频评论

- **接口**：`PUT /admin/video-comments/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的视频评论恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的评论id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

## 16. 文件评论模块

### 16.1 文件评论列表

- **接口**：`GET /files/{fileId}/comments`
- **鉴权**：无需登录（登录态下会附带 `isLiked` 字段）
- **功能**：返回某个文件下的所有评论，支持按时间/热度排序，分页返回。未登录也能看，但看不到被隐藏的评论。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| fileId | Long | 是 | - | 所属文件id |
| sort | string | 否 | - | 排序方式：latest（最新）/hot（最热） |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `CommentVO` 列表（字段同 15.1）

---

### 16.2 发表文件评论

- **接口**：`POST /files/{fileId}/comments`
- **鉴权**：登录
- **功能**：当前登录用户在指定文件下发表评论，可以回复别人的评论。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| fileId | Long | 是 | 所属文件id |
| content | string | 是 | 评论内容 |
| parentId | Long | 否 | 回复的父评论id |

**返回字段（data）**：发表后的 `CommentVO` 对象

---

### 16.3 删除文件评论

- **接口**：`DELETE /file-comments/{id}`
- **鉴权**：登录（仅评论者本人或管理员）
- **功能**：删除指定文件评论，管理员可以删除任意评论。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的评论id |

- **返回**：data 为 null

---

### 16.4 点赞文件评论

- **接口**：`POST /file-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户给指定文件评论点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要点赞的评论id |

- **返回**：data 为 null

---

### 16.5 取消点赞文件评论

- **接口**：`DELETE /file-comments/{id}/like`
- **鉴权**：登录
- **功能**：当前登录用户取消对指定文件评论的点赞。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要取消点赞的评论id |

- **返回**：data 为 null

---

### 16.6 管理员-全站文件评论列表

- **接口**：`GET /admin/file-comments`
- **鉴权**：管理员
- **功能**：查看所有文件下的评论，支持按关键字、文件、用户、隐藏状态筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按评论内容模糊匹配 |
| fileId | Long | 否 | - | 按所属文件筛选 |
| userId | Long | 否 | - | 按评论作者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `FileComment` 实体列表

---

### 16.7 管理员-隐藏文件评论

- **接口**：`PUT /admin/file-comments/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏文件评论，隐藏后普通用户就看不到这条评论了。按 `root_id` 一次性级联隐藏整棵楼层。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的评论id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 16.8 管理员-恢复文件评论

- **接口**：`PUT /admin/file-comments/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的文件评论恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的评论id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

## 17. 通知模块

### 17.1 通知列表

- **接口**：`GET /notifications`
- **鉴权**：登录（仅本人通知）
- **功能**：返回当前登录用户的通知，支持按类型、已读状态筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| type | Integer | 否 | - | 通知类型筛选 |
| isRead | Integer | 否 | - | 已读状态筛选：0-未读 1-已读 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `NotificationVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 通知id |
| type | Integer | 通知类型 |
| sender | UserBriefVO | 触发通知的用户简要信息 |
| targetType | Integer | 关联对象类型 |
| targetId | Long | 关联对象id |
| content | String | 通知内容 |
| isRead | Boolean | 是否已读 |
| createdAt | LocalDateTime | 创建时间 |

---

### 17.2 未读通知数量

- **接口**：`GET /notifications/unread-count`
- **鉴权**：登录
- **功能**：返回当前登录用户未读通知的数量。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| count | Integer | 未读通知数量 |

---

### 17.3 标记单条通知已读

- **接口**：`PUT /notifications/{id}/read`
- **鉴权**：登录（仅本人通知）
- **功能**：把当前登录用户的某条通知标记为已读。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要标记已读的通知id |

- **返回**：data 为 null

---

### 17.4 全部标记已读

- **接口**：`PUT /notifications/read-all`
- **鉴权**：登录
- **功能**：把当前登录用户的所有未读通知都标记为已读。

- **返回**：data 为 null

---

### 17.5 删除通知

- **接口**：`DELETE /notifications/{id}`
- **鉴权**：登录（仅本人通知）
- **功能**：删除当前登录用户的某条通知。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要删除的通知id |

- **返回**：data 为 null

---

## 18. 举报模块

### 18.1 提交举报

- **接口**：`POST /reports`
- **鉴权**：登录
- **功能**：当前登录用户举报某个内容（文章/视频/文件/评论/用户等）。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| targetType | Integer | 是 | 被举报对象类型：0-文章 1-视频 2-文件 3-文章评论 4-视频评论 5-文件评论 6-用户 |
| targetId | Long | 是 | 被举报对象id |
| reason | string | 是 | 举报原因 |

- **返回**：data 为 null

---

### 18.2 管理员-举报列表

- **接口**：`GET /admin/reports`
- **鉴权**：管理员
- **功能**：查看所有举报，支持按状态、类型筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| status | Integer | 否 | - | 处理状态筛选：0-待处理 1-已处理 |
| type | Integer | 否 | - | 举报类型筛选 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Report` 实体列表

---

### 18.3 管理员-举报详情

- **接口**：`GET /admin/reports/{id}`
- **鉴权**：管理员
- **功能**：查看某条举报的完整信息，包括举报人、被举报对象、举报原因和处理结果。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 举报id |

**返回字段（data）**：`Report` 对象

---

### 18.4 管理员-处理举报

- **接口**：`PUT /admin/reports/{id}/handle`
- **鉴权**：管理员
- **功能**：处理某条举报，填写处理结果。若举报属实，会联动隐藏/冻结被举报对象并写入审核日志。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要处理的举报id |
| result | Integer | 是 | 处理结果：0-不属实 1-属实 |
| handleResult | string | 否 | 处理说明 |

- **返回**：data 为 null

---

## 19. 申诉模块

### 19.1 提交申诉

- **接口**：`POST /appeals`
- **鉴权**：登录
- **功能**：当前登录用户对处罚结果提出异议（账号冻结/内容被隐藏）。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| targetType | Integer | 是 | 被处罚对象类型：0-文章 1-视频 2-文件 3-文章评论 4-视频评论 5-文件评论 6-用户 |
| targetId | Long | 是 | 被处罚对象id |
| reason | string | 是 | 申诉理由 |

- **返回**：data 为 null

---

### 19.2 我的申诉列表

- **接口**：`GET /appeals`
- **鉴权**：登录
- **功能**：当前登录用户查看自己提交的所有申诉，支持按状态筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| status | Integer | 否 | - | 处理状态筛选：0-待处理 1-通过 2-驳回 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Appeal` 实体列表

---

### 19.3 管理员-申诉列表

- **接口**：`GET /admin/appeals`
- **鉴权**：管理员
- **功能**：查看全站所有申诉，支持按状态、类型、申诉人筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| status | Integer | 否 | - | 处理状态筛选：0-待处理 1-通过 2-驳回 |
| targetType | Integer | 否 | - | 被处罚对象类型筛选 |
| userId | Long | 否 | - | 按申诉人筛选 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Appeal` 实体列表

---

### 19.4 管理员-申诉详情

- **接口**：`GET /admin/appeals/{id}`
- **鉴权**：管理员
- **功能**：查看某条申诉的完整信息，包括申诉人、被处罚对象、申诉理由和处理结果。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 申诉id |

**返回字段（data）**：`Appeal` 对象

---

### 19.5 管理员-处理申诉

- **接口**：`PUT /admin/appeals/{id}/handle`
- **鉴权**：管理员
- **功能**：处理某条申诉，通过则撤销原处罚（解冻账号/恢复内容），驳回则维持原处罚。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要处理的申诉id |
| status | Integer | 是 | 处理结果：1-通过 2-驳回 |
| handleResult | string | 否 | 处理说明 |

- **返回**：data 为 null

---

## 20. 管理员后台模块

> 所有接口均要求当前登录用户是管理员（role=1），否则拒绝访问。

### 20.1 管理员-用户列表

- **接口**：`GET /admin/users`
- **鉴权**：管理员
- **功能**：查看全站用户，支持按昵称/邮箱关键字、账号状态、角色筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按昵称或邮箱模糊匹配 |
| status | Integer | 否 | - | 账号状态筛选：0-正常 1-冻结 |
| role | Integer | 否 | - | 角色筛选：0-普通用户 1-管理员 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `User` 实体列表

---

### 20.2 管理员-冻结用户

- **接口**：`PUT /admin/users/{id}/freeze`
- **鉴权**：管理员
- **功能**：冻结用户，冻结后该用户无法登录，需填写冻结原因并记录到冻结日志。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 被冻结的用户id |
| reason | string | 是 | 冻结原因 |

- **返回**：data 为 null

---

### 20.3 管理员-解冻用户

- **接口**：`PUT /admin/users/{id}/unfreeze`
- **鉴权**：管理员
- **功能**：解冻用户，解冻后该用户可以重新登录。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 被解冻的用户id |

- **返回**：data 为 null

---

### 20.4 管理员-查看用户冻结日志

- **接口**：`GET /admin/users/{id}/freeze-logs`
- **鉴权**：管理员
- **功能**：查看某个用户的冻结日志，记录每次被冻结/解冻的时间、原因和操作人。

**传参（Path + Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| id | Long | 是 | - | 要查看的用户id |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `UserFreezeLog` 实体列表

---

### 20.5 管理员-文章列表

- **接口**：`GET /admin/articles`
- **鉴权**：管理员
- **功能**：查看全站所有文章，包括被隐藏的和私人的，支持多种条件筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按标题模糊匹配 |
| userId | Long | 否 | - | 按作者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| status | Integer | 否 | - | 按可见状态筛选：0-公共 1-私人 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Article` 实体列表（含 creator/frozenByName/categoryName/commentCount 等联表字段）

---

### 20.6 管理员-隐藏文章

- **接口**：`PUT /admin/articles/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏文章，隐藏后普通用户就看不到这篇文章了。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的文章id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 20.7 管理员-恢复文章

- **接口**：`PUT /admin/articles/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的文章恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的文章id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

### 20.8 管理员-全站文章评论列表

- **接口**：`GET /admin/article-comments`
- **鉴权**：管理员
- **功能**：查看所有文章下的评论，支持按关键字、文章、用户、隐藏状态筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按评论内容模糊匹配 |
| articleId | Long | 否 | - | 按所属文章筛选 |
| userId | Long | 否 | - | 按评论作者筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ArticleComment` 实体列表

---

### 20.9 管理员-隐藏文章评论

- **接口**：`PUT /admin/article-comments/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏文章评论，隐藏后普通用户就看不到这条评论了。按 `root_id` 一次性级联隐藏整棵楼层。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的评论id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 20.10 管理员-恢复文章评论

- **接口**：`PUT /admin/article-comments/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的文章评论恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的评论id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

### 20.11 管理员-文件列表

- **接口**：`GET /admin/files`
- **鉴权**：管理员
- **功能**：查看所有用户上传的文件，支持多种条件筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按文件名模糊匹配 |
| userId | Long | 否 | - | 按上传者筛选 |
| fileType | Integer | 否 | - | 按文件类型筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| allowDownload | Integer | 否 | - | 按下载权限筛选：0-禁止 1-允许 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `File` 实体列表

---

### 20.12 管理员-隐藏文件

- **接口**：`PUT /admin/files/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏文件，隐藏后普通用户就看不到这个文件了。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的文件id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 20.13 管理员-设置文件下载权限

- **接口**：`PUT /admin/files/{id}/allow-download`
- **鉴权**：管理员
- **功能**：控制这个文件是否允许被下载。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要设置的文件id |
| allowDownload | Integer | 是 | 0-禁止 1-允许 |
| reason | string | 否 | 原因 |

- **返回**：data 为 null

---

### 20.14 管理员-视频列表

- **接口**：`GET /admin/videos`
- **鉴权**：管理员
- **功能**：查看全站所有视频，包括被隐藏的和私人的，支持多种条件筛选。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按标题模糊匹配 |
| userId | Long | 否 | - | 按作者筛选 |
| categoryId | Long | 否 | - | 按分类筛选 |
| isHidden | Integer | 否 | - | 按隐藏状态筛选：0-正常 1-隐藏 |
| status | Integer | 否 | - | 按可见状态筛选：0-公共 1-私人 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `Video` 实体列表

---

### 20.15 管理员-隐藏视频

- **接口**：`PUT /admin/videos/{id}/hide`
- **鉴权**：管理员
- **功能**：隐藏视频，隐藏后普通用户就看不到这个视频了。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要隐藏的视频id |
| reason | string | 是 | 隐藏原因 |

- **返回**：data 为 null

---

### 20.16 管理员-恢复视频

- **接口**：`PUT /admin/videos/{id}/unhide`
- **鉴权**：管理员
- **功能**：把之前隐藏的视频恢复为可见状态。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要恢复的视频id |
| reason | string | 否 | 恢复原因 |

- **返回**：data 为 null

---

### 20.17 管理员-设置视频下载权限

- **接口**：`PUT /admin/videos/{id}/allow-download`
- **鉴权**：管理员
- **功能**：控制这个视频是否允许被下载。

**传参（Path + Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要设置的视频id |
| allowDownload | Integer | 是 | 0-禁止 1-允许 |
| reason | string | 否 | 原因 |

- **返回**：data 为 null

---

### 20.18 管理员-管理员列表

- **接口**：`GET /admin/admins`
- **鉴权**：管理员
- **功能**：查看当前所有管理员账号，支持按昵称/邮箱关键字搜索。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按昵称或邮箱模糊匹配 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的管理员 `User` 列表

---

### 20.19 管理员-设置管理员

- **接口**：`POST /admin/admins`
- **鉴权**：管理员
- **功能**：把某个普通用户提升为管理员，需填写授权说明。

**传参（JSON Body）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| userId | Long | 是 | 被授权的用户id |
| reason | string | 否 | 授权说明 |

- **返回**：data 为 null

---

### 20.20 管理员-撤销管理员

- **接口**：`DELETE /admin/admins/{id}`
- **鉴权**：管理员
- **功能**：把某个管理员降级为普通用户。不能撤销自己，避免误操作导致后台无人管理。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 要撤销的管理员用户id |

- **返回**：data 为 null

---

### 20.21 管理员-审核日志列表

- **接口**：`GET /admin/moderation-logs`
- **鉴权**：管理员
- **功能**：查看全站所有内容审核操作日志，支持按对象类型、对象id、操作管理员筛选，分页返回。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| targetType | Integer | 否 | - | 被操作对象类型筛选 |
| targetId | Long | 否 | - | 被操作对象id筛选 |
| adminId | Long | 否 | - | 操作管理员id筛选 |
| page | int | 否 | 1 | 页码 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ContentModerationLog` 实体列表

---

### 20.22 管理员-后台统计概览

- **接口**：`GET /admin/dashboard`
- **鉴权**：管理员
- **功能**：返回全站核心统计数据，用于后台首页展示。

**返回字段（data）**：`Map`，包含用户数、冻结用户数、文章数、视频数、文件数、待处理举报数、待处理申诉数、今日新增用户数、今日新增文章数等。

---

### 20.23 管理员-获取系统设置

- **接口**：`GET /admin/settings`
- **鉴权**：管理员
- **功能**：返回全站站点配置，如站点名称、简介、ICP备案号、是否开放注册等。

**返回字段（data）**：`Map`，系统设置键值对（siteName/allowRegister/maxUploadSizeMb/commentMaxLength 等）

---

### 20.24 管理员-更新系统设置

- **接口**：`PUT /admin/settings`
- **鉴权**：管理员
- **功能**：更新系统设置，仅更新请求体中传入的键，未传的键保持不变。

**传参（JSON Body）**：系统设置键值对，均可选，传什么改什么。

- **返回**：data 为 null

---

## 21. 创作者数据统计模块

> 基于 article/video/file/user_follow 现有数据实时聚合，无需额外建表。所有接口需登录，统计的是当前登录创作者自己的数据。

### 21.1 内容总览

- **接口**：`GET /creator/statistics/overview`
- **鉴权**：登录（仅本人数据）
- **功能**：返回当前创作者的作品数、总浏览、总点赞、总收藏、粉丝数。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| totalArticles | Long | 文章数 |
| totalVideos | Long | 视频数 |
| totalFiles | Long | 文件数 |
| totalViews | Long | 总浏览量 |
| totalLikes | Long | 总点赞数 |
| totalFavorites | Long | 总收藏数 |
| totalFollowers | Long | 粉丝数 |

---

### 21.2 粉丝增长趋势

- **接口**：`GET /creator/statistics/followers`
- **鉴权**：登录
- **功能**：基于 `user_follow.created_at` 按天统计新增关注数。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| range | string | 否 | 7d | 时间范围：7d/30d/90d |

**返回字段（data）**：`[{ "date": "2026-07-30", "newFollowers": 5 }, ...]`

---

### 21.3 内容产出趋势

- **接口**：`GET /creator/statistics/content`
- **鉴权**：登录
- **功能**：基于 article/video/file 各自的 `created_at` 按天统计新增产出数量。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| range | string | 否 | 7d | 时间范围：7d/30d/90d |

**返回字段（data）**：按天分组的文章/视频/文件新增数量列表

---

### 21.4 获赞与收藏统计

- **接口**：`GET /creator/statistics/favorites`
- **鉴权**：登录
- **功能**：返回当前时刻的点赞/收藏总量快照，不含历史趋势。

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| totalLikes | Long | 总点赞数 |
| totalFavorites | Long | 总收藏数 |

---

## 22. 静态素材上传模块

> 与"文件模块"的边界区分：本模块只服务于 UI 装饰性素材（头像、文章/视频封面、分类封面），只返回一个 CDN 直链，不写入 `file` 表，因此不会出现在文件列表/统计/收藏/点赞/下载/后台审核队列里。

### 22.1 上传图片素材

- **接口**：`POST /uploads/image`（`multipart/form-data`）
- **鉴权**：登录
- **功能**：上传图片素材，返回可访问 URL，前端将其作为 avatar/coverImage 等字段写入对应业务表。

**传参（Form）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| file | file | 是 | 图片二进制，服务端校验大小（建议≤5MB）与格式（jpg/png/webp） |
| scene | string | 否 | 上传场景：avatar/article_cover/video_cover/category_cover，用于服务端选择不同的裁剪/压缩策略 |

**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| url | String | 图片可访问 URL |

**使用场景**：

| 场景 | scene 值 | 后续用途 |
| --- | --- | --- |
| 头像 | avatar | 作为 `PUT /users/me` 的 avatar 参数 |
| 文章封面 | article_cover | 作为 `POST/PUT /articles` 的 coverImage 参数 |
| 视频封面 | video_cover | 作为 `POST/PUT /videos` 的 coverImage 参数 |
| 分类封面 | category_cover | 作为 `POST/PUT /admin/{article|file|video}-categories` 的 coverImage 参数 |

---

### 22.2 上传视频素材

- **接口**：`POST /uploads/video`（`multipart/form-data`）
- **鉴权**：登录
- **功能**：上传本地视频文件，返回可访问 URL，前端将其作为 `POST /videos` 的 `videoUrl` 字段写入视频记录。视频保存到 `file.upload-dir/video` 专用子目录，通过 `/video/**` 静态资源映射访问。

**传参（Form）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| file | file | 是 | 视频二进制，服务端校验格式（mp4/webm/mov/avi/mkv/flv/wmv/m4v/mpg/mpeg/3gp），大小受 `spring.servlet.multipart.max-file-size` 限制（默认 10GB） |


**返回字段（data）**：

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| url | String | 视频可访问 URL（`/video/xxx`） |



**使用场景**：

| 场景 | 后续用途 |
| --- | --- |
| 视频发布 | 作为 `POST /videos` 的 videoUrl 参数 |
| 视频更新 | 作为 `PUT /videos/{id}` 的 videoUrl 参数 |


# 博客系统接口功能详解（五）

> 本文档基于后端实际代码（Controller / DTO / Entity）整理，罗列所有接口的功能、能做什么、返回字段名及注释、传参及注释。
> 本文档为「接口功能详解（一）（二）（三）（四）」的**补充篇**，补齐此前遗漏的接口：文章关注动态、文章/文件/视频的点赞用户列表、收藏用户列表、既点赞又收藏用户列表、管理员文章分类列表。
> 统一响应格式：`{ "code": 0, "message": "success", "data": {...} }`，`code=0` 表示成功。
> 鉴权方式：除标注"无需登录"外，均需请求头 `Authorization: Bearer {token}`。

---

## 目录

- [23. 文章模块补充](#23-文章模块补充)
- [24. 文件模块补充](#24-文件模块补充)
- [25. 视频模块补充](#25-视频模块补充)
- [26. 管理员后台补充](#26-管理员后台补充)
- [27. 内容模块补充（关注动态）](#27-内容模块补充关注动态)


---



## 23. 文章模块补充

### 23.1 文章关注动态

- **接口**：`GET /articles/feed`
- **鉴权**：登录
- **功能**：返回当前登录用户关注的人发布的**文章**动态，分页返回。与 `GET /content/feed`（内容广场聚合，混合文章/视频/文件）不同，本接口只返回文章类型的内容，用于"关注-文章"专属信息流。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ArticleCardVO` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 文章id |
| title | String | 标题 |
| coverImage | String | 封面图 |
| summary | String | 摘要 |
| viewCount | Integer | 浏览量 |
| likeCount | Integer | 点赞数 |
| favoriteCount | Integer | 收藏数 |
| author | UserBriefVO | 作者简要信息（id/nickName/avatar/signature） |
| category | CategoryBriefVO | 分类简要信息（id/name） |
| createdAt | LocalDateTime | 创建时间 |
| isLiked | Boolean | 当前用户是否已点赞 |
| isFavorited | Boolean | 当前用户是否已收藏 |

---

### 23.2 点赞该文章的用户列表

- **接口**：`GET /articles/{id}/likes`
- **鉴权**：无需登录
- **功能**：返回所有给这篇文章点过赞的用户基本信息（昵称、头像等），按点赞时间倒序。用于前端展示"点赞头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文章id |

**返回字段（data）**：`User` 实体列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 用户id |
| email | String | 注册邮箱 |
| phone | String | 手机号 |
| nickName | String | 用户昵称 |
| avatar | String | 头像链接 |
| gender | Integer | 性别：0-保密 1-男 2-女 |
| birthday | LocalDate | 出生日期 |
| signature | String | 个性签名 |
| role | Integer | 角色：0-普通用户 1-管理员 |
| status | Integer | 账号状态：0-正常 1-已冻结 |
| createdAt | LocalDateTime | 注册时间 |

---

### 23.3 收藏该文章的用户列表

- **接口**：`GET /articles/{id}/favorites`
- **鉴权**：无需登录
- **功能**：返回所有收藏过这篇文章的用户基本信息（昵称、头像等），按收藏时间倒序。用于前端展示"收藏头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文章id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

### 23.4 既点赞又收藏该文章的用户列表

- **接口**：`GET /articles/{id}/duplicates`
- **鉴权**：无需登录
- **功能**：返回点赞列表和收藏列表中**重复出现**的用户（即既点赞又收藏了同一篇文章的用户）。用于查看哪些用户同时出现在点赞和收藏列表中。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文章id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

## 24. 文件模块补充

### 24.1 点赞该文件的用户列表

- **接口**：`GET /files/{id}/likes`
- **鉴权**：无需登录
- **功能**：返回所有给这个文件点过赞的用户基本信息（昵称、头像等），按点赞时间倒序。用于前端展示"点赞头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文件id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

### 24.2 收藏该文件的用户列表

- **接口**：`GET /files/{id}/favorites`
- **鉴权**：无需登录
- **功能**：返回所有收藏过这个文件的用户基本信息（昵称、头像等），按收藏时间倒序。用于前端展示"收藏头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文件id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

### 24.3 既点赞又收藏该文件的用户列表

- **接口**：`GET /files/{id}/duplicates`
- **鉴权**：无需登录
- **功能**：返回点赞列表和收藏列表中**重复出现**的用户（即既点赞又收藏了同一文件的用户）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 文件id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

## 25. 视频模块补充

### 25.1 点赞该视频的用户列表

- **接口**：`GET /videos/{id}/likes`
- **鉴权**：无需登录
- **功能**：返回所有给这个视频点过赞的用户基本信息（昵称、头像等），按点赞时间倒序。用于前端展示"点赞头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 视频id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

### 25.2 收藏该视频的用户列表

- **接口**：`GET /videos/{id}/favorites`
- **鉴权**：无需登录
- **功能**：返回所有收藏过这个视频的用户基本信息（昵称、头像等），按收藏时间倒序。用于前端展示"收藏头像墙"。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 视频id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

### 25.3 既点赞又收藏该视频的用户列表

- **接口**：`GET /videos/{id}/duplicates`
- **鉴权**：无需登录
- **功能**：返回点赞列表和收藏列表中**重复出现**的用户（即既点赞又收藏了同一视频的用户）。

**传参（Path）**：

| 参数 | 类型 | 必填 | 注释 |
| --- | --- | --- | --- |
| id | Long | 是 | 视频id |

**返回字段（data）**：`User` 实体列表（字段见 23.2）

---

## 26. 管理员后台补充

### 26.1 管理员-文章分类列表

- **接口**：`GET /admin/article-categories`
- **鉴权**：管理员
- **功能**：查看全站所有文章分类（分页），支持按分类名称关键字搜索。文章分类为全站统一分类，由管理员统一维护。与公开接口 `GET /article-categories`（不分页、返回全部）不同，本接口用于后台管理页面的分页展示。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | - | 按分类名称模糊匹配 |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `UserCategory` 列表

| 字段 | 类型 | 注释 |
| --- | --- | --- |
| id | Long | 分类id |
| name | String | 分类名称 |
| description | String | 分类简介 |
| coverImage | String | 分类图片链接 |
| sortOrder | Integer | 排序值，越小越靠前 |
| createdAt | LocalDateTime | 创建时间 |
| articleCount | Long | 该分类下的文章数量 |

---

## 27. 内容模块补充（关注动态）

### 27.1 关注动态（内容聚合）

- **接口**：`GET /content/follow-feed`
- **鉴权**：登录
- **功能**：返回当前登录用户关注的人发布的**公共且未隐藏**的文章/视频/文件，按创建时间倒序合并分页返回。**需要登录**。与内容广场聚合接口 `GET /content/feed`（混合全站内容）不同，本接口只返回关注对象发布的内容，用于"关注-信息流"。

**传参（Query）**：

| 参数 | 类型 | 必填 | 默认值 | 注释 |
| --- | --- | --- | --- | --- |
| type | string | 否 | - | 内容类型筛选：article-文章 / video-视频 / file-文件，为空返回全部 |
| page | int | 否 | 1 | 页码，从1开始 |
| size | int | 否 | 10 | 每页条数 |

**返回字段（data）**：分页的 `ContentCardVO` 列表（字段见 7.1 内容广场聚合）

---

## 附：已停用（不对外提供）的接口说明



以下 Controller 类在代码中已标注"已停用"，**不再注册为 Spring Controller**，因此不对外提供接口，前端无需对接：

| 类名 | 说明 |
| --- | --- |
| ArticleLikeController | 文章点赞接口（已停用），点赞/取消点赞已由 `POST/DELETE /articles/{id}/like` 提供 |
| ArticleFavoriteController | 文章收藏接口（已停用），收藏/取消收藏已由 `POST/DELETE /articles/{id}/favorite` 提供 |
| ContentStatusController | 内容可见状态接口（已停用），各模块已提供各自的 `PUT /{module}/{id}/status` |
| VisitorController | 访客接口（已停用），API 文档中不存在访客模块 |
| ModerationLogController | 审核日志接口（已停用），已由 `GET /admin/moderation-logs` 提供 |
