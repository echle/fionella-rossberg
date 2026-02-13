# codespaces-blank Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-11

## Active Technologies

- TypeScript 5.x+ (strict mode enabled) + Phaser 3.80+, Zustand 4.x, Vite 5.x, Vitest 1.x (001-project-init-and-show-spine)
- Promise-based actions, timestamp-based timing (Date.now()), lazy pruning for array cleanup (002-feeding-mechanics)

## Project Structure

```text
src/
├── config/           # Game constants and configuration
├── state/            # Zustand store, types, actions
├── entities/         # Phaser game objects (Horse, InventoryItem)
├── scenes/           # Phaser scenes (Boot, MainGame, UI)
├── systems/          # Game systems (Decay, Save, Input)  
└── utils/            # Pure helper functions (testable)
tests/
├── unit/             # Unit tests for pure functions
└── integration/      # Integration tests for full flows
```

## Commands

npm test && npm run lint && npm run build

## Code Style

TypeScript 5.x+ (strict mode enabled): Follow standard conventions, use async/await for timed interactions, prefer timestamp-based timing over frame counters

## Recent Changes

- 001-project-init-and-show-spine: Added TypeScript 5.x+ (strict mode enabled) + Phaser 3.80+, Zustand 4.x, Vite 5.x, Vitest 1.x
- 002-feeding-mechanics: Added Promise-based actions (async feed()), timestamp-based timing for FPS-independent accuracy, lazy pruning pattern for recentFeedings array

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
