// 手势输入（tap/up/down）+ 监听 + 按钮绑定（导入即生效）
import { S, G } from "./state.js";
import { BEATS } from "./config.js";
import { T, getLang } from "./i18n.js";
import { $, rand } from "./dom.js";
import { actx, startBgm, setMuted } from "./audio.js";
import { performAction } from "./cards.js";
import { nextBeat, philoNext, chooseEnding, startPhilo } from "./flow.js";
import { drawShare, openShareEnergy, grantEnergy } from "./share.js";

export function handleGesture(type){
  if(window.AudioContext||window.webkitAudioContext){ actx(); startBgm(); }   // 首次触摸解锁音频 + 起背景乐
  if(S.phase==="play"){
    const b=BEATS[S.beatIdx];
    if(!G[type]){ quipLocked(); return; }
    if(b.g==="share"){ if(type==="tap"){ S.pendingPhilo=true; drawShare("progress"); } return; }
    if(type!==b.g){ quipWrong(); return; }
    performAction(type);
  } else if(S.phase==="outro"){
    if(!G[type]) { quipLocked(); return; }
    nextBeat();
  } else if(S.phase==="philo"){ philoNext(); }
  else if(S.phase==="choice"){ if(G[type]) chooseEnding(type); }
}
// quip 在 narration，但避免环：动态引用
import { quip } from "./narration.js";
function quipLocked(){ quip(rand(T().locked)); }
function quipWrong(){ quip(rand(T().wrong)); }

const tl=$("touchlayer"); let tY=0,tT=0,moved=false;
tl.addEventListener("touchstart",e=>{ if(e.touches.length!==1)return; const t=e.touches[0];
  tY=t.clientY; tT=Date.now(); moved=false; e.preventDefault(); },{passive:false});
tl.addEventListener("touchmove",e=>{ const t=e.touches[0]; if(!t)return;     // 牌不跟手，仅判方向
  if(Math.abs(t.clientY-tY)>8) moved=true; e.preventDefault(); },{passive:false});
tl.addEventListener("touchend",e=>{ const dy=e.changedTouches[0].clientY-tY, dur=Date.now()-tT;
  if(dy<-50) handleGesture("up");
  else if(dy>50) handleGesture("down");
  else if(!moved && dur<400) handleGesture("tap");
  e.preventDefault(); },{passive:false});
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
$("dl").onclick=()=>{ const a=document.createElement("a"); a.download="game-theory-2.png"; a.href=$("shareCanvas").toDataURL("image/png"); a.click(); };
$("shGain").onclick=()=>grantEnergy(3,T().energyShare.gainMsg);
$("shSkip").onclick=()=>grantEnergy(1,T().energyShare.skipMsg);
