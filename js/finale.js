// 终幕：最终 boss=全黑牌缓缓放大（黑屏即镜面，反射出你自己）→
// 奖励揭晓=更好的你 → 玩笑一翻：SSS 级游戏《你》（彩虹 holo，特别好看）→ 分享卡
import { S } from "./state.js";
import { T } from "./i18n.js";
import { els, sparkle, flashGo, touchLock } from "./dom.js";
import { chord, riser, land } from "./audio.js";
import { showInsight, hideInsight, clearSay } from "./narration.js";
import { drawShare } from "./share.js";


// "玻璃表面"全屏层：把焦点从画面纵深拉回屏幕玻璃这一层（雾/水珠/指印贴在玻璃上，
// 大脑只能理解为表面附着物 → 焦点回表面 → 反射里的自己显形）。中心留净，边缘加重。
function buildGlass(){
  const cv=document.createElement("canvas"); cv.id="mfx"; cv.className="mfx";
  const W=cv.width=innerWidth*2, H=cv.height=innerHeight*2;       // 2x 防糊
  const x=cv.getContext("2d"); const cx=W/2, cy=H/2, R=Math.min(W,H);
  const edge=(px,py)=>{ const d=Math.hypot(px-cx,py-cy)/(R*.72); return Math.max(0,Math.min(1,d-.30)); };
  let seed=7; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
  // 雾斑：越靠边越浓（向心爬入感靠 CSS 缩放动画）
  for(let i=0;i<150;i++){ const px=rnd()*W, py=rnd()*H, e=edge(px,py); if(e<=0) continue;
    const r=40+rnd()*150, g=x.createRadialGradient(px,py,0,px,py,r);
    g.addColorStop(0,`rgba(205,215,228,${(.018+rnd()*.03)*e})`); g.addColorStop(1,"transparent");
    x.fillStyle=g; x.beginPath(); x.arc(px,py,r,0,7); x.fill(); }
  // 凝结水珠：高光点+暗底，只可能"贴在玻璃上"
  for(let i=0;i<110;i++){ const px=rnd()*W, py=rnd()*H, e=edge(px,py); if(e<.15) continue;
    const r=(2+rnd()*7)*(.6+e);
    x.fillStyle=`rgba(0,0,0,${.22*e})`; x.beginPath(); x.arc(px,py+r*.25,r,0,7); x.fill();
    x.fillStyle=`rgba(225,235,248,${.5*e})`; x.beginPath(); x.arc(px-r*.3,py-r*.32,r*.34,0,7); x.fill(); }
  // 指印油污：两枚淡椭圆同心纹
  for(let k=0;k<2;k++){ const px=W*(k?(.82+rnd()*.1):(.08+rnd()*.1)), py=H*(.15+rnd()*.6);
    x.save(); x.translate(px,py); x.rotate(rnd()*2);
    for(let j=0;j<6;j++){ x.strokeStyle=`rgba(220,228,240,${.05-j*.006})`; x.lineWidth=2.4;
      x.beginPath(); x.ellipse(0,0,16+j*7,24+j*9,0,0,7); x.stroke(); } x.restore(); }
  // 斜向眩光带：宣告"这是一块会反光的玻璃"
  const gl=x.createLinearGradient(0,H*.2,W,H*.8);
  gl.addColorStop(.42,"transparent"); gl.addColorStop(.5,"rgba(235,240,250,.05)"); gl.addColorStop(.58,"transparent");
  x.fillStyle=gl; x.fillRect(0,0,W,H);
  // 暗角：漏斗收注意力 + 压边缘发光让反射更显
  const vg=x.createRadialGradient(cx,cy,R*.22,cx,cy,R*.78);
  vg.addColorStop(0,"transparent"); vg.addColorStop(1,"rgba(0,0,0,.82)");
  x.fillStyle=vg; x.fillRect(0,0,W,H);
  return cv;
}

export function startFinale(){
  S.phase="finale"; touchLock(true);
  clearSay(); els.hint.classList.remove("show");
  [...els.stage.children].forEach(c=>c.remove());
  const F=T().finale;

  // 全黑镜面牌：从小到大缓缓逼近（黑色光面=物理镜面，照出屏幕前的你）
  const c=document.createElement("div"); c.className="card blackmirror";
  c.innerHTML=`<div class="mface"><div class="mgloss"></div></div>`;
  els.stage.appendChild(c);
  requestAnimationFrame(()=>c.classList.add("grow"));
  riser(3200);
  // 玻璃层淡入 + 从边缘向心收拢；全场灯光压暗；屏幕级镜框（潜意识：屏=镜）
  const fx=buildGlass(); document.body.appendChild(fx);
  const mf=document.createElement("div"); mf.className="mframe"; document.body.appendChild(mf);
  document.getElementById("app")?.classList.add("lights-off");
  requestAnimationFrame(()=>{ fx.classList.add("on"); mf.classList.add("on"); });

  // 旁白与放大同步：点破"反光里的那个人"
  F.mirror.forEach((t,i)=>setTimeout(()=>showInsight(t), 600+i*2400));
  const tReveal=600+F.mirror.length*2400+400;

  // 揭晓：黑牌炸开 → SSS《你》卡（玻璃层/镜框退场，灯光回来）
  setTimeout(()=>{ hideInsight(); flashGo(true); sparkle(24); chord(); land(true);
    fx.classList.remove("on"); mf.classList.remove("on");
    setTimeout(()=>{ fx.remove(); mf.remove(); },1300);
    document.getElementById("app")?.classList.remove("lights-off");
    c.remove(); spawnYouCard(F);
  }, tReveal);
}

function spawnYouCard(F){
  const c=document.createElement("div"); c.className="card sss";
  c.innerHTML=`<div class="sssin">
    <div class="crown"><span class="rt">SSS · ${F.youRank}</span><span class="stars">✦✦✦✦✦</span></div>
    <div class="ybig">${F.youChar}</div>
    <div class="ymeta">${F.youMeta}</div>
    <div class="ytag">${F.youLine}</div>
    <div class="yserial"><span>${F.youSerial}</span><span>MMXXVI</span></div>
  </div>`;
  els.stage.appendChild(c);
  requestAnimationFrame(()=>c.classList.add("in"));
  setTimeout(()=>{ flashGo(true); sparkle(18); chord(); },420);
  setTimeout(()=>showInsight(F.youQuip), 1200);
  // 停留鉴赏——这张牌留在台上，等玩家自己点（最重要的一张，节奏交还给你）
  setTimeout(()=>{ import("./narration.js").then(n=>n.nudgeHint()); }, 4200);
  let gone=false;
  c.style.cursor="pointer";
  c.onclick=()=>{ if(gone) return; gone=true; hideInsight();
    els.hint.classList.remove("show");
    c.style.transition="transform .5s,opacity .5s"; c.style.transform="translateY(-130%)"; c.style.opacity="0";
    setTimeout(()=>{ c.remove(); touchLock(false);
      S.pendingPhilo=true; drawShare("you"); },500); };       // 分享图=《？》卡（带二维码，可存相册）
}
