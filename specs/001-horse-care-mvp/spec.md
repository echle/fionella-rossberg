# Feature Specification: Horse Care Game MVP

**Feature Branch**: `001-horse-care-mvp`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "Erstelle das MVP für das Pferde-Pflege-Spiel. Fionella kann ein Pferd sehen und mit ihm interagieren. Sie kann das Pferd füttern (Karotten aus Inventar geben), striegeln (mit Bürste über das Pferd wischen) und streicheln (Klick/Touch). Das Pferd hat drei Status-Werte: Hunger (0-100), Sauberkeit (0-100) und Glück (0-100). Diese Werte werden als Balken angezeigt. Die Werte sinken über Zeit automatisch. Einfache 2D Sprites, funktioniert mit Maus und Touch-Steuerung für Tablet/Handy."

## User Scenarios & Testing

### User Story 1 - View Horse and Status Display (Priority: P1)

Fionella opens the game and immediately sees her horse with clear visual indicators showing how the horse is doing. The horse's current needs (hunger, cleanliness, happiness) are displayed as easy-to-understand colored bars above or beside the horse.

**Why this priority**: This is the absolute foundation of the game. Without being able to see the horse and its status, no other interaction makes sense. This establishes the core game loop visibility.

**Independent Test**: Can be fully tested by launching the game and verifying that the horse sprite and three status bars (Hunger, Sauberkeit, Glück) are visible and display initial values. Delivers immediate value by showing the player their horse.

**Acceptance Scenarios**:

1. **Given** the game loads for the first time, **When** the main screen appears, **Then** a horse sprite is visible in the center of the screen
2. **Given** the horse is displayed, **When** the player looks at the interface, **Then** three clearly labeled status bars are visible (Hunger 0-100, Sauberkeit 0-100, Glück 0-100)
3. **Given** the game is running, **When** no actions have been taken, **Then** all status bars show their current values as filled bars with percentage indicators
4. **Given** the game is viewed on a mobile device, **When** the screen size changes, **Then** the horse and status bars remain visible and properly scaled

---

### User Story 2 - Feed Horse from Inventory (Priority: P2)

Fionella can feed her horse by selecting a carrot from her inventory and giving it to the horse. When she does this, the horse's hunger status improves, and the horse shows a happy animation. The carrot is consumed from the inventory.

**Why this priority**: Feeding represents the first meaningful interaction and teaches the player the core gameplay loop: identify need → use item → see result. This creates engagement beyond passive observation.

**Independent Test**: Can be tested by starting with low hunger status, selecting a carrot from inventory, interacting with the horse, and verifying that hunger increases and the carrot count decreases. Delivers the satisfying "care for animal" experience.

**Acceptance Scenarios**:

1. **Given** the horse's hunger is below 100, **When** Fionella selects a carrot from the inventory, **Then** the carrot becomes the active selection (highlighted or held in cursor)
2. **Given** a carrot is selected, **When** Fionella clicks/taps on the horse, **Then** the horse plays an eating animation
3. **Given** the horse is eating, **When** the animation completes, **Then** the hunger status bar increases by a defined amount (e.g., +20 points)
4. **Given** a carrot was fed to the horse, **When** the feeding action completes, **Then** the carrot count in inventory decreases by 1
5. **Given** the inventory has 0 carrots, **When** Fionella tries to select a carrot, **Then** the game indicates no carrots are available (grayed out or message)
6. **Given** the horse's hunger is already at 100, **When** Fionella feeds a carrot, **Then** the hunger stays at 100 but the carrot is still consumed (no waste mechanic prevents feeding)

---

### User Story 3 - Groom Horse with Brush (Priority: P3)

Fionella can clean her horse by selecting a brush from the inventory and dragging/swiping it across the horse's body. As she brushes, the horse's cleanliness status improves, and visual feedback (sparkles, dust particles) shows the grooming in progress.

**Why this priority**: Grooming adds a second care mechanic with more interactive gameplay (drag/swipe) compared to the simple click of feeding. This increases variety and engagement depth.

**Independent Test**: Can be tested by starting with low cleanliness, selecting the brush, performing swipe gestures on the horse, and verifying cleanliness increases with visual feedback. Delivers a tactile, satisfying care interaction.

**Acceptance Scenarios**:

1. **Given** the horse's cleanliness is below 100, **When** Fionella selects the brush from inventory, **Then** the brush becomes the active tool (highlighted, cursor changes)
2. **Given** the brush is selected, **When** Fionella clicks/taps and drags across the horse sprite, **Then** visual effects appear along the drag path (sparkles, dust clouds, brush strokes)
3. **Given** grooming is in progress, **When** Fionella completes a brush stroke, **Then** the cleanliness status bar increases incrementally (e.g., +5 per stroke)
4. **Given** multiple brush strokes are performed, **When** the player continues brushing, **Then** each stroke continues to increase cleanliness until it reaches 100
5. **Given** the horse's cleanliness is at 100, **When** Fionella tries to brush, **Then** the action still triggers animations but cleanliness stays at 100
6. **Given** grooming is active, **When** the player stops dragging, **Then** the grooming action stops and the brush remains selected for next interaction

---

### User Story 4 - Pet Horse for Happiness (Priority: P4)

Fionella can pet her horse with a simple click/tap anywhere on the horse. This shows an affection animation (hearts, happy horse expression) and increases the horse's happiness status. No inventory item is required—just direct interaction.

**Why this priority**: Petting adds emotional connection and a zero-cost interaction. It's important but can work after core care mechanics (feeding, grooming) are established.

**Independent Test**: Can be tested by clicking/tapping the horse when no tool is selected and verifying happiness increases with appropriate animations. Delivers feel-good interaction.

**Acceptance Scenarios**:

1. **Given** no item is selected from inventory, **When** Fionella clicks/taps on the horse, **Then** the horse plays a happy animation (head nod, ear twitch, happy sound)
2. **Given** petting animation is playing, **When** the animation starts, **Then** visual effects appear (floating hearts, sparkles around horse)
3. **Given** the horse is petted, **When** the petting action completes, **Then** the happiness status bar increases by a defined amount (e.g., +10 points)
4. **Given** the horse's happiness is at 100, **When** Fionella pets the horse, **Then** the animation still plays but happiness stays at 100
5. **Given** petting just occurred, **When** Fionella pets again immediately, **Then** the interaction is allowed (no cooldown for MVP, possible future feature)

---

### User Story 5 - Automatic Status Decay Over Time (Priority: P5)

As time passes in the game, the horse's status values (hunger, cleanliness, happiness) gradually decrease. This creates the need for ongoing care and makes the game dynamic rather than static once values are maxed.

**Why this priority**: Time-based decay creates the core gameplay loop and sense of responsibility. However, it's lower priority because the game can be tested without it initially—manual status changes via interactions are sufficient for basic testing.

**Independent Test**: Can be tested by loading the game, waiting a defined period (e.g., 60 seconds), and verifying all three status bars have decreased by expected amounts. Delivers ongoing engagement incentive.

**Acceptance Scenarios**:

1. **Given** the game is running with all statuses at 100, **When** 60 seconds pass without interaction, **Then** each status bar decreases by a defined amount (e.g., hunger -10, cleanliness -5, happiness -8)
2. **Given** status values are above 0, **When** time continues to pass, **Then** values continue to decrease at consistent rates
3. **Given** a status value reaches 0, **When** more time passes, **Then** the value stays at 0 (no negative values)
4. **Given** the game is in the background/tab is not active, **When** the player returns to the game, **Then** status values reflect the elapsed time (time continues even when not actively playing)
5. **Given** the player saves and exits the game, **When** they reload later, **Then** status values are calculated based on elapsed real-world time since last save

---

### Edge Cases

- **What happens when multiple status bars hit 0 simultaneously?** 
  - The horse should display a sad/distressed visual state, but the game continues to be playable. No "game over" state in MVP.

- **What happens if the player runs out of all inventory items (no carrots, no brush)?**
  - The player can still pet the horse to maintain happiness. With 10 carrots and 100 brush uses, this provides substantial playtime before depletion. Future features could include item replenishment (shop, time-based refill, watch-ad rewards).

- **How does the game handle very rapid clicking/tapping?**
  - The system should prevent action spam by ensuring each interaction completes its animation before accepting a new input for the same action type. This prevents status bars from jumping unrealistically.

- **What happens if the user has two tabs/windows of the game open?**
  - For MVP, game state is saved to local storage and may conflict. Acceptable limitation for MVP. Future improvement could use session-based state or conflict detection.

- **What happens when status bars are at 100 but the player continues care actions?**
  - Animations still play (for satisfying feedback), but status values cap at 100. Inventory items are still consumed if applicable (carrots consumed, brush never consumed).

- **How does touch interaction differ from mouse on grooming?**
  - Touch drag and mouse drag should behave identically. Touch should have slightly larger hit boxes for fingers vs. precise mouse cursor.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a horse sprite in the center of the viewport
- **FR-002**: System MUST display three status bars labeled "Hunger," "Sauberkeit," and "Glück" with current values (0-100)
- **FR-003**: System MUST provide an inventory interface showing available items (carrots, brush)
- **FR-004**: System MUST allow selection of inventory items via click/tap
- **FR-005**: System MUST respond to mouse click and touch tap input on the horse sprite
- **FR-006**: System MUST play animations when horse is fed (eating animation)
- **FR-007**: System MUST play animations when horse is groomed (brush strokes, sparkle effects)
- **FR-008**: System MUST play animations when horse is petted (happy expression, hearts)
- **FR-009**: System MUST increase hunger status by defined amount when horse is fed
- **FR-010**: System MUST increase cleanliness status incrementally when horse is groomed (per brush stroke)
- **FR-011**: System MUST increase happiness status when horse is petted
- **FR-012**: System MUST decrease carrot count in inventory when a carrot is used
- **FR-013**: System MUST cap all status values at maximum 100
- **FR-014**: System MUST cap all status values at minimum 0
- **FR-015**: System MUST decrease all status values automatically over time at defined rates
- **FR-016**: System MUST persist game state (status values, inventory counts) to browser storage
- **FR-017**: System MUST load saved game state when game is reopened
- **FR-018**: System MUST calculate elapsed time since last save and apply status decay accordingly
- **FR-019**: System MUST support both desktop (mouse) and mobile (touch) input methods
- **FR-020**: System MUST scale interface appropriately for different screen sizes (responsive design)
- **FR-021**: System MUST prevent action spam by enforcing animation completion before accepting new inputs of the same type
- **FR-022**: System MUST provide visual feedback for all player interactions (highlight, cursor change, button press effects)
- **FR-023**: System MUST indicate when inventory items are unavailable (0 count) with appropriate visual state (grayed out)
- **FR-024**: Initial inventory MUST contain 10 carrots
- **FR-025**: Brush tool MUST have 100 uses before being depleted (consumable item)
- **FR-026**: System MUST display brush usage count in inventory interface
- **FR-027**: System MUST decrease brush count by 1 for each grooming stroke completed
- **FR-028**: System MUST prevent grooming when brush count reaches 0

### Key Entities

- **Horse**: Represents Fionella's horse with three status attributes (Hunger: 0-100, Cleanliness: 0-100, Happiness: 0-100), current animation state (idle, eating, being groomed, happy), and visual representation (sprite)

- **Inventory**: Contains available care items - Carrot count (consumable, starts at 10), Brush count (consumable, starts at 100 uses)

- **Game State**: Global game data including current timestamp, last save timestamp, elapsed time calculations, and flag for whether game is first-time load or returning session

- **Status Bar**: Visual component displaying each horse status with label, current value, max value (100), and filled bar representation

## Success Criteria

### Measurable Outcomes

- **SC-001**: Players can see the horse and all status bars within 5 seconds of game load (initial load performance)
- **SC-002**: All player interactions (feed, groom, pet) respond with visual feedback within 100 milliseconds (perceived responsiveness)
- **SC-003**: The game runs smoothly at 60 FPS on mid-range devices from 2018 or newer (performance standard)
- **SC-004**: Touch interactions on mobile devices have 95% success rate (no missed taps due to small hit boxes)
- **SC-005**: Mouse interactions on desktop have 99% success rate (precise cursor control)
- **SC-006**: Status bars accurately reflect changes within 1 animation frame (visual synchronization)
- **SC-007**: Game state persists across browser sessions with 100% reliability (save system)
- **SC-008**: Time-based status decay calculates correctly for elapsed time periods up to 7 days (long-term save handling)
- **SC-009**: Players can successfully complete a care cycle (feed, groom, pet) from 0 to 100 on all statuses within 5 minutes (gameplay loop viability)
- **SC-010**: The game interface is fully usable on screens ranging from 320px (mobile) to 2560px (desktop) width (responsive design)
- **SC-011**: 90% of first-time players understand how to interact with the horse within 30 seconds without instructions (intuitive design)

## Assumptions

1. **Starting inventory**: 10 carrots and 100 brush uses provided at game start
2. **Brush mechanics**: Each grooming stroke consumes 1 brush use, allowing 100 total strokes before depletion
3. **Decay rates**: Assuming reasonable decay rates (suggestions: Hunger -1 per 6 seconds, Cleanliness -1 per 12 seconds, Happiness -1 per 7.5 seconds = all reach 0 in ~10 minutes if completely neglected)
4. **No game over**: Assuming horse cannot die or game end - status at 0 just means horse looks sad but gameplay continues
5. **Single horse**: MVP features one horse only, no multiple horses or selection
6. **No mini-games**: Care actions are direct interactions, no complex mini-games for feeding/grooming
7. **No progression system**: MVP has no levels, unlocks, or achievements - pure care simulation
8. **No monetization**: MVP is free to play with no currency, shops, or IAP
9. **Single player only**: No multiplayer, leaderboards, or social features in MVP

## Out of Scope (Future Features)

- Multiple horses to care for simultaneously
- Horse customization (color, breed, accessories)
- Mini-games for care activities (e.g., brushing rhythm game)
- Shop system for purchasing more items
- Currency/economy system
- Progression/leveling system
- Achievements and rewards
- Daily challenges or quests
- Social features (visit friends' horses, sharing)
- Sound effects and background music (audio layer)
- Advanced animations (blinking, tail swishing while idle)
- Environmental elements (stable, pasture backgrounds)
- Weather or time-of-day systems
- Mobile app version (PWA only for MVP)
- Multiple save slots/profiles
- Settings menu (volume, controls customization)
