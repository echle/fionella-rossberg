# Feature Specification: Reset Button

**Feature Branch**: `004-reset-button`  
**Created**: 2026-02-14  
**Status**: Draft  
**Input**: User description: "Als nächstes ein kleines neues Feature in dem wir einen einfachen Reset Button hinzufügen. Wenn aktuell keine Karotten oder Bürsten mehr da sind, dann kann man nicht mehr neu starten."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Reset Game When Out of Resources (Priority: P1)

Fionella has used up all her carrots and brush uses. The game is now unplayable because she cannot perform any actions to care for her horse. A "Reset Game" button appears on the screen, allowing her to restart the game with fresh inventory and reset horse status values.

**Why this priority**: This is critical for game continuity. Without a reset mechanism, players who exhaust their resources are stuck and must reload the page manually, which creates a poor user experience and breaks immersion.

**Independent Test**: Can be fully tested by depleting all carrots (set to 0) and brush uses (set to 0), verifying the reset button appears, clicking it, and confirming all values return to their initial state (carrots: 10, brush uses: 100, horse status reset).

**Acceptance Scenarios**:

1. **Given** the player has 0 carrots and 0 brush uses remaining, **When** the UI updates, **Then** a "Reset Game" button appears at the top-right corner of the screen
2. **Given** the reset button is visible, **When** the player clicks/taps on the reset button, **Then** the game state resets to initial values
3. **Given** the reset button was clicked, **When** the game resets, **Then** inventory shows 10 carrots and 100 brush uses
4. **Given** the reset button was clicked, **When** the game resets, **Then** horse status values return to initial state (hunger, cleanliness, happiness)
5. **Given** the reset button was clicked, **When** the game resets, **Then** the feeding state is cleared (no cooldown, no recent feedings)
6. **Given** the game was reset, **When** the reset completes, **Then** the reset button disappears
7. **Given** the game was reset, **When** the reset completes, **Then** the new game state is saved to localStorage

---

### User Story 2 - Hide Reset Button When Resources Available (Priority: P2)

When Fionella has at least one carrot OR at least one brush use remaining, the reset button is hidden. This keeps the UI clean and only shows the reset option when truly needed.

**Why this priority**: This ensures the UI remains uncluttered during normal gameplay and the reset button only appears as a rescue mechanism, not a regular game option. This reinforces that resetting is for recovery, not casual use.

**Independent Test**: Can be tested by starting with full inventory, verifying the reset button is hidden, then manually depleting resources to verify it appears, then resetting to verify it disappears again.

**Acceptance Scenarios**:

1. **Given** the player has at least 1 carrot remaining, **When** the UI renders, **Then** the reset button is not visible
2. **Given** the player has at least 1 brush use remaining, **When** the UI renders, **Then** the reset button is not visible
3. **Given** the player has 5 carrots and 0 brush uses, **When** the UI renders, **Then** the reset button is not visible
4. **Given** the player has 0 carrots but 50 brush uses, **When** the UI renders, **Then** the reset button is not visible
5. **Given** the player uses their last carrot but still has brush uses, **When** the inventory updates, **Then** the reset button remains hidden

---

### Edge Cases

- What happens when the player clicks the reset button multiple times rapidly?
  - The button should be disabled during the reset operation to prevent duplicate resets
  
- What happens if the player is in the middle of an eating animation when they click reset?
  - Phaser automatically cleans up all tweens/animations on state changes. The animation interrupts gracefully without manual intervention.
  
- What happens to the decay system when the game resets?
  - The decay system should reset its timer to avoid large jumps in status decay immediately after reset
  
- What happens if the game fails to save after reset?
  - The in-memory state should still be reset, but a console warning should be logged

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Reset Game" button when inventory carrots = 0 AND brush uses = 0
- **FR-002**: System MUST hide the "Reset Game" button when inventory carrots > 0 OR brush uses > 0  
- **FR-003**: Reset button MUST reset horse status to initial values (hunger, cleanliness, happiness as defined in INITIAL_STATUS)
- **FR-004**: Reset button MUST reset inventory to initial values (carrots: 10, brush uses: 100 as defined in INITIAL_INVENTORY)
- **FR-005**: Reset button MUST clear feeding state (isEating: false, eatStartTime: null, recentFeedings: [], fullUntil: null)
- **FR-006**: Reset button MUST clear UI state (selectedTool: null, activeAnimation: null, lastInteractionTime: 0)
- **FR-007**: System MUST persist the reset game state to localStorage via SaveSystem
- **FR-008**: Reset button MUST be clickable/tappable with standard pointer interaction
- **FR-009**: Reset button MUST have clear visual indication that it is interactive (e.g., hover effect, button styling)
- **FR-010**: Reset button MUST be disabled during the reset operation to prevent multiple simultaneous resets
- **FR-011**: DecaySystem MUST reset its internal timer when game resets to avoid status decay jumps

### Non-Functional Requirements

- **NFR-001**: Reset operation MUST complete within 100ms to feel instant to the user
- **NFR-002**: Reset button MUST be visually prominent and easy to find when displayed
- **NFR-003**: Reset button text MUST be clear and self-explanatory (final: "🔄 Reset")
- **NFR-004**: Reset button MUST work on both desktop (mouse) and mobile (touch) devices

### Key Entities *(include if feature involves data)*

- **Reset Button**: UI element (Phaser.GameObjects.Text or Phaser.GameObjects.Container) displayed conditionally in UIScene
  - Visibility depends on inventory state (carrots = 0 AND brushUses = 0)
  - Position: Should be prominent but not obstruct game view
  - Styling: Clear contrast, interactive appearance

### Dependencies

- Existing `resetGame()` function in `/src/state/actions.ts` (needs to be enhanced to include feeding state reset)
- Existing `DecaySystem.reset()` in `/src/systems/DecaySystem.ts` (needs to be called on game reset)
- SaveSystem integration for persisting reset state
- UIScene for rendering and managing button visibility

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can resume gameplay after exhausting all resources without manually reloading the page (100% success rate in testing)
- **SC-002**: Reset operation completes and updates UI within 100ms (perceived as instant)
- **SC-003**: Reset button appears within 1 frame update (16ms at 60fps) after inventory reaches 0/0
- **SC-004**: Post-reset game state matches initial game state exactly (all values verified in automated tests)
- **SC-005**: Reset button is visually discoverable without instructions (subjective but should be prominent)
