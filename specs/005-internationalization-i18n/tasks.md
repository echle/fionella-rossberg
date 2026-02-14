---
description: "Task list for Internationalization (i18n) feature implementation"
---

# Tasks: Internationalization (i18n)

**Input**: Design documents from `/specs/005-internationalization-i18n/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED for this feature per success criteria: "Tests für i18n-Service vorhanden"

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Single project structure: `src/` and `tests/` at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure for i18n feature

- [X] T001 Create src/services/ directory for i18n service
- [X] T002 Create src/locales/ directory for translation files
- [X] T003 Create src/components/ directory for reusable UI components
- [X] T004 Create tests/unit/ directory if not exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n system that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core i18n Service and Translation Files

- [X] T005 [P] Create Translation and LocaleState interfaces in src/state/types.ts
- [X] T006 [P] Create i18nService singleton class in src/services/i18nService.ts with event emitter
- [X] T007 Implement i18nService.t() method for translation lookup with placeholder support
- [X] T008 Implement i18nService.setLanguage() with localStorage persistence
- [X] T009 Implement i18nService.getCurrentLanguage() and getAvailableLanguages()
- [X] T010 Implement i18nService event system (on/off for 'languageChanged' event)
- [X] T011 [P] Create locales/de.json with all German translations per contract
- [X] T012 [P] Create locales/en.json with all English translations per contract
- [X] T013 Validate translation file structure (identical keys in both files)

### Tests for Foundational i18n Service

> **NOTE: Write these tests FIRST, ensure they FAIL before core implementation (T007-T010)**

- [X] T014 [P] Unit test for i18nService.t() basic translation in tests/unit/i18nService.test.ts
- [X] T015 [P] Unit test for i18nService.t() with placeholders in tests/unit/i18nService.test.ts
- [X] T016 [P] Unit test for i18nService.setLanguage() and persistence in tests/unit/i18nService.test.ts
- [X] T017 [P] Unit test for i18nService event system in tests/unit/i18nService.test.ts

**Checkpoint**: Foundation ready - i18n service works, translation files loaded, user story implementation can now begin

---

## Phase 3: User Story 1 - German as Default Language (Priority: P1) 🎯 MVP

**Goal**: All UI text is displayed in German by default when the game starts. German-speaking children can play without seeing English text.

**Independent Test**: Start game fresh (clear localStorage), verify all text is German, no English visible.

### State Integration for User Story 1

- [X] T018 [US1] Add locale state to gameStore in src/state/gameStore.ts
- [X] T019 [US1] Initialize i18nService with default language ('de') in src/main.ts

### Scene Text Replacement for User Story 1

- [X] T020 [P] [US1] Replace hardcoded strings in BootScene with i18nService.t() in src/scenes/BootScene.ts
- [X] T021 [P] [US1] Replace hardcoded strings in MainGameScene with i18nService.t() in src/scenes/MainGameScene.ts
- [X] T022 [P] [US1] Replace hardcoded strings in UIScene status labels with i18nService.t() in src/scenes/UIScene.ts

### Entity Text Replacement for User Story 1

- [X] T023 [P] [US1] Replace hardcoded status strings in Horse entity with i18nService.t() in src/entities/Horse.ts
- [X] T024 [P] [US1] Replace hardcoded labels in StatusBar with i18nService.t() in src/entities/StatusBar.ts
- [X] T025 [P] [US1] Replace hardcoded item names in InventoryItem with i18nService.t() in src/entities/InventoryItem.ts

### Action/System Text Replacement for User Story 1

- [X] T026 [US1] Replace hardcoded strings in actions.ts with i18nService.t() in src/state/actions.ts
- [X] T027 [P] [US1] Replace hardcoded SaveSystem messages with i18nService.t() in src/systems/SaveSystem.ts

**Checkpoint**: At this point, ALL game text should be in German by default. No hardcoded English strings remain.

---

## Phase 4: User Story 2 - Language Switcher During Game (Priority: P2)

**Goal**: Player can switch between German and English at any time during gameplay. Language choice is saved and persists across sessions.

**Independent Test**: Start game, click language button, verify all text changes to English, reload browser, verify English persists.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T028 [P] [US2] Unit test for LanguageSelector component creation in tests/unit/LanguageSelector.test.ts
- [X] T029 [P] [US2] Unit test for LanguageSelector click handlers in tests/unit/LanguageSelector.test.ts
- [X] T030 [US2] Integration test for full language switch workflow in tests/integration/languageSwitch.test.ts

### Implementation for User Story 2

- [X] T031 [US2] Create LanguageSelector component class in src/components/LanguageSelector.ts
- [X] T032 [US2] Implement LanguageSelector UI with flag buttons (DE/EN) in src/components/LanguageSelector.ts
- [X] T033 [US2] Add hover and active state styling to LanguageSelector in src/components/LanguageSelector.ts
- [X] T034 [US2] Implement language switch click handlers in LanguageSelector in src/components/LanguageSelector.ts
- [X] T035 [US2] Add LanguageSelector to UIScene at position (gameWidth - 100, 20) in src/scenes/UIScene.ts
- [X] T036 [US2] Implement languageChanged event listeners in UIScene in src/scenes/UIScene.ts
- [X] T037 [US2] Implement text update methods on language change in UIScene in src/scenes/UIScene.ts
- [X] T038 [P] [US2] Implement languageChanged handlers in MainGameScene in src/scenes/MainGameScene.ts
- [X] T039 [P] [US2] Implement languageChanged handlers in BootScene if needed in src/scenes/BootScene.ts

**Checkpoint**: At this point, language switching should work seamlessly. Click button → all text updates → reload → language persists.

**Note on User Story 3**: User Story 3 ("Alle Texte übersetzt" - Developer maintainability) is a cross-cutting concern addressed across User Story 1 tasks (T020-T027 replace hardcoded strings) and existing documentation (quickstart.md, contracts/). The acceptance criteria (hardcoded strings replaced, new texts easily added via locales/*.json, placeholder support in i18nService.t()) are fully covered by foundational and US1 tasks. No separate US3 tasks needed.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, README translation, and final quality improvements

### Documentation

- [X] T040 [P] Translate README.md to German per spec requirements in README.md
- [X] T041 [P] (Optional) Create README_EN.md with English translation of README in README_EN.md
- [X] T042 Add usage examples to quickstart.md if not already complete in specs/005-internationalization-i18n/quickstart.md

### Additional Tests (Coverage Improvements)

- [X] T043 [P] Add edge case tests in tests/unit/i18nService.test.ts: (a) missing DE translation falls back to EN, (b) missing both DE/EN falls back to key, (c) general edge cases
- [X] T044 [P] Add tests for invalid language codes in tests/unit/i18nService.test.ts
- [X] T045 Add visual regression tests for LanguageSelector UI states (optional) in tests/integration/

### Validation

- [X] T046 Verify all translation keys exist in both de.json and en.json
- [X] T047 Verify no console warnings for missing translations
- [X] T048 Test game in both languages end-to-end manually
- [X] T049 Verify bundle size increase is < 10KB per plan.md constraints
- [X] T050 Run vitest coverage check (target 70%+ for i18n logic)
- [X] T051 Run ESLint and Prettier on all modified files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion, integrates with US1
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but should work even with only a few translated strings
- Both stories can theoretically run in parallel after Foundational, but US1 makes more sense first

### Within Each User Story

**User Story 1:**
- State integration (T018-T019) must complete first
- Scene/Entity text replacements (T020-T025) can run in parallel
- Action/System replacements (T026-T027) can run in parallel with scenes/entities

**User Story 2:**
- Tests (T028-T030) should be written first and fail
- LanguageSelector component (T031-T034) before integration
- UIScene integration (T035-T037) after component is ready
- Other scene handlers (T038-T039) can run in parallel

### Parallel Opportunities

**Setup Phase:**
- All directory creation tasks (T001-T004) can run in single command

**Foundational Phase:**
- Interface definitions (T005) before service implementation
- Service methods (T007-T010) must be sequential (depend on each other)
- Translation files (T011-T012) can run in parallel
- All test creation (T014-T017) can run in parallel

**User Story 1:**
- All scene replacements (T020-T022) can run in parallel
- All entity replacements (T023-T025) can run in parallel
- System replacements (T027) parallel with scenes/entities

**User Story 2:**
- Test creation (T028-T030) can run in parallel
- Scene handlers (T038-T039) can run in parallel

**Polish Phase:**
- Documentation (T040-T042) can run in parallel
- Additional tests (T043-T045) can run in parallel

---

## Parallel Example: User Story 1

```bash
# After T018-T019 complete, launch in parallel:
Task T020: "Replace strings in BootScene"
Task T021: "Replace strings in MainGameScene"  
Task T022: "Replace strings in UIScene"
Task T023: "Replace strings in Horse entity"
Task T024: "Replace strings in StatusBar"
Task T025: "Replace strings in InventoryItem"
Task T027: "Replace strings in SaveSystem"

# All these work on different files, no conflicts
```

---

## Parallel Example: User Story 2 Tests

```bash
# Launch all test files for User Story 2 together:
Task T028: "Unit test for LanguageSelector creation"
Task T029: "Unit test for LanguageSelector clicks"
Task T030: "Integration test for language switch"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (< 5 minutes)
2. Complete Phase 2: Foundational (2-3 hours)
   - i18nService with all methods
   - Both translation files complete
   - Tests passing
3. Complete Phase 3: User Story 1 (3-4 hours)
   - Replace all hardcoded strings
   - Game displays in German
4. **STOP and VALIDATE**: 
   - Clear localStorage
   - Start game
   - Verify all text is German
   - No English visible anywhere
5. Commit and demo/deploy if ready

**Result**: Children can play game in German - PRIMARY GOAL ACHIEVED ✅

### Full Implementation (Both User Stories)

1. Complete Setup + Foundational → Foundation ready (2-3 hours)
2. Complete User Story 1 → Test independently → German works (3-4 hours)
3. Complete User Story 2 → Test independently → Language switching works (2 hours)
4. Complete Polish → README translated, tests complete (1 hour)

**Total: 8-10 hours estimated**

### Parallel Team Strategy (if 2 developers available)

1. Both complete Setup + Foundational together (2-3 hours)
2. Once Foundational done:
   - **Developer A**: User Story 1 (replace all strings) - 3-4 hours
   - **Developer B**: User Story 2 (build LanguageSelector) - 2 hours
   - Developer B can start with test writing even before A finishes
3. Integration: Developer A's translated strings + Developer B's selector - 30 min
4. Both: Polish together - 1 hour

**Total: 6-8 hours with 2 developers**

---

## Notes

### Critical Success Factors

- [ ] Translation files have IDENTICAL key structure (de.json ↔ en.json)
- [ ] No hardcoded user-facing strings remain in code
- [ ] i18nService.t() used for ALL user-visible text
- [ ] German is default language on fresh install
- [ ] Language persists across browser reloads
- [ ] 60 FPS maintained during language switch
- [ ] Bundle size increase < 10KB

### Common Pitfalls to Avoid

- ❌ Forgetting to add translation keys to BOTH files
- ❌ Hardcoding strings in new code after i18n is set up
- ❌ Not handling missing translation keys gracefully
- ❌ Forgetting to update text on language change event
- ❌ Using wrong placeholder syntax (use `{varName}` not `${varName}`)

### Testing Checklist

- [X] All i18nService unit tests pass
- [X] Integration test for language switch passes
- [X] Manual test: Clear localStorage → Game in German
- [X] Manual test: Switch to English → All text changes
- [X] Manual test: Reload browser → English persists
- [X] Manual test: Switch back to German → All text changes
- [X] No console errors or warnings
- [X] Performance: Language switch completes in < 50ms

### Definition of Done for Each Task

A task is complete when:
- [X] Code is implemented and works as specified
- [X] File path in task matches actual file location
- [X] Related tests pass (if applicable)
- [X] No ESLint errors or warnings
- [X] Code is formatted with Prettier
- [X] Manual testing confirms functionality
- [ ] Committed to feature branch

---

## Estimated Timeline

| Phase | Est. Time | Blocker? |
|-------|-----------|----------|
| Phase 1: Setup | 5 min | - |
| Phase 2: Foundational | 2-3 hours | YES - blocks all stories |
| Phase 3: User Story 1 | 3-4 hours | - |
| Phase 4: User Story 2 | 2 hours | - |
| Phase 5: Polish | 1 hour | - |
| **Total** | **8-10 hours** | |

**MVP (Phase 1-3 only)**: ~6 hours → German language support working
**Full Feature (All phases)**: ~8-10 hours → Full bilingual support with switcher
