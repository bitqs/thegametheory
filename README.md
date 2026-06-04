# The Game Theory

极简但有深度的游戏系列。第一性原理探索：**最小的逻辑，如何产生游戏感。**

A series of tiny games about why games work. Each one strips play down to its smallest
compulsive core — then shows you the wiring.

## №2 游戏的诞生 · The Birth of a Game

**▶ 玩：<https://thegametheory.pages.dev>**（手机体验最佳）

一个边玩边拆穿自己的元游戏。

我——一个过分诚实的设计师——陪你从零开始装一台游戏机器：
即时反馈、随机奖励、稀有度、进度条、升级、稀缺、蓄力、叙事、终极目标……
每装一个零件，当场承认我在用它操纵你。

机制全部装完，终极目标被揭穿是一条任意画的线。然后问题变成：

> 游戏是一组我们都同意假装重要的规则。人生也是。
> 区别是，游戏里你能选"为什么继续"。

三种回答，三种结局卡。

A meta-game that plays you while confessing how. An overly honest designer installs
game mechanics on you one by one — variable rewards, rarity, progress bars, the works —
and admits to each manipulation as it lands. Then the ultimate goal is revealed to be
an arbitrary line, and the game asks why you'd keep playing anything at all.

## 技术 · Tech

无引擎、无框架、无构建。Vanilla JS 17 个模块 + 一份 JSON 卡组数据。

- 全程手势驱动，零按钮压画面：上滑抽牌 / 点击翻牌 / 下滑蓄力
- 数值（概率、保底、节拍）集中在 `js/config.js`，文案集中在 `js/i18n.js`，改数值不碰逻辑
- 改掉率必须过蒙特卡洛模拟（`build/sim.mjs`），手感必须过真机
- 音频缺文件自动回退 Web Audio 合成，零素材也能跑
- 中英双语（`js/i18n.js`）

```bash
python3 -m http.server 8000    # 本地跑，就这一行
```

## 素材 · Credits

- 890 件公版真迹：The Met · Art Institute of Chicago · Cleveland Museum of Art · V&A（Open Access）
- 148 款游戏封面：Wikipedia
- BGM：ElevenLabs Music 生成，ffmpeg 首尾 crossfade 无缝循环

## №1 一眼万年

已退役。上滑抽真迹卡的单文件抽卡游戏，完整代码在 git 历史 [`f167548`](../../tree/f167548)。

---

这个 README 也想骗你点 star。

现在你知道了。它还在想。

*A GAME BY [BITQS](https://github.com/bitqs)*
