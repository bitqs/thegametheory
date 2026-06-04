// 卡片：渲染 / 抽牌(上滑换牌) / 翻牌(自动或手翻) / 翻牌 VFX / 上滑退场
import { S, F } from "./state.js";
import { BEATS, TUNE, RC, RSTARS, RANK } from "./config.js";
import { T } from "./i18n.js";
import { rollRarity } from "./rarity.js";
import { pickArt, artMeta, artLine, warm } from "./pool.js";
import { land, chord, tick, riser, lvlSnd } from "./audio.js";
import { els, sparkle, flashGo, dangerOn, dangerOff } from "./dom.js";
import { bumpScore, renderLevel, renderEnergy, updateGoal } from "./hud.js";
import { quip } from "./narration.js";
import { enterOutro } from "./flow.js";
import { openShareEnergy } from "./share.js";

export function needOf(b){ return b.need; }

// beat → 优先掉落的原则（牌面与正在装的机制呼应）；中英 t 名都列
const BEATMATCH = {
  sound:["音效","即时反馈","SOUND","FEEDBACK"],
  random:["可变奖励","开箱","VARIABLE REWARD","LOOT BOX"],
  rarity:["稀有度","稀缺","RARITY","SCARCITY"],
  bar:["进度条","禀赋进度","PROGRESS BAR","ENDOWED PROGRESS"],
  score:["分数","暴击","POINTS","CRIT"],
  level:["升级","里程碑","LEVELS","MILESTONE"],
  collect:["收集欲","成就","彩蛋","COLLECTION","ACHIEVEMENT","EASTER EGG"],
  energy:["体力","每日任务","签到","ENERGY","DAILY QUEST","CHECK-IN"],
  pick3:["保底","新手运","PITY TIMER","BEGINNER'S LUCK"],
  story:["好奇缺口","彩蛋","CURIOSITY GAP","EASTER EGG"],
  juice:["音效","暴击","皮肤","SOUND","CRIT","SKINS"],
  boss:["技能幻觉","心流","SKILL ILLUSION","FLOW"],
  pick4:["差一点","损失厌恶","NEAR-MISS","LOSS AVERSION"],
  goalreveal:["沉没成本","峰终定律","进度条","SUNK COST","PEAK-END RULE","PROGRESS BAR"],
};
// 抽设计原则：先掉当前 beat 呼应的（未用过的），否则全池去重；耗尽重洗
export function drawPrinciple(big2){
  const pool = big2 ? T().wordsRare : T().words;
  const used = big2 ? S.usedWR : S.usedW;
  const match = BEATMATCH[BEATS[S.beatIdx]?.on[0]] || [];
  let avail = pool.filter(x=>!used.has(x.t) && match.includes(x.t));
  if(!avail.length) avail = pool.filter(x=>!used.has(x.t));
  if(!avail.length){ used.clear(); avail=pool; }
  const ch = avail[(Math.random()*avail.length)|0]; used.add(ch.t); return ch;
}

export function makeCard(){
  const c=document.createElement("div"); c.className="card";
  c.innerHTML=`<div class="flip">
    <div class="face back"><div class="bpat"></div><div class="bring"></div><div class="glyph">❖</div><div class="uphint"></div></div>
    <div class="face front">
      <div class="crown"><span class="rt"></span><span class="stars"></span></div>
      <div class="artwin"><div class="artbg"></div><div class="artfg"></div><div class="artgrad"></div></div>
      <div class="frame"></div>
      <span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span>
      <div class="plate"><div class="meta"></div><div class="tagline"></div><div class="divider"></div><div class="big"></div><div class="pline"></div><div class="poem"></div></div>
      <div class="serial"><span class="sn"></span><span class="ed">MMXXVI</span></div><div class="foil"></div><div class="ring"></div><div class="holo"></div>
    </div>
  </div>`;
  return c;
}
export function hintWord(g){ return T().backhint[g]||""; }

// 出一张牌背：此刻预掷稀有度——SR/SSR 背面分档发光等手翻，低档稍后自动翻
export function spawnBack(){
  const c=makeCard(); els.stage.appendChild(c); S.card=c;
  let rar=null, isHit=false;
  if(F.rarity){ rar=rollRarity(); isHit = rar!=="N"; }
  else if(F.random){ isHit = Math.random()<0.30; }
  c.__rar=rar; c.__isHit=isHit;
  c.__art=pickArt(rar);                                 // 出牌时即定画面并预解码，翻开零白图
  c.__ready=warm(c.__art);
  const wait = rar==="SR"||rar==="SSR";                 // 高级牌：留背等手翻（蓄力感=中奖预期）
  if(rar) c.style.setProperty("--rc",RC[rar]);
  const uphint=c.querySelector(".back .uphint");
  // 故事拍：牌背露下一句诗的开头（好奇缺口——知道一半最痒）
  if(F.story && !wait){ const pm=T().poem, nx=pm[S.storyIdx%pm.length];
    uphint.textContent="「"+[...nx].slice(0,4).join("")+"……」"; }
  else uphint.textContent = wait ? hintWord("tap") : "";
  if(wait){ c.classList.add(rar==="SSR"?"wait-ssr":"wait-sr"); if(rar==="SSR"&&F.sound) riser(700); }
  requestAnimationFrame(()=>c.classList.add("in"));
  // 低档自动翻（等图解码完成才翻，慢网不闪白图）；SR/SSR 留背等手翻
  if(!wait) c.__auto=setTimeout(()=>{ c.__ready.then(()=>{ if(S.card===c) flipCard("auto"); }); }, 520);
}

// 上滑换牌（主交互）：仅翻开的牌可换——面朝下的先翻（自动或手翻）
export function swapCard(){
  if(S.busy) return false;
  if(S.card){ quip(hintWord("tap")); return false; }                     // 未翻不能换：提示点牌
  if(!S.shown){ spawnBack(); return true; }                              // 台上空了：直接出牌
  if(F.energy){ if(S.energy<=0){ openShareEnergy(); return false; }
    S.energy--; renderEnergy();
    if(S.energy<=1) dangerOn(); else dangerOff(); }
  const c=S.shown;
  S.shown=null; S.busy=true;
  if(F.sound) tick();
  exitUp(c, ()=>{ spawnBack(); S.busy=false; });
  return true;
}

// 翻开当前面朝下的牌（auto=自动 / tap=手翻）
export function flipCard(type){
  if(S.busy) return false;
  if(!S.card) return false;
  const now=Date.now(); const dt=now-S.lastAct; S.lastAct=now;
  S.busy=true; S.actCount++; S.doneActions++;
  const cur=S.card; S.card=null; clearTimeout(cur.__auto);
  cur.classList.remove("wait-sr","wait-ssr");
  const front=cur.querySelector(".front"), big=cur.querySelector(".big");
  cur.querySelector(".back .uphint").textContent="";

  const rar=cur.__rar, isHit=cur.__isHit;
  const big2 = rar==="SR"||rar==="SSR";
  if(rar){ cur.dataset.r=rar;
    cur.querySelector(".crown .rt").textContent=rar+" · "+T().rlabel[rar];
    cur.querySelector(".crown .stars").textContent="✦".repeat(RSTARS[rar]);
    if(RANK[rar]>RANK[S.bestR]) S.bestR=rar;
  } else cur.style.setProperty("--rc","#9aa3b2");
  const art=cur.__art||pickArt(rar); cur.__art=art;
  if(art){ const u="url('"+art.img+"')"; cur.querySelector(".artbg").style.backgroundImage=u; cur.querySelector(".artfg").style.backgroundImage=u;
    if(rar && rar===S.bestR) S.bestArt=art; }   // 记最高档画作，给战绩卡当主视觉
  // 牌面=游戏设计原则+一句招供；稀有牌掉深层原则。收藏=集齐设计原则（同局不重复）
  const ch = drawPrinciple(big2); big.textContent=ch.t; S.collected.push(ch.t);
  cur.querySelector(".pline").textContent=ch.s;
  big.style.fontSize = ch.t.length<=5 ? "30px" : ch.t.length<=8 ? "24px" : "19px";
  const fresh=!S.collSet.has(ch.t); S.collSet.add(ch.t);
  if(F.collect){ document.getElementById("cCollect").querySelector("b").textContent=S.collSet.size;
    if(fresh && S.collSet.size%5===0){ setTimeout(()=>{ flashGo(true); chord(); quip(T().milestone(S.collSet.size)); },300); } }
  if(F.story){ const pm=T().poem; cur.querySelector(".poem").textContent=pm[S.storyIdx%pm.length]; S.storyIdx++; }
  cur.querySelector(".serial .sn").textContent="No."+String(S.collected.length).padStart(4,"0");  // 每张牌序列号
  const last = S.actCount>=needOf(BEATS[S.beatIdx]);

  const doReveal=()=>{
    const gl=cur.querySelector(".glyph"); if(gl) gl.style.opacity="0";   // 背面图案瞬间消失（不延迟）
    cur.querySelector(".flip").classList.add("flipped");
    cur.classList.add("flippop");                                        // 翻牌弹跳特效
    setTimeout(()=>{ const b=cur.querySelector(".back"); if(b) b.style.visibility="hidden"; },150);
    // 卡面装饰翻面后才显（错峰升起）：精致度随机制累积
    front.classList.add("art-on");
    if(cur.__art){ cur.querySelector(".meta").textContent=artMeta(cur.__art);
      cur.querySelector(".tagline").textContent=artLine(cur.__art); }
    if(rar) cur.classList.add("r-on");
    if(F.score) cur.classList.add("s-frame");
    if(F.story){ cur.classList.add("s-divider","s-backorn"); front.classList.add("story"); }
    if(F.juice) cur.classList.add("s-corners","s-foil");
    front.classList.add("sheen");                                        // 光扫 + 揭示光环（始终）
    setTimeout(()=>cur.classList.add("float"), 480);
    // 反馈分层：稀有度越高越炸
    if(F.sound) land(big2);
    if(isHit){ flashGo(big2); sparkle(rar==="SSR"?18:rar==="SR"?12:rar==="R"?8:(F.juice?8:6)); if(big2&&F.sound) chord(); }
    if(rar==="SSR" && !S.firstSSR){ S.firstSSR=true;            // 首张传世：单独的里程碑喜报
      setTimeout(()=>{ flashGo(true); quip(T().firstSSR); },650); }
    if(F.score){ const add=TUNE.scoreMin+((Math.random()*(TUNE.scoreMax-TUNE.scoreMin))|0)+(big2?60:0);
      S.score+=add; bumpScore(add); }
    if(F.level){ let gg=TUNE.xpBase + (dt<TUNE.fastMs?TUNE.xpFast:0) + (big2?6:0); S.xp+=gg;
      const need=TUNE.lvlBase+(S.level-1)*TUNE.lvlStep;
      if(S.xp>=need){ S.xp-=need; S.level++; renderLevel(true); lvlSnd(); flashGo(false);} else renderLevel(false); }
    updateGoal();
    S.shown=cur; S.busy=false;
    if(last) enterOutro();                              // 翻完留场上，上滑进下一拍/换牌
  };

  if(F.sound && type!=="auto") tick();
  requestAnimationFrame(()=>requestAnimationFrame(doReveal));
  return true;
}
// 所有牌统一：向上滑动隐去，移除后再回调出下一张（避免两张同时占位导致居中跳动）
export function exitUp(c, cb){ if(!c){ cb&&cb(); return; } c.classList.remove("float");
  c.style.transition="transform .45s cubic-bezier(.4,0,.2,1),opacity .4s";
  c.style.transform="translateY(-135%)"; c.style.opacity="0";
  setTimeout(()=>{ c.remove(); cb&&cb(); },460); }
