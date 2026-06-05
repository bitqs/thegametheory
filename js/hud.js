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
    import("./narration.js").then(n=>n.quip(TXT().lvlUp(S.level)));
    if(F.bar){ S.__lvlFlash=true;                          // VS 升级一拍：条打满闪金，再清空重填新级
      const f=$("goalFill"); f.style.width="100%"; $("goalPct").textContent="100%";
      els.top.classList.add("tierup");
      import("./dom.js").then(d=>d.flashGo(false));
      setTimeout(()=>{ els.top.classList.remove("tierup"); S.__lvlFlash=false;
        f.style.transition="none"; updateGoal();
        requestAnimationFrame(()=>{ f.style.transition=""; }); },520); } } }
export function renderEnergy(){ const w=$("energyDots");
  if(S.energyInf){ w.innerHTML='<span class="inf">∞</span>'; return; }           // 限制拆除：无穷符号
  if(w.children.length!==TUNE.energyMax){ w.innerHTML=""; for(let i=0;i<TUNE.energyMax;i++) w.appendChild(document.createElement("i")); }
  [...w.children].forEach((d,i)=>d.classList.toggle("spent", i>=S.energy)); }
export function scheduleRegen(){ if(S.energyTimer) return; S.energyTimer=setInterval(()=>{ if(!F.energy){ clearInterval(S.energyTimer); S.energyTimer=null; return; }
  if(S.energy<TUNE.energyMax){ S.energy++; renderEnergy(); if(S.energy>1) dangerOff(); } },TUNE.energyRegen); }
// VS 式经验条：level 解锁后顶条=XP 条（装满→升级闪金→清空续装，溢出结转）；
// goalreveal 揭穿后切回总进度——"你以为在升级？其实一直是同一条线。"
export function updateGoal(){ const pct=Math.min(100, Math.round(S.doneActions/TARGET*100));
  if(pct>=55) els.app.classList.add("warm"); if(pct>=85) els.app.classList.add("hot");
  els.top.classList.toggle("gg", pct>=70 && pct<100);     // 目标梯度：末段视觉加速
  if(F.goalreveal){                                       // 揭穿段：末尾悬在 99%——"马上就好，就差一点"
    const remain=TARGET-S.doneActions;
    const show = remain<=0 ? 100 : remain<=3 ? 99 : Math.min(98,pct);
    $("goalFill").style.width=show+"%"; $("goalPct").textContent=show+"%";
    if(show===99) els.top.classList.add("gg");            // 99% 持续加速脉冲，痒感拉满
    return; }
  if(S.__lvlFlash) return;                                // 升级闪金中：别覆盖满条瞬间
  if(F.level){                                            // XP 模式（VS 原理：条即经验）
    const need=TUNE.lvlBase+(S.level-1)*TUNE.lvlStep;
    const xpct=Math.min(100, Math.round(S.xp/need*100));
    $("goalFill").style.width=xpct+"%";
    $("goalName").textContent="LV "+S.level;
    $("goalPct").textContent=xpct+"% · "+S.xpTotal.toLocaleString("en-US")+" XP";
    return; }
  $("goalFill").style.width=pct+"%"; $("goalPct").textContent=pct+"%"; }
let TXT; import("./i18n.js").then(m=>{ TXT=m.T; });            // 防环：i18n 动态引入
