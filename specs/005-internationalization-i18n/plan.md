# Implementation Plan: Internationalization (i18n)

**Branch**: `005-internationalization-i18n` | **Date**: 2026-02-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-internationalization-i18n/spec.md`

## Summary

Implement bilingual support (German/English) for a children's horse care game. German is the primary language for the target audience (children 6-12 years), with English as a fallback. The feature includes: (1) a lightweight i18n service for translation management, (2) JSON-based translation files for both languages, (3) in-game language selector UI component, and (4) localStorage-based language persistence. All hardcoded UI strings will be replaced with translation keys, and the README will be translated to German.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: Phaser 3.80, Zustand 4.5 (existing state management)  
**Storage**: LocalStorage for language preference persistence  
**Testing**: Vitest 1.x with jsdom for UI component testing  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), PWA-enabled  
**Project Type**: Single web application (Phaser-based browser game)  
**Performance Goals**: 60 FPS maintained, < 1ms translation lookup, < 50ms language switch  
**Constraints**: Must not increase bundle size > 10KB (compressed), no external i18n libraries to minimize dependencies  
**Scale/Scope**: 2 languages (DE/EN), ~50-80 translation keys covering all UI elements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Core Principles

**I. Visual Excellence First** ✅  
- Language selector will have smooth transitions when switching languages
- Flag icons/emojis provide visual clarity (🇩🇪/🇬🇧)
- No jarring text changes - UI updates gracefully after language switch
- Maintains 60 FPS target during language changes

**II. Game Engine Foundation** ✅  
- Language selector integrated as Phaser GameObject in UIScene
- Uses Phaser's text rendering and input systems
- i18n service is engine-agnostic (separate from rendering logic)
- No conflicts with Phaser's scene management

**III. Browser-First Deployment** ✅  
- Uses browser's native localStorage API
- No additional downloads or plugins required
- Works offline once translations are loaded (part of bundle)
- Responsive: Language selector accessible on both desktop and mobile

**IV. Testable Game Logic** ✅  
- i18n service is pure TypeScript class (no Phaser dependencies in core logic)
- Unit tests for translation lookup, placeholder replacement, language switching
- LocalStorage mocking for persistence tests
- LanguageSelector UI component testable in isolation

**V. 2D→3D Evolution Path** ✅  
- Translation system is rendering-agnostic
- Works with both 2D text and future 3D UI elements
- JSON-based translations can be extended without code changes
- No hardcoded dependencies on 2D-specific APIs

### Technical Standards Compliance

- ✅ **TypeScript 5.x strict mode**: All new code will be strictly typed
- ✅ **Vite build tool**: Translation files loaded via JSON imports
- ✅ **Vitest testing**: Unit tests for i18nService and LanguageSelector
- ✅ **ESLint + Prettier**: Code quality maintained
- ✅ **No `any` types**: Proper interfaces for Translation and LocaleState
- ✅ **Bundle size**: Estimated +5KB (translations + service), well under limit
- ✅ **Performance**: Translation lookups are O(1) hash table access

### Potential Concerns

**None identified.** This feature aligns perfectly with all constitutional principles and technical standards. It's a pure enhancement that improves accessibility without compromising performance or architecture.

## Project Structure

### Documentation (this feature)

```text
specs/005-internationalization-i18n/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Not needed (straightforward implementation)
├── data-model.md        # Existing - Translation interfaces and schemas
├── quickstart.md        # Existing - Developer guide for using i18n
├── contracts/           # Existing - API specifications
│   ├── i18n-service-api.md
│   ├── language-selector-ui.md
│   └── translation-files.md
└── tasks.md             # To be created by /speckit.tasks command
```

### Source Code (repository root)

```text
src/
├── services/
│   └── i18nService.ts       # NEW: Core translation service (singleton)
├── locales/                 # NEW: Translation files
│   ├── de.json              # NEW: German translations
│   └── en.json              # NEW: English translations
├── components/              # NEW: Reusable UI components
│   └── LanguageSelector.ts  # NEW: Language switcher UI
├── scenes/
│   ├── UIScene.ts           # MODIFIED: Add LanguageSelector, update text rendering
│   ├── MainGameScene.ts     # MODIFIED: Replace hardcoded strings
│   └── BootScene.ts         # MODIFIED: Replace hardcoded strings
├── entities/
│   ├── Horse.ts             # MODIFIED: Use i18n for status text
│   ├── StatusBar.ts         # MODIFIED: Use i18n for labels
│   └── InventoryItem.ts     # MODIFIED: Use i18n for item names
├── state/
│   ├── gameStore.ts         # MODIFIED: Add locale state (language preference)
│   └── types.ts             # MODIFIED: Add LocaleState interface
└── main.ts                  # MODIFIED: Initialize i18nService

tests/
├── unit/
│   ├── i18nService.test.ts  # NEW: Service unit tests
│   └── LanguageSelector.test.ts  # NEW: UI component tests
└── integration/
    └── languageSwitch.test.ts  # NEW: End-to-end language switching test

README.md                    # MODIFIED: Translate to German
README_EN.md                 # NEW: Optional English version
```

**Structure Decision**: Single-project structure (Option 1). This is a web browser game with all code in the `src/` directory. The i18n feature adds:
- New `services/` directory for the translation service
- New `locales/` directory for JSON translation files
- New `components/` directory for reusable UI components (starting with LanguageSelector)
- Modifications to existing scenes, entities, and state to use translations

## Complexity Tracking

> **No violations - table not needed.**

This feature introduces no architectural complexity that violates constitutional principles. The i18n service is a straightforward singleton with O(1) lookups, and the language selector is a standard Phaser UI component.

---

## Phase 0: Research & Design Decisions

### Research Summary

**Decision**: Custom lightweight i18n service (no external library)  
**Rationale**: 
- Bundle size: External libraries like `i18next` add 20-50KB+ (even lite versions)
- Simplicity: This project needs only 2 languages and simple key-value lookups
- Control: Full control over API design and performance characteristics
- Dependencies: Aligns with constitution's preference for minimal dependencies

**Alternatives Considered**:
- `i18next`: Too heavy (40KB+ minified), overkill for 2 languages
- `i18next-lite`: Still 15KB+, more features than needed
- `@lingui/core`: Modern but adds build complexity

**Implementation Approach**:
1. **i18nService**: Singleton class with event emitter for language changes
2. **Translation Storage**: Simple nested objects (e.g., `{ ui: { buttons: { feed: "Füttern" } } }`)
3. **Placeholder Support**: Regex-based replacement for `{variable}` syntax
4. **Fallback Logic**: If DE translation missing, fallback to EN, then to key itself
5. **Persistence**: Read/write to `localStorage['horsecare_language']` on init/change

### Key Technical Decisions

**1. Translation Key Structure**  
Format: `category.subcategory.key` (e.g., `ui.statusBar.hunger`)  
- Dot-notation for hierarchy  
- Flat-at-runtime: Pre-flattened on load for O(1) access  
- Type-safe: TypeScript interfaces for all keys

**2. Language Switching Mechanism**  
- UIScene emits `languageChanged` event
- All scenes listen via `this.events.on('languageChanged')`
- Scenes update their text GameObjects by calling `setText(i18nService.t('key'))`
- No full scene restart needed (performance optimization)

**3. Translation File Loading**  
- Vite imports JSON at build time: `import de from './locales/de.json'`
- No runtime HTTP requests (faster, works offline)
- Tree-shakable if unused keys exist (future optimization)

**4. README Translation Strategy**  
- Primary README.md in German (matches target audience)
- README_EN.md for English speakers (linked from main README)
- Code examples remain language-agnostic (TypeScript doesn't change)

### Phase 0 Output

**File**: `research.md` - **NOT CREATED** (straightforward implementation, no unknowns)  
Rationale: All technical decisions are clear from spec and existing codebase. No research spikes needed.

### Open Questions Resolved

**Git Commit Language** (from spec.md Open Question 1):  
**Decision**: Use English for all Git commit messages.  
**Rationale**: Industry standard for international collaboration, GitHub ecosystem compatibility, tooling support. German README serves target audience; English commits serve developer ecosystem.

---

## Phase 1: Data Model & Contracts

### Data Model

**File**: [data-model.md](data-model.md) - **ALREADY EXISTS**

Key entities defined:
- `Translation`: Nested object structure for translation files
- `LanguageConfig`: Metadata for supported languages (code, name, flag icon)
- `LocaleState`: Current language and available translations in memory
- LocalStorage schema: `{ horsecare_language: "de" | "en" }`

**Integration with GameState**:
```typescript
interface GameState {
  // ... existing fields
  locale: {
    language: string;  // "de" or "en"
  };
}
```

### Contracts

**Files**: `contracts/*.md` - **ALREADY EXIST**

1. **[i18n-service-api.md](contracts/i18n-service-api.md)**  
   - `t(key, params?)`: Translation lookup with placeholder support
   - `setLanguage(code)`: Change language + persist + emit event
   - `getCurrentLanguage()`: Get active language
   - `on/off('languageChanged')`: Event subscription
   - Full test cases and acceptance criteria defined

2. **[language-selector-ui.md](contracts/language-selector-ui.md)**  
   - Visual design options (flags, toggle buttons, dropdown)
   - Phaser implementation details (Container, Text, input handlers)
   - Integration with UIScene
   - Accessibility requirements (44x44px minimum size)

3. **[translation-files.md](contracts/translation-files.md)**  
   - JSON schema for `locales/de.json` and `locales/en.json`
   - Complete key structure (ui.*, game.*, etc.)
   - Placeholder syntax: `{variableName}`
   - Validation rules (both files must have identical keys)

### Quickstart Guide

**File**: [quickstart.md](quickstart.md) - **ALREADY EXISTS**

Covers:
- How to use `i18nService.t()` in code
- Adding new translations to JSON files
- Programmatic language switching
- Testing procedures
- Integration scenarios (new UI elements, dynamic messages)
- Common problems and solutions

### Phase 1 Validation

All Phase 1 deliverables are complete and consistent:
- ✅ Data model defines all necessary interfaces
- ✅ Contracts specify API behavior comprehensively
- ✅ Translation file structure includes all current UI strings
- ✅ Quickstart provides actionable developer guidance

---

## Phase 2: Task Breakdown

**Output**: `tasks.md` - **TO BE CREATED BY `/speckit.tasks` COMMAND**

Expected task categories:
1. **Setup**: Create directories, install dependencies (if any)
2. **Core Service**: Implement i18nService with all methods
3. **Translation Files**: Create de.json and en.json with all keys
4. **UI Component**: Implement LanguageSelector
5. **Scene Integration**: Update UIScene, MainGameScene, BootScene
6. **Entity Integration**: Update Horse, StatusBar, InventoryItem
7. **State Integration**: Extend gameStore with locale state
8. **Testing**: Unit + integration tests
9. **Documentation**: Translate README.md, create README_EN.md
10. **Polish**: Verify all strings, test both languages end-to-end

---

## Agent Context Update

**Action Required**: Run `.specify/scripts/bash/update-agent-context.sh copilot`

This will add to `.github/copilot-instructions.md`:
```markdown
## Feature: Internationalization (i18n)

**Technologies**: 
- Custom i18n service (no external library)
- JSON-based translations (locales/de.json, locales/en.json)
- LocalStorage for persistence

**Usage**:
```typescript
import { i18nService } from '@/services/i18nService';
const text = i18nService.t('ui.buttons.feed'); // "Füttern" or "Feed"
```

**Key Patterns**:
- Always use `i18nService.t()` for user-facing strings
- Translation keys: `category.subcategory.key` format
- Both languages must have identical key structure
- Flag auto-update on language change via events
```

---

## Post-Design Constitution Re-Check

### Final Alignment Review

**I. Visual Excellence First** ✅  
- Language selector design includes hover effects and smooth transitions
- Flag emojis provide instant visual recognition
- No performance impact on 60 FPS target

**II. Game Engine Foundation** ✅  
- LanguageSelector is a proper Phaser Container with GameObjects
- Uses Phaser's event system for language change propagation
- Integrates seamlessly with existing UIScene architecture

**III. Browser-First Deployment** ✅  
- LocalStorage is universally supported in target browsers
- Translation files bundled (no runtime fetches)
- Works in PWA offline mode

**IV. Testable Game Logic** ✅  
- i18nService is framework-agnostic TypeScript class
- 100% unit test coverage planned for service logic
- LanguageSelector tested via Phaser scene mocking

**V. 2D→3D Evolution Path** ✅  
- Translation system works with any rendering approach
- JSON schema can extend to support 3D UI element labels
- No coupling between translation storage and visual representation

### Technical Standards Final Check

- ✅ **TypeScript strict mode**: All new code type-safe
- ✅ **No `any` types**: Proper interfaces for all i18n types
- ✅ **Vitest tests**: 14 planned test cases across 3 test files
- ✅ **Bundle size**: < 10KB increase (5KB estimated)
- ✅ **Performance**: O(1) lookups, < 1ms translation access
- ✅ **Code quality**: ESLint + Prettier compliant

**Final Verdict**: ✅ **APPROVED FOR IMPLEMENTATION**

No constitutional violations. Feature enhances accessibility for target audience (German children) while maintaining all technical standards and performance requirements.

---

## Implementation Readiness

**Status**: ✅ **READY FOR TASK BREAKDOWN**

All planning prerequisites met:
- [x] Feature specification complete and reviewed
- [x] Technical context fully defined
- [x] Constitution check passed (no violations)
- [x] Research phase completed (no unknowns)
- [x] Data model defined with clear interfaces
- [x] API contracts specified with test cases
- [x] Quickstart guide provides implementation patterns
- [x] Project structure defined (files to create/modify)

**Next Command**: `/speckit.tasks` to generate actionable task list from this plan.

**Estimated Implementation Time**: 8-12 hours (1-2 days for solo developer)
- Core service: 2-3 hours
- Translation files: 1 hour
- UI component: 2 hours
- Scene/entity integration: 3-4 hours
- Testing: 2-3 hours
- Documentation: 1 hour
