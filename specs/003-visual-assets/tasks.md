# Tasks: Visual Asset Integration

**Input**: Design documents from `/specs/003-visual-assets/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: This feature does NOT include automated test tasks. Integration is validated through manual visual testing and the quickstart.md verification checklist.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Single project structure: `src/`, `assets/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions for sprite system

- [X] T001 Verify horse sprite assets exist in assets/sprites/horse/ (horse_idle.png, horse_eat.png, horse_happy.png, horse_pet.png, horse_walk.png - 512×384 frames)
- [X] T002 Verify horse.meta.json exists and contains animation configuration metadata (frameWidth: 512, frameHeight: 384)
- [X] T003 [P] Add HorseAnimationState type ('idle' | 'eating' | 'grooming' | 'happy' | 'walk') to src/state/types.ts
- [X] T004 [P] Add SPRITE_CONFIG constants to src/config/gameConstants.ts (frame rates, anchor points, scale values)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Sprite loading and animation registration infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Add load error handler to BootScene.preload() for sprite asset failures in src/scenes/BootScene.ts
- [X] T005a Display loading progress text in BootScene.preload() using this.load.on('progress') callback in src/scenes/BootScene.ts
- [X] T006 [P] Load horse_idle sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts
- [X] T007 [P] Load horse_eat sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts
- [X] T008 [P] Load horse_happy sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts
- [X] T009 [P] Load horse_pet sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts
- [X] T010 [P] Load horse_walk sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts
- [X] T011 Create private registerHorseAnimations() method in BootScene in src/scenes/BootScene.ts
- [X] T012 Register 'horse-idle' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, infinite loop)
- [X] T013 Register 'horse-eat' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, looping)
- [X] T014 Register 'horse-happy' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (12 FPS, one-shot)
- [X] T015 Register 'horse-pet' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, looping)
- [X] T016 Register 'horse-walk' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (12 FPS, looping, reserved)
- [X] T017 Call registerHorseAnimations() in BootScene.create() with textures.exists() check and console logging in src/scenes/BootScene.ts

**Checkpoint**: Foundation ready - User Story 1 implementation can now begin

---

## Phase 3: User Story 1 - Animated Horse Sprites (Priority: P1) 🎯 MVP

**Goal**: Replace placeholder horse graphics with professional sprite animations for idle, eating, and grooming states

**Independent Test**: Load game → Observe smooth idle animation → Click with carrot → Verify eating animation plays for 2.5s → Click with brush and drag → Verify grooming animation plays → All transitions smooth without glitches

### Implementation for User Story 1

#### Horse Entity Refactor (Image → Sprite)

- [X] T018 [US1] Add private currentState: HorseAnimationState property to Horse class in src/entities/Horse.ts
- [X] T019 [US1] Add private isLocked: boolean property to Horse class in src/entities/Horse.ts (prevents animation interruption)
- [X] T020 [US1] Update Horse constructor to check scene.anims.exists('horse-idle') in addition to textures.exists() in src/entities/Horse.ts
- [X] T021 [US1] Replace scene.add.image() with scene.add.sprite() in Horse constructor in src/entities/Horse.ts
- [X] T022 [US1] Set sprite origin to (0.5, 1.0) for bottom-center anchor in Horse constructor in src/entities/Horse.ts
- [X] T023 [US1] Set sprite scale to 1.5 (192px display size from 128px frame) in Horse constructor in src/entities/Horse.ts
- [X] T024 [US1] Call this.sprite.play('horse-idle') in Horse constructor to start idle animation in src/entities/Horse.ts
- [X] T025 [US1] Add console.log for sprite mode vs. placeholder mode in Horse constructor in src/entities/Horse.ts

#### Animation State Machine

- [X] T026 [US1] Create private setState(newState: HorseAnimationState): void method in Horse class in src/entities/Horse.ts
- [X] T027 [US1] Implement state transition logic in setState() with redundant transition prevention in src/entities/Horse.ts
- [X] T028 [US1] Map states to animation keys ('horse-idle', 'horse-eat', etc.) in setState() in src/entities/Horse.ts
- [X] T029 [US1] Call this.sprite.play(animKey, true) to force restart animation in setState() in src/entities/Horse.ts
- [X] T030 [US1] Add one-shot animation auto-return logic for 'happy' state in setState() in src/entities/Horse.ts

#### Eating Animation Update

- [X] T031 [US1] Update playEatingAnimation() to call setState('eating') instead of texture swap in src/entities/Horse.ts
- [X] T032 [US1] Add scene.time.delayedCall() for FEEDING_CONFIG.EATING_DURATION (2.5s) in playEatingAnimation() in src/entities/Horse.ts
- [X] T033 [US1] Call setState('idle') in delayedCall callback to return from eating in playEatingAnimation() in src/entities/Horse.ts
- [X] T034 [US1] Preserve fallback tween animation for placeholder mode in playEatingAnimation() else block in src/entities/Horse.ts

#### Happy Animation Implementation

- [X] T035 [US1] Create playHappyAnimation(): void method in Horse class in src/entities/Horse.ts
- [X] T036 [US1] Implement sprite mode branch that calls setState('happy') in playHappyAnimation() in src/entities/Horse.ts
- [X] T037 [US1] Add ANIMATION_COMPLETE event listener for auto-return to idle in playHappyAnimation() in src/entities/Horse.ts
- [X] T038 [US1] Preserve fallback tween animation for placeholder mode in playHappyAnimation() else block in src/entities/Horse.ts

#### Grooming Animation Integration

- [X] T039 [US1] Create playGroomingAnimation(): void method in Horse class in src/entities/Horse.ts
- [X] T040 [US1] Implement setState('grooming') for sprite mode in playGroomingAnimation() in src/entities/Horse.ts
- [X] T041 [US1] Create stopGroomingAnimation(): void method in Horse class in src/entities/Horse.ts
- [X] T042 [US1] Implement setState('idle') in stopGroomingAnimation() to return from grooming in src/entities/Horse.ts
- [X] T043 [US1] Update InputSystem brush drag handlers to call playGroomingAnimation() on drag start in src/systems/InputSystem.ts
- [X] T044 [US1] Update InputSystem brush drag handlers to call stopGroomingAnimation() on drag end in src/systems/InputSystem.ts

#### Fallback Enhancement

- [X] T045 [US1] Add console.warn for missing sprite sheets in Horse constructor in src/entities/Horse.ts
- [X] T046 [US1] Update placeholder Graphics rendering to maintain existing visual in Horse constructor else block in src/entities/Horse.ts
- [X] T047 [US1] Verify all animation methods have placeholder mode branches (no-op or tween fallback) in src/entities/Horse.ts

#### Integration & State Transitions

- [X] T048 [US1] Update feedHorse action to call horse.playHappyAnimation() after eating completes in src/state/actions.ts or MainGameScene
- [X] T049 [US1] Verify idle → eating → idle transition works in MainGameScene interaction flow
- [X] T050 [US1] Verify idle → grooming → idle transition works in MainGameScene brush interaction flow
- [X] T051 [US1] Verify idle → happy → idle transition works when happiness increases in MainGameScene
- [X] T052 Complete User Story 1 implementation

**Checkpoint**: At this point, User Story 1 should be fully functional with smooth sprite animations for all horse interactions

---

## Phase 4: User Story 2 - UI Element Sprites (Priority: P2) 🔄 DEFERRED

**Goal**: Replace emoji-based inventory icons and UI elements with professional sprite graphics

**Status**: Deferred until P1 (Horse sprites) is complete and validated

**Independent Test**: Load game → Verify inventory icons are sprites (not emojis) → Hover over icons → Verify hover states → Use tools → Verify disabled states work

### Placeholder Tasks (Expand when implementing P2)

- [ ] T052 [P] [US2] Load UI sprite atlas in BootScene.preload() in src/scenes/BootScene.ts
- [ ] T053 [US2] Update InventoryItem to use sprite instead of text emoji in src/entities/InventoryItem.ts
- [ ] T054 [US2] Implement hover state handling for inventory items in src/entities/InventoryItem.ts
- [ ] T055 [US2] Implement disabled state visual for inventory items in src/entities/InventoryItem.ts
- [ ] T056 [US2] Update StatusBar to use sprite-based backgrounds in src/entities/StatusBar.ts
- [ ] T057 [US2] Update UIScene to use sprite-based buttons/panels in src/scenes/UIScene.ts

---

## Phase 5: User Story 3 - Visual Effect Sprites (Priority: P3) 🔄 DEFERRED

**Goal**: Add sprite-based particle effects for hearts (petting), sparkles (grooming), and food particles (eating)

**Status**: Deferred until P1 and P2 are complete

**Independent Test**: Perform each interaction → Verify particle effects spawn with sprite graphics → Verify smooth animation and fade-out → Test multiple simultaneous effects

### Placeholder Tasks (Expand when implementing P3)

- [ ] T058 [P] [US3] Load particle sprite sheets in BootScene.preload() in src/scenes/BootScene.ts
- [ ] T059 [US3] Create heart particle emitter configuration in MainGameScene in src/scenes/MainGameScene.ts
- [ ] T060 [US3] Create sparkle particle emitter configuration in MainGameScene in src/scenes/MainGameScene.ts
- [ ] T061 [US3] Create food particle emitter configuration in MainGameScene in src/scenes/MainGameScene.ts
- [ ] T062 [US3] Integrate heart particles with petting interaction in src/scenes/MainGameScene.ts
- [ ] T063 [US3] Integrate sparkle particles with grooming interaction in src/scenes/MainGameScene.ts
- [ ] T064 [US3] Integrate food particles with eating animation in src/scenes/MainGameScene.ts
- [ ] T065 [US3] Implement particle cleanup/pooling for performance in src/scenes/MainGameScene.ts

---

## Phase 6: User Story 4 - Environment Background Sprites (Priority: P4) 🔄 DEFERRED

**Goal**: Replace gradient background with detailed stable/barn environment sprites

**Status**: Deferred until P1, P2, and P3 are complete

**Independent Test**: Load game → Verify stable environment background visible → Verify proper layering (behind horse/UI) → Test scaling on different resolutions

### Placeholder Tasks (Expand when implementing P4)

- [ ] T066 [P] [US4] Load background sprite in BootScene.preload() in src/scenes/BootScene.ts
- [ ] T067 [US4] Add background sprite to MainGameScene at depth 0 (behind all entities) in src/scenes/MainGameScene.ts
- [ ] T068 [US4] Configure background scaling/tiling for responsive layout in src/scenes/MainGameScene.ts
- [ ] T069 [US4] Verify z-index ordering (background < horse < UI) in src/scenes/MainGameScene.ts

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [X] T070 [P] Remove development console.log statements or convert to debug level logging across all modified files
- [X] T071 [P] Update .github/agents/copilot-instructions.md with sprite system patterns and animation state machine
- [X] T072 [P] Update README.md with sprite asset information and feature completion status
- [X] T073 Unit test: Animation state transitions (idle→eating→idle, idle→grooming→idle, idle→happy→idle) in tests/unit/Horse.test.ts
- [X] T074 Unit test: Asset loading error handling and fallback to placeholder mode in tests/unit/BootScene.test.ts
- [X] T075 Unit test: Animation timing calculations (2.5s eating duration from FEEDING_CONFIG) in tests/unit/Horse.test.ts
- [X] T076 Integration test: Multiple animation state changes without visual glitches in tests/integration/spriteAnimations.test.ts
- [ ] T077 Run Step 1: Asset Verification checklist from specs/003-visual-assets/quickstart.md
- [ ] T078 Run Step 2: BootScene Changes checklist from specs/003-visual-assets/quickstart.md
- [ ] T079 Run Step 3: Horse Entity Update checklist from specs/003-visual-assets/quickstart.md
- [ ] T080 Run Step 4: Testing Checklist from specs/003-visual-assets/quickstart.md
- [ ] T081 Visual regression testing: Compare sprite animations across Chrome, Firefox, Safari
- [ ] T082 Performance validation: Verify 60 FPS maintained with all animations playing
- [X] T083 [P] Code review: Check all animation state transitions for edge cases
- [X] T084 [P] Documentation: Add sprite asset guidelines to project documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - REQUIRED FOR MVP
- **User Story 2 (Phase 4)**: Depends on US1 completion (deferred) - OPTIONAL
- **User Story 3 (Phase 5)**: Depends on US1 completion (deferred) - OPTIONAL
- **User Story 4 (Phase 6)**: Depends on US1 completion (deferred) - OPTIONAL
- **Polish (Phase 7)**: Depends on all implemented user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Horse Sprites**: ✅ Can start after Foundational phase - No dependencies on other stories - **CRITICAL MVP PATH**
- **User Story 2 (P2) - UI Sprites**: Can start after Foundational phase - Independent of US1 but logically follows - Deferred
- **User Story 3 (P3) - Particle Effects**: Can start after US1 (needs horse animations to trigger particles) - Deferred
- **User Story 4 (P4) - Background**: Can start after Foundational phase - Independent of other stories - Deferred

### Within User Story 1 (MVP Critical Path)

1. **Horse Entity Refactor** (T018-T025): Must complete first - establishes sprite infrastructure
2. **Animation State Machine** (T026-T030): Depends on refactor completion - core state logic
3. **Eating Animation** (T031-T034): Depends on state machine - updates existing feature
4. **Happy Animation** (T035-T038): Depends on state machine - new animation type
5. **Grooming Animation** (T039-T044): Depends on state machine - updates existing feature
6. **Fallback Enhancement** (T045-T047): Can run in parallel with animations - error handling
7. **Integration & State Transitions** (T048-T051): Final step - validates all animations work together

### Parallel Opportunities

**Phase 1 (Setup)**: ALL tasks can run in parallel
- T001, T002 (asset verification) together
- T003, T004 (type definitions) together

**Phase 2 (Foundational)**: Sprite loading tasks can parallelize
- T006-T010 (all sprite sheet loads) can run simultaneously
- T012-T016 (all animation registrations) can run after T011

**Phase 3 (User Story 1)**: Limited parallelization due to dependencies
- T045-T047 (fallback enhancement) can run parallel to T031-T044 (animations)
- Within animation subsections, implementation and fallback branches can be worked simultaneously

**Phase 7 (Polish)**: Most documentation tasks can parallelize
- T070-T072 (logging, docs, README) together
- T077-T079 (testing, validation, review) together

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all sprite sheet loads together (T006-T010):
Task: "Load horse_idle sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts"
Task: "Load horse_eat sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts"
Task: "Load horse_happy sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts"
Task: "Load horse_pet sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts"
Task: "Load horse_walk sprite sheet in BootScene.preload() using this.load.spritesheet() in src/scenes/BootScene.ts"

# After T011 completes, launch all animation registrations together (T012-T016):
Task: "Register 'horse-idle' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, infinite loop)"
Task: "Register 'horse-eat' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, looping)"
Task: "Register 'horse-happy' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (12 FPS, one-shot)"
Task: "Register 'horse-pet' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (9 FPS, looping)"
Task: "Register 'horse-walk' animation with anims.create() in registerHorseAnimations() in src/scenes/BootScene.ts (12 FPS, looping, reserved)"
```

---

## Parallel Example: User Story 1 Horse Entity

```bash
# Fallback enhancement (T045-T047) can run parallel to animation methods (T031-T044):
Parallel Group A:
  Task: "Add console.warn for missing sprite sheets in Horse constructor in src/entities/Horse.ts"
  Task: "Update placeholder Graphics rendering to maintain existing visual in Horse constructor else block in src/entities/Horse.ts"

Parallel Group B:
  Task: "Update playEatingAnimation() to call setState('eating') instead of texture swap in src/entities/Horse.ts"
  Task: "Create playHappyAnimation(): void method in Horse class in src/entities/Horse.ts"
  Task: "Create playGroomingAnimation(): void method in Horse class in src/entities/Horse.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

**Goal**: Ship horse sprite animations as quickly as possible

1. ✅ Complete Phase 1: Setup (4 tasks, ~15 minutes)
2. ✅ Complete Phase 2: Foundational (13 tasks, ~1-2 hours)
3. ✅ Complete Phase 3: User Story 1 (34 tasks, ~3-4 hours)
4. **STOP and VALIDATE**: Run quickstart.md testing checklist
5. Deploy/demo MVP with animated horse
6. Gather feedback before implementing P2-P4

**MVP Scope**: Phases 1-3 only (51 tasks total)

**Estimated Time**: 4-7 hours for developer familiar with Phaser 3

---

### Incremental Delivery (Full Feature)

**Goal**: Deliver each user story as independent increment

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Horse sprites) → Test independently → **Deploy MVP** ✅
3. Add User Story 2 (UI sprites) → Test independently → Deploy enhancement
4. Add User Story 3 (Particles) → Test independently → Deploy enhancement
5. Add User Story 4 (Background) → Test independently → Deploy complete feature
6. Polish phase → Final production release

**Total Scope**: All phases (80 tasks estimated)

**Estimated Time**: 12-20 hours across multiple sprints

---

### Parallel Team Strategy

If multiple developers available:

1. **All developers**: Complete Setup + Foundational together (Phases 1-2)
2. **Developer A**: User Story 1 - Horse sprites (Phase 3) - **CRITICAL PATH**
3. **Developer B**: User Story 2 - UI sprites (Phase 4) - Optional
4. **Developer C**: User Story 3 - Particles (Phase 5) - Optional (depends on US1 completion)
5. **Team**: Polish & testing together (Phase 7)

**Note**: US3 (Particles) has dependency on US1 completion since particles are triggered by horse animations

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 14 tasks (includes T005a for loading indicator)
- **Phase 3 (User Story 1 - P1)**: 34 tasks ⭐ **MVP COMPLETE**
- **Phase 4 (User Story 2 - P2)**: 6 tasks (deferred, placeholder only)
- **Phase 5 (User Story 3 - P3)**: 8 tasks (deferred, placeholder only)
- **Phase 6 (User Story 4 - P4)**: 4 tasks (deferred, placeholder only)
- **Phase 7 (Polish)**: 15 tasks (includes T073-T076 for unit/integration tests)

**Total for MVP (P1 only)**: 52 tasks + 15 polish tasks = **67 tasks**

**Total if all priorities implemented**: 85 tasks

---

## Notes

- **[P]** tasks = different files, no dependencies - can parallelize
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **NO automated tests included** - manual visual testing only (per spec)
- Commit after each logical group of tasks (e.g., after sprite loading, after animation state machine)
- Stop at any checkpoint to validate story independently
- **Focus on MVP first**: Complete P1 before considering P2-P4
- Quickstart.md provides detailed implementation guidance for each task
- Asset paths assume provided sprites in assets/sprites/horse/ directory
- All animation frame rates sourced from horse_phaser_meta.json metadata

---

## Validation Checklist

Before marking feature complete, verify:

- ✅ All P1 tasks (T001-T052, including T005a) completed
- ✅ Unit tests for animation state machine pass (T073-T076)
- ✅ Horse displays smooth idle animation on game load
- ✅ Eating animation plays for 2.5s when fed
- ✅ Grooming animation plays during brush interaction
- ✅ Happy animation plays and auto-returns to idle
- ✅ Fallback to placeholder works if sprites fail to load
- ✅ Game maintains 60 FPS with all animations
- ✅ Console logs show successful sprite loading
- ✅ No visual glitches or frame skipping
- ✅ quickstart.md testing checklist passes 100%
- ✅ Cross-browser testing completed (Chrome, Firefox, Safari)
