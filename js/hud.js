// HUD：金币 / 等级 / 心力 / 终极目标进度
import { S, F } from "./state.js";
import { TUNE, TARGET } from "./config.js";
import { $, els, dangerOff } from "./dom.js";

export function showChip(el){ el.classList.add("show","newin");        // 新元素上线：金光脉冲提示
  setTimeout(()=>el.classList.remove("newin"),2600); }
export function bumpScore(add){ $("cScore").querySelector("b").textContent=S.score.toLocaleString("en-US");
  const p=document.createElement("div"); p.className="scorepop"; p.textContent="+"+add.toLocaleString("en-US"); document.body.appendChild(p); setTimeout(()=>p.remove(),1000); }
export function renderLevel(up){ const b=$("cLevel").querySelector("b"); b.textContent=S.level;
  if(up){ b.animate?.([{transform:"scale(1)"},{transform:"scale(1.5)",color:"#fff"},{transform:"scale(1)"}],{duration:500});
    import("./narration.js").then(n=>n.quip(TXT().lvlUp(S.level))); } }   // 新起点效应：每级=新的一段
export function renderEnergy(){ const w=$("energyDots");
  if(S.energyInf){ w.innerHTML='<span class="inf">∞</span>'; return; }           // 限制拆除：无穷符号
  if(w.children.length!==TUNE.energyMax){ w.innerHTML=""; for(let i=0;i<TUNE.energyMax;i++) w.appendChild(document.createElement("i")); }
  [...w.children].forEach((d,i)=>d.classList.toggle("spent", i>=S.energy)); }
export function scheduleRegen(){ if(S.energyTimer) return; S.energyTimer=setInterval(()=>{ if(!F.energy){ clearInterval(S.energyTimer); S.energyTimer=null; return; }
  if(S.energy<TUNE.energyMax){ S.energy++; renderEnergy(); if(S.energy>1) dangerOff(); } },TUNE.energyRegen); }
// 升级递进进度条：Ⅰ-Ⅳ 四段，每满一段升阶重填（新起点效应 ×4）；
// goalreveal 揭穿后切回总进度——"你以为升级重置了？其实一直是同一条线。"
const TIERS=["Ⅰ","Ⅱ","Ⅲ","Ⅳ"];
export function updateGoal(){ const pct=Math.min(100, Math.round(S.doneActions/TARGET*100));
  if(pct>=55) els.app.classList.add("warm"); if(pct>=85) els.app.classList.add("hot");
  els.top.classList.toggle("gg", pct>=70 && pct<100);     // 目标梯度：末段视觉加速
  if(F.goalreveal){ $("goalFill").style.width=pct+"%"; $("goalPct").textContent=pct+"%"; return; }
  const tier=Math.min(3, Math.floor(S.doneActions/TARGET*4));
  const lo=tier*TARGET/4, tpct=Math.min(100, Math.round((S.doneActions-lo)/(TARGET/4)*100));
  if(tier>S.goalTier){ S.goalTier=tier;                   // 升阶时刻：满条金闪 → 快照重填新段
    const f=$("goalFill"); f.style.width="100%"; $("goalPct").textContent="100%";
    els.top.classList.add("tierup");
    import("./dom.js").then(d=>d.flashGo(false));
    import("./audio.js").then(a=>a.lvlSnd());
    if(F.bar) import("./narration.js").then(n=>n.quip(TXT().goalTier(TIERS[tier])));
    setTimeout(()=>{ els.top.classList.remove("tierup");
      f.style.transition="none"; f.style.width=tpct+"%";
      requestAnimationFrame(()=>{ f.style.transition=""; });
      $("goalName").textContent=TXT().goalName+" · "+TIERS[tier];
      $("goalPct").textContent=tpct+"%"; },650);
    return; }
  $("goalFill").style.width=tpct+"%"; $("goalPct").textContent=tpct+"%"; }
let TXT; import("./i18n.js").then(m=>{ TXT=m.T; });            // 防环：i18n 动态引入
