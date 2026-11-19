# Bharat Guessr 🇮🇳

[![Test and deploy](https://github.com/adij26/bharat-guessr/actions/workflows/deploy.yml/badge.svg)](https://github.com/adij26/bharat-guessr/actions/workflows/deploy.yml)
![Single file](https://img.shields.io/badge/build-none%2C%20one%20HTML%20file-ffb300)

**A GeoGuessr-style game set on Indian streets. You get dropped somewhere real, look around, and pin where you think you are.**

### ▶ [Play it here: adij26.github.io/bharat-guessr](https://adij26.github.io/bharat-guessr/)

![Bharat Guessr start screen](docs/start-screen.png)

## How to play

1. You land on a real street somewhere in India, shown in Street View. Look around.
2. Read the clues: shop signs, scripts, number plates, autos, architecture, the coast or the hills.
3. Click the map to drop your pin, then hit **Make guess**.
4. Five rounds, up to 100 points each. Land within 250 m for a perfect score.
5. Beat your personal best, then share your result card (🟩🟨🟧🟥, one square per round).

Keyboard: press **Enter** to make your guess and to move to the next round.

## How scoring works

Distance is measured "as the crow flies" with the
[haversine formula](https://en.wikipedia.org/wiki/Haversine_formula), which accounts for the
curve of the Earth. Points then decay exponentially with distance:

```
score = 100                      if distance ≤ 250 m
score = round(100 · e^(−km/250)) otherwise
```

That curve halves your score roughly every 173 km. It rewards knowing the right *city*
without making a perfect pin the only way to score: a guess in the right state still earns
something, and one on the wrong side of the country earns close to nothing.

| Distance off | Points |
|---:|---:|
| < 250 m | 100 |
| 25 km | 90 |
| 100 km | 67 |
| 500 km | 14 |
| 1,500 km | 0 |

## Design

The look is borrowed from Indian railway station boards: marigold lettering on a black
board, with Devanagari above the English. The final verdicts are written in the same spirit,
from *"Certified desi navigator"* down to *"Time for a road trip."*

## How it's built

There's no framework and no build step. The whole game is one [`index.html`](index.html):

- **Street View:** Google Maps' embeddable Street View, with small patches over the corners
  so the address label doesn't give the answer away
- **Guess and result maps:** [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles
- **Locations:** 23 hand-picked streets across 11 cities with official Street View coverage

## Tests and deployment

[`tests/validate.test.mjs`](tests/validate.test.mjs) uses Node's built-in test runner to check
the game without a browser. It confirms that every location sits inside India, that there are no
duplicates, that the distance maths is accurate, and that the scoring curve behaves.

On every push to `main`, [GitHub Actions](.github/workflows/deploy.yml) runs those tests and,
if they pass, publishes the game to GitHub Pages. Pull requests run the tests only, so a broken
change can't reach the live site.

```bash
node --test tests/*.test.mjs   # run the tests locally (Node 20+)
open index.html                # or just open the file in a browser
```

## Ideas for later

- [ ] More cities and rural roads
- [ ] Daily challenge: same five locations for everyone
- [ ] Regional modes (South India, the Northeast, Himalayan states)
