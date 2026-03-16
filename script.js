class Tile {
  constructor(value, x, y) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.previousPosition = null;
    this.mergedFrom = null;
    this.element = null;
    this.id = this._generateId();
  }

  _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Grid {
  constructor(size) {
    this.size = size;
    this.cells = [];
    this._init();
  }

  _init() {
    this.cells = Array.from({ length: this.size }, (_, y) =>
      Array.from({ length: this.size }, (_, x) => null)
    );
  }

  randomAvailableCell() {
    const cells = this.availableCells();
    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
    return null;
  }

  availableCells() {
    const cells = [];
    this.eachCell((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });
    return cells;
  }

  cellsAvailable() {
    return this.availableCells().length > 0;
  }

  cellAvailable(cell) {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell) {
    return !!this.cellContent(cell);
  }

  cellContent(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.y][cell.x];
    }
    return null;
  }

  insertTile(tile) {
    this.cells[tile.y][tile.x] = tile;
  }

  removeTile(tile) {
    this.cells[tile.y][tile.x] = null;
  }

  withinBounds(position) {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  }

  eachCell(callback) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        callback(x, y, this.cells[y][x]);
      }
    }
  }

  serialize() {
    const cellState = [];
    this.eachCell((x, y, tile) => {
      cellState.push({
        x,
        y,
        value: tile ? tile.value : null
      });
    });
    return { size: this.size, cells: cellState };
  }
}

class GameManager {
  constructor(size) {
    this.size = size;
    this.startTiles = 2;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('best') || '0', 10);
    this.over = false;
    this.won = false;
    this.keepPlaying = false;
    this.grid = new Grid(this.size);
    this.tileContainer = document.querySelector('.tile-container');
    this.gridContainer = document.querySelector('.grid-container');
    this.scoreCounter = document.querySelector('.score_counter');
    this.bestCounter = document.querySelector('.best_score_counter');
    this.messageContainer = document.querySelector('.game-message');

    this._init();
  }

  _init() {
    this._clearMessage();
    this._createGridBackground();
    this._addStartTiles();
    this._actuate();
    this._setupInput();
  }

  _createGridBackground() {
    this.gridContainer.innerHTML = '';
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        this.gridContainer.appendChild(cell);
      }
    }
  }

  _addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this._addRandomTile();
    }
  }

  _addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const cell = this.grid.randomAvailableCell();
      const tile = new Tile(value, cell.x, cell.y);
      this.grid.insertTile(tile);
    }
  }

  _actuate() {
    window.requestAnimationFrame(() => {
      this._clearTiles();
      this._addTilesToDOM();
      this._updateScore();
      this._checkGameState();
    });
  }

  _clearTiles() {
    while (this.tileContainer.firstChild) {
      this.tileContainer.removeChild(this.tileContainer.firstChild);
    }
  }

  _addTilesToDOM() {
    const tilesToRemove = new Set();

    Array.from(this.tileContainer.querySelectorAll('.tile')).forEach(el => {
      el.dataset.markedForRemoval = 'true';
    });

    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        this._updateTileDOM(tile);
        if (tile.mergedFrom) {
          tile.mergedFrom.forEach(merged => {
            this._updateTileDOM(merged);
          });
        }
      }
    });

    Array.from(this.tileContainer.querySelectorAll('.tile')).forEach(el => {
      if (el.dataset.markedForRemoval === 'true') {
        this.tileContainer.removeChild(el);
      }
    });
  }

  _updateTileDOM(tile) {
    let element = this.tileContainer.querySelector(`.tile[data-id="${tile.id}"]`);

    if (!element) {
      element = document.createElement('div');
      element.dataset.id = tile.id;
      element.classList.add('tile');
      const inner = document.createElement('div');
      inner.classList.add('tile-inner');
      element.appendChild(inner);
      this.tileContainer.appendChild(element);
    } else {
      delete element.dataset.markedForRemoval;
    }

    element.classList.remove(...Array.from(element.classList).filter(c => c.startsWith('tile-') && c !== 'tile'));
    element.classList.add(`tile-${tile.value}`);

    const inner = element.querySelector('.tile-inner');
    inner.textContent = tile.value;
    inner.classList.remove('tile-merged');

    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    element.style.transform = `translate(${position.x * 100}%, ${position.y * 100}%)`;

    if (tile.mergedFrom) {
      inner.classList.add('tile-merged');
    }

    tile.element = element;

    if (tile.previousPosition) {
      window.requestAnimationFrame(() => {
        element.style.transform = `translate(${tile.x * 100}%, ${tile.y * 100}%)`;
      });
    }
  }

  _updateScore() {
    this.scoreCounter.textContent = this.score;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('best', this.bestScore);
    }
    this.bestCounter.textContent = this.bestScore;
  }

  _checkGameState() {
    if (this.over) {
      this._message(false);
    } else if (this.won && !this.keepPlaying) {
      this._message(true);
    }
  }

  _clearMessage() {
    this.messageContainer.classList.remove('game-over');
    this.messageContainer.innerHTML = '';
  }

  _message(won) {
    const type = won ? 'You Win!' : 'Game Over!';
    this.messageContainer.classList.add('game-over');
    this.messageContainer.innerHTML = `
      <p>${type}</p>
      <button class="retry-button">Try Again</button>
    `;
    this.messageContainer.querySelector('.retry-button').addEventListener('click', () => {
      this.restart();
    });
  }

  _prepareTiles() {
    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  _moveTile(tile, cell) {
    this.grid.cells[tile.y][tile.x] = null;
    this.grid.cells[cell.y][cell.x] = tile;
    tile.updatePosition(cell.x, cell.y);
  }

  _move(direction) {
    if (this.over || (this.won && !this.keepPlaying)) return;

    const vector = this._getVector(direction);
    const traversals = this._buildTraversals(vector);
    let moved = false;

    this._prepareTiles();

    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this._findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(tile.value * 2, positions.next.x, positions.next.y);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            tile.updatePosition(positions.next.x, positions.next.y);

            this.score += merged.value;

            if (merged.value === 2048) {
              this.won = true;
            }
          } else {
            this._moveTile(tile, positions.farthest);
          }

          if (!this._positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this._addRandomTile();
      if (!this._movesAvailable()) {
        this.over = true;
      }
      this._actuate();
    }
  }

  _getVector(direction) {
    const map = {
      0: { x: 0, y: -1 },
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: -1, y: 0 }
    };
    return map[direction];
  }

  _buildTraversals(vector) {
    const traversals = { x: [], y: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  _findFarthestPosition(cell, vector) {
    let previous;

    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell
    };
  }

  _movesAvailable() {
    return this.grid.cellsAvailable() || this._tileMatchesAvailable();
  }

  _tileMatchesAvailable() {
    let matchFound = false;

    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        for (let direction = 0; direction < 4; direction++) {
          const vector = this._getVector(direction);
          const cell = { x: x + vector.x, y: y + vector.y };
          const other = this.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            matchFound = true;
          }
        }
      }
    });

    return matchFound;
  }

  _positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  _setupInput() {
    this._setupKeyboard();
    this._setupTouch();
    this._setupButtons();
  }

  _setupKeyboard() {
    document.addEventListener('keydown', (event) => {
      const map = {
        38: 0,
        39: 1,
        40: 2,
        37: 3,
        75: 0,
        76: 1,
        74: 2,
        72: 3,
        87: 0,
        68: 1,
        83: 2,
        65: 3
      };

      const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const mapped = map[event.which];

      if (!modifiers && mapped !== undefined) {
        event.preventDefault();
        this._move(mapped);
      }
    });
  }

  _setupTouch() {
    let touchStartClientX, touchStartClientY;
    const gameContainer = document.querySelector('.game-container');

    gameContainer.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) return;
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      event.preventDefault();
    }, { passive: false });

    gameContainer.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { passive: false });

    gameContainer.addEventListener('touchend', (event) => {
      if (event.touches.length > 0) return;

      const touchEndClientX = event.changedTouches[0].clientX;
      const touchEndClientY = event.changedTouches[0].clientY;

      const dx = touchEndClientX - touchStartClientX;
      const dy = touchEndClientY - touchStartClientY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 30) {
        if (absDx > absDy) {
          this._move(dx > 0 ? 1 : 3);
        } else {
          this._move(dy > 0 ? 2 : 0);
        }
      }
    });
  }

  _setupButtons() {
    document.querySelector('.reset').addEventListener('click', () => {
      this.restart();
    });
  }

  restart() {
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;
    this.grid = new Grid(this.size);
    this._addStartTiles();
    this._actuate();
  }
}

new GameManager(4);
