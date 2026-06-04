// 启动编排：绑定输入（副作用导入）→ 渲染心力 → 加载画作池(带进度) → 语言选择钩子
import "./input.js";
import { renderEnergy } from "./hud.js";
import { loadPool, warm, deckSample } from "./pool.js";
import { buildLang } from "./lang.js";

renderEnergy();
(async()=>{
  const fill=document.getElementById("bootFill");
  let done=0; const TOTAL=9;                                // 5 json + 4 预热图
  const tick=()=>{ done++; fill.style.width=Math.round(done/TOTAL*100)+"%"; };
  await loadPool(tick);
  // 预热语言/卡组选择会用到的卡面，开屏即清晰
  await Promise.all([0,1,2,3].map(i=>warm(deckSample(i%2?"games":"art")).then(tick)));
  fill.style.width="100%";
  setTimeout(()=>{ document.getElementById("boot").classList.add("off"); buildLang(); },250);
})();

// 调试桥：仅 ?debug 时把内部挂到 window，便于自动化验收（生产无副作用）
if(new URLSearchParams(location.search).has("debug")){
  Promise.all([import("./state.js"),import("./config.js"),import("./input.js"),import("./i18n.js")])
    .then(([st,cf,inp,i18n])=>{ window.GT={S:st.S,F:st.F,G:st.G,BEATS:cf.BEATS,handleGesture:inp.handleGesture,T:i18n.T,getLang:i18n.getLang}; });
}
