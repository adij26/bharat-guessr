// Checks the game's data and scoring logic without a browser.
// Run with:  node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// Pull the location pool and the pure helper functions out of the page's <script>.
const pool = Function(`return ${html.match(/const POOL = (\[[\s\S]*?\n\]);/)[1]}`)();
const rounds = Number(html.match(/const ROUNDS = (\d+);/)[1]);
const grab = (name) => html.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n}`))[0];
const { haversine, scoreFor, fmtDist } = Function(
  `${grab("haversine")}\n${grab("scoreFor")}\n${grab("fmtDist")}\nreturn { haversine, scoreFor, fmtDist };`
)();

// Rough bounding box for India.
const INDIA = { minLat: 6, maxLat: 37.5, minLng: 68, maxLng: 97.5 };

test("pool has enough locations for a full game", () => {
  assert.ok(pool.length >= rounds * 2, `need at least ${rounds * 2} locations, have ${pool.length}`);
});

test("every location is complete and inside India", () => {
  for (const loc of pool) {
    assert.ok(loc.name && loc.city, `missing name or city: ${JSON.stringify(loc)}`);
    assert.ok(loc.lat > INDIA.minLat && loc.lat < INDIA.maxLat, `${loc.name}: latitude ${loc.lat} out of range`);
    assert.ok(loc.lng > INDIA.minLng && loc.lng < INDIA.maxLng, `${loc.name}: longitude ${loc.lng} out of range`);
  }
});

test("no duplicate locations", () => {
  const names = pool.map((l) => `${l.name}|${l.city}`);
  assert.equal(new Set(names).size, names.length);
  const coords = pool.map((l) => `${l.lat.toFixed(3)},${l.lng.toFixed(3)}`);
  assert.equal(new Set(coords).size, coords.length);
});

test("haversine distance is accurate", () => {
  // Mumbai (Marine Drive) to New Delhi (Connaught Place) is about 1,150 km.
  const km = haversine(18.94398, 72.82355, 28.63152, 77.21874);
  assert.ok(km > 1100 && km < 1200, `got ${km}`);
  assert.equal(haversine(20, 78, 20, 78), 0);
});

test("scoring: perfect inside 250 m, then decays", () => {
  assert.equal(scoreFor(0), 100);
  assert.equal(scoreFor(0.25), 100);
  assert.ok(scoreFor(10) > scoreFor(100));
  assert.ok(scoreFor(100) > scoreFor(1000));
  assert.ok(scoreFor(3000) >= 0 && scoreFor(3000) <= 1);
});

test("distance formatting", () => {
  assert.equal(fmtDist(0.42), "420 m");
  assert.equal(fmtDist(3.456), "3.5 km");
  assert.equal(fmtDist(812.3), "812 km");
});
