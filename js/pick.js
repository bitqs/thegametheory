// 选牌 beat：三选一(真随机，选完亮出全部) / 四选一(near-miss 操纵：金卡永远在你隔壁)
import { S, F } from "./state.js";
import { BEATS, RC, RSTARS } from "./config.js";
import { T } from "./i18n.js";
import { makeCard, needOf, drawPrinciple, bigSize } from "./cards.js";
import { pickArt, artMeta, artLine, warm } from "./pool.js";
import { els, sparkle, flashGo } from "./dom.js";
import { land, chord, tick } from "./audio.js";
import { bumpScore, updateGoal } from "./hud.js";
import { enterOutro } from "./flow.js";

const touchEl = () => document.getElementById("touchlayer");

// 选中牌放大居中鉴赏；keepOthers=near-miss 模式（隔壁金卡留场作证，只压暗微缩）
function zoomChosen(wrap, i, keepOthers){
  [...wrap.children].forEach(h=>h.style.animation="none");   // cardin 动画 fill:both 会压过 inline transform，先摘掉
  [...wrap.children].forEach((h,j)=>{ if(j===i) return;
    h.style.transition="opacity .5s,transform .5s"; h.style.pointerEvents="none";
    if(keepOthers){ h.style.opacity=".55"; h.style.transform="scale(.86)"; }
    else { h.style.opacity="0"; h.style.transform="scale(.92)"; } });
  const holder=wrap.children[i], r=holder.getBoundingClientRect(), st=els.stage.getBoundingClientRect();
  const sc=Math.min(keepOthers?1.5:2.1, (st.width*0.62)/r.width);
  const dx=(st.left+st.width/2)-(r.left+r.width/2), dy=(st.top+st.height/2)-(r.top+r.height/2);
  holder.style.zIndex="5";
  holder.style.transition="transform .7s cubic-bezier(.2,.8,.2,1)";
  holder.style.transform=`translate(${dx}px,${dy}px) scale(${sc})`;
}

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
  const ch = drawPrinciple(rar==="SR"||rar==="SSR");
  const big=c.querySelector(".big"); big.textContent=ch.t; big.style.fontSize=bigSize(ch.t);
  c.querySelector(".pline").textContent=ch.s;
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
    c.classList.add("waiting");                             // 盲选期不上稀有度色（中性灰呼吸，翻开才见档）
    const h=document.createElement("div"); h.className="ccard"; h.appendChild(c);
    h.onclick=()=>choose(i);
    wrap.appendChild(h); cards.push(c);
  }
  // 整轮图先解码完再上桌（避免翻开白图）
  Promise.all(cards.map(c=>warm(c.__art))).then(()=>els.stage.appendChild(wrap));
  let done=false;
  function choose(i){
    if(done) return; done=true; tick();
    if(rig==="nearmiss"){                                     // 金卡塞到隔壁：差一点是造出来的
      const nb=(i+(Math.random()<0.5?1:n-1))%n;
      cards[nb].__rar=bigRar; cards[nb].__art=pickArt(bigRar);
    }
    cards.forEach(c=>c.classList.remove("waiting"));
    const mine=cards[i];
    const holder=wrap.children[i]; holder.classList.add("chosen");   // 选中卡：描边+标签，与隔壁金卡区分
    holder.dataset.label=T().yourPick;
    fillFront(mine, mine.__rar, mine.__art); flipOpen(mine);
    const hit = mine.__rar==="SR"||mine.__rar==="SSR";
    if(hit){ const pc=RC[mine.__rar]; flashGo(true,pc); sparkle(14,pc); chord(); } else land(false);
    setTimeout(()=>{ cards.forEach((c,j)=>{ if(j!==i){       // 其余揭示：你错过的那张在发光
      fillFront(c, c.__rar, c.__art); flipOpen(c);
      c.classList.add(c.__rar==="SR"||c.__rar==="SSR" ? "missed-hot" : "missed"); } }); }, 650);
    if(F.score){ const add=hit?80000:15000; S.score+=add; bumpScore(add); }
    S.actCount++; S.doneActions++; updateGoal();
    const last = S.actCount>=needOf(BEATS[S.beatIdx]);
    // 全亮后停留品味（near-miss 多看一眼隔壁的金）→ 选中牌放大居中，其余隐去
    const zoomAt = rig ? 2400 : 1900;
    setTimeout(()=>zoomChosen(wrap, i, !!rig), zoomAt);   // near-miss 不全隐：揭穿词要指着隔壁的金卡
    if(last){                                                 // 最后一轮放大的牌留台上陪洞见（空屏听揭穿=没画面感）
      setTimeout(()=>{ touchEl().style.pointerEvents=""; enterOutro(); }, zoomAt+1100);
      return;                                                 // wrap 不删，下一拍 applyBeat 清场
    }
    setTimeout(()=>{
      wrap.style.transition="opacity .5s"; wrap.style.opacity="0";
      setTimeout(()=>{ wrap.remove(); startPick(n, rig); },500);
    }, zoomAt+1300);
  }
}
