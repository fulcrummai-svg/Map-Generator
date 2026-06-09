import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

enum Tile {
  Water = '🟦',
  Land = '🟩',
  Beach = '🏖️',
  SmallMountain = '⛰️',
  LargeMountain = '🏔️',
}

function generateMap(WIDTH: number, HEIGHT: number): string {
  let grid: Tile[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(Tile.Water));
  
  const centerX = Math.floor(WIDTH / 2);
  const centerY = Math.floor(HEIGHT / 2);
  const maxDist = Math.min(WIDTH, HEIGHT) * 0.56;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const pLand = 1 - (distFromCenter / maxDist);
      grid[y][x] = Math.random() < pLand ? Tile.Land : Tile.Water;
    }
  }

  for (let i = 0; i < 4; i++) {
    let newGrid: Tile[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(Tile.Water));
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
  const waterBodySize: number[][] = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(0));
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === Tile.Water && !visited[y][x]) {
        let size = 0;
        const queue: [number, number][] = [[x, y]];
        const currentBody: [number, number][] = [];
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
  const queueToWater: [number, number][] = [];
  
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
        const maxDim = Math.max(WIDTH, HEIGHT);
        const mapArea = WIDTH * HEIGHT;
        const beachWaterThreshold = Math.max(4, Math.floor(mapArea * 0.016));
        const smallMountainStart = Math.max(2, Math.floor(maxDim * 0.2));
        const largeMountainStart = Math.max(3, Math.floor(maxDim * 0.28));

        if (d === 1 || d === 2 && maxDim > 50) {
          let isLargeWaterAdjacent = false;
          const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
              if (grid[ny][nx] === Tile.Water && waterBodySize[ny][nx] > beachWaterThreshold) {
                isLargeWaterAdjacent = true;
                break;
              }
            }
          }
          if (isLargeWaterAdjacent) {
            grid[y][x] = Tile.Beach;
          }
        } else if (d >= smallMountainStart && d <= largeMountainStart) {
          grid[y][x] = Tile.SmallMountain;
        } else if (d > largeMountainStart) {
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

export default function App() {
  const [mapText, setMapText] = useState('');
  const [width, setWidth] = useState(25);
  const [height, setHeight] = useState(25);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: Math.floor(25 / 2), y: Math.floor(25 / 2) });

  useEffect(() => {
    setMapText(generateMap(width, height));
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walkX;
      scrollRef.current.scrollTop = scrollTop - walkY;
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove, { passive: false });
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, startX, startY, scrollLeft, scrollTop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't move if typing in inputs
      if (document.activeElement?.tagName === 'INPUT') return;
      
      setPlayerPos(prev => {
        let { x, y } = prev;
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') y--;
        else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') y++;
        else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') x--;
        else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') x++;
        else return prev;

        x = Math.max(0, Math.min(width - 1, x));
        y = Math.max(0, Math.min(height - 1, y));
        return { x, y };
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [width, height]);

  useEffect(() => {
    const tileEl = document.getElementById(`tile-${playerPos.y}-${playerPos.x}`);
    if (tileEl && scrollRef.current) {
      const container = scrollRef.current;
      const containerRect = container.getBoundingClientRect();
      const tileRect = tileEl.getBoundingClientRect();
      
      const targetX = container.scrollLeft + (tileRect.left - containerRect.left) + tileRect.width / 2 - containerRect.width / 2;
      const targetY = container.scrollTop + (tileRect.top - containerRect.top) + tileRect.height / 2 - containerRect.height / 2;

      const startX = container.scrollLeft;
      const startY = container.scrollTop;
      const startTime = performance.now();
      const duration = 200;

      const animateScroll = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Cubic easeOut

        container.scrollLeft = startX + (targetX - startX) * ease;
        container.scrollTop = startY + (targetY - startY) * ease;

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        }
      };

      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    }
  }, [playerPos]);

  const handleGenerate = () => {
    setMapText(generateMap(width, height));
    setPlayerPos({ x: Math.floor(width / 2), y: Math.floor(height / 2) });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505]">
      <main className="flex-1 flex overflow-hidden">
        <section className="flex-1 relative flex flex-col bg-[#070708]">
          <div
            ref={scrollRef}
            className={`flex-1 overflow-auto no-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
          >
            <div className="w-max h-max min-w-full min-h-full p-8 pb-40">
              <div className="w-max mx-auto p-8 rounded-xl border-glow bg-[#0a0a0c] mt-8 sm:mt-16">
                <div className="map-grid pointer-events-none text-[10px] sm:text-[15px] leading-tight text-white/90 font-mono flex flex-col items-center justify-center">
                {mapText.split('\n').map((line, i) => {
                if (line.startsWith('+')) {
                  const dashes = Array.from(line.slice(1, -1));
                  return (
                    <div key={i} className="flex">
                      <span className="w-[0.8em] flex items-center justify-center text-gray-500">+</span>
                      {dashes.map((char, j) => (
                        <span key={j} className="w-[0.625em] flex items-center justify-center text-gray-500">
                          {char}
                        </span>
                      ))}
                      <span className="w-[0.8em] flex items-center justify-center text-gray-500">+</span>
                    </div>
                  );
                }
                const chars: string[] = [];
                Array.from(line).forEach(c => {
                  if (c === '\uFE0F') chars[chars.length - 1] += c;
                  else chars.push(c);
                });
                return (
                  <div key={i} className="flex">
                    {chars.map((char, j) => (
                      <span id={`tile-${i - 1}-${j - 1}`} key={j} className={`relative flex items-center justify-center ${char === '|' ? 'w-[0.8em] text-gray-500' : 'w-[1.25em]'}`}>
                        <span className="select-none">{char}</span>
                        {char !== '|' && i - 1 === playerPos.y && j - 1 === playerPos.x && (
                          <motion.span layoutId="player-token" transition={{ type: "tween", ease: "easeOut", duration: 0.2 }} id="player-token" className="absolute inset-0 flex items-center justify-center z-10 drop-shadow-lg pb-1 pointer-events-none select-none text-[1.1em]">📍</motion.span>
                        )}
                      </span>
                    ))}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#0a0a0c] p-4 rounded-xl border-glow backdrop-blur-md shadow-2xl z-10 w-max">
            <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/10 rounded-sm px-3">
              <span className="text-xs text-gray-500 font-mono">X:</span>
              <input 
                type="number" 
                value={width}
                onChange={(e) => setWidth(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="bg-transparent text-white text-xs font-mono w-12 outline-none py-2"
                min="1"
                max="100"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/10 rounded-sm px-3">
              <span className="text-xs text-gray-500 font-mono">Y:</span>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="bg-transparent text-white text-xs font-mono w-12 outline-none py-2"
                min="1"
                max="100"
              />
            </div>
            <button 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
              onClick={handleGenerate}
            >
              Regenerate Landscape
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
