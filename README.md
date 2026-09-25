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

### Global scoreboard (optional)
The game can keep an all-time top 10 in a free [Supabase](https://supabase.com) database. Without it, the game still works and only keeps your personal best in your browser.

1. Create a free Supabase account and a new project.
2. In the project, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. Open **Project Settings → API** (or **Connect**) and copy the **Project URL** and the **anon public** key.
4. Paste both into [`config.js`](config.js) and commit.

The anon key is designed to be public. The database only lets it read the board and add new scores: it can't edit or delete entries, and it rejects impossible scores. A determined player could still submit a fake score that's within the possible range; if that happens, delete the row in Supabase's **Table Editor**.

### Run locally
Open `index.html` in a browser. No build step or dependencies are needed.

### GitHub Pages
In **Settings → Pages**, set Source to *Deploy from a branch* and pick `main` / `/ (root)`. The game is then served at `https://<user>.github.io/PsyIO/`.
