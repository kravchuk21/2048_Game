class Game {
  constructor() {
    this.size = 4;
    this.score = 0;
    this.active = true;
    this.grid = this._emptyGrid();
    this._spawnTile();
    this._spawnTile();
  }

  _emptyGrid() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  _spawnTile() {
    const empty = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  _slide(row) {
    const filtered = row.filter(v => v !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        this.score += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    while (filtered.length < this.size) filtered.push(0);
    return filtered;
  }

  _transpose(grid) {
    return grid[0].map((_, c) => grid.map(row => row[c]));
  }

  _gridEqual(a, b) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  move(direction) {
    if (!this.active) return;

    const prev = this.grid.map(row => [...row]);
    let grid = this.grid.map(row => [...row]);

    if (direction === 'left') {
      grid = grid.map(row => this._slide(row));
    } else if (direction === 'right') {
      grid = grid.map(row => this._slide([...row].reverse()).reverse());
    } else if (direction === 'up') {
      grid = this._transpose(this._transpose(grid).map(row => this._slide(row)));
    } else if (direction === 'down') {
      grid = this._transpose(
        this._transpose(grid).map(row => this._slide([...row].reverse()).reverse())
      );
    }

    this.grid = grid;

    if (!this._gridEqual(prev, this.grid)) {
      this._spawnTile();
    }

    this._checkGameOver();
  }

  _checkGameOver() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c] === 0) return;
        if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return;
        if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return;
      }
    }
    this.active = false;
  }

  reset() {
    this.score = 0;
    this.active = true;
    this.grid = this._emptyGrid();
    this._spawnTile();
    this._spawnTile();
  }
}

class Renderer {
  constructor(game) {
    this.game = game;
    this.mainEl = document.querySelector('.main');
    this.scoreEl = document.querySelector('.score_counter');
    this.bestEl = document.querySelector('.best_score_counter');
  }

  render() {
    const { grid, score, active } = this.game;

    this.mainEl.classList.toggle('game-over', !active);

    let html = '';
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const val = grid[r][c];
        if (val === 0) {
          html += `<div class="cell"></div>`;
        } else {
          html += `<div class="cell tile-${val}">${val}</div>`;
        }
      }
    }
    this.mainEl.innerHTML = html;

    this.scoreEl.textContent = score;

    const best = parseInt(localStorage.getItem('best') || '0', 10);
    if (score > best) {
      localStorage.setItem('best', score);
      this.bestEl.textContent = score;
    } else {
      this.bestEl.textContent = best;
    }
  }
}

class InputManager {
  constructor(onMove, onReset) {
    this.onMove = onMove;
    this.onReset = onReset;
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._minSwipeDistance = 30;

    this._bindKeyboard();
    this._bindTouch();
    this._bindReset();
  }

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      const map = {
        ArrowLeft: 'left',  KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
        ArrowUp: 'up',      KeyW: 'up',
        ArrowDown: 'down',  KeyS: 'down',
      };
      const direction = map[e.code];
      if (direction) {
        e.preventDefault();
        this.onMove(direction);
      }
    });
  }

  _bindTouch() {
    const el = document.querySelector('.main');
    el.addEventListener('touchstart', e => {
      this._touchStartX = e.changedTouches[0].pageX;
      this._touchStartY = e.changedTouches[0].pageY;
    }, { passive: true });

    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].pageX - this._touchStartX;
      const dy = e.changedTouches[0].pageY - this._touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < this._minSwipeDistance) return;

      if (absDx > absDy) {
        this.onMove(dx > 0 ? 'right' : 'left');
      } else {
        this.onMove(dy > 0 ? 'down' : 'up');
      }
    }, { passive: true });
  }

  _bindReset() {
    document.querySelector('.reset').addEventListener('click', this.onReset);
  }
}

class Controller {
  constructor() {
    this.game = new Game();
    this.renderer = new Renderer(this.game);
    this.input = new InputManager(
      direction => {
        this.game.move(direction);
        this.renderer.render();
      },
      () => {
        this.game.reset();
        this.renderer.render();
      }
    );
    this.renderer.render();
  }
}

new Controller();
