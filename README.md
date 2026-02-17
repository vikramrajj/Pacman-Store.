# 🛒 Pac-Store: Gamified Shopping Assistant

[![Status](https://img.shields.io/badge/Status-Beta-blue?style=flat-square)](https://github.com/vkr-pacstore/pac-store)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Turn your grocery run into a retro game!** Pac-Store is a web app that gamifies your shopping list by navigating a Pac-Man character through a virtual store layout to find your real-world products.

## 🌟 Features

- **📝 Smart Shopping List**: Search & add products. Unknown items (like "Curd") are auto-assigned to "Mystery Aisles".
- **🗺️ TSP Routing**: Optimized pathfinding using the Traveling Salesperson Problem heuristic to guide you through the store in the shortest route.
- **👣 Step Mode (Pedometer)**: Syncs with your phone's accelerometer! Walk in real life to move Pac-Man forward in the game.
- **🧾 Checkout Goal**: The game ends at the checkout counter, unlocking only after you've collected all items.
- **🌀 Multi-Floor Warps**: Travel between the Ground Floor and Basement using warp tunnels!
- **📱 Responsive Layout**: Automatically fits to your screen size for optimal gameplay on any device.
- **👣 Step Mode (Pedometer)**: Syncs with your phone's accelerometer! Walk in real life to move Pac-Man forward in the game.

## 🚀 Quick Start

To run the game locally:

```bash
# Clone the repository
git clone https://github.com/vikramrajj/Pacman-Store.git
cd Pacman-Store

# Install dependencies (optional, for testing)
npm install

# Run the local server
npx -y serve . -l 3000
```

Open `http://localhost:3000` in your browser.

## 🎮 How to Play

1.  **Enter Store**: Click the "Enter Store" button on the landing page.
2.  **Build List**: Search for products (e.g., "Milk", "Bread") and add them to your list.
3.  **Start Run**: Click "Start Shopping Run!".
4.  **Navigate**: Use arrow keys (Desktop) or swipe (Mobile) to guide Pac-Man.
    *   **Step Mode**: Toggle "👣 ON" to walk in real life to move!
5.  **Win**: Collect all items and reach the Checkout Counter.

## 🛠️ Integration Guide

Want to customize the store for your own layout?

### 1. Modify the Map
Edit `js/store-map.js` to change the grid layout or add new products.

```javascript
// js/store-map.js
const STORE_LAYOUT = [
    [1, 1, 1, ...], // 1 = Wall, 0 = Path, 2 = Product Shelf
    ...
];

const PRODUCT_CATALOG = {
    "Milk": { row: 5, col: 10, zone: "Dairy" },
    "New Item": { row: 8, col: 15, zone: "Custom Zone" }
};
```

### 2. Pedometer API
The `Pedometer` module in `js/pedometer.js` broadcasts step events. You can hook into this for other fitness apps.

```javascript
import { pedometer } from './js/pedometer.js';

pedometer.start(() => {
    console.log("Step detected!");
    // Trigger your own game logic here
});
```

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📚 Documentation

For a detailed walkthrough of the latest features (Generic Items & Pedometer) and implementation details, see [WALKTHROUGH.md](WALKTHROUGH.md).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
