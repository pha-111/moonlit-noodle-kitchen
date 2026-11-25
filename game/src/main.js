// Entry point: owns the canvas, the game state and the clock.
// Also stages the deterministic scenes used for screenshots when the
// page is opened with ?shot=start|play|ready|end — those scenes are
// built from the real game state, never drawn specially.

import { sfx } from "./audio.js";
import { INGREDIENTS } from "./recipes.js";
import {
  addIngredient,
  clearPlate,
  createGame,
  selectOrder,
  servePlate,
  setMessage,
  startGame,
  tickGame,
} from "./state.js";
import {
  BIG_BUTTON,
  SERVE_BUTTON,
  TRASH_BUTTON,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  drawGame,
  ingredientTileRect,
  orderCardRect,
} from "./render.js";
import { attachInput, pointInRect } from "./input.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get("seed") ?? 7) || 7;
const shotName = params.get("shot");

const state = createGame(seed);

// ---- Screenshot staging ---------------------------------------------------

function stageShotScene(name) {
  startGame(state);
  state.orders = [];
  state.selectedOrder = 0;
  state.plate = [];
  // A fixed, busy board: three different dishes, all mid-rush.
  const staged = [
    { recipeId: "ramen", customer: "Ada the Astronomer", timeLeft: 23, timeLimit: 40 },
    { recipeId: "pasta", customer: "June the Jazz Singer", timeLeft: 31, timeLimit: 40 },
    { recipeId: "pie", customer: "Pip the Postman", timeLeft: 36, timeLimit: 40 },
  ];
  state.orders = staged;
  state.timeLeft = 74;
  state.elapsed = 46;

  if (name === "play") {
    state.score = 180;
    state.served = 2;
    state.combo = 1;
    state.plate = ["noodles", "egg"]; // Moonlight Ramen, mid-assembly
    setMessage(state, "Ramen half built — Shrimp is next! Tap it on the counter.", "info");
  } else if (name === "ready") {
    state.score = 260;
    state.served = 2;
    state.combo = 2;
    state.orders[0].timeLeft = 18;
    state.plate = ["noodles", "egg", "shrimp", "greens"]; // plate ready to serve
    setMessage(state, "Moonlight Ramen complete — hit SERVE before the timer ends!", "good");
  } else if (name === "end") {
    state.score = 540;
    state.served = 7;
    state.combo = 0;
    state.bestCombo = 4;
    state.screen = "end";
  } else {
    state.screen = "start";
  }
  state.rng = () => 0.42; // freeze any further randomness in staged scenes
}

// ---- Interaction ------------------------------------------------------------

function handleTap(point) {
  if (state.screen === "start" || state.screen === "end") {
    if (pointInRect(point, BIG_BUTTON)) {
      startGame(state);
      sfx.pop();
    }
    return;
  }
  for (let i = 0; i < state.orders.length; i += 1) {
    if (pointInRect(point, orderCardRect(i))) {
      selectOrder(state, i);
      sfx.pop();
      return;
    }
  }
  for (let i = 0; i < INGREDIENTS.length; i += 1) {
    if (pointInRect(point, ingredientTileRect(i))) {
      if (addIngredient(state, INGREDIENTS[i].id) === "added") sfx.pop();
      return;
    }
  }
  if (pointInRect(point, SERVE_BUTTON)) {
    if (servePlate(state) === "served") sfx.serveSuccess();
    else sfx.mistake();
    return;
  }
  if (pointInRect(point, TRASH_BUTTON)) {
    clearPlate(state);
    sfx.pop();
  }
}

function handleKey(key) {
  if (state.screen !== "play") {
    if (key === "Enter" || key === " ") {
      startGame(state);
      sfx.pop();
    }
    return;
  }
  if (key === " ") {
    if (servePlate(state) === "served") sfx.serveSuccess();
    else sfx.mistake();
  } else if (key === "x" || key === "X") {
    clearPlate(state);
    sfx.pop();
  } else if (["1", "2", "3"].includes(key)) {
    selectOrder(state, Number(key) - 1);
    sfx.pop();
  }
}

// ---- Main loop --------------------------------------------------------------

let lastTimestamp = 0;
function frame(timestamp) {
  const phase = timestamp / 1000;
  if (!shotName) {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0);
    const wasPlaying = state.screen === "play";
    tickGame(state, dt);
    if (wasPlaying && state.screen === "end") sfx.gameOver();
  }
  lastTimestamp = timestamp;
  drawGame(ctx, state, phase);
  requestAnimationFrame(frame);
}

if (shotName) stageShotScene(shotName);
attachInput(canvas, { onTap: handleTap, onKey: handleKey });
requestAnimationFrame(frame);
