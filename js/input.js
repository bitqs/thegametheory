// 手势输入：№1 同款跟手滑动（牌随指走，过线出牌，不过线弹回）+ 路由 + 按钮绑定（导入即生效）
import { S, G } from "./state.js";
import { BEATS } from "./config.js";
import { T, getLang } from "./i18n.js";
import { $, rand } from "./dom.js";
import { actx, startBgm, setMuted } from "./audio.js";
import { flipCard, swapCard } from "./cards.js";
import { nextBeat, philoNext, chooseEnding, startPhilo } from "./flow.js";
import { drawShare, openShareEnergy, grantEnergy, saveShareImage } from "./share.js";
import { startFinale } from "./finale.js";
import { openingNext } from "./lang.js";

export function handleGesture(type){
  if(window.AudioContext||window.webkitAudioContext){ actx(); startBgm(); }   // 首次触摸解锁音频 + 起背景乐
  if(S.phase==="play"){
    const b=BEATS[S.beatIdx];
    if(b.on.includes("share")){ if(type==="tap") startFinale(); return; }   // 终幕：黑镜→SSS《你》→分享卡
    if(!G[type]){ quipLocked(); return; }
    if(type==="tap"){ if(S.card) flipCard("tap"); }     // 点击=翻牌
    else if(type==="up"){ swapCard(); }                 // 上滑=换牌（未翻开 swapCard 内部拒绝并提示）
    else if(type==="down"){ quipWrong(); }
  } else if(S.phase==="outro"){
    if(type==="up"||type==="tap") nextBeat();
  } else if(S.phase==="opening"){ openingNext(); }   // 宣告期轻触快进
  else if(S.phase==="philo"){ philoNext(); }
  else if(S.phase==="choice"){ chooseEnding(type); }   // 三向选择不受手势解锁限制（down 已退役但此处仍收）
}
// quip 在 narration，但避免环：动态引用
import { quip } from "./narration.js";
function quipLocked(){ quip(rand(T().locked)); }
function quipWrong(){ quip(rand(T().wrong)); }

// ── №1 跟手层：牌随手指位移渐隐，松手过线出牌 / 不过线弹回 ──
const tl=$("touchlayer"); let tY=0,tT=0,moved=false,dragC=null;
const stageCard=()=>document.querySelector("#stage .card");
const press=on=>{ const c=stageCard(); if(c) c.classList.toggle("pressed",on); };
tl.addEventListener("touchstart",e=>{ if(e.touches.length!==1)return; const t=e.touches[0];
  tY=t.clientY; tT=Date.now(); moved=false; dragC=stageCard(); press(true); e.preventDefault(); },{passive:false});
tl.addEventListener("touchmove",e=>{ const t=e.touches[0]; if(!t)return;
  const dy=t.clientY-tY;
  if(Math.abs(dy)>8){ moved=true; press(false); }
  if(dragC&&!S.busy){ dragC.style.transition="none";
    dragC.style.transform=`translateY(${dy}px)`;
    dragC.style.opacity=String(Math.max(.25,1-Math.abs(dy)/500)); }
  e.preventDefault(); },{passive:false});
tl.addEventListener("touchend",e=>{ const dy=e.changedTouches[0].clientY-tY, dur=Date.now()-tT;
  press(false);
  if(dragC){                                            // 先弹回；若手势成功出牌，exitUp 会接管样式
    dragC.style.transition="transform .25s cubic-bezier(.2,.8,.2,1),opacity .25s";
    dragC.style.transform="translateY(0)"; dragC.style.opacity="1"; }
  if(dy<-80) handleGesture("up");
  else if(dy>80) handleGesture("down");
  else if(!moved && dur<350) handleGesture("tap");
  dragC=null; e.preventDefault(); },{passive:false});
tl.addEventListener("mousedown",()=>{ if(!("ontouchstart" in window)) press(true); });
tl.addEventListener("mouseup",()=>{ if(!("ontouchstart" in window)) press(false); });
tl.addEventListener("click",()=>{ if(!("ontouchstart" in window)) handleGesture("tap"); });
let wl=0;
window.addEventListener("wheel",e=>{ const n=Date.now(); if(n-wl<400)return; if(Math.abs(e.deltaY)>10){ wl=n; handleGesture(e.deltaY<0?"up":"down"); } },{passive:true});
window.addEventListener("keydown",e=>{ const k=e.key;
  if(k===" "||k==="ArrowUp"){ e.preventDefault(); handleGesture("up"); }
  else if(k==="ArrowDown"){ e.preventDefault(); handleGesture("down"); }
  else if(k==="Enter"){ handleGesture("tap"); } });

$("mute").onclick=()=>{ setMuted(!S.muted); $("mute").textContent=S.muted?"♪̸":"♪"; $("mute").style.opacity=S.muted?.3:.5; };
$("endShare").onclick=()=>drawShare("end");
$("endAgain").onclick=()=>location.reload();
$("closeShare").onclick=()=>{ $("share").classList.remove("show"); if(S.pendingPhilo){ S.pendingPhilo=false; startPhilo(); } };
$("dl").onclick=()=>saveShareImage();                   // 存相册：缓存 blob 同步 share（手势栈内，iOS 不拒）
$("shGain").onclick=()=>grantEnergy(3,T().energyShare.gainMsg);
$("shSkip").onclick=()=>grantEnergy(1,T().energyShare.skipMsg);
