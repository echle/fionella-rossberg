<!--
Sync Impact Report: Constitution v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version Change: Initial creation → 1.0.0
Created: 2026-02-09

Core Principles Defined:
  ✓ I. Visual Excellence First
  ✓ II. Game Engine Foundation  
  ✓ III. Browser-First Deployment
  ✓ IV. Testable Game Logic
  ✓ V. 2D→3D Evolution Path

Technical Standards:
  ✓ Phaser or PixiJS as primary game engine
  ✓ TypeScript for type safety
  ✓ Vite for build tooling
  ✓ Vitest for game logic testing

Template Consistency:
  ✅ spec-template.md - No updates needed (game-agnostic)
  ✅ plan-template.md - No updates needed (supports game structure)
  ✅ tasks-template.md - No updates needed (phase structure compatible)

Follow-up TODOs: None
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->

# Fionella's Horse Care Game Constitution

## Core Principles

### I. Visual Excellence First
**All features MUST prioritize visual appeal, smooth animations, and delightful player experience.**
- Every game mechanic includes polished visual feedback (animations, particle effects, transitions)
- Frame rate: Target 60 FPS minimum, graceful degradation on lower-end devices
- Animation-first development: Prototype visual interactions before implementing full game logic
- Asset quality: Use high-quality sprites/textures, compressed appropriately for web delivery
- Consistent art style across all game elements and UI

**Rationale**: Visual design and animation are the primary differentiators for player engagement in casual games.

### II. Game Engine Foundation
**All game features MUST be built on Phaser or PixiJS game engine foundation.**
- Use engine's built-in systems: Scene management, sprite handling, physics, input
- No reinventing the wheel - leverage proven engine APIs and patterns
- Engine-agnostic game state management (separate from rendering)
- Plugin ecosystem: Prefer official or well-maintained community plugins
- Keep engine version up-to-date with LTS releases

**Rationale**: Game engines provide battle-tested solutions for common game development challenges, reducing bugs and development time.

### III. Browser-First Deployment
**The game MUST run natively in modern browsers without downloads or plugins.**
- Zero installation required - playable via URL
- Progressive Web App (PWA) enabled for offline play and "add to home screen"
- Responsive design: Support desktop (mouse/keyboard) and mobile (touch) inputs
- Cross-browser compatibility: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Performance budget: Initial load < 5 seconds on 3G connection

**Rationale**: Removing friction (downloads, installations) maximizes player reach and accessibility.

### IV. Testable Game Logic
**Core game logic MUST be unit-testable and separated from rendering.**
- Game state, rules, and calculations are pure functions where possible
- Business logic separated from game engine rendering code
- Unit tests for: Stat calculations, progression system, save/load, game rules
- Integration tests for: Multi-step interactions, state transitions
- Visual regression tests optional but encouraged for critical UI flows

**Rationale**: Testable logic prevents regressions, enables confident refactoring, and documents game behavior.

### V. 2D→3D Evolution Path
**Architecture MUST support future migration from 2D sprites to 3D models.**
- Rendering abstraction layer: Game logic doesn't directly manipulate sprites/meshes
- Asset pipeline supports both formats: PNG/spritesheet for 2D, GLTF/GLB for 3D
- Camera system designed for potential 3D perspective transitions
- Entity component system (ECS) or similar pattern for flexible entity representation
- Phase 1: Full 2D implementation with Phaser/PixiJS; Phase 2: Three.js/Babylon.js integration planned

**Rationale**: Avoiding architectural debt ensures smooth evolution without complete rewrites as project matures.

## Technical Standards

### Mandatory Technology Stack
- **Game Engine**: Phaser 3.x (preferred) or PixiJS 7.x with custom game loop
- **Language**: TypeScript 5.x+ (strict mode enabled)
- **Build Tool**: Vite 5.x for fast dev server and optimized production builds
- **Package Manager**: pnpm (preferred) or npm
- **Version Control**: Git with conventional commits

### Code Quality Requirements
- **Linting**: ESLint with TypeScript rules, no warnings allowed in CI
- **Formatting**: Prettier with consistent configuration
- **Type Safety**: No `any` types without explicit justification comment
- **Testing**: Vitest for unit/integration tests, minimum 70% coverage for game logic
- **Code Review**: All features require review before merge

### Asset Pipeline
- **2D Assets**: Organized in `/assets/sprites`, `/assets/ui`, `/assets/backgrounds`
- **Audio**: `/assets/audio` - MP3 (broad compatibility) + OGG (quality backup)
- **Compression**: Use texture atlases (TexturePacker/Shoebox), WebP for UI images
- **Loading**: Lazy-load assets by game scene/level to minimize initial bundle

### Performance Standards
- **FPS**: 60 FPS target on mid-range devices (2018+ smartphones)
- **Bundle Size**: Initial JS bundle < 500KB gzipped
- **Load Time**: < 5s to interactive on 3G, < 2s on broadband
- **Memory**: < 200MB heap usage for extended play sessions

## Development Workflow

### Feature Development Process
1. **Design Phase**: Create visual mockup/animation prototype (Figma/Aseprite)
2. **Specify Phase**: Define game mechanic, player interactions, progression rules
3. **Plan Phase**: Technical design - which engine systems to use, data models
4. **Implement Phase**: Build feature with visual polish from day one
5. **Playtest Phase**: Test for fun factor, not just functionality
6. **Polish Phase**: Juice it up - screen shake, particles, audio feedback

### Quality Gates
- ✅ **Visual Review**: Does it look good? Animations smooth?
- ✅ **Fun Review**: Is the mechanic engaging? Intuitive?
- ✅ **Technical Review**: Code quality, test coverage, performance profiling
- ✅ **Cross-browser Test**: Works on Chrome, Firefox, Safari, and one mobile browser

### Save System Requirements
- **Auto-save**: Game state saved to localStorage/IndexedDB after every significant action
- **Manual save slots**: Multiple save file support for different players/profiles
- **Cloud save**: Optional future feature, local-first always functional

## Governance

**This constitution guides all technical and design decisions for Fionella's Horse Care Game.**

### Amendment Process
- Constitution updates require explicit version bump (semantic versioning)
- **MAJOR**: Principle removal or incompatible change (requires team consensus)
- **MINOR**: New principle added or existing principle significantly expanded
- **PATCH**: Clarifications, typo fixes, non-semantic updates

### Compliance Review
- All feature specifications must reference relevant principles
- Implementation plans must demonstrate constitutional alignment
- Violations require explicit justification documented in plan/spec

### Conflict Resolution
- When principles conflict: **Visual Excellence** and **Player Experience** take precedence
- Performance cannot be sacrificed for non-essential features
- Technical debt acceptable only when documented with remediation plan

### Living Document
- Constitution evolves with project needs
- Retrospective reviews: Quarterly check if principles still serve project goals
- Community feedback: Player experience insights may inform amendments

**Version**: 1.0.0 | **Ratified**: 2026-02-09 | **Last Amended**: 2026-02-09
