# Implementation Plan: Horse Care Game MVP

**Branch**: `001-horse-care-mvp` | **Date**: 2026-02-09 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-horse-care-mvp/spec.md`  
**Tech Stack**: Phaser 3 + TypeScript + Vite | HTML5 Canvas + Zustand | LocalStorage + Vitest

## Summary

Build a browser-based horse care game MVP where Fionella can view, feed, groom, and pet her horse. The horse has three status values (Hunger, Cleanliness, Happiness) that decay over time, creating a care loop. The game uses 2D sprites, supports mouse and touch input, and saves progress to LocalStorage.

**Technical Approach**: Phaser 3 game engine provides scene management, sprite rendering, and input handling. TypeScript ensures type safety. Zustand manages game state separately from rendering for testability. Vite offers fast development and optimized builds. Vitest tests game logic.

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode enabled)  
**Primary Dependencies**: Phaser 3.80+, Zustand 4.x, Vite 5.x, Vitest 1.x  
**Storage**: LocalStorage (browser native, no external DB)  
**Testing**: Vitest for game logic unit tests, minimum 70% coverage  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), desktop and mobile  
**Project Type**: Single-page game application (web)  
**Performance Goals**: 60 FPS gameplay, initial load < 5 seconds on 3G, responsive to 320px-2560px width  
**Constraints**: < 100ms interaction response time, < 200MB memory for extended sessions, no backend required  
**Scale/Scope**: Single-player MVP, 1 horse, 3 care actions, ~5-10 minute gameplay loop before item depletion

## Constitution Check

✅ **I. Visual Excellence First**
- All care actions (feed, groom, pet) include polished animations (eating, sparkles, hearts)
- 60 FPS target enforced via Phaser's built-in game loop
- Animation-first approach: Phaser Tween system and Sprite animation framework
- High-quality sprite assets loaded via texture atlases for efficient rendering
- Consistent art style through unified sprite sheet and UI theme

✅ **II. Game Engine Foundation**
- Phaser 3.80+ chosen as primary game engine (constitutional requirement met)
- Leverages Phaser Scene system for game state management
- Uses Phaser Input Manager for mouse/touch handling
- Sprite and animation systems via Phaser.GameObjects.Sprite
- No custom renderer - full use of Phaser's WebGL/Canvas rendering

✅ **III. Browser-First Deployment**
- Zero installation: Deployed as static site, accessible via URL
- PWA capability via Vite PWA plugin (manifest.json, service worker)
- Responsive design: Phaser Scale Manager handles viewport adaptat ion
- Cross-browser tested via BrowserStack/manual testing in CI
- Performance budget: Vite code-splitting, lazy asset loading, < 500KB initial JS bundle

✅ **IV. Testable Game Logic**
- Game state separated from rendering via Zustand store
- Pure functions for status calculations, decay logic, inventory management
- Vitest unit tests for: Status updates, time-based decay, save/load logic, inventory operations
- Integration tests for: Complete care cycles, multi-interaction flows
- Mock Phaser components in tests to isolate business logic

✅ **V. 2D→3D Evolution Path**
- Rendering abstraction: Game logic interacts with Zustand state, not directly with Phaser sprites
- Asset pipeline: Organized folders support future GLTF/GLB addition alongside PNG sprites
- Entity Component pattern: Horse represented as data object + renderer mapping
- Phaser Camera system already 2D/3D capable (future Three.js integration possible)
- Phase 1: Full 2D (current), Phase 2: Three.js renderer swap planned in architecture

**Verdict**: ✅ All constitutional requirements satisfied. Phaser 3 + TypeScript + Vite stack fully compliant.

## Project Structure

### Source Code (repository root)

```
src/
├── main.ts                 # Entry point, initializes Phaser game
├── config/
│   ├── phaserConfig.ts     # Phaser game configuration
│   └── gameConstants.ts    # Game balance values (decay rates, status increments)
├── scenes/
│   ├── BootScene.ts        # Asset preloading scene
│   ├── MainGameScene.ts    # Primary gameplay scene
│   └── UIScene.ts          # Overlay UI scene (status bars, inventory)
├── entities/
│   ├── Horse.ts            # Horse sprite + animation controller
│   ├── StatusBar.ts        # Status bar UI component
│   └── InventoryItem.ts    # Inventory slot UI component
├── state/
│   ├── gameStore.ts        # Zustand store for game state
│   ├── types.ts            # TypeScript interfaces for state
│   └── actions.ts          # State update functions (feed, groom, pet, decay)
├── systems/
│   ├── InputSystem.ts      # Mouse/touch input handling
│   ├── AnimationSystem.ts  # Animation playback logic
│   ├── DecaySystem.ts      # Time-based status decay
│   └── SaveSystem.ts       # LocalStorage save/load
└── utils/
    ├── timeUtils.ts        # Elapsed time calculations
    └── mathUtils.ts        # Clamping, lerping

assets/
├── sprites/
│   ├── horse/
│   │   ├── horse-idle.png
│   │   ├── horse-eating.png
│   │   ├── horse-happy.png
│   │   └── atlas.json      # Texture atlas definition
│   └── effects/
│       ├── sparkles.png
│       ├── hearts.png
│       └── dust-particles.png
├── ui/
│   ├── status-bar-bg.png
│   ├── status-bar-fill.png
│   ├── inventory-slot.png
│   ├── carrot-icon.png
│   └── brush-icon.png
└── backgrounds/
    └── stable-bg.png        # Simple stable background

public/
├── index.html               # HTML entry point
├── manifest.json            # PWA manifest
└── favicon.ico

tests/
├── unit/
│   ├── gameStore.test.ts    # State management tests
│   ├── actions.test.ts      # Feed/groom/pet logic tests
│   ├── DecaySystem.test.ts  # Time decay calculations
│   └── SaveSystem.test.ts   # Save/load persistence
└── integration/
    └── careCycle.test.ts    # Full interaction workflow

```

### Configuration Files

```
project-root/
├── package.json             # Dependencies, scripts
├── tsconfig.json            # TypeScript configuration (strict mode)
├── vite.config.ts           # Vite build configuration + PWA plugin
├── vitest.config.ts         # Vitest test configuration
├── .eslintrc.js             # ESLint rules
├── .prettierrc              # Prettier formatting
└── .gitignore               # Ignore node_modules, dist, etc.
```

## Phase 0: Research & Technical Decisions

### Decision 1: Phaser 3 over PixiJS
**Choice**: Phaser 3.80+  
**Rationale**: 
- Higher-level API with built-in scene management, input, and tweening
- Extensive plugin ecosystem (PWA, UI components)
- Better TypeScript support out of the box
- Reduces boilerplate vs. PixiJS (which requires custom game loop)
- Constitutional compliance (Principle II explicitly mentions Phaser)

**Alternatives Considered**: PixiJS 7.x would offer lower-level control but requires more infrastructure code. For MVP, Phaser's batteries-included approach is more efficient.

### Decision 2: Zustand for State Management
**Choice**: Zustand 4.x  
**Rationale**:
- Lightweight (< 1KB), minimal boilerplate
- Framework-agnostic (doesn't tie to React/Vue)
- Enables testable, pure-function state updates
- Clear separation from Phaser rendering (Principle IV compliance)
- DevTools support for debugging state transitions

**Alternatives Considered**: Redux (too heavy), MobX (reactive overhead), vanilla JS objects (harder to test, no devtools).

### Decision 3: Texture Atlas for Sprites
**Choice**: TexturePacker or Shoebox for atlas generation  
**Rationale**:
- Reduces draw calls (single texture for all horse animations)
- Faster loading (one HTTP request vs. multiple)
- Better GPU memory usage
- Phaser has native atlas JSON support

**Alternatives Considered**: Individual PNG files (simple but inefficient for performance).

### Decision 4: Vite PWA Plugin for Offline Support
**Choice**: vite-plugin-pwa  
**Rationale**:
- Auto-generates service worker and manifest.json
- Offline caching strategy out of the box
- Satisfies Constitution Principle III (PWA capability)
- Zero configuration for basic setup

**Alternatives Considered**: Manual service worker (more control, more complexity).

### Decision 5: LocalStorage for Save System
**Choice**: Browser LocalStorage API  
**Rationale**:
- No backend required (MVP simplicity)
- Synchronous API (simpler than IndexedDB for small data)
- 5-10MB limit sufficient for game state (< 1KB needed)
- Universal browser support

**Alternatives Considered**: IndexedDB (async, more complex API, overkill for MVP), SessionStorage (doesn't persist across browser closes).

### Decision 6: Vitest over Jest
**Choice**: Vitest 1.x  
**Rationale**:
- Native Vite integration (shares config, faster)
- ESM-first (TypeScript works out of the box)
- Compatible Jest API (easy migration path)
- Faster test execution due to Vite's transform pipeline

**Alternatives Considered**: Jest (requires additional Babel/TS config), Mocha (less modern).

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](data-model.md) for detailed entity definitions.

**Key Entities**:
- **GameState**: Central state object (horse status, inventory, timestamp)
- **Horse**: Sprite reference + animation state
- **StatusBar**: Visual component + value binding
- **InventoryItem**: Type (carrot/brush), count, icon

### API Contracts

See [contracts/game-state-schema.json](contracts/game-state-schema.json) for full schema.

**LocalStorage Contract**:
```typescript
interface SavedGameState {
  version: string;           // "1.0.0"
  timestamp: number;         // Unix timestamp (ms)
  horse: {
    hunger: number;          // 0-100
    cleanliness: number;     // 0-100
    happiness: number;       // 0-100
  };
  inventory: {
    carrots: number;         // 0-10 initially
    brushUses: number;       // 0-100 initially
  };
}
```

### Quick Start Guide

See [quickstart.md](quickstart.md) for development setup and testing scenarios.

## Implementation Strategy

### Development Phases

**Phase 1: Foundation** (Setup + P1 User Story)
- Project scaffolding (Vite + TypeScript + Phaser)
- Asset pipeline setup (sprites, atlas)
- Zustand store structure
- Scene: MainGameScene with horse sprite
- UI: Status bars rendering
- **Deliverable**: Horse visible with status bars (US1 complete)

**Phase 2: Core Interactions** (P2-P4 User Stories)
- Feed action (carrot selection + animation + status update)
- Groom action (brush drag input + particles + status update)
- Pet action (click/tap + hearts + status update)
- Inventory UI (item selection, count display)
- **Deliverable**: All 3 care actions functional (US2-US4 complete)

**Phase 3: Game Loop Dynamics** (P5 User Story)
- Time-based decay system
- Decay calculations on game tick
- Background time calculation (elapsed since last play)
- **Deliverable**: Status bars decay over time (US5 complete)

**Phase 4: Persistence** (Save System)
- SaveSystem implementation (LocalStorage write/read)
- Load game state on boot
- Auto-save on interaction and periodically (every 10 seconds)
- Elapsed time restoration on reload
- **Deliverable**: Game progress persists across sessions

**Phase 5: Polish & Optimization**
- Animation refinement (tweens, easing)
- Particle effects (sparkles, dust, hearts)
- Input debouncing for spam prevention
- Responsive scaling (mobile optimization)
- Performance profiling (60 FPS validation)
- **Deliverable**: Production-ready MVP

### Testing Approach

**Unit Tests** (Vitest):
- `gameStore.test.ts`: State initialization, status updates, inventory mutations
- `actions.test.ts`: Feed/groom/pet logic (increments, clamping)
- `DecaySystem.test.ts`: Time decay calculations, elapsed time handling
- `SaveSystem.test.ts`: Serialization, deserialization, versioning
- **Target**: 70% coverage for game logic (excluding Phaser rendering)

**Integration Tests**:
- `careCycle.test.ts`: Full workflow (load → interact → see status change → save → reload)
- Input scenarios (mouse vs. touch, rapid clicking)
- Edge cases (0 inventory, maxed status bars)

**Manual Testing**:
- Cross-browser validation (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS Safari, Android Chrome)
- Performance profiling (Chrome DevTools, FPS counter)
- Accessibility check (keyboard navigation for menus)

### Deployment Strategy

**Development**:
```bash
npm run dev       # Vite dev server on localhost:5173
```

**Production Build**:
```bash
npm run build     # TypeScript compile + Vite bundle
npm run preview   # Preview production build locally
```

**Hosting Options**:
- **GitHub Pages**: Free, automatic deploys via Actions
- **Netlify**: Drag-drop deployment, custom domain support
- **Vercel**: One-click Vite deploy, edge network
- **itch.io**: Game-specific platform, analytics

**PWA Deployment**:
- Vite PWA plugin auto-generates `sw.js` (service worker)
- `manifest.json` includes app name, icons, theme color
- Cached assets for offline play (sprites, code)

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Phaser learning curve steeper than expected | Schedule delay | Medium | Follow official examples, use TypeScript definitions, community Discord |
| Performance issues on older mobile devices | User experience | Low | Profile early, use texture atlases, limit particles, test on mid-range 2018 device |
| LocalStorage quota exceeded (rare) | Save failure | Very Low | Monitor save size (< 5KB), add quota check, fallback to SessionStorage |
| Touch input conflicts with browser gestures | Input bugs | Medium | Use Phaser Input plugin (handles preventDefault), thorough mobile testing |
| Asset quality inconsistent (art style) | Visual polish | Low | Use single sprite sheet from one artist, style guide document |
| Time decay bugs (clock drift, timezone) | Gameplay bugs | Medium | Use UTC timestamps, test with timezone changes, clamp calculated decay |

## Timeline Estimate

**Phase 1 (Foundation)**: 2-3 days  
- Project setup, Phaser integration, basic rendering

**Phase 2 (Core Interactions)**: 3-4 days  
- 3 care actions + inventory + animations

**Phase 3 (Game Loop)**: 2 days  
- Decay system + time calculations

**Phase 4 (Persistence)**: 1-2 days  
- Save/load + elapsed time handling

**Phase 5 (Polish)**: 2-3 days  
- Particle effects, responsive design, optimization

**Testing & Bug Fixes**: 2 days  
- Cross-browser, mobile, edge cases

**Total Estimate**: 12-16 days (2-3 weeks)

**Note**: Assumes 1 developer working full-time, placeholder sprite assets available. Custom art creation would add 5-7 days.

## Success Metrics

**Performance**:
- ✅ 60 FPS maintained on mid-range 2018 device
- ✅ Initial load < 5 seconds on 3G network
- ✅ Interaction response < 100ms (visual feedback)

**Functionality**:
- ✅ All 5 user stories pass acceptance scenarios
- ✅ 70%+ test coverage for game logic
- ✅ Zero console errors in production build

**User Experience**:
- ✅ Game playable on screens 320px-2560px width
- ✅ Touch and mouse inputs work identically
- ✅ Save/load functions across browser sessions

**Constitutional Compliance**:
- ✅ Visual animations present for all actions (Principle I)
- ✅ Phaser 3 engine foundation (Principle II)
- ✅ Browser-playable, PWA-enabled (Principle III)
- ✅ Game logic unit-tested (Principle IV)
- ✅ Rendering abstraction layer present (Principle V)

## Next Steps

1. **Execute `/speckit.tasks`** to break down this plan into actionable task list
2. **Create feature branch**: `git checkout -b 001-horse-care-mvp`
3. **Setup project**: Run `npm create vite@latest . -- --template vanilla-ts`
4. **Install dependencies**: `npm install phaser zustand vitest`
5. **Begin Phase 1**: Scaffold MainGameScene and render horse sprite

This plan is ready for task decomposition and implementation. All constitutional requirements are satisfied, and the technical stack aligns with project principles.
