# The Game Theory — 项目记忆

极简但有深度、有设计感的游戏系列。第一性原理探索"最小逻辑产生游戏感"：
compulsion 是引擎（可变奖励+保底+juice），内容是皮。分享的目的是"让大家夸夸我"，不是增长漏斗。

**№1 一眼万年**：上滑抽真迹卡 → 普通自动翻 / 中奖(SR/SSR)留背面发光等手翻（蓄力时长=中奖预期）→
下拉渐显详情(鉴赏/缩放) → 点卡心动 → 本命揭晓 → 收藏卡分享。

## 跑 / 部署

```bash
python3 -m http.server 8000 --bind 0.0.0.0   # 手机经 Tailscale http://100.112.175.94:8000
npx wrangler pages deploy . --project-name=thegametheory   # 线上 https://thegametheory.pages.dev
```

## 架构

- `index.html` ★ 单文件（样式+逻辑内联）。数值集中在顶部 const：`RATES`（概率/保底）、`FLIP`（蓄力时长/爆闪强度）、`STARS`、`JACKPOT`。
- `js/share-image.js` 收藏卡 canvas 渲染（与 art-looting 同源拷贝）；`js/vendor/qrcode-generator.js`。
- `data/museums/*.json` 890 件真迹（Met/AIC/CMA/V&A），含 `cardline_zh/cardline` AI 题词；`art/` 890 张 768px WebP（同源，canvas 可导出）。
- pity 状态存 localStorage key `yywn.pity`（跨局持久，容错）。

## 数值（已蒙特卡洛验证，改 RATES 后要重新模拟）

N64.5/R26/SR8/SSR1.5%；SSR 软保底 20 抽起 +2%/抽、硬保底 40（间隔均值~23/中位25/p95 36）；
SR 保底 12（10% 升金）；防连黑：连 5 N 必≥R；新手垫刀：4-8 抽必首金。

## 交互铁律（用户逐条打磨出的，别回退）

- **零按钮压画面**：上滑=抽 / 下滑=详情(渐显跟手) / 点背面=翻 / 点正面=心动 / 详情上滑=返回。
- 无平移抖动（晕）、无手机震动；蓄力=辉光渐强+轻微呼吸+上升音。
- 背面中心图案在翻转瞬间消失（不延迟）；翻开后轻微漂浮 + 光扫 + 文字错峰升起。
- 全 DOM 零 `<img>`（背景图 div，防 iOS 长按"存储图片"）；触摸全走透明 touchlayer。
- 卡面收藏感：序列号/星级/限量认证；黄金比例 1:1.618。
- 手机端验收用带 `?v=N` 的地址绕 Safari 缓存。

## 工作流

改数值 → node 蒙特卡洛验证 → 浏览器手感验收（chrome-devtools，几何优先）→ wrangler 部署。
设计新机制/调数值时用 game-design 技能（.claude/skills/game-design）。
