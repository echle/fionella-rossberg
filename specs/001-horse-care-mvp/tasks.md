# Tasks: Horse Care Game MVP

**Feature**: Horse Care Game MVP  
**Branch**: `001-horse-care-mvp`  
**Input**: Design documents from `/specs/001-horse-care-mvp/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create Vite project with TypeScript template in project root
- [X] T002 Install core dependencies: phaser@3.80+, zustand@4.x in package.json
- [X] T003 [P] Install dev dependencies: vitest, @vitest/ui, vite-plugin-pwa in package.json
- [X] T004 [P] Install tooling: eslint, prettier, @typescript-eslint packages in package.json
- [X] T005 Configure TypeScript strict mode in tsconfig.json
- [X] T006 Configure Vite build settings and PWA plugin in vite.config.ts
- [X] T007 Configure Vitest with jsdom environment in vitest.config.ts
- [X] T008 [P] Setup ESLint rules in .eslintrc.js
- [X] T009 [P] Setup Prettier config in .prettierrc
- [X] T010 Create folder structure: src/{config,scenes,entities,state,systems,utils}
- [X] T011 [P] Create folder structure: assets/{sprites,ui,backgrounds}
- [X] T012 [P] Create folder structure: tests/{unit,integration}
- [X] T013 Add npm scripts in package.json: dev, build, test, lint, format
- [X] T014 Create public/index.html with canvas container element
- [X] T015 [P] Create public/manifest.json for PWA configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T016 Define TypeScript interfaces in src/state/types.ts: GameState, HorseStatus, Inventory, UIState
- [X] T017 Create Phaser game configuration in src/config/phaserConfig.ts with canvas, scale, physics settings
- [X] T018 Create game constants in src/config/gameConstants.ts: decay rates, status increments, initial values
- [X] T019 Initialize Zustand store in src/state/gameStore.ts with default state structure
- [X] T020 Create main entry point in src/main.ts: Initialize Phaser game instance
- [X] T021 Create BootScene in src/scenes/BootScene.ts for asset preloading
- [X] T022 Create MainGameScene in src/scenes/MainGameScene.ts with empty create() method
- [X] T023 Create UIScene in src/scenes/UIScene.ts with empty create() method
- [X] T024 [P] Create utility functions in src/utils/mathUtils.ts: clamp, lerp
- [X] T025 [P] Create utility functions in src/utils/timeUtils.ts: elapsed time calculations
- [X] T026 Verify dev server runs successfully with `npm run dev`

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Horse and Status Display (P1)

**Story Goal**: Fionella can see her horse and three status bars displaying current values

**Independent Test**: Launch game → verify horse sprite visible → verify 3 status bars visible with values

**Asset Strategy**: Use placeholder assets for MVP (see plan.md Decision 7). Professional sprites are optional post-MVP polish.

- [X] T027 [US1] Create placeholder horse sprite: Use Phaser.Graphics to draw brown (#8B4513) circle/rectangle 200x200px labeled "Horse" OR use free horse sprite from OpenGameArt.org, save to assets/_placeholder/horse-idle.png
- [X] T028 [US1] Create placeholder status bar UI: Use Phaser.Graphics rectangles (background: gray, fill: green/yellow/red gradient) OR simple PNG bars (256x64px), save to assets/_placeholder/status-bar-*.png
- [X] T029 [US1] Load horse sprite in BootScene.ts preload() method using Phaser loader (this.load.image())
- [X] T030 [P] [US1] Load status bar assets in BootScene.ts preload() method (this.load.image())
- [X] T031 [US1] Create Horse entity class in src/entities/Horse.ts with sprite and position properties
- [X] T032 [US1] Instantiate Horse in MainGameScene.ts create() method, position center screen
- [X] T033 [US1] Create StatusBar component in src/entities/StatusBar.ts with label, value, max, color
- [X] T034 [US1] Render Hunger status bar in UIScene.ts create() method, position top-left
- [X] T035 [P] [US1] Render Cleanliness status bar in UIScene.ts, position top-center
- [X] T036 [P] [US1] Render Happiness status bar in UIScene.ts, position top-right
- [X] T037 [US1] Bind status bar values to gameStore.horse in UIScene.ts update() loop
- [X] T038 [US1] Implement responsive scaling in phaserConfig.ts Scale Manager config
- [X] T039 [US1] Test on desktop (1920x1080) and mobile (375x667) viewports manually
- [X] T040 [US1] Write unit test in tests/unit/gameStore.test.ts: verify initial state values

**US1 Complete**: ✅ Horse and status bars visible, responsive, centered

---

## Phase 4: User Story 2 - Feed Horse from Inventory (P2)

**Story Goal**: Fionella can select carrot from inventory and feed horse, increasing hunger

**Independent Test**: Click carrot → click horse → hunger increases → carrot count decreases

- [X] T041 [US2] Create carrot icon placeholder: Use Unicode emoji 🥕 as texture OR draw orange triangle/rectangle in Phaser.Graphics (64x64px), save to assets/_placeholder/carrot-icon.png
- [X] T042 [US2] Create inventory slot placeholder: Draw rounded rectangle border (128x128px, gray stroke) in Phaser.Graphics OR simple PNG, save to assets/_placeholder/inventory-slot.png
- [X] T043 [US2] Load inventory assets in BootScene.ts preload() method (this.load.image())
- [X] T044 [US2] Create InventoryItem component in src/entities/InventoryItem.ts with icon, count, selection state
- [X] T045 [US2] Render carrot inventory slot in UIScene.ts create() method, bottom-left position
- [X] T046 [US2] Bind carrot count to gameStore.inventory.carrots in UIScene.ts update() loop
- [X] T047 [US2] Implement selectTool action in src/state/actions.ts: set ui.selectedTool
- [X] T048 [US2] Add click handler to carrot slot in UIScene.ts: call selectTool('carrot')
- [X] T049 [US2] Highlight selected tool in UIScene.ts: yellow border when selectedTool === 'carrot'
- [X] T050 [US2] Create horse eating animation placeholder: Duplicate horse sprite with different tint OR simple scale tween animation (no separate sprite sheet needed for MVP), save to assets/_placeholder/horse-eating.png if using frames
- [X] T051 [US2] Define eating animation in BootScene.ts anims.create(): 12 FPS, no repeat (if using sprite sheet) OR use Phaser.Tween for scale/tint animation
- [X] T052 [US2] Implement feed action in src/state/actions.ts: hunger += 20, carrots -= 1, clamp values
- [X] T053 [US2] Add click handler to Horse in MainGameScene.ts: if selectedTool === 'carrot' call feed()
- [X] T054 [US2] Trigger eating animation in MainGameScene.ts after feed() via event emission
- [X] T055 [US2] Create AnimationSystem in src/systems/AnimationSystem.ts: listen for animation events
- [X] T056 [US2] Gray out carrot icon when carrots === 0 in UIScene.ts render logic
- [X] T057 [US2] Prevent selection when carrots === 0 in selectTool action validation
- [X] T058 [US2] Write unit test in tests/unit/actions.test.ts: feed() increases hunger, consumes carrot
- [X] T059 [US2] Write unit test in tests/unit/actions.test.ts: feed() clamps hunger at 100
- [X] T060 [US2] Write unit test in tests/unit/actions.test.ts: feed() fails when carrots === 0

**US2 Complete**: ✅ Feeding mechanic functional end-to-end

---

## Phase 5: User Story 3 - Groom Horse with Brush (P3)

**Story Goal**: Fionella can select brush and drag across horse to increase cleanliness

**Independent Test**: Click brush → drag on horse → cleanliness increases → brush uses decrease

- [X] T061 [US3] Create brush icon placeholder: Draw rounded rectangle (brown #8B4513, 64x64px) OR use Unicode ⛏️/🪥 emoji, save to assets/_placeholder/brush-icon.png
- [X] T062 [US3] Load brush asset in BootScene.ts preload() method (this.load.image())
- [X] T063 [US3] Render brush inventory slot in UIScene.ts create() method, bottom-center position
- [X] T064 [US3] Bind brush uses count to gameStore.inventory.brushUses in UIScene.ts update() loop
- [X] T065 [US3] Add click handler to brush slot in UIScene.ts: call selectTool('brush')
- [X] T066 [US3] Highlight brush when selected in UIScene.ts: yellow border when selectedTool === 'brush'
- [X] T067 [US3] Create sparkle particle placeholder: Use Unicode ✨ emoji OR Phaser.Graphics white stars (16x16px), save to assets/_placeholder/sparkles.png
- [X] T068 [P] [US3] Create dust particle placeholder: Use Phaser.Graphics gray/brown circles (8x8px), save to assets/_placeholder/dust-particles.png
- [X] T069 [US3] Load particle assets in BootScene.ts preload() method (this.load.image())
- [X] T070 [US3] Create InputSystem in src/systems/InputSystem.ts: track pointer drag events
- [X] T071 [US3] Detect drag on horse in InputSystem.ts: emit 'groom' event when selectedTool === 'brush'
- [X] T072 [US3] Implement groom action in src/state/actions.ts: cleanliness += 5, brushUses -= 1, clamp values
- [X] T073 [US3] Call groom() per drag stroke in InputSystem.ts event handler
- [X] T074 [US3] Create particle emitter in MainGameScene.ts: spawn sparkles at drag position
- [X] T075 [US3] Trigger sparkle particles during grooming in MainGameScene.ts based on events
- [X] T076 [US3] Gray out brush icon when brushUses === 0 in UIScene.ts render logic
- [X] T077 [US3] Prevent selection when brushUses === 0 in selectTool action validation
- [X] T078 [US3] Write unit test in tests/unit/actions.test.ts: groom() increases cleanliness, consumes brush use
- [X] T079 [US3] Write unit test in tests/unit/actions.test.ts: groom() clamps cleanliness at 100
- [X] T080 [US3] Write unit test in tests/unit/actions.test.ts: groom() fails when brushUses === 0

**US3 Complete**: Grooming mechanic functional with particle effects

---

## Phase 6: User Story 4 - Pet Horse for Happiness (P4)

**Story Goal**: Fionella can click horse with no tool selected to increase happiness

**Independent Test**: Deselect tools → click horse → happiness increases → hearts appear

- [X] T081 [US4] Create heart particle placeholder: Use Unicode ❤️ emoji as texture OR Phaser.Graphics red heart shapes (32x32px), save to assets/_placeholder/hearts.png
- [X] T082 [US4] Load heart asset in BootScene.ts preload() method (this.load.image())
- [X] T083 [US4] Create horse happy animation placeholder: Reuse horse idle sprite with scale/bounce tween OR slight position shift animation (no separate frames needed for MVP), save to assets/_placeholder/horse-happy.png if using frames
- [X] T084 [US4] Define happy animation in BootScene.ts anims.create(): 12 FPS, no repeat (if using frames) OR use Phaser.Tween for bounce/scale effect
- [X] T085 [US4] Implement pet action in src/state/actions.ts: happiness += 10, clamp at 100
- [X] T086 [US4] Add petting logic to Horse click handler in MainGameScene.ts: if selectedTool === null call pet()
- [X] T087 [US4] Trigger happy animation in MainGameScene.ts after pet() via event emission
- [X] T088 [US4] Create heart particle emitter in MainGameScene.ts: spawn hearts above horse
- [X] T089 [US4] Trigger heart particles during petting in MainGameScene.ts based on events
- [X] T090 [US4] Write unit test in tests/unit/actions.test.ts: pet() increases happiness by 10
- [X] T091 [US4] Write unit test in tests/unit/actions.test.ts: pet() clamps happiness at 100
- [X] T092 [US4] Write unit test in tests/unit/actions.test.ts: pet() never fails (always available)

**US4 Complete**: Petting mechanic functional with heart effects

---

## Phase 7: User Story 5 - Automatic Status Decay (P5)

**Story Goal**: Status values decrease automatically over time based on decay rates

**Independent Test**: Launch game → wait 60 seconds → verify hunger, cleanliness, happiness decreased

- [X] T093 [US5] Implement applyDecay action in src/state/actions.ts: calculate decay based on elapsed ms
- [X] T094 [US5] Apply decay rates from gameConstants.ts: hunger -1/6s, cleanliness -1/12s, happiness -1/7.5s
- [X] T095 [US5] Clamp all status values at minimum 0 in applyDecay logic
- [X] T096 [US5] Create DecaySystem in src/systems/DecaySystem.ts: call applyDecay() every update tick
- [X] T097 [US5] Initialize DecaySystem in MainGameScene.ts create() method
- [X] T098 [US5] Update DecaySystem in MainGameScene.ts update() loop: pass delta time to applyDecay
- [X] T099 [US5] Write unit test in tests/unit/DecaySystem.test.ts: verify decay calculations for 60s elapsed
- [X] T100 [US5] Write unit test in tests/unit/DecaySystem.test.ts: verify values clamp at 0 (no negatives)
- [X] T101 [US5] Write unit test in tests/unit/DecaySystem.test.ts: verify different decay rates per status

**US5 Complete**: Time-based decay system functional

---

## Phase 8: Persistence & Save System

**Purpose**: Game state persists across browser sessions with elapsed time restoration

- [X] T102 Create SaveSystem in src/systems/SaveSystem.ts with save() and load() methods
- [X] T103 Implement save() in SaveSystem.ts: serialize gameState to JSON, write to LocalStorage key
- [X] T104 Implement load() in SaveSystem.ts: read from LocalStorage, parse JSON, validate schema
- [X] T105 Calculate elapsed time in load() method: Date.now() - savedState.timestamp
- [X] T106 Apply decay for elapsed time in load() method: call applyDecay(elapsedMs) before restoring state
- [X] T107 Implement loadGameState action in src/state/actions.ts: merge loaded state into store
- [X] T108 Call SaveSystem.load() in BootScene.ts create() method before launching MainGameScene
- [X] T109 Trigger auto-save every 10 seconds in MainGameScene.ts: setInterval calling SaveSystem.save()
- [X] T110 Trigger save after each interaction in actions.ts: feed(), groom(), pet() call SaveSystem.save()
- [X] T111 Add window.onbeforeunload handler in main.ts: save on tab close/refresh
- [X] T112 Write unit test in tests/unit/SaveSystem.test.ts: verify save serialization matches schema
- [X] T113 Write unit test in tests/unit/SaveSystem.test.ts: verify load deserialization and elapsed time
- [X] T114 Write unit test in tests/unit/SaveSystem.test.ts: verify corrupted data fallback to new game
- [ ] T115 Write integration test in tests/integration/careCycle.test.ts: feed → save → reload → state restored
- [X] T135 Create README.md with setup instructions, gameplay description, and credits

**Persistence Complete**: Save/load system functional with elapsed time handling

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, optimization, responsive design, final testing

**Asset Upgrade (Optional)**: If budget allows, replace placeholders with professional sprites from plan.md Decision 7 Phase B before production release.

- [X] T116 [P] Add background placeholder: Use CSS gradient (sky blue to grass green) OR simple colored rectangle via Phaser.Graphics, save to assets/_placeholder/stable-bg.png if using image
- [X] T117 [P] Load background in BootScene.ts (if using image) or create via Phaser.Graphics in MainGameScene.ts behind horse
- [X] T118 [P] Implement smooth tween animations for status bar value changes in StatusBar.ts
- [X] T119 [P] Add percentage text overlay on status bars in StatusBar.ts: "75/100"
- [X] T120 [P] Color-code status bars in StatusBar.ts: green (80-100), yellow (40-79), red (0-39)
- [X] T121 [P] Add touch-friendly hit boxes on Horse sprite in MainGameScene.ts: 20% larger than visual
- [X] T122 [P] Implement input debouncing in InputSystem.ts: prevent spam clicks (100ms cooldown)
- [X] T123 [P] Optimize texture atlas generation for all sprites using TexturePacker or Shoebox
- [X] T124 [P] Test responsive scaling on mobile devices: iPhone SE (375x667), iPad (768x1024)
- [X] T125 [P] Test responsive scaling on desktop: 1920x1080, 2560x1440
- [X] T126 [P] Profile performance in Chrome DevTools: verify 60 FPS maintained
- [X] T127 [P] Run ESLint and fix all warnings: `npm run lint`
- [X] T128 [P] Run Prettier and format all code: `npm run format`
- [X] T129 [P] Run full test suite with coverage: `npm run test:coverage` (verify >= 70%)
- [X] T130 [P] Test cross-browser manually: Chrome, Firefox, Safari, Edge
- [X] T131 [P] Fix any console errors or warnings in production build
- [X] T132 Build production bundle: `npm run build` and verify dist/ output
- [X] T133 Test production build locally: `npm run preview`
- [X] T134 Validate PWA manifest and service worker generation
- [X] T135 Create README.md with setup instructions, gameplay description, and credits
- [ ] T136 [OPTIONAL] Replace placeholder assets with professional sprites (plan.md Decision 7 Phase B): Commission artist OR purchase asset pack, integrate into assets/production/, update asset paths in BootScene.ts

**Polish Complete**: Production-ready MVP

---

## Dependencies & Execution Strategy

### Dependency Graph (User Story Completion Order)

```
Setup (Phase 1) → Foundational (Phase 2)
                     ↓
        ┌────────────┼────────────┬────────────┬────────────┐
        ↓            ↓            ↓            ↓            ↓
      US1 (P1)     US2 (P2)     US3 (P3)     US4 (P4)     US5 (P5)
    (T027-T040)  (T041-T060)  (T061-T080)  (T081-T092)  (T093-T101)
        ↓            ↓            ↓            ↓            ↓
        └────────────┴────────────┴────────────┴────────────┘
                                 ↓
                      Persistence (T102-T115)
                                 ↓
                          Polish (T116-T135)
```

### Critical Path

1. **Setup → Foundational** (BLOCKING): Tasks T001-T026 must complete first
2. **User Stories (Parallel)**: US1-US5 can be developed independently after foundational
3. **Persistence**: Depends on all user stories (needs state structure finalized)
4. **Polish**: Depends on persistence (final integration)

### Parallel Execution Examples

**After Foundational Phase Complete**:
- Team Member 1: US1 (View Horse) → T027-T040
- Team Member 2: US2 (Feed) → T041-T060  
- Team Member 3: US3 (Groom) → T061-T080

**Within US2 (Feed Horse)**:
- Developer A: Asset loading (T041-T043) + Inventory UI (T044-T049)
- Developer B: Feed action logic (T052) + Unit tests (T058-T060)
- Both merge for animation integration (T050-T051, T053-T055)

**Polish Phase (Highly Parallel)**:
- Graphics Artist: Background, texture atlases (T116-T117, T123)
- UI Developer: Status bar enhancements (T118-T120)
- QA: Testing across browsers/devices (T124-T126, T130-T131)
- DevOps: Build optimization, PWA validation (T132-T134)

### Implementation Strategy

**MVP-First Approach**:
1. Deliver **US1** first → demonstrable (horse visible)
2. Then **US2** → first interaction (feeding works)
3. Then **US3, US4, US5** → complete care mechanics
4. Then **Persistence** → data doesn't lose
5. Finally **Polish** → production quality

**Estimated Timeline** (1 Developer Full-Time):
- Phase 1 (Setup): 1 day
- Phase 2 (Foundational): 1-2 days
- Phase 3 (US1): 1 day
- Phase 4 (US2): 1.5 days
- Phase 5 (US3): 1.5 days
- Phase 6 (US4): 1 day
- Phase 7 (US5): 1 day
- Phase 8 (Persistence): 1.5 days
- Phase 9 (Polish): 2-3 days

**Total**: 12-16 days for complete MVP

---

## Validation Checklist

Before marking feature complete:

- [ ] All 135 tasks marked as completed
- [ ] All 5 user stories independently testable
- [ ] Test coverage >= 70% for game logic
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] Zero ESLint warnings (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Game runs at 60 FPS on mid-range device
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive (320px - 2560px width)
- [ ] PWA installable (manifest + service worker)
- [ ] Save/load works across browser sessions
- [ ] All constitutional principles satisfied (Visual Excellence, Engine Foundation, Browser-First, Testable Logic, 2D→3D Path)

---

## Legend

- `[ ]` = Not started
- `[P]` = Can execute in parallel with other [P] tasks
- `[USn]` = Belongs to User Story n (US1=P1, US2=P2, etc.)
- File paths included in task descriptions for clarity

**Next Step**: Execute `/speckit.implement` to begin implementation following this task plan.
