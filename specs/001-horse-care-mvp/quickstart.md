# Quick Start Guide: Horse Care Game MVP

**Purpose**: Get developers up and running quickly with development environment, testing scenarios, and common workflows.

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ or **pnpm**: v8+ (pnpm preferred)
- **Git**: v2.30+
- **Modern Browser**: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Code Editor**: VS Code recommended (with extensions: ESLint, Prettier, TypeScript)

## Project Setup

### 1. Initialize Project

```bash
# Create Vite project with TypeScript template
npm create vite@latest . -- --template vanilla-ts

# Or with pnpm (faster)
pnpm create vite . -- --template vanilla-ts
```

### 2. Install Dependencies

```bash
# Core dependencies
pnpm add phaser zustand

# Dev dependencies
pnpm add -D vitest @vitest/ui vite-plugin-pwa typescript eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Optional: TypeScript types for better DX
pnpm add -D @types/node
```

### 3. Project Structure

```bash
# Create folder structure
mkdir -p src/{config,scenes,entities,state,systems,utils}
mkdir -p assets/{sprites/{horse,effects},ui,backgrounds}
mkdir -p tests/{unit,integration}
mkdir -p public

# Create initial files
touch src/main.ts
touch src/config/phaserConfig.ts
touch src/config/gameConstants.ts
touch src/scenes/BootScene.ts
touch src/scenes/MainGameScene.ts
touch src/scenes/UIScene.ts
touch src/state/gameStore.ts
touch src/state/types.ts
touch src/state/actions.ts
```

### 4. Configuration Files

#### `tsconfig.json` (TypeScript strict mode)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
   "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### `vite.config.ts` (Build + PWA)
```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fionella Horse Care Game',
        short_name: 'Horse Care',
        description: 'Take care of Fionella\'s horse!',
        theme_color: '#8B4513',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true
  }
});
```

#### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/main.ts', 'src/scenes/**']
    }
  }
});
```

#### `.eslintrc.js`
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
```

### 5. Scripts in `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## Development Workflow

### Start Development Server

```bash
pnpm dev
```

Access at: `http://localhost:5173`

Features:
- ⚡ Hot Module Replacement (HMR)
- 🔄 Auto-refresh on file changes
- 📦 Fast build with Vite

### Run Tests

```bash
# Watch mode (recommended during development)
pnpm test

# Run once with coverage
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

### Lint & Format

```bash
# Check for linting errors
pnpm lint

# Auto-fix formatting
pnpm format
```

### Build for Production

```bash
pnpm build

# Preview production build locally
pnpm preview
```

Output in `dist/` folder, ready for deployment.

---

## Testing Scenarios

### Unit Test Example: Feed Action

**File**: `tests/unit/actions.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { feed } from '@/state/actions';
import type { GameState } from '@/state/types';

describe('feed action', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = {
      version: '1.0.0',
      timestamp: Date.now(),
      horse: { hunger: 50, cleanliness: 70, happiness: 80 },
      inventory: { carrots: 5, brushUses: 100 },
      ui: { selectedTool: null, activeAnimation: null, lastInteractionTime: 0 }
    };
  });

  it('increases hunger by 20 and consumes carrot', () => {
    const newState = feed(initialState);
    
    expect(newState.horse.hunger).toBe(70); // 50 + 20
    expect(newState.inventory.carrots).toBe(4); // 5 - 1
  });

  it('clamps hunger at 100', () => {
    initialState.horse.hunger = 95;
    const newState = feed(initialState);
    
    expect(newState.horse.hunger).toBe(100); // Clamped
  });

  it('does not consume carrot if inventory is empty', () => {
    initialState.inventory.carrots = 0;
    const newState = feed(initialState);
    
    expect(newState.horse.hunger).toBe(50); // Unchanged
    expect(newState.inventory.carrots).toBe(0); // Still 0
  });
});
```

Run: `pnpm test actions.test.ts`

### Integration Test Example: Care Cycle

**File**: `tests/integration/careCycle.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { useGameStore } from '@/state/gameStore';

describe('Complete care cycle', () => {
  it('should handle feed → groom → pet → save → load', () => {
    const store = useGameStore.getState();
    
    // Reset to known state
    store.resetGame();
    
    // Act: Perform care actions
    store.feed();
    store.groom();
    store.pet();
    
    // Assert: Status increased
    expect(store.horse.hunger).toBeGreaterThan(80); // Started at 80, +20
    expect(store.horse.cleanliness).toBeGreaterThan(70); // Started at 70, +5
    expect(store.horse.happiness).toBeGreaterThan(90); // Started at 90, +10
    
    // Act: Save state
    const savedState = {
      version: store.version,
      timestamp: store.timestamp,
      horse: store.horse,
      inventory: store.inventory
    };
    localStorage.setItem('fionella-horse-game-save', JSON.stringify(savedState));
    
    // Act: Reset and reload
    store.resetGame();
    const loaded = JSON.parse(localStorage.getItem('fionella-horse-game-save')!);
    store.loadGameState(loaded);
    
    // Assert: State restored
    expect(store.horse.hunger).toBe(savedState.horse.hunger);
    expect(store.inventory.carrots).toBe(savedState.inventory.carrots);
  });
});
```

Run: `pnpm test careCycle.test.ts`

---

## Manual Testing Checklist

### P1: View Horse and Status Display

- [ ] Horse sprite visible in center of screen
- [ ] Three status bars visible (Hunger, Sauberkeit, Glück)
- [ ] Status bars show current percentage values
- [ ] Layout responsive on mobile (320px) and desktop (1920px)

### P2: Feed Horse

- [ ] Click carrot in inventory → carrot icon highlighted
- [ ] Click horse → eating animation plays
- [ ] Hunger bar increases by ~20%
- [ ] Carrot count decreases by 1
- [ ] When carrots = 0, carrot icon grayed out
- [ ] Cannot feed when at 0 carrots

### P3: Groom Horse

- [ ] Click brush in inventory → brush icon highlighted
- [ ] Drag across horse → sparkle particles appear
- [ ] Cleanliness bar increases by ~5% per stroke
- [ ] Brush uses decrease by 1 per stroke
- [ ] When brush uses = 0, brush icon grayed out
- [ ] Cannot groom when at 0 uses

### P4: Pet Horse

- [ ] With no tool selected, click horse → happy animation plays
- [ ] Hearts appear around horse
- [ ] Happiness bar increases by ~10%
- [ ] No inventory consumption
- [ ] Can pet repeatedly

### P5: Automatic Decay

- [ ] Wait 60 seconds → all status bars decrease
- [ ] Hunger decreases fastest
- [ ] Cleanliness decreases slowest
- [ ] Values stop at 0 (no negatives)

### Save/Load

- [ ] Perform actions → close tab → reopen → status restored
- [ ] Inventory counts restored
- [ ] Elapsed time applied to status values

### Cross-Browser

- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop)
- [ ] Safari (iOS)
- [ ] Edge (desktop)

---

## Common Tasks

### Add New Animation

1. Add sprite frames to `/assets/sprites/horse/`
2. Update texture atlas JSON
3. Define animation in `BootScene.ts`:
   ```typescript
   this.anims.create({
     key: 'new-animation',
     frames: this.anims.generateFrameNames('horse-atlas', {
       prefix: 'frame-',
       start: 1,
       end: 10
     }),
     frameRate: 12,
     repeat: 0
   });
   ```
4. Trigger from action:
   ```typescript
   Events.emit('horse:newAnimation', { /* data */ });
   ```

### Add New Status Bar

1. Extend `HorseStatus` interface in `types.ts`
2. Update initial state in `gameStore.ts`
3. Create `StatusBar` instance in `UIScene.ts`
4. Wire up value binding in scene update loop

###Add New Inventory Item

1. Add icon to `/assets/ui/`
2. Extend `Inventory` interface in `types.ts`
3. Create action in `actions.ts` (e.g., `feedApple()`)
4. Add `InventorySlot` component in `UIScene.ts`
5. Wire up click handler to call action

### Debug Save System

```typescript
// In browser console
localStorage.getItem('fionella-horse-game-save'); // View saved state
localStorage.removeItem('fionella-horse-game-save'); // Clear save
```

---

## Debugging Tips

### Phaser Debug Mode

Enable in `phaserConfig.ts`:
```typescript
physics: {
  default: 'arcade',
  arcade: {
    debug: true // Shows hit boxes, FPS
  }
}
```

### Zustand DevTools

```typescript
// Install devtools
pnpm add -D @redux-devtools/extension

// In gameStore.ts
import { devtools } from 'zustand/middleware';

export const useGameStore = create(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'HorseCareGame' }
  )
);
```

Access via browser Redux DevTools extension.

### Performance Profiling

```typescript
// In MainGameScene.ts
update() {
  console.log('FPS:', this.game.loop.actualFps);
}
```

Or use Chrome DevTools → Performance tab.

---

## Deployment

### GitHub Pages

```bash
# Build
pnpm build

# Deploy (using gh-pages package)
pnpm add -D gh-pages
npx gh-pages -d dist
```

### Netlify

```bash
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"
```

Drag `dist/` folder to Netlify UI, or connect GitHub repo for auto-deploys.

### itch.io

1. Build: `pnpm build`
2. Zip `dist/` folder
3. Upload to itch.io → "HTML" project type
4. Set "This file will be played in the browser"

---

## Troubleshooting

### "Cannot find module 'phaser'"

**Fix**: `pnpm install` to ensure dependencies are installed.

### TypeScript errors on Phaser types

**Fix**: Add `"skipLibCheck": true` to `tsconfig.json`.

### LocalStorage quota exceeded

**Fix**: Clear old saves or implement save compression.
```typescript
// Example compression (optional)
import pako from 'pako';
const compressed = pako.deflate(JSON.stringify(state));
localStorage.setItem(key, btoa(compressed));
```

### Animation not playing

**Check**:
1. Animation key matches `anims.create()` key
2. Sprite has correct texture atlas loaded
3. Animation triggered via `sprite.play('key')`

### Touch input not working on mobile

**Fix**: Ensure Phaser Input plugin is enabled:
```typescript
// phaserConfig.ts
input: {
  touch: true
}
```

---

## Next Steps

1. **Run `/speckit.tasks`** to generate task breakdown
2. **Start with Phase 1**: Setup + MainGameScene + Horse sprite rendering
3. **Iterate**: Build → Test → Commit → Repeat
4. **Deploy**: Share playable link for feedback

Happy coding! 🐴✨
