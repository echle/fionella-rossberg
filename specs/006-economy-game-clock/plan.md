# Implementation Plan: Economy System with Game Clock

**Branch**: `006-economy-game-clock` | **Date**: 2026-02-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-economy-game-clock/spec.md`

## Summary

This feature introduces a self-sustaining economy loop to solve the finite item problem. Players earn currency (Horseshoes 🪙) through care actions, spend it in a shop to buy more items, and receive periodic mystery gift drops every 5 minutes. A game clock tracks play session time, and a Game Over state triggers when all three stats reach zero simultaneously, adding consequence to neglect.

**Core Value**: Transforms the game from a finite experience (limited carrots/brushes) to an infinite gameplay loop where resources are renewable through active play.

## Technical Context

**Language/Version**: TypeScript 5.0+ (strict mode)
**Primary Dependencies**: Phaser 3.80, Zustand 4.5 (state management)
**Storage**: LocalStorage for state persistence (SaveSystem)
**Testing**: Vitest with jsdom, target ≥70% coverage for game logic
**Target Platform**: Browser (Chrome/Firefox/Safari/Edge latest 2 versions), responsive 320px-2560px
**Project Type**: Single-page web game (Phaser scenes)
**Performance Goals**: 60 FPS minimum, <500KB initial bundle gzipped
**Constraints**: LocalStorage 5-10MB limit, no backend/API calls
**Scale/Scope**: Single-player casual game, ~10-20 UI components, 5-10 state actions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Visual Excellence First
- **Compliance**: Currency counter will use smooth tweening animations (CountUp.js pattern)
- **Compliance**: Shop modal includes scale-in/out transitions (Phaser tweens, 300ms)
- **Compliance**: Mystery Gift boxes spawn with bounce animation (elastic easing)
- **Compliance**: Purchase success shows particle effects and haptic-like feedback
- **Action Required**: Design icon for Horseshoe currency (🪙 emoji fallback acceptable)

### ✅ II. Game Engine Foundation
- **Compliance**: Shop UI rendered as Phaser Scene overlay (similar to UIScene pattern)
- **Compliance**: Gift Box sprites managed via Phaser GameObjects (interactive sprites)
- **Compliance**: Game clock updates via Phaser scene events (not raw setInterval)
- **Compliance**: Animations use Phaser tweens/timelines (no CSS animations)

### ✅ III. Browser-First Deployment
- **Compliance**: No new dependencies, all features client-side
- **Compliance**: LocalStorage persistence for currency/clock/gifts
- **Compliance**: Shop UI responsive (grid layout scales on mobile)
- **Compliance**: Touch gestures for gift boxes and shop items

### ✅ IV. Testable Game Logic
- **Compliance**: Currency earning/spending logic separated in actions.ts (pure functions)
- **Compliance**: Shop validation (canAfford, deductCurrency) unit testable
- **Compliance**: Game clock calculations (elapsed time) testable with mocked Date.now()
- **Compliance**: Game Over condition check isolated and testable

### ✅ V. 2D→3D Evolution Path
- **Compliance**: Currency is abstract value (adapts to any currency icon/3D coin model)
- **Compliance**: Shop items defined as configuration (easy to add 3D item previews later)
- **Compliance**: Gift Box uses sprite placeholders (switchable to 3D models)
- **No Violation**: All features support future 3D rendering layer

### 🟢 GATE PASSED
No constitutional violations. All features align with established principles.

## Project Structure

### Documentation (this feature)

```text
specs/006-economy-game-clock/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entities, state schema)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output
│   ├── currency-api.md  # Currency earning/spending interface
│   ├── shop-api.md      # Shop purchase contract
│   └── game-clock-api.md # Clock & gift timing contract
└── tasks.md             # Phase 2 output (NOT created by plan command)
```

### Source Code (repository root)

```text
src/
├── config/
│   ├── gameConstants.ts        # [EXTEND] Add: Currency rewards, shop prices, gift drop rates
│   └── phaserConfig.ts         # [NO CHANGE]
│
├── entities/
│   ├── Horse.ts                # [EXTEND] Add: setSickState() for game over
│   ├── StatusBar.ts            # [NO CHANGE]
│   ├── InventoryItem.ts        # [NO CHANGE]
│   └── GiftBox.ts              # [NEW] Mystery gift sprite with click interaction
│
├── scenes/
│   ├── BootScene.ts            # [EXTEND] Load gift box sprite assets
│   ├── MainGameScene.ts        # [EXTEND] Spawn/manage gift boxes, game over check
│   ├── UIScene.ts              # [EXTEND] Add currency display, shop button, game clock
│   ├── ShopScene.ts            # [NEW] Shop modal overlay scene
│   └── GameOverScene.ts        # [NEW] Game over overlay scene (alternative: modal in UIScene)
│
├── state/
│   ├── types.ts                # [EXTEND] Add: CurrencyState, ShopItem, GiftBoxState, GameClockState
│   ├── gameStore.ts            # [EXTEND] Add: currency, gameClock, giftBoxes, isGameOver
│   └── actions.ts              # [EXTEND] Add: earnCurrency, spendCurrency, purchaseItem, claimGift, checkGameOver
│
├── systems/
│   ├── DecaySystem.ts          # [EXTEND] Trigger game over check after decay tick
│   ├── InputSystem.ts          # [NO CHANGE]
│   ├── SaveSystem.ts           # [EXTEND] Persist currency, clock timestamp, gift states
│   ├── CurrencySystem.ts       # [NEW] Currency earning/validation logic
│   └── GiftSpawnSystem.ts      # [NEW] Time-based gift box spawning logic
│
├── utils/
│   ├── mathUtils.ts            # [NO CHANGE]
│   ├── timeUtils.ts            # [EXTEND] Add: formatGameClock(seconds) → HH:MM:SS
│   └── feedingHelpers.ts       # [NO CHANGE]
│
└── main.ts                     # [NO CHANGE]

tests/
├── unit/
│   ├── actions.test.ts         # [EXTEND] Test currency earning/spending
│   ├── gameStore.test.ts       # [EXTEND] Test currency/clock state updates
│   ├── CurrencySystem.test.ts  # [NEW] Test currency validation, limits
│   ├── GiftSpawnSystem.test.ts # [NEW] Test gift timing, max limit logic
│   └── timeUtils.test.ts       # [EXTEND] Test game clock formatting
│
└── integration/
    ├── careCycle.test.ts       # [EXTEND] Test earn currency → buy item → use item flow
    └── shopFlow.test.ts        # [NEW] Test shop open → purchase → inventory update

assets/ (potential new assets)
├── sprites/
│   └── gift-box/               # [NEW] Gift box sprite frames (if not using emoji 🎁)
└── ui/
    └── shop-icons/             # [NEW] Shop item icons (if not using emoji)
```

**Structure Decision**: This is a single-project web game using Phaser. We extend existing scenes (UIScene, MainGameScene) and add two new scenes (ShopScene, GameOverScene). The state management pattern (Zustand + actions) remains consistent. No framework changes needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. No complexity justification required.

---

## Phase 0: Research & Decision Points

*To be completed during `/speckit.plan` execution. See [research.md](research.md) for details.*

### Research Questions to Answer:

1. **Currency Counter Animation**: Which approach for smooth counter animation? (Phaser tween vs CountUp.js pattern vs manual interpolation)

2. **Shop Scene Architecture**: Separate Scene vs Modal in UIScene vs Scene overlay? (Trade-offs: isolation, state sharing, z-index control)

3. **Gift Box Positioning**: Random positioning algorithm that respects viewport bounds and avoids overlap with critical UI?

4. **Game Clock Persistence**: Store timestamp vs elapsed seconds? (Timestamp = accurate across refreshes, Elapsed = simpler but drift-prone)

5. **Game Over Implementation**: Separate Scene vs Overlay in MainGameScene? (Considerations: scene management complexity, animation control)

6. **LocalStorage Schema Extension**: Flat structure vs nested? (Current: flat keys like `gameState`, `timestamp`. New: separate keys for currency, clock, gifts?)

7. **Reward Probability Implementation**: Weighted random selection method? (Array-based vs threshold-based)

8. **Shop Item Configuration**: Hardcoded in component vs config file? (Maintainability vs simplicity)

---

## Phase 1: Design Artifacts

*To be completed during `/speckit.plan` execution.*

### Artifacts to Generate:

1. **[data-model.md](data-model.md)**: 
   - CurrencyState entity (balance, max cap)
   - ShopItem entity (id, name, price, reward)
   - GameClockState entity (startTimestamp, elapsedSeconds)
   - GiftBoxState entity (spawnTime, position, claimed)
   - GameState extensions (isGameOver flag)
   - State transition diagrams for: Economy Loop, Gift Lifecycle, Game Over Flow

2. **[contracts/](contracts/)**: 
   - `currency-api.md`: earnCurrency(), spendCurrency(), canAfford() signatures
   - `shop-api.md`: purchaseItem(), getShopItems(), validatePurchase() signatures
   - `game-clock-api.md`: getElapsedTime(), formatTime(), resetClock() signatures
   - `gift-api.md`: spawnGift(), claimGift(), getUnclaimedGifts() signatures

3. **[quickstart.md](quickstart.md)**: 
   - How to add a new shop item (config location, price setting)
   - How to adjust currency rewards (gameConstants.ts)
   - How to change gift drop interval (gameConstants.ts)
   - How to test economy loop locally (debug commands)

---

## Phase 2: Task Breakdown

*NOT generated by `/speckit.plan` command. Use `/speckit.tasks` after Phase 1 completion.*

Tasks will be created in priority order matching User Stories (P1→P6):
- Phase 2.1: Currency System (P1)
- Phase 2.2: Shop System (P2)
- Phase 2.3: Game Clock (P3)
- Phase 2.4: Time-Based Gifts (P4)
- Phase 2.5: Game Over State (P5)
- Phase 2.6: Visual Polish (P6)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Shop UI performance on mobile | Low | Medium | Grid layout with virtualization if >20 items |
| LocalStorage quota exceeded | Low | High | Monitor size, compress JSON, warn user at 80% capacity |
| Gift box spawn overlaps critical UI | Medium | Low | Constrained spawn zones, z-index layering |
| Game clock drift on long sessions | Medium | Low | Use Date.now() deltas, not cumulative timers |
| Currency overflow (>999,999) | Low | Low | Cap enforced, test with accelerated earning |
| Game Over false positives | Medium | High | Strict condition check (all 3 stats = 0), extensive testing |

---

## Integration Points

### Existing Systems to Modify:

1. **actions.ts (state/actions.ts)**:
   - Add `earnCurrency(amount)` after feed/groom/pet actions
   - Add `purchaseItem(itemId)` for shop transactions
   - Add `checkGameOver()` called by DecaySystem

2. **SaveSystem (systems/SaveSystem.ts)**:
   - Extend saved state schema to include: `currency`, `gameClockStart`, `giftBoxes`
   - Add migration for existing saves (set currency = 50, clockStart = now)

3. **DecaySystem (systems/DecaySystem.ts)**:
   - After decay tick, call `checkGameOver()` action
   - If game over, stop decay timers

4. **UIScene (scenes/UIScene.ts)**:
   - Add currency display (top-right: 🪙 123)
   - Add shop button (top bar: 🛒 Shop)
   - Add game clock display (bottom-right: ⏱️ 01:23:45)

5. **MainGameScene (scenes/MainGameScene.ts)**:
   - Add gift box spawn logic (every 5 min game time)
   - Add gift box click handlers
   - Disable interactions when `isGameOver = true`

6. **i18n Service (services/i18nService.ts)**:
   - Add translations for: Shop item names, Game Over message, Currency labels

### New Systems Created:

1. **CurrencySystem**: Validation, earning, spending logic
2. **GiftSpawnSystem**: Time-based gift generation, max limit enforcement
3. **ShopScene**: Phaser scene for shop UI
4. **GameOverScene** (or modal): Overlay with reset option

---

## Testing Strategy

### Unit Tests (≥70% coverage target):
- Currency earning calculation (actions.test.ts)
- Shop purchase validation (canAfford, inventory update) (CurrencySystem.test.ts)
- Game clock time formatting (timeUtils.test.ts)
- Gift spawn timing logic (GiftSpawnSystem.test.ts)
- Game Over condition check (actions.test.ts)

### Integration Tests:
- Full economy loop: Earn 10 🪙 → Open shop → Buy carrot → Feed horse → Earn 5 🪙 (careCycle.test.ts)
- Gift spawn and claim: Wait 5 min → Gift appears → Click gift → Receive reward (shopFlow.test.ts)
- Game Over flow: Drain all stats → Game Over triggers → Reset → Game resumes (careCycle.test.ts)

### Manual Tests:
- Shop modal responsiveness on 320px mobile viewport
- Currency counter animation smoothness (60 FPS check)
- Long session test (1 hour): Clock accuracy, multiple gift spawns
- LocalStorage persistence: Close/reopen browser → Currency/clock restored

---

## Deployment Considerations

### Bundle Size Impact:
- Estimated +15-20 KB (GiftBox sprite, ShopScene code, new UI elements)
- No external dependencies added
- Total bundle remains <500 KB target

### Browser Compatibility:
- LocalStorage widely supported (IE11+, all modern browsers)
- Date.now() standard (no polyfill needed)
- Phaser 3.80 supports target browsers

### Performance Monitoring:
- Game clock updates: Max 1/second (negligible CPU)
- Shop scene: Idle until opened (no constant rendering)
- Gift boxes: Max 3 sprites simultaneous (low memory)

### Rollback Plan:
- Feature flags: `ENABLE_CURRENCY`, `ENABLE_SHOP`, `ENABLE_GIFTS` in gameConstants.ts
- Save file migration: If issues detected, read old schema without currency fields
- Gradual rollout: P1 (currency) → P2 (shop) → P3-6 can be disabled independently

---

## Success Metrics

*Reference: spec.md Success Criteria (SC-001 to SC-010)*

### Technical Metrics:
- [ ] Unit test coverage ≥70% for new code
- [ ] Shop modal opens in <100ms (Lighthouse measurement)
- [ ] Game clock drift <5 seconds after 1 hour session
- [ ] 60 FPS maintained with 3 gift boxes + shop open

### Functional Metrics:
- [ ] All 40 Functional Requirements (FR-001 to FR-040) pass acceptance tests
- [ ] 7 Non-Functional Requirements (NFR-001 to NFR-007) validated
- [ ] Zero currency overflow bugs (tested with 10,000 purchases)
- [ ] Game Over triggers only when all 3 stats = 0 (tested 100 scenarios)

### User Experience Metrics:
- [ ] 90% of playtesters understand currency earning without tutorial
- [ ] Shop item purchase flow completes in <3 clicks
- [ ] Gift box spawn visual noticed within 5 seconds of appearance
- [ ] Game Over message clarity rated ≥4/5 in usability testing

---

## Notes

- This feature transforms the game from finite to infinite gameplay loop
- Phase 1 (Currency + Shop) delivers core value; phases 3-6 are enhancements
- Game Over state adds stakes but can be disabled for testing (feature flag)
- Future features can integrate with currency (achievements, cosmetics, upgrades)

**Next Steps**: Execute Phase 0 research to resolve any NEEDS CLARIFICATION items, then proceed to Phase 1 design artifacts.