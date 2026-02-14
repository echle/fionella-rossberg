# Feature Specification: Economy System with Game Clock

**Feature Branch**: `006-economy-game-clock`  
**Created**: 2026-02-14  
**Status**: Draft  
**Input**: User description: "Currency system with shop, time-based gift drops, game clock, and game over state when all three stats reach zero"

## User Scenarios & Testing *(mandatory)*

<!--
  This feature introduces a self-sustaining economy loop:
  1. Player earns currency through care actions
  2. Player spends currency in shop to buy items
  3. Time-based gifts provide passive income
  4. Game clock tracks play session time
  5. Game over state when horse neglect reaches critical level
  
  Each story is independently valuable and testable.
-->

### User Story 1 - Currency System (Earn Horseshoes) (Priority: P1)

Fionella performs care actions (feeding, grooming, petting) on her horse and earns **Horseshoes (🪙)** as rewards. She can see her total currency balance displayed prominently in the UI. The currency persists across sessions and accumulates over time.

**Why this priority**: Foundation for the entire economy loop. Without currency earning, the shop has no purpose. This is the core mechanic that makes items renewable.

**Independent Test**: Start game → perform 5 care actions (feed, groom, pet) → verify currency counter increases after each action → refresh page → verify currency persists.

**Acceptance Scenarios**:

1. **Given** Fionella starts a new game, **When** the game loads, **Then** her Horseshoe balance is initialized to 50 🪙 (starting capital)
2. **Given** Fionella has a horse with hunger < 100, **When** she feeds the horse a carrot, **Then** she earns +5 🪙 immediately after the eating animation completes
3. **Given** Fionella has a horse with cleanliness < 100, **When** she grooms the horse with the brush, **Then** she earns +3 🪙 per brush stroke
4. **Given** Fionella pets her horse, **When** the petting interaction completes, **Then** she earns +2 🪙
5. **Given** Fionella has earned currency, **When** she refreshes the page, **Then** her currency balance is restored from LocalStorage
6. **Given** the game displays currency, **When** the balance updates, **Then** a smooth counter animation shows the increase (e.g., 45 → 50 with tweening)
7. **Given** Fionella's currency UI, **When** displayed, **Then** it shows a Horseshoe icon (🪙) followed by the numeric balance (e.g., "🪙 50")

---

### User Story 2 - Shop System (Buy Items with Currency) (Priority: P2)

Fionella opens a shop interface where she can purchase carrots, brushes, and other items using her earned Horseshoes (🪙). The shop displays item prices clearly and prevents purchases if she has insufficient funds. After buying items, her inventory updates immediately.

**Why this priority**: Completes the economy loop started in P1. Enables item regeneration which solves the core problem of finite resources. Second priority because it builds on the currency system.

**Independent Test**: Earn 10 🪙 → open shop → buy 1 carrot for 5 🪙 → verify inventory increases and currency decreases → attempt to buy expensive item with insufficient funds → verify purchase is blocked.

**Acceptance Scenarios**:

1. **Given** Fionella is in the game, **When** she clicks the Shop button (🛒 icon, translated label) in the top UI bar, **Then** a modal/overlay opens displaying available items for purchase
2. **Given** the Shop is open, **When** displayed, **Then** it shows at least: Carrot (5 🪙), Brush Refill (8 🪙), Premium Carrot Bundle (15 🪙 → 5 carrots)
3. **Given** the Shop is open and Fionella has 20 🪙, **When** she clicks "Buy Carrot (5 🪙)", **Then** her currency decreases by 5 (to 15 🪙), her carrot inventory increases by 1, and visual feedback confirms the purchase
4. **Given** the Shop is open and Fionella has 3 🪙, **When** she tries to buy a Carrot (5 🪙), **Then** the purchase is blocked with a visual indicator (button grayed out or error message "Nicht genug Hufeisen!")
5. **Given** Fionella purchases a Brush Refill (8 🪙), **When** the purchase completes, **Then** her brush uses increase by 50 charges
6. **Given** the Shop is open, **When** Fionella clicks outside the modal or presses a close button, **Then** the shop closes and gameplay resumes
7. **Given** Shop prices are displayed, **When** rendered, **Then** each item shows: Icon, Name (translated), Price (🪙 X), and a "Kaufen" button

---

### User Story 3 - Game Clock (Play Session Timer) (Priority: P3)

Fionella sees a game clock that starts at 00:00:00 when she begins a new session (or resets the game). The clock ticks upward in real-time (HH:MM:SS format) and is displayed in the UI. The clock persists across page refreshes but resets to 00:00:00 when she explicitly restarts the game.

**Why this priority**: Enables time-based features (gifts, achievements). Third priority because it's infrastructure for P4, but has standalone value as a session tracker.

**Independent Test**: Start game → observe clock starts at 00:00:00 → wait 65 seconds → verify clock shows 00:01:05 → refresh page → verify clock continues from last time → reset game → verify clock resets to 00:00:00.

**Acceptance Scenarios**:

1. **Given** Fionella starts a new game or clicks Reset, **When** the game initializes, **Then** the game clock starts at 00:00:00
2. **Given** the game is running, **When** time passes, **Then** the clock increments every second (00:00:00 → 00:00:01 → ... → 00:01:00)
3. **Given** the game clock is displayed in the UI, **When** visible, **Then** it shows format "⏱️ HH:MM:SS" (e.g., "⏱️ 00:05:32")
4. **Given** Fionella plays for 5 minutes then refreshes the page, **When** the game loads, **Then** the clock resumes from the elapsed time (e.g., continues from 00:05:00)
5. **Given** Fionella has played for 1 hour, **When** the clock reaches 01:00:00, **Then** it continues counting upward (no max limit)
6. **Given** Fionella clicks the Reset button, **When** the game resets, **Then** the clock resets to 00:00:00 and starts counting again
7. **Given** the clock is running, **When** the tab is backgrounded, **Then** elapsed time is calculated correctly when the tab returns to foreground

---

### User Story 4 - Time-Based Gift Drops (Passive Income) (Priority: P4)

Fionella receives periodic "Mystery Gift Boxes" that appear on the screen every 5 minutes of game time (based on the game clock). Clicking a gift box opens it and rewards her with random items (carrots, brush refills, or bonus currency). Gifts persist visually until claimed.

**Why this priority**: Adds passive income and encourages return visits. Fourth priority because it depends on the game clock (P3) and enhances retention but isn't critical for core gameplay loop.

**Independent Test**: Start game → wait for game clock to reach 00:05:00 → observe gift box appears → click gift box → verify random reward is granted → wait another 5 minutes → verify second gift appears.

**Acceptance Scenarios**:

1. **Given** the game clock reaches a multiple of 5 minutes (00:05:00, 00:10:00, etc.), **When** the time threshold is crossed, **Then** a "🎁 Mystery Box" appears at a random position on the screen with a gentle bounce animation
2. **Given** a Mystery Box is visible, **When** Fionella clicks it, **Then** the box opens with an animation and reveals a random reward: 50% chance = 2 carrots, 30% chance = 20 brush charges, 20% chance = 10 🪙
3. **Given** a reward is revealed, **When** displayed, **Then** the reward animates into the inventory/currency display (e.g., carrots fly to inventory icon)
4. **Given** a Mystery Box is clicked, **When** the reward is claimed, **Then** the box disappears with a fade-out effect
5. **Given** multiple 5-minute intervals pass without claiming gifts, **When** gifts are not claimed, **Then** multiple gift boxes accumulate on screen (max 3 unclaimed at once)
6. **Given** 3 unclaimed gift boxes exist, **When** the next 5-minute interval triggers, **Then** no new gift spawns (prevents screen clutter)
7. **Given** the game clock is reset, **When** the reset occurs, **Then** all unclaimed gift boxes are cleared and the 5-minute timer restarts

---

### User Story 5 - Game Over State (All Stats at Zero) (Priority: P5)

When Fionella's horse reaches 0% in all three stats (Hunger, Cleanliness, Happiness), the game enters a "Game Over" state. The horse displays a sad/sick animation, all interactions are disabled except the Reset button, and a message explains that the horse needs proper care. This creates consequence for neglect.

**Why this priority**: Adds stakes and meaningful failure state. Fifth priority because it's polish that makes the game feel complete, but doesn't block core economy loop.

**Independent Test**: Use debug mode to drain all stats to 0 → verify game over screen appears → verify interactions are blocked → click Reset → verify game resumes normally.

**Acceptance Scenarios**:

1. **Given** the horse has Hunger = 0, Cleanliness = 0, and Happiness = 0 simultaneously, **When** all three conditions are met, **Then** the game enters "Game Over" state
2. **Given** Game Over state is active, **When** triggered, **Then** a semi-transparent overlay appears with text: "💔 Dein Pferd braucht dringend Pflege! / Your horse needs urgent care!" (translated)
3. **Given** Game Over overlay is displayed, **When** visible, **Then** the horse sprite changes to a "sick" or "collapsed" animation (reuse idle frame with desaturated color or special frame)
4. **Given** Game Over state is active, **When** Fionella tries to feed/groom/pet, **Then** all care interactions are disabled (buttons grayed out, clicks do nothing)
5. **Given** Game Over overlay is displayed, **When** visible, **Then** a prominent "[Neustart / Reset]" button is shown as the only interactive element
6. **Given** Game Over state and Fionella clicks Reset, **When** reset is triggered, **Then** the game resets fully (stats to default, clock to 00:00:00, unclaimed gifts cleared, overlay removed)
7. **Given** Game Over state is prevented, **When** any one stat is above 0, **Then** the game continues normally (e.g., Hunger = 0, Cleanliness = 5, Happiness = 0 → no game over)

---

### User Story 6 - Visual Shop UI & UX Polish (Priority: P6)

The shop interface is polished with smooth animations, clear visual hierarchy, and delightful feedback. Items are displayed in a grid with icons, prices are color-coded, purchase buttons provide haptic-like feedback, and the modal has smooth open/close transitions.

**Why this priority**: UX polish that makes the shop feel premium. Lowest priority because functional shop (P2) works without this, but significantly improves player experience.

**Independent Test**: Open shop → observe smooth modal animation → hover over items → observe hover effects → buy item → observe purchase animation and success feedback.

**Acceptance Scenarios**:

1. **Given** Fionella clicks the Shop button, **When** the shop opens, **Then** the modal scales in with a smooth ease-out animation (0.3s duration)
2. **Given** the Shop is displayed, **When** visible, **Then** items are arranged in a grid (2-3 columns) with consistent spacing
3. **Given** an item in the shop, **When** Fionella hovers over it (desktop) or touches it (mobile), **Then** the item card scales up slightly (1.05x) and shows a subtle shadow
4. **Given** Fionella has sufficient currency and clicks "Buy", **When** the purchase succeeds, **Then** a success animation plays (checkmark icon, green flash) and the item count increments with a number pop animation
5. **Given** Fionella has insufficient currency, **When** hovering over an item, **Then** the price is displayed in red and the button shows "Zu teuer! / Too expensive!"
6. **Given** the Shop displays prices, **When** rendered, **Then** prices use consistent formatting: affordable items = white, expensive items = gold color
7. **Given** Fionella closes the shop, **When** closing, **Then** the modal scales out with a smooth ease-in animation

---

### Edge Cases

- **What happens when the user earns currency while the Shop is open?**
  - Currency balance updates in real-time in both the top UI bar and the shop modal. Shop affordability checks are re-evaluated immediately.

- **What happens when the user reaches 999,999 🪙 (max currency)?**
  - Currency is capped at 999,999. Further earnings are ignored (no overflow). Toast notification appears (3s duration, top-center, fade-out): "Max Hufeisen erreicht! / Max Horseshoes reached!"

- **What happens when a Mystery Gift appears off-screen on narrow viewports?**
  - Gift spawn positions constrain to viewport bounds with a 50px margin. On mobile (<500px width), gifts spawn centered horizontally with ±20% random horizontal offset.

- **What happens when all three stats decay to 0 while a Mystery Gift is unclaimed?**
  - Game Over state takes precedence. Unclaimed gifts are cleared. After reset, gifts resume spawning.

- **What happens when the user leaves the tab open for 8 hours and returns?**
  - Game clock calculates elapsed time accurately (up to 24 hours max). Multiple gifts spawn (up to 3 max). Stats decay fully and Game Over may trigger.

- **What happens when the user resets the game while the Shop modal is open?**
  - Shop modal closes automatically. Reset proceeds normally. Currency resets to starting value (50 🪙).

- **What happens when the user buys the last carrot in the shop (inventory now has 1 carrot) and feeds it immediately?**
  - Carrot inventory goes to 0. Player earns 5 🪙 from feeding. Can immediately return to shop and buy more if affordable.

- **What happens when the game clock reaches 99:59:59?**
  - Clock continues to 100:00:00 and beyond. Format adjusts to accommodate 3+ digit hours (e.g., "⏱️ 123:45:32").

- **What happens when a stat decays to 0 but the other two are above 0?**
  - No Game Over. Single stat at 0 is allowed (e.g., horse can be clean and happy but hungry). Game Over requires ALL three at 0.

## Requirements *(mandatory)*

### Functional Requirements

#### Currency System
- **FR-001**: System MUST track player currency (Horseshoes) as an integer value in game state
- **FR-002**: System MUST award currency after each successful care action: Feed = +5 🪙, Groom = +3 🪙, Pet = +2 🪙
- **FR-003**: System MUST initialize new players with 50 🪙 starting currency
- **FR-004**: System MUST persist currency balance to LocalStorage after each transaction
- **FR-005**: System MUST cap maximum currency at 999,999 🪙 (prevent overflow)
- **FR-006**: System MUST display currency balance in top UI bar with icon and counter

#### Shop System
- **FR-007**: System MUST provide a shop UI accessible via a button in the top bar
- **FR-008**: Shop MUST display at least: Carrot (5 🪙 → 1 carrot), Brush Refill (8 🪙 → 50 uses), Premium Bundle (15 🪙 → 5 carrots)
- **FR-009**: System MUST validate player has sufficient currency before allowing purchases
- **FR-010**: System MUST deduct currency and add items to inventory atomically (no partial transactions)
- **FR-011**: Shop MUST update affordability indicators in real-time as currency changes
- **FR-012**: Shop MUST support translation (DE/EN) via existing i18n service
- **FR-013**: System MUST close shop modal when clicking outside bounds or close button

#### Game Clock
- **FR-014**: System MUST track elapsed play time in seconds since game start or reset
- **FR-015**: System MUST display game clock in HH:MM:SS format in the UI
- **FR-016**: System MUST persist game clock start timestamp to LocalStorage
- **FR-017**: System MUST calculate elapsed time accurately across page refreshes based on timestamp
- **FR-018**: System MUST reset game clock to 00:00:00 when Reset button is clicked
- **FR-019**: System MUST continue clock accurately when tab is backgrounded/foregrounded (using Date.now() delta)
- **FR-020**: Clock MUST support display beyond 99:59:59 (e.g., 123:45:32 for long sessions)

#### Time-Based Gifts
- **FR-021**: System MUST spawn a Mystery Gift Box every 5 minutes of game clock time (5:00, 10:00, 15:00, etc.)
- **FR-022**: System MUST position gift boxes randomly within viewport bounds (50px margin)
- **FR-023**: System MUST limit maximum unclaimed gifts to 3 simultaneously (prevent spawn if 3 exist)
- **FR-024**: System MUST award random reward when gift is clicked: 50% = 2 carrots, 30% = 20 brush uses, 20% = 10 🪙
- **FR-025**: System MUST remove claimed gift boxes with fade-out animation
- **FR-026**: System MUST clear all unclaimed gifts when game is reset
- **FR-027**: System MUST persist gift spawn times to handle page refreshes (spawn missed gifts up to 3 max)

#### Game Over State
- **FR-028**: System MUST check for Game Over condition: Hunger = 0 AND Cleanliness = 0 AND Happiness = 0
- **FR-029**: System MUST trigger Game Over state only when all three stats reach 0 simultaneously
- **FR-030**: System MUST display Game Over overlay with translated message when triggered
- **FR-031**: System MUST disable all care interactions (feed, groom, pet, shop) during Game Over
- **FR-032**: System MUST enable only the Reset button during Game Over state
- **FR-033**: System MUST change horse sprite to "sick" visual state during Game Over
- **FR-034**: System MUST clear Game Over state when Reset is clicked and resume normal gameplay

#### Integration Requirements
- **FR-035**: Currency earning MUST integrate with existing care action flow (actions.ts)
- **FR-036**: Shop purchases MUST update existing inventory state (carrots, brushUses)
- **FR-037**: Game clock MUST not interfere with existing decay timers (hunger, cleanliness, happiness decay)
- **FR-038**: Game Over check MUST run after each decay tick
- **FR-039**: Reset button MUST reset currency, clock, gifts, and Game Over state in addition to existing reset behavior
- **FR-040**: All new text MUST use i18nService for DE/EN translations

### Non-Functional Requirements

- **NFR-001**: Currency counter animation MUST complete within 500ms (smooth = quadratic easing, 60 FPS maintained)
- **NFR-002**: Shop modal open/close animation MUST be smooth (0.3s duration, 60 FPS maintained, ease-out/ease-in curves)
- **NFR-003**: Game clock update MUST not cause performance degradation (update max once per second)
- **NFR-004**: Mystery Gift spawn animation MUST be visible and delightful (bounce = elastic easing, 0.5s duration, scale 0→1.2→1.0)
- **NFR-005**: System MUST maintain 60 FPS during normal gameplay with all features active
- **NFR-006**: Currency/clock/gifts data MUST persist correctly across browser sessions (LocalStorage reliability)
- **NFR-007**: Shop UI MUST be responsive on mobile viewports (320px - 2560px)

### Key Entities *(include if feature involves data)*

- **Currency (Horseshoes)**: Represents player wealth/purchasing power. Attributes: balance (integer 0-999999), starting value (50). Earned through care actions, spent in shop. Persisted to LocalStorage.

- **Shop Item**: Represents purchasable items in the shop. Attributes: id (string), nameKey (i18n key), icon (emoji/sprite), price (integer 🪙), rewardType (carrot/brushUses/currency), rewardAmount (integer). Static configuration, not persisted.

- **Game Clock**: Represents elapsed play session time. Attributes: startTimestamp (Date.now() milliseconds), elapsedSeconds (calculated). Resets on game reset, persists timestamp to LocalStorage.

- **Mystery Gift Box**: Represents time-based reward drops. Attributes: spawnTime (game clock seconds), position (x, y coordinates), claimed (boolean). Spawns every 5 minutes, max 3 unclaimed, cleared on reset.

- **Game Over State**: Represents failure condition. Attributes: isGameOver (boolean), triggered when all three stats (hunger, cleanliness, happiness) equal 0. Blocks interactions except reset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can earn currency and make a shop purchase within 2 minutes of starting gameplay (verify with user testing)

- **SC-002**: Currency earning/spending loop functions without bugs over 1 hour of continuous play (no negative currency, no inventory corruption)

- **SC-003**: Game clock accurately tracks time across 10 page refreshes within 1 hour session (±5 second tolerance)

- **SC-004**: Mystery Gifts spawn at correct intervals (5min ±5sec) for 30 minutes of gameplay, max 3 unclaimed gifts enforced

- **SC-005**: Game Over state triggers correctly when all stats reach 0, and Reset button restores gameplay fully in <2 seconds

- **SC-006**: Shop UI is usable on mobile devices (320px width) - users can read item names, prices, and tap buy buttons without mis-clicks

- **SC-007**: All new UI text displays correctly in both German and English (via i18n service)

- **SC-008**: System maintains 60 FPS performance on mid-range devices (iPhone 12, Galaxy S21) with all features active

- **SC-009**: 90% of test users understand the currency earning → shop purchasing loop without external explanation

- **SC-010**: Game state (currency, clock, gifts) persists correctly across browser close/reopen with 100% reliability (tested 20 cycles)
