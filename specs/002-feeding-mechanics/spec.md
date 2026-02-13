# Feature Specification: Enhanced Feeding Mechanics

**Feature Branch**: `002-feeding-mechanics`  
**Created**: 2026-02-11  
**Status**: Draft  
**Input**: User description: "Enhanced feeding mechanics with eating duration and satiety limit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Timed Eating Animation (Priority: P1)

Fionella feeds her horse a carrot. Instead of an instant hunger increase, the horse takes time to eat the carrot (chewing animation). During this time, Fionella cannot feed another carrot immediately - she must wait for the horse to finish eating.

**Why this priority**: Core mechanic change that affects all feeding interactions. Must be implemented first as it's the foundation for the satiety system.

**Independent Test**: Click carrot → click horse → observe eating animation plays for 2.5 seconds → verify hunger increases only after animation completes → verify clicking horse again during eating does nothing.

**Acceptance Scenarios**:

1. **Given** the horse is idle and Fionella has carrots, **When** she clicks a carrot and then clicks the horse, **Then** the horse starts eating animation and carrot count decreases by 1
2. **Given** the horse is currently eating a carrot, **When** Fionella clicks the horse again with a carrot selected, **Then** no action occurs and the current eating animation continues
3. **Given** the horse finishes eating, **When** the eating animation completes, **Then** hunger status increases by the configured amount (e.g., +20)
4. **Given** the horse is eating, **When** 2.5 seconds pass, **Then** the eating animation completes and horse returns to idle state

---

### User Story 2 - Satiety Limit (Three Carrot Maximum) (Priority: P2)

After the horse has eaten 3 carrots in succession, it becomes "full" and refuses to eat more carrots for a cooldown period, even if the hunger bar is not at 100%. Fionella sees a visual indicator showing the horse is temporarily full and must wait before feeding again.

**Why this priority**: Adds strategic depth and prevents mindless spam-clicking. Second priority because it builds on P1's eating system.

**Independent Test**: Feed 3 carrots in succession → verify "full" indicator appears → verify horse refuses 4th carrot → wait for cooldown period → verify horse accepts carrots again.

**Acceptance Scenarios**:

1. **Given** the horse has eaten 0 carrots recently, **When** Fionella feeds 1, 2, then 3 carrots, **Then** each carrot is eaten normally
2. **Given** the horse has just eaten its 3rd carrot, **When** the eating animation completes, **Then** a "full" indicator appears near the horse
3. **Given** the horse is in "full" state, **When** Fionella tries to feed a 4th carrot, **Then** the feeding action is blocked (carrot icon grayed out, no visual refusal animation in initial scope)
4. **Given** the horse is in "full" state and 30 seconds have passed, **When** the cooldown timer expires, **Then** the "full" indicator disappears and horse accepts carrots again
5. **Given** the horse is in "full" state, **When** Fionella pets or grooms the horse, **Then** those interactions still work normally (only feeding is blocked)

---

### User Story 3 - Visual Feedback for Eating State (Priority: P3)

Fionella always knows when the horse is eating, when it's full, and when it can eat again through clear visual indicators. This includes a progress indicator during eating, a "full" badge when saturated, and a countdown timer showing when feeding becomes available again.

**Why this priority**: Quality-of-life improvement that makes the mechanics transparent. Third priority because the core mechanics work without it, but UX is significantly worse.

**Independent Test**: Feed horse → observe eating progress bar → feed 3 carrots → observe "full" badge with countdown timer → wait for timer to reach 0 → verify visual state returns to normal.

**Acceptance Scenarios**:

1. **Given** the horse starts eating, **When** the eating animation plays, **Then** a circular progress indicator or progress bar shows the eating progress (0% to 100%)
2. **Given** the horse is eating, **When** time progresses, **Then** the progress indicator fills smoothly in real-time
3. **Given** the horse becomes full after 3 carrots, **When** the fullness state activates, **Then** a badge/icon appears near the horse with text like "Full" or "🍽️"
4. **Given** the horse is full, **When** the cooldown is active, **Then** a countdown timer shows remaining seconds (e.g., "Ready in 25s")
5. **Given** the horse is eating or full, **When** Fionella hovers over the carrot icon, **Then** the icon is grayed out or shows a "not available" state
6. **Given** the horse finishes the cooldown, **When** the timer reaches 0, **Then** all visual indicators reset and the carrot icon becomes active again

---

### Edge Cases

- **What happens when the user force-reloads the page while the horse is eating?** 
  - Eating state is not persisted; horse returns to idle. Carrot is already consumed (deducted before eating started). Satiety counter is preserved in save state.

- **What happens if the user feeds 2 carrots, waits 20 seconds, then feeds 1 more?**
  - Satiety counter decays over time: Each carrot in the counter "expires" after 10 seconds of not eating. If 2 carrots were eaten and 20+ seconds pass, the counter resets to 0 before the 3rd carrot is fed. This allows continuous feeding over longer periods without triggering cooldown if gaps are sufficient.

- **What happens if hunger reaches 100% while the horse is full/on cooldown?**
  - Horse remains in "full" state. Hunger bar stays at 100. Cooldown continues. No issues - this is expected behavior.

- **What happens if the user has 0 carrots remaining during the eating animation?**
  - Eating completes normally. Carrot icon shows "0" count and is grayed out. Fullness logic still applies if this was the 3rd carrot.

- **What happens if decay reduces hunger to 0 while the horse is full?**
  - Hunger continues to decay normally during cooldown. Horse can reach 0 hunger while full. This is intended gameplay (strategic challenge - time your feeding).

- **What happens when the user pets or grooms while the horse is eating?**
  - All interactions (feed, pet, groom) are blocked while the horse is actively eating. Once eating completes, all interactions become available again.
  
- **What happens when the user pets or grooms while the horse is full (but not eating)?**
  - Pet and groom interactions work normally. Only feeding is blocked during the fullness cooldown period.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an eating animation lasting 2.5 seconds when the horse consumes a carrot
- **FR-002**: System MUST prevent any feeding interaction while the horse is actively eating
- **FR-003**: System MUST increase hunger status only after the eating animation completes (not immediately when carrot is clicked)
- **FR-004**: System MUST track the number of carrots eaten in the current feeding session (counter: 0-3)
- **FR-005**: System MUST enter a "full" state when the horse has eaten 3 carrots in succession
- **FR-006**: System MUST block feeding attempts while in "full" state, regardless of current hunger level
- **FR-007**: System MUST apply a 30-second cooldown period when entering "full" state
- **FR-008**: System MUST exit "full" state and reset carrot counter when the cooldown expires
- **FR-009**: System MUST block ALL interactions (pet, groom, feed) while the horse is actively eating (Note: Consider adding visual feedback for blocked actions in polish phase)
- **FR-010**: System MUST allow normal interactions (pet, groom) when horse is in "full" state but not eating (only feeding remains blocked)
- **FR-011**: System MUST display a visual indicator showing eating progress during the eating animation
- **FR-012**: System MUST display a "full" badge/indicator when the horse is saturated
- **FR-013**: System MUST display a countdown timer showing remaining cooldown seconds (e.g., "Ready in 18s")
- **FR-014**: System MUST gray out or disable the carrot icon when feeding is unavailable (eating or full)
- **FR-014**: System MUST gray out or disable the carrot icon when feeding is unavailable (eating or full)
- **FR-015**: System MUST persist the satiety counter and cooldown timestamp across page reloads
- **FR-016**: System MUST continue hunger decay at normal rate during eating and cooldown periods
- **FR-017**: System MUST deduct carrot from inventory immediately when feeding action is initiated (before animation)
- **FR-018**: System MUST implement satiety counter decay: each carrot in counter expires after 10 seconds of not eating (see Edge Cases)
- **FR-019**: System MUST calculate satiety count at feeding time by counting active carrots (timestamp > now - 10 seconds)

### Key Entities *(data-related)*

- **Feeding State**: Represents the current feeding status of the horse
  - Attributes: `isEating` (boolean), `eatStartTime` (timestamp or null), `recentFeedings` (array of timestamps from last 30 seconds), `fullUntil` (timestamp or null)
  - Relationships: Belongs to the horse's runtime state, persisted in save system
  - Note: `recentFeedings` array is pruned on each check, removing timestamps older than 10 seconds

- **Eating Progress**: Represents progress of current eating animation
  - Attributes: `progress` (0.0-1.0), `remainingMs` (calculated)
  - Relationships: Derived from `eatStartTime` and current time (not persisted)

- **Cooldown Timer**: Represents time remaining until horse can eat again
  - Attributes: `remainingSeconds` (calculated from `fullUntil`)
  - Relationships: Derived from `fullUntil` timestamp (UI display only)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can observe a clear 2.5 second eating animation when feeding a carrot, with visual progress indication
- **SC-002**: Users cannot spam-feed carrots - attempts during eating or fullness are visually rejected
- **SC-003**: After feeding 3 carrots, the "full" indicator appears within 1 frame and remains visible for the full 30-second duration
- **SC-004**: The countdown timer updates every second and accurately reflects remaining cooldown time (±0.5s accuracy)
- **SC-005**: Feeding mechanics feel fair and responsive - no unexpected blocking, clear feedback on why actions are rejected
- **SC-006**: Satiety state persists across page reloads - if horse has eaten 2 carrots and page reloads, counter remains at 2
- **SC-007**: Game balance is improved - players must strategically time feeding to optimize hunger management against decay

## Assumptions *(optional)*

- Eating duration is fixed at 2.5 seconds (reasonable for casual game pacing)
- Satiety cooldown is 30 seconds (long enough to create strategic choices, short enough to avoid frustration)
- Satiety counter decays: each carrot "expires" from the count after 10 seconds of not eating (allows paced feeding)
- Eating state blocks ALL interactions - user must wait for eating to complete
- Grooming and petting ARE allowed when horse is full (but not eating)
- Hunger decay continues at normal rate during eating and cooldown (no special rules)
- Visual indicators use existing UI layer (no new scenes or complex overlays)

## Out of Scope

- Animations for different food types (only carrots in scope)
- Variable eating speeds based on hunger level
- Different satiety limits for different horse breeds/types
- Multiplayer synchronization of feeding states
- Sound effects for eating (audio is separate feature)
- Achievements or rewards tied to feeding patterns
- Analytics tracking of feeding behavior
- Brush/grooming satiety mechanics (only carrots in scope)
