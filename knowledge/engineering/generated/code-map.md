# v0.2 自动代码图谱

> 来源提交：`fe7585f6969501938ec1c4887975522a64a54168`
> 来源时间：2026-09-03T21:59:43+08:00
> 代码树校验：`defdb8fb9553fe9c4c0dcce03f474121e30f1a0f8ab22e661b82339e4e6dad7e`
> 图谱校验：`46d75efc5c754446f803469ddc8c7ebab9b5b25c7582a836aeaa0cab3246e5c6`

## 摘要

| 模块 | 路由 | 类型 | 依赖 | 测试 |
|---:|---:|---:|---:|---:|
| 20 | 2 | 5 | 32 | 1 |

## 路由

- `/`（page）：`workspace/product/v0.2/prototype/app/page.tsx`
- `/api/notes`（api）：`workspace/product/v0.2/prototype/examples/d1/app/api/notes/route.ts`

## 代码模块

- `workspace/product/v0.2/prototype/.openai/hosting.json` · configuration · 7 行
- `workspace/product/v0.2/prototype/app/chatgpt-auth.ts` · application · 87 行
- `workspace/product/v0.2/prototype/app/globals.css` · application · 18 行
- `workspace/product/v0.2/prototype/app/layout.tsx` · application · 28 行
- `workspace/product/v0.2/prototype/app/page.tsx` · application · 427 行
- `workspace/product/v0.2/prototype/build/sites-vite-plugin.ts` · runtime · 46 行
- `workspace/product/v0.2/prototype/db/index.ts` · data · 14 行
- `workspace/product/v0.2/prototype/db/schema.ts` · data · 5 行
- `workspace/product/v0.2/prototype/drizzle.config.ts` · configuration · 8 行
- `workspace/product/v0.2/prototype/drizzle/meta/_journal.json` · data · 6 行
- `workspace/product/v0.2/prototype/eslint.config.mjs` · configuration · 19 行
- `workspace/product/v0.2/prototype/examples/d1/app/api/notes/route.ts` · example · 59 行
- `workspace/product/v0.2/prototype/examples/d1/db/schema.ts` · example · 10 行
- `workspace/product/v0.2/prototype/next.config.ts` · configuration · 8 行
- `workspace/product/v0.2/prototype/package.json` · configuration · 42 行
- `workspace/product/v0.2/prototype/postcss.config.mjs` · configuration · 8 行
- `workspace/product/v0.2/prototype/tests/prototype.test.mjs` · test · 132 行
- `workspace/product/v0.2/prototype/tsconfig.json` · configuration · 35 行
- `workspace/product/v0.2/prototype/vite.config.ts` · configuration · 60 行
- `workspace/product/v0.2/prototype/worker/index.ts` · runtime · 48 行

## 类型

- `ChatGPTUser`：`workspace/product/v0.2/prototype/app/chatgpt-auth.ts`
- `Env`：`workspace/product/v0.2/prototype/worker/index.ts`
- `ExecutionContext`：`workspace/product/v0.2/prototype/worker/index.ts`
- `Ticket`：`workspace/product/v0.2/prototype/app/page.tsx`
- `TicketStatus`：`workspace/product/v0.2/prototype/app/page.tsx`

## 自动化测试

- `workspace/product/v0.2/prototype/tests/prototype.test.mjs`
