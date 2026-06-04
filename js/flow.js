// Beat 状态机 / 哲学 / 选择 / 结局
import { S, F, G } from "./state.js";
import { BEATS, TARGET, EG } from "./config.js";
import { T, getLang } from "./i18n.js";
import { $, els } from "./dom.js";
import { spawnBack, exitUp } from "./cards.js";
import { speak, clearSay, showInsight, hideInsight, setHint, nudgeHint } from "./narration.js";
import { showChip, renderEnergy, updateGoal } from "./hud.js";
import { dangerOff } from "./dom.js";
import { chord } from "./audio.js";

export function applyBeat(){ const b=BEATS[S.beatIdx];
  b.on.forEach(f=>{ F[f]=1;
    if(f==="bar"){ els.top.classList.add("show"); }
    if(f==="score") showChip($("cScore"));
    if(f==="level") showChip($("cLevel"));
    if(f==="collect"){ $("cCollect").querySelector("b").textContent=S.collSet.size; showChip($("cCollect")); }
    if(f==="energy"){ S.energy=3; renderEnergy(); showChip($("cEnergy")); }
    if(f==="goalreveal"){ els.top.classList.add("reveal"); $("goalName").textContent=T().goalFinal; }
  });
  S.phase="play"; S.actCount=0; clearSay();
  const bi=S.beatIdx; setTimeout(()=>{ if((S.phase==="play"||S.phase==="pick")&&S.beatIdx===bi) speak(T().beats[bi].say); },300);
  S.card=null;
  const prev=S.shown; S.shown=null;
  if(b.g==="pick"){                                                    // 选牌 beat：三/四选一
    [...els.stage.children].forEach(c=>c.remove());
    import("./pick.js").then(m=>m.startPick(b.on.includes("pick4")?4:3, b.on.includes("pick4")?"nearmiss":null));
    setHint("pick"); return;
  }
  if(b.g==="hold"){                                                    // boss beat：蓄力战
    [...els.stage.children].forEach(c=>c.remove());
    import("./boss.js").then(m=>m.startBoss());
    setHint("hold"); return;
  }
  [...els.stage.children].forEach(c=>{ if(c!==prev) c.remove(); });    // 清掉残留，防累积
  if(prev) exitUp(prev, spawnBack);                                    // 上一张上滑隐去 → 再出现下一张
  else spawnBack();
  setHint(b.g==="share"?"tap":b.g);
}
export function enterOutro(){ S.phase="outro"; clearSay(); els.hint.classList.remove("show");
  const b=BEATS[S.beatIdx];
  if(b.on.includes("energy")){ F.energy=0; $("cEnergy").classList.remove("show"); dangerOff(); }  // 收尾稀缺
  const done=T().beats[S.beatIdx].done;
  if(done) setTimeout(()=>showInsight(done),350); else { nextBeat(); return; }
  setTimeout(nudgeHint,900);
}
export function nextBeat(){ hideInsight(); S.beatIdx++;
  if(S.beatIdx>=BEATS.length){ startPhilo(); return; }
  if(BEATS[S.beatIdx].on.includes("share")){ S.doneActions=TARGET; updateGoal(); }   // 揭穿后强制满条
  applyBeat();
}

export function startPhilo(){ S.phase="philo"; els.stage.innerHTML=""; S.shown=null;
  ["say","insight","hint","top","hud","stage"].forEach(id=>{ const e=$(id); if(e) e.style.opacity="0"; });
  const v=$("philo"); v.innerHTML=""; T().philo.forEach(p=>{ const d=document.createElement("div");
    d.className="pl"+(p.k?" key":""); d.textContent=p.t; v.appendChild(d); });
  const go=document.createElement("div"); go.className="go"; go.textContent=T().insightCont; v.appendChild(go);
  v.classList.add("show"); S.philoStep=0; S.philoLines=null; philoNext();
}
export function philoNext(){ S.philoLines=S.philoLines||[...$("philo").querySelectorAll(".pl")];
  if(S.philoStep<S.philoLines.length){ const n=Math.min(S.philoLines.length, S.philoStep+2);
    for(;S.philoStep<n;S.philoStep++) S.philoLines[S.philoStep].classList.add("show");
    if(S.philoStep>=S.philoLines.length) $("philo").querySelector(".go").classList.add("show");
  } else { $("philo").classList.remove("show"); startChoice(); }
}

export function startChoice(){ S.phase="choice"; const v=$("choice"); v.classList.add("show");
  setTimeout(()=>v.querySelector(".q").classList.add("show"),200);
  setTimeout(()=>v.querySelector(".opts").classList.add("show"),700);
  setHint(""); els.hint.classList.remove("show");
}
export function chooseEnding(type){ S.chosen = type==="up"?"hope":type==="down"?"story":"now";
  $("choice").classList.remove("show"); showEnding();
}
export function showEnding(){ S.phase="end"; const e=T().endings[S.chosen], g=EG[S.chosen]; const v=$("end");
  const cf=v.querySelector(".card-final"); cf.style.background=g[0]; cf.style.border="1px solid "+g[1];
  cf.style.boxShadow=`0 0 40px -6px ${g[1]},0 24px 70px rgba(0,0,0,.7)`;
  const ec=cf.querySelector(".ec"); ec.textContent=e.char; ec.style.color=g[1]; ec.style.textShadow="0 0 30px "+g[1];
  ec.style.fontSize = getLang()==="en" ? "46px" : "88px"; ec.style.fontFamily = getLang()==="en" ? "'Playfair Display',serif" : "'Noto Serif SC',serif";
  cf.querySelector(".el").innerHTML=e.line.replace(/\n/g,"<br>"); cf.querySelector(".el").style.color="#e9e6f2";
  v.classList.add("show"); chord(); setTimeout(()=>v.querySelector(".ebtns").classList.add("show"),700);
}
