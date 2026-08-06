-- ============================================================
-- Blog Backend Database (修复版 v2)
-- 相对原始版本的修正：
-- 1. notification.target_type 与 report.target_type 枚举完全对齐
-- 2. user_freeze_log.admin_id 改为 DEFAULT NULL（修复 ERR 1830 外键冲突）
-- 3. private_message 改为 RESTRICT（保留聊天历史）
-- 4. 补充约束说明和应用层校验指导
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 0. 重建数据库
DROP DATABASE IF EXISTS blog_backend;
CREATE DATABASE blog_backend DEFAULT CHARSET = utf8mb4;
USE blog_backend;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 一、用户体系
-- ============================================================

-- 1. 用户表
CREATE TABLE user
(
    id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一标识id',

    email         VARCHAR(100) NOT NULL COMMENT '注册邮箱，作为登录账号，无需验证即可注册',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值（bcrypt/argon2等，禁止存明文）',
    phone         VARCHAR(20)  DEFAULT NULL COMMENT '手机号，非必填，同邮箱一样不做验证码校验',

    nick_name     VARCHAR(30)  NOT NULL COMMENT '用户昵称，可自行修改，默认可用邮箱前缀生成',
    avatar        VARCHAR(500) DEFAULT NULL COMMENT '头像链接，通过 POST /uploads/image(scene=avatar) 获取URL后写入',
    gender        TINYINT      DEFAULT 0 COMMENT '性别：0-保密 1-男 2-女',
    birthday      DATE         DEFAULT NULL COMMENT '出生日期',
    signature     VARCHAR(200) DEFAULT NULL COMMENT '个性签名/个人简介',

    role          TINYINT      DEFAULT 0 COMMENT '角色：0-普通用户 1-管理员',
    status        TINYINT      DEFAULT 0 COMMENT '账号状态：0-正常 1-已冻结',
    frozen_reason VARCHAR(255) DEFAULT NULL COMMENT '冻结原因',
    frozen_at     DATETIME     DEFAULT NULL COMMENT '冻结时间',
    frozen_by     BIGINT       DEFAULT NULL COMMENT '执行冻结的管理员id',

    last_login_at DATETIME     DEFAULT NULL COMMENT '最后登录时间',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    updated_at    DATETIME     DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '资料更新时间',

    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    FOREIGN KEY (frozen_by) REFERENCES user (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';

-- 2. 登录令牌表
CREATE TABLE user_token
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'token记录id',
    user_id     BIGINT       NOT NULL COMMENT '所属用户id',
    token       CHAR(36)     NOT NULL COMMENT '登录令牌',
    device_info VARCHAR(255) DEFAULT NULL COMMENT '设备/浏览器信息',
    ip_address  VARCHAR(50)  DEFAULT NULL COMMENT '签发时IP',
    expires_at  DATETIME     NOT NULL COMMENT 'token过期时间',
    revoked     TINYINT      DEFAULT 0 COMMENT '是否已撤销：0-有效 1-已撤销',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '签发时间',
    UNIQUE KEY uk_token (token),
    KEY idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户登录令牌表';

-- 3. 冻结/解冻操作日志表（修复：admin_id 设为可为空以配合 ON DELETE SET NULL）
CREATE TABLE user_freeze_log
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志id',
    user_id    BIGINT       NOT NULL COMMENT '被操作的用户id',
    admin_id   BIGINT       DEFAULT NULL COMMENT '执行操作的管理员id',
    action     TINYINT      NOT NULL COMMENT '操作类型：0-冻结 1-解冻',
    reason     VARCHAR(255) DEFAULT NULL COMMENT '操作原因',
    report_id  BIGINT       DEFAULT NULL COMMENT '若源于举报处理，关联report表id',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES user (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户冻结/解冻审计日志';

-- 4. 用户关注关系表
CREATE TABLE user_follow
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关注记录主键',
    follower_id BIGINT   NOT NULL COMMENT '粉丝id',
    followee_id BIGINT   NOT NULL COMMENT '被关注者id',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    UNIQUE KEY uk_follower_followee (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES user (id) ON DELETE CASCADE,
    KEY idx_followee (followee_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户关注关系表';

-- ============================================================
-- 二、文章相关
-- ============================================================

-- 5. 文章分类表
CREATE TABLE article_category
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类id',
    name        VARCHAR(50) NOT NULL COMMENT '分类名称',
    description VARCHAR(200) DEFAULT NULL COMMENT '分类简介',
    cover_image VARCHAR(500) COMMENT '分类图片链接',
    sort_order  INT      DEFAULT 0 COMMENT '排序值',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文章分类表';

-- 6. 文章主表
CREATE TABLE article
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文章id',
    title          VARCHAR(255) NOT NULL COMMENT '文章标题',
    content        TEXT COMMENT '文章正文',
    cover_image    VARCHAR(500) COMMENT '封面图片链接',
    view_count     INT      DEFAULT 0 COMMENT '浏览量',
    user_id        BIGINT COMMENT '发布用户id',
    category_id    BIGINT COMMENT '分类id',
    like_count     INT      DEFAULT 0 COMMENT '点赞总数',
    favorite_count INT      DEFAULT 0 COMMENT '收藏总数',

    status         TINYINT  DEFAULT 0 COMMENT '可见状态：0-公共 1-私人',
    is_hidden      TINYINT  DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    frozen_reason  VARCHAR(255) DEFAULT NULL COMMENT '隐藏原因',
    frozen_at      DATETIME DEFAULT NULL COMMENT '隐藏操作时间',
    frozen_by      BIGINT   DEFAULT NULL COMMENT '执行隐藏的管理员id',

    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at     DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES article_category (id) ON DELETE SET NULL,
    FOREIGN KEY (frozen_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_is_hidden (is_hidden)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '博客文章表';

-- 7. 文章点赞关联表
CREATE TABLE article_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    article_id BIGINT   NOT NULL COMMENT '被点赞文章id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_article_user (article_id, user_id),
    FOREIGN KEY (article_id) REFERENCES article (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文章点赞关系表';

-- 8. 文章收藏关联表
CREATE TABLE article_favorite
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏记录主键',
    article_id BIGINT   NOT NULL COMMENT '被收藏文章id',
    user_id    BIGINT   NOT NULL COMMENT '收藏用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_article_user (article_id, user_id),
    FOREIGN KEY (article_id) REFERENCES article (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文章收藏关系表';

-- 9. 文章评论表
CREATE TABLE article_comment
(
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论id',
    article_id          BIGINT       NOT NULL COMMENT '所属文章id',
    user_id             BIGINT       NOT NULL COMMENT '评论用户id',
    parent_id           BIGINT   DEFAULT NULL COMMENT '上级评论id，null代表一级评论',
    root_id             BIGINT   DEFAULT NULL COMMENT '根评论id，一级评论root_id=自身id',
    depth               INT      DEFAULT 0 COMMENT '嵌套层级，一级评论=0',
    reply_to_user_id    BIGINT   DEFAULT NULL COMMENT '具体回复的用户id',
    reply_to_nick_name  VARCHAR(30) DEFAULT NULL COMMENT '被回复用户昵称快照',
    content             VARCHAR(800) NOT NULL COMMENT '评论内容',
    like_count          INT      DEFAULT 0 COMMENT '点赞数',
    is_hidden           TINYINT  DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    hidden_reason       VARCHAR(255) DEFAULT NULL COMMENT '隐藏原因',
    hidden_at           DATETIME DEFAULT NULL COMMENT '隐藏操作时间',
    hidden_by           BIGINT   DEFAULT NULL COMMENT '执行隐藏的管理员id',
    ip_address          VARCHAR(50) DEFAULT NULL COMMENT '评论时IP',
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (article_id) REFERENCES article (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES article_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (hidden_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_article_root (article_id, root_id),
    KEY idx_is_hidden (is_hidden)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文章评论表';

-- 10. 文章评论点赞表
CREATE TABLE article_comment_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    comment_id BIGINT   NOT NULL COMMENT '被点赞评论id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES article_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文章评论点赞关系表';

-- ============================================================
-- 三、文件模块
-- ============================================================

-- 11. 文件分类表
CREATE TABLE file_category
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类id',
    name        VARCHAR(50) NOT NULL COMMENT '分类名称',
    description VARCHAR(200) DEFAULT NULL COMMENT '分类简介',
    cover_image VARCHAR(500) COMMENT '分类图片链接',
    sort_order  INT      DEFAULT 0 COMMENT '排序值',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件分类表';

-- 12. 文件表
CREATE TABLE file
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件id',
    user_id        BIGINT       NOT NULL COMMENT '上传者用户id',
    article_id     BIGINT       DEFAULT NULL COMMENT '关联文章id',
    category_id    BIGINT       DEFAULT NULL COMMENT '文件分类id',

    original_name  VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path      VARCHAR(500) NOT NULL COMMENT '文件存储路径或URL',
    file_ext       VARCHAR(20)  DEFAULT NULL COMMENT '文件扩展名',
    mime_type      VARCHAR(100) DEFAULT NULL COMMENT '文件MIME类型',
    file_type      TINYINT      DEFAULT 0 COMMENT '文件大类：0-其他 1-图片 2-文档 3-视频 4-音频 5-压缩包',
    file_size      BIGINT       DEFAULT 0 COMMENT '文件大小（字节）',
    like_count     INT          DEFAULT 0 COMMENT '点赞总数',
    favorite_count INT          DEFAULT 0 COMMENT '收藏总数',

    status         TINYINT      DEFAULT 0 COMMENT '可见状态：0-公共 1-私人',
    is_hidden      TINYINT      DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    allow_download TINYINT      DEFAULT 1 COMMENT '是否允许下载：0-禁止 1-允许',
    hidden_reason  VARCHAR(255) DEFAULT NULL COMMENT '隐藏/限制原因',
    hidden_at      DATETIME     DEFAULT NULL COMMENT '隐藏操作时间',
    hidden_by      BIGINT       DEFAULT NULL COMMENT '执行隐藏的管理员id',

    download_count   INT        DEFAULT 0 COMMENT '下载次数',
    last_download_at DATETIME   DEFAULT NULL COMMENT '最近下载时间',
    created_at       DATETIME   DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    updated_at       DATETIME   DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES article (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES file_category (id) ON DELETE SET NULL,
    FOREIGN KEY (hidden_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_user_id (user_id),
    KEY idx_article_id (article_id),
    KEY idx_category_id (category_id),
    KEY idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件表';

-- 13. 文件点赞关联表
CREATE TABLE file_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    file_id    BIGINT   NOT NULL COMMENT '被点赞文件id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_file_user (file_id, user_id),
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件点赞关系表';

-- 14. 文件收藏关联表
CREATE TABLE file_favorite
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏记录主键',
    file_id    BIGINT   NOT NULL COMMENT '被收藏文件id',
    user_id    BIGINT   NOT NULL COMMENT '收藏用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_file_user (file_id, user_id),
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件收藏关系表';

-- 15. 文件评论表
CREATE TABLE file_comment
(
    id                 BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论id',
    file_id            BIGINT       NOT NULL COMMENT '所属文件id',
    user_id            BIGINT       NOT NULL COMMENT '评论用户id',
    parent_id          BIGINT   DEFAULT NULL COMMENT '上级评论id',
    root_id            BIGINT   DEFAULT NULL COMMENT '根评论id',
    depth              INT      DEFAULT 0 COMMENT '嵌套层级',
    reply_to_user_id   BIGINT   DEFAULT NULL COMMENT '具体回复的用户id',
    reply_to_nick_name VARCHAR(30) DEFAULT NULL COMMENT '被回复用户昵称快照',
    content            VARCHAR(800) NOT NULL COMMENT '评论内容',
    like_count         INT      DEFAULT 0 COMMENT '点赞数',
    is_hidden          TINYINT  DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    hidden_reason      VARCHAR(255) DEFAULT NULL COMMENT '隐藏原因',
    hidden_at          DATETIME DEFAULT NULL COMMENT '隐藏操作时间',
    hidden_by          BIGINT   DEFAULT NULL COMMENT '执行隐藏的管理员id',
    ip_address         VARCHAR(50) DEFAULT NULL COMMENT '评论时IP',
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES file_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (hidden_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_file_root (file_id, root_id),
    KEY idx_is_hidden (is_hidden)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件评论表';

-- 16. 文件评论点赞表
CREATE TABLE file_comment_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    comment_id BIGINT   NOT NULL COMMENT '被点赞评论id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES file_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件评论点赞关系表';

-- 17. 文件下载日志表
CREATE TABLE file_download_log
(
    id            BIGINT      PRIMARY KEY AUTO_INCREMENT COMMENT '日志id',
    file_id       BIGINT      NOT NULL COMMENT '被下载文件id',
    user_id       BIGINT      DEFAULT NULL COMMENT '下载用户id',
    ip_address    VARCHAR(50) DEFAULT NULL COMMENT '下载时IP',
    downloaded_at DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '下载时间',
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '文件下载日志表';

-- ============================================================
-- 四、视频模块
-- ============================================================

-- 18. 视频分类表
CREATE TABLE video_category
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '视频分类id',
    name        VARCHAR(50) NOT NULL COMMENT '分类名称',
    cover_image VARCHAR(500) COMMENT '分类图片链接',
    sort_order  INT      DEFAULT 0 COMMENT '排序值',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频分类表';

-- 19. 视频主表
CREATE TABLE video
(
    id             BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '视频id',
    title          VARCHAR(255) NOT NULL COMMENT '视频标题',
    description    TEXT COMMENT '视频简介',
    video_url      VARCHAR(500) NOT NULL COMMENT '视频文件URL',
    cover_image    VARCHAR(500) COMMENT '视频封面图链接',
    duration       INT      DEFAULT 0 COMMENT '视频时长（秒）',
    file_size      BIGINT   DEFAULT 0 COMMENT '视频文件大小（字节）',
    view_count     INT      DEFAULT 0 COMMENT '播放量',
    user_id        BIGINT COMMENT '发布用户id',
    category_id    BIGINT COMMENT '分类id',
    like_count     INT      DEFAULT 0 COMMENT '点赞总数',
    favorite_count INT      DEFAULT 0 COMMENT '收藏总数',

    status         TINYINT  DEFAULT 0 COMMENT '可见状态：0-公共 1-私人',
    is_hidden      TINYINT  DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    allow_download TINYINT  DEFAULT 1 COMMENT '是否允许下载：0-禁止 1-允许',
    frozen_reason  VARCHAR(255) DEFAULT NULL COMMENT '隐藏/限制原因',
    frozen_at      DATETIME DEFAULT NULL COMMENT '操作时间',
    frozen_by      BIGINT   DEFAULT NULL COMMENT '执行操作的管理员id',

    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    updated_at     DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES video_category (id) ON DELETE SET NULL,
    FOREIGN KEY (frozen_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频主表';

-- 20. 视频点赞关联表
CREATE TABLE video_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    video_id   BIGINT   NOT NULL COMMENT '被点赞视频id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_video_user (video_id, user_id),
    FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频点赞关系表';

-- 21. 视频收藏关联表
CREATE TABLE video_favorite
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏记录主键',
    video_id   BIGINT   NOT NULL COMMENT '被收藏视频id',
    user_id    BIGINT   NOT NULL COMMENT '收藏用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_video_user (video_id, user_id),
    FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频收藏关系表';

-- 22. 视频评论表
CREATE TABLE video_comment
(
    id                 BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论id',
    video_id           BIGINT       NOT NULL COMMENT '所属视频id',
    user_id            BIGINT       NOT NULL COMMENT '评论用户id',
    parent_id          BIGINT   DEFAULT NULL COMMENT '上级评论id',
    root_id            BIGINT   DEFAULT NULL COMMENT '根评论id',
    depth              INT      DEFAULT 0 COMMENT '嵌套层级',
    reply_to_user_id   BIGINT   DEFAULT NULL COMMENT '具体回复的用户id',
    reply_to_nick_name VARCHAR(30) DEFAULT NULL COMMENT '被回复用户昵称快照',
    content            VARCHAR(800) NOT NULL COMMENT '评论内容',
    like_count         INT      DEFAULT 0 COMMENT '点赞数',
    is_hidden          TINYINT  DEFAULT 0 COMMENT '是否隐藏：0-正常 1-已隐藏',
    hidden_reason      VARCHAR(255) DEFAULT NULL COMMENT '隐藏原因',
    hidden_at          DATETIME DEFAULT NULL COMMENT '隐藏操作时间',
    hidden_by          BIGINT   DEFAULT NULL COMMENT '执行隐藏的管理员id',
    ip_address         VARCHAR(50) DEFAULT NULL COMMENT '评论时IP',
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (video_id) REFERENCES video (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES video_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (hidden_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_video_root (video_id, root_id),
    KEY idx_is_hidden (is_hidden)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频评论表';

-- 23. 视频评论点赞表
CREATE TABLE video_comment_like
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录主键',
    comment_id BIGINT   NOT NULL COMMENT '被点赞评论id',
    user_id    BIGINT   NOT NULL COMMENT '点赞用户id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES video_comment (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频评论点赞关系表';

-- ============================================================
-- 五、消息通知模块
-- ============================================================

-- 24. 站内通知表
CREATE TABLE notification
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知id',
    user_id     BIGINT       NOT NULL COMMENT '通知接收者id',
    sender_id   BIGINT       DEFAULT NULL COMMENT '触发通知的用户id',
    type        TINYINT      NOT NULL COMMENT '通知类型：0-点赞 1-评论 2-回复 3-关注 4-收藏 5-账号被冻结/解冻 6-内容被隐藏/恢复 7-举报处理结果 8-申诉处理结果',
    target_type TINYINT      DEFAULT NULL COMMENT '关联对象类型：0-文章 1-视频 2-文件 3-文章评论 4-视频评论 5-文件评论 6-用户 7-系统通知(纯系统)',
    target_id   BIGINT       DEFAULT NULL COMMENT '关联对象id',
    content     VARCHAR(255) DEFAULT NULL COMMENT '通知文案摘要',
    is_read     TINYINT      DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
    read_at     DATETIME     DEFAULT NULL COMMENT '已读时间',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '通知产生时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_user_read (user_id, is_read)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '站内消息通知表';

-- ============================================================
-- 六、举报与审核闭环
-- ============================================================

-- 25. 举报表
CREATE TABLE report
(
    id            BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '举报id',
    reporter_id   BIGINT       NOT NULL COMMENT '举报发起用户id',
    target_type   TINYINT      NOT NULL COMMENT '被举报对象类型：0-文章 1-视频 2-文件 3-文章评论 4-视频评论 5-文件评论 6-用户',
    target_id     BIGINT       NOT NULL COMMENT '被举报对象id',
    reason_type   TINYINT      NOT NULL COMMENT '举报原因：0-垃圾广告 1-色情低俗 2-侵权 3-人身攻击 4-违法违规 5-其他',
    reason_detail VARCHAR(500) DEFAULT NULL COMMENT '举报详细描述',
    status        TINYINT      DEFAULT 0 COMMENT '处理状态：0-待处理 1-已处理(属实) 2-已驳回(不成立)',
    handle_result VARCHAR(255) DEFAULT NULL COMMENT '处理结果说明',
    handled_by    BIGINT       DEFAULT NULL COMMENT '处理该举报的管理员id',
    handled_at    DATETIME     DEFAULT NULL COMMENT '处理时间',
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '举报提交时间',
    FOREIGN KEY (reporter_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_target (target_type, target_id),
    KEY idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户举报表';

-- 26. 内容审核操作日志
CREATE TABLE content_moderation_log
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志id',
    target_type TINYINT      NOT NULL COMMENT '对象类型：0-文章 1-视频 2-文件 3-文章评论 4-视频评论 5-文件评论',
    target_id   BIGINT       NOT NULL COMMENT '被操作对象id',
    admin_id    BIGINT       NOT NULL COMMENT '执行操作的管理员id',
    action      TINYINT      NOT NULL COMMENT '操作类型：0-隐藏 1-恢复 2-禁止下载 3-恢复下载',
    reason      VARCHAR(255) DEFAULT NULL COMMENT '操作原因',
    report_id   BIGINT       DEFAULT NULL COMMENT '若源于举报处理，关联report表id',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    FOREIGN KEY (admin_id) REFERENCES user (id) ON DELETE RESTRICT,
    FOREIGN KEY (report_id) REFERENCES report (id) ON DELETE SET NULL,
    KEY idx_target (target_type, target_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '内容审核审计日志';

-- 27. 申诉表
CREATE TABLE appeal
(
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '申诉id',
    user_id             BIGINT       NOT NULL COMMENT '申诉发起人id',
    target_type         TINYINT      NOT NULL COMMENT '被处罚对象类型：0-账号冻结 1-文章 2-视频 3-文件 4-文章评论 5-视频评论 6-文件评论',
    target_id           BIGINT       NOT NULL COMMENT '被处罚对象id',
    freeze_log_id       BIGINT       DEFAULT NULL COMMENT '关联冻结日志id（target_type=0时必填）',
    moderation_log_id   BIGINT       DEFAULT NULL COMMENT '关联审核日志id（target_type=1~6时必填）',
    reason              VARCHAR(500) NOT NULL COMMENT '申诉理由',
    status              TINYINT      DEFAULT 0 COMMENT '处理状态：0-待处理 1-申诉通过 2-申诉驳回',
    handle_result       VARCHAR(255) DEFAULT NULL COMMENT '处理说明',
    handled_by          BIGINT       DEFAULT NULL COMMENT '处理该申诉的管理员id',
    handled_at          DATETIME     DEFAULT NULL COMMENT '处理时间',
    created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '申诉提交时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    FOREIGN KEY (freeze_log_id) REFERENCES user_freeze_log (id) ON DELETE SET NULL,
    FOREIGN KEY (moderation_log_id) REFERENCES content_moderation_log (id) ON DELETE SET NULL,
    FOREIGN KEY (handled_by) REFERENCES user (id) ON DELETE SET NULL,
    KEY idx_user_id (user_id),
    KEY idx_target (target_type, target_id),
    KEY idx_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '申诉表';

-- ============================================================
-- 七、静态素材与私信模块
-- ============================================================

-- 28. 静态素材上传审计表
CREATE TABLE asset_upload_log
(
    id         BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录id',
    user_id    BIGINT       NOT NULL COMMENT '上传者用户id',
    url        VARCHAR(500) NOT NULL COMMENT '上传后生成的CDN直链',
    scene      VARCHAR(30)  DEFAULT NULL COMMENT '上传场景：avatar/article_cover/video_cover/category_cover',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    KEY idx_user_id (user_id),
    KEY idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '静态素材上传审计表';

-- 29. 私信消息表
CREATE TABLE private_message
(
    id           BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息id',
    sender_id    BIGINT        NOT NULL COMMENT '发送者用户id',
    receiver_id  BIGINT        NOT NULL COMMENT '接收者用户id',
    content      VARCHAR(2000) NOT NULL COMMENT '消息内容',
    is_read      TINYINT       DEFAULT 0 COMMENT '是否已读：0-未读 1-已读',
    read_at      DATETIME      DEFAULT NULL COMMENT '已读时间',
    created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    FOREIGN KEY (sender_id) REFERENCES user (id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES user (id) ON DELETE RESTRICT,
    KEY idx_sender_receiver (sender_id, receiver_id),
    KEY idx_receiver_read (receiver_id, is_read),
    KEY idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '私信消息表';

-- 30. 系统配置表
CREATE TABLE system_config
(
    id                 TINYINT PRIMARY KEY DEFAULT 1 COMMENT '固定为1',
    site_name          VARCHAR(100) NOT NULL DEFAULT '匿名博客' COMMENT '站点名称',
    allow_register     TINYINT      DEFAULT 1 COMMENT '是否开放注册：0-关闭 1-开放',
    max_upload_size_mb INT          DEFAULT 100 COMMENT '单文件上传大小上限(MB)',
    comment_max_length INT          DEFAULT 800 COMMENT '评论最大长度',
    updated_by         BIGINT       DEFAULT NULL COMMENT '最后修改配置的管理员id',
    updated_at         DATETIME     DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
    FOREIGN KEY (updated_by) REFERENCES user (id) ON DELETE SET NULL,
    CONSTRAINT chk_single_row CHECK (id = 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '系统全局配置表';

INSERT INTO system_config (id) VALUES (1);

SET FOREIGN_KEY_CHECKS = 1;