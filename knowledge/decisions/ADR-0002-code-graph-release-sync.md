---
title: ADR-0002 代码图谱与发布同步
owner_role: engineering
status: accepted
applies_to: workspace-v0.1+
last_verified_at: 2026-08-01
related: scripts/knowledge/generate-code-graph.mjs
---

# ADR-0002：发布前生成，发布后绑定

## 背景
仅在发布后生成图谱会产生上下文空窗，定时扫描也不能证明对应哪个线上版本。
## 选择
候选版本发布前从代码生成并校验图谱，部署成功后在发布记录中绑定线上提交、地址和图谱校验值。
## 影响
发布未完成知识图谱校验和线上绑定时，不视为完成。

