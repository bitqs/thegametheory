// 复用 №1 的 890 张 HD 公共领域画作做卡面（容器-内容分层）
import { S } from "./state.js";
import { getLang } from "./i18n.js";

export async function loadPool(){ try{
  const ms=["met","artic","cleveland","vam"];
  const all=await Promise.all(ms.map(m=>fetch("/data/museums/"+m+".json").then(r=>r.json()).catch(()=>null)));
  // img 只收安全相对路径（后续会内插进 CSS url()，单点校验防注入）
  for(const d of all){ if(d&&d.items) for(const x of d.items){ if(x.img && /^[\w./-]+$/.test(x.img)) S.POOL.push(x); } }
}catch{} }

export function pickArt(rar){ if(!S.POOL.length) return null;
  const want = rar ? S.POOL.filter(x=>x.rarity===rar) : null;
  const list = (want&&want.length)?want:S.POOL; return list[(Math.random()*list.length)|0]; }

export function artMeta(a){ if(!a) return ""; const ti=getLang()==="en"?(a.title||""):(a.title_zh||a.title||"");
  return ti + (a.year?(" · "+a.year):""); }
