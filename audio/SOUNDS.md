# №2 音频素材清单（开源 / CC0 / 免署名可商用）

游戏**零素材也能跑**（缺文件自动回退 Web Audio 合成）。把下列文件丢进本目录 `game2/audio/` 即逐个生效。
全部用 **`.mp3`**，文件名必须精确匹配（见 `js/audio.js` 的 `FILES` 映射）。

| 文件名 | 触发场景 | 建议音色 |
|--------|----------|----------|
| `tap.mp3` | 每次翻牌点击（即时反馈） | 轻、短、干净的 UI click |
| `reveal.mp3` | 普通牌揭示落定 | 柔和 “叮 / pop” |
| `reveal_big.mp3` | SR/SSR 揭示（money shot） | 明亮上扬、有金属感 |
| `jackpot.mp3` | 稀有/里程碑/结局 和弦爆点 | 短促上行琶音 / chime 爆 |
| `levelup.mp3` | 升级 | 三连上行 “叮叮叮” |
| `charge.mp3` | 下滑蓄力（~1.1s） | 上升 whoosh / riser |
| `bgm.mp3` | 背景乐（循环，低音量，首个手势启动） | 安静 ambient / lofi，**可无缝循环** |

## 推荐来源（CC0，免署名）

**UI / 翻牌 / 升级 SFX —— 首选 Kenney（全 CC0）：**
- Kenney《Interface Sounds》100 个：<https://kenney.nl/assets/interface-sounds>
- Kenney《UI Audio》：<https://kenney.nl/assets/ui-audio>
  → 从里面挑 click→`tap`、confirmation/chime→`reveal`/`reveal_big`、maximize/上行→`levelup`、whoosh→`charge`。

**爆点 / 杂项 SFX：**
- OpenGameArt《CC0 Sound Effects》：<https://opengameart.org/content/cc0-sound-effects>
- OpenGameArt《100 CC0 SFX》：<https://opengameart.org/content/100-cc0-sfx>
- OpenGameArt《51 UI sound effects》：<https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks>
- Pixabay 音效（CC0/免授权）：<https://pixabay.com/sound-effects/search/cc0/>

**背景乐 `bgm.mp3`（安静 ambient / lofi，要能循环）：**
- OpenGameArt《CC0 Calm / Relaxing Music》：<https://opengameart.org/content/cc0-calm-relaxing-music>
- OpenGameArt《CC0 Background Ambience》：<https://opengameart.org/content/cc0-background-ambience>
- OpenGameArt《Short Loops Background Music Pack》：<https://opengameart.org/content/short-loops-background-music-pack>
- Pixabay Lofi（免授权）：<https://pixabay.com/music/search/lofi/>

## 注意
- 优先 **CC0**（无需署名）。若选 CC-BY 素材，请在本文件登记作者署名。
- 体积尽量小（SFX <50KB，bgm 控制在 1–3MB、能无缝 loop）。
- `bgm` 受静音开关控制（♪ 按钮），首个用户手势才播（浏览器自动播放策略）。
