# 我们的小宇宙

一个基于 Next.js 16 与 Cloudflare Workers 的情侣纪念网站。它不是博客，也不是 SaaS 后台，而是一个半公开的私人纪念馆：公开展示故事、照片墙、时间线、纪念日和情书，后台负责上传与编辑内容。

## 技术栈

- **Next.js 16 App Router** + React 19
- **Tailwind CSS 4** + shadcn/ui 基础组件
- **Cloudflare Workers** + OpenNext
- **Cloudflare D1** + Drizzle ORM
- **Cloudflare R2** 存储照片与附件
- **Better Auth** 邮箱密码登录，仅用于后台入口

## 页面

- `/` 首页：Hero、恋爱天数、精选照片、最近时间线、情书入口
- `/story` 我们的故事
- `/photos` 公开照片墙
- `/timeline` 公开时间线
- `/anniversaries` 纪念日
- `/letters` 公开留言 / 情书
- `/admin` 后台编辑入口，登录后可上传与编辑
- `/private` 私密内容展示，登录后可见

## Cloudflare 资源

Wrangler 使用统一资源名：

- Worker: `ourdays`
- D1: `ourdays`
- R2: `ourdays`

生产环境建议在 Cloudflare 中配置：

```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://cdn.your-domain.com
```

`NEXT_PUBLIC_MEDIA_BASE_URL` 可绑定到 R2 自定义域名；本地为空时会通过 `/media/[...key]` 代理读取 R2。

## 开发命令

```bash
pnpm dev
pnpm check
pnpm db:generate
pnpm db:migrate:local
pnpm cf-typegen
pnpm deploy
```

## 数据表

- `photos`：照片元数据与 R2 key
- `letters`：公开留言与私密情书
- `timeline_events`：时间线事件
- `anniversaries`：纪念日和倒计时
- `settings`：站点标题、情侣名、Hero 文案、恋爱开始日期等
