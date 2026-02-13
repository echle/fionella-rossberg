# 🐴 Fionella's Horse Care Game MVP

A browser-based horse care simulation game where you feed, groom, and pet your virtual horse to keep it happy and healthy.

![Horse Care Game](https://img.shields.io/badge/Status-MVP_Complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Phaser](https://img.shields.io/badge/Phaser-3.80-orange)

## ✨ Features

- **🐴 Virtual Horse Companion**: Interact with your horse in a vibrant stable environment
- **🥕 Enhanced Feeding System**: 
  - Timed eating animation (2.5s) with visual progress bar
  - Satiety limit (3 carrots) with 30-second cooldown
  - Smart decay (10s per carrot) prevents permanent lockout
  - Fullness badge with countdown timer
- **🪥 Grooming Mechanic**: Drag across your horse with a brush to boost cleanliness
- **❤️ Petting Interaction**: Click your horse to increase happiness and see heart animations
- **⏱️ Time-Based Decay**: Status values decrease gradually over time, requiring regular care
- **💾 Auto-Save System**: Your game state persists across browser sessions with LocalStorage
- **📱 Responsive Design**: Play on desktop or mobile devices with adaptive scaling (320px-2560px)
- **✨ Visual Feedback**: Animated status bars, particle effects, emoji reactions, and real-time indicators

## 🎮 Current Status

**🎉 MVP + Feature 002 Complete** - All core features and enhanced feeding mechanics implemented!

### ✅ Feature 001: Horse Care MVP (136/136 tasks)
- ✅ Phase 1: Setup (15 tasks)
- ✅ Phase 2: Foundation (11 tasks)
- ✅ Phase 3: US1 View Horse (14 tasks)
- ✅ Phase 4: US2 Feed (20 tasks)
- ✅ Phase 5: US3 Groom (20 tasks)
- ✅ Phase 6: US4 Pet (12 tasks)
- ✅ Phase 7: US5 Decay (9 tasks)
- ✅ Phase 8: Persistence (13 tasks)
- ✅ Phase 9: Polish (21 tasks)

### ✅ Feature 002: Enhanced Feeding Mechanics (30/30 tasks)
- ✅ User Story 1: Timed eating animation (12 tasks)
- ✅ User Story 2: Satiety limit system (5 tasks)
- ✅ User Story 3: Visual feedback (7 tasks)
- ✅ Polish & Validation (6 tasks)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd horse-care-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173` (or another available port).

### Available Scripts

- `npm run dev` - Start Vite dev server with hot-reload
- `npm run build` - Build for production (output: dist/)
- `npm run preview` - Preview production build locally
- `npm test` - Run Vitest unit tests
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate coverage report (target: ≥70%)
- `npm run lint` - Run ESLint on all TypeScript files
- `npm run format` - Format code with Prettier

## 🎮 How to Play

### Basic Controls

1. **Select a Tool**:
   - Click the **🥕 Carrot** icon to select the feeding tool
   - Click the **🪥 Brush** icon to select the grooming tool

2. **Interact with Your Horse**:
   - **Feed**: Select carrot → click horse → hunger increases by 20
   - **Groom**: Select brush → drag across horse → cleanliness increases by 5 per stroke
   - **Pet**: With no tool selected → click horse → happiness increases by 10

3. **Monitor Status Bars** (color-coded green/yellow/red):
   - **Hunger** (top-left): Decreases by 1 every 6 seconds
   - **Cleanliness** (top-center): Decreases by 1 every 12 seconds
   - **Happiness** (top-right): Decreases by 1 every 7.5 seconds

4. **Manage Resources**:
   - Start with 10 carrots and 100 brush uses
   - Tools become unavailable when depleted (grayed out with 30% opacity)

### Game Mechanics

- **Decay System**: Status values automatically decrease over time based on decay rates
- **Status Clamping**: Values range from 0-100 (cannot go negative or exceed maximum)
- **Auto-Save**: Game state saves automatically:
  - Every 10 seconds
  - After each interaction (feed/groom/pet)
  - When closing/refreshing the browser tab (beforeunload event)
- **Elapsed Time**: When you return after being away, decay applies retroactively based on time passed

## 📁 Project Structure

```
horse-care-game/
├── src/
│   ├── config/
│   │   ├── phaserConfig.ts      # Phaser game configuration (800x600, FIT scale)
│   │   └── gameConstants.ts     # Balance tuning values (decay rates, increments)
│   ├── entities/
│   │   ├── Horse.ts             # Horse sprite with playEatingAnimation/playHappyAnimation
│   │   ├── StatusBar.ts         # UI status bar component (color-coded, smooth tweens)
│   │   └── InventoryItem.ts     # Inventory slot component (selection highlight, gray-out)
│   ├── scenes/
│   │   ├── BootScene.ts         # Asset loading and save restoration
│   │   ├── MainGameScene.ts     # Primary gameplay scene with interaction handlers
│   │   └── UIScene.ts           # Overlay UI for status and inventory
│   ├── state/
│   │   ├── types.ts             # TypeScript interfaces (GameState, HorseStatus, etc.)
│   │   ├── gameStore.ts         # Zustand store initialization
│   │   └── actions.ts           # State mutation functions (feed, groom, pet, decay)
│   ├── systems/
│   │   ├── InputSystem.ts       # Drag gesture detection for grooming
│   │   ├── DecaySystem.ts       # Time-based status degradation
│   │   └── SaveSystem.ts        # LocalStorage persistence with schema validation
│   ├── utils/
│   │   ├── mathUtils.ts         # clamp(), lerp()
│   │   ├── timeUtils.ts         # Time conversion helpers
│   │   └── feedingHelpers.ts    # Satiety calculations (canFeed, getSatietyProgress, etc.)
│   └── main.ts                  # Entry point (Phaser initialization + beforeunload save)
├── tests/
│   ├── unit/                    # Unit tests (gameStore, actions, DecaySystem, SaveSystem)
│   └── integration/             # Integration tests
├── public/
│   ├── index.html               # HTML entry point
│   └── manifest.json            # PWA manifest
├── specs/                       # Specification documents
│   ├── 001-horse-care-mvp/
│   │   ├── spec.md              # Feature requirements
│   │   ├── plan.md              # Implementation plan with technical decisions
│   │   ├── tasks.md             # Task breakdown (136 tasks)
│   │   ├── data-model.md        # Entity definitions
│   │   ├── quickstart.md        # Developer integration guide
│   │   └── contracts/           # API contracts and schemas
│   └── 002-feeding-mechanics/
│       ├── spec.md              # Enhanced feeding feature requirements
│       ├── plan.md              # Technical implementation details
│       ├── tasks.md             # Task breakdown (30 tasks)
│       ├── data-model.md        # FeedingState schema
│       ├── research.md          # Technical decisions
│       ├── quickstart.md        # Developer integration guide
│       └── contracts/           # Feeding API contracts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 🎯 MVP Features

### User Stories (All Implemented)

**Feature 001 - MVP**:
1. ✅ **P1 - View Horse**: See horse sprite with 3 color-coded status bars (Hunger, Cleanliness, Happiness)
2. ✅ **P2 - Feed**: Select carrot from inventory and feed horse (eating animation)
3. ✅ **P3 - Groom**: Select brush and drag across horse to groom (sparkle particles)
4. ✅ **P4 - Pet**: Click/tap horse to increase happiness (heart animations)
5. ✅ **P5 - Decay**: Status values decrease over time with retroactive catch-up
6. ✅ **P6 - Persistence**: Auto-save to LocalStorage with elapsed time restoration

**Feature 002 - Enhanced Feeding**:
1. ✅ **US1 - Timed Eating**: 2.5s eating animation with progress bar, spam prevention
2. ✅ **US2 - Satiety Limit**: 3-carrot limit, 30s cooldown, 10s decay per carrot
3. ✅ **US3 - Visual Feedback**: Progress bar, fullness badge (🍽️), countdown timer, grayed icons

### Game Mechanics
- **Starting Inventory**: 10 carrots, 100 brush uses
- **Status Range**: 0-100 for all stats (clamped)
- **Decay Rates**:
  - Hunger: -1 per 6 seconds (~10 min to 0)
  - Cleanliness: -1 per 12 seconds (~20 min to 0)
  - Happiness: -1 per 7.5 seconds (~12.5 min to 0)
- **Action Effects**:
  - Feed: +20 hunger, -1 carrot, eating animation
  - Groom: +5 cleanliness per stroke, -1 brush use, sparkles
  - Pet: +10 happiness (unlimited, no cost), hearts

### Save System
- **Auto-Save Triggers**:
  - Every 10 seconds (time-based interval)
  - After each interaction (feed/groom/pet)
  - On tab close/refresh (beforeunload event)
- **Elapsed Time Handling**: Decay applies retroactively when loading saved game

## 🧪 Testing

### Unit Tests

The project includes comprehensive unit tests covering:

- **State Management** (gameStore.test.ts): Initial state, updates, partial changes, timestamp tracking
- **Game Actions** (actions.test.ts): feed(), groom(), pet(), selectTool() with edge cases and async eating
- **Feeding Helpers** (feedingHelpers.test.ts): canFeed(), getSatietyProgress(), getRemainingCooldown(), getTimeUntilNextDecay()
- **Decay System** (DecaySystem.test.ts): Time-based calculations, clamping, rate differences
- **Save System** (SaveSystem.test.ts): Serialization, validation, elapsed time, feeding state persistence
- **Integration Tests** (careCycle.test.ts): End-to-end feeding mechanics (6 tests)

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Interactive test UI
npm run test:ui

# Watch mode for development
npm run test -- --watch
```

**Test Status**: 72 passing tests  
**Coverage Target**: ≥70% for all modules

### Manual Testing Checklist

1. **Feeding**: Click carrot → click horse → verify 2.5s eating animation with progress bar
2. **Satiety Limit**: Feed 3 carrots → verify fullness badge (🍽️) appears with countdown
3. **Cooldown**: After 3 carrots → verify carrot grayed out for 30 seconds
4. **Decay**: Wait 10s → verify satiety decreases by 1 carrot, cooldown updates
5. **Grooming**: Click brush → drag on horse → verify cleanliness increases, sparkles appear
6. **Petting**: Click horse (no tool) → verify happiness increases, hearts appear
7. **Decay**: Wait 60 seconds → verify all status values decrease by expected amounts
8. **Persistence**: Feed 3 carrots → refresh page → verify cooldown persists
9. **Resource Depletion**: Use all carrots → verify icon grays out, clicking does nothing
10. **Status Clamping**: Feed at 90 hunger → verify caps at 100, doesn't exceed

## 🛠️ Development Workflow

### Current Status: All Features Complete ✅

The game is fully functional with all MVP features and enhanced feeding mechanics:

```bash
npm run dev
```

Expected output:
- Vite dev server starts on http://localhost:5173
- Browser shows stable with horse, status bars, and inventory
- Feeding shows 2.5s eating animation with progress bar
- After 3 carrots, fullness badge (🍽️) appears with countdown timer
- All 72 tests passing

### Implementation Complete
- ✅ Feature 001: Horse Care MVP (136 tasks)
- ✅ Feature 002: Enhanced Feeding Mechanics (30 tasks)
- ✅ Total: 166 tasks completed

## 📚 Technical Stack

### Core Technologies

- **[Phaser 3.80+](https://phaser.io/)**: WebGL/Canvas game engine with Scene system, Input Manager, Tweens
- **[TypeScript 5+](https://www.typescriptlang.org/)**: Type-safe development with strict mode
- **[Zustand 4.x](https://github.com/pmndrs/zustand)**: Lightweight state management (<1KB)
- **[Vite 5](https://vitejs.dev/)**: Fast development server with HMR and optimized production builds

### Development Tools

- **[Vitest 1](https://vitest.dev/)**: Unit testing with jsdom environment
- **[ESLint](https://eslint.org/)**: Code linting with TypeScript support
- **[Prettier](https://prettier.io/)**: Code formatting
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)**: Progressive Web App support

### Architecture

- **Entity-Component Pattern**: Modular game object structure
- **Separation of Concerns**: Rendering (Phaser) decoupled from state (Zustand) for testability
- **Pure Functions**: Game logic is predictable and unit-testable
- **Responsive Scaling**: FIT scale mode (320px-2560px supported)
- **Canvas Resolution**: 800x600 base with adaptive scaling

## 🎨 Placeholder Assets

**MVP Strategy**: The game uses placeholder graphics for rapid prototyping:

- **Horse Sprite**: Brown circle (#8B4513, 200px diameter) with 🐴 emoji overlay
- **Icons**: Unicode emojis (🥕 carrot, 🪥 brush, ✨ sparkles, ❤️ hearts)
- **Background**: Phaser.Graphics gradient (sky blue #87CEEB → grass green #90EE90)
- **Status Bars**: Phaser.Graphics rectangles with rounded corners, color-coded by value
- **Animations**: Phaser.Tween-based (scale/position changes, no sprite sheets)

**Future Enhancement**: Placeholder assets can be replaced with professional sprites without code changes (see [plan.md Decision 7](specs/001-horse-care-mvp/plan.md) Phase B).

## 🚧 Known Limitations (MVP Scope)

- No music or sound effects
- No advanced animations (sprite sheets)
- Limited to single horse (no multi-pet system)
- No inventory refill mechanism (carrots/brushes are finite)
- No achievement or progression system
- Desktop-first design (mobile is functional but not optimized for touch)

## 📖 Documentation

- [Specification](specs/001-horse-care-mvp/spec.md) - Feature requirements and user stories
- [Implementation Plan](specs/001-horse-care-mvp/plan.md) - Technical decisions and architecture
- [Task Breakdown](specs/001-horse-care-mvp/tasks.md) - Development tasks (136 total)
- [Data Model](specs/001-horse-care-mvp/data-model.md) - Entity definitions and relationships
- [Quick Start Guide](specs/001-horse-care-mvp/quickstart.md) - Developer integration guide
- [Contracts](specs/001-horse-care-mvp/contracts/) - API specifications and schemas

## 🛠️ Development Workflow

This project follows **Spec-Driven Development** using the `/speckit` methodology:

1. **Specification** (`/speckit.specify`) → [spec.md](specs/001-horse-care-mvp/spec.md)
2. **Planning** (`/speckit.plan`) → [plan.md](specs/001-horse-care-mvp/plan.md)
3. **Task Breakdown** (`/speckit.tasks`) → [tasks.md](specs/001-horse-care-mvp/tasks.md)
4. **Implementation** (`/speckit.implement`) ← **MVP Complete**

### Implementation Progress: 166/166 Tasks (100%)

**Feature 001 - Horse Care MVP**:
- ✅ Phase 1: Setup (15 tasks)
- ✅ Phase 2: Foundation (11 tasks)
- ✅ Phase 3: US1 View Horse (14 tasks)
- ✅ Phase 4: US2 Feed (20 tasks)
- ✅ Phase 5: US3 Groom (20 tasks)
- ✅ Phase 6: US4 Pet (12 tasks)
- ✅ Phase 7: US5 Decay (9 tasks)
- ✅ Phase 8: Persistence (13 tasks)
- ✅ Phase 9: Polish (21 tasks)

**Feature 002 - Enhanced Feeding Mechanics**:
- ✅ User Story 1: Timed eating animation (12 tasks)
- ✅ User Story 2: Satiety limit system (5 tasks)
- ✅ User Story 3: Visual feedback (7 tasks)
- ✅ Polish & Validation (6 tasks)

## 🤝 Contributing

Found an issue? Have a feature suggestion?

1. Check existing issues in the repository
2. Open a new issue with clear reproduction steps
3. For contributions, please follow the TypeScript style guide and include tests

## 📝 License

MIT License - see LICENSE file for details

## 🐴 Credits

**Game Design**: Fionella Rossberg  
**Development Methodology**: Spec-Driven Development with `/speckit` workflow  
**Game Engine**: [Phaser](https://phaser.io/) by Photon Storm  
**State Management**: [Zustand](https://github.com/pmndrs/zustand) by Piotr Monowski  
**Build Tool**: [Vite](https://vitejs.dev/) by Evan You  
**Type Safety**: [TypeScript](https://www.typescriptlang.org/) by Microsoft

---

**Enjoy caring for your virtual horse! 🐴✨**
