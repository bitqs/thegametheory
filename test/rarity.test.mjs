import test from "node:test";
import assert from "node:assert";
import { rollRarity } from "../js/rarity.js";

test("rarity distribution ~ pyramid (SSR3/SR9/R28/N60)", () => {
  const N = 200000, c = { N:0, R:0, SR:0, SSR:0 };
  for (let i=0;i<N;i++) c[rollRarity()]++;
  const p = k => c[k]/N*100;
  assert.ok(Math.abs(p("SSR")-3)  < 0.6,  "SSR ~3% got "  + p("SSR").toFixed(2));
  assert.ok(Math.abs(p("SR") -9)  < 1.0,  "SR ~9% got "   + p("SR").toFixed(2));
  assert.ok(Math.abs(p("R")  -28) < 1.5,  "R ~28% got "   + p("R").toFixed(2));
  assert.ok(Math.abs(p("N")  -60) < 1.5,  "N ~60% got "   + p("N").toFixed(2));
});

test("rollRarity respects injected rng (deterministic, testable)", () => {
  assert.equal(rollRarity(() => 0.001), "SSR"); //  0.1%
  assert.equal(rollRarity(() => 0.05),  "SR");  //  5%
  assert.equal(rollRarity(() => 0.30),  "R");   // 30%
  assert.equal(rollRarity(() => 0.99),  "N");   // 99%
});
