// HUD：分数 / 等级 / 心力 / 终极目标进度
import { S, F } from "./state.js";
import { TUNE, TARGET } from "./config.js";
import { $, els, dangerOff } from "./dom.js";

export function showChip(el){ el.classList.add("show"); }
export function bumpScore(add){ $("cScore").querySelector("b").textContent=S.score;
  const p=document.createElement("div"); p.className="pop"; p.textContent="+"+add; document.body.appendChild(p); setTimeout(()=>p.remove(),1000); }
export function renderLevel(up){ const b=$("cLevel").querySelector("b"); b.textContent=S.level;
  if(up){ b.animate?.([{transform:"scale(1)"},{transform:"scale(1.5)",color:"#fff"},{transform:"scale(1)"}],{duration:500}); } }
export function renderEnergy(){ const w=$("energyDots"); if(w.children.length!==TUNE.energyMax){ w.innerHTML=""; for(let i=0;i<TUNE.energyMax;i++) w.appendChild(document.createElement("i")); }
  [...w.children].forEach((d,i)=>d.classList.toggle("spent", i>=S.energy)); }
export function scheduleRegen(){ if(S.energyTimer) return; S.energyTimer=setInterval(()=>{ if(!F.energy){ clearInterval(S.energyTimer); S.energyTimer=null; return; }
  if(S.energy<TUNE.energyMax){ S.energy++; renderEnergy(); if(S.energy>1) dangerOff(); } },TUNE.energyRegen); }
export function updateGoal(){ const pct=Math.min(100, Math.round(S.doneActions/TARGET*100));
  $("goalFill").style.width=pct+"%"; $("goalPct").textContent=pct+"%";
  if(pct>=55) els.app.classList.add("warm"); if(pct>=85) els.app.classList.add("hot"); }
