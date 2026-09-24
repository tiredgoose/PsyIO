# PsyIO
Guess the cards.

## Nine Stacks

A shuffled 52-card deck is dealt into a 3×3 grid of stacks, with the top card of each stack face up. For any stack, guess whether the card underneath is **higher**, **lower**, or the **same** rank (aces high, suits ignored).

- **Correct:** the face-up card goes to the completed pile and the next card is revealed.
- **Wrong:** the whole stack is blacked out.
- A stack is cleared when only its last card is left. The game ends when every stack is cleared or blacked out.

### Scoring
| Event | Points |
|---|---|
| Correct higher/lower | 10 × multiplier |
| Correct same | 50 × multiplier |
| Streak | multiplier +1 for every 3 correct in a row (max ×5), resets on a miss |
| Stack cleared | +25 |
| All nine stacks cleared | +250 |

### Run locally
Open `index.html` in a browser. No build step or dependencies are needed.

### GitHub Pages
In **Settings → Pages**, set Source to *Deploy from a branch* and pick `main` / `/ (root)`. The game is then served at `https://<user>.github.io/PsyIO/`.
