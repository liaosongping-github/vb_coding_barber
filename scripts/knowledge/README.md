# 知识与发布治理脚本

## 目录用途
确保知识库、代码图谱和线上版本保持一致。
## 内容索引
- `generate-code-graph.mjs`：生成代码图谱。
- `check-workspace.mjs`：检查 README、文档、链接、图谱和冻结清单。
- `freeze-version.mjs`：首次冻结产品版本。
- `bind-release.mjs`：部署成功后写入版本绑定。
## 使用入口
从仓库根目录通过 npm scripts 运行。
## 上下游关系
输入来自知识库和工作区，输出用于发布门禁。
## 维护规则
修改检查规则时同步治理文档并增加测试；生成内容禁止人工编辑。
## 当前状态
首期实现覆盖当前单仓工作流。
## 相关链接
[发布流程](../../knowledge/governance/release-process.md)

