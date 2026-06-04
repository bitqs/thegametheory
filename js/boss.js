// boss beat：上方 Boss 牌压阵（探出一点），下方蓄力牌变小待命。
// 按住蓄力：槽内绿线标出安全区，蓄进绿区整体变绿；松手出击——
// 太弱被弹回 / 过猛炸膛 / 刚好：冲撞 Boss（顿帧+震退+爆闪=打击感），Boss 破牌翻成奖励。
// 揭穿：技巧幻觉（窗口 40-85% 宽得离谱，但"刚刚好"让你确信赢在本事）
import { S, F } from "./state.js";
import { BEATS, RC, RSTARS } from "./config.js";
import { T } from "./i18n.js";
import { makeCard, needOf, exitUp } from "./cards.js";
import { pickArt, artMeta, artLine } from "./pool.js";
import { els, sparkle, flashGo, rand } from "./dom.js";
import { riser, land, chord, tick } from "./audio.js";
import { bumpScore, updateGoal } from "./hud.js";
import { enterOutro } from "./flow.js";
import { quip } from "./narration.js";

const FULL=2200, LO=40, HI=85;                                  // 满蓄时长 / 绿区(%)
const touchEl=()=>document.getElementById("touchlayer");

export function startBoss(){
  S.phase="boss"; touchEl().style.pointerEvents="none";
  [...els.stage.children].forEach(c=>c.remove());
  const arena=document.createElement("div"); arena.className="bossArena";

  const bossC=makeCard(); bossC.classList.add("boss","bossTop"); // Boss 牌：上方探出一点
  bossC.style.setProperty("--rc","#ff5a5a");
  bossC.querySelector(".glyph").textContent="⛧";

  const me=makeCard(); me.classList.add("boss","chargeCard");    // 蓄力牌：下方变小待命
  me.style.setProperty("--rc","#ffd34d");
  me.querySelector(".back .uphint").textContent=T().bossHint;
  const fill=document.createElement("div"); fill.className="cfill";
  const z1=document.createElement("i"); z1.className="zoneline"; z1.style.bottom=LO+"%";
  const z2=document.createElement("i"); z2.className="zoneline"; z2.style.bottom=HI+"%";
  const back=me.querySelector(".back"); back.appendChild(fill); back.appendChild(z1); back.appendChild(z2);

  arena.appendChild(bossC); arena.appendChild(me);
  els.stage.appendChild(arena);
  requestAnimationFrame(()=>{ bossC.classList.add("in"); me.classList.add("in"); });

  let t0=0, raf=0, busy=false;
  const pct=()=>Math.min(100,(Date.now()-t0)/FULL*100);
  function loop(){ const p=pct(); fill.style.height=p+"%";
    me.classList.toggle("inzone", p>=LO&&p<=HI);                 // 蓄到绿区：整体变绿提示
    me.classList.toggle("overheat", p>HI);
    raf=requestAnimationFrame(loop); }
  function down(e){ if(busy||t0) return; t0=Date.now(); riser(FULL); loop(); e.preventDefault(); }
  function up(){ if(!t0||busy) return; cancelAnimationFrame(raf);
    const p=pct(); t0=0; busy=true; me.classList.remove("overheat","inzone");
    if(p<LO){                                                    // 太弱：冲一半被弹回，Boss 嘲笑
      me.classList.add("lunge-weak"); land(false);
      setTimeout(()=>bossC.classList.add("mock"),260);
      quip(rand(T().bossWeak));
      setTimeout(()=>{ me.classList.remove("lunge-weak"); bossC.classList.remove("mock");
        fill.style.height="0"; busy=false; },800);
    } else if(p>HI){                                             // 过猛：炸膛
      me.classList.add("blast"); flashGo(false); quip(rand(T().bossHot));
      setTimeout(()=>{ me.classList.remove("blast"); fill.style.height="0"; busy=false; },900);
    } else {                                                     // 刚好：冲撞——顿帧+震退+爆闪
      me.classList.add("lunge-hit"); tick();
      setTimeout(()=>{                                           // 撞上：80ms 顿帧后一起炸开
        bossC.classList.add("staggered"); me.classList.add("recoil");
        flashGo(true); sparkle(18); land(true); chord();
        quip(T().bossWin);
        if(F.score){ S.score+=120; bumpScore(120); }
        S.actCount++; S.doneActions++; updateGoal();
        setTimeout(()=>breakOpen(),520);
      },240);
    }
  }
  function breakOpen(){                                          // Boss 破牌：翻成 SR/SSR 奖励
    const rar=Math.random()<0.4?"SSR":"SR", art=pickArt(rar);
    bossC.dataset.r=rar; bossC.style.setProperty("--rc",RC[rar]);
    bossC.classList.remove("staggered");
    bossC.classList.add("r-on","s-frame","s-corners","s-foil");
    bossC.querySelector(".crown .rt").textContent=rar+" · "+T().rlabel[rar];
    bossC.querySelector(".crown .stars").textContent="✦".repeat(RSTARS[rar]);
    if(art){ const u="url('"+art.img+"')";
      bossC.querySelector(".artbg").style.backgroundImage=u;
      bossC.querySelector(".artfg").style.backgroundImage=u;
      bossC.querySelector(".meta").textContent=artMeta(art);
      bossC.querySelector(".tagline").textContent=artLine(art); }
    const pool=T().wordsRare, ch=pool[(Math.random()*pool.length)|0];
    const big=bossC.querySelector(".big"); big.textContent=ch;
    big.style.fontSize = ch.length<=7 ? "15px" : "12px";        // Boss 牌小，字号跟着锁
    bossC.querySelector(".meta").style.fontSize="9px";
    bossC.querySelector(".tagline").style.fontSize="8.5px";
    bossC.querySelector(".poem").style.display="none";
    const gl=bossC.querySelector(".glyph"); if(gl) gl.style.opacity="0";
    bossC.querySelector(".flip").classList.add("flipped");
    bossC.querySelector(".front").classList.add("art-on","sheen");
    setTimeout(()=>{ const b=bossC.querySelector(".back"); if(b) b.style.visibility="hidden"; },160);
    sparkle(12);
    cleanup();
    setTimeout(()=>{ exitUp(arena, ()=>{
      if(S.actCount>=needOf(BEATS[S.beatIdx])){ touchEl().style.pointerEvents=""; enterOutro(); }
      else startBoss();
    }); },2000);
  }
  function cleanup(){ window.removeEventListener("pointerdown",down); window.removeEventListener("pointerup",up); }
  window.addEventListener("pointerdown",down);
  window.addEventListener("pointerup",up);
}
