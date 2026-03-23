/* ============================================================
   Better Goldfishing V2.1 — Game Logic
   ============================================================ */

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

const DICE_RESULTS = [
  {
    title: "Roll 1 — Destroy All Creatures",
    text:  "Destroy all creatures on the battlefield. Heroic Intervention or similar can prevent this.",
    color: '#e87a7a'
  },
  {
    title: "Roll 2 — Destroy a Permanent",
    text:  "Destroy the single permanent most detrimental to your board. You choose honestly.",
    color: '#e8a87a'
  },
  {
    title: "Roll 3 — Sacrifice a Permanent",
    text:  "Sacrifice a nonland permanent of your choice.",
    color: '#e8c97a'
  },
  {
    title: "Roll 4 — Exile Graveyards",
    text:  "Exile all graveyards. Tap a creature at random and place a stun counter on it.",
    color: '#b08aff'
  },
  {
    title: "Roll 5 — Discard a Card",
    text:  "Discard a card of your choice. No cards in hand? Gain +1 time counter instead.",
    color: '#7aaae8'
  },
  {
    title: "Roll 6 — Bounce Highest MV",
    text:  "Return the permanent with the highest mana value to your hand.",
    color: '#7acb95'
  },
];

const STEPS = [
  {
    title: "Start Phase",
    body:  "Untap all permanents. Upkeep triggers resolve. Draw your card for the turn.\n\nThe <em>Opp Life Pool</em> starts at 60 — representing 3 opponents. Once it drops to 30 or below it represents <em>2 opponents</em>. The pill indicator updates automatically."
  },
  {
    title: "Main Phase",
    body:  "Cast spells, play your land, use abilities.\n\nPlaying interaction <em>beyond what you are forced to</em> removes time counters:\n• Single target removal / counterspell / unsummon / disenchant: <em>−1 counter</em>\n• Mass interaction (4+ targets at once): <em>−2 counters</em>\n\nVariable life cost spells (Toxic Deluge, Fire Covenant) must spend <em>at least 5 life</em> to qualify as mass interaction."
  },
  {
    title: "Combat",
    body:  "Attack your simulated opponents. Reduce the <em>Opp Life Pool</em> by damage dealt this combat.\n\nAlternate win conditions (Thassa's Oracle, Revel in Riches, Approach of the Second Sun) can still win the game as normal.\n\nMill decks need <em>200 total cards milled</em> to win, or <em>80 cards</em> to eliminate one simulated opponent."
  },
  {
    title: "End Step",
    body:  "Resolve any end step triggers. Once done, move to the next step.\n\nYou are about to gain a time counter and immediately pay its cost — this happens as a single moment at the end of every turn."
  },
  {
    title: "Gain Time Counter + Lose Life",
    body:  "These two things happen together as one action:\n\n1. Press <em>+1</em> on Time Counters.\n2. Immediately press <em>−1</em> on Your Life for <em>each</em> time counter you now have.\n\nExample: You have 2 counters. Gain 1 → now 3 counters → lose 3 life this turn.\n\nCounters are never spent — they accumulate. Only proactive interaction removes them."
  },
  {
    title: "Roll the Dice",
    body:  "Roll the D6 below and apply the consequence.\n\nYou may use interaction to counter the effect — but doing so <em>does not remove a time counter</em>.\n\nIf you <em>cannot</em> fulfil a roll's requirement (e.g. no cards in hand for Roll 5, no nonland permanents for Roll 3), <em>gain +1 time counter</em> instead.\n\nWhen done, press End Turn to start your next turn."
  },
];

/* ── State ── */
let state = {
  turn: 1,
  step: 0,
  life: 40,
  time: 0,
  oppLife: 60,
  lastRoll: null,
  lastRollCountered: false,
  log: [],
  currentTurnLog: [],
  gameOver: false,
};

/* ── Boot ── */
function init() {
  buildProgress();
  renderStep();
  renderStats();
}

/* ── Step progress bar ── */
function buildProgress() {
  document.getElementById('stepProgress').innerHTML =
    STEPS.map((_, i) => `<div class="step-pip" id="pip${i}"></div>`).join('');
  updatePips();
}

function updatePips() {
  STEPS.forEach((_, i) => {
    const p = document.getElementById('pip' + i);
    if (p) p.className = 'step-pip' +
      (i === state.step ? ' active' : i < state.step ? ' done' : '');
  });
}

/* ── Render current step ── */
function renderStep() {
  const s = STEPS[state.step];
  document.getElementById('stepBadge').textContent   = `STEP ${state.step + 1} / ${STEPS.length}`;
  document.getElementById('stepTitle').textContent   = s.title;
  document.getElementById('stepBody').innerHTML      = s.body.replace(/\n/g, '<br>');
  document.getElementById('nextBtnText').textContent =
    state.step === STEPS.length - 1 ? 'END TURN →' : 'NEXT STEP →';
  document.getElementById('turnBadge').textContent   = `TURN ${state.turn}`;
  updatePips();
}

/* ── Render stats ── */
function renderStats() {
  document.getElementById('lifeVal').textContent = state.life;
  document.getElementById('timeVal').textContent = state.time;
  document.getElementById('oppVal').textContent  = state.oppLife;

  // life loss preview
  const preview = document.getElementById('lifeLossPreview');
  if (state.time > 0) {
    // show what they'll owe NEXT end step (current total + 1)
    const nextCost = state.time + 1;
    preview.textContent = `next end step: −${nextCost}`;
    preview.className   = 'life-loss-preview warning';
  } else {
    preview.textContent = '';
    preview.className   = 'life-loss-preview';
  }

  // opponent mode pill
  const pill = document.getElementById('oppModePill');
  if (state.oppLife > 30) {
    pill.textContent = '⚔ SIMULATING 3 OPPONENTS — ABOVE 30 LIFE';
    pill.className   = 'opp-mode-pill three';
  } else {
    pill.textContent = '⚔ SIMULATING 2 OPPONENTS — 30 LIFE OR BELOW';
    pill.className   = 'opp-mode-pill two';
  }

  // win progress bar
  const dealt = Math.max(0, 60 - state.oppLife);
  const pct   = Math.min(100, (dealt / 60) * 100);
  document.getElementById('winBarFill').style.width  = pct + '%';
  document.getElementById('winBarLabel').textContent =
    state.oppLife <= 0 ? 'WIN!' : `${state.oppLife} remaining`;
}

/* ── Adjust opponent life ── */
function adjustOpp(delta) {
  if (state.gameOver) return;
  const prev     = state.oppLife;
  state.oppLife  = Math.max(0, prev + delta);
  const diff     = state.oppLife - prev;
  if (diff !== 0) {
    state.currentTurnLog.push({
      cls:  'opp-life',
      text: `Opp life pool: ${diff > 0 ? '+' : ''}${diff} → ${state.oppLife}`
    });
    flashEl('oppVal');
  }
  renderStats();
  if (state.oppLife <= 0) endGame('Opponent life pool reached zero — you win!');
}

/* ── Adjust your life or time counters ── */
function adjustStat(type, delta) {
  if (state.gameOver) return;

  if (type === 'life') {
    const prev = state.life;
    state.life = Math.max(0, prev + delta);
    const diff = state.life - prev;
    if (diff !== 0) {
      state.currentTurnLog.push({
        cls:  diff > 0 ? 'life-gain' : 'life-loss',
        text: `Your life: ${diff > 0 ? '+' : ''}${diff} → ${state.life}`
      });
      flashEl('lifeVal');
    }
    renderStats();
    if (state.life <= 0) endGame('You ran out of life.');

  } else {
    const prev = state.time;
    state.time = Math.max(0, prev + delta);
    const diff = state.time - prev;
    if (diff !== 0) {
      state.currentTurnLog.push({
        cls:  diff > 0 ? 'counter-add' : 'counter-remove',
        text: `Time counters: ${diff > 0 ? '+' : ''}${diff} → ${state.time}`
      });
      flashEl('timeVal');
    }
    renderStats();
  }
}

/* ── Flash animation helper ── */
function flashEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth; // force reflow
  el.classList.add('flash');
}

/* ── Advance step / end turn ── */
function nextStep() {
  if (state.gameOver) return;

  if (state.step === STEPS.length - 1) {
    // Commit this turn's log
    if (state.currentTurnLog.length > 0)
      state.log.push({ turn: state.turn, entries: [...state.currentTurnLog] });
    state.currentTurnLog   = [];
    state.turn++;
    state.step             = 0;
    state.lastRoll         = null;
    state.lastRollCountered = false;
    resetDiceUI();
  } else {
    state.step++;
  }

  renderStep();
}

/* ── Dice roll ── */
function rollDice() {
  if (state.gameOver) return;
  const btn = document.getElementById('diceBtn');
  btn.classList.add('rolling');
  btn.disabled = true;

  let ticks = 0;
  const iv = setInterval(() => {
    document.getElementById('diceDisplay').textContent =
      DICE_FACES[Math.floor(Math.random() * 6)];

    if (++ticks >= 8) {
      clearInterval(iv);
      const roll = Math.floor(Math.random() * 6);
      const res  = DICE_RESULTS[roll];

      state.lastRoll         = roll;
      state.lastRollCountered = false;

      document.getElementById('diceDisplay').textContent   = DICE_FACES[roll];
      btn.classList.remove('rolling');
      btn.disabled = false;

      document.getElementById('resultPlaceholder').style.display = 'none';
      document.getElementById('resultContent').style.display     = 'block';
      document.getElementById('resultRoll').textContent  = res.title;
      document.getElementById('resultRoll').style.color  = res.color;
      document.getElementById('resultText').textContent  = res.text;
      document.getElementById('resultCard').classList.add('has-result');
      document.getElementById('counterBtn').classList.add('visible');

      state.currentTurnLog.push({
        cls:  'consequence',
        text: `Rolled ${roll + 1}: ${res.title}`
      });

      document.getElementById('resultCard')
        .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 60);
}

/* ── Counter a dice effect ── */
function counterEffect() {
  if (state.lastRoll === null || state.lastRollCountered) return;
  state.lastRollCountered = true;
  const res = DICE_RESULTS[state.lastRoll];
  document.getElementById('resultRoll').textContent =
    res.title + ' — COUNTERED';
  document.getElementById('resultText').textContent =
    '⚔ Effect countered. No time counter removed.';
  document.getElementById('counterBtn').classList.remove('visible');
  state.currentTurnLog.push({
    cls:  'countered',
    text: `Roll ${state.lastRoll + 1} countered — no time counter removed`
  });
}

/* ── Reset dice UI ── */
function resetDiceUI() {
  document.getElementById('diceDisplay').textContent             = '⚄';
  document.getElementById('resultPlaceholder').style.display     = 'block';
  document.getElementById('resultContent').style.display         = 'none';
  document.getElementById('resultCard').classList.remove('has-result');
  document.getElementById('counterBtn').classList.remove('visible');
}

/* ── End game ── */
function endGame(reason) {
  state.gameOver = true;

  document.getElementById('gameOverSub').textContent =
    reason + ' — ' + state.turn +
    (state.turn === 1 ? ' turn played.' : ' turns played.');

  const allLog = [...state.log];
  if (state.currentTurnLog.length > 0)
    allLog.push({ turn: state.turn, entries: state.currentTurnLog });

  const logEl = document.getElementById('gameLog');
  logEl.innerHTML = allLog.length === 0
    ? '<p style="color:var(--muted);font-style:italic;font-size:13px;">No events recorded.</p>'
    : allLog.map(t => `
        <div class="turn-entry">
          <div class="turn-label">TURN ${t.turn}</div>
          ${t.entries.map(e =>
            `<div class="log-line ${e.cls}">${e.text}</div>`
          ).join('')}
        </div>`).join('');

  document.getElementById('gameOverlay').classList.add('visible');
}

/* ── Reset / play again ── */
function resetGame() {
  state = {
    turn: 1, step: 0,
    life: 40, time: 0, oppLife: 60,
    lastRoll: null, lastRollCountered: false,
    log: [], currentTurnLog: [], gameOver: false,
  };
  resetDiceUI();
  buildProgress();
  renderStep();
  renderStats();
  document.getElementById('gameOverlay').classList.remove('visible');
}

/* ── PWA service worker registration ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ── Start ── */
init();
