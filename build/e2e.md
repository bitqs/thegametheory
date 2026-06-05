# 全程 e2e 驱动脚本（粘贴进浏览器 console / chrome-devtools evaluate）

前提：打开 `https://thegametheory.pages.dev/?debug`（或本地 :8000）。
脚本自然走完整局（语言→卡组→16 拍→黑镜→分享→哲学→三选→结局），
boss 用 1.4s 蓄力命中，pick 永远点第一张，能量耗尽自动点"分享复活"。

```js
(async () => {
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(let t=0;t<60;t++){ if(document.querySelector('.chooseWrap .ccard')) break; await sleep(500); }
  document.querySelector('.chooseWrap .ccard').click();
  let dw=null;
  for(let t=0;t<25;t++){ const w=document.querySelector('.chooseWrap');
    if(w && [...w.querySelectorAll('.chint')].some(x=>/画|游戏|ART|GAMES/.test(x.textContent))){ dw=w; break; }
    await sleep(400); }
  dw.querySelectorAll('.ccard')[0].click();
  const S=window.GT.S;
  for(let t=0;t<90;t++){ if(S.phase==='play'&&S.beatIdx===0) break;
    if(S.phase==='opening') GT.handleGesture('tap');         // 宣告可快进
    await sleep(400); }
  const hold=async ms=>{ window.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    await sleep(ms); window.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); };
  for(let i=0;i<900 && S.phase!=='end'; i++){
    const shareBtn=document.getElementById('shGain');
    const shareV=document.getElementById('share');
    if(shareBtn && shareBtn.getBoundingClientRect().width>0){ await sleep(600); shareBtn.click(); await sleep(500); continue; }
    if(shareV?.classList.contains('show') && document.getElementById('srowMain').hidden===false){
      await sleep(400); document.getElementById('closeShare').click(); await sleep(600); continue; }
    if(S.phase==='play'){
      if(S.beatIdx===15){ GT.handleGesture('tap'); await sleep(1200); continue; }
      if(S.card){ GT.handleGesture('tap'); await sleep(400); }
      else if(S.shown){ GT.handleGesture('up'); await sleep(460); }
      else await sleep(300);
    } else if(S.phase==='pick'){
      const w=document.querySelector('.pickWrap');
      if(w && !w.style.opacity && w.children.length){ w.children[0].click(); await sleep(2500); } else await sleep(400);
    } else if(S.phase==='boss'){ await hold(1400); await sleep(2800); }
    else if(S.phase==='finale'){
      const sss=document.querySelector('.card.sss');
      if(sss){ await sleep(1500); sss.click(); await sleep(800); } else await sleep(800);
    }
    else if(S.phase==='outro'){ GT.handleGesture('up'); await sleep(620); }
    else if(S.phase==='philo'){ GT.handleGesture('tap'); await sleep(320); }
    else if(S.phase==='choice'){ GT.handleGesture('tap'); await sleep(900); }
    else await sleep(300);
  }
  console.log('FINAL', S.phase, '— 应为 end；随后人工点 生成战绩卡/保存 验证');
})();
```

排错入口：`window.GT` = {S,F,G,BEATS,handleGesture,T,getLang}。
注意：跳拍调试（直接改 S.beatIdx + applyBeat）会与残留计时器竞态，复现 bug 一律自然跑。
