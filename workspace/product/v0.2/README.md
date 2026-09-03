# 产品交付 v0.2

## 目录用途
保存邻剪试运行 MVP 的定稿产品交付基线。
## 内容索引
`PRD.md` 描述试运行 MVP 范围；`acceptance-criteria.md` 描述验收；`prototype/` 是可运行原型源码。
## 使用入口
先读 PRD 和验收标准，再在仓库根目录运行 `pnpm prototype:dev`。
## 上下游关系
输入为 ADR-0004 与 v0.1 队列闭环；输出供后续 UI、测试和代码图谱任务使用。
## 维护规则
本目录已定稿，生成冻结清单后禁止直接修改；不得修改 `../v0.1/` 冻结交付物。
## 当前状态
试运行 MVP 已定稿。用户端仅保留首页和我的排队，地图、收藏和用户个人页均不进入本版本。
## 相关链接
[ADR-0004](../../../knowledge/decisions/ADR-0004-v0.2试运行MVP范围.md) · [业务规则](../../../knowledge/business/business-rules.md) · [v0.1 发布记录](../../../knowledge/releases/v0.1.md)
