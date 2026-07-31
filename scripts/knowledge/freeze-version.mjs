import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const version = process.argv[2];
if (!version || !/^v\d+\.\d+$/.test(version)) {
  console.error("用法：node scripts/knowledge/freeze-version.mjs v0.1");
  process.exit(1);
}
const versionRoot = path.join(root, "workspace/product", version);
const manifestFile = path.join(versionRoot, "FROZEN.json");
if (await fs.stat(manifestFile).then(() => true).catch(() => false)) {
  console.error(`${version} 已存在冻结清单，拒绝覆盖。`);
  process.exit(1);
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (["node_modules", "dist", ".next", ".vinext", ".wrangler"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.name !== "FROZEN.json") files.push(absolute);
  }
  return files;
}

const files = await walk(versionRoot);
const entries = [];
for (const file of files) {
  const content = await fs.readFile(file);
  entries.push({
    path: path.relative(versionRoot, file).split(path.sep).join("/"),
    sha256: createHash("sha256").update(content).digest("hex"),
  });
}
const tree = entries.map((item) => `${item.path}\0${item.sha256}`).join("\0");
const manifest = {
  schema_version: 1,
  product_version: version,
  frozen_at: new Date().toISOString(),
  tree_sha256: createHash("sha256").update(tree).digest("hex"),
  files: entries,
};
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`${version} 已冻结：${manifest.tree_sha256}`);

