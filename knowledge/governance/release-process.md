---
title: 发布与知识同步流程
owner_role: cross-functional
status: finalized
applies_to: workspace-v0.1+
last_verified_at: 2026-08-01
related: knowledge/releases/README.md
---

# 发布流程

1. 产品交付物达到 finalized，研发实现与测试用例已关联相同版本。
2. 运行 `pnpm knowledge:generate` 生成候选版本图谱。
3. 运行 `pnpm release:check` 校验 README、文档、冻结清单、图谱、构建和测试。
4. 创建发布提交和版本标签，部署该精确提交。
5. 部署成功后运行 `pnpm release:bind -- --version <版本> --commit <提交> --url <地址> --deployed-at <ISO时间>`。
6. 提交发布绑定记录；该知识提交不得包含运行时代码变化。

发布绑定缺失、图谱不一致或测试失败时，版本不能标记为完成。
