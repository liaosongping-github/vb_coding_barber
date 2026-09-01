import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ignored = new Set([".git", ".superpowers", "node_modules", "dist", "outputs", ".pnpm-store", ".wrangler", ".vinext", ".next"]);
const readmeHeadings = ["## 目录用途", "## 内容索引", "## 使用入口", "## 上下游关系", "## 维护规则", "## 当前状态", "## 相关链接"];
const errors = [];

async function walkDirectories(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const directories = [directory];
  for (const entry of entries) {
    if (!entry.isDirectory() || ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    directories.push(...await walkDirectories(absolute));
  }
  return directories;
}

async function walkMarkdown(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkMarkdown(absolute));
    else if (entry.name.endsWith(".md")) files.push(absolute);
  }
  return files;
}

const directories = await walkDirectories(root);
for (const directory of directories) {
  const relative = path.relative(root, directory).split(path.sep).join("/") || ".";
  if (relative.startsWith("knowledge/engineering/generated/") || relative.startsWith(".openai/")) continue;
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const managed = relative === "." || entries.some((entry) => !ignored.has(entry.name));
  if (!managed) continue;
  const readme = path.join(directory, "README.md");
  const content = await fs.readFile(readme, "utf8").catch(() => null);
  if (content === null) {
    errors.push(`${relative}: 缺少 README.md`);
    continue;
  }
  for (const heading of readmeHeadings) {
    if (!content.includes(heading)) errors.push(`${relative}/README.md: 缺少章节“${heading}”`);
  }
}

const markdownFiles = await walkMarkdown(root);
for (const file of markdownFiles) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const content = await fs.readFile(file, "utf8");
  const isFormal = !file.endsWith("README.md") && !file.endsWith("AGENTS.md") && !relative.startsWith("knowledge/engineering/generated/");
  if (isFormal) {
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) errors.push(`${relative}: 缺少正式文档元数据`);
    else {
      for (const field of ["title", "owner_role", "status", "applies_to", "last_verified_at", "related"]) {
        if (!new RegExp(`^${field}:\\s*.+$`, "m").test(frontmatter[1])) errors.push(`${relative}: 元数据缺少 ${field}`);
      }
    }
  }
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0].trim();
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
    const absoluteTarget = path.resolve(path.dirname(file), decodeURI(target));
    if (!await fs.stat(absoluteTarget).then(() => true).catch(() => false)) errors.push(`${relative}: 链接不存在 ${target}`);
  }
}

const frozenFile = path.join(root, "workspace/product/v0.1/FROZEN.json");
if (await fs.stat(frozenFile).then(() => true).catch(() => false)) {
  const manifest = JSON.parse(await fs.readFile(frozenFile, "utf8"));
  const versionRoot = path.dirname(frozenFile);
  const actual = [];
  for (const item of manifest.files) {
    const file = path.join(versionRoot, item.path);
    const content = await fs.readFile(file).catch(() => null);
    if (content === null) errors.push(`冻结文件缺失：${item.path}`);
    else actual.push({ path: item.path, sha256: createHash("sha256").update(content).digest("hex") });
  }
  const expectedFiles = new Set(manifest.files.map((item) => item.path));
  async function currentFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
      if (["node_modules", "dist", ".next", ".vinext", ".wrangler"].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) result.push(...await currentFiles(absolute));
      else if (entry.name !== "FROZEN.json") result.push(path.relative(versionRoot, absolute).split(path.sep).join("/"));
    }
    return result;
  }
  for (const item of await currentFiles(versionRoot)) if (!expectedFiles.has(item)) errors.push(`冻结版本出现新增文件：${item}`);
  const tree = actual.map((item) => `${item.path}\0${item.sha256}`).join("\0");
  const hash = createHash("sha256").update(tree).digest("hex");
  if (hash !== manifest.tree_sha256) errors.push("v0.1 冻结清单校验失败，禁止直接修改冻结版本");
}

const graphCheck = spawnSync(process.execPath, [path.join(root, "scripts/knowledge/generate-code-graph.mjs"), "--check"], { cwd: root, encoding: "utf8" });
if (graphCheck.status !== 0) errors.push(graphCheck.stderr.trim() || "代码知识图谱检查失败");

if (errors.length) {
  console.error(`工作空间检查失败（${errors.length} 项）：\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`工作空间检查通过：${directories.length} 个目录，${markdownFiles.length} 份 Markdown。`);
