// 蒙特卡洛：用真实 rarity + config 模拟整局，看稀有度分布 / 收集 / 分享触发
import { rollRarity } from "../js/rarity.js";
import { BEATS, TARGET, TUNE } from "../js/config.js";

const RUNS = 5000;
const dist = { N:0, R:0, SR:0, SSR:0 };
let totalPulls = 0, anySSR = 0, forcedShares = 0;

const rarityIdx = BEATS.findIndex(b => b.on.includes("rarity"));
const energyBeat = BEATS.find(b => b.on.includes("energy"));
// rarity 仅在 rarity beat 解锁后生效，统计从该 beat 起的总动作（= 真实"抽卡"次数）
const pullsPerRun = BEATS.slice(rarityIdx).reduce((s,b)=>s+b.need, 0);

for (let r=0;r<RUNS;r++){
  let sawSSR = false;
  for (let i=0;i<pullsPerRun;i++){ const k=rollRarity(); dist[k]++; totalPulls++; if(k==="SSR") sawSSR=true; }
  if (sawSSR) anySSR++;
  // 心力 beat：need 次动作，每次 -1，心力上限 energyMax；耗尽即弹一次假分享
  if (energyBeat.need > TUNE.energyMax) forcedShares++;
}

const pct = k => (dist[k]/totalPulls*100).toFixed(2);
console.log("═══ №2「游戏的诞生」Monte-Carlo ·", RUNS, "局 ═══");
console.log("每局抽卡次数(rarity 解锁后):", pullsPerRun, " | 总抽卡:", totalPulls);
console.log("稀有度分布   SSR", pct("SSR")+"%   SR", pct("SR")+"%   R", pct("R")+"%   N", pct("N")+"%");
console.log("每局至少一张 SSR 概率:", (anySSR/RUNS*100).toFixed(1)+"%   (爽点保障)");
console.log("强制分享得心力触发率:", (forcedShares/RUNS*100).toFixed(0)+"%   (energy need", energyBeat.need, "> max", TUNE.energyMax+")");
console.log("终极目标动作数 TARGET:", TARGET);
