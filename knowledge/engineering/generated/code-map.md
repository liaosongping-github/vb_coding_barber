# v0.1 自动代码图谱

> 来源提交：`45435057224c36a464199357d4d00f2d4ec0f370`  
> 来源时间：2026-07-31T22:32:28+08:00  
> 代码树校验：`914f4ca7612202a6d32a66f355096ec78fb17128cd7d2d854e1288c745503dbf`  
> 图谱校验：`ac8545ef0b26fd247526ff9108588b40b5308e71ef7ffb740e5961db7fde7917`

## 摘要

| 模块 | 路由 | 类型 | 依赖 | 测试 |
|---:|---:|---:|---:|---:|
| 21 | 2 | 5 | 33 | 1 |

## 路由

- `/`（page）：`workspace/product/v0.1/prototype/app/page.tsx`
- `/api/notes`（api）：`workspace/product/v0.1/prototype/examples/d1/app/api/notes/route.ts`

## 代码模块

- `workspace/product/v0.1/prototype/.openai/hosting.json` · configuration · 7 行
- `workspace/product/v0.1/prototype/app/chatgpt-auth.ts` · application · 87 行
- `workspace/product/v0.1/prototype/app/globals.css` · application · 16 行
- `workspace/product/v0.1/prototype/app/layout.tsx` · application · 29 行
- `workspace/product/v0.1/prototype/app/map-overrides.css` · application · 150 行
- `workspace/product/v0.1/prototype/app/page.tsx` · application · 435 行
- `workspace/product/v0.1/prototype/build/sites-vite-plugin.ts` · runtime · 46 行
- `workspace/product/v0.1/prototype/db/index.ts` · data · 14 行
- `workspace/product/v0.1/prototype/db/schema.ts` · data · 5 行
- `workspace/product/v0.1/prototype/drizzle.config.ts` · configuration · 8 行
- `workspace/product/v0.1/prototype/drizzle/meta/_journal.json` · data · 6 行
- `workspace/product/v0.1/prototype/eslint.config.mjs` · configuration · 19 行
- `workspace/product/v0.1/prototype/examples/d1/app/api/notes/route.ts` · example · 59 行
- `workspace/product/v0.1/prototype/examples/d1/db/schema.ts` · example · 10 行
- `workspace/product/v0.1/prototype/next.config.ts` · configuration · 8 行
- `workspace/product/v0.1/prototype/package.json` · configuration · 42 行
- `workspace/product/v0.1/prototype/postcss.config.mjs` · configuration · 8 行
- `workspace/product/v0.1/prototype/tests/prototype.test.mjs` · test · 40 行
- `workspace/product/v0.1/prototype/tsconfig.json` · configuration · 35 行
- `workspace/product/v0.1/prototype/vite.config.ts` · configuration · 60 行
- `workspace/product/v0.1/prototype/worker/index.ts` · runtime · 48 行

## 类型

- `ChatGPTUser`：`workspace/product/v0.1/prototype/app/chatgpt-auth.ts`
- `Env`：`workspace/product/v0.1/prototype/worker/index.ts`
- `ExecutionContext`：`workspace/product/v0.1/prototype/worker/index.ts`
- `Ticket`：`workspace/product/v0.1/prototype/app/page.tsx`
- `TicketStatus`：`workspace/product/v0.1/prototype/app/page.tsx`

## 自动化测试

- `workspace/product/v0.1/prototype/tests/prototype.test.mjs`
