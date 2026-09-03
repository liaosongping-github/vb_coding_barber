import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "../..");
const productVersion = "v0.2";
const sourceRelative = `workspace/product/${productVersion}/prototype`;
const sourceRoot = path.join(root, sourceRelative);
const outputRoot = path.join(root, "knowledge/engineering/generated");
const checkOnly = process.argv.includes("--check");
const codeExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".json"]);
const ignored = new Set(["node_modules", "dist", ".next", ".vinext", ".wrangler", "outputs"]);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (codeExtensions.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function git(args, fallback = "unknown") {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || fallback;
  } catch {
    return fallback;
  }
}

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalize(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function classify(relative) {
  if (relative.includes("/tests/")) return "test";
  if (relative.includes("/examples/")) return "example";
  if (relative.includes("/app/")) return "application";
  if (relative.includes("/db/") || relative.includes("/drizzle/")) return "data";
  if (relative.includes("/worker/") || relative.includes("/build/")) return "runtime";
  return "configuration";
}

const files = await walk(sourceRoot);
const modules = [];
const imports = [];
const routes = [];
const types = [];
const tests = [];
let treeMaterial = "";

for (const absolute of files) {
  const relative = normalize(absolute);
  const content = await fs.readFile(absolute, "utf8");
  treeMaterial += `${relative}\0${content}\0`;
  modules.push({
    path: relative,
    kind: classify(relative),
    lines: content.split(/\r?\n/).length,
    sha256: sha(content),
  });
  if (/\/tests\/.*\.test\.mjs$/.test(relative)) tests.push(relative);
  if (/\/app\/(?:.*\/)?page\.tsx$/.test(relative)) {
    const route = relative.replace(/^.*\/app/, "").replace(/\/page\.tsx$/, "") || "/";
    routes.push({ route, file: relative, kind: "page" });
  }
  if (/\/app\/(?:.*\/)?route\.ts$/.test(relative)) {
    const route = relative.replace(/^.*\/app/, "").replace(/\/route\.ts$/, "") || "/";
    routes.push({ route, file: relative, kind: "api" });
  }
  for (const match of content.matchAll(/(?:import|export)\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g)) {
    imports.push({ from: relative, to: match[1] });
  }
  for (const match of content.matchAll(/\b(?:type|interface|class|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    types.push({ name: match[1], file: relative });
  }
}

modules.sort((a, b) => a.path.localeCompare(b.path));
imports.sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`));
routes.sort((a, b) => `${a.route}:${a.file}`.localeCompare(`${b.route}:${b.file}`));
types.sort((a, b) => `${a.name}:${a.file}`.localeCompare(`${b.name}:${b.file}`));
tests.sort();

const sourceCommit = git(["log", "-1", "--format=%H", "--", sourceRelative] , git(["rev-parse", "HEAD"]));
const sourceCommitDate = sourceCommit === "unknown" ? "unknown" : git(["show", "-s", "--format=%cI", sourceCommit]);
const payload = {
  schema_version: 1,
  product_version: productVersion,
  generated_from: {
    source_commit: sourceCommit,
    source_commit_date: sourceCommitDate,
    source_tree_sha256: sha(treeMaterial),
  },
  summary: {
    modules: modules.length,
    routes: routes.length,
    types: types.length,
    imports: imports.length,
    tests: tests.length,
  },
  modules,
  routes,
  types,
  imports,
  tests,
};
const graphChecksum = sha(JSON.stringify(payload));
const graph = { ...payload, graph_sha256: graphChecksum };
const json = `${JSON.stringify(graph, null, 2)}\n`;

const markdown = `# ${productVersion} 自动代码图谱\n\n` +
  `> 来源提交：\`${sourceCommit}\`\n> 来源时间：${sourceCommitDate}\n> 代码树校验：\`${payload.generated_from.source_tree_sha256}\`\n> 图谱校验：\`${graphChecksum}\`\n\n` +
  `## 摘要\n\n| 模块 | 路由 | 类型 | 依赖 | 测试 |\n|---:|---:|---:|---:|---:|\n| ${modules.length} | ${routes.length} | ${types.length} | ${imports.length} | ${tests.length} |\n\n` +
  `## 路由\n\n${routes.length ? routes.map((item) => `- \`${item.route}\`（${item.kind}）：\`${item.file}\``).join("\n") : "- 无"}\n\n` +
  `## 代码模块\n\n${modules.map((item) => `- \`${item.path}\` · ${item.kind} · ${item.lines} 行`).join("\n")}\n\n` +
  `## 类型\n\n${types.length ? types.map((item) => `- \`${item.name}\`：\`${item.file}\``).join("\n") : "- 无"}\n\n` +
  `## 自动化测试\n\n${tests.length ? tests.map((item) => `- \`${item}\``).join("\n") : "- 无"}\n`;

const nodes = new Map(modules.map((item, index) => [item.path, `N${index}`]));
const mermaidLines = ["flowchart LR"];
for (const [file, id] of nodes) mermaidLines.push(`  ${id}["${file.replaceAll('"', "'")}"]`);
for (const edge of imports.filter((item) => item.to.startsWith("."))) {
  const sourceId = nodes.get(edge.from);
  if (sourceId) mermaidLines.push(`  ${sourceId} -. "${edge.to.replaceAll('"', "'")}" .-> EXT["相对依赖"]`);
}
const mermaid = `${mermaidLines.join("\n")}\n`;

const outputs = new Map([
  [path.join(outputRoot, "code-map.json"), json],
  [path.join(outputRoot, "code-map.md"), markdown],
  [path.join(outputRoot, "dependency-map.mmd"), mermaid],
]);

await fs.mkdir(outputRoot, { recursive: true });
let changed = false;
for (const [file, content] of outputs) {
  const current = await fs.readFile(file, "utf8").catch(() => null);
  if (current !== content) {
    changed = true;
    if (!checkOnly) await fs.writeFile(file, content, "utf8");
  }
}

if (checkOnly && changed) {
  console.error("代码知识图谱不是最新状态，请运行 pnpm knowledge:generate。");
  process.exit(1);
}
console.log(checkOnly ? "代码知识图谱已同步。" : `代码知识图谱已生成：${graphChecksum}`);
