# 优化 Plan（零新机制，只打磨现有）— 2026-06-05

原则：不加任何新玩法/新拍/新系统。五条线，每条独立可验收，按序执行。

## P1 性能（首因：加载与流畅）
- [x] art/ 333 张超标重压 36.5→33M（其余本就 ≤640）
- [x] 字体砍 4 字重+Noto 补真 700；display=swap 原有
- [x] bgm 1.37M 达标；boot 预取上线
- [x] 合成层审查：每卡 will-change+artbg blur 为仅有成本，现代机可接受
- [ ] 验收：模拟 Fast 3G 首屏 ≤3s 可玩；中端机全程无掉帧感

## P2 手感（操作打磨）
- [x] 出牌阈值视口化：12vh 封顶 110px
- [x] 换牌零死区：exitUp 矩形钉死脱流+立即补牌（省 ~450ms/次）
- [x] busy 锁审查结论：flipCard 同 tick 释放✓；swapCard 改零死区后立即可交互✓；
      面朝下连滑→quip 提示（保留）；boss/pick/finale 各自 done 闸✓；蓄力中滑动被 pointer 流隔离✓
- [x] touchLock helper 收口（dom.js），三处替换
- [ ] 验收：手机连续乱点乱滑 2 分钟无卡死无错位

## P3 视觉一致性
- [x] 缓动 token：--ease-out/soft/exit/spring/flip，CSS+JS 内联 16 处归一（5 处刻意单用保留）
- [x] --red/--green/--greenD/--cool 收口，boss 红/绿区/镜框冷银全替
- [x] 内线框/弧角 11→12 与面板对齐；阴影本就同款
- [ ] 矮屏(667)/高屏(932)/iPad 三档过一遍布局截图比对
- [ ] 验收：任意两张牌截图并排，除内容外样式零差异

## P4 文案（Hades 十原则复审，refs/hades 语料对照）
- [ ] 16 拍 say 逐行过：一次一颗信息原子/反应式主语/deadpan 收尾
- [ ] 16 拍 done 揭穿句去"句式重复感"（现多句"X 是假的，Y 是真的"句型连用）
- [ ] en 全量顺稿（残句化、缩写化，摆脱直译腔）
- [ ] quips（wrong/locked/boss*/milestone）按"重复必须演进"补 2-3 变体
- [ ] 验收：全文案出声朗读一遍不拗口；同句型连续出现 ≤2 次

## P5 稳定性与卫生
- [ ] e2e 驱动脚本固化：把手工 evaluate 全程跑封装进 `build/e2e.md`（粘贴即用）
- [ ] admin.html 与"剧情上牌"新结构核对（say 行数=need 的约束在后台编辑时提示）
- [ ] 死代码清理：多会话合并残留（未引用 export、孤儿 CSS 类 grep 清单）
- [ ] 控制台零 warning（除可选音频 404）
- [ ] 验收：tests 全绿 + 全程自然跑零 console error

执行节奏：每条线一批 commit+deploy，手机验收过了再进下一线。
