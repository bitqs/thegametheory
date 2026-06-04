# The Game Theory — 项目记忆

极简但有深度、有设计感的游戏系列。第一性原理探索"最小逻辑产生游戏感"：
compulsion 是引擎（可变奖励+保底+juice），内容是皮。分享的目的是"让大家夸夸我"，不是增长漏斗。

**№1 一眼万年**（已下架，完整代码在 git 历史 `f167548`）：上滑抽真迹卡的单文件抽卡游戏。

**№2 游戏的诞生**（现占根目录）：边玩边拆穿自己的元游戏。
一个自嘲坦诚的设计师("我")陪玩家逐层装机制(即时反馈→随机奖励→稀有度→进度条→获得感→升级→
稀缺→蓄力→叙事→juice→终极目标→分享)，每装一个当场承认在操纵你(幽默=诚实的骗子边行骗边解说)。
手势渐进 tap→上滑→下滑→结局三者组合答题。终极目标揭穿为任意画的线 → 哲学延伸到人生
("游戏是一组我们都同意假装重要的规则，人生也是；区别是游戏里你能选为什么继续") → 三向选择(希望/故事/此刻)出三种结局卡+分享卡。

## 跑 / 部署

```bash
python3 -m http.server 8000 --bind 0.0.0.0   # 手机经 Tailscale http://100.112.175.94:8000
./build/deploy.sh "ascii message"            # 线上 https://thegametheory.pages.dev（排除 admin/docs/build；中文 commit msg 会被 CF 拒）
```

后台编辑器（仅本地）：`/admin.html` — 16 拍流程列表，改 need/say/done/openHook 存
localStorage 本机即时生效，「导出 JSON」给 Claude 落库。游戏端 override 入口：
config.js（TARGET 前）+ i18n.js（文件末尾）。CF 上不存在该页（部署脚本排除；
未知路径 200 是 index.html 兜底，别误判）。

## 架构

- `index.html` + `css/style.css` + `js/` 17 模块（config/i18n/state/rarity/pool/audio/dom/hud/narration/cards/flow/share/input/lang/chooser/pick/boss/main）。
- **BEATS 16 拍**：up 主循环 ×11 + pick3(三选一真随机) + boss(按住蓄力三区：弱弹回/贪炸膛/刚好破牌) + pick4(near-miss：金卡永远在隔壁，选中卡"▼你的选择"标签区分) + goalreveal(满条 climax：金闪+条脉冲+第四面墙报数) + share。
- 开局：语言二选一 → 卡组二选一（游戏左✦引导/画右）→ 4 行使命开场白。
- 同类元游戏调研与待用点子：`docs/meta-games-research.md`；**改文案先读 `docs/copy-constitution.md`**。
- 终幕（share beat tap → `js/finale.js`）：黑镜牌缓放大 + 全屏"玻璃表面"层（雾/水珠/指印/眩光/暗角，
  焦点拉回屏幕玻璃反射出玩家）→ SSS《你》卡（彩虹描边+指纹纹理）→ 分享卡（双线框高级排版）。
- 心力耗尽=YOU DIED 幽默死亡屏→分享复活；energy beat 后心力 chip 常驻 ∞。
- 启动 #boot 进度条；所有出牌路径 `pool.warm()` 解码完成再展示；art-games 统一 ≤640px JPEG。
- 坑：beat 分支判断用 `b.on.includes(flag)`，不要用 `b.g`（share beat g 是 tap）。
- 数值改 `js/config.js`（`BEATS`/`TUNE`/`TARGET`），文案改 `js/i18n.js`（`POEM`/`CHARS`/`ENDINGS`），改这里不碰逻辑。
- `data/museums/*.json` 890 件真迹（Met/AIC/CMA/V&A），含 `cardline_zh/cardline` AI 题词；`art/` 890 张 768px WebP（同源，canvas 可导出）。img/data 路径全部以 `/` 开头的绝对路径。
- **游戏卡组**：`data/games.json` 148 款（1972-2024 中外，稀有度=年代+国民度+火热度）；封面 `art-games/`。
  源数据 `build/games-list.mjs`，抓图 `build/fetch-game-art.mjs`（维基 pageimages `pilimit=50&pilicense=any` 批量 + `action=parse` 抠 infobox 兜底；可重复跑只补缺）。
  `pool.js` 双池 + `setDeck`；开局语言后 chooser 二选一「画/游戏」。
- wrangler 部署：中文 commit message 会被 CF API 拒（UTF-8 bug），加 `--commit-message="ascii"`。
- `test/` node --test 单测；`build/sim.mjs` 蒙特卡洛模拟（改数值后必跑）。
- 分享卡内联 canvas 绘制（无 QR 依赖）。
- `?debug` 暴露 `window.GT` 供自动化验收。
- 全流程 jsdom 无头验证过（13 beat→哲学→选择→结局零运行时错）；`busy` 锁防动画中重复出牌。

## 交互铁律（用户逐条打磨出的，别回退）

- **上滑跟手换牌=主交互**（№1 同款：牌随指位移渐隐，过线 -80px 出牌，不过线弹回）；
  N/R 自动翻（520ms），SR 紫辉/SSR 金光留背等手翻（tap）；**只有翻开的牌可上滑换**；
  charge beat 下滑蓄力翻。按下 scale .96 / 松手回弹。
- 牌上移（#stage padding-bottom 16vh），底部旁白→提示分区，互不遮挡；矮屏缩牌。
- N 选一统一走 `js/chooser.js`（牌背盲选→翻面放大停留→缩出回调，题注标选项）；语言选择已用，结局三选一待接。
- 无平移抖动（晕）、无手机震动；蓄力=辉光渐强+轻微呼吸+上升音。
- 背面中心图案在翻转瞬间消失（不延迟）；翻开后轻微漂浮 + 光扫 + 文字错峰升起。
- 全 DOM 零 `<img>`（背景图 div，防 iOS 长按"存储图片"）；触摸全走透明 touchlayer。
- 卡面收藏感：序列号/星级/限量认证；黄金比例 1:1.618。
- 手机端验收用带 `?v=N` 的地址绕 Safari 缓存。

## 工作流

改数值 → `node build/sim.mjs` 蒙特卡洛验证 → 浏览器手感验收（chrome-devtools，几何优先）→ wrangler 部署。
设计新机制/调数值时用 game-design 技能（.claude/skills/game-design）。
