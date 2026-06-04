// 启动编排：绑定输入（副作用导入）→ 渲染心力 → 加载画作池 → 语言选择钩子
import "./input.js";
import { renderEnergy } from "./hud.js";
import { loadPool } from "./pool.js";
import { buildLang } from "./lang.js";

renderEnergy();
(async()=>{ await loadPool(); buildLang(); })();

// 调试桥：仅 ?debug 时把内部挂到 window，便于自动化验收（生产无副作用）
if(new URLSearchParams(location.search).has("debug")){
  Promise.all([import("./state.js"),import("./config.js"),import("./input.js"),import("./i18n.js")])
    .then(([st,cf,inp,i18n])=>{ window.GT={S:st.S,F:st.F,G:st.G,BEATS:cf.BEATS,handleGesture:inp.handleGesture,T:i18n.T,getLang:i18n.getLang}; });
}
