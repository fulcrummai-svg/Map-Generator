# Procedural Map Generator

A web-based procedural map generator and explorer built with React, Vite, and Tailwind CSS. The application creates a grid-based ASCII art map containing various biomes like water, beaches, land, and mountains. 

## Features

- **Procedural Generation**: Generates maps dynamically using a randomized cellular automaton / distance-based generation algorithm.
- **Biomes**: Features multiple terrain types represented by emojis:
  - 🟦 Water
  - 🟩 Land
  - 🏖️ Beach
  - ⛰️ Small Mountains
  - 🏔️ Large Mountains
- **Interactive Player Exploration**: Move around the map using a player avatar (📍).
  - Use `W`, `A`, `S`, `D` or the `Arrow Keys` to move.
- **Camera Tracking**: The camera smoothly pans to follow the player as they explore the map.
- **Customizable Dimensions**: Use the UI sliders to adjust the map's width and height.
- **Drag-to-Pan**: Click and drag on the map surface to freely explore it.

## Technical Details

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (`motion/react`) for smooth camera transitions and player movement animations.
- **State Management**: React Hooks (`useState`, `useEffect`, `useRef`).
- **Generation Algorithm**: 
  - Creates a base landmass using distance from the center.
  - Expands the landmass using a recursive expansion technique for naturalistic shapes.
  - Determines distance to water iteratively.
  - Applies biome types (Beach, Mountains) based on proximity to water and other terrain features.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 in your browser.

## Controls

- `W` / `Arrow Up`: Move Up
- `S` / `Arrow Down`: Move Down
- `A` / `Arrow Left`: Move Left
- `D` / `Arrow Right`: Move Right
- **Click & Drag**: Pan camera
