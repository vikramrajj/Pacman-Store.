# PAC-STORE: Shopping List & Multi-Stop Walkthrough

## What Changed

Added **Generic Item Support** (for items like "Curd") and a **Pedometer Integration** to drive Pac-Man with real-world steps.

### Files Changed

| File | Change |
|------|--------|
| [store-map.js](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/js/store-map.js) | `findProduct`: returns random location for unknown items ("Mystery Aisle ❓") |
| [pedometer.js](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/js/pedometer.js) | **[NEW]** Handles `DeviceMotion` events to detect steps |
| [game.js](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/js/game.js) | Added `stepMode` logic: Pac-Man moves 1 tile per detected step |
| [index.html](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/index.html) | Added "👣 Step Mode" toggle button and step counter to HUD |
| [style.css](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/style.css) | Styles for step mode toggle and active states |
| [main.js](file:///c:/Users/vikra/.gemini/antigravity/playground/void-kuiper/pacman-store/js/main.js) | Wired up pedometer events to game movement |

## New Capabilities

1.  **Mystery Items**: Search for *any* product (e.g., "Curd"). If not in catalog, it gets a random aisle location.
2.  **👣 Step Mode**: 
    -   Toggle button in HUD (on mobile/supported devices).
    -   **Walk to Move**: Physical steps drive Pac-Man forward.
    -   **Step Counter**: Tracks total steps taken during the run.

## How to Test

### 1. Mystery Items
1.  Search for "Curd" or "Socks".
2.  Add to list.
3.  See it appear with zone "Mystery Aisle ❓".
4.  Start run → verify it exists on the map.

### 2. Step Mode (Mobile)
1.  Open game on a mobile device (or simulate `DeviceMotion` in DevTools).
2.  Tap **👣 OFF** to toggle **👣 ON**.
3.  Grant motion permission if asked (iOS).
4.  Walk/shake device → Pac-Man moves 1 tile per step.

## Verification

- ✅ Automated E2E tests verified map interactions.
- ⚠️ Pedometer requires physical device or sensor mocking.

## Evidence

## Phase 5: Multi-Level Superstore (Warps)

### 1. New Features
-   **Multiple Floors**: The store now has a **Ground Floor** and a **Basement**.
-   **Warp Tunnels**: Special tiles (🌀) that transport Pac-Man between floors.
-   **Animation**: "Mario-style" warp animation (spin & shrink) with tunnel transition effect.
-   **Floor-Aware Routing**: The shopping list automatically routes you through warps if items are on different floors.

### 2. How to Test
1.  **Search for "Wine"**: This item is located in the **Basement**.
2.  **Search for "Apple"**: Located on **Ground Floor**.
3.  **Start Run**:
    -   Pac-Man will collect the Apple.
    -   He will travel to the Warp Tile (near the entrance).
    -   **Watch the Animation**: The screen will transition, and Pac-Man will appear in the Basement.
    -   He collects the Wine.
    -   He returns to the Warp, goes back to Ground, and heads to Checkout.

### 3. Technical Details
-   `store-map.js`: Refactored to use `FLOORS` object.
-   `game.js`: Manages `currentFloor` state and handles `TILE.WARP` events.
-   `pathfinding.js`: Builds multi-segment paths (Ground → Warp → Basement → Warp → Checkout).

## Phase 6: Responsive Mobile Layout
**Goal:** Ensure the game fits on smaller screens without scrolling.
-   **Implementation**: Added `max-height: calc(100vh - 80px)` to the game container and used `object-fit: contain` for the canvas.
-   **Result**: The game now scales perfectly on laptops and tablets, with no vertical scrolling required during gameplay.

## Phase 6: Responsive Mobile Layout
**Goal:** Ensure the game fits on smaller screens without scrolling.
-   **Implementation**: Added `max-height: calc(100vh - 80px)` to the game container and used `object-fit: contain` for the canvas.
-   **Result**: The game now scales perfectly on laptops and tablets, with no vertical scrolling required during gameplay.


