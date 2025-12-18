// --- 1. CONFIGURATION ---
let size = 11; // Must be odd
let player = { r: 1, c: 1 };
let end = { r: size - 2, c: size - 2 };
let walls = [];
let timeLeft = 30;
let score = 0;
let level = 1;
let gameActive = true;
let timerInterval;

// --- 2. PERFECT MAZE GENERATION (The Fix for No-Path) ---
function generatePerfectMaze() {
    walls = Array.from({ length: size }, () => Array(size).fill(1));

    function carve(r, c) {
        walls[r][c] = 0;
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        
        for (let [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && walls[nr][nc] === 1) {
                walls[r + dr/2][c + dc/2] = 0; 
                carve(nr, nc);
            }
        }
    }
    carve(1, 1);
    walls[end.r][end.c] = 0; // Double check exit is open
}

// --- 3. THE HINT LOGIC (The Fix for Hint Button) ---
function requestHint() {
    // We use BFS to find the shortest path from the player to the exit
    let queue = [[player.r, player.c, []]];
    let visited = new Set();
    visited.add(`${player.r}-${player.c}`);

    while (queue.length > 0) {
        let [r, c, path] = queue.shift();

        if (r === end.r && c === end.c) {
            // Found the path! Highlight it
            path.forEach(pos => {
                const cell = document.getElementById(`c-${pos.r}-${pos.c}`);
                if (cell) cell.classList.add("path-hint");
            });
            return;
        }

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (let [dr, dc] of directions) {
            let nr = r + dr, nc = c + dc;
            let key = `${nr}-${nc}`;
            
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && 
                walls[nr][nc] === 0 && !visited.has(key)) {
                visited.add(key);
                queue.push([nr, nc, [...path, {r: nr, c: nc}]]);
            }
        }
    }
}

// --- 4. CORE ENGINE ---
function draw() {
    const mazeDiv = document.getElementById("maze");
    mazeDiv.style.gridTemplateColumns = `repeat(${size}, 30px)`;
    mazeDiv.innerHTML = "";

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.id = `c-${r}-${c}`;
            cell.className = "cell " + (walls[r][c] ? "wall" : "floor");
            
            if (r === player.r && c === player.c) cell.classList.add("player");
            else if (r === end.r && c === end.c) cell.classList.add("end");
            
            mazeDiv.appendChild(cell);
        }
    }
}

function startNewGame(resetAll = false) {
    if(resetAll) { level = 1; score = 0; size = 11; }
    timeLeft = 30 + (level * 5);
    player = { r: 1, c: 1 };
    end = { r: size - 2, c: size - 2 };
    
    generatePerfectMaze();
    updateStats();
    draw();
    
    clearInterval(timerInterval);
    startTimer();
    gameActive = true;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = timeLeft;
        if (timeLeft <= 0) {
            gameActive = false;
            clearInterval(timerInterval);
            alert("Game Over! Score: " + score);
            startNewGame(true);
        }
    }, 1000);
}

// Control Movement
window.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    let { r, c } = player;
    if (e.key === "ArrowUp") r--;
    else if (e.key === "ArrowDown") r++;
    else if (e.key === "ArrowLeft") c--;
    else if (e.key === "ArrowRight") c++;
    else return;

    if (r >= 0 && r < size && c >= 0 && c < size && walls[r][c] === 0) {
        player = { r, c };
        if (r === end.r && c === end.c) {
            score += 100;
            level++;
            size += 2; 
            alert("Level Complete!");
            startNewGame();
        }
        draw();
    }
});

function updateStats() {
    document.getElementById("lvl").innerText = level;
    document.getElementById("score").innerText = score;
}

startNewGame(true);