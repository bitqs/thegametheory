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
// 旧句退场：逐字破碎飘散（每字随机位移/旋转/模糊，错峰起飞），整行同时上移
function shatter(el){
  const wrapChars=node=>{ [...node.childNodes].forEach(ch=>{
    if(ch.nodeType===3){ const frag=document.createDocumentFragment();
      [...ch.textContent].forEach(c=>{ const s=document.createElement("span"); s.className="chx";
        s.textContent=c;
        s.style.setProperty("--dx",(Math.random()*36-18).toFixed(0)+"px");
        s.style.setProperty("--dy",(-(14+Math.random()*30)).toFixed(0)+"px");
        s.style.setProperty("--rt",(Math.random()*28-14).toFixed(0)+"deg");
        frag.appendChild(s); });
      node.replaceChild(frag,ch); }
    else wrapChars(ch); }); };
  wrapChars(el);
  [...el.querySelectorAll(".chx")].forEach((s,i)=>s.style.animationDelay=(i*14)+"ms");
  el.classList.add("sh");
  setTimeout(()=>el.remove(), 1100);
}
export function showInsight(t){
  const ins=els.insight, txt=ins.querySelector(".txt");
  const empty=!document.querySelector("#stage .card");
  ins.classList.toggle("cinema", empty);                     // 没牌→屏幕正中，电影字幕感
  const old=txt.querySelector(".iline.cur");
  if(old){ old.classList.remove("cur"); shatter(old); }      // 前一句：上移渐隐+逐字破碎
  const n=[...t].length;
  const d=document.createElement("div"); d.className="iline cur";
  d.style.fontSize = empty ? (n<=18?"26px":n<=40?"22px":"18px")
                           : (n<=40?"19px":"16px");
  d.innerHTML=decorate(t);
  txt.appendChild(d); requestAnimationFrame(()=>d.classList.add("on"));   // 新句：渐入升起
  ins.classList.add("show");
}
export function hideInsight(){ const ins=els.insight;
  ins.classList.remove("show","cinema");
  setTimeout(()=>{ ins.querySelectorAll(".iline").forEach(e=>e.remove()); }, 650); }
export function setHint(g){ els.hint.innerHTML=`<span class="arr">${T().hints[g]||""}</span>`; els.hint.classList.add("show"); }
export function nudgeHint(){ els.hint.innerHTML=`<span class="arr">${T().hints.cont}</span>`; els.hint.classList.add("show"); }
