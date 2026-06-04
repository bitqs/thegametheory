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
  x.fillStyle=accent; x.font="700 18px 'Cinzel',serif"; x.fillText("THE GAME THEORY", W/2, 96);
  x.fillStyle="#ece8f4"; x.font="500 40px 'Noto Serif SC',serif"; x.fillText(E.title, W/2, H*.27);
  const qs=300; drawQR(x, (W-qs)/2, H*.34, qs);
  x.fillStyle="#cfc8e0"; x.font="italic 26px 'Noto Serif SC',serif"; x.fillText(E.scan, W/2, H*.74);
  x.fillStyle=accent; x.font="700 20px 'Cinzel',serif"; x.fillText(E.plus, W/2, H*.80);
  x.fillStyle="#8a84a0"; x.font="500 16px 'Cinzel',serif"; x.fillText("thegametheory.pages.dev", W/2, H-58);
}
export function openShareEnergy(){                              // 魂系死亡屏（幽默版）→ 分享复活
  const D=T().dead;
  const v=document.createElement("div"); v.className="deadveil";
  const t=document.createElement("div"); t.className="dt"; t.textContent=D.t;
  const s=document.createElement("div"); s.className="ds"; s.textContent=D.sub;
  v.appendChild(t); v.appendChild(s); document.body.appendChild(v);
  requestAnimationFrame(()=>v.classList.add("on"));
  blip(160,.5,"sawtooth",.1);                                   // 低沉一声，魂味
  setTimeout(()=>{ v.classList.remove("on");
    setTimeout(()=>v.remove(),600);
    buildInviteCanvas(); const E=T().energyShare;
    $("shGain").textContent=E.gain; $("shSkip").textContent=E.skip;
    $("srowMain").hidden=true; $("srowEnergy").hidden=false;
    $("shareTip").textContent=E.tip;
    $("share").classList.add("show"); blip(660,.1,"sine",.12);
  }, 2300); }
export function closeShareModal(){ $("share").classList.remove("show");
  $("srowMain").hidden=false; $("srowEnergy").hidden=true;
  $("shareTip").textContent=T().share.tip; }
export function grantEnergy(n, msg){ S.energy=Math.min(TUNE.energyMax, S.energy+n); renderEnergy();
  if(S.energy>1) dangerOff(); closeShareModal(); quip(msg); }

// 分享图 blob 缓存：画完即备好——保存点击时同步调 navigator.share，
// 留在用户手势调用栈内（iOS 对异步 toBlob 后再 share 会拒）
let shareBlob=null;
function cacheBlob(){ shareBlob=null;
  $("shareCanvas").toBlob(b=>{ shareBlob=b; },"image/png"); }
export async function saveShareImage(){
  if(shareBlob && navigator.canShare){
    const file=new File([shareBlob],"the-game-theory.png",{type:"image/png"});
    if(navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file]}); return; }catch(e){ if(e.name==="AbortError") return; }
    }
  }
  const url=shareBlob?URL.createObjectURL(shareBlob):$("shareCanvas").toDataURL("image/png");
  const a=document.createElement("a"); a.download="the-game-theory.png"; a.href=url; a.click();
  if(shareBlob) setTimeout(()=>URL.revokeObjectURL(url),2000);
}

// 字距排印（canvas 无 letter-spacing，逐字铺）
function spaced(x, t, cx, y, ls){ const ch=[...t];
  const ws=ch.map(c=>x.measureText(c).width); const total=ws.reduce((a,b)=>a+b,0)+ls*(ch.length-1);
  let cur=cx-total/2; const ta=x.textAlign; x.textAlign="left";
  ch.forEach((c,i)=>{ x.fillText(c,cur,y); cur+=ws[i]+ls; }); x.textAlign=ta; }
function hair(x, x1, x2, y, color){ x.strokeStyle=color; x.lineWidth=1;
  x.beginPath(); x.moveTo(x1,y); x.lineTo(x2,y); x.stroke(); }

export async function drawShare(mode){
  const cv=$("shareCanvas"), x=cv.getContext("2d"), W=cv.width,H=cv.height, SH=T().share;
  const isYou = mode==="you";                                   // 《？》卡分享图：终幕专用
  const e = (!isYou && S.chosen)?T().endings[S.chosen]:null;
  const accent = isYou?"#ffd34d":(S.chosen?EG[S.chosen][1]:(RC[S.bestR]||"#ffd34d"));
  const ink="#ece8f4", dim="#9a93b0", faint="#6f6a85";
  // 底：深空渐变 + 主色辉光 + 暗角
  const bg=x.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#171130"); bg.addColorStop(.55,"#0a0816"); bg.addColorStop(1,"#06060d");
  x.fillStyle=bg; x.fillRect(0,0,W,H);
  const sp=x.createRadialGradient(W/2,H*.36,30,W/2,H*.36,W*.85);
  sp.addColorStop(0,accent+"1e"); sp.addColorStop(1,"transparent"); x.fillStyle=sp; x.fillRect(0,0,W,H);
  // 双线细框（外 1px 淡，内 1px 主色）
  x.strokeStyle="rgba(255,255,255,.10)"; x.lineWidth=1; roundRect(x,22,22,W-44,H-44,16); x.stroke();
  x.strokeStyle=accent+"55"; roundRect(x,32,32,W-64,H-64,12); x.stroke();
  x.textAlign="center";
  // 版头：字距大写 + 两侧细线 + 副题
  x.fillStyle=ink; x.font="600 19px 'Cinzel',serif"; spaced(x,"THE GAME THEORY",W/2,96,7);
  hair(x,70,W/2-150,89,"rgba(255,255,255,.14)"); hair(x,W/2+150,W-70,89,"rgba(255,255,255,.14)");
  x.fillStyle=accent; x.font="italic 15px 'Cormorant Garamond','Noto Serif SC',serif"; x.fillText(SH.sub, W/2, 124);
  // 主字：细双圆环内
  const cy=H*.335, R=118;
  x.strokeStyle=accent+"77"; x.lineWidth=1; x.beginPath(); x.arc(W/2,cy,R,0,7); x.stroke();
  x.strokeStyle=accent+"33"; x.beginPath(); x.arc(W/2,cy,R+8,0,7); x.stroke();
  const hero = isYou ? "?" : (e?e.char : (S.collected.slice(-1)[0]||"—"));   // 分享图主字=问号（台上那张仍是"你"）
  const heroLong = [...String(hero)].length>4;
  x.fillStyle=accent;
  if(isYou) x.font="600 112px 'Playfair Display','Cormorant Garamond',serif";  // 正体衬线问号，不歪
  else x.font=(getLang()==="en"?"600 ":"400 ")+(heroLong?44:96)+"px "+(getLang()==="en"?"'Playfair Display',serif":"'Noto Serif SC',serif");
  x.shadowColor=accent; x.shadowBlur=34;
  if(heroLong) wrap(x,hero,W/2,cy-10,R*1.5,52); else x.fillText(hero,W/2,cy+(isYou?38:34));
  x.shadowBlur=0;
  // 引言（you 模式：SSS·《你》·限量 1/1 + 一句）
  x.fillStyle=ink; x.font="italic 25px "+(getLang()==="en"?"'Cormorant Garamond',serif":"'Noto Serif SC',serif");
  if(isYou){ const F=T().finale;
    x.fillText(F.youLine, W/2, H*.545);
    x.fillStyle=accent; x.font="700 14px 'Cinzel','Noto Serif SC',serif";
    x.fillText("SSS · "+F.youMeta+" · "+F.youSerial, W/2, H*.585);
  } else wrap(x, e? e.card : SH.myline, W/2, H*.555, W-140, 38);
  // 三栏数据：大数字 + 小标签，栏间细竖线
  const sy=H*.645, cols=[[SH.score,S.score],[SH.level,S.level],[SH.collected,S.collSet.size+(SH.unit||"")]];
  cols.forEach((c,i)=>{ const cx=W*(0.25+0.25*i);
    x.fillStyle=ink; x.font="600 34px 'Cinzel','Noto Serif SC',serif"; x.fillText(String(c[1]),cx,sy);
    x.fillStyle=faint; x.font="500 11px 'Cinzel','Noto Serif SC',serif"; spaced(x,String(c[0]).toUpperCase(),cx,sy+24,3); });
  x.strokeStyle="rgba(255,255,255,.12)";
  [W*.375,W*.625].forEach(lx=>{ x.beginPath(); x.moveTo(lx,sy-34); x.lineTo(lx,sy+26); x.stroke(); });
  // 最高稀有度：细线胶囊徽章
  const bt=`${SH.best} ${S.bestR} ${"✦".repeat(RSTARS[S.bestR]||1)}`;
  x.font="700 14px 'Cinzel',serif"; const bw=x.measureText(bt).width+44;
  x.strokeStyle=accent+"88"; x.lineWidth=1; roundRect(x,(W-bw)/2,H*.705,bw,34,17); x.stroke();
  x.fillStyle=accent; x.fillText(bt, W/2, H*.705+23);
  // 进度：细条 + 端点标记
  const py=H*.755, pw=W-200;
  x.fillStyle="rgba(255,255,255,.08)"; roundRect(x,100,py,pw,6,3); x.fill();
  x.fillStyle=accent; roundRect(x,100,py,pw,6,3); x.fill();
  x.font="700 12px 'Cinzel',serif"; x.fillStyle=accent; x.fillText(SH.goalDone, W/2, py+26);
  // 底部：QR + 扫码语 + 域名
  const qs=110; drawQR(x,(W-qs)/2,H*.805,qs);
  x.fillStyle=dim; x.font="500 13px 'Cinzel','Noto Serif SC',serif"; x.fillText(SH.scan, W/2, H*.805+qs+24);
  x.fillStyle=faint; x.font="500 12px 'Cinzel',serif"; spaced(x,"thegametheory.pages.dev",W/2,H-34,2);
  $("srowMain").hidden=false; $("srowEnergy").hidden=true;
  $("share").classList.add("show");
  cacheBlob();                                                  // 画完即缓存，保存按钮同步可用
}
