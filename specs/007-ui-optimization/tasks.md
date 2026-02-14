# Tasks: UI-Optimierung

## Phase 1: Setup
- [X] T001 Erstelle Branch 008-ui-optimierung
- [X] T002 Initialisiere Feature-Ordner specs/007-ui-optimization/
- [X] T003 Kopiere Templates für spec.md, plan.md, tasks.md, quickstart.md, data-model.md, contracts/

## Phase 2: Foundational
- [ ] T004 Analysiere aktuelle Phaser-Konfiguration in src/config/phaserConfig.ts
- [ ] T005 Dokumentiere aktuelle Grundauflösung und Skalierung in specs/007-ui-optimization/research.md
- [ ] T006 Prüfe Asset-Qualität in assets/sprites/

## Phase 3: User Story 1 – Scharfe UI auf allen Geräten (P1)
- [ ] T007 [P] [US1] Implementiere dynamische, responsive Grundauflösung in src/config/phaserConfig.ts
- [ ] T008 [US1] Passe Canvas-Skalierung in src/scenes/BootScene.ts an
- [ ] T009 [US1] Schreibe Integrationstest für UI-Schärfe in tests/integration/ui-optimization.test.ts

## Phase 4: User Story 2 – Responsive Anpassung (P2)
- [ ] T010 [P] [US2] Implementiere automatische Anpassung der UI an Fenstergröße in src/scenes/UIScene.ts
- [ ] T011 [US2] Teste UI-Verhalten bei Fenstergrößenänderung in tests/integration/ui-optimization.test.ts

## Phase 5: User Story 3 – Hochwertige Assets (P3)
- [ ] T012 [P] [US3] Ersetze unscharfe Assets durch hochauflösende Varianten in assets/sprites/
- [ ] T013 [US3] Prüfe Partikel- und Icon-Skalierung in src/scenes/MainGameScene.ts
- [ ] T014 [US3] Schreibe Test für Asset-Qualität in tests/integration/ui-optimization.test.ts

## Final Phase: Polish & Cross-Cutting
- [ ] T015 [P] Dokumentiere Maßnahmen und Ergebnisse in specs/007-ui-optimization/quickstart.md
- [ ] T016 Überprüfe alle Acceptance Criteria in specs/007-ui-optimization/spec.md
- [ ] T017 Führe Cross-Browser-Tests durch (Chrome, Firefox, Safari, Edge)

## Dependencies
- US1 (Schärfe) ist Voraussetzung für US2 (Responsive) und US3 (Assets)
- US2 und US3 können parallel umgesetzt werden

## Parallel Execution Examples
- T007, T010, T012 können parallel ausgeführt werden (verschiedene Dateien)

## Implementation Strategy
- MVP: Nur User Story 1 (dynamische, scharfe UI)
- Inkrementell: Erst Schärfe, dann Responsive, dann Asset-Qualität
