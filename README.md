# 邻剪平台工作空间

> 当前线上版本：`v0.1`  
> 当前研发版本：尚未启动  
> 线上原型：https://linjian-barber-queue.gg331480046.chatgpt.site

## 目录用途

本仓库是邻剪平台的唯一权威工作空间，同时保存平台知识和各角色交付物，确保人员或 Agent 切换后可以继续工作。

## 内容索引

- [`knowledge/`](knowledge/README.md)：战略、业务规则、工程知识、决策和发布记录。
- [`workspace/product/`](workspace/product/README.md)：需求、PRD、验收标准和冻结原型。
- [`workspace/engineering/`](workspace/engineering/README.md)：后续生产工程及研发交付物。
- [`workspace/testing/`](workspace/testing/README.md)：测试用例和自动化测试。
- [`scripts/`](scripts/README.md)：知识图谱和工作空间治理工具。

## 使用入口

人员先阅读本文件，再进入对应角色目录。Agent 必须先阅读 [`AGENTS.md`](AGENTS.md)，再读取目标目录下的局部 `AGENTS.md`。

常用命令：

```bash
pnpm install
pnpm prototype:dev
pnpm build
pnpm test
pnpm knowledge:generate
pnpm knowledge:check
pnpm release:check
```

## 上下游关系

工作流固定为：产品定稿 → 研发实现 → 测试验证 → 验收发布。知识库接收各阶段已确认事实，并为下一阶段提供上下文。

## 维护规则

- 仓库内 Markdown 是唯一权威知识源。
- 定稿版本不可覆盖；变更必须建立新版本并记录决策。
- 发布前必须通过构建、测试、README 检查和知识图谱一致性检查。
- 自动生成目录中的文件禁止手工修改。

## 当前状态

`v0.1` 已定稿并在线运行；正式生产工程尚未选型或启动。

## 相关链接

- [业务知识库](knowledge/business/README.md)
- [v0.1 产品交付](workspace/product/v0.1/README.md)
- [当前发布记录](knowledge/releases/v0.1.md)
- [文档治理规范](knowledge/governance/README.md)
