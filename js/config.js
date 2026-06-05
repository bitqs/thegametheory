// ★ 所有可调数值/结构集中在此（改平衡只动这里，不碰逻辑）
// Beat 结构：on=开启的机制 / g=期望手势 / need=动作数（文案在 i18n.js 的 beats，按序号对应）
// 主交互=上滑换牌；牌自动翻（SR/SSR 留背等手翻 tap）；pick beat=选牌（真随机/near-miss）
// 前期快节奏：每 1-2 翻就上一个新机制；中后期拉长酝酿
export const BEATS = [
  { on:[],          g:"up",  need:1 },
  { on:["sound"],   g:"up",  need:1 },
  { on:["random"],  g:"up",  need:2 },
  { on:["rarity"],  g:"up",  need:2 },
  { on:["bar"],     g:"up",  need:1 },
  { on:["score"],   g:"up",  need:2 },
  { on:["level"],   g:"up",  need:2 },
  { on:["collect"], g:"up",  need:3 },
  { on:["energy"],  g:"up",  need:5 },
  { on:["pick3"],   g:"pick",need:2 },
  { on:["story"],   g:"up",  need:4 },
  { on:["juice"],   g:"up",  need:4 },
  { on:["boss"],    g:"hold",need:2 },
  { on:["pick4"],   g:"pick",need:1 },
  { on:["goalreveal"], g:"up", need:4 },
  { on:["share"],   g:"tap", need:1 },
];

export const TUNE = { scoreMin:10000, scoreMax:80000, xpBase:8, fastMs:650, xpFast:6, lvlBase:30, lvlStep:14, energyMax:3, energyRegen:1700 };

// 稀有度配色 / 星级 / 排序（仅 rarity 解锁后生效，金字塔分布见 rarity.js）
export const RC = { N:"#9aa3b2", R:"#5aa6ff", SR:"#bd7dff", SSR:"#ffd34d" };
export const RSTARS = { N:1, R:2, SR:3, SSR:4 };
export const RANK = { N:0, R:1, SR:2, SSR:3 };

// 结局卡渐变 + 主色（按选择分叉，语言无关）
export const EG = {
  hope:["linear-gradient(160deg,#3a2a08,#0e0a04)","#ffd34d"],
  story:["linear-gradient(160deg,#0a1c33,#04080f)","#5aa6ff"],
  now:["linear-gradient(160deg,#1a1a1f,#050506)","#e9e6f2"],
};

// 后台微调（/admin.html 存 localStorage）：need 覆盖须在 TARGET 计算前生效
try{ const ov=JSON.parse(localStorage.getItem("gt.overrides")||"null");
  if(ov?.needs) ov.needs.forEach((n,i)=>{ if(n>0 && BEATS[i]) BEATS[i].need=n; });
}catch{}

// 终极目标主进度条目标值 = 到 goalreveal beat 为止的动作总数
export const TARGET = BEATS.slice(0, BEATS.findIndex(b=>b.on.includes("goalreveal"))+1)
  .reduce((s,b)=>s+b.need, 0);
