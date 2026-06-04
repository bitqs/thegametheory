// 卡面池（容器-内容分层）：两套卡组——画作(№1 的 890 张公共领域 HD) / 游戏(维基封面)
import { S } from "./state.js";
import { getLang } from "./i18n.js";

const POOLS = { art: [], games: [] };
const okImg = x => x.img && /^[\w./-]+$/.test(x.img);   // img 内插 CSS url()，入池单点校验

export async function loadPool(){ try{
  const ms=["met","artic","cleveland","vam"];
  const all=await Promise.all([
    ...ms.map(m=>fetch("/data/museums/"+m+".json").then(r=>r.json()).catch(()=>null)),
    fetch("/data/games.json").then(r=>r.json()).catch(()=>null),
  ]);
  const games=all.pop();
  for(const d of all){ if(d&&d.items) for(const x of d.items){ if(okImg(x)) POOLS.art.push(x); } }
  if(games&&games.items) for(const x of games.items){ if(okImg(x)) POOLS.games.push(x); }
  S.POOL=POOLS.art;
}catch{} }

// 切卡组（games 池为空时静默回退画作池，缺 data 也能玩）
export function setDeck(d){ S.deck = POOLS[d]?.length ? d : "art"; S.POOL = POOLS[S.deck]; }
export function deckSample(d){ const p=POOLS[d]; return p.length?p[(Math.random()*p.length)|0]:null; }
export function hasDeck(d){ return POOLS[d].length>0; }

export function pickArt(rar){ if(!S.POOL.length) return null;
  const want = rar ? S.POOL.filter(x=>x.rarity===rar) : null;
  const list = (want&&want.length)?want:S.POOL; return list[(Math.random()*list.length)|0]; }

export function artMeta(a){ if(!a) return ""; const ti=getLang()==="en"?(a.title||""):(a.title_zh||a.title||"");
  return ti + (a.year?(" · "+a.year):""); }
