const WIDTH = 25;
const HEIGHT = 25;

const Tile = {
  Water: '🟦',
  Land: '🟩',
  Beach: '🏖',
  SmallMountain: '🏔',
  LargeMountain: '⛰',
};

function generateMap() {
  let grid = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(Tile.Water));
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const distFromCenter = Math.sqrt(Math.pow(x - 12, 2) + Math.pow(y - 12, 2));
      const pLand = 1 - (distFromCenter / 14);
      grid[y][x] = Math.random() < pLand ? Tile.Land : Tile.Water;
    }
  }

  for (let i = 0; i < 4; i++) {
    let newGrid = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(Tile.Water));
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let landNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            let ny = y + dy;
            let nx = x + dx;
            if (ny >= 0 && ny < HEIGHT && nx >= 0 && nx < WIDTH) {
              if (grid[ny][nx] !== Tile.Water) landNeighbors++;
            }
          }
        }
        if (grid[y][x] !== Tile.Water) {
          newGrid[y][x] = landNeighbors >= 3 ? Tile.Land : Tile.Water;
        } else {
          newGrid[y][x] = landNeighbors >= 5 ? Tile.Land : Tile.Water;
        }
      }
    }
    grid = newGrid;
  }

  const visited = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(false));
  const waterBodySize = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(0));
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === Tile.Water && !visited[y][x]) {
        let size = 0;
        const queue = [[x, y]];
        const currentBody = [];
        visited[y][x] = true;
        
        let head = 0;
        while (head < queue.length) {
          const [cx, cy] = queue[head++];
          currentBody.push([cx, cy]);
          size++;
          
          const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0]];
          for (const [dx, dy] of neighbors) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
              if (grid[ny][nx] === Tile.Water && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
              }
            }
          }
        }
        
        for (const [cx, cy] of currentBody) {
          waterBodySize[cy][cx] = size;
        }
      }
    }
  }

  const distToWater = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(Infinity));
  const queueToWater = [];
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === Tile.Water) {
        distToWater[y][x] = 0;
        queueToWater.push([x, y]);
      }
    }
  }
  
  let qIdx = 0;
  while(qIdx < queueToWater.length) {
    const [cx, cy] = queueToWater[qIdx++];
    const d = distToWater[cy][cx];
    const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of neighbors) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
        if (distToWater[ny][nx] === Infinity) {
          distToWater[ny][nx] = d + 1;
          queueToWater.push([nx, ny]);
        }
      }
    }
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === Tile.Land) {
        const d = distToWater[y][x];
        if (d === 1) {
          let isLargeWaterAdjacent = false;
          const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
              if (grid[ny][nx] === Tile.Water && waterBodySize[ny][nx] > 10) {
                isLargeWaterAdjacent = true;
                break;
              }
            }
          }
          if (isLargeWaterAdjacent) {
            grid[y][x] = Tile.Beach;
          }
        } else if (d >= 5 && d <= 7) {
          grid[y][x] = Tile.SmallMountain;
        } else if (d > 7) {
          grid[y][x] = Tile.LargeMountain;
        }
      }
    }
  }

  const border = '+' + '-'.repeat(WIDTH * 2) + '+';
  let output = border + '\n';
  for (let y = 0; y < HEIGHT; y++) {
    output += '|';
    for (let x = 0; x < WIDTH; x++) {
      output += grid[y][x];
    }
    output += '|\n';
  }
  output += border;
  
  return output;
}

console.log(generateMap());
