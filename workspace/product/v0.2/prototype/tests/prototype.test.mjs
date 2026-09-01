import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const prototypeRoot = new URL("../", import.meta.url);

test("v0.1 源码包含三端和关键已定稿交互", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  for (const expected of [
    "邻剪",
    "PROTOTYPE v0.1",
    "用户端",
    "理发师端",
    "管理端",
    "立即取号",
    "我的排队",
    "数据看板",
    "确认顺延",
  ]) assert.match(page, new RegExp(expected), `缺少关键原型内容：${expected}`);
});

test("生产构建生成可部署 Worker 入口", async () => {
  await access(new URL("dist/server/index.js", prototypeRoot));
  await access(new URL("dist/.openai/hosting.json", prototypeRoot));
});

test("构建后的 Worker 能响应首页", async () => {
  const workerUrl = new URL("dist/server/index.js", prototypeRoot);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
});

