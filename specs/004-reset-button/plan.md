# Implementation Plan: Reset Button

**Branch**: `004-reset-button` | **Date**: 2026-02-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-reset-button/spec.md`

## Summary

This feature adds a "Reset Game" button that appears when the player exhausts all resources (carrots = 0 AND brush uses = 0), allowing them to restart the game without manually reloading the page. The button resets all game state (horse status, inventory, feeding state, UI state) to initial values and saves the reset state to localStorage. The button is hidden during normal gameplay and only appears as a recovery mechanism.

**Technical Approach**: Add a conditional UI element to UIScene that monitors inventory state, enhance the existing `resetGame()` action to include feeding state reset, integrate with SaveSystem for persistence, and ensure DecaySystem timer is reset to avoid status decay jumps.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode enabled)  
**Primary Dependencies**: Phaser 3.80+, Zustand 4.x for state  
**Storage**: LocalStorage via existing SaveSystem  
**Testing**: Vitest 1.6+ with jsdom, unit tests for reset logic  
**Target Platform**: Browser (Chrome, Firefox, Safari, Edge latest 2 versions)  
**Project Type**: Single-page Phaser game with scene-based UI  
**Performance Goals**: Reset operation < 100ms, button visibility update within 1 frame (16ms at 60fps)  
**Constraints**: Must work on both desktop (mouse) and mobile (touch), no external dependencies  
**Scale/Scope**: ~50 LOC additions (UIScene button + resetGame enhancement)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Visual Excellence First
- **Button design**: Clear, prominent visual with interactive hover/tap states
- **Smooth transitions**: Button fades in/out, not abrupt visibility changes
- **Visual feedback**: Click feedback (scale, color change) confirms interaction
- **No frame drops**: Reset operation quick enough to maintain 60 FPS
- **Status**: ✅ PASS - Minimal visual complexity, focuses on clear UX

### ✅ II. Game Engine Foundation  
- **Phaser UI objects**: Use Phaser.GameObjects.Text or Container for button
- **Scene integration**: Button lives in existing UIScene, no new scene needed
- **Input system**: Leverage Phaser's pointer events (pointerdown, pointerover)
- **Status**: ✅ PASS - Built entirely on existing Phaser scene structure

### ✅ III. Browser-First Deployment
- **No new dependencies**: Uses existing Phaser + Zustand stack
- **Touch + mouse support**: Phaser pointer events work on both
- **LocalStorage persistence**: Compatible with all modern browsers
- **Zero bundle impact**: < 1KB added to bundle size
- **Status**: ✅ PASS - No external dependencies, pure UI addition

### ✅ IV. Testable Game Logic
- **Pure function**: Enhanced `resetGame()` action is testable
- **State validation**: Can unit test that reset returns to initial state
- **Isolation**: Button visibility logic is pure (carrots === 0 && brushUses === 0)
- **Integration test**: Can test full reset flow end-to-end
- **Status**: ✅ PASS - Core reset logic is testable without Phaser

### ✅ V. 2D→3D Evolution Path
- **State abstraction**: Reset logic is engine-agnostic (just state updates)
- **UI swap**: Button can be replaced with 3D UI element in future
- **No tight coupling**: resetGame() doesn't assume 2D vs 3D rendering
- **Status**: ✅ PASS - Reset logic is pure state management

**GATE RESULT**: ✅ **ALL CHECKS PASSED** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-reset-button/
├── spec.md              # ✅ Complete (user stories, requirements)
├── plan.md              # ← This file (technical approach)
├── research.md          # Phase 0 output (UI patterns, reset strategies)
├── data-model.md        # Phase 1 output (no new data models needed - reuses existing)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (action signatures)
│   └── reset-api.md     # Enhanced resetGame() signature + button interface
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── scenes/
│   ├── UIScene.ts       # Modified: Add reset button + visibility logic
│   └── MainGameScene.ts # Modified: Call decaySystem.reset() on game reset
├── state/
│   └── actions.ts       # Modified: Enhance resetGame() to include feeding state
├── systems/
│   └── DecaySystem.ts   # Existing: reset() method already present
└── config/
    └── gameConstants.ts # Existing: INITIAL_STATUS, INITIAL_INVENTORY constants

tests/
├── unit/
│   ├── actions.test.ts  # Modified: Add tests for enhanced resetGame()
│   └── UIScene.test.ts  # New: Tests for reset button visibility logic
└── integration/
    └── resetFlow.test.ts # New: End-to-end test for reset functionality
```

**Structure Decision**: This is a single-project Phaser game. All changes are modifications to existing files in the `src/` directory, with most logic in `UIScene.ts` (button rendering + visibility) and `actions.ts` (enhanced reset function). No new directories or major structural changes needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

**No violations** - All constitution principles are satisfied.
