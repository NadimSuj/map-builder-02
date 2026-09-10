# Map Builder 2

A tile-based map editor with a draggable camera, pixel-art terrain tiles, 
and interactive visualization of three pathfinding algorithms on a weighted tile graph.

**Live demo:** https://nadimsuj.github.io/map-builder-02/

## Controls

| Action | Input |
|--------|-------|
| Paint a tile | Left click |
| Pan the camera | Right click + drag |
| Select a tile | Click tile in the toolbar strip |
| Place start node | Click "Set Start", then click a tile |
| Place end node | Click "Set End", then click a tile |
| Run pathfinding | Click BFS, Dijkstra's, or A* |
| Save map | Click Save (downloads a .json file) |
| Load map | Click Load (imports a .json file) |
| Reset | Click Clear |

## Pathfinding algorithms

All three algorithms visualize their search in real time before revealing the final path.

**BFS (Breadth-First Search)** explores outward in equal steps from the start node, 
ignoring tile movement costs. Finds the path with the fewest tiles, not necessarily 
the cheapest route.

**Dijkstra's Algorithm** accounts for tile movement costs and always finds the 
lowest-cost path. Explores in all directions weighted by cost, with no sense 
of which direction the goal is in.

**A\* Search** finds the same optimal least-cost path as Dijkstra's but uses 
Manhattan distance as a heuristic to prioritize exploration toward the goal. 
Explores fewer nodes than Dijkstra's on open layouts.

## Tile cost system

Pathfinding algorithms (except BFS) use movement costs when routing:

| Tile | Cost |
|------|------|
| Road (all variants) | 1 — fastest |
| Grass | 1 |
| Flowers | 2 |
| Park | 2 |
| Trees | 3 — slowest passable |
| Water | Impassable |
| Buildings | Impassable |
| Factory | Impassable |
| Truck / Plane | Impassable (decorative) |

## Technical highlights

- **HTML5 Canvas API** with a 2D camera system — the world is a 100×100 tile 
  grid (3200×3200px); only visible tiles are drawn each frame via viewport culling
- **Async image loading** via `Promise.all` — all 19 tile images load in parallel 
  before the first render
- **Weighted graph pathfinding** — three algorithms implemented from scratch 
  on a tile grid treated as a graph with variable edge costs
- **Step-recording animation** — algorithms run instantly and record their 
  exploration order; playback replays that history frame by frame via `setInterval`
- **Camera-stable overlays** — explored cells and path highlights are stored 
  in state arrays and redrawn each render frame, so they persist correctly 
  while panning
- **JSON file export/import** — maps save as downloadable `.json` files and 
  reload via the FileReader API, no backend required

## Tile assets

Pixel art tiles from [Kenney.nl](https://kenney.nl) — Tiny Battle asset pack (CC0 license).

## Tech

Vanilla JavaScript, HTML5 Canvas API, CSS. No frameworks, no build step, 
no dependencies. Open `index.html` in any browser and it runs.