# Tasks: Enhanced Feeding Mechanics

**Input**: Design documents from `/specs/002-feeding-mechanics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/feeding-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are NOT explicitly requested in the specification. Integration tests are included only for critical flows to validate timing and state persistence.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add feeding-specific constants to existing game configuration

- [X] T001 Add FEEDING_CONFIG constants to src/config/gameConstants.ts (EATING_DURATION: 2500, SATIETY_LIMIT: 3, SATIETY_DECAY_MS: 10000, SATIETY_COOLDOWN_MS: 30000)

**Checkpoint**: Configuration ready for feeding mechanics implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core interfaces and helper functions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Extend types.ts with FeedingState interface in src/state/types.ts (add isEating, eatStartTime, recentFeedings, fullUntil fields)
- [X] T003 [P] Create feedingHelpers.ts in src/utils/feedingHelpers.ts (canFeed, calculateSatietyCount, pruneExpiredFeedings, isHorseFull functions)
- [X] T004 [P] Write unit tests for feedingHelpers.ts in tests/unit/feedingHelpers.test.ts (test satiety calculation, pruning logic, timestamp-based decay)
- [X] T005 Update GameState interface in src/state/types.ts to include feeding: FeedingState field
- [X] T006 Add DEFAULT_FEEDING_STATE constant to src/state/gameStore.ts (isEating: false, eatStartTime: null, recentFeedings: [], fullUntil: null)

**Checkpoint**: Foundation ready - FeedingState schema and helper functions available. User story implementation can now begin.

---

## Phase 3: User Story 1 - Timed Eating Animation (Priority: P1) 🎯 MVP

**Goal**: Horse takes 2.5 seconds to eat a carrot with animation. Hunger increases only after animation completes. No spam-feeding during eating.

**Independent Test**: Click carrot → click horse → observe eating animation plays for 2.5 seconds → verify hunger increases only after animation completes → verify clicking horse again during eating does nothing.

### Implementation for User Story 1

- [X] T007 [P] [US1] Update Horse.ts playEatingAnimation() to return Promise in src/entities/Horse.ts (change duration to FEEDING_CONFIG.EATING_DURATION, add onComplete callback that resolves promise)
- [X] T008 [US1] Refactor feed() action to async in src/state/actions.ts (add isEating validation, set eating state before animation, await 2.5s setTimeout, apply hunger after delay, integrate feedingHelpers imports)
- [X] T009 [US1] Add eating state blocking in MainGameScene.ts horse pointerdown handler in src/scenes/MainGameScene.ts (check state.feeding.isEating, return early if eating, await feed() and playEatingAnimation())
- [X] T010 [US1] Block pet interaction during eating in MainGameScene.ts in src/scenes/MainGameScene.ts (add isEating check before pet() call)
- [X] T011 [US1] Block groom interaction during eating in MainGameScene.ts dragStroke handler in src/scenes/MainGameScene.ts (add isEating check before groom() call)
- [X] T012 [P] [US1] Write integration test for eating duration in tests/integration/careCycle.test.ts (test hunger delayed until animation completes, test carrot deducted immediately, test isEating state transitions)

**Checkpoint**: At this point, User Story 1 should be fully functional. Horse eats for 2.5s, hunger delayed, spam-feeding blocked. Test independently before proceeding.

---

## Phase 4: User Story 2 - Satiety Limit (Priority: P2)

**Goal**: After 3 carrots, horse enters 30-second cooldown and refuses more food. Satiety counter decays (each carrot expires after 10s).

**Independent Test**: Feed 3 carrots in succession → verify feeding blocked on 4th attempt → wait 30 seconds → verify horse accepts carrots again. Feed 2 carrots, wait 15 seconds, feed 1 more → verify no cooldown (satiety decay working).

### Implementation for User Story 2

- [X] T013 [P] [US2] Integrate satiety tracking in feed() action in src/state/actions.ts (add timestamp to recentFeedings array, calculate satiety count, set fullUntil when limit reached, prune expired feedings before check)
- [X] T014 [P] [US2] Update SaveSystem.ts to persist recentFeedings and fullUntil in src/systems/SaveSystem.ts (add feeding field to savedState, prune array before saving, restore feeding state on load)
- [X] T015 [US2] Add fullUntil check in feed() action in src/state/actions.ts (check canFeed() helper before deducting carrot, return false if in cooldown)
- [X] T016 [P] [US2] Write integration test for satiety cooldown in tests/integration/careCycle.test.ts (test 3-carrot limit triggers cooldown, test 4th feeding blocked, test cooldown persistence across reload)
- [X] T017 [P] [US2] Write integration test for satiety decay in tests/integration/careCycle.test.ts (test feeding 2 carrots + 15s wait + 1 carrot does NOT trigger cooldown)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. 3-carrot limit enforced, cooldown persists across reload, decay prevents spam-blocking.

---

## Phase 5: User Story 3 - Visual Feedback (Priority: P3)

**Goal**: Clear visual indicators for eating progress (0-100%), fullness badge with "Full" text, and countdown timer showing remaining cooldown seconds.

**Independent Test**: Feed horse → observe smooth eating progress bar → feed 3 carrots → observe "Full" badge appears → observe countdown timer updates every second → wait for timer to reach 0 → verify visual state returns to normal.

### Implementation for User Story 3

- [X] T018 [P] [US3] Create eating progress bar in UIScene.ts in src/scenes/UIScene.ts (add background rectangle + green foreground rectangle, hide initially, position near horse)
- [X] T019 [P] [US3] Create fullness badge in UIScene.ts in src/scenes/UIScene.ts (add circle + "Full" text or 🍽️ emoji, hide initially, position near horse)
- [X] T020 [P] [US3] Create countdown timer text in UIScene.ts in src/scenes/UIScene.ts (add text object for "Ready in Xs" message, hide initially, position near fullness badge)
- [X] T021 [US3] Add eating progress update logic in UIScene.update() in src/scenes/UIScene.ts (calculate progress from eatStartTime, scale progress bar width 0→1, show/hide based on isEating state)
- [X] T022 [US3] Add fullness badge visibility logic in UIScene.update() in src/scenes/UIScene.ts (show badge when fullUntil > now, hide when cooldown expired)
- [X] T023 [US3] Add countdown timer update logic in UIScene.create() in src/scenes/UIScene.ts (create 1 Hz timer event, calculate remaining seconds, update text every second, hide when countdown reaches 0)
- [X] T024 [US3] Gray out carrot icon when unavailable in UIScene.ts in src/scenes/UIScene.ts (check canFeed() helper, set tint to gray or reduce alpha when eating or full)

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional. Visual feedback is complete and matches eating/cooldown states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation, and performance verification

- [X] T025 [P] Validate quickstart.md examples in specs/002-feeding-mechanics/quickstart.md (run code snippets, verify patterns work as documented)
- [X] T026 [P] Run full test suite and verify all tests pass (npm test with 90%+ coverage for feedingHelpers)
- [X] T027 Performance check: measure eating animation timing in browser DevTools (verify 2500ms ±50ms, maintain 60 FPS during animation)
- [X] T028 Manual test: feed 3 carrots, reload page, verify satiety state persists (recentFeedings array restored, cooldown continues)
- [X] T029 Manual test: verify interaction blocking works for all actions (during eating: feed/pet/groom all blocked; during cooldown: pet/groom allowed, feed blocked)
- [X] T030 Code review: verify all timestamp logic uses Date.now() not frame counters (grep for frame-based timing, ensure FPS-independent)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) - BLOCKS all user stories until T002-T006 complete
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - T007-T012 blocked until T002-T006 done
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) AND User Story 1 - T013-T017 need async feed() from T008
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) AND User Story 1 - T018-T024 need eating state from T007-T011
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Can start immediately after Foundational (Phase 2) completes - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion (needs async feed() action from T008) - Extends US1's eating system with satiety tracking
- **User Story 3 (P3)**: Depends on User Story 1 completion (needs eating state from T009) - Independently adds UI, but requires eating and satiety states to exist

**Recommended Order**: Phase 1 → Phase 2 → User Story 1 (MVP) → validate → User Story 2 → validate → User Story 3 → validate → Polish

### Within Each User Story

**User Story 1 (Timed Eating)**:
1. T007 (Horse animation Promise) can run in parallel with T008 (async feed())
2. T008 must complete before T009-T011 (MainGameScene needs async feed())
3. T012 (integration test) can run in parallel with implementation (write test first, watch it fail, then implement)

**User Story 2 (Satiety Limit)**:
1. T013 (satiety in feed()) and T014 (SaveSystem) can run in parallel
2. T015 (cooldown check) depends on T013 (needs fullUntil field populated)
3. T016-T017 (tests) can run in parallel after implementation

**User Story 3 (Visual Feedback)**:
1. T018-T020 (create UI elements) can all run in parallel
2. T021-T023 (update logic) depend on T018-T020 (need elements to exist)
3. T024 (gray out icon) can run in parallel with T021-T023

### Parallel Opportunities

**Foundational Phase** (after T001):
- Launch T003 and T004 together (helper functions + tests)
- Launch T002, T005, T006 together (all type definitions)

**User Story 1** (after Foundational):
- Launch T007 and T008 together (Horse animation + async feed)
- Launch T012 in parallel with T007-T011 (write test first, run it to watch fail)

**User Story 2** (after US1):
- Launch T013 and T014 together (satiety tracking + persistence)
- Launch T016 and T017 together (cooldown tests + decay tests)

**User Story 3** (after US1):
- Launch T018, T019, T020 together (all UI element creation)
- Launch T021, T022, T023 together (all update logic)

**Polish Phase** (after all user stories):
- Launch T025, T026, T030 together (documentation, tests, code review are independent)

---

## Parallel Example: User Story 1

```bash
# Launch Horse animation and async feed() together:
Task: "Update Horse.ts playEatingAnimation() to return Promise in src/entities/Horse.ts"
Task: "Refactor feed() action to async in src/state/actions.ts"

# Write test in parallel (TDD approach):
Task: "Write integration test for eating duration in tests/integration/careCycle.test.ts"

# After async feed() is ready, launch blocking handlers together:
Task: "Add eating state blocking in MainGameScene.ts horse pointerdown handler"
Task: "Block pet interaction during eating in MainGameScene.ts"
Task: "Block groom interaction during eating in MainGameScene.ts dragStroke handler"
```

---

## Parallel Example: User Story 3

```bash
# Launch all UI element creation together (different elements, no dependencies):
Task: "Create eating progress bar in UIScene.ts"
Task: "Create fullness badge in UIScene.ts"
Task: "Create countdown timer text in UIScene.ts"

# After UI elements exist, launch all update logic together:
Task: "Add eating progress update logic in UIScene.update()"
Task: "Add fullness badge visibility logic in UIScene.update()"
Task: "Add countdown timer update logic in UIScene.create()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001) - ~5 minutes
2. Complete Phase 2: Foundational (T002-T006) - ~1-2 hours
3. Complete Phase 3: User Story 1 (T007-T012) - ~2-3 hours
4. **STOP and VALIDATE**: Test timed eating independently
   - Feed horse, verify 2.5s animation
   - Try spam-clicking during eating, verify blocked
   - Check hunger increases after animation
5. Deploy/demo if ready - **This is a functional MVP!**

**Total MVP Time**: ~4-6 hours

### Incremental Delivery

1. **Foundation** (Phase 1-2): Core types and helpers ready
2. **MVP** (Phase 3): Timed eating works → Test independently → Demo
3. **Strategic Depth** (Phase 4): 3-carrot limit adds challenge → Test independently → Demo
4. **UX Polish** (Phase 5): Visual feedback improves clarity → Test independently → Demo
5. **Production Ready** (Phase 6): Validated, documented, performant

**Total Feature Time**: ~8-12 hours across 3 independent stories

### Parallel Team Strategy

With 2-3 developers after Foundation (Phase 2) completes:

1. **Team completes Phase 1-2 together** (required foundation)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T007-T012) - Core eating mechanics
   - **Developer B**: Wait for A's async feed(), then User Story 2 (T013-T017) - Satiety system
   - **Developer C**: Wait for A's eating state, then User Story 3 (T018-T024) - UI feedback
3. Stories integrate without conflicts (different code sections)

**Parallel Benefit**: ~8-10 hours → ~5-6 hours with 2 devs (after staggered start)

---

## Task Count Summary

- **Phase 1 (Setup)**: 1 task
- **Phase 2 (Foundational)**: 5 tasks (CRITICAL - blocks all)
- **Phase 3 (User Story 1 - MVP)**: 6 tasks
- **Phase 4 (User Story 2)**: 5 tasks
- **Phase 5 (User Story 3)**: 7 tasks
- **Phase 6 (Polish)**: 6 tasks

**Total**: 30 tasks

**Parallelizable**: 14 tasks marked [P] (47% can run in parallel)

**MVP Subset**: T001-T012 (12 tasks, ~4-6 hours) delivers functional timed eating

---

## Notes

- **[P] marker**: Tasks can run in parallel (different files, no blocking dependencies)
- **[Story] label**: Maps task to specific user story (US1, US2, US3) for traceability and independent testing
- **Each user story independently testable**: Can validate US1 without US2/US3, validate US2 without US3, etc.
- **Tests integrated into flow**: Integration tests (T012, T016, T017) verify critical timing and persistence behaviors
- **Commit after each task or logical group**: e.g., commit T002-T006 together as "Add feeding state foundation"
- **Stop at any checkpoint to validate**: After US1 (MVP), after US2 (strategic depth), after US3 (full UX)
- **Reference docs**: See [research.md](research.md) for timing decisions, [data-model.md](data-model.md) for schema, [quickstart.md](quickstart.md) for testing patterns
