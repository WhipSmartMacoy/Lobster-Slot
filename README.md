# Clawsome Catch

An original lobster-themed 5-reel, 4-row, 40-line video slot in a single HTML file. Open `index.html` in any browser (or enable GitHub Pages) to play.

## Features
- 40 paylines, 1–40 lines selectable, 1–25 credits per line, denominations 1¢–$1, Max Bet
- 🦞 Wild substitutes and pays on its own
- 🛟 Buoy scatter pays anywhere (2×/10×/50× total bet); 3, 4 or 5 buoys start the **Buoy Bonus**: pick 3, 4 or 5 of 12 buoys for 2×–25× total bet each
- 🪸 Bonus symbols on reels 1, 2 and 3 award **8 free spins at ×3**, retriggerable
- All pays scale with lines × bet per line; paytable shows live values for your current bet
- Anticipation slow-down, win-line display, count-up, Auto play, Turbo, sound, session stats, credits saved in the browser

## Math
Simulated payback is about 95.7% (hit rate about 49%). Re-check with:
```
node tools/simulate.js 2000000
```
`core.js` holds the math; the same code is inlined in `index.html`.

For entertainment only. No real money.
