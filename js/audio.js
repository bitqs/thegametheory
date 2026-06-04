// 音频：优先播放 /audio 下的开源采样，缺文件则回退 Web Audio 合成（零素材也能跑）
// 静音读 S.muted；不可用全程静默降级。下载素材见 audio/SOUNDS.md
import { S } from "./state.js";

export function actx(){ if(S.muted) return null;
  try{ S.ac = S.ac || new (window.AudioContext||window.webkitAudioContext)(); return S.ac; }catch{ return null; } }

/* ── Web Audio 合成（回退）── */
function synth(f,d=.12,type="sine",v=.16){ const c=actx(); if(!c) return;
  const o=c.createOscillator(),g=c.createGain(); o.type=type; o.frequency.value=f;
  g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(.0008,c.currentTime+d);
  o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+d); }
function synthTick(){ synth(660,.07,"triangle",.12); }
function synthLand(big){ synth(big?880:560,.15,"triangle",.15); if(big) setTimeout(()=>synth(1320,.18,"sine",.12),55); }
function synthChord(){ [784,988,1175,1568].forEach((f,i)=>setTimeout(()=>synth(f,.22,"sine",.14),i*70)); }
function synthLvl(){ [523,659,784].forEach((f,i)=>setTimeout(()=>synth(f,.16,"sine",.13),i*55)); }
function synthRiser(ms){ const c=actx(); if(!c) return;          // 五声琶音上行：音乐感蓄力（替换刺耳锯齿扫频）
  const SCALE=[220,261.6,293.7,329.6,392,440,523.3,587.3];
  const n=Math.max(4, Math.min(8, Math.round(ms/280)));
  for(let i=0;i<n;i++){ const f=SCALE[Math.min(i,SCALE.length-1)];
    const at=(ms/1000)*(i/n);
    const o=c.createOscillator(), g=c.createGain(); o.type="sine"; o.frequency.value=f;
    const t=c.currentTime+at, v=.05+.05*(i/n);                    // 越升越亮
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+.03);
    g.gain.exponentialRampToValueAtTime(.0006,t+.5);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.55); } }

/* ── 采样播放（有就用，没有回退合成）── */
const FILES = { tap:"tap", reveal:"reveal", revealBig:"reveal_big", jackpot:"jackpot", levelup:"levelup", charge:"charge" };
const buffers = {};   // name -> AudioBuffer | false(失败) | undefined(未试)
function loadSfx(name){ const c=actx(); if(!c) return; if(buffers[name]!==undefined) return;
  buffers[name]=false;  // 标记尝试中，避免重复
  fetch("audio/"+FILES[name]+".mp3").then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); })
    .then(b=>c.decodeAudioData(b)).then(buf=>{ buffers[name]=buf; }).catch(()=>{ buffers[name]=false; });
}
function playSfx(name, vol=.5){ const c=actx(); if(!c) return false;
  const buf=buffers[name];
  if(buf){ const s=c.createBufferSource(),g=c.createGain(); s.buffer=buf; g.gain.value=vol;
    s.connect(g); g.connect(c.destination); s.start(); return true; }
  if(buf===undefined) loadSfx(name);   // 首次触发后台加载，这次先用合成
  return false;
}

/* ── 对外 API：名字不变，内部择优 ── */
export function blip(f,d,type,v){ synth(f,d,type,v); }   // 杂用提示音保持合成
export function tick(){ if(!playSfx("tap",.4)) synthTick(); }
export function land(big){ if(!playSfx(big?"revealBig":"reveal",.55)) synthLand(big); }
export function chord(){ if(!playSfx("jackpot",.6)) synthChord(); }
export function lvlSnd(){ if(!playSfx("levelup",.5)) synthLvl(); }
export function riser(ms){ if(!playSfx("charge",.5)) synthRiser(ms); }

/* ── 背景乐：低音量循环，首个手势启动，静音停。
   有 audio/bgm.mp3 用文件；缺文件回退生成式暗环境垫（零素材零版权） ── */
let bgmEl=null, bgmStarted=false, bgmGain=null, bgmPluck=null;
function synthBgm(){ const c=actx(); if(!c||bgmGain) return;
  bgmGain=c.createGain(); bgmGain.gain.value=0; bgmGain.connect(c.destination);
  // 暗垫：三只微失谐正弦过低通（A2 根音 + 五度），呼吸式滤波 LFO
  const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=300; lp.Q.value=.7; lp.connect(bgmGain);
  [110,110.7,164.8].forEach(f=>{ const o=c.createOscillator(); o.type="sine"; o.frequency.value=f;
    const g=c.createGain(); g.gain.value=f<150?.42:.22; o.connect(g); g.connect(lp); o.start(); });
  const lfo=c.createOscillator(); lfo.frequency.value=.05;
  const lg=c.createGain(); lg.gain.value=110; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
  // 淡入到 0.10（垫底，不抢 SFX）
  bgmGain.gain.linearRampToValueAtTime(.10, c.currentTime+6);
  // 稀疏泛音拨弦：A 小调五声，6-12s 一粒，远而轻
  const SCALE=[220,261.6,293.7,329.6,392,440];
  const pluck=()=>{ if(S.muted||!bgmGain) return;
    const f=SCALE[(Math.random()*SCALE.length)|0];
    const o=c.createOscillator(), g=c.createGain(); o.type="sine"; o.frequency.value=f;
    g.gain.setValueAtTime(.045,c.currentTime); g.gain.exponentialRampToValueAtTime(.0006,c.currentTime+2.4);
    o.connect(g); g.connect(bgmGain); o.start(); o.stop(c.currentTime+2.4); };
  const loop=()=>{ pluck(); bgmPluck=setTimeout(loop, 6000+Math.random()*6000); };
  bgmPluck=setTimeout(loop, 3000);
}
export function startBgm(){ if(bgmStarted||S.muted) return; bgmStarted=true;
  try{ bgmEl=new Audio("audio/bgm.mp3"); bgmEl.loop=true; bgmEl.volume=0;
    bgmEl.play().then(()=>{ let v=0; const id=setInterval(()=>{ v=Math.min(.32,v+.02); if(bgmEl) bgmEl.volume=v; if(v>=.32) clearInterval(id); },120); })
      .catch(()=>{ bgmEl=null; synthBgm(); });   // 无文件/被拦：合成垫顶上
  }catch{ bgmEl=null; synthBgm(); } }
export function setMuted(m){ S.muted=m;
  if(bgmEl){ if(m) bgmEl.pause(); else bgmEl.play().catch(()=>{}); }
  if(bgmGain){ const c=actx()||bgmGain.context;
    bgmGain.gain.linearRampToValueAtTime(m?0:.10, c.currentTime+ .6); } }
