import test from "node:test";
import assert from "node:assert";
import { BEATS, TARGET, TUNE } from "../js/config.js";

test("16 beats, every need positive", () => {
  assert.equal(BEATS.length, 16);
  for (const b of BEATS) assert.ok(b.need > 0, "need>0");
});

test("mechanic flags are unique across beats", () => {
  const flags = BEATS.flatMap(b => b.on);
  assert.equal(new Set(flags).size, flags.length, "no duplicate mechanic");
});

test("every beat gesture is valid", () => {
  for (const b of BEATS) assert.ok(["tap","up","pick","hold"].includes(b.g), "valid gesture");
});

test("TARGET = Σ need up to & incl goalreveal beat", () => {
  const gi = BEATS.findIndex(b => b.on.includes("goalreveal"));
  const sum = BEATS.slice(0, gi+1).reduce((s,b)=>s+b.need, 0);
  assert.equal(TARGET, sum);
});

test("energy beat forces at least one share (need > energyMax)", () => {
  const e = BEATS.find(b => b.on.includes("energy"));
  assert.ok(e.need > TUNE.energyMax, "energy need must exceed energyMax to force a share");
});
