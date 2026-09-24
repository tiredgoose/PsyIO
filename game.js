(() => {
  "use strict";

  const SUITS = [
    { sym: "♠", color: "black" },
    { sym: "♥", color: "red" },
    { sym: "♦", color: "red" },
    { sym: "♣", color: "black" },
  ];
  const RANK_LABELS = { 11: "J", 12: "Q", 13: "K", 14: "A" };
  const STACK_COUNT = 9;

  const POINTS_HL = 10;
  const POINTS_SAME = 50;
  const STREAK_STEP = 3;
  const MAX_MULT = 5;
  const STACK_CLEAR_BONUS = 25;
  const PERFECT_BONUS = 250;
  const BEST_KEY = "psyio.ninestacks.best";

  const $ = (id) => document.getElementById(id);
  const gridEl = $("grid");
  const toastEl = $("toast");

  let state;
  let gameId = 0;

  function buildDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (let rank = 2; rank <= 14; rank++) deck.push({ rank, suit });
    }
    // Fisher–Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function newGame() {
    gameId++;
    const deck = buildDeck();
    const stacks = Array.from({ length: STACK_COUNT }, () => ({ cards: [], status: "active" }));
    // Deal round-robin: 52 cards -> seven stacks of 6, two stacks of 5.
    deck.forEach((card, i) => stacks[i % STACK_COUNT].cards.push(card));
    state = {
      stacks,
      completed: [],
      score: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      over: false,
    };
    render();
    updateStats();
  }

  function multiplier(streak) {
    return Math.min(MAX_MULT, 1 + Math.floor(streak / STREAK_STEP));
  }

  function compare(a, b) {
    if (b.rank > a.rank) return "higher";
    if (b.rank < a.rank) return "lower";
    return "same";
  }

  function guess(index, choice) {
    if (state.over) return;
    const stack = state.stacks[index];
    if (stack.status !== "active" || stack.cards.length < 2) return;

    const [top, next] = stack.cards;
    const actual = compare(top, next);
    const anim = { index };

    if (choice === actual) {
      // Multiplier applies from the streak *before* this guess, so the
      // bonus kicks in on the 4th, 7th, ... consecutive correct guess.
      const mult = multiplier(state.streak);
      let gained = (choice === "same" ? POINTS_SAME : POINTS_HL) * mult;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.correct++;
      state.completed.push(stack.cards.shift());
      anim.type = "correct";
      anim.leaving = top;

      let msg = `+${gained}${mult > 1 ? ` (×${mult})` : ""}`;
      if (stack.cards.length === 1) {
        stack.status = "done";
        gained += STACK_CLEAR_BONUS;
        msg += ` · Stack cleared +${STACK_CLEAR_BONUS}`;
      }
      state.score += gained;
      toast(msg, "good");
    } else {
      stack.status = "dead";
      anim.type = "wrong";
      anim.revealed = next;
      const lostStreak = state.streak;
      state.streak = 0;
      toast(`It was ${actual}${lostStreak >= STREAK_STEP ? ` · streak of ${lostStreak} lost` : ""}`, "bad");
    }

    render(anim);
    updateStats();
    checkGameOver(anim.type === "wrong" ? 1400 : 600);
  }

  function checkGameOver(delay) {
    if (!state.stacks.every((s) => s.status !== "active")) return;
    state.over = true;

    const cleared = state.stacks.filter((s) => s.status === "done").length;
    if (cleared === STACK_COUNT) state.score += PERFECT_BONUS;

    const prevBest = loadBest();
    const isBest = state.score > prevBest;
    if (isBest) saveBest(state.score);

    const thisGame = gameId;
    setTimeout(() => {
      if (thisGame !== gameId) return; // a new game was started meanwhile
      updateStats();
      const maxCorrect = 52 - STACK_COUNT;
      $("go-title").textContent = cleared === STACK_COUNT ? "Perfect board!" : "Game over";
      $("go-body").innerHTML = `
        <div class="summary">
          <span>Final score</span><span class="big">${state.score}</span>
          <span>Cards guessed correctly</span><span>${state.correct} / ${maxCorrect}</span>
          <span>Stacks cleared</span><span>${cleared} / ${STACK_COUNT}</span>
          <span>Best streak</span><span>${state.bestStreak}</span>
          ${cleared === STACK_COUNT ? `<span>Perfect bonus</span><span>+${PERFECT_BONUS}</span>` : ""}
        </div>
        ${isBest ? `<p class="new-best">New best score!</p>` : `<p>Best: ${prevBest}</p>`}`;
      $("gameover").returnValue = "";
      $("gameover").showModal();
    }, delay);
  }

  // ---------- rendering ----------

  function rankLabel(rank) {
    return RANK_LABELS[rank] || String(rank);
  }

  function cardEl(card, extraClass = "") {
    const el = document.createElement("div");
    el.className = `card ${card.suit.color} ${extraClass}`.trim();
    const r = rankLabel(card.rank);
    el.setAttribute("aria-label", `${r} of ${card.suit.sym}`);
    el.innerHTML = `
      <div class="corner tl"><span>${r}</span><span>${card.suit.sym}</span></div>
      <div class="pip">${card.suit.sym}</div>
      <div class="corner br"><span>${r}</span><span>${card.suit.sym}</span></div>`;
    return el;
  }

  function render(anim = {}) {
    gridEl.innerHTML = "";
    state.stacks.forEach((stack, i) => {
      const wrap = document.createElement("div");
      wrap.className = `stack ${stack.status}`;
      if (anim.index === i && anim.type === "wrong") wrap.classList.add("shake", "just-died");

      const pile = document.createElement("div");
      pile.className = "pile";

      // Offset backs underneath to hint at how many cards are left.
      const below = stack.cards.length - 1;
      for (let d = Math.min(below, 4); d >= 1; d--) {
        const u = document.createElement("div");
        u.className = "under";
        u.style.transform = `translate(${d * 3}px, ${d * 3}px)`;
        pile.appendChild(u);
      }

      const top = stack.cards[0];
      const justFlipped = anim.index === i && anim.type === "correct";
      pile.appendChild(cardEl(top, justFlipped ? "flip-in" : ""));
      if (justFlipped) pile.appendChild(cardEl(anim.leaving, "leaving"));

      if (anim.index === i && anim.type === "wrong") {
        const rev = document.createElement("div");
        rev.className = "reveal";
        rev.appendChild(cardEl(anim.revealed));
        pile.appendChild(rev);
      }

      if (stack.status === "active") {
        const count = document.createElement("div");
        count.className = "count";
        count.title = "Cards left under this one";
        count.textContent = below;
        pile.appendChild(count);
      }

      wrap.appendChild(pile);

      const g = document.createElement("div");
      g.className = "guesses";
      [
        ["higher", "▲", "Higher"],
        ["same", "=", "Same"],
        ["lower", "▼", "Lower"],
      ].forEach(([choice, symbol, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = symbol;
        b.title = label;
        b.setAttribute("aria-label", `Stack ${i + 1}: ${label}`);
        b.disabled = stack.status !== "active";
        b.addEventListener("click", () => guess(i, choice));
        g.appendChild(b);
      });
      wrap.appendChild(g);

      gridEl.appendChild(wrap);
    });
  }

  const shown = {};
  function setStat(id, value) {
    const el = $(id);
    const text = String(value);
    if (shown[id] !== undefined && shown[id] !== text) {
      el.classList.remove("bump");
      void el.offsetWidth; // restart animation
      el.classList.add("bump");
    }
    shown[id] = text;
    el.textContent = text;
  }

  function updateStats() {
    setStat("score", state.score);
    setStat("correct", state.correct);
    setStat("streak", state.streak);
    setStat("mult", `×${multiplier(state.streak)}`);
    setStat("best", Math.max(loadBest(), state.over ? state.score : 0));
  }

  let toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = `toast ${kind}`;
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1100);
  }

  // ---------- best score (per-browser, optional) ----------

  function loadBest() {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  }
  function saveBest(v) {
    try {
      localStorage.setItem(BEST_KEY, String(v));
    } catch {
      /* storage unavailable; ignore */
    }
  }

  // ---------- wiring ----------

  $("new-game").addEventListener("click", newGame);
  $("rules-btn").addEventListener("click", () => $("rules").showModal());
  $("gameover").addEventListener("close", () => {
    if ($("gameover").returnValue === "new") newGame();
  });

  newGame();
})();
