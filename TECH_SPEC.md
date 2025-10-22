# Technical Specification: Rock Paper Scissors Battle Arena

## Overview

The Rock Paper Scissors Battle Arena is an interactive web-based game implemented in TypeScript. It simulates a battle between entities representing the classic rock-paper-scissors game where each entity moves autonomously, collides with others, and transforms based on the game's rules (rock beats scissors, scissors beats paper, paper beats rock).

## Architecture

The project follows a modular structure:
- `src/main.ts`: Main game loop, UI handling, and canvas rendering
- `src/engine.ts`: Game physics and battle logic
- `src/entity.ts`: Entity data structures and creation
- `src/style.css`: Styling and layout
- `index.html`: Main HTML structure
- Built with TypeScript, compiled to JavaScript for the browser

## Core Features

### 1. Entity System

**High-Level Description**: The entity system manages the lifecycle and state of all battle entities in the game. Each entity represents one of the three species and has autonomous movement properties.

**Implementation Details**:
- **Data Structure**: `Entity` interface in `entity.ts` defines properties: `id` (unique number), `species` (enum with Rock=0, Paper=1, Scissors=2), `x/y` coordinates, `vx/vy` velocity, and `radius` (fixed at 6px).
- **Creation**: `createEntity()` factory function generates entities with random initial velocity (`(Math.random() - 0.5) * 4` for balanced movement).
- **Storage**: Entities are stored in a mutable array `entities: Entity[]` in `main.ts`, updated each frame.

### 2. Battle Engine

**High-Level Description**: The battle engine drives the core gameplay by processing physics, collisions, and RPS transformation rules each simulation step.

**Implementation Details**:
- **Main Function**: `step()` in `engine.ts` executes once per frame, taking entity array, canvas dimensions, and optional play area bounds.
- **Physics Update**: Position updates with `e.x += e.vx; e.y += e.vy`, followed by wall bouncing with damping (`WALL_DAMPING = -0.8`).
- **Collision Detection**: Nested loops check distance between all entity pairs using `Math.hypot(dx, dy) < a.radius + b.radius`.
- **RPS Rules**: `getWinner()` function implements the transformation logic using a rules lookup table (`RULES: Record<Species, Species>`).
- **Entity Conversion**: Winner entity converts loser to its species (`b.species = a.species` if a wins).

### 3. User Entity Selection

**High-Level Description**: At game start, players select their preferred species, which determines victory/lose conditions upon game end.

**Implementation Details**:
- **UI Elements**: Three buttons in `entity-selection` div, each with data-entity attribute (0,1,2).
- **State Management**: `userSelectedEntity: Species | null` tracks selection, `gameState: 'entity-selection' | 'playing' | 'finished'` controls flow.
- **Event Handling**: Click listeners on choice buttons call `handleEntitySelection()`, which updates state and hides selection UI.
- **Victory Logic**: Game checks `userWon = userSelectedEntity === winner` when determining win/lose display.

### 4. Spawn Zone System

**High-Level Description**: Strategic spawning prevents chaotic startup and encourages balanced territorial battles.

**Implementation Details**:
- **Zone Definition**: Three predefined 80px zones in `init()`: rock (top-left), paper (top-right), scissors (bottom-center).
- **Random Distribution**: `Math.random() - 0.5) * zoneSize` scatters entities within each zone for natural variation.
- **Initialization**: Entity counts from slider values, entities created via `Array.from().map(createEntity)` pattern.

### 5. Space Crunch Mode

**High-Level Description**: After a time limit, the play area begins shrinking, creating pressure to secure victory before the space runs out.

**Implementation Details**:
- **Trigger**: `SUDDEN_DEATH_TIME = 45000` (45 seconds) activates space crunch when `elapsed >= SUDDEN_DEATH_TIME`.
- **Shrink Rate**: `shrinkRate = 10` pixels/second from each side, bounds calculated as `left: shrinkAmount, top: shrinkAmount, right: width-shrinkAmount`.
- **Engine Integration**: `playAreaBounds` passed to `step()` function, which uses bounds for wall detection instead of canvas edges.
- **Force End**: Game ends prematurely if play area area < 1000px².

### 6. Force Blast

**High-Level Description**: Players can strategically intervene by clicking/tapping the canvas to create explosive forces that push entities away.

**Implementation Details**:
- **Input Handling**: `handleForceBlast()` listens for click/touchstart on canvas, converts screen to canvas coordinates with scaling.
- **Cooldown System**: Prevents spam with `CANVAS_BLAST_COOLDOWN = 1000ms`, separate cooldown for button (3 seconds).
- **Force Calculation**: Distance-based falloff (`falloffFactor = 1 - (distance / BLAST_RADIUS)` with minimum 10%), applied as `entity.vx += forceX * 0.01`.
- **Visual Effects**: `blastEffects` array manages expanding circle animations with opacity fade over 500ms.

### 7. Adaptive Performance

**High-Level Description**: Ensures smooth gameplay across devices by dynamically adjusting entity count and update frequency based on device capabilities.

**Implementation Details**:
- **Device Detection**: `isMobile = window.innerWidth <= 768`, caps mobile entities at 60 (vs desktop 600).
- **Entity Scaling**: Total count scales down if exceeds mobile limit (`rock/paper/scissors = round(count * (60/total))`).
- **Frame Rate Optimization**: UI updates every 3rd frame (`frameCounter % 3 === 0`) on mobile to reduce CPU load.

### 8. Game State Management

**High-Level Description**: Structured state machine ensures proper game flow and prevents invalid operations.

**Implementation Details**:
- **State Enum**: `GameState = 'entity-selection' | 'playing' | 'finished'` with `gameState` variable in scope.
- **Transitions**: Selection → Playing (entity choice) → Finished (game end), back to Selection (restart).
- **Conditional Logic**: State checks throughout `main.ts` determine UI visibility (`entitySelection.classList.toggle('hidden')`) and valid actions.
- **UI Synchronization**: Different headers/instructions based on state (e.g., "Pick Rock/Paper/Scissors" vs "Tap screen to create ripples").

## Development and Deployment

**Build Process**: `npm run build` compiles TypeScript to `dist/main.js` using `tsc`. Dev server (`npm run start`) uses `live-server` on port 3000.

**Dependencies**: Core dev dependencies include `typescript`, `jest` for testing, `live-server` for development. No runtime dependencies - pure HTML5 canvas game.

**Testing**: Jest test suite in `tests/` directory validates core mechanics like battle engine and UI interactions.

**Performance Considerations**: Fixed 600x600 canvas with conditional entity limits prevents performance issues on mobile devices. Frame rate caps ensure consistent gameplay across hardware.

**Extensibility**: Modular architecture supports adding new entity types or power-ups by extending the Species enum and updating collision rules.
