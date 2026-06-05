// 通用 N 选一（2/3/4 张）：牌背阵 → 点一张翻面 → 放大停留鉴赏 → 缩出 → onPick(idx)
// item: { crown, stars(1-4), title, sub, serial, art, rarity }
import { RC } from "./config.js";
import { makeCard } from "./cards.js";
import { warm } from "./pool.js";
import { chord } from "./audio.js";
import { sparkle, flashGo } from "./dom.js";

export function pickCards({ items, mount, onPick, dwell = 1200 }) {
  const wrap = document.createElement("div");
  wrap.className = "chooseWrap n" + items.length;
  let picked = false;

  items.forEach((it, idx) => {
    const c = makeCard();
    const rar = it.rarity || "SSR";
    c.dataset.r = rar; c.style.setProperty("--rc", RC[rar]);
    c.classList.add("waiting");                                   // 牌背微光脉动
    // 正面内容先备好，翻开即见
    c.classList.add("r-on", "s-frame", "s-corners", "s-foil", "s-divider");
    c.querySelector(".crown .rt").textContent = it.crown || "";
    c.querySelector(".crown .stars").textContent = "✦".repeat(it.stars || 4);
    if (it.art) { const u = "url('" + it.art.img + "')";
      c.querySelector(".artbg").style.backgroundImage = u;
      c.querySelector(".artfg").style.backgroundImage = u; }
    const big = c.querySelector(".big"); big.textContent = it.title || ""; big.style.fontSize = "17.8cqw";
    const meta = c.querySelector(".meta"); meta.textContent = it.sub || ""; meta.style.opacity = ".8";
    c.querySelector(".serial .sn").textContent = it.serial || "";

    const h = document.createElement("div"); h.className = "ccard"; h.appendChild(c);
    if (it.hint) { const t = document.createElement("div"); t.className = "chint"; t.textContent = it.hint; h.appendChild(t); }
    h.onclick = () => {
      if (picked) return; picked = true;
      c.classList.remove("waiting");
      h.classList.add("settle");                                                  // 先回原位（悬停抬升/按压复位），两卡齐平再翻
      [...wrap.querySelectorAll(".chint")].forEach(t => t.style.opacity = "0");   // 题注让位给翻面
      h.querySelector(".chint")?.remove();                                        // 选中卡题注移除，放大不遮挡
      // 其余淡出缩小
      [...wrap.children].forEach(o => { if (o !== h) o.classList.add("ccard-out"); });
      setTimeout(() => {                                                          // 回位完成后翻面
      const gl = c.querySelector(".glyph"); if (gl) gl.style.opacity = "0";
      c.querySelector(".flip").classList.add("flipped");
      c.querySelector(".front").classList.add("art-on", "sheen");
      setTimeout(() => { const b = c.querySelector(".back"); if (b) b.style.visibility = "hidden"; }, 200);
      chord(); flashGo(true); sparkle(14);
      }, 240);
      // 翻完 → 放大到最大（FLIP：以当前位置为起点位移+缩放到视口中心）
      setTimeout(() => {
        h.classList.remove("settle");                                             // settle 的 transform:none!important 会压死放大，先摘
        const r = c.getBoundingClientRect();
        const s = Math.min(innerWidth * 0.88 / r.width, innerHeight * 0.76 / r.height);
        const dx = innerWidth / 2 - (r.left + r.width / 2);
        const dy = innerHeight / 2 - (r.top + r.height / 2);
        h.style.zIndex = "5";
        c.style.transition = "transform .6s var(--ease-out)";
        c.style.transform = `translate(${dx}px,${dy}px) scale(${s})`;
        // 停留鉴赏 → 缩出 → 回调
        setTimeout(() => {
          c.style.transition = "transform .45s var(--ease-exit),opacity .4s";
          c.style.transform += " scale(.92)"; c.style.opacity = "0";
          setTimeout(() => { wrap.remove(); onPick && onPick(idx); }, 440);
        }, dwell + 600);
      }, 860);                                                                    // 240 回位 + 620 翻面后起飞
    };
    wrap.appendChild(h);
  });
  Promise.all(items.map(it=>warm(it.art))).then(()=>mount.appendChild(wrap));  // 图齐再上桌
  return wrap;
}
