// Minimal, self-contained front-end game logic
const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const backMenu = document.getElementById("backMenu");
const backFromHow = document.getElementById("backFromHow");
const menu = document.getElementById("menu");
const how = document.getElementById("how");
const game = document.getElementById("game");
const rollBtn = document.getElementById("rollBtn");
const diceEl = document.getElementById("dice");
const messageEl = document.getElementById("message");
const scoreVal = document.getElementById("scoreVal");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const popupChoices = document.getElementById("popupChoices");
const resultEl = document.getElementById("result");

let boardCanvas = document.getElementById("board");
let ctx = boardCanvas.getContext("2d");

const tiles = [
  { type: "start", label: "Start" },
  {
    type: "fact",
    label: "Fact: Plastic bottles can take 450 years to decompose.",
  },
  { type: "action", label: "Found trash — pick up or ignore" },
  { type: "chance", label: "Community cleanup: join or skip" },
  { type: "fact", label: "Single-use plastics are common in markets" },
  { type: "penalty", label: "Fine: littering penalty" },
  { type: "action", label: "Bottle on road: recycle or throw" },
  { type: "fact", label: "Recycle practices vary by locality" },
  { type: "chance", label: "Storm runoff: impacts beaches" },
  { type: "end", label: "Finish" },
];

let playerPos = 0;
let envScore = 0;
let rolling = false;

function drawBoard() {
  ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  const w = boardCanvas.width;
  const h = boardCanvas.height;
  const tileW = Math.floor(w / tiles.length);
  ctx.font = "12px Arial";
  for (let i = 0; i < tiles.length; i++) {
    const x = i * tileW;
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f1fbf2";
    ctx.fillRect(x + 4, 10, tileW - 8, h - 20);
    ctx.strokeStyle = "#ddeee0";
    ctx.strokeRect(x + 4, 10, tileW - 8, h - 20);
    ctx.fillStyle = "#333";
    const label = tiles[i].label;
    wrapText(ctx, label, x + 12, 28, tileW - 24, 14);
    // token
    if (i === playerPos) {
      ctx.fillStyle = "#2b9f4b";
      ctx.beginPath();
      ctx.arc(x + tileW / 2, h - 40, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function showScreen(scr) {
  menu.classList.add("hidden");
  game.classList.add("hidden");
  how.classList.add("hidden");
  scr.classList.remove("hidden");
}

startBtn.onclick = () => {
  resetGame();
  showScreen(game);
  drawBoard();
};
howBtn.onclick = () => showScreen(how);
backFromHow.onclick = () => showScreen(menu);
backMenu.onclick = () => showScreen(menu);

function resetGame() {
  playerPos = 0;
  envScore = 0;
  scoreVal.textContent = envScore;
  messageEl.textContent = "Press Roll to start";
  resultEl.classList.add("hidden");
}

function rollDice() {
  if (rolling) return;
  rolling = true;
  rollBtn.disabled = true;
  messageEl.textContent = "Rolling...";
  diceEl.textContent = "...";
  // animate dice
  const start = Date.now();
  let anim = setInterval(() => {
    diceEl.textContent = Math.floor(Math.random() * 6) + 1;
    if (Date.now() - start > 700) {
      clearInterval(anim);
      const val = Math.floor(Math.random() * 6) + 1;
      diceEl.textContent = val;
      movePlayer(val);
    }
  }, 80);
}

function movePlayer(steps) {
  const target = Math.min(playerPos + steps, tiles.length - 1);
  const interval = setInterval(() => {
    if (playerPos < target) {
      playerPos++;
      drawBoard();
    } else {
      clearInterval(interval);
      tileAction(tiles[playerPos]);
      rolling = false;
      rollBtn.disabled = false;
    }
  }, 220);
}

function tileAction(tile) {
  if (tile.type === "fact") {
    messageEl.textContent = tile.label;
  } else if (tile.type === "action") {
    showPopup(tile.label, [
      { text: "Choose: Good (recycle)", score: +10 },
      { text: "Choose: Bad (ignore)", score: -8 },
    ]);
  } else if (tile.type === "chance") {
    showPopup(tile.label, [
      { text: "Join community", score: +12 },
      { text: "Skip", score: -6 },
    ]);
  } else if (tile.type === "penalty") {
    envScore -= 7;
    updateScore();
    messageEl.textContent = "Penalty applied: -7";
  } else if (tile.type === "end") {
    finishGame();
  } else {
    messageEl.textContent = tile.label;
  }
}

function showPopup(text, choices) {
  popupText.textContent = text;
  popupChoices.innerHTML = "";
  choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.textContent = c.text;
    btn.onclick = () => {
      envScore += c.score;
      updateScore();
      popup.classList.add("hidden");
      messageEl.textContent = `${c.text} (${c.score > 0 ? "+" : ""}${c.score})`;
      if (playerPos === tiles.length - 1) finishGame();
    };
    popupChoices.appendChild(btn);
  });
  popup.classList.remove("hidden");
}

function updateScore() {
  scoreVal.textContent = envScore;
}

function finishGame() {
  resultEl.classList.remove("hidden");
  let rating = "Neutral";
  if (envScore >= 25) rating = "Champion of the Coast 🌊";
  else if (envScore >= 5) rating = "Eco-Aware Citizen";
  else if (envScore >= -10) rating = "Needs Improvement";
  else rating = "At Risk — Reflect & Act";
  resultEl.innerHTML = `<strong>Final Score: ${envScore}</strong><br/>${rating}<br/><br/>
  Tips: Reduce single-use plastics, bring reusable bags, join local cleanups.`;
  messageEl.textContent = "Game over — see results";
}

rollBtn.addEventListener("click", rollDice);
drawBoard();
