// 分享卡 / 邀请卡（内联 canvas，无外部依赖）+ 装饰二维码 + 分享得心力
import { S } from "./state.js";
import { TUNE, RC, RSTARS, EG } from "./config.js";
import { T, getLang } from "./i18n.js";
import { $, dangerOff } from "./dom.js";
import { blip } from "./audio.js";
import { renderEnergy } from "./hud.js";
import { quip } from "./narration.js";

export function roundRect(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r);
  x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
export function wrap(x,t,cx,cy,maxw,lh){ const ch=[...t]; let line="",y=cy;
  for(const c of ch){ if(x.measureText(line+c).width>maxw && line){ x.fillText(line,cx,y); line=c; y+=lh; } else line+=c; }
  if(line) x.fillText(line,cx,y); }

// 装饰二维码（只是个样子，确定性伪随机模块 + 三定位角）
export function drawQR(x, ox, oy, S2, fg="#0b0b12", bg="#ffffff"){
  const n=21, m=S2/n; x.fillStyle=bg; x.fillRect(ox-m,oy-m,S2+2*m,S2+2*m);
  let seed=20260604; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  x.fillStyle=fg; for(let r=0;r<n;r++)for(let c=0;c<n;c++){ if(rnd()<0.5) x.fillRect(ox+c*m,oy+r*m,m+0.6,m+0.6); }
  const finder=(fx,fy)=>{ x.fillStyle=fg; x.fillRect(ox+fx*m,oy+fy*m,7*m,7*m);
    x.fillStyle=bg; x.fillRect(ox+(fx+1)*m,oy+(fy+1)*m,5*m,5*m);
    x.fillStyle=fg; x.fillRect(ox+(fx+2)*m,oy+(fy+2)*m,3*m,3*m); };
  finder(0,0); finder(n-7,0); finder(0,n-7);
}
export function buildInviteCanvas(){
  const cv=$("shareCanvas"), x=cv.getContext("2d"), W=cv.width,H=cv.height, accent="#ffd34d", E=T().energyShare;
  const bg=x.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#1c1530"); bg.addColorStop(1,"#070710");
  x.fillStyle=bg; x.fillRect(0,0,W,H);
  x.strokeStyle=accent+"66"; x.lineWidth=2; roundRect(x,26,26,W-52,H-52,18); x.stroke();
  x.textAlign="center";
  x.fillStyle=accent; x.font="700 18px 'Cinzel',serif"; x.fillText("THE GAME THEORY · №2", W/2, 96);
  x.fillStyle="#ece8f4"; x.font="500 40px 'Noto Serif SC',serif"; x.fillText(E.title, W/2, H*.27);
  const qs=300; drawQR(x, (W-qs)/2, H*.34, qs);
  x.fillStyle="#cfc8e0"; x.font="italic 26px 'Noto Serif SC',serif"; x.fillText(E.scan, W/2, H*.74);
  x.fillStyle=accent; x.font="700 20px 'Cinzel',serif"; x.fillText(E.plus, W/2, H*.80);
  x.fillStyle="#8a84a0"; x.font="500 16px 'Cinzel',serif"; x.fillText("thegametheory.pages.dev", W/2, H-58);
}
export function openShareEnergy(){ buildInviteCanvas(); const E=T().energyShare;
  $("shGain").textContent=E.gain; $("shSkip").textContent=E.skip;
  $("srowMain").hidden=true; $("srowEnergy").hidden=false;
  $("shareTip").textContent=E.tip;
  $("share").classList.add("show"); blip(660,.1,"sine",.12); }
export function closeShareModal(){ $("share").classList.remove("show");
  $("srowMain").hidden=false; $("srowEnergy").hidden=true;
  $("shareTip").textContent=T().share.tip; }
export function grantEnergy(n, msg){ S.energy=Math.min(TUNE.energyMax, S.energy+n); renderEnergy();
  if(S.energy>1) dangerOff(); closeShareModal(); quip(msg); }

export async function drawShare(mode){
  const cv=$("shareCanvas"), x=cv.getContext("2d"), W=cv.width,H=cv.height, SH=T().share;
  const e = S.chosen?T().endings[S.chosen]:null;
  const accent = S.chosen?EG[S.chosen][1]:(RC[S.bestR]||"#ffd34d");
  const bg=x.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#15102a"); bg.addColorStop(1,"#06060d");
  x.fillStyle=bg; x.fillRect(0,0,W,H);
  const sp=x.createRadialGradient(W/2,H*.34,30,W/2,H*.34,W*.9);
  sp.addColorStop(0,accent+"22"); sp.addColorStop(1,"transparent"); x.fillStyle=sp; x.fillRect(0,0,W,H);
  x.strokeStyle=accent+"66"; x.lineWidth=2; roundRect(x,26,26,W-52,H-52,18); x.stroke();
  x.textAlign="center"; x.fillStyle="#cfc8e0";
  x.font="600 22px 'Cinzel',serif"; x.fillText("THE GAME THEORY", W/2, 92);
  x.fillStyle=accent; x.font="700 16px 'Cinzel',serif"; x.fillText(SH.sub, W/2, 120);
  const hero = e?e.char : (S.collected.slice(-1)[0]||"—");
  const heroLong = [...String(hero)].length>4;
  x.fillStyle=accent; x.font=(getLang()==="en"?"600 ":"400 ")+(heroLong?60:104)+"px "+(getLang()==="en"?"'Playfair Display',serif":"'Noto Serif SC',serif");
  x.shadowColor=accent; x.shadowBlur=40; wrap(x,hero,W/2,H*(heroLong?.36:.40),W-130,heroLong?72:130); x.shadowBlur=0;
  x.fillStyle="#ece8f4"; x.font="italic 28px "+(getLang()==="en"?"'Cormorant Garamond',serif":"'Noto Serif SC',serif");
  wrap(x, e? e.card : SH.myline, W/2,H*.57,W-120,40);
  x.font="500 17px 'Cinzel',serif"; x.fillStyle="#9a93b0";
  x.fillText(`${SH.score} ${S.score}    ${SH.level} ${S.level}    ${SH.collected} ${S.collSet.size}${SH.unit}`, W/2, H*.66);
  x.fillStyle=accent; x.font="700 16px 'Cinzel',serif";
  x.fillText(`${SH.best} ${S.bestR} ${"✦".repeat(RSTARS[S.bestR]||1)}`, W/2, H*.70);
  x.fillStyle="rgba(255,255,255,.08)"; roundRect(x,90,H*.74,W-180,10,5); x.fill();
  x.fillStyle=accent; roundRect(x,90,H*.74,(W-180),10,5); x.fill();
  x.fillStyle=accent; x.font="700 14px 'Cinzel',serif"; x.fillText(SH.goalDone, W/2, H*.74+34);
  const qs=150; drawQR(x,(W-qs)/2,H*.79,qs);
  x.fillStyle="#9a93b0"; x.font="500 15px 'Cinzel',serif"; x.fillText(SH.scan, W/2, H*.79+qs+30);
  x.fillStyle="#8a84a0"; x.font="500 15px 'Cinzel',serif"; x.fillText("thegametheory.pages.dev", W/2, H-44);
  $("srowMain").hidden=false; $("srowEnergy").hidden=true;
  $("share").classList.add("show");
}
