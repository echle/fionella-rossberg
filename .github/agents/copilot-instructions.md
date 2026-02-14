# codespaces-blank Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-14

## Active Technologies

- TypeScript 5.x+ (strict mode enabled) + Phaser 3.80+, Zustand 4.x, Vite 5.x, Vitest 1.x (001-project-init-and-show-spine)
- Promise-based actions, timestamp-based timing (Date.now()), lazy pruning for array cleanup (002-feeding-mechanics)
- Phaser sprite sheets (horizontal strip layout), frame-based animations (9-12 FPS), animation state machine (enum-based) (003-visual-assets)
- Custom i18n service (no external library), JSON-based translations (locales/de.json, locales/en.json), localStorage for language persistence (005-internationalization-i18n)

## Project Structure

```text
src/
├── config/           # Game constants and configuration
├── state/            # Zustand store, types, actions
├── entities/         # Phaser game objects (Horse, InventoryItem)
├── scenes/           # Phaser scenes (Boot, MainGame, UI)
├── systems/          # Game systems (Decay, Save, Input)
├── services/         # Singleton services (i18nService)
├── components/       # Reusable UI components (LanguageSelector)
├── locales/          # Translation files (de.json, en.json)
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
- 003-visual-assets: Added Phaser.Sprite-based rendering (replaces Image), animation registration via this.anims.create(), enum-based state machine for horse animations, bottom-center anchor (0.5, 1.0) for sprite positioning, fallback to placeholder Graphics if sprites unavailable
- 005-internationalization-i18n: Added custom i18nService for German/English translation, translation key format (category.subcategory.key), LanguageSelector UI component in UIScene, localStorage persistence, all user-facing strings use i18nService.t()

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
