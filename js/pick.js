// 选牌 beat：三选一(真随机，选完亮出全部) / 四选一(near-miss 操纵：金卡永远在你隔壁)
import { S, F } from "./state.js";
import { BEATS, RC, RSTARS } from "./config.js";
import { T } from "./i18n.js";
import { makeCard, needOf } from "./cards.js";
import { pickArt, artMeta, artLine } from "./pool.js";
import { els, sparkle, flashGo } from "./dom.js";
import { land, chord, tick } from "./audio.js";
import { bumpScore, updateGoal } from "./hud.js";
import { enterOutro } from "./flow.js";

const touchEl = () => document.getElementById("touchlayer");

function fillFront(c, rar, art){
  c.dataset.r = rar; c.style.setProperty("--rc", RC[rar]);
  c.classList.add("r-on","s-frame","s-corners","s-foil");
  c.querySelector(".crown .rt").textContent = rar+" · "+T().rlabel[rar];
  c.querySelector(".crown .stars").textContent = "✦".repeat(RSTARS[rar]);
  if(art){ const u="url('"+art.img+"')";
    c.querySelector(".artbg").style.backgroundImage=u;
    c.querySelector(".artfg").style.backgroundImage=u;
    c.querySelector(".meta").textContent=artMeta(art);
    c.querySelector(".tagline").textContent=artLine(art); }
  const pool = (rar==="SR"||rar==="SSR") ? T().wordsRare : T().words;
  const ch = pool[(Math.random()*pool.length)|0];
  const big=c.querySelector(".big"); big.textContent=ch;
  big.style.fontSize = ch.length<=4 ? "22px" : ch.length<=7 ? "17px" : "13px";  // 小卡缩字
}
function flipOpen(c){
  const gl=c.querySelector(".glyph"); if(gl) gl.style.opacity="0";
  c.querySelector(".flip").classList.add("flipped");
  c.querySelector(".front").classList.add("art-on","sheen");
  setTimeout(()=>{ const b=c.querySelector(".back"); if(b) b.style.visibility="hidden"; },160);
}

// n=3：一张高级混两张低级，位置真随机（选完全亮，给你看错过了什么）
// n=4：rig — 你选哪张都是低级，高级牌在揭示时出现在你隔壁（near-miss）
export function startPick(n, rig){
  S.phase="pick"; touchEl().style.pointerEvents="none";       // 点击直达卡牌
  [...els.stage.children].forEach(c=>c.remove());
  const wrap=document.createElement("div");
  wrap.className="chooseWrap n"+n+" pickWrap";
  const bigRar = Math.random()<0.35?"SSR":"SR";
  const winner = (Math.random()*n)|0;                         // n=3 真随机；n=4 时无人中
  const cards=[];
  for(let i=0;i<n;i++){
    const c=makeCard();
    const rar = (!rig && i===winner) ? bigRar : (Math.random()<0.4?"R":"N");
    c.__rar=rar; c.__art=pickArt(rar);
    c.style.setProperty("--rc", RC[rar]);
    c.classList.add("waiting");
    const h=document.createElement("div"); h.className="ccard"; h.appendChild(c);
    h.onclick=()=>choose(i);
    wrap.appendChild(h); cards.push(c);
  }
  els.stage.appendChild(wrap);
  let done=false;
  function choose(i){
    if(done) return; done=true; tick();
    if(rig==="nearmiss"){                                     // 金卡塞到隔壁：差一点是造出来的
      const nb=(i+(Math.random()<0.5?1:n-1))%n;
      cards[nb].__rar=bigRar; cards[nb].__art=pickArt(bigRar);
    }
    cards.forEach(c=>c.classList.remove("waiting"));
    const mine=cards[i];
    fillFront(mine, mine.__rar, mine.__art); flipOpen(mine);
    const hit = mine.__rar==="SR"||mine.__rar==="SSR";
    if(hit){ flashGo(true); sparkle(14); chord(); } else land(false);
    setTimeout(()=>{ cards.forEach((c,j)=>{ if(j!==i){       // 其余揭示：你错过的那张在发光
      fillFront(c, c.__rar, c.__art); flipOpen(c);
      c.classList.add(c.__rar==="SR"||c.__rar==="SSR" ? "missed-hot" : "missed"); } }); }, 650);
    if(F.score){ const add=hit?80:15; S.score+=add; bumpScore(add); }
    S.actCount++; S.doneActions++; updateGoal();
    const last = S.actCount>=needOf(BEATS[S.beatIdx]);
    if(last && rig){                                          // near-miss 牌留台上：让你盯着隔壁的金卡听揭穿
      setTimeout(()=>{ touchEl().style.pointerEvents=""; enterOutro(); }, 2200);
      return;                                                 // wrap 不删，下一拍 applyBeat 清场
    }
    setTimeout(()=>{
      wrap.style.transition="opacity .5s"; wrap.style.opacity="0";
      setTimeout(()=>{ wrap.remove();
        if(last){ touchEl().style.pointerEvents=""; enterOutro(); }
        else startPick(n, rig);
      },500);
    }, 2000);
  }
}
