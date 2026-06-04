// 中央可变状态：各模块 import 同一对象读写（消灭散落全局）
import { TUNE } from "./config.js";

// 机制开关（beat 解锁后置 1）
export const F = { sound:0,random:0,rarity:0,bar:0,score:0,level:0,collect:0,energy:0,pick3:0,story:0,juice:0,boss:0,pick4:0,goalreveal:0,share:0 };
// 已解锁手势（上滑=换牌主交互，开局即有；tap=翻牌）
export const G = { tap:1, up:1 };

export const S = {
  phase:"play", beatIdx:0, actCount:0,
  score:0, level:1, xp:0, lastAct:0,
  energy:TUNE.energyMax, energyTimer:null, energyInf:false, busy:false,
  collected:[], collSet:new Set(), storyIdx:0,
  chosen:null, pendingPhilo:false, bestR:"N", bestArt:null,
  shown:null, card:null, doneActions:2,   // 预填 2 格=天赋进度效应（结局点名拆穿）
  muted:false, ac:null,
  philoStep:0, philoLines:null,
  POOL:[], deck:"art", goalMarks:new Set(), firstSSR:false, t0:Date.now(),
  usedW:new Set(), usedWR:new Set(), usedArt:new Set(),   // 去重：原则词/深层原则/画作（耗尽重洗）

};
