// 设计师旁白 / 层尾洞见 / 手势提示
import { els } from "./dom.js";
import { T } from "./i18n.js";

const SAYMAX = 3;   // 最多保留 3 行，更早的缓慢隐去
export function pushLine(text, dim){
  const d=document.createElement("div"); d.className="line"+(dim?" dim":""); d.textContent=text;
  els.say.appendChild(d); requestAnimationFrame(()=>d.classList.add("show"));
  const ls=[...els.say.children];
  if(ls.length>SAYMAX){ const old=ls[0]; old.classList.remove("show"); setTimeout(()=>old.remove(),700); }
  return d;
}
let speakT=[];                       // 待落地的旁白行计时器：clearSay 一并取消，防晚到的行盖住洞见
export function speak(lines){ speakT=lines.map((t,i)=> setTimeout(()=>pushLine(t, i===lines.length-1&&lines.length>1), 250+i*700)); }
export function clearSay(){ speakT.forEach(clearTimeout); speakT=[];
  [...els.say.children].forEach(d=>{ d.classList.remove("show"); setTimeout(()=>d.remove(),550); }); }
let quipT=null;
export function quip(t){ const d=pushLine(t,true); clearTimeout(quipT);
  quipT=setTimeout(()=>{ d.classList.remove("show"); setTimeout(()=>d.remove(),500); },1600); }
export function showInsight(t){ els.insight.querySelector(".txt").textContent=t; els.insight.classList.add("show"); }
export function hideInsight(){ els.insight.classList.remove("show"); }
export function setHint(g){ els.hint.innerHTML=`<span class="arr">${T().hints[g]||""}</span>`; els.hint.classList.add("show"); }
export function nudgeHint(){ els.hint.innerHTML=`<span class="arr">${T().hints.cont}</span>`; els.hint.classList.add("show"); }
