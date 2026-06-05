# The Game Theory · 游戏论 — 项目记忆

极简但有深度、有设计感的游戏系列。第一性原理探索"最小逻辑产生游戏感"：
compulsion 是引擎（可变奖励+保底+juice），内容是皮。分享的目的是"让大家夸夸我"，不是增长漏斗。
品牌：**THE GAME THEORY · 游戏论**（中文名避开"博弈论"；№ 编号已退役）。
GitHub：`bitqs/thegametheory`（source of truth）。本地：`~/Projects/thegametheory`（2026-06-05 迁出 iCloud，旧目录废弃勿碰）。线上 https://thegametheory.pages.dev。

**游戏的诞生**（根目录）：边玩边拆穿自己的元游戏。命运神选体开场（"命运之神选中了你！"
→闪白入局），设计师宣告腔装机制、坦白腔拆台。终极目标揭穿为空 → 黑镜终幕（奖励=你自己）
→ 哲学 8 行 → 三向选择(望/续/此)结局卡+分享卡。
前作《一眼万年》完整代码在 git 历史 `f167548`。

## 跑 / 部署

```bash
python3 -m http.server 8000 --bind 0.0.0.0   # 手机经 Tailscale http://100.112.175.94:8000
./build/deploy.sh "ascii message"            # 排除 admin/docs/build；中文 commit msg 会被 CF 拒
```

后台编辑器（仅本地）：`/admin.html` — 16 拍流程列表，改 need/say/done/openHook 存
localStorage 本机即时生效，「导出 JSON」给 Claude 落库。游戏端 override 入口：
config.js（TARGET 前）+ i18n.js（文件末尾）。CF 上未知路径 200 是 index.html 兜底，别误判。

## 架构

- `index.html` + `css/style.css` + `js/` 18 模块（config/i18n/state/rarity/pool/audio/dom/hud/
  narration/cards/flow/share/input/lang/chooser/pick/boss/finale/main）。
- **BEATS 16 拍**：up 主循环 ×11 + pick3(三选一真随机，品字排列) + boss(对峙布局：Boss 探头/
  蓄力牌+侧边绿区表；弱弹回/贪炸膛/刚好冲撞顿帧震退→破牌居中鉴赏) + pick4(near-miss 金卡在隔壁，
  选中卡"▼你的选择") + goalreveal(满条 climax+第四面墙报数+禀赋进度点名) + share(终幕)。
- 开局：boot 进度条 → 语言二选一 → 卡组二选一（游戏左✦/画右）→ 命运宣告 7 行（片头居中）→ 闪白。
- **终幕**（share beat tap → `js/finale.js`）：黑镜牌缓放大 + 全屏玻璃层（雾/水珠/指印/眩光/暗角）
  + 屏幕级镜框 → 反射出玩家 → SSS《你》卡（彩虹描边+指纹纹理）**留台等玩家点** → 分享图=
  《？》卡（Playfair 正体问号+QR）。保存：cacheBlob 后手势栈内同步 navigator.share（iOS 才放行）。
- 牌面=游戏设计原则+一句招供（words 22 常规/wordsRare 8 深层）；`drawPrinciple` 按 BEATMATCH
  与当前 beat 呼应；同局词/画作不重复（usedW/usedWR/usedArt）；首翻固定 `wordFirst`「使命感」。
  收藏=集齐设计原则。
- **故事全在牌上**：up 拍 `beats[i].say`=每张牌一行剧情（**行数必须=need**），翻牌印进 poem 槽
  即推进；底部旁白只留纠错/里程碑；pick/boss/share 模态拍仍走底部 speak。
  文案技巧（提问代答/体验先行/扎心反问）见 game-design skill §8.5 + copy-constitution。
- 已装心理学武器：禀赋进度（预填 2 格+climax 点名）/目标梯度（≥70% gg 加速）/新起点（升级 quip）/
  好奇缺口（故事拍解锁后牌背漏下一行剧情开头）/near-miss 神经实锤（Clark 2009）/新元素 .newin 金光脉冲。
- 心力耗尽=YOU DIED 死亡屏→分享复活；energy beat 后心力 chip 常驻 ∞。
- 音频零素材合成回退全链：SFX + 五声琶音 riser + 生成式暗环境 bgm（有 audio/*.mp3 优先文件）。
  正式 BGM：`build/gen-bgm.py` ElevenLabs Music 生成（**计费**）→ ffmpeg 首尾 4s crossfade
  无缝循环 `audio/bgm.mp3`（86s JRPG 风）。
- 调研三件套：`docs/meta-games-research.md` / `docs/copy-constitution.md`（**改文案先读**）/
  `docs/gamification-audit.md`（审计+TOP12+红线：机制命名必须准、暗模式必须自我点名）。
- 数值改 `js/config.js`，文案改 `js/i18n.js`；`test/` node --test；`build/sim.mjs` 改数值后必跑。
- 卡组双池：`data/museums/*.json` 890 真迹 + `data/games.json` 148 款游戏（封面 `art-games/`
  ≤640px JPEG；源数据 `build/games-list.mjs`，抓图 `build/fetch-game-art.mjs` 可重复跑只补缺）。
- 坑：beat 分支判断用 `b.on.includes(flag)` 不要 `b.g`（share beat g 是 tap）；img 路径以 `/` 开头
  绝对路径并经入池白名单校验；`?debug` 暴露 `window.GT`。

## 交互铁律（用户逐条打磨出的，别回退）

- **上滑跟手换牌=主交互**（牌随指位移渐隐，过线 -80px 出牌，不过线弹回）；
  N/R 自动翻（520ms+图解码完成），SR 紫辉/SSR 金光留背等手翻；**只有翻开的牌可上滑换**。
- 按下 scale .96 / 松手回弹；chooser 选中先回原位齐平再翻再放大（settle 在 zoom 前必须摘除）。
- 卡面布局：稀有度抬头条在卡上沿；介绍（标题·年代·类型+一句话）贴图下左对齐；原则名居中+
  招供句金斜体；卡背/卡面常驻细线框 decoration；卡角弧线（border-radius 11px）。
- 牌居中略抬（padding-bottom 7vh），底部旁白/提示紧凑分区互不遮挡；选牌小卡字号 !important 锁死。
- 无平移抖动（晕）、无手机震动；背面图案翻转瞬间消失；翻开后漂浮+光扫+文字错峰升起。
- 全 DOM 零 `<img>`；触摸全走透明 touchlayer（pick/boss/finale 时关掉让点击直达卡）。
- 卡面收藏感：序列号/星级/限量认证；黄金比例 1:1.618。
- 手机端验收用 `?v=N` 绕 Safari 缓存；验证优先打线上 preview。

## 工作流

改数值 → `node build/sim.mjs` → 浏览器验收（chrome-devtools，几何优先；跳拍调试会制造计时器竞态，
全流程自然跑最可靠）→ `./build/deploy.sh` → 手机复验。
设计新机制/调数值用 game-design 技能；文案动笔前过 copy-constitution 十条。
