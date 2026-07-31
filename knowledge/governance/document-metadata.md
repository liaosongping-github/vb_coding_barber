---
title: 正式文档元数据规范
owner_role: cross-functional
status: finalized
applies_to: workspace-v0.1+
last_verified_at: 2026-08-01
related: scripts/knowledge/check-workspace.mjs
---

# 文档元数据

除 README 和自动生成文档外，知识库及角色交付区中的正式 Markdown 必须以以下字段开头：

```yaml
---
title: 文档标题
owner_role: product | engineering | testing | cross-functional
status: draft | reviewed | finalized | deprecated | accepted | proposed | superseded
applies_to: 适用版本
last_verified_at: YYYY-MM-DD
related: 仓库相对路径
---
```

`last_verified_at` 表示最后一次与权威交付物核对的日期，不等同于普通编辑时间。

