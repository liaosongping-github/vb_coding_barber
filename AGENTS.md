# 邻剪平台 Agent 工作约定

## 接手顺序

1. 阅读根目录 `README.md` 和 `knowledge/README.md`。
2. 阅读 `knowledge/releases/v0.1.md`，确认当前线上版本与提交。
3. 阅读 `knowledge/business/` 下与任务相关的业务规则。
4. 阅读 `knowledge/engineering/` 下的架构和自动代码图谱。
5. 进入目标角色目录并阅读局部 `AGENTS.md` 与 `README.md`。

## 全局约束

- 仓库内文档是唯一权威来源；不依赖对话记忆补全关键事实。
- `workspace/product/v0.1/` 是冻结交付物，未经新版本流程不得修改。
- 不修改 `knowledge/engineering/generated/`；使用 `pnpm knowledge:generate` 更新。
- 所有人工维护且纳入 Git 的目录必须存在符合模板的 `README.md`。
- 新增或改变业务规则时同步更新业务知识、PRD、验收标准和测试用例。
- 新增或改变架构、接口、数据模型时同步更新工程知识和 ADR。
- 不提交密钥、依赖、缓存、构建产物、本地日志或临时文件。

## 完成定义

- 实现与对应业务规则一致。
- 相关 README、正式文档、决策和测试已更新。
- `pnpm release:check` 通过。
- 发布后更新 `knowledge/releases/` 中的版本绑定记录。

## 冲突处理

权威顺序为：当前定稿版本交付物 → 已接受 ADR → 业务规则 → 自动代码图谱 → 其他说明。发现冲突时不得自行猜测，先记录冲突并请求产品决策。
