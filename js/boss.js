// boss beat：怪物牌挡路。按住蓄力，松手出击——太弱弹回 / 刚好破牌 / 过猛炸膛。
// 揭穿：技巧幻觉（判定窗口 40-85% 宽得离谱，但"刚刚好"让你确信赢在本事）
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

const FULL=2200, LO=40, HI=85;                                  // 满蓄时长 / 三区分界(%)
const touchEl=()=>document.getElementById("touchlayer");

export function startBoss(){
  S.phase="boss"; touchEl().style.pointerEvents="none";
  [...els.stage.children].forEach(c=>c.remove());
  const c=makeCard(); c.classList.add("boss");
  c.style.setProperty("--rc","#ff5a5a");
  c.querySelector(".glyph").textContent="⛧";
  c.querySelector(".back .uphint").textContent=T().bossHint;
  const fill=document.createElement("div"); fill.className="cfill";
  c.querySelector(".back").appendChild(fill);
  els.stage.appendChild(c);
  requestAnimationFrame(()=>c.classList.add("in"));

  let t0=0, raf=0, busy=false;
  const pct=()=>Math.min(100,(Date.now()-t0)/FULL*100);
  function loop(){ const p=pct(); fill.style.height=p+"%";
    c.classList.toggle("overheat", p>HI); raf=requestAnimationFrame(loop); }
  function down(e){ if(busy||t0) return; t0=Date.now(); riser(FULL); loop(); e.preventDefault(); }
  function up(){ if(!t0||busy) return; cancelAnimationFrame(raf);
    const p=pct(); t0=0; busy=true; c.classList.remove("overheat");
    if(p<LO){                                                   // 太弱：被弹回
      c.classList.add("bounce"); land(false); quip(rand(T().bossWeak));
      setTimeout(()=>{ c.classList.remove("bounce"); fill.style.height="0"; busy=false; },600);
    } else if(p>HI){                                            // 过猛：炸膛自伤
      c.classList.add("blast"); flashGo(false); quip(rand(T().bossHot));
      setTimeout(()=>{ c.classList.remove("blast"); fill.style.height="0"; busy=false; },900);
    } else {                                                    // 刚好：破牌爆奖励
      const rar=Math.random()<0.4?"SSR":"SR", art=pickArt(rar);
      c.dataset.r=rar; c.style.setProperty("--rc",RC[rar]);
      c.classList.add("r-on","s-frame","s-corners","s-foil");
      c.querySelector(".crown .rt").textContent=rar+" · "+T().rlabel[rar];
      c.querySelector(".crown .stars").textContent="✦".repeat(RSTARS[rar]);
      if(art){ const u="url('"+art.img+"')";
        c.querySelector(".artbg").style.backgroundImage=u;
        c.querySelector(".artfg").style.backgroundImage=u;
        c.querySelector(".meta").textContent=artMeta(art);
        c.querySelector(".tagline").textContent=artLine(art); }
      const pool=T().wordsRare, ch=pool[(Math.random()*pool.length)|0];
      const big=c.querySelector(".big"); big.textContent=ch; big.style.fontSize=ch.length<=7?"26px":"20px";
      const gl=c.querySelector(".glyph"); if(gl) gl.style.opacity="0";
      fill.remove();
      c.querySelector(".flip").classList.add("flipped");
      c.querySelector(".front").classList.add("art-on","sheen");
      setTimeout(()=>{ const b=c.querySelector(".back"); if(b) b.style.visibility="hidden"; },160);
      flashGo(true); sparkle(20); chord(); quip(T().bossWin);
      if(F.score){ S.score+=120; bumpScore(120); }
      S.actCount++; S.doneActions++; updateGoal();
      cleanup();
      setTimeout(()=>{ exitUp(c, ()=>{
        if(S.actCount>=needOf(BEATS[S.beatIdx])){ touchEl().style.pointerEvents=""; enterOutro(); }
        else startBoss();
      }); },1900);
    }
  }
  function cleanup(){ window.removeEventListener("pointerdown",down); window.removeEventListener("pointerup",up); }
  window.addEventListener("pointerdown",down);
  window.addEventListener("pointerup",up);
}
