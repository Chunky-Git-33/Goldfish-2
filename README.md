# Better Goldfishing V2.1

A solo Commander (EDH) practice tool for testing and tuning your deck without opponents.

🎴 **[Open the App](https://chunky-git-33.github.io/Goldfish-2/)**

---

## What is Goldfishing?

Goldfishing is the practice of playing your Commander deck alone to test how consistently it performs — how fast it can win, how well it draws, and how efficiently it uses its mana. Better Goldfishing V2.1 adds a pressure system to make solo practice more meaningful.

---

## How to Play

### Goal
Reduce the **Opponent Life Pool** from 60 to 0. The pool represents 3 simulated opponents above 30 life, and 2 opponents at 30 or below.

### Each Turn
Follow the 6 steps shown in the app:

1. **Start Phase** — Untap, upkeep, draw
2. **Main Phase** — Cast spells and use abilities
3. **Combat** — Attack and reduce the Opponent Life Pool
4. **End Step** — Resolve end step triggers
5. **Gain Time Counter + Lose Life** — Add 1 time counter, then immediately lose life equal to your total time counter count
6. **Roll the Dice** — Roll a D6 and apply the consequence

### Time Counters
Time counters accumulate each turn and drain your life. They are removed by casting **proactive interaction**:
- Single target interaction (removal, counterspell, unsummon, disenchant): **−1 counter**
- Mass interaction (spell or ability hitting 4+ targets): **−2 counters**

Interaction only counts if it is played **beyond what you are forced to** — proactive, not reactive.

### The D6 Consequences
| Roll | Effect |
|------|--------|
| 1 | Destroy all creatures |
| 2 | Destroy the permanent most detrimental to your board |
| 3 | Sacrifice a nonland permanent of your choice |
| 4 | Exile all graveyards, stun a random creature |
| 5 | Discard a card of your choice |
| 6 | Return the highest mana value permanent to your hand |

You may use interaction to **counter** a dice effect, but doing so does not remove a time counter.

If you **cannot** fulfil a roll's requirement, gain **+1 time counter** instead.

### Alternate Win Conditions
Cards like Thassa's Oracle, Revel in Riches, and Approach of the Second Sun still win normally. Mill decks need 200 total cards milled to win, or 80 to eliminate one simulated opponent.
