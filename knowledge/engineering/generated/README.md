# 自动代码知识图谱

## 目录用途
保存由代码扫描生成的机器事实，帮助人员和 Agent 快速定位模块与依赖。
## 内容索引
`code-map.md` 面向阅读，`dependency-map.mmd` 用于可视化，`code-map.json` 供工具消费。
## 使用入口
运行 `pnpm knowledge:generate` 更新，运行 `pnpm knowledge:check` 校验。
## 上下游关系
输入是当前受管工程源码；输出供研发、测试和发布检查使用。
## 维护规则
本 README 人工维护；其余文件均由脚本生成，禁止手工修改。
## 当前状态
随工作空间重构基线首次生成。
## 相关链接
[生成工具](../../../scripts/knowledge/README.md) · [人工架构](../architecture/README.md)
