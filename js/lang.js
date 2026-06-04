// 语言选择（开局钩子：先给终极形态 SSR 艺术牌，再拆穿"选择"幻觉）
import { S } from "./state.js";
import { RC } from "./config.js";
import { I18N, T, setLang } from "./i18n.js";
import { $ } from "./dom.js";
import { makeCard } from "./cards.js";
import { pickArt } from "./pool.js";
import { actx, chord, startBgm } from "./audio.js";
import { sparkle, flashGo } from "./dom.js";
import { showInsight, hideInsight } from "./narration.js";
import { applyBeat } from "./flow.js";

export function setUILang(){ const t=T();
  $("cScore").childNodes[0].textContent=t.chips.score+" ";
  $("cLevel").childNodes[0].textContent=t.chips.level+" ";
  $("cCollect").childNodes[0].textContent=t.chips.collect+" ";
  $("cEnergy").childNodes[0].textContent=t.chips.energy+" ";
  $("goalName").textContent=t.goalName;
  $("endShare").textContent=t.endShare; $("endAgain").textContent=t.endAgain;
  $("dl").textContent=t.share.save; $("closeShare").textContent=t.share.close;
  $("shareTip").textContent=t.share.tip;
  $("choice").querySelector(".q").textContent=t.choiceQ;
  const opts=$("choice").querySelectorAll(".opt");
  t.choiceOpts.forEach((o,i)=>{ if(opts[i]) opts[i].innerHTML=`<span class="g">${o.g}</span> ${o.t}`; });
}
function langCard(code){
  const c=makeCard(); c.dataset.r="SSR"; c.style.setProperty("--rc",RC.SSR);
  c.classList.add("r-on","s-frame","s-corners","s-foil","s-divider");
  c.querySelector(".crown .rt").textContent="LANGUAGE";
  c.querySelector(".crown .stars").textContent="✦✦✦✦";
  const art=pickArt("SSR"); if(art){ const u="url('"+art.img+"')"; c.querySelector(".artbg").style.backgroundImage=u; c.querySelector(".artfg").style.backgroundImage=u; }
  c.querySelector(".front").classList.add("art-on");
  const big=c.querySelector(".big"); big.textContent=I18N[code].label; big.style.fontSize="32px";
  const meta=c.querySelector(".meta"); meta.textContent=I18N[code].sub; meta.style.opacity=".8";
  c.querySelector(".serial .sn").textContent="THE GAME THEORY";
  c.querySelector(".flip").classList.add("flipped");
  c.querySelector(".back").style.visibility="hidden";
  const h=document.createElement("div"); h.className="lcard"; h.appendChild(c);
  h.onclick=()=>chooseLang(code,h);
  return h;
}
export function buildLang(){ S.phase="lang"; const wrap=$("langcards"); wrap.innerHTML="";
  wrap.appendChild(langCard("zh")); wrap.appendChild(langCard("en"));
  $("lang").classList.add("show"); }
function chooseLang(code,holder){ if(S.phase!=="lang") return; S.phase="langpick"; setLang(code);
  actx(); startBgm(); chord(); sparkle(18); flashGo(true);
  holder.querySelector(".card").classList.add("float");
  [...$("langcards").children].forEach(h=>{ if(h!==holder){ h.style.transition="opacity .5s,transform .5s"; h.style.opacity="0"; h.style.transform="scale(.9)"; } });
  setUILang();
  setTimeout(()=>{ $("lang").classList.remove("show"); openingHook(); }, 1000); }
function openingHook(){ const h=T().openHook;
  showInsight(h[0]);
  setTimeout(()=>showInsight(h[1]),2100);
  setTimeout(()=>{ hideInsight(); S.beatIdx=0; applyBeat(); },4200); }
