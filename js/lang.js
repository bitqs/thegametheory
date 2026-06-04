// 语言选择（开局钩子：两张 SSR 牌背 → 点一张翻面放大 → 拆穿"选择"幻觉）
import { S } from "./state.js";
import { I18N, T, setLang } from "./i18n.js";
import { $ } from "./dom.js";
import { pickCards } from "./chooser.js";
import { pickArt } from "./pool.js";
import { actx, startBgm } from "./audio.js";
import { showInsight, hideInsight } from "./narration.js";
import { applyBeat } from "./flow.js";

export function setUILang(){ const t=T();
  $("cScore").childNodes[0].textContent=t.chips.score+" ";
  $("cLevel").childNodes[0].textContent=t.chips.level+" ";
  $("cCollect").childNodes[0].textContent=t.chips.collect+" ";
  $("cEnergy").childNodes[0].textContent=t.chips.energy+" ";
  $("goalName").textContent=t.goalName;
  $("endShare").textContent=t.endShare; $("endAgain").textContent=t.endAgain;
  $("dl").textContent=t.share.save; $("closeShare").textContent=t.share.close;
  $("shareTip").textContent=t.share.tip;
  $("choice").querySelector(".q").textContent=t.choiceQ;
  const opts=$("choice").querySelectorAll(".opt");
  t.choiceOpts.forEach((o,i)=>{ if(opts[i]) opts[i].innerHTML=`<span class="g">${o.g}</span> ${o.t}`; });
}
const CODES=["zh","en"];
export function buildLang(){ S.phase="lang"; const wrap=$("langcards"); wrap.innerHTML="";
  pickCards({
    items: CODES.map(code=>({ crown:"LANGUAGE", stars:4, title:I18N[code].label,
      sub:I18N[code].sub, serial:"THE GAME THEORY", art:pickArt("SSR"), rarity:"SSR",
      hint:I18N[code].label })),
    mount: wrap,
    onPick: idx=>chooseLang(CODES[idx]),
  });
  $("lang").classList.add("show"); }
function chooseLang(code){ if(S.phase!=="lang") return; S.phase="langpick"; setLang(code);
  actx(); startBgm(); setUILang();
  $("lang").classList.remove("show"); openingHook(); }
function openingHook(){ const h=T().openHook;
  showInsight(h[0]);
  setTimeout(()=>showInsight(h[1]),2100);
  setTimeout(()=>{ hideInsight(); S.beatIdx=0; applyBeat(); },4200); }
