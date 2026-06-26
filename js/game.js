// ═══════════════════════════════════════════════════════════════════
// PAC-STORE — Game Engine (Canvas Rendering, Movement, Warps)
// ═══════════════════════════════════════════════════════════════════

import { TILE, FLOORS, CHECKOUT, START_POS, ENEMY_PATHS, getLayout, WARP_PAIRS } from './store-map.js';

const TILE_SIZE = 24;
const PACMAN_RADIUS = TILE_SIZE / 2.5;
const GHOST_RADIUS = TILE_SIZE / 3;
const ANIM_SPEED = 120; // ms per move step

// ─── GAME STATE ─────────────────────────────────────────────────────
class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentFloor = '1F';
    this.pacmanRow = START_POS.row;
    this.pacmanCol = START_POS.col;
    this.pacmanDir = { dr: 0, dc: 1 }; // facing right
    this.pacmanMouth = 0; // for animation
    this.isMoving = false;

    this.score = 0;
    this.steps = 0;
    this.lives = 3;
    this.timer = 0;
    this.timerInterval = null;
    this.gameOver = false;
    this.gameWon = false;

    // Dots collected per floor
    this.collectedDots = { '1F': new Set(), 'B1': new Set() };
    this.totalDots = this._countTotalDots();

    // Shopping route
    this.routePath = [];
    this.routeIndex = 0;
    this.shoppingList = [];
    this.collectedItems = [];
    this.currentTarget = null;
    this.runActive = false;

    // Step mode
    this.stepMode = false;
    this.pendingSteps = 0;

    // Ghosts
    this.ghosts = [];
    this._initGhosts();

    // Warp animation
    this.warping = false;
    this.warpAnimProgress = 0;

    // Status message
    this.statusMessage = '';
    this.statusTimeout = null;
  }

  _countTotalDots() {
    let count = 0;
    for (const floor of Object.values(FLOORS)) {
      for (const row of floor.layout) {
        for (const cell of row) {
          if (cell === TILE.DOT || cell === TILE.POWER_PELLET) count++;
        }
      }
    }
    return count;
  }

  _initGhosts() {
    this.ghosts = [];
    const colors = ['#ff4444', '#ff66cc', '#00ffff', '#ffaa00'];
    const names = ['Blinky', 'Pinky', 'Inky', 'Clyde'];

    for (let i = 0; i < 4; i++) {
      const path = ENEMY_PATHS['1F'][i % ENEMY_PATHS['1F'].length];
      this.ghosts.push({
        name: names[i],
        color: colors[i],
        row: path[0].row,
        col: path[0].col,
        path: [...path],
        pathIndex: 0,
        speed: 400 + i * 50, // ms between moves
        lastMove: 0,
        floor: '1F',
      });
    }
  }
}

// ─── GAME CONTROLLER ─────────────────────────────────────────────────
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = new GameState();
    this.onStateChange = null;
    this._animFrame = null;
    this._lastAnimTime = 0;
    this._lastGhostMove = 0;
    this._lastPacMove = 0;
    this._boundKeyHandler = this._handleKey.bind(this);
    this._boundTouchHandler = this._handleTouch.bind(this);
    this._touchStartX = 0;
    this._touchStartY = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────

  /**
   * Set callback for state changes (HUD updates).
   */
  setStateChangeCallback(cb) {
    this.onStateChange = cb;
  }

  /**
   * Start the game loop.
   */
  start() {
    this._lastAnimTime = performance.now();
    window.addEventListener('keydown', this._boundKeyHandler);
    this.canvas.addEventListener('touchstart', this._boundTouchHandler, { passive: false });
    this.canvas.addEventListener('touchend', this._boundTouchHandler, { passive: false });
    this._startTimer();
    this._loop(this._lastAnimTime);
    this._emitState();
  }

  /**
   * Stop the game loop and clean up.
   */
  stop() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    window.removeEventListener('keydown', this._boundKeyHandler);
    this.canvas.removeEventListener('touchstart', this._boundTouchHandler);
    this.canvas.removeEventListener('touchend', this._boundTouchHandler);
  }

  /**
   * Set the shopping route path.
   */
  setRoute(path, shoppingList) {
    this.state.routePath = path;
    this.state.shoppingList = shoppingList;
    this.state.routeIndex = 0;
    this.state.runActive = true;
    this.state.collectedItems = [];
    this._updateCurrentTarget();
    this._emitState();
  }

  /**
   * Toggle step mode on/off.
   */
  toggleStepMode() {
    this.state.stepMode = !this.state.stepMode;
    this.state.pendingSteps = 0;
    this._emitState();
    return this.state.stepMode;
  }

  /**
   * Handle a detected step from pedometer.
   */
  onStep() {
    if (this.state.stepMode && this.state.runActive && !this.state.gameOver) {
      this.state.pendingSteps++;
    }
  }

  /**
   * Resize canvas to fit container.
   */
  resize() {
    const container = this.canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const maxW = rect.width - 4;
    const maxH = Math.min(window.innerHeight - 220, 600);

    const layout = getLayout(this.state.currentFloor);
    const mapCols = layout[0].length;
    const mapRows = layout.length;

    const scaleW = maxW / mapCols;
    const scaleH = maxH / mapRows;
    const scale = Math.min(scaleW, scaleH, TILE_SIZE);

    this._tileSize = Math.floor(scale);
    this.canvas.width = this._tileSize * mapCols;
    this.canvas.height = this._tileSize * mapRows;
  }

  /**
   * Show a floating status message.
   */
  showStatus(msg, duration = 2000) {
    this.state.statusMessage = msg;
    if (this.state.statusTimeout) clearTimeout(this.state.statusTimeout);
    this.state.statusTimeout = setTimeout(() => {
      this.state.statusMessage = '';
      this._emitState();
    }, duration);
    this._emitState();
  }

  /**
   * Get current state (for HUD).
   */
  getState() {
    return {
      floor: this.state.currentFloor,
      steps: this.state.steps,
      score: this.state.score,
      lives: this.state.lives,
      timer: this.state.timer,
      dotsCollected: this._getTotalCollectedDots(),
      totalDots: this.state.totalDots,
      currentProduct: this.state.currentTarget?.name || '',
      statusMessage: this.state.statusMessage,
      gameOver: this.state.gameOver,
      gameWon: this.state.gameWon,
      stepMode: this.state.stepMode,
      runActive: this.state.runActive,
      collectedItems: this.state.collectedItems,
    };
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────

  _getTotalCollectedDots() {
    let total = 0;
    for (const floor of Object.keys(this.state.collectedDots)) {
      total += this.state.collectedDots[floor].size;
    }
    return total;
  }

  _startTimer() {
    if (this.state.timerInterval) clearInterval(this.state.timerInterval);
    this.state.timerInterval = setInterval(() => {
      if (!this.state.gameOver && !this.state.warping) {
        this.state.timer++;
        this._emitState();
      }
    }, 1000);
  }

  _emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  _updateCurrentTarget() {
    if (this.state.routeIndex < this.state.routePath.length) {
      this.state.currentTarget = this.state.routePath[this.state.routeIndex];
    } else {
      this.state.currentTarget = null;
    }
  }

  // ─── INPUT ────────────────────────────────────────────────────────

  _handleKey(e) {
    if (this.state.gameOver || this.state.warping) return;

    const keyMap = {
      ArrowUp: { dr: -1, dc: 0 },
      ArrowDown: { dr: 1, dc: 0 },
      ArrowLeft: { dr: 0, dc: -1 },
      ArrowRight: { dr: 0, dc: 1 },
      w: { dr: -1, dc: 0 },
      W: { dr: -1, dc: 0 },
      s: { dr: 1, dc: 0 },
      S: { dr: 1, dc: 0 },
      a: { dr: 0, dc: -1 },
      A: { dr: 0, dc: -1 },
      d: { dr: 0, dc: 1 },
      D: { dr: 0, dc: 1 },
    };

    const dir = keyMap[e.key];
    if (dir) {
      e.preventDefault();
      this._movePacman(dir.dr, dir.dc);
    }
  }

  _handleTouch(e) {
    if (this.state.gameOver || this.state.warping) return;

    if (e.type === 'touchstart') {
      e.preventDefault();
      this._touchStartX = e.touches[0].clientX;
      this._touchStartY = e.touches[0].clientY;
    } else if (e.type === 'touchend') {
      e.preventDefault();
      const dx = (e.changedTouches[0]?.clientX || 0) - this._touchStartX;
      const dy = (e.changedTouches[0]?.clientY || 0) - this._touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < 10 && absDy < 10) return; // Too small

      if (absDx > absDy) {
        this._movePacman(0, dx > 0 ? 1 : -1);
      } else {
        this._movePacman(dy > 0 ? 1 : -1, 0);
      }
    }
  }

  // ─── MOVEMENT ─────────────────────────────────────────────────────

  _movePacman(dr, dc) {
    const state = this.state;
    const layout = getLayout(state.currentFloor);

    const newRow = state.pacmanRow + dr;
    const newCol = state.pacmanCol + dc;

    // Boundary check
    if (newRow < 0 || newRow >= layout.length || newCol < 0 || newCol >= layout[0].length) return;

    const targetTile = layout[newRow][newCol];

    // Wall check
    if (targetTile === TILE.WALL) return;

    state.pacmanDir = { dr, dc };
    state.pacmanRow = newRow;
    state.pacmanCol = newCol;
    state.steps++;
    state.isMoving = true;

    // Handle tile effects
    this._handleTileEffect(newRow, newCol, targetTile);

    // If running a route, advance the route index
    if (state.runActive && state.routePath.length > 0) {
      const nextWaypoint = state.routePath[state.routeIndex];
      if (nextWaypoint && nextWaypoint.row === newRow && nextWaypoint.col === newCol) {
        state.routeIndex++;
        this._updateCurrentTarget();

        // Check if we collected a product
        if (nextWaypoint.action === 'warp') {
          this._triggerWarp(nextWaypoint);
        }

        // Check if we finished the route
        if (state.routeIndex >= state.routePath.length) {
          this._onRouteComplete();
        }
      }
    }

    this._emitState();
  }

  _handleTileEffect(row, col, tile) {
    const state = this.state;
    const floor = state.currentFloor;
    const dotKey = `${row},${col}`;

    switch (tile) {
      case TILE.DOT:
      case TILE.POWER_PELLET:
        if (!state.collectedDots[floor].has(dotKey)) {
          state.collectedDots[floor].add(dotKey);
          state.score += tile === TILE.POWER_PELLET ? 50 : 10;
        }
        break;

      case TILE.WARP:
        // Warp is handled via route, but free movement can also trigger
        if (!state.runActive) {
          this._triggerFreeWarp(row, col);
        }
        break;

      case TILE.CHECKOUT:
        if (state.runActive && state.collectedItems.length >= state.shoppingList.length) {
          this._onCheckoutReached();
        } else if (!state.runActive) {
          this.showStatus('🏁 Add items & start a run to check out!');
        }
        break;

      case TILE.PRODUCT:
        // Products are collected via route waypoints
        break;
    }
  }

  _triggerWarp(warpPoint) {
    const state = this.state;
    state.warping = true;
    state.warpAnimProgress = 0;

    const targetFloor = warpPoint.floor;

    // Animate warp over ~600ms
    const animStart = performance.now();
    const animDuration = 600;

    const animateWarp = (now) => {
      const elapsed = now - animStart;
      state.warpAnimProgress = Math.min(elapsed / animDuration, 1);

      if (state.warpAnimProgress >= 1) {
        state.warping = false;
        state.currentFloor = targetFloor;
        state.warpAnimProgress = 0;
        this.resize();
        this.showStatus(`🌀 Warped to ${FLOORS[targetFloor].name}!`);
        this._emitState();
        return;
      }

      this._emitState();
      requestAnimationFrame(animateWarp);
    };

    requestAnimationFrame(animateWarp);
  }

  _triggerFreeWarp(row, col) {
    // Find the nearest warp pair for this position
    let bestWarp = null;
    let bestDist = Infinity;
    for (const pair of WARP_PAIRS) {
      for (const warp of [pair.from, pair.to]) {
        if (warp.floor !== this.state.currentFloor) continue;
        const dist = Math.abs(row - warp.row) + Math.abs(col - warp.col);
        if (dist < bestDist) {
          bestDist = dist;
          bestWarp = warp;
        }
      }
    }
    if (bestWarp && bestDist <= 1) {
      // Find the paired warp destination
      for (const pair of WARP_PAIRS) {
        if (pair.from.floor === bestWarp.floor && pair.from.row === bestWarp.row && pair.from.col === bestWarp.col) {
          this._triggerWarp({ floor: pair.to.floor, row: pair.to.row, col: pair.to.col, action: 'warp' });
          return;
        }
        if (pair.to.floor === bestWarp.floor && pair.to.row === bestWarp.row && pair.to.col === bestWarp.col) {
          this._triggerWarp({ floor: pair.from.floor, row: pair.from.row, col: pair.from.col, action: 'warp' });
          return;
        }
      }
    }
    this.showStatus('🌀 Step on a warp tile to teleport!');
  }

  _onRouteComplete() {
    const state = this.state;
    // Check if all items collected
    const allCollected = state.collectedItems.length >= state.shoppingList.length;
    if (allCollected) {
      this.showStatus('🏁 All items collected! Head to checkout!');
    }
  }

  _onCheckoutReached() {
    const state = this.state;
    state.gameOver = true;
    state.gameWon = true;
    if (state.timerInterval) clearInterval(state.timerInterval);
    this.showStatus(`🎉 YOU WON! Score: ${state.score} | Time: ${this._formatTime(state.timer)}`, 5000);
    this._emitState();
  }

  // ─── GHOST COLLISION ──────────────────────────────────────────────

  _checkGhostCollision() {
    const state = this.state;
    for (const ghost of state.ghosts) {
      if (ghost.floor !== state.currentFloor) continue;
      if (ghost.row === state.pacmanRow && ghost.col === state.pacmanCol) {
        this._onGhostHit();
        return;
      }
    }
  }

  _onGhostHit() {
    const state = this.state;
    state.lives--;
    if (state.lives <= 0) {
      state.lives = 0;
      state.gameOver = true;
      state.gameWon = false;
      if (state.timerInterval) clearInterval(state.timerInterval);
      this.showStatus('💀 GAME OVER! Ghosts got you!', 5000);
    } else {
      this.showStatus('💥 Ouch! Lost a life!');
      // Reset Pac-Man position
      state.pacmanRow = START_POS.row;
      state.pacmanCol = START_POS.col;
    }
    this._emitState();
  }

  // ─── GAME LOOP ────────────────────────────────────────────────────

  _loop(timestamp) {
    const state = this.state;

    if (!state.gameOver) {
      const dt = timestamp - this._lastAnimTime;
      this._lastAnimTime = timestamp;

      // Step mode: process pending steps
      if (state.stepMode && state.pendingSteps > 0 && state.runActive) {
        state.pendingSteps--;
        this._autoMoveOneStep();
      }

      // Move ghosts
      this._updateGhosts(timestamp);

      // Check collisions
      this._checkGhostCollision();

      // Animate Pac-Man mouth
      state.pacmanMouth = (state.pacmanMouth + dt * 0.005) % 1;
    }

    this._render();
    this._animFrame = requestAnimationFrame((t) => this._loop(t));
  }

  _autoMoveOneStep() {
    if (!this.state.runActive || this.state.routeIndex >= this.state.routePath.length) return;
    const wp = this.state.routePath[this.state.routeIndex];
    const dr = wp.row - this.state.pacmanRow;
    const dc = wp.col - this.state.pacmanCol;
    this._movePacman(Math.sign(dr), Math.sign(dc));
  }

  _updateGhosts(timestamp) {
    const state = this.state;
    for (const ghost of state.ghosts) {
      if (ghost.floor !== state.currentFloor) continue;
      if (timestamp - ghost.lastMove < ghost.speed) continue;

      ghost.lastMove = timestamp;
      ghost.pathIndex = (ghost.pathIndex + 1) % ghost.path.length;
      const next = ghost.path[ghost.pathIndex];
      ghost.row = next.row;
      ghost.col = next.col;
    }
  }

  // ─── RENDERING ────────────────────────────────────────────────────

  _render() {
    const ctx = this.ctx;
    const state = this.state;
    const ts = this._tileSize;
    const layout = getLayout(state.currentFloor);
    const rows = layout.length;
    const cols = layout[0].length;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Warp animation effect
    if (state.warping) {
      const progress = state.warpAnimProgress;
      const alpha = 1 - Math.abs(Math.sin(progress * Math.PI));
      ctx.globalAlpha = Math.max(0.3, alpha);
      const spin = progress * Math.PI * 4;
      ctx.save();
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      ctx.rotate(spin * (1 - progress));
      ctx.scale(1 - progress * 0.5, 1 - progress * 0.5);
      ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }

    // Draw map tiles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * ts;
        const y = r * ts;
        const tile = layout[r][c];
        const dotKey = `${r},${c}`;

        switch (tile) {
          case TILE.WALL:
            ctx.fillStyle = '#1a1a5e';
            ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
            ctx.strokeStyle = 'rgba(51, 51, 255, 0.3)';
            ctx.strokeRect(x + 1, y + 1, ts - 2, ts - 2);
            break;

          case TILE.DOT:
            if (!state.collectedDots[state.currentFloor]?.has(dotKey)) {
              ctx.fillStyle = '#ffffaa';
              ctx.beginPath();
              ctx.arc(x + ts / 2, y + ts / 2, ts / 8, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case TILE.POWER_PELLET:
            if (!state.collectedDots[state.currentFloor]?.has(dotKey)) {
              ctx.fillStyle = '#ffff00';
              ctx.shadowColor = '#ffff00';
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(x + ts / 2, y + ts / 2, ts / 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
            break;

          case TILE.PRODUCT:
            ctx.fillStyle = '#1a2a1a';
            ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
            ctx.fillStyle = '#00ff88';
            ctx.font = `${ts * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📦', x + ts / 2, y + ts / 2);
            break;

          case TILE.CHECKOUT:
            ctx.fillStyle = '#2a1a1a';
            ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
            ctx.fillStyle = '#ffaa00';
            ctx.font = `${ts * 0.6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🛒', x + ts / 2, y + ts / 2);
            break;

          case TILE.WARP:
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
            ctx.fillStyle = '#ff66cc';
            ctx.font = `${ts * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const pulse = Math.sin(performance.now() * 0.005) * 0.3 + 0.7;
            ctx.globalAlpha = pulse;
            ctx.fillText('🌀', x + ts / 2, y + ts / 2);
            ctx.globalAlpha = state.warping ? ctx.globalAlpha : 1;
            break;

          default:
            // EMPTY or ENEMY_PATH - dark background
            ctx.fillStyle = '#0a0a25';
            ctx.fillRect(x, y, ts, ts);
            break;
        }
      }
    }

    // Draw route path highlight
    if (state.runActive && state.routePath.length > 0 && !state.warping) {
      this._drawRoutePath();
    }

    // Draw ghosts
    for (const ghost of state.ghosts) {
      if (ghost.floor !== state.currentFloor) continue;
      this._drawGhost(ghost.row, ghost.col, ghost.color, ghost.name);
    }

    // Draw Pac-Man
    if (!state.warping || state.warpAnimProgress < 0.5) {
      this._drawPacman(state.pacmanRow, state.pacmanCol);
    }

    // Restore warp transform
    if (state.warping) {
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  _drawPacman(row, col) {
    const ctx = this.ctx;
    const ts = this._tileSize;
    const x = col * ts + ts / 2;
    const y = row * ts + ts / 2;
    const radius = PACMAN_RADIUS * (ts / TILE_SIZE);

    // Mouth angle based on animation
    const mouthOpen = Math.abs(Math.sin(this.state.pacmanMouth * Math.PI * 2)) * 0.25;
    let startAngle = mouthOpen;
    let endAngle = Math.PI * 2 - mouthOpen;

    // Rotate based on direction
    const dir = this.state.pacmanDir;
    let rotation = 0;
    if (dir.dr === -1) rotation = -Math.PI / 2;
    else if (dir.dr === 1) rotation = Math.PI / 2;
    else if (dir.dc === -1) rotation = Math.PI;
    // else right = 0

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Body
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Glow
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(radius * 0.25, -radius * 0.4, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawGhost(row, col, color, name) {
    const ctx = this.ctx;
    const ts = this._tileSize;
    const x = col * ts + ts / 2;
    const y = row * ts + ts / 2;
    const r = GHOST_RADIUS * (ts / TILE_SIZE);

    ctx.save();
    ctx.translate(x, y);

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r, Math.PI, 0);
    // Wavy bottom
    const waveCount = 3;
    const waveWidth = (r * 2) / waveCount;
    const baseY = r * 0.8;
    for (let i = 0; i < waveCount; i++) {
      const sx = -r + i * waveWidth;
      ctx.lineTo(sx + waveWidth / 2, baseY + r * 0.3);
      ctx.lineTo(sx + waveWidth, baseY);
    }
    ctx.closePath();
    ctx.fill();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#00f';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.4, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawRoutePath() {
    const ctx = this.ctx;
    const ts = this._tileSize;
    const state = this.state;
    const path = state.routePath;

    if (path.length < 2) return;

    // Draw dots for remaining path
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    for (let i = state.routeIndex; i < path.length; i++) {
      const p = path[i];
      if (p.floor !== state.currentFloor) continue;
      ctx.beginPath();
      ctx.arc(p.col * ts + ts / 2, p.row * ts + ts / 2, ts / 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw lines between consecutive path points
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    let started = false;
    for (let i = Math.max(0, state.routeIndex - 1); i < path.length; i++) {
      const p = path[i];
      if (p.floor !== state.currentFloor) continue;
      const px = p.col * ts + ts / 2;
      const py = p.row * ts + ts / 2;
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
