# Tasks: Reset Button

**Input**: Design documents from `/specs/004-reset-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/reset-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Unit and integration tests included for reset logic and button behavior.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (No Setup Required)

**Purpose**: All necessary infrastructure already exists from previous features

**Note**: This feature reuses existing state management, constants, and scene structure. No setup tasks needed.

**Checkpoint**: Proceed directly to Foundational phase

---

## Phase 2: Foundational (Minimal Prerequisites)

**Purpose**: Enhance existing reset function and expose DecaySystem

**⚠️ CRITICAL**: These changes must complete before user story implementation

- [X] T001 Enhance resetGame() action to include feeding state reset in src/state/actions.ts (add feeding: { isEating: false, eatStartTime: null, recentFeedings: [], fullUntil: null })
- [X] T002 Add saveSystem.save() call after reset in src/state/actions.ts (persist reset state to localStorage)
- [X] T003 Add console.log confirmation in resetGame() in src/state/actions.ts (log "Game reset to initial state")
- [X] T004 Change decaySystem access modifier from private to public in src/scenes/MainGameScene.ts (enable UIScene to call reset())

**Checkpoint**: Foundation ready - resetGame() now complete, DecaySystem accessible. User story implementation can begin.

---

## Phase 3: User Story 1 - Reset Game When Out of Resources (Priority: P1) 🎯 MVP

**Goal**: When player has 0 carrots AND 0 brush uses, a reset button appears that restarts the game with fresh inventory and reset horse status.

**Independent Test**: Manually set inventory to carrots=0 and brushUses=0 in browser console → verify reset button fades in at top-right → click button → verify all game state resets to initial values → verify button fades out.

### Implementation for User Story 1

- [X] T005 [P] [US1] Add resetButton class variable to UIScene in src/scenes/UIScene.ts (private resetButton?: Phaser.GameObjects.Text)
- [X] T006 [P] [US1] Add resetButtonVisible tracking variable to UIScene in src/scenes/UIScene.ts (private resetButtonVisible: boolean = false)
- [X] T007 [P] [US1] Add lastResetClickTime for debouncing to UIScene in src/scenes/UIScene.ts (private lastResetClickTime: number = 0)
- [X] T008 [US1] Create reset button UI element in UIScene.create() in src/scenes/UIScene.ts (text "🔄 Reset", position top-right at width-20, y=20, styled with red color #ff6b6b, black background, initially alpha=0, setInteractive)
- [X] T009 [US1] Add hover effect handler to reset button in src/scenes/UIScene.ts (pointerover: scale to 1.1, pointerout: scale to 1.0, change cursor to pointer)
- [X] T010 [US1] Add click handler to reset button in src/scenes/UIScene.ts (pointerdown: debounce check 500ms [note: debounce = ignore rapid clicks, no visual change to button], scale pulse animation 0.95 with yoyo, call resetGame() in onComplete, call decaySystem.reset() from MainGameScene)
- [X] T011 [US1] Import resetGame action in UIScene in src/scenes/UIScene.ts (add to existing imports from '../state/actions')

**Checkpoint**: At this point, User Story 1 should be fully functional. Button appears (if manually triggered), responds to hover/click, and executes reset. Test independently before proceeding.

---

## Phase 4: User Story 2 - Hide Reset Button When Resources Available (Priority: P2)

**Goal**: Reset button is hidden during normal gameplay (when carrots > 0 OR brushUses > 0) and only appears when truly needed.

**Independent Test**: Start game with full inventory → verify button is hidden → deplete all resources → verify button fades in → click reset → verify button fades out (inventory restored).

### Implementation for User Story 2

- [X] T012 [US2] Add visibility check logic in UIScene.update() in src/scenes/UIScene.ts (check shouldShow = carrots === 0 && brushUses === 0)
- [X] T013 [US2] Add fade-in transition in UIScene.update() in src/scenes/UIScene.ts (if shouldShow && !resetButtonVisible: tween alpha 0→1 over 300ms, set resetButtonVisible = true)
- [X] T014 [US2] Add fade-out transition in UIScene.update() in src/scenes/UIScene.ts (if !shouldShow && resetButtonVisible: tween alpha 1→0 over 300ms, set resetButtonVisible = false)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Button appears/disappears based on inventory state with smooth transitions.

---

## Phase 5: Testing

**Purpose**: Validate reset functionality and button behavior

### Unit Tests

- [X] T015 [P] Write test for resetGame() horse status reset in tests/unit/actions.test.ts (verify hunger, cleanliness, happiness return to INITIAL_STATUS)
- [X] T016 [P] Write test for resetGame() inventory reset in tests/unit/actions.test.ts (verify carrots=10, brushUses=100)
- [X] T017 [P] Write test for resetGame() feeding state reset in tests/unit/actions.test.ts (verify isEating=false, recentFeedings=[], fullUntil=null)
- [X] T018 [P] Write test for resetGame() UI state reset in tests/unit/actions.test.ts (verify selectedTool=null, activeAnimation=null)
- [X] T019 [P] Write test for resetGame() saves to localStorage in tests/unit/actions.test.ts (spy on saveSystem.save, verify called once)

### Integration Tests

- [X] T020 [P] Write test for button visibility when resources exhausted in tests/integration/resetFlow.test.ts (new file: set inventory to 0/0, verify shouldShow=true)
- [X] T021 [P] Write test for button hidden with resources available in tests/integration/resetFlow.test.ts (set carrots>0 OR brushUses>0, verify shouldShow=false)
- [X] T022 [P] Write test for full reset flow in tests/integration/resetFlow.test.ts (deplete resources, click button, verify all state restored, verify button hides)
- [X] T023 [P] Write test for DecaySystem timer reset in tests/integration/resetFlow.test.ts (reset game, verify DecaySystem.lastUpdateTime updated to prevent stat drain)

**Checkpoint**: All tests passing. Reset functionality verified end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, documentation verification, and manual testing

- [X] T024 [P] Validate quickstart.md code snippets in specs/004-reset-button/quickstart.md (verify implementation patterns match documentation)
- [X] T025 [P] Run full test suite and verify all tests pass (npm test with reset tests included)
- [X] T026 Manual test: deplete resources slowly and verify button appears smoothly (no flicker, clean fade-in)
- [X] T027 Manual test: click reset and observe all UI updates (status bars, inventory counts, button disappears)
- [X] T028 Manual test: click reset during eating animation and verify graceful handling (animation stops, state resets)
- [X] T029 Manual test: spam-click reset button and verify debounce works (500ms cooldown prevents multiple resets)
- [X] T030 Manual test: reset game, close/reopen tab, verify reset state persisted (inventory restored in localStorage)
- [X] T031 Performance check: measure button fade transition smoothness (verify 300ms transition at 60 FPS)
- [X] T032 Cross-browser test: verify button works on desktop (Chrome, Firefox) and mobile (Safari, Chrome)
- [X] T033 Code review: verify all constitution principles satisfied (visual excellence, Phaser APIs, browser-first, testable logic, 2D→3D ready)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped - no setup needed
- **Foundational (Phase 2)**: No dependencies - can start immediately - T001-T004 must complete before user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - needs enhanced resetGame() and public decaySystem
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) - needs button element from T008 to toggle visibility
- **Testing (Phase 5)**: Depends on User Story 1 and 2 completion - tests validate both stories
- **Polish (Phase 6)**: Depends on all previous phases - final validation and documentation

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Can start immediately after Foundational (Phase 2) completes - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion (needs button UI element from T008) - Adds visibility logic to existing button

**Recommended Order**: Phase 2 (Foundational) → User Story 1 (MVP) → validate → User Story 2 → validate → Testing → Polish

### Within Each User Story

**Foundational (Phase 2)**:
1. T001-T003 (resetGame enhancements) can run sequentially in same file
2. T004 (MainGameScene access) can run in parallel with T001-T003
3. All foundational tasks are quick (<5 min each)

**User Story 1 (Reset Button Creation)**:
1. T005-T007 (class variables) can run in parallel (same file, different sections)
2. T008 (create button) depends on T005 (needs variable declared)
3. T009-T010 (event handlers) depend on T008 (need button to exist)
4. T011 (import) can run in parallel with T005-T007

**User Story 2 (Visibility Logic)**:
1. T012 (visibility check) must complete first (establishes shouldShow logic)
2. T013-T014 (fade transitions) depend on T012 (use shouldShow variable)
3. Both transitions (T013, T014) are in same update() block, run sequentially

**Testing (Phase 5)**:
1. All unit tests (T015-T019) can run in parallel (different test cases)
2. All integration tests (T020-T023) can run in parallel (different flows)
3. Unit tests can be written before implementation (TDD approach)

### Parallel Opportunities

**Maximum Parallelization by Phase**:

**Phase 2 (Foundational)**:
- Thread 1: T001-T003 (resetGame enhancements)
- Thread 2: T004 (MainGameScene change)
- **Time to complete**: ~10 minutes with 2 developers

**Phase 3 (User Story 1)**:
- Thread 1: T005-T007 (variables) → T008 (button creation) → T009 (hover)
- Thread 2: T011 (import) → T010 (click handler after T008)
- **Time to complete**: ~30 minutes with 2 developers

**Phase 4 (User Story 2)**:
- Single thread: T012 → T013 + T014 (all in same update() method)
- **Time to complete**: ~15 minutes with 1 developer

**Phase 5 (Testing)**:
- Thread 1: T015-T019 (unit tests)
- Thread 2: T020-T023 (integration tests)
- **Time to complete**: ~40 minutes with 2 developers

**Phase 6 (Polish)**:
- All tasks are manual/validation - can be distributed across team
- **Time to complete**: ~1 hour with 3+ reviewers

### Parallel Example: User Story 1

```bash
# Developer A: Button UI creation
git checkout -b 004-reset-button-ui
# Work on T005-T008 (variables + button creation)
# Work on T009 (hover effects)

# Developer B: Reset logic integration  
git checkout -b 004-reset-button-logic
# Work on T011 (import)
# Work on T010 (click handler - needs T008 merged first)

# Merge A first, then B rebases and continues
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Deliver first**: User Story 1 only (Phase 2 + Phase 3)
- Player can reset game when stuck (no resources)
- Button appears manually triggered (no auto-show yet)
- Functional but requires console command to test

**Time estimate**: 2-3 hours for one developer

**Value delivered**: Players can recover from resource depletion without page reload

### Full Feature

**Deliver next**: Add User Story 2 (Phase 4)
- Button automatically appears/disappears based on inventory
- Smooth fade transitions for professional feel
- Complete user experience

**Additional time**: +1 hour

**Total feature time**: 3-4 hours for one developer (or 2 hours with pair programming)

### Testing & Polish

**Finally**: Phase 5 + Phase 6
- Comprehensive test coverage
- Manual validation across browsers
- Performance verification

**Additional time**: +2 hours

**Total with polish**: 5-6 hours end-to-end

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DecaySystem timer not reset | Medium | High | Required test in T023, manual validation in T027 |
| Button flickers on/off | Low | Medium | Research.md decision D8 tracked visibility with resetButtonVisible flag |
| Reset during animation causes issues | Low | Medium | Phaser auto-cleanup handles this, test in T028 validates |
| Button blocks horse clicks | Low | Low | Position at top-right far from horse center, layout prevents overlap |
| Save fails after reset | Low | High | Unit test T019 validates save called, error handling already in SaveSystem |

---

## Acceptance Criteria

### User Story 1 (Reset When Stuck)

- [X] Button appears when carrots=0 AND brushUses=0
- [X] Button positioned at top-right (20px from edges)
- [X] Button has hover effect (scale 1.1)
- [X] Button has click feedback (scale pulse)
- [X] Clicking button resets all game state to initial values
- [X] Clicking button resets DecaySystem timer
- [X] Clicking button saves reset state to localStorage
- [X] Button is debounced (500ms cooldown)

### User Story 2 (Auto Hide/Show)

- [X] Button hidden when carrots > 0 OR brushUses > 0
- [X] Button fades in smoothly (300ms) when resources reach 0/0
- [X] Button fades out smoothly (300ms) after reset
- [X] No flicker during rapid inventory changes

### Testing

- [X] All unit tests pass (5 tests for resetGame)
- [X] All integration tests pass (4 tests for reset flow)
- [X] Manual testing confirms smooth UX

### Polish

- [X] Code matches quickstart.md patterns
- [X] Works on desktop and mobile
- [X] Maintains 60 FPS during transitions
- [X] Constitution principles satisfied

---

## Definition of Done

- [ ] All tasks (T001-T033) completed and checked off
- [ ] All tests passing (npm test)
- [ ] Manual testing completed on Chrome, Firefox, Safari
- [ ] Mobile testing completed on iOS Safari and Android Chrome
- [ ] Code reviewed by at least one other developer
- [ ] Quickstart.md validated against implementation
- [ ] Feature branch merged to main
- [ ] No regressions in existing features (feeding, grooming, status decay)
