// ═══════════════════════════════════════════════════════════════════
// PAC-STORE — Main Entry Point (UI, Event Handling, Wiring)
// ═══════════════════════════════════════════════════════════════════

import { Game } from './game.js';
import { pedometer } from './pedometer.js';
import { findProduct, getProductSuggestions, CHECKOUT, START_POS, FLOORS } from './store-map.js';
import { planRoute } from './pathfinding.js';

// ═══════════════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════════════
const landingScreen = document.getElementById('landing-screen');
const gameScreen = document.getElementById('game-screen');
const enterStoreBtn = document.getElementById('enter-store-btn');
const gameCanvas = document.getElementById('game-canvas');

// Shopping list elements
const productSearch = document.getElementById('product-search');
const addBtn = document.getElementById('add-btn');
const suggestionsEl = document.getElementById('suggestions');
const listItemsEl = document.getElementById('list-items');
const listEmpty = document.getElementById('list-empty');
const listCount = document.getElementById('list-count');
const startRunBtn = document.getElementById('start-run-btn');
const clearListBtn = document.getElementById('clear-list-btn');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// HUD elements
const stepCountEl = document.getElementById('step-count');
const floorDisplay = document.getElementById('floor-display');
const scoreEl = document.getElementById('score');
const dotsCountEl = document.getElementById('dots-count');
const currentProductEl = document.getElementById('current-product');
const timerEl = document.getElementById('timer');
const livesEl = document.getElementById('lives');
const statusMessage = document.getElementById('status-message');
const stepModeBtn = document.getElementById('step-mode-btn');

// ═══════════════════════════════════════════════════════════════════
// GAME INITIALIZATION
// ═══════════════════════════════════════════════════════════════════
let game;

function initGame() {
  game = new Game(gameCanvas);
  game.setStateChangeCallback(updateHUD);
  game.start();
}

// ═══════════════════════════════════════════════════════════════════
// LANDING SCREEN → GAME SCREEN TRANSITION
// ═══════════════════════════════════════════════════════════════════
function enterStore() {
  landingScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  initGame();
}

enterStoreBtn.addEventListener('click', () => {
  enterStore();
});

// ═══════════════════════════════════════════════════════════════════
// QR CODE GENERATION
// ═══════════════════════════════════════════════════════════════════
function generateQRCode() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = size;
  canvas.height = size;

  // Simple QR-like pattern (aesthetic placeholder)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Outer border
  ctx.fillStyle = '#0a0a1a';
  const moduleSize = size / 25;
  const modules = 21;
  const offset = (size - modules * moduleSize) / 2;

  // Generate a deterministic-looking pattern
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Position patterns (corners)
      const isFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= modules - 7) ||
        (r >= modules - 7 && c < 7);

      if (isFinder) {
        const inner = (r >= 2 && r < 5 && c >= 2 && c < 5) ||
                      (r >= 2 && r < 5 && c >= modules - 5 && c < modules - 2) ||
                      (r >= modules - 5 && r < modules - 2 && c >= 2 && c < 5);
        if (inner) {
          ctx.fillStyle = '#0a0a1a';
          ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(offset + c * moduleSize + 1, offset + r * moduleSize + 1, moduleSize - 2, moduleSize - 2);
          ctx.fillStyle = '#0a0a1a';
        } else {
          ctx.fillStyle = '#0a0a1a';
          ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize);
        }
      } else if (r === 6 || c === 6) {
        // Timing patterns
        ctx.fillStyle = (r + c) % 2 === 0 ? '#0a0a1a' : '#ffffff';
        ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize);
      } else {
        // Data area - pseudo-random based on position
        const val = ((r * 7 + c * 13) % 3) === 0;
        ctx.fillStyle = val ? '#0a0a1a' : '#ffffff';
        ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SHOPPING LIST MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
let shoppingList = [];

function addProduct(name) {
  if (!name || !name.trim()) return;

  const product = findProduct(name.trim());
  const item = {
    id: Date.now().toString(),
    name: product.name,
    zone: product.zone,
    isMystery: product.isMystery,
    location: {
      floor: product.floor,
      row: product.row,
      col: product.col,
    },
  };

  // Avoid duplicates
  if (shoppingList.some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
    game?.showStatus(`⚠️ "${item.name}" is already in your list!`);
    return;
  }

  shoppingList.push(item);
  renderShoppingList();
  productSearch.value = '';
  suggestionsEl.classList.add('hidden');
  productSearch.focus();
}

function removeProduct(id) {
  shoppingList = shoppingList.filter(item => item.id !== id);
  renderShoppingList();
}

function clearList() {
  shoppingList = [];
  renderShoppingList();
}

function renderShoppingList() {
  // Update count
  listCount.textContent = `${shoppingList.length} item${shoppingList.length !== 1 ? 's' : ''}`;

  // Clear existing items
  const existingItems = listItemsEl.querySelectorAll('.list-item');
  existingItems.forEach(el => el.remove());

  if (shoppingList.length === 0) {
    listEmpty.style.display = 'block';
    startRunBtn.disabled = true;
    progressSection.classList.add('hidden');
  } else {
    listEmpty.style.display = 'none';
    startRunBtn.disabled = false;

    for (const item of shoppingList) {
      const el = document.createElement('div');
      el.className = 'list-item';
      el.innerHTML = `
        <span style="font-size:14px;">${item.isMystery ? '❓' : '📦'}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:600;color:#fff;">${escapeHtml(item.name)}</div>
          <div style="font-size:10px;color:var(--text-muted);">
            ${escapeHtml(item.zone)} · ${item.location.floor}
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.id}" style="
          background:none;border:none;color:#ff4444;cursor:pointer;font-size:16px;padding:2px 6px;
        ">✕</button>
      `;
      listItemsEl.appendChild(el);
    }

    // Attach remove handlers
    listItemsEl.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeProduct(btn.dataset.id);
      });
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════
// AUTOCOMPLETE / SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════
productSearch.addEventListener('input', () => {
  const query = productSearch.value.trim();
  if (!query) {
    suggestionsEl.classList.add('hidden');
    return;
  }

  const suggestions = getProductSuggestions(query);
  if (suggestions.length === 0) {
    suggestionsEl.innerHTML = `
      <div class="suggestion-item" style="color:var(--neon-orange);">
        ✨ Add "${escapeHtml(query)}" as new item
      </div>
    `;
  } else {
    suggestionsEl.innerHTML = suggestions.map(s =>
      `<div class="suggestion-item" data-name="${escapeHtml(s)}">${escapeHtml(s)}</div>`
    ).join('');
  }
  suggestionsEl.classList.remove('hidden');
});

productSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = productSearch.value.trim();
    if (query) {
      addProduct(query);
    }
  }
});

suggestionsEl.addEventListener('click', (e) => {
  const item = e.target.closest('.suggestion-item');
  if (item) {
    const name = item.dataset.name || productSearch.value.trim();
    addProduct(name);
  }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.add-item-bar')) {
    suggestionsEl.classList.add('hidden');
  }
});

// ═══════════════════════════════════════════════════════════════════
// ADD & CLEAR BUTTONS
// ═══════════════════════════════════════════════════════════════════
addBtn.addEventListener('click', () => {
  const query = productSearch.value.trim();
  if (query) {
    addProduct(query);
  }
});

clearListBtn.addEventListener('click', () => {
  clearList();
});

// ═══════════════════════════════════════════════════════════════════
// START SHOPPING RUN
// ═══════════════════════════════════════════════════════════════════
startRunBtn.addEventListener('click', () => {
  if (shoppingList.length === 0 || !game) return;

  const productLocations = shoppingList.map(item => item.location);
  const { orderedStops, fullPath } = planRoute(START_POS, productLocations, CHECKOUT);

  if (!fullPath || fullPath.length === 0) {
    game.showStatus('⚠️ Cannot find a route! Check the map.');
    return;
  }

  game.setRoute(fullPath, shoppingList);

  // Update progress
  progressSection.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = `0/${shoppingList.length}`;

  game.showStatus('🛒 Route planned! Follow the yellow dots!');
});

// ═══════════════════════════════════════════════════════════════════
// STEP MODE TOGGLE
// ═══════════════════════════════════════════════════════════════════
let stepModeActive = false;

stepModeBtn.addEventListener('click', () => {
  if (!game) return;

  if (!stepModeActive) {
    // Enable step mode
    const supported = pedometer.start((count) => {
      game.onStep();
    });
    if (supported || true) {
      stepModeActive = true;
      game.toggleStepMode();
      stepModeBtn.textContent = '👣 ON';
      stepModeBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
      stepModeBtn.style.color = '#000';
    }
  } else {
    // Disable step mode
    stepModeActive = false;
    pedometer.stop();
    game.toggleStepMode();
    stepModeBtn.textContent = '👣 OFF';
    stepModeBtn.style.background = '';
    stepModeBtn.style.color = '';
  }
});

// ═══════════════════════════════════════════════════════════════════
// HUD UPDATE
// ═══════════════════════════════════════════════════════════════════
function updateHUD(state) {
  stepCountEl.textContent = state.steps;
  floorDisplay.textContent = state.floor;
  scoreEl.textContent = state.score;
  dotsCountEl.textContent = `${state.dotsCollected}/${state.totalDots}`;

  if (state.runActive && state.currentProduct) {
    currentProductEl.textContent = `🎯 ${state.currentProduct}`;
  } else if (state.gameWon) {
    currentProductEl.textContent = '🏆 YOU WIN!';
  } else if (state.gameOver) {
    currentProductEl.textContent = '💀 GAME OVER';
  } else {
    currentProductEl.textContent = 'Add items & start!';
  }

  // Timer
  const m = Math.floor(state.timer / 60);
  const s = state.timer % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

  // Lives
  livesEl.textContent = '❤️'.repeat(Math.max(0, state.lives));

  // Status message
  if (state.statusMessage) {
    statusMessage.textContent = state.statusMessage;
    statusMessage.classList.remove('hidden');
  } else {
    statusMessage.classList.add('hidden');
  }

  // Step mode button
  if (state.stepMode) {
    stepModeBtn.textContent = '👣 ON';
    stepModeBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
    stepModeBtn.style.color = '#000';
  } else {
    stepModeBtn.textContent = '👣 OFF';
    stepModeBtn.style.background = '';
    stepModeBtn.style.color = '';
  }

  // Progress bar
  if (state.runActive && state.collectedItems) {
    const total = shoppingList.length;
    const done = state.collectedItems.length;
    progressFill.style.width = total > 0 ? `${(done / total) * 100}%` : '0%';
    progressText.textContent = `${done}/${total}`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════
function init() {
  generateQRCode();
  renderShoppingList();
}

// Run on load
init();
