// 卡面池（容器-内容分层）：两套卡组——画作(№1 的 890 张公共领域 HD) / 游戏(维基封面)
import { S } from "./state.js";
import { getLang } from "./i18n.js";

const POOLS = { art: [], games: [] };
const okImg = x => x.img && /^[\w./-]+$/.test(x.img);   // img 内插 CSS url()，入池单点校验

export async function loadPool(onStep){ try{
  const ms=["met","artic","cleveland","vam"];
  const step=r=>{ onStep&&onStep(); return r; };
  const all=await Promise.all([
    ...ms.map(m=>fetch("/data/museums/"+m+".json").then(r=>r.json()).then(step).catch(()=>step(null))),
    fetch("/data/games.json").then(r=>r.json()).then(step).catch(()=>step(null)),
  ]);
  const games=all.pop();
  for(const d of all){ if(d&&d.items) for(const x of d.items){ if(okImg(x)) POOLS.art.push(x); } }
  if(games&&games.items) for(const x of games.items){ if(okImg(x)) POOLS.games.push(x); }
  S.POOL=POOLS.art;
}catch{} }

// 预载并解码一张卡面图；失败/超时不挡流程
export function warm(art, timeout=2500){
  if(!art) return Promise.resolve();
  const im=new Image(); im.src=art.img;
  const dec=im.decode ? im.decode().catch(()=>{}) : Promise.resolve();
  return Promise.race([dec, new Promise(r=>setTimeout(r,timeout))]);
}

// 切卡组（games 池为空时静默回退画作池，缺 data 也能玩）
export function setDeck(d){ S.deck = POOLS[d]?.length ? d : "art"; S.POOL = POOLS[S.deck]; }
export function deckSample(d){ const p=POOLS[d]; return p.length?p[(Math.random()*p.length)|0]:null; }
export function hasDeck(d){ return POOLS[d].length>0; }

export function pickArt(rar){ if(!S.POOL.length) return null;
  const want = rar ? S.POOL.filter(x=>x.rarity===rar) : null;
  const list = (want&&want.length)?want:S.POOL; return list[(Math.random()*list.length)|0]; }

export function artMeta(a){ if(!a) return ""; const en=getLang()==="en";
  const ti=en?(a.title||""):(a.title_zh||a.title||"");
  const ge=en?(a.genre||""):(a.genre_zh||a.genre||"");
  return ti + (a.year?(" · "+a.year):"") + (ge?(" · "+ge):""); }
// 一句话简介：游戏卡组用 line，画作卡组复用 AI 题词 cardline
export function artLine(a){ if(!a) return ""; const en=getLang()==="en";
  return en?(a.line||a.cardline||""):(a.line_zh||a.cardline_zh||""); }
