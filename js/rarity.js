// 纯函数：稀有度掉落（金字塔分布 SSR3% / SR9% / R28% / N60%）
// 注入 rnd 便于 node:test 断言分布
export function rollRarity(rnd = Math.random){
  const r = rnd() * 100;
  return r < 3 ? "SSR" : r < 12 ? "SR" : r < 40 ? "R" : "N";
}
