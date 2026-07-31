import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const version = args.get("--version");
const commit = args.get("--commit");
const url = args.get("--url");
const deployedAt = args.get("--deployed-at");
const workspaceTag = args.get("--workspace-tag") ?? `workspace-${version}`;
if (!version || !commit || !url || !deployedAt) {
  console.error("用法：pnpm release:bind -- --version v0.1 --commit <sha> --url <url> --deployed-at <ISO时间>");
  process.exit(1);
}
new URL(url);
const graph = JSON.parse(await fs.readFile(path.join(root, "knowledge/engineering/generated/code-map.json"), "utf8"));
const releaseFile = path.join(root, "knowledge/releases", `${version}.md`);
const current = await fs.readFile(releaseFile, "utf8");
const start = "<!-- release-binding:start -->";
const end = "<!-- release-binding:end -->";
if (!current.includes(start) || !current.includes(end)) throw new Error("发布记录缺少绑定标记");
const block = `${start}\n- 产品版本：${version}\n- 原始定稿标签：\`${version}\`\n- 工作空间基线标签：\`${workspaceTag}\`\n- 部署提交：\`${commit}\`\n- 图谱来源提交：\`${graph.generated_from.source_commit}\`\n- 图谱代码树校验：\`${graph.generated_from.source_tree_sha256}\`\n- 图谱校验值：\`${graph.graph_sha256}\`\n- 线上地址：${url}\n- 发布状态：已部署并完成知识绑定\n- 发布时间：${deployedAt}\n${end}`;
const updated = current.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
await fs.writeFile(releaseFile, updated, "utf8");
console.log(`${version} 已绑定到 ${commit}`);
