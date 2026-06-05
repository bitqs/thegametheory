// 语言选择（开局钩子：两张 SSR 牌背 → 点一张翻面放大 → 拆穿"选择"幻觉）
import { S } from "./state.js";
import { I18N, T, setLang } from "./i18n.js";
import { $ } from "./dom.js";
import { pickCards } from "./chooser.js";
import { pickArt, setDeck, deckSample, hasDeck } from "./pool.js";
import { actx, startBgm } from "./audio.js";
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
const CODES=["zh","en"];
export function buildLang(){ S.phase="lang"; const wrap=$("langcards"); wrap.innerHTML="";
  pickCards({
    items: CODES.map(code=>({ crown:"LANGUAGE", stars:4, title:I18N[code].label,
      sub:I18N[code].sub, serial:"THE GAME THEORY", art:pickArt("SSR"), rarity:"SSR",
      hint:I18N[code].label })),
    mount: wrap,
    onPick: idx=>chooseLang(CODES[idx]),
  });
  $("lang").classList.add("show"); }
function chooseLang(code){ if(S.phase!=="lang") return; S.phase="langpick"; setLang(code);
  actx(); startBgm(); setUILang();
  if(hasDeck("games")) buildDeckPick();                  // 有游戏卡组才给二选一，否则直进
  else { $("lang").classList.remove("show"); openingHook(); } }
// 第二道盲选：游戏(左,默认引导) / 画(右)
const DECKS=["games","art"];
function buildDeckPick(){ S.phase="deckpick"; const t=T();
  $("lang").querySelector(".langsub").textContent=t.deckQ;
  $("lang").querySelector(".langttl").textContent="THE GAME THEORY · 游戏论";
  const wrap=$("langcards"); wrap.innerHTML="";
  const cw=pickCards({
    items: DECKS.map(d=>({ crown:t.decks[d].crown, stars:4, title:t.decks[d].t,
      sub:t.decks[d].sub, serial:"THE GAME THEORY", art:deckSample(d), rarity:"SSR",
      hint:t.decks[d].t })),
    mount: wrap,
    onPick: idx=>{ setDeck(DECKS[idx]);
      $("lang").classList.remove("show"); openingHook(); },
  });
  const first=cw.querySelector(".ccard");                         // 引导首选游戏卡（在返回的 wrap 上查，挂载是异步的）
  first.classList.add("nudge-pick");
  const fh=first.querySelector(".chint"); if(fh) fh.textContent+=" ✦"; }
// 命运宣告：逐行片头字幕，自动配速 + 轻触快进（节奏交给玩家）→ 闪白开局
let advOpening=null;
export function openingNext(){ if(advOpening) advOpening(); }
function openingHook(){ const h=T().openHook;
  S.phase="opening";
  const ins=document.getElementById("insight"); ins.classList.add("cinema");
  // 开场金粒：缓缓上升的微光，给宣告一点仪式氛围
  const dots=[];
  for(let i=0;i<7;i++){ const d=document.createElement("i"); d.className="floatdot";
    d.style.left=(8+Math.random()*84)+"vw"; d.style.animationDelay=(Math.random()*6)+"s";
    d.style.animationDuration=(9+Math.random()*7)+"s";
    document.body.appendChild(d); dots.push(d); }
  let i=0, timer=null;
  const dur=t=>[...t].length<=7?1300:2100;
  const finish=()=>{ advOpening=null; clearTimeout(timer);
    hideInsight(); ins.classList.remove("cinema");
    dots.forEach(d=>{ d.style.opacity="0"; setTimeout(()=>d.remove(),1200); });
    import("./dom.js").then(d=>d.flashWhite());
    setTimeout(()=>{ S.beatIdx=0; applyBeat(); }, 320); };
  const next=()=>{ clearTimeout(timer);
    if(i>=h.length){ finish(); return; }
    const t=h[i++]; showInsight(t);
    timer=setTimeout(next, dur(t)); };
  advOpening=next;                                   // 轻触=立刻下一行（input phase==="opening" 接入）
  next();
  // 趁开场白预热前几张卡面，开局零白图
  import("./pool.js").then(m=>{ for(let i=0;i<6;i++){ const a=m.pickArt(null); if(a){ const im=new Image(); im.src=a.img; } } }); }
