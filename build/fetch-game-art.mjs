// 抓游戏封面：英文维基 pageimages 批量主图（50 题/次）→ art-games/<slug>.<ext>，并生成 data/games.json
// 跑法：node build/fetch-game-art.mjs   （可重复跑：已有文件跳过，仅补缺）
import { GAMES } from "./games-list.mjs";
import { writeFile, mkdir, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const UA = { headers: { "User-Agent": "thegametheory-card-fetch/1.0 (personal test; contact: qs.qushuang@gmail.com)" } };
const OUT = new URL("../art-games/", import.meta.url);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiBatch(titles, tries = 4) {           // 一次 ≤50 题；429/防火墙退避重试
  const u = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages" +
    "&piprop=thumbnail&pithumbsize=640&pilimit=50&pilicense=any&redirects=1&titles=" + encodeURIComponent(titles.join("|"));
  for (let i = 0; i < tries; i++) {
    const r = await fetch(u, UA);
    if (r.ok) { const j = await r.json().catch(() => null); if (j?.query) return j.query; }
    await sleep(15000 * (i + 1));                       // 撞限流：歇 15s/30s/45s 再试
  }
  return null;
}

// 兜底：pageimages 没记录的页面（Minecraft 等），parse 页面 HTML 抠 infobox 封面
async function parseImage(title) {
  const u = "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&redirects=1&page=" + encodeURIComponent(title);
  const r = await fetch(u, UA); if (!r.ok) return null;
  const html = (await r.json())?.parse?.text?.["*"] || "";
  const m = html.match(/class="infobox[^]*?<img[^>]+src="([^"]+)"(?:[^>]*?srcset="([^"]+)")?/);
  if (!m) return null;
  let src = m[1];
  if (m[2]) { const big = m[2].split(",").pop()?.trim().split(" ")[0]; if (big) src = big; }  // srcset 最大档
  return src.startsWith("//") ? "https:" + src : src;
}

await mkdir(OUT, { recursive: true });
// 批量拿 缩略图URL：wiki 原题 → (normalized→redirects→) 页面 thumbnail
const thumbs = {};                                      // wiki原题 → 图URL
for (let i = 0; i < GAMES.length; i += 50) {
  const batch = GAMES.slice(i, i + 50).map(g => g.wiki);
  const q = await apiBatch(batch);
  if (!q) { console.log("batch failed:", i); continue; }
  const fwd = {};                                       // 原题→最终页题 映射链
  for (const n of q.normalized || []) fwd[n.from] = n.to;
  for (const rd of q.redirects || []) fwd[rd.from] = rd.to;
  const byTitle = {}; for (const p of Object.values(q.pages || {})) byTitle[p.title] = p.thumbnail?.source;
  for (const t of batch) { let k = t; while (fwd[k]) k = fwd[k]; thumbs[t] = byTitle[k] || null; }
  await sleep(2000);
}

const items = [], misses = [];
for (const g of GAMES) {
  let src = thumbs[g.wiki];
  if (!src) { src = await parseImage(g.wiki); await sleep(800); }   // 兜底逐页抠 infobox
  if (!src) { misses.push(g.wiki); continue; }
  const id = slug(g.en);
  const ext = (src.match(/\.(jpe?g|png|webp|gif)/i)?.[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
  const file = `${id}.${ext}`, dest = new URL(file, OUT);
  try { await access(dest); }                           // 已抓过 → 跳过下载
  catch {
    try {
      const img = await fetch(src, UA);
      if (!img.ok) { misses.push(g.wiki + " (img " + img.status + ")"); continue; }
      await pipeline(Readable.fromWeb(img.body), createWriteStream(dest));
      process.stdout.write(".");
      await sleep(400);                                 // 礼貌限速
    } catch (e) { misses.push(g.wiki + " (" + e.message + ")"); continue; }
  }
  items.push({ img: "/art-games/" + file, title: g.en, title_zh: g.zh,
    artist: g.by, year: g.y, rarity: g.r,
    genre: g.ge||"", genre_zh: g.g||"", line: g.le||"", line_zh: g.l||"" });
}
await writeFile(new URL("../data/games.json", import.meta.url),
  JSON.stringify({ items }, null, 0));
const dist = {}; for (const x of items) dist[x.rarity] = (dist[x.rarity] || 0) + 1;
console.log(`\n${items.length}/${GAMES.length} ok`, dist);
if (misses.length) console.log("MISS:\n  " + misses.join("\n  "));
