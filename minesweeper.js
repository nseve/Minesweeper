class Minesweeper extends HTMLElement {
    constructor() {
        super();
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('minesweeper');
        this.appendChild(this.wrapper);

        const link = document.createElement('link');
        if (!document.querySelector('link[href="minesweeper.css"]')) {
            link.rel = 'stylesheet';
            link.href = 'minesweeper.css';
            document.head.appendChild(link);
        }

        this.minSize = parseInt(this.getAttribute('min-size'));
        this.maxSize = parseInt(this.getAttribute('max-size'));
        this.minMines = parseInt(this.getAttribute('min-mines'));
        this.maxMines = parseInt(this.getAttribute('max-mines'));

        this.startGame();
    }

    startGame() {
        this.board = [];
        this.minesPosition = [];
        this.tilesClicked = 0;
        this.gameOver = false;
        this.wrapper.innerHTML = '';
        this.createControlPanel();
    }

    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('control-panel');

        const boardSizeLabel = document.createElement('label');
        boardSizeLabel.innerHTML = 'Board size:';
        const boardSizeSelect = document.createElement('select');
        for (let i = this.minSize; i <= this.maxSize; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            boardSizeSelect.appendChild(option);
        }
        boardSizeSelect.value = Math.floor((this.minSize + this.maxSize) / 2);
        boardSizeLabel.appendChild(boardSizeSelect);

        const minesCountLabel = document.createElement('label');
        minesCountLabel.innerHTML = 'Number of mines:';
        const minesCountSelect = document.createElement('select');
        for (let i = this.minMines; i <= this.maxMines; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            minesCountSelect.appendChild(option);
        }
        minesCountSelect.value = Math.floor((this.minMines + this.maxMines) / 2);
        minesCountLabel.appendChild(minesCountSelect);

        const startButton = document.createElement('button');
        startButton.textContent = 'START';
        startButton.addEventListener('click', () => {
            this.cols = parseInt(boardSizeSelect.value);
            this.rows = parseInt(boardSizeSelect.value);
            this.mines = parseInt(minesCountSelect.value);
            controlPanel.style.display = 'none';
            this.createGameBoard();
            this.placeMines();
        });

        controlPanel.appendChild(boardSizeLabel);
        controlPanel.appendChild(minesCountLabel);
        controlPanel.appendChild(startButton);
        this.wrapper.appendChild(controlPanel);
    }

    createGameBoard() {
        const field = document.createElement('div');
        field.classList.add('field');
        field.style.gridTemplateColumns = `repeat(${this.cols}, 40px)`;
        this.wrapper.appendChild(field);

        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.id = `${i}-${j}`;
                tile.addEventListener('click', this.clickTile.bind(this));
                tile.addEventListener('contextmenu', this.flagTile.bind(this));
                field.appendChild(tile);
                row.push(tile);
            }
            this.board.push(row);
        }
    }

    placeMines() {
        for (let k = 0; k < this.mines; k++) {
            const i = Math.floor(Math.random() * this.rows);
            const j = Math.floor(Math.random() * this.cols);
            const index = `${i}-${j}`;

            if (!this.minesPosition.includes(index)) {
                this.minesPosition.push(index);
            } else {
                k--;
            }
        }
    }

    showMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const tile = this.board[i][j];
                if (this.minesPosition.includes(tile.id)) {
                    tile.innerText = '💣';
                    tile.style.backgroundColor = 'red';
                }
            }
        }
    }

    clickTile(event) {
        const tile = event.target;

        if (this.gameOver || tile.classList.contains('tile-clicked') || tile.innerText === '🚩') {
            return;
        }

        if (this.minesPosition.includes(tile.id)) {
            this.gameOver = true;
            this.showMines();
            this.showGameResult('GAME OVER');
            return;
        }

        const coords = tile.id.split('-');
        const i = parseInt(coords[0]);
        const j = parseInt(coords[1]);
        this.checkSurrounding(i, j);

        if (this.tilesClicked === this.rows * this.cols - this.mines) {
            this.gameOver = true;
            this.showGameResult('YOU WON');
        }
    }

    flagTile(event) {
        event.preventDefault();
        if (this.gameOver || event.target.classList.contains('tile-clicked')) {
            return;
        }

        const tile = event.target;

        if (tile.innerText === '') {
            tile.innerText = '🚩';
        } else if (tile.innerText === '🚩') {
            tile.innerText = '';
        }
    }

    checkSurrounding(i, j) {
        if (this.gameOver) {
            return;
        }

        if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
            return;
        }

        if (this.board[i][j].classList.contains('tile-clicked')) {
            return;
        }

        this.board[i][j].classList.add('tile-clicked');
        this.tilesClicked++;

        let minesFound = 0;

        for (let k = -1; k <= 1; k++) {
            for (let l = -1; l <= 1; l++) {
                if (k === 0 && l === 0) {
                    continue;
                }
                minesFound += this.checkTile(i + k, j + l);
            }
        }

        if (minesFound > 0) {
            this.board[i][j].innerText = minesFound;
            this.board[i][j].classList.add('x' + minesFound.toString());
        } else {
            for (let k = -1; k <= 1; k++) {
                for (let l = -1; l <= 1; l++) {
                    if (k === 0 && l === 0) {
                        continue;
                    }
                    this.checkSurrounding(i + k, j + l);
                }
            }
        }
    }

    checkTile(i, j) {
        if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
            return 0;
        }
        if (this.minesPosition.includes(`${i}-${j}`)) {
            return 1;
        }
        return 0;
    }

    showGameResult(message) {
        const resultPanel = document.createElement('div');
        resultPanel.classList.add('result-panel');

        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.classList.add('result-message');

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Play again';
        restartButton.addEventListener('click', () => {
            this.wrapper.innerHTML = '';
            this.startGame();
        });

        resultPanel.appendChild(messageElement);
        resultPanel.appendChild(restartButton);
        this.wrapper.appendChild(resultPanel);
    }
}

customElements.define('minesweeper-game', Minesweeper);