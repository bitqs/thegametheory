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
// 洞见：台上没牌时居中（片头字幕式）；按字数定字号；「引用」/数字/术语 高亮特效
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function decorate(t){
  return esc(t)
    .replace(/“([^”]+)”/g,'“<em class="k">$1</em>”')
    .replace(/「([^」]+)」/g,'「<em class="k">$1</em>」')
    .replace(/(\d+(?:\.\d+)?\s*(?:%|格|次|分钟|minutes?|times?)?)/g,'<em class="k">$1</em>')
    .replace(/\b(near-miss|SSS|SR)\b/g,'<em class="k">$1</em>');
}
export function showInsight(t){
  const ins=els.insight, txt=ins.querySelector(".txt");
  const empty=!document.querySelector("#stage .card");
  ins.classList.toggle("cinema", empty);                     // 没牌→屏幕正中，电影字幕感
  const n=[...t].length;
  txt.style.fontSize = empty ? (n<=18?"26px":n<=40?"22px":"18px")
                             : (n<=40?"19px":"16px");
  txt.innerHTML=decorate(t);
  ins.classList.remove("show"); void ins.offsetWidth; ins.classList.add("show");
}
export function hideInsight(){ els.insight.classList.remove("show","cinema"); }
export function setHint(g){ els.hint.innerHTML=`<span class="arr">${T().hints[g]||""}</span>`; els.hint.classList.add("show"); }
export function nudgeHint(){ els.hint.innerHTML=`<span class="arr">${T().hints.cont}</span>`; els.hint.classList.add("show"); }
