const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const BLOCK_SIZE = 30;
const COLS = 10;
const ROWS = 20;
let score = 0;
let gameOver = false;

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

// Colors for each shape
const COLORS = [
    '#00f0f0', // I - Cyan
    '#f0f000', // O - Yellow
    '#a000f0', // T - Purple
    '#f0a000', // L - Orange
    '#0000f0', // J - Blue
    '#00f000', // S - Green
    '#f00000'  // Z - Red
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentPieceColor = '';
let currentX = 0;
let currentY = 0;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
    }
}

function createNewPiece() {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    currentPiece = new Piece(SHAPES[randomIndex], COLORS[randomIndex]);
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    
    if (isCollision()) {
        gameOver = true;
    }
}

function isCollision() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardX = currentX + x;
                const boardY = currentY + y;
                
                if (boardX < 0 || boardX >= COLS || 
                    boardY >= ROWS ||
                    (boardY >= 0 && board[boardY][boardX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentY + y][currentX + x] = currentPiece.color;
            }
        }
    }
    checkLines();
    createNewPiece();
}

function checkLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            scoreElement.textContent = score;
        }
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (isCollision()) {
        currentPiece.shape = previousShape;
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        (currentX + x) * BLOCK_SIZE,
                        (currentY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        currentY++;
        if (isCollision()) {
            currentY--;
            mergePiece();
        }
        draw();
        setTimeout(gameLoop, 1000);
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            currentX--;
            if (isCollision()) currentX++;
            break;
        case 'ArrowRight':
            currentX++;
            if (isCollision()) currentX--;
            break;
        case 'ArrowDown':
            currentY++;
            if (isCollision()) currentY--;
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
    }
    draw();
});

// Start the game
createNewPiece();
gameLoop(); 