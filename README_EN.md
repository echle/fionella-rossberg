# 🐴 Fionella's Horse Care Game MVP

A browser-based horse care simulation game where you feed, groom, and pet your virtual horse to keep it happy and healthy.

![Horse Care Game](https://img.shields.io/badge/Status-MVP_Complete-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Phaser](https://img.shields.io/badge/Phaser-3.80-orange)

## ✨ Features

- **🐴 Virtual Horse Companion**: Interact with your horse in a vibrant stable environment with professional sprite animations
- **🌍 Bilingual Support**: Play in German (default) or English - switch languages anytime
- **🎬 Sprite-Based Animations**: Frame-based animations for idle, eating, grooming, and happy states
- **🥕 Enhanced Feeding System**: Timed eating animation (2.5s) with satiety limits and visual feedback
- **🪥 Grooming Mechanic**: Drag across horse to boost cleanliness
- **❤️ Petting Interaction**: Click horse to increase happiness
- **⏱️ Time-Based Decay**: Status values decrease over time
- **💾 Auto-Save System**: Game state persists across sessions
- **📱 Responsive Design**: Desktop and mobile support (320px-2560px)

## 🎮 Current Status

**🎉 MVP + Features 002-005 Complete!**

### ✅ Completed Features
- Feature 001: Horse Care MVP (136/136 tasks)
- Feature 002: Enhanced Feeding Mechanics (30/30 tasks)
- Feature 003: Visual Asset Integration (52/67 MVP tasks)
- Feature 005: Internationalization (51/51 tasks)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd horse-care-game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`.

### Available Scripts

- `npm run dev` - Start Vite dev server with hot-reload
- `npm run build` - Build for production (output: dist/)
- `npm run preview` - Preview production build
- `npm test` - Run Vitest unit tests
- `npm run test:coverage` - Generate coverage report (≥70%)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎮 How to Play

### Language Selection
- Click 🇩🇪 for German
- Click 🇬🇧 for English
- Your choice persists across sessions

### Basic Controls

1. **Select Tool**: Click 🥕 Carrot or 🪥 Brush icon
2. **Interact**:
   - **Feed**: Select carrot → click horse (hunger +20)
   - **Groom**: Select brush → drag across horse (cleanliness +5)
   - **Pet**: No tool → click horse (happiness +10)
3. **Monitor Status**: Watch color-coded bars (green/yellow/red)

### Game Mechanics

- **Feeding System**:
  - 2.5s eating animation with progress bar
  - Satiety limit: 3 carrots, then 30s cooldown
  - Smart decay: 10s per carrot
  - Visual indicators: fullness badge 🍽️, countdown timer

- **Status Decay** (automatic):
  - Hunger: -1 per 1s
  - Cleanliness: -0.5 per 1s
  - Happiness: -0.8 per 1s

- **Persistence**:
  - Auto-save every 10s
  - Save on interactions
  - Save before tab close
  - Elapsed time decay on reload

## 📁 Project Structure

```
src/
├── main.ts                    # Entry point
├── config/                    # Game constants & Phaser config
├── scenes/                    # BootScene, MainGameScene, UIScene
├── entities/                  # Horse, StatusBar, InventoryItem
├── components/                # LanguageSelector
├── state/                     # types, gameStore, actions
├── systems/                   # InputSystem, DecaySystem, SaveSystem
├── services/                  # i18nService (singleton)
├── locales/                   # de.json, en.json
└── utils/                     # mathUtils, timeUtils, feedingHelpers

tests/
├── unit/                      # Unit tests (70%+ coverage)
└── integration/               # Integration tests
```

## 🏗️ Technology Stack

- **Game Engine**: Phaser 3.80.1
- **Language**: TypeScript 5.x (strict mode)
- **State Management**: Zustand 4.5.x
- **Build Tool**: Vite 5.x
- **Testing**: Vitest 1.x + jsdom
- **i18n**: Custom lightweight service (no external dependencies)
- **Languages**: German (default), English (fallback)

## 🧪 Testing

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

**Test Coverage**: 72 passing tests, ≥70% coverage  
**Test Suites**: Unit tests (gameStore, actions, DecaySystem, SaveSystem, i18nService), Integration tests (careCycle, languageSwitch)

## 🎨 Visual Assets

### Horse Sprites
- Format: Horizontal sprite sheets (8 frames @ 512×384px)
- Animations: idle, eat, pet, groom, walk
- Fallback: Emoji placeholder 🐴
- Anchor: Bottom-center (0.5, 1.0)

### Language Selector
- Flag buttons 🇩🇪🇬🇧
- Hover effects
- Active state highlighting
- Top-right position (gameWidth - 80, 30)

See `assets/ASSET_GUIDE.md` for details.

## 🚦 Roadmap

### ✅ Completed
- Feature 001: Horse Care MVP
- Feature 002: Enhanced Feeding Mechanics
- Feature 003: Visual Asset Integration (MVP scope)
- Feature 005: Internationalization

### 🔜 Next
- Feature 004: Reset Button (in progress, parallel branch)
- Feature 003 Phase 7: Animation system unit tests
- Feature 006: Enhanced Feedback & Polish (planned)

### 💡 Future Ideas
- Multiple horses (stable management)
- More tools & activities
- Day/night cycle
- Achievement system
- Enhanced mobile touch support

## 📝 License

This project is private and for educational purposes.

## 🙏 Acknowledgments

- **Phaser 3** for the excellent game engine
- **Zustand** for simple state management
- **Vite** for blazing-fast builds
- **Vitest** for elegant testing

---

**Built with ❤️ for German-speaking children who love horses 🐴**
