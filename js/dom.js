// DOM 助手 + 元素缓存 + 视觉特效（闪光/粒子/泛红）
export const $ = id => document.getElementById(id);
export const rand = a => a[(Math.random()*a.length)|0];

// 元素缓存（模块脚本 defer，DOM 已就绪）
export const els = {
  app:$("app"), stage:$("stage"), say:$("say"), insight:$("insight"),
  hint:$("hint"), top:$("top"),
};

export function flashGo(big){
  const f=$("flash"); f.style.setProperty("--bc",big?"#ffd34d":"#ffffff");
  f.style.setProperty("--int",big?.55:.28); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
}
export function flashWhite(){                              // 全屏闪白（开场转场用，比 flashGo 强）
  const f=$("flash"); f.style.setProperty("--bc","#ffffff");
  f.style.setProperty("--int",.95); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
}
export function sparkle(n=14){
  for(let i=0;i<n;i++){ const s=document.createElement("i"); s.className="burstdot";
    const a=(i/n)*Math.PI*2+Math.random()*.4, d=110+Math.random()*180;
    s.style.setProperty("--tx",(Math.cos(a)*d|0)+"px"); s.style.setProperty("--ty",(Math.sin(a)*d|0)+"px");
    document.body.appendChild(s); setTimeout(()=>s.remove(),900); }
}
export function dangerOn(){ $("danger").classList.add("on"); }
export function dangerOff(){ $("danger").classList.remove("on"); }
