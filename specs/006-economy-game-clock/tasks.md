---
description: "Implementation tasks for Economy System with Game Clock"
---

# Tasks: Economy System with Game Clock

**Input**: Design documents from `/specs/006-economy-game-clock/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Total Tasks**: 90 (T001-T090)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3...)
- Include exact file paths in descriptions

## Path Conventions

- Project root: `/workspaces/codespaces-blank/`
- Source code: `src/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and dependencies are ready

- [X] T001 Verify TypeScript 5.0+ and Phaser 3.80 dependencies in package.json
- [X] T002 Verify Zustand 4.5 state management is available in package.json
- [X] T003 Confirm existing src/ structure matches plan.md (config/, entities/, scenes/, state/, systems/, utils/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Extend GameState interface in src/state/types.ts to add currency: number, gameClock: {startTimestamp: number | null}, giftBoxes: GiftBoxState[], isGameOver: boolean
- [X] T005 [P] Define ShopItem interface in src/state/types.ts with id, nameKey, icon, price, reward properties
- [X] T006 [P] Define GiftBoxState interface in src/state/types.ts with id, spawnTime, position, challenged properties
- [X] T007 [P] Add i18n translation keys in src/locales/ for shop items, currency, game clock, game over messages (DE/EN)
- [X] T008 Create SHOP_ITEMS configuration array in src/config/gameConstants.ts with 3 default items (carrot_single: 5🪙, brush_refill: 8🪙, carrot_bundle: 15🪙)
- [X] T009 [P] Add CURRENCY_REWARDS constant in src/config/gameConstants.ts (FEED: 5, GROOM: 3, PET: 2)
- [X] T010 [P] Add GIFT_SPAWN_INTERVAL constant in src/config/gameConstants.ts (300 seconds)
- [X] T011 Initialize currency: 50 in gameStore initial state in src/state/gameStore.ts
- [X] T012 Initialize gameClock: {startTimestamp: null} in gameStore initial state in src/state/gameStore.ts
- [X] T013 Initialize giftBoxes: [] in gameStore initial state in src/state/gameStore.ts
- [X] T014 Initialize isGameOver: false in gameStore initial state in src/state/gameStore.ts
- [X] T015 Extend SaveSystem in src/systems/SaveSystem.ts to persist currency, gameClock, giftBoxes, isGameOver to LocalStorage
- [X] T016 Add formatGameClock(seconds: number): string utility function in src/utils/timeUtils.ts to format seconds as HH:MM:SS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Currency System (Priority: P1) 🎯 MVP

**Goal**: Players earn Horseshoes (🪙) through care actions and see their balance update in real-time.

**Independent Test**: Start game → perform 5 care actions (feed, groom, pet) → verify currency counter increases after each action → refresh page → verify currency persists at 50 + earned amount.

### Implementation for User Story 1

- [X] T017 [P] [US1] Create earnCurrency(amount: number): void action in src/state/actions.ts that adds currency (capped at 999,999) and triggers save
- [X] T018 [P] [US1] Create getCurrencyBalance(): number selector in src/state/actions.ts that returns current currency value
- [X] T019 [US1] Extend feed() action in src/state/actions.ts to call earnCurrency(5) after hunger increase
- [X] T020 [US1] Extend groom() action in src/state/actions.ts to call earnCurrency(3) after cleanliness increase
- [X] T021 [US1] Extend pet() action in src/state/actions.ts to call earnCurrency(2) after happiness increase
- [X] T022 [US1] Create currency display text object in src/scenes/UIScene.ts at top-right showing "🪙 [balance]"
- [X] T023 [US1] Add Zustand subscription in src/scenes/UIScene.ts to update currency text when state.currency changes
- [X] T024 [US1] Create animateCurrencyCounter(from: number, to: number, textObject) utility in src/scenes/UIScene.ts using Phaser tweens with 500ms duration
- [X] T025 [US1] Connect currency animation to earnCurrency action so counter smoothly increments from old to new value

**Checkpoint**: At this point, User Story 1 should be fully functional - players earn currency through care actions and see it update in real-time.

---

## Phase 4: User Story 2 - Shop System (Priority: P2)

**Goal**: Players can open a shop, view items with prices, and purchase items using earned currency.

**Independent Test**: Earn 10 🪙 → open shop → buy 1 carrot for 5 🪙 → verify inventory increases and currency decreases → attempt to buy expensive item with insufficient funds → verify purchase is blocked with visual feedback.

### Implementation for User Story 2

- [X] T026 [P] [US2] Create spendCurrency(amount: number): boolean action in src/state/actions.ts that deducts currency if affordable and returns success
- [X] T027 [P] [US2] Create canAfford(price: number): boolean action in src/state/actions.ts that checks if currency >= price
- [X] T028 [P] [US2] Create purchaseItem(itemId: string): boolean action in src/state/actions.ts that validates affordability, spends currency, grants reward
- [X] T029 [US2] Create ShopScene class in src/scenes/ShopScene.ts extending Phaser.Scene with create() method
- [X] T030 [US2] Add ShopScene to scene list in src/config/phaserConfig.ts
- [X] T031 [US2] Implement semi-transparent background overlay (0x000000, alpha 0.7) in ShopScene.create()
- [X] T032 [US2] Add shop title text "Shop / Laden" using i18nService in ShopScene.create()
- [X] T033 [US2] Create item grid layout in ShopScene.create() that renders SHOP_ITEMS in 2-3 column grid
- [X] T034 [US2] Create ItemCard component rendering for each shop item (icon, name, price, buy button)
- [X] T035 [US2] Add buy button click handler that calls purchaseItem(item.id) and shows success/error feedback
- [X] T036 [US2] Implement real-time affordability check - subscribe to currency changes and update button states (gray out if too expensive)
- [X] T037 [US2] Add close button (X icon) in top-right that calls this.scene.stop('ShopScene')
- [X] T038 [US2] Create shop button in UIScene top bar (🛒 icon with i18n label 'shop.button') that launches ShopScene with this.scene.launch('ShopScene')
- [X] T039 [US2] Add shop modal open/close handling - pause/resume MainGameScene optionally

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - players can earn currency and spend it in the shop to buy items.

---

## Phase 5: User Story 3 - Game Clock (Priority: P3)

**Goal**: Display a game clock that tracks elapsed play session time in HH:MM:SS format.

**Independent Test**: Start game → observe clock starts at 00:00:00 → wait 65 seconds → verify clock shows 00:01:05 → refresh page → verify clock continues from last time → reset game → verify clock resets to 00:00:00.

### Implementation for User Story 3

- [X] T040 [P] [US3] Create startGameClock(): void action in src/state/actions.ts that sets gameClock.startTimestamp = Date.now()
- [X] T041 [P] [US3] Create getElapsedSeconds(): number action in src/state/actions.ts that calculates (Date.now() - startTimestamp) / 1000
- [X] T042 [P] [US3] Create resetGameClock(): void action in src/state/actions.ts that resets startTimestamp to Date.now() and clears gifts
- [X] T043 [US3] Call startGameClock() in src/state/gameStore.ts on initial game load if startTimestamp is null
- [X] T044 [US3] Create game clock display text object in src/scenes/UIScene.ts showing "⏱️ HH:MM:SS" format
- [X] T045 [US3] Add Phaser time event in UIScene.create() that updates clock display every 1000ms using getElapsedSeconds() and formatGameClock()
- [X] T046 [US3] Extend reset() action in src/state/actions.ts to call resetGameClock() so clock resets to 00:00:00 on game reset

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - clock tracks play time accurately across refreshes.

---

## Phase 6: User Story 4 - Time-Based Gift Drops (Priority: P4)

**Goal**: Mystery gift boxes spawn every 5 minutes of game time and grant random rewards when clicked.

**Independent Test**: Start game → wait for game clock to reach 00:05:00 → observe gift box appears with bounce animation → click gift box → verify random reward is granted → wait another 5 minutes → verify second gift appears.

### Implementation for User Story 4

- [X] T047 [P] [US4] Create GiftBox entity class in src/entities/GiftBox.ts extending Phaser.GameObjects.Sprite with click handler
- [X] T048 [P] [US4] Create GiftSpawnSystem class in src/systems/GiftSpawnSystem.ts with checkSpawnConditions() method
- [X] T049 [P] [US4] Create spawnGiftBox(): GiftBoxState | null action in src/state/actions.ts that adds gift to state if conditions met (elapsed % 300 === 0, max 3)
- [X] T050 [P] [US4] Create claimGiftBox(giftId: string): {type, amount} | null action in src/state/actions.ts with random reward logic (50% 2 carrots, 30% 20 brush, 20% 10 currency)
- [X] T051 [P] [US4] Create clearGiftBoxes(): void action in src/state/actions.ts that empties giftBoxes array
- [X] T052 [US4] Implement getRandomSafePosition() utility in GiftSpawnSystem that calculates position with 50px margin, avoiding UI zones
- [X] T053 [US4] Add gift spawn check in MainGameScene.update() that calls GiftSpawnSystem every frame to detect 5-minute intervals
- [X] T054 [US4] Render GiftBox sprites in MainGameScene for each gift in state.giftBoxes array with bounce animation
- [X] T055 [US4] Add click handler on GiftBox sprite that calls claimGiftBox(gift.id) and removes sprite from scene
- [X] T056 [US4] Implement reward animation when gift is claimed - items fly to inventory/currency display
- [X] T057 [US4] Handle missed gift spawns on page load - spawn up to 3 gifts for missed 5-minute intervals
- [X] T058 [US4] Extend reset() action in src/state/actions.ts to call clearGiftBoxes() so gifts clear on reset
- [X] T059 [US4] Add gift box sprite asset loading in src/scenes/BootScene.ts (MVP: use 🎁 emoji fallback; custom sprite optional for polish phase)

**Checkpoint**: All user stories 1-4 should now work independently - gifts spawn every 5 minutes and grant rewards.

---

## Phase 7: User Story 5 - Game Over State (Priority: P5)

**Goal**: When all three stats reach zero, trigger Game Over state that blocks interactions except Reset.

**Independent Test**: Use debug mode to drain all stats to 0 → verify game over overlay appears → verify interactions are blocked → click Reset → verify game resumes normally.

### Implementation for User Story 5

- [X] T060 [P] [US5] Create checkGameOver(): void action in src/state/actions.ts that sets isGameOver = true if hunger === 0 && cleanliness === 0 && happiness === 0
- [X] T061 [US5] Extend DecaySystem in src/systems/DecaySystem.ts to call checkGameOver() after each decay tick
- [X] T062 [US5] Create game over overlay in src/scenes/UIScene.ts with semi-transparent background and "💔 Your horse needs urgent care!" message
- [X] T063 [US5] Add Zustand subscription in UIScene to show/hide game over overlay when state.isGameOver changes
- [X] T064 [US5] Add Reset button in game over overlay that calls reset() action
- [X] T065 [US5] Extend reset() action in src/state/actions.ts to set isGameOver = false
- [X] T066 [US5] Add Horse.setSickState() method in src/entities/Horse.ts that changes sprite to desaturated/sick appearance
- [X] T067 [US5] Subscribe to isGameOver in MainGameScene and call horse.setSickState() when true
- [X] T068 [US5] Disable care action buttons (feed, groom, pet) in UIScene when isGameOver is true
- [X] T069 [US5] Disable shop button in UIScene when isGameOver is true
- [X] T070 [US5] Ensure game over does not trigger unless ALL three stats are zero simultaneously

**Checkpoint**: All user stories 1-5 should work - game over state adds consequence for neglect.

---

## Phase 8: User Story 6 - Visual Shop UI & UX Polish (Priority: P6)

**Goal**: Polish shop interface with smooth animations, hover effects, and delightful feedback.

**Independent Test**: Open shop → observe smooth modal animation → hover over items → observe hover effects → buy item → observe purchase animation and success feedback.

### Implementation for User Story 6

- [X] T071 [P] [US6] Add shop modal scale-in animation in ShopScene.create() using Phaser tween (0.3s, ease-out)
- [X] T072 [P] [US6] Add shop modal scale-out animation when closing ShopScene using Phaser tween (0.3s, ease-in)
- [X] T073 [P] [US6] Add hover effect on ItemCard - scale to 1.05x and add shadow on pointer over
- [X] T074 [P] [US6] Add purchase success animation - checkmark icon and green flash when purchase completes
- [X] T075 [P] [US6] Add particle effects on successful purchase using Phaser particle emitter
- [X] T076 [P] [US6] Add number pop animation when item count increases after purchase
- [X] T077 [P] [US6] Color-code prices - affordable items white, expensive items red
- [X] T078 [P] [US6] Display "Too expensive! / Zu teuer!" message on unaffordable items
- [X] T079 [P] [US6] Improve shop grid layout with consistent spacing and responsive columns (2 cols on mobile, 3 on desktop)
- [X] T080 [US6] Add haptic-like feedback using screen shake or button bounce on purchase

**Checkpoint**: All user stories complete with polished shop experience.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T081 [P] Verify LocalStorage migration from v1.2.0 to v1.3.0 - ensure old saves load correctly with new fields
- [X] T082 [P] Add max currency cap notification - show toast "Max Horseshoes reached!" when earning beyond 999,999
- [X] T083 [P] Ensure 60 FPS performance with all features active - profile MainGameScene with gifts, clock, and shop
- [X] T084 [P] Test responsive layout on mobile (320px width) - verify shop grid, currency display, clock fit properly
- [X] T085 [P] Validate all i18n translations exist for DE and EN - check shop items, currency, clock, game over messages
- [X] T086 [P] Update README.md with Feature 006 description and gameplay loop explanation
- [X] T087 Code cleanup - remove debug logs, format all new files consistently
- [X] T088 Run validation scenarios from quickstart.md - test earn/spend loop, gift spawning, game over flow
- [X] T089 Final end-to-end test - play for 15 minutes covering all 6 user stories
- [X] T090 [P] Test shop grid responsive layout on multiple viewports - 320px (mobile), 768px (tablet), 1920px (desktop) - verify readability and tap targets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - May use US1 currency but independently testable
  - User Story 3 (P3): Can start after Foundational - No dependencies on other stories
  - User Story 4 (P4): Depends on US3 (game clock) for timing
  - User Story 5 (P5): Can start after Foundational - Uses existing DecaySystem
  - User Story 6 (P6): Depends on US2 (shop) for polish
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Foundation for economy loop
- **User Story 2 (P2)**: Can start after Foundational - Uses currency from US1 but testable independently
- **User Story 3 (P3)**: Can start after Foundational - Independent timer functionality
- **User Story 4 (P4)**: **BLOCKED by US3** - Requires game clock for spawn timing
- **User Story 5 (P5)**: Can start after Foundational - Uses existing horse stats
- **User Story 6 (P6)**: **BLOCKED by US2** - Polish for shop that must exist first

### Within Each User Story

- **US1**: Actions (T017-T021) before UI (T022-T025)
- **US2**: Actions (T026-T028) in parallel with ShopScene creation (T029-T039)
- **US3**: Actions (T040-T042) before UI (T043-T046)
- **US4**: Systems (T047-T052) before MainGameScene integration (T053-T059)
- **US5**: Actions (T060-T061) before UI (T062-T070)
- **US6**: All polish tasks can run in parallel once US2 complete

### Parallel Opportunities

- **Phase 1**: All setup tasks can run in parallel
- **Phase 2**: Tasks T004-T010 (interface/config definitions) can run in parallel, then T011-T016 (state initialization)
- **US1**: Tasks T017-T018 can run in parallel, T019-T021 can run in parallel
- **US2**: Tasks T026-T028 can run in parallel, T029-T037 (ShopScene) can run in parallel with T038-T039 (UIScene)
- **US3**: Tasks T040-T042 can run in parallel
- **US4**: Tasks T047-T052 can run in parallel
- **US5**: Tasks T060-T061 can run together, T062-T070 UI tasks can be parallelized
- **US6**: All tasks T071-T080 can run in parallel (different animations)
- **Phase 9**: Tasks T081-T086 can run in parallel

**Key Parallel Strategy**: 
- After Foundational phase, US1, US2, US3, US5 can all start in parallel
- US4 waits for US3 (clock)
- US6 waits for US2 (shop)

---

## Parallel Example: User Story 1

```bash
# Launch all actions for User Story 1 together:
Task: "Create earnCurrency(amount: number): void action in src/state/actions.ts"
Task: "Create getCurrencyBalance(): number selector in src/state/actions.ts"

# Launch feed/groom/pet extensions together:
Task: "Extend feed() action to call earnCurrency(5)"
Task: "Extend groom() action to call earnCurrency(3)"
Task: "Extend pet() action to call earnCurrency(2)"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Currency Earning)
4. Complete Phase 4: User Story 2 (Shop)
5. **STOP and VALIDATE**: Test earn → spend loop independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - currency earning!)
3. Add User Story 2 → Test independently → Deploy/Demo (Core loop - earn + spend!)
4. Add User Story 3 → Test independently → Deploy/Demo (Timer added)
5. Add User Story 4 → Test independently → Deploy/Demo (Passive rewards)
6. Add User Story 5 → Test independently → Deploy/Demo (Consequences)
7. Add User Story 6 → Test independently → Deploy/Demo (Polish)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Currency)
   - Developer B: User Story 2 (Shop)
   - Developer C: User Story 3 (Clock)
   - Developer D: User Story 5 (Game Over)
3. After dependencies clear:
   - Developer C continues to User Story 4 (Gifts - needs clock)
   - Developer B continues to User Story 6 (Polish - needs shop)
4. Stories complete and integrate independently

### Recommended MVP Scope

**Minimum Viable Product** should include:
- User Story 1 (Currency Earning) - P1
- User Story 2 (Shop System) - P2

This creates the core self-sustaining economy loop that solves the finite resource problem. All other stories are enhancements.

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are intentionally omitted as they were not requested in the feature specification
- Focus on implementation quality and independently testable increments per story
- Total tasks: 90 (T001-T090) including responsive layout testing
