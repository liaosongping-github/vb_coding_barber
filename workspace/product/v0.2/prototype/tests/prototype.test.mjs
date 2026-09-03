import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const prototypeRoot = new URL("../", import.meta.url);

test("v0.2 源码包含三端和关键已定稿交互", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  for (const expected of [
    "邻剪",
    "PROTOTYPE v0.2",
    "用户端",
    "理发师端",
    "管理端",
    "立即取号",
    "我的排队",
    "数据看板",
    "确认顺延",
  ]) assert.match(page, new RegExp(expected), `缺少关键原型内容：${expected}`);
});

test("v0.2 用户端只保留首页和我的排队", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  assert.match(page, /const labels = \["首页", "排队"\]/);
  assert.match(page, /setUserTab\("排队"\)/);
  assert.doesNotMatch(page, /tab === "收藏"/);
  assert.doesNotMatch(page, /<UserProfile/);
});

test("v0.2 用户端不包含地图收藏和距离能力", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  for (const removed of [
    "MiniMap", "地图导航", "新增地图定位地址", "按距离排序",
    "我的收藏", "UserProfile", "Favorites", "distance:",
  ]) assert.doesNotMatch(page, new RegExp(removed), `仍包含已移除能力：${removed}`);
  assert.match(page, /文字服务地址/);
});

test("v0.2 理发师使用文字服务地址开店", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  assert.match(page, /选择文字服务地址/);
  assert.match(page, /新增文字地址/);
  assert.match(page, /请输入摊位或门店地址/);
  assert.doesNotMatch(page, /地图定位/);
  assert.doesNotMatch(page, /320m|1\.1km/);
});

test("v0.2 排队空状态保持简洁", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  assert.match(page, /queueTab === "进行中" \? "无排队"/);
  assert.doesNotMatch(page, /同时排了多个理发师/);
  assert.doesNotMatch(page, /还没有进行中的号码|查看营业状态/);
});

test("v0.2 用户首页显示登录昵称和附近理发师", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  assert.match(page, /const loggedInNickname = "小林"/);
  assert.match(page, /<div className="mini-header"><h2>{loggedInNickname}<\/h2><\/div>/);
  assert.match(page, /<div className="section-title"><h3>附近的理发师<\/h3><\/div>/);
  assert.doesNotMatch(page, /<p className="eyebrow">今日营业与排队<\/p>/);
  assert.doesNotMatch(page, /<h3>常去的理发师<\/h3><span>实时更新<\/span>/);
});

test("v0.2 确认取号后进入我的排队进行中", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  const joinQueue = page.slice(page.indexOf("const joinQueue"), page.indexOf("const finish"));
  assert.match(joinQueue, /setDetail\(null\)/);
  assert.match(joinQueue, /setUserTab\("排队"\)/);
  assert.ok(joinQueue.indexOf("setDetail(null)") < joinQueue.indexOf('setUserTab("排队")'));
  assert.match(page, /useState<"进行中" \| "已过号" \| "已完成">\("进行中"\)/);
});

test("v0.2 理发师工作台隐藏地址并标记下一位", async () => {
  const page = await readFile(new URL("app/page.tsx", prototypeRoot), "utf8");
  const dashboard = page.slice(page.indexOf("function BarberDashboard"), page.indexOf("function Records"));
  assert.match(page, /verify: "下一位"/);
  assert.doesNotMatch(dashboard, /<div className="location-banner">/);
  assert.doesNotMatch(dashboard, /<small>本次营业地址<\/small>/);
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
