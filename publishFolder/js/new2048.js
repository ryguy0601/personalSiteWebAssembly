let board = [];
let score = 0;
let merged = Array.from({ length: 4 }, () => Array(4).fill(false));
let tile = document.querySelector(`#cord-${0}-${0}`);
let scoreDisplay = document.querySelector('#score');
let scoreAdded = document.querySelector('#addedScoreHolder');

// for touch detection
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

let xDown = null;
let yDown = null;
let xDiff = null;
let yDiff = null;

function restart() {
    // board = [//testing board
    //     [2, 2, 4, 8],
    //     [128, 64, 32, 16],
    //     [256, 512, 1024, 2048],
    //     [0, 0, 0, 0]
    // ];
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    merged = Array.from({ length: 4 }, () => Array(4).fill(false));
    drawBoard();
    addNum()
    addNum()
}

document.querySelector('#restartButton').addEventListener('click', restart);
document.querySelector('#restartButton').addEventListener('touchend', restart);


window.onload = function () {
    restart();
}

function loseCheck() {
    // Check if there are any zeros on the board
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board.length; y++) {
            if (board[x][y] === 0) {
                // console.log("loseCheck");

                return false; // There are still zeros on the board
            }
        }
    }
    return lose(); // No zeros found, call the lose function
}

function lose() {
    // checks if anything can be merged
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board.length; y++) {
            if (x != 0 && board[x - 1][y] == board[x][y]) {
                return false;
            }
            if (
                x <= board.length - 2 &&
                board[x + 1][y] == board[x][y]) {
                return false;
            }
            if (
                y <= board.length - 2 &&
                board[x][y + 1] == board[x][y]) {
                return false;
            }
            if (y != 0 && board[x][y - 1] == board[x][y]) {
                return false;
            }
        }
    }
    // console.log("You lose");
    return true; // No merges found, call the lose function
}



function randomNum(min, max) {
    //max is exlusive
    return Math.floor(Math.random() * (max - min)) + min;
}


function addNum() {
    // Adds a random number to the board with animation
    if (!loseCheck()) {
        let x = randomNum(0, 4);
        let y = randomNum(0, 4);
        while (board[x][y] != 0) {
            x = randomNum(0, 4);
            y = randomNum(0, 4);
        }
        board[x][y] = Math.random() < 0.5 ? 2 : 4; // 50% chance of 2 or 4

        // Animate the new tile
        const tile = document.querySelector(`#cord-${x}-${y}>div`);
        animateAddNum(tile);
    } else {
        // console.log("You lose");
        scoreDisplay.innerText = `Score: ${score} - You lose!`;
    }
    drawBoard();
}
function animateAddNum(tile) {
    tile.style.transition = 'transform 0.3s ease';
    tile.style.transform = 'scale(0)';

    setTimeout(() => {
        tile.style.transform = 'scale(.5)';
        setTimeout(() => {
            tile.style.transform = 'scale(1.2)';
            setTimeout(() => {
                tile.style.transform = 'scale(1)';
            }, 150);
        }, 50);
    }, 50);
}

function animateMerge(tile) {
    tile.style.transition = 'transform .5s ease, background 0.5s ease, box-shadow 0.5s ease';
    // tile.style.transform = 'scale(1.5)';
    tile.style.transform = ` scale(1.25)`;

    tile.style.zIndex = '10'; // Bring the tile to the front for visibility
    let tileCol = tile.className.split('-').pop(); // Get the last part of the class name
    tileCol = `var(--${tileCol * 2}-col)`; // Construct the color variable name
    tile.style.background = `radial-gradient(circle, transparent, ${tileCol})`; // Highlight the fusion effect

    setTimeout(() => {
        tile.style.transform = 'scale(1)';
        tile.style.zIndex = '1'; // Reset z-index
        tile.style.background = ''; // Reset background
    }, 500);
}

function animateTileMove(tile, targetY, targetX) {
    if (tile.className.includes('tile-0')) return;
    const startX = tile.offsetLeft;
    const startY = tile.offsetTop;
    const endX = startX + targetX * (tile.offsetWidth + 15);
    const endY = startY + targetY * (tile.offsetHeight + 15);
    // console.log(targetX, startX, endX);
    // console.log(targetY, startY, endY);

    let tileCol = tile.className.split('-').pop(); // Get the last part of the class name
    tileCol = `var(--${tileCol}-col)`; // Construct the color variable name

    // console.log(targetX, targetY);
    // console.log(tile);

    tile.style.transition = 'transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease';
    tile.style.transform = `translate(${endX - startX}px, ${endY - startY}px)`;
    tile.style.zIndex = '-10'; // Bring the tile to the front for visibility
    tile.style.background = `radial-gradient(circle, transparent 65%, ${tileCol}`; // Change color for visibility
    tile.style.boxShadow = `0 0 10px ${tileCol}`; // Add shadow for visibility
    tile.style.color = tileCol; // Change text color for visibility
    tile.style.opacity = '0.5'; // Change opacity for visibility

    // Reset styles after animation
    setTimeout(() => {
        tile.style.transition = '';
        tile.style.transform = '';
        tile.style.zIndex = '1';
        tile.style.background = '';
        tile.style.boxShadow = '';
        tile.style.color = '';
        tile.style.opacity = '1'; // Reset opacity
    }, 200);
}

// Update the score display with animation
function updateScore(newScore) {
    // animateScoreUpdate(newScore);
    // Add the score to the scoreAdded element
    let newScoreDiv = document.createElement('div');
    newScoreDiv.className = 'addedScore';
    newScoreDiv.innerText = `+${newScore}`;
    scoreAdded.appendChild(newScoreDiv);

    setTimeout(() => {
        // newScoreDiv.style.opacity = '0';
        scoreAdded.removeChild(newScoreDiv);
    }, 500);


    // Add the score to the total score
    score += newScore;
}

// Handle arrow key functionality
function handleArrowKey(direction) {
    let moved = false; // Track if any tile was moved
    merged = Array.from({ length: 4 }, () => Array(4).fill(false)); // Reset merged tracking

    if (direction === 'up') {
        for (let y = 0; y < board.length; y++) {
            for (let x = 1; x < board.length; x++) {
                if (board[x][y] !== 0) {
                    let targetX = x;
                    while (targetX > 0 && board[targetX - 1][y] === 0) {
                        targetX--;
                    }
                    let tile = document.querySelector(`#cord-${x}-${y}>div`);
                    if (targetX > 0 && board[targetX - 1][y] === board[x][y] && !merged[targetX - 1][y]) {
                        board[targetX - 1][y] *= 2;
                        merged[targetX - 1][y] = true;
                        board[x][y] = 0;
                        updateScore(board[targetX - 1][y]);
                        moved = true;
                        // animateTileMove(tile, targetX - x, 0);
                        let targetTile = document.querySelector(`#cord-${targetX - 1}-${y}>div`);
                        animateMerge(targetTile);
                    } else if (targetX !== x) {
                        animateTileMove(tile, targetX - x, 0);
                        board[targetX][y] = board[x][y];
                        board[x][y] = 0;
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'down') {
        for (let y = 0; y < board.length; y++) {
            for (let x = board.length - 2; x >= 0; x--) {
                if (board[x][y] !== 0) {
                    let targetX = x;
                    while (targetX < board.length - 1 && board[targetX + 1][y] === 0) {
                        targetX++;
                    }
                    let tile = document.querySelector(`#cord-${x}-${y}>div`);
                    if (targetX < board.length - 1 && board[targetX + 1][y] === board[x][y] && !merged[targetX + 1][y]) {
                        board[targetX + 1][y] *= 2;
                        merged[targetX + 1][y] = true;
                        board[x][y] = 0;
                        updateScore(board[targetX + 1][y]);
                        moved = true;
                        let targetTile = document.querySelector(`#cord-${targetX + 1}-${y}>div`);
                        animateMerge(targetTile);
                    } else if (targetX !== x) {
                        animateTileMove(tile, targetX - x, 0);
                        board[targetX][y] = board[x][y];
                        board[x][y] = 0;
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'left') {
        for (let x = 0; x < board.length; x++) {
            for (let y = 1; y < board.length; y++) {
                if (board[x][y] !== 0) {
                    let targetY = y;
                    while (targetY > 0 && board[x][targetY - 1] === 0) {
                        targetY--;
                    }
                    let tile = document.querySelector(`#cord-${x}-${y}>div`);
                    if (targetY > 0 && board[x][targetY - 1] === board[x][y] && !merged[x][targetY - 1]) {
                        board[x][targetY - 1] *= 2;
                        merged[x][targetY - 1] = true;
                        board[x][y] = 0;
                        updateScore(board[x][targetY - 1]);
                        moved = true;
                        let targetTile = document.querySelector(`#cord-${x}-${targetY - 1}>div`);
                        animateMerge(targetTile);
                    } else if (targetY !== y) {
                        animateTileMove(tile, 0, targetY - y);
                        board[x][targetY] = board[x][y];
                        board[x][y] = 0;
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'right') {
        for (let x = 0; x < board.length; x++) {
            for (let y = board.length - 2; y >= 0; y--) {
                if (board[x][y] !== 0) {
                    let targetY = y;
                    while (targetY < board.length - 1 && board[x][targetY + 1] === 0) {
                        targetY++;
                    }
                    let tile = document.querySelector(`#cord-${x}-${y}>div`);
                    if (targetY < board.length - 1 && board[x][targetY + 1] === board[x][y] && !merged[x][targetY + 1]) {
                        board[x][targetY + 1] *= 2;
                        merged[x][targetY + 1] = true;
                        board[x][y] = 0;
                        updateScore(board[x][targetY + 1]);
                        moved = true;
                        let targetTile = document.querySelector(`#cord-${x}-${targetY + 1}>div`);
                        animateMerge(targetTile);
                    } else if (targetY !== y) {
                        animateTileMove(tile, 0, targetY - y);
                        board[x][targetY] = board[x][y];
                        board[x][y] = 0;
                        moved = true;
                    }
                }
            }
        }
    }

    if (moved) {
        addNum(); // Add a new number if a move was made
        drawBoard(); // Redraw the board
    }

    if (loseCheck()) {
        // console.log("lose");
        scoreDisplay.innerHTML = `Score: ${score}<br> <span style='color:red'>You lose!</span>`;
        drawBoard();
    }
}


document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            handleArrowKey('up');
            break;
        case 'ArrowDown':
            handleArrowKey('down');
            break;
        case 'ArrowLeft':
            handleArrowKey('left');
            break;
        case 'ArrowRight':
            handleArrowKey('right');
            break;
    }
});

function drawBoard() {
    if (!loseCheck()) {
        scoreDisplay.innerText = `Score: ${score}`;
    }
    // scoreDisplay.innerText = `Score: ${score}`;
    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            tile = document.querySelector(`#cord-${x}-${y}>div`);
            tile.className = `tile-${board[x][y]}`;
            tile.innerText = board[x][y] !== 0 ? board[x][y] : '';
        }

    }
}

function getTouches(evt) {
    return evt.touches;
}
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}
function handleTouchMove(evt) {
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    xDiff = xDown - xUp;
    yDiff = yDown - yUp;
}

function handleTouchEnd(evt) {
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /*most significant*/
        if (xDiff < 0) {
            handleArrowKey('right');
        }
        if (xDiff > 0) {
            handleArrowKey('left');
        }
    } else {
        if (yDiff > 0) {
            handleArrowKey('up');
        }
        if (yDiff < 0) {
            handleArrowKey('down');
        }
    }
    xDown = null;
    yDown = null;
    xDiff = null;
    yDiff = null;
}

window.restartGame = restart();