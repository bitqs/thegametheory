// js/share-image.js — 把战绩合成成可保存 PNG（canvas）：虚化牌墙 + 浮起焦点卡
import qrcode from "./vendor/qrcode-generator.js";

const W = 941, H = 1672, CX = W / 2;
const SX = 76, CW = W - 2 * SX;                 // 内容左右留白 / 内容宽
const RARITY_COLORS = { N:"#9aa3b2", R:"#5a9bd8", SR:"#b06bd8", SSR:"#e8c14a" };
// 每档独立底色：钢灰 / 海蓝 / 皇紫 / 暖金 —— 缩略图也一眼分档
const RARITY_BG = {
  N:   { top:"#222631", bot:"#070809", spot:"205,215,235" },
  R:   { top:"#0e2545", bot:"#050a16", spot:"120,180,255" },
  SR:  { top:"#2b1342", bot:"#0c0518", spot:"205,140,255" },
  SSR: { top:"#3a2409", bot:"#140a02", spot:"255,208,110" },
};

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function star(ctx, x, y, s){
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * .22, y - s * .22); ctx.lineTo(x + s, y);
  ctx.lineTo(x + s * .22, y + s * .22); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .22, y + s * .22);
  ctx.lineTo(x - s, y); ctx.lineTo(x - s * .22, y - s * .22); ctx.closePath(); ctx.fill();
}
function metalGrad(ctx, x0, y0, x1, y1){
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#f6d98a"); g.addColorStop(.45, "#caa14a"); g.addColorStop(.55, "#8f6f1a"); g.addColorStop(1, "#e7c45f");
  return g;
}
function gilt(ctx, y, h){
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#f8dd92"); g.addColorStop(.45, "#dcb748"); g.addColorStop(.72, "#a98423"); g.addColorStop(1, "#f0cd6a");
  return g;
}
// chip 文字颜色：浅底用深字，深底用浅字
function textColorOn(hex){
  const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return (r * .299 + g * .587 + b * .114) > 150 ? "#1a1206" : "#fdf6e6";
}
// 稀有度药丸：实心稀有度色 + 柔光
function rarityChip(ctx, x, y, h, code, label, rc){
  ctx.save();
  ctx.font = "700 23px Cinzel, 'Noto Serif SC', serif";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  const txt = `${code}  ${label}`, padX = 22, w = ctx.measureText(txt).width + padX * 2;
  ctx.shadowColor = rc; ctx.shadowBlur = 18; ctx.fillStyle = rc;
  roundRect(ctx, x, y, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = textColorOn(rc); ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(txt, x + padX, y + h / 2 + 1);
  ctx.restore();
  return w;
}
// 极简分隔：金细线 + 中心稀有度小菱
function divider(ctx, cx, y, half, rc){
  ctx.strokeStyle = "rgba(200,170,90,.5)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - 16, y); ctx.moveTo(cx + 16, y); ctx.lineTo(cx + half, y); ctx.stroke();
  ctx.save(); ctx.translate(cx, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = rc; ctx.fillRect(-5, -5, 10, 10); ctx.restore();
}
// 卡底：稀有度渐变 + 顶部柔光 + 暗角 + 单层细边框（去繁就简）
function drawCardFrame(ctx, rc, rarity){
  const pal = RARITY_BG[rarity] || RARITY_BG.N;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, pal.top); bg.addColorStop(.5, "#0a0a10"); bg.addColorStop(1, pal.bot);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const sp = ctx.createRadialGradient(CX, 130, 40, CX, 130, W * .92);
  sp.addColorStop(0, `rgba(${pal.spot},.16)`); sp.addColorStop(1, `rgba(${pal.spot},0)`);
  ctx.fillStyle = sp; ctx.fillRect(0, 0, W, 660);
  const vg = ctx.createRadialGradient(CX, H * .46, H * .3, CX, H * .5, H * .72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const m = 24;
  ctx.save();
  if (rarity === "SR" || rarity === "SSR"){ ctx.shadowColor = rc; ctx.shadowBlur = 26; }
  ctx.strokeStyle = rc; ctx.lineWidth = 2.5; roundRect(ctx, m, m, W - 2 * m, H - 2 * m, 28); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "rgba(220,190,120,.32)"; ctx.lineWidth = 1; roundRect(ctx, m + 6, m + 6, W - 2 * m - 12, H - 2 * m - 12, 22); ctx.stroke();
}
// 画窗细框：金描边 + 稀有度内线 + SR/SSR 辉光（无宝石）
function drawArtFrame(ctx, x, y, w, h, rc, rarity){
  ctx.save();
  if (rarity === "SR" || rarity === "SSR"){ ctx.shadowColor = rc; ctx.shadowBlur = 28; }
  ctx.strokeStyle = metalGrad(ctx, x, y, x + w, y + h); ctx.lineWidth = 4; roundRect(ctx, x, y, w, h, 14); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = rc; ctx.lineWidth = 1.5; roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 10); ctx.stroke();
}
// SSR 斜向金箔流光（克制）
function drawSSRFoil(ctx){
  ctx.save(); ctx.globalCompositeOperation = "overlay";
  for (let x = -160; x < W + 160; x += 170){
    const g = ctx.createLinearGradient(x, 0, x + 90, H);
    g.addColorStop(0, "rgba(255,232,150,0)"); g.addColorStop(.5, "rgba(255,238,180,.10)"); g.addColorStop(1, "rgba(255,232,150,0)");
    ctx.fillStyle = g; ctx.fillRect(x, 0, 90, H);
  }
  ctx.restore();
}

// 远端图走同源 /img 代理（避免 canvas 跨域污染），本地 /art/ 原样
function proxied(src){ return /^https?:\/\//.test(src) ? `/img?u=${encodeURIComponent(src)}` : src; }
// 把图 cover 填进圆角矩形（裁切，不变形）
function coverInto(ctx, img, x, y, w, h, rad){
  ctx.save(); roundRect(ctx, x, y, w, h, rad); ctx.clip();
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}
// 满铺「其他藏品」牌墙 → 整体重模糊 + 暗场 + 稀有度晕染，作焦点卡背景
async function drawCardWall(ctx, srcs, rc){
  ctx.fillStyle = "#0a0810"; ctx.fillRect(0, 0, W, H);
  const cols = 3, rows = 4, pad = 22;
  const cw = (W - pad * (cols + 1)) / cols, chh = (H - pad * (rows + 1)) / rows, n = cols * rows;
  let imgs = [];
  if (srcs && srcs.length){
    const pick = Array.from({ length: n }, (_, i) => srcs[i % srcs.length]);
    imgs = await Promise.all(pick.map(s => loadImage(proxied(s), true).catch(() => null)));
  }
  const wall = document.createElement("canvas"); wall.width = W; wall.height = H;
  const wc = wall.getContext("2d");
  wc.fillStyle = "#0c0a14"; wc.fillRect(0, 0, W, H);
  for (let i = 0; i < n; i++){
    const c = i % cols, r = (i / cols) | 0;
    const x = pad + c * (cw + pad), y = pad + r * (chh + pad);
    if (imgs[i]) coverInto(wc, imgs[i], x, y, cw, chh, 12);
    else { wc.fillStyle = "#14101e"; roundRect(wc, x, y, cw, chh, 12); wc.fill(); }
    wc.strokeStyle = "rgba(170,140,70,.5)"; wc.lineWidth = 3; roundRect(wc, x, y, cw, chh, 12); wc.stroke();
  }
  ctx.save(); if ("filter" in ctx) ctx.filter = "blur(26px)";
  ctx.drawImage(wall, -W * 0.06, -H * 0.06, W * 1.12, H * 1.12); ctx.restore();
  ctx.fillStyle = "rgba(6,5,10,.58)"; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(CX, H / 2, H * .18, CX, H / 2, H * .72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, rc + "44");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}
// 焦点卡浮起：居中 ~86% + 圆角 + 投影
function drawFloatingCard(ctx, card){
  const scale = 0.86, dw = Math.round(W * scale), dh = Math.round(H * scale);
  const dx = (W - dw) >> 1, dy = (H - dh) >> 1, rad = 24;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.62)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#000"; roundRect(ctx, dx, dy, dw, dh, rad); ctx.fill();
  ctx.restore();
  ctx.save(); roundRect(ctx, dx, dy, dw, dh, rad); ctx.clip();
  ctx.drawImage(card, dx, dy, dw, dh); ctx.restore();
}
function loadImage(src, cross){
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cross) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 按宽度折行：中文按字符、英文按词；用传入 ctx.measureText
export function wrapText(ctx, text, maxWidth){
  const tokens = /[一-鿿]/.test(text) ? [...text] : text.split(/(\s+)/);
  const lines = []; let line = "";
  for (const tk of tokens){
    const test = line + tk;
    if (ctx.measureText(test).width > maxWidth && line.trim()){ lines.push(line.trim()); line = tk.trim() ? tk : ""; }
    else line = test;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

// 收藏编号：取 id 末段数字，无数字则用原 id
export function serialFromId(id){
  const m = String(id || "").match(/\d+/g);
  return "NO." + (m ? m[m.length - 1] : String(id || ""));
}

function clip(ctx, text, maxW){
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}

export async function renderShareCanvas(opts, onProgress){
  const prog = p => { try { onProgress?.(p); } catch {} };
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  try {
    await Promise.all([
      document.fonts.load("700 56px 'Noto Serif SC'"),
      document.fonts.load("400 23px 'Noto Serif SC'"),
      document.fonts.load("800 92px 'Playfair Display'"),
      document.fonts.load("700 40px Cinzel"),
      document.fonts.load("italic 27px 'Cormorant Garamond'"),
      document.fonts.ready,
    ]);
  } catch {}
  prog(0.15);

  const rc = RARITY_COLORS[opts.rarity] || RARITY_COLORS.N;
  drawCardFrame(ctx, rc, opts.rarity);
  prog(0.35);

  // ── 顶部：稀有度 chip（左） + 收藏编号（右）
  const chipY = 96, chipH = 48;
  rarityChip(ctx, SX, chipY, chipH, opts.rarity, opts.rarityLabel, rc);
  ctx.save(); ctx.textAlign = "right"; ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";
  ctx.fillStyle = "rgba(220,195,130,.72)"; ctx.font = "600 21px Cinzel, serif";
  ctx.fillText(opts.serial, W - SX, chipY + chipH / 2 + 1); ctx.restore();

  // ── 藏品名（大字，最多两行自适应）
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const titleTop = chipY + chipH + 34;
  let tsize = 56; ctx.font = `700 ${tsize}px 'Noto Serif SC', serif`;
  let lines = [opts.pieceTitle];
  if (ctx.measureText(opts.pieceTitle).width > CW){
    tsize = 42; ctx.font = `700 ${tsize}px 'Noto Serif SC', serif`;
    lines = wrapText(ctx, opts.pieceTitle, CW);
    if (lines.length > 2){ lines = [lines[0], clip(ctx, lines.slice(1).join(""), CW)]; }
  }
  ctx.fillStyle = gilt(ctx, titleTop, lines.length * (tsize + 10));
  lines.forEach((ln, i) => ctx.fillText(ln, SX, titleTop + tsize + i * (tsize + 10)));

  // ── 作者 · 年代
  const meta = [opts.artist, opts.yearText].filter(Boolean).join("   ·   ");
  if (meta){
    ctx.save(); if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";
    ctx.fillStyle = "rgba(212,198,162,.85)"; ctx.font = "400 24px 'Noto Serif SC', serif";
    ctx.fillText(clip(ctx, meta, CW), SX, 340); ctx.restore();
  }

  // ── 画窗：大尺寸，画作 contain 完整展示 + 稀有度柔光
  const heroUrl = proxied(opts.heroSrc);
  let hero = null; try { hero = await loadImage(heroUrl, true); } catch {}
  prog(0.8);
  const ax = SX, aw = CW, ay = 374, ah = 712;
  const ag = ctx.createRadialGradient(CX, ay + ah / 2, 60, CX, ay + ah / 2, ah * .72);
  ag.addColorStop(0, rc + "30"); ag.addColorStop(1, rc + "00");
  ctx.fillStyle = ag; ctx.fillRect(0, ay - 70, W, ah + 140);
  ctx.fillStyle = "#080608"; roundRect(ctx, ax, ay, aw, ah, 14); ctx.fill();
  if (hero){
    ctx.save(); roundRect(ctx, ax, ay, aw, ah, 14); ctx.clip();
    // 背景：同画 cover 重模糊填满，消除 contain 留白黑边
    if ("filter" in ctx) ctx.filter = "blur(24px) brightness(.5)";
    const cr = Math.max(aw / hero.naturalWidth, ah / hero.naturalHeight);
    const cdw = hero.naturalWidth * cr, cdh = hero.naturalHeight * cr;
    ctx.drawImage(hero, ax + (aw - cdw) / 2, ay + (ah - cdh) / 2, cdw, cdh);
    if ("filter" in ctx) ctx.filter = "none";
    // 前景：完整 contain，画作不裁
    const r = Math.min(aw / hero.naturalWidth, ah / hero.naturalHeight);
    const dw = Math.round(hero.naturalWidth * r), dh = Math.round(hero.naturalHeight * r);
    ctx.drawImage(hero, Math.round(ax + (aw - dw) / 2), Math.round(ay + (ah - dh) / 2), dw, dh);
    ctx.restore();
  }
  drawArtFrame(ctx, ax, ay, aw, ah, rc, opts.rarity);

  // ── 馆名（画窗下，居中小字）
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  if (opts.museumLabel){
    ctx.save(); if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
    ctx.fillStyle = "rgba(200,185,150,.8)"; ctx.font = "400 22px 'Noto Serif SC', serif";
    ctx.fillText(clip(ctx, opts.museumLabel, CW), CX, ay + ah + 46); ctx.restore();
  }

  // ── VALUE：标签 + 巨额
  ctx.save(); if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
  ctx.fillStyle = "rgba(182,167,128,.9)"; ctx.font = "500 20px Cinzel, 'Noto Serif SC', serif";
  ctx.fillText(opts.scoreLabel, CX, 1202); ctx.restore();
  ctx.font = "800 92px 'Playfair Display', serif"; ctx.fillStyle = gilt(ctx, 1232, 92);
  ctx.fillText(opts.amount, CX, 1306);
  divider(ctx, CX, 1352, 210, rc);

  // ── 风味叙事
  ctx.fillStyle = "rgba(222,212,186,.92)"; ctx.font = "italic 27px 'Cormorant Garamond', 'Noto Serif SC', serif";
  wrapText(ctx, opts.brag, 720).slice(0, 3).forEach((ln, i) => ctx.fillText(ln, CX, 1406 + i * 38));

  // ── 底部：二维码 + 游戏名（并排）
  try {
    const qr = qrcode(0, "M"); qr.addData(opts.url); qr.make();
    const n = qr.getModuleCount(), quiet = 2, scale = 3, qpx = (n + quiet * 2) * scale;
    const qx = SX, qy = H - qpx - 60;
    ctx.fillStyle = "#caa44a"; ctx.fillRect(qx - 5, qy - 5, qpx + 10, qpx + 10);
    ctx.fillStyle = "#f1e6c6"; ctx.fillRect(qx, qy, qpx, qpx);
    ctx.fillStyle = "#2a1d0e";
    for (let row = 0; row < n; row++) for (let col = 0; col < n; col++)
      if (qr.isDark(row, col)) ctx.fillRect(qx + (col + quiet) * scale, qy + (row + quiet) * scale, scale, scale);
    const tx = qx + qpx + 28, mid = qy + qpx / 2;
    ctx.textAlign = "left";
    ctx.fillStyle = gilt(ctx, mid - 40, 42); ctx.font = "700 40px 'Noto Serif SC', serif";
    ctx.fillText(opts.titleText, tx, mid - 4);
    ctx.save(); if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
    ctx.fillStyle = "#caa44a"; ctx.font = "500 16px Cinzel, serif"; ctx.fillText(opts.kicker, tx, mid + 24); ctx.restore();
    ctx.fillStyle = "rgba(182,167,132,.85)"; ctx.font = "400 18px 'Noto Serif SC', serif";
    ctx.fillText(`${opts.scanLabel}  ·  ${opts.urlLabel}`, tx, mid + 52);
    ctx.textAlign = "center";
  } catch {}

  // SSR 金箔流光（最后叠在焦点卡上）
  if (opts.rarity === "SSR") drawSSRFoil(ctx);

  // 输出：满铺「其他藏品」虚化牌墙 + 焦点卡浮起（cv 此时是焦点卡 buffer）
  const out = document.createElement("canvas"); out.width = W; out.height = H;
  const octx = out.getContext("2d");
  await drawCardWall(octx, opts.wallSrcs, rc);
  drawFloatingCard(octx, cv);
  prog(1);
  return out;
}
