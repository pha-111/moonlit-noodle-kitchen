// The rules of the kitchen: orders, the plate, timers and scoring.
// This module knows nothing about drawing — it only changes numbers
// and lists, which keeps the game logic easy to stage for screenshots.

import { CUSTOMER_NAMES, RECIPES, recipeById } from "./recipes.js";

export const GAME_LENGTH_SECONDS = 120;
export const MAX_ORDERS_ON_BOARD = 3;
export const STARTING_HEARTS = 3;

/** Small deterministic random generator so staged scenes are stable. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGame(seed = 1) {
  const state = {
    rng: mulberry32(seed),
    screen: "start", // start | play | end
    timeLeft: GAME_LENGTH_SECONDS,
    score: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: STARTING_HEARTS,
    orders: [],
    selectedOrder: 0,
    plate: [],
    message: "Pick an order, then tap ingredients in recipe order!",
    messageKind: "info", // info | good | bad
    shake: 0,
    elapsed: 0,
  };
  return state;
}

function orderTimeLimit(state) {
  // The rush builds: later orders give the player a little less time.
  const squeeze = Math.min(10, state.served * 1.2);
  return 40 - squeeze;
}

export function spawnOrder(state) {
  const taken = new Set(state.orders.map((order) => order.recipeId));
  const free = RECIPES.filter((dish) => !taken.has(dish.id));
  const pool = free.length > 0 ? free : RECIPES;
  const dish = pool[Math.floor(state.rng() * pool.length)];
  const customer =
    CUSTOMER_NAMES[Math.floor(state.rng() * CUSTOMER_NAMES.length)];
  const limit = orderTimeLimit(state);
  state.orders.push({
    recipeId: dish.id,
    customer,
    timeLeft: limit,
    timeLimit: limit,
  });
}

export function startGame(state) {
  state.screen = "play";
  state.timeLeft = GAME_LENGTH_SECONDS;
  state.score = 0;
  state.served = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.hearts = STARTING_HEARTS;
  state.orders = [];
  state.selectedOrder = 0;
  state.plate = [];
  state.elapsed = 0;
  while (state.orders.length < MAX_ORDERS_ON_BOARD) spawnOrder(state);
  setMessage(state, "First orders are up — tap ingredients in recipe order!", "info");
}

export function setMessage(state, text, kind) {
  state.message = text;
  state.messageKind = kind;
}

export function currentOrder(state) {
  return state.orders[state.selectedOrder] ?? null;
}

export function selectOrder(state, index) {
  if (index >= 0 && index < state.orders.length) {
    state.selectedOrder = index;
    state.plate = [];
    const dish = recipeById(state.orders[index].recipeId);
    setMessage(state, `Now cooking: ${dish.name}. Start with ${dish.steps[0]}!`, "info");
  }
}

export function addIngredient(state, ingredientId) {
  if (state.screen !== "play") return "ignored";
  if (state.plate.length >= 6) {
    setMessage(state, "That plate is full — serve it or bin it (X).", "bad");
    return "full";
  }
  state.plate.push(ingredientId);
  return "added";
}

/** How much of the plate already matches the selected recipe, in order. */
export function plateProgress(state) {
  const order = currentOrder(state);
  if (!order) return { matched: 0, total: 0, complete: false, correct: true };
  const steps = recipeById(order.recipeId).steps;
  let correct = true;
  for (let i = 0; i < state.plate.length; i += 1) {
    if (state.plate[i] !== steps[i]) correct = false;
  }
  return {
    matched: correct ? state.plate.length : 0,
    total: steps.length,
    complete: correct && state.plate.length === steps.length,
    correct,
  };
}

export function clearPlate(state) {
  state.plate = [];
  setMessage(state, "Plate binned. Fresh start!", "info");
}

export function servePlate(state) {
  const order = currentOrder(state);
  if (!order || state.screen !== "play") return "ignored";
  const dish = recipeById(order.recipeId);
  const progress = plateProgress(state);

  if (!progress.complete) {
    state.combo = 0;
    state.shake = 0.35;
    if (!progress.correct) {
      setMessage(state, "Wrong order of ingredients! Bin it (X) and retry.", "bad");
    } else {
      setMessage(
        state,
        `Not finished yet — ${progress.total - progress.matched} more step(s) for ${dish.name}.`,
        "bad",
      );
    }
    return "wrong";
  }

  const timeBonus = Math.round(order.timeLeft * 2);
  const comboBonus = state.combo * 10;
  const gained = dish.points + timeBonus + comboBonus;
  state.score += gained;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  setMessage(
    state,
    `${order.customer} loved the ${dish.name}! +${gained} pts`,
    "good",
  );
  state.orders.splice(state.selectedOrder, 1);
  state.selectedOrder = Math.min(
    state.selectedOrder,
    Math.max(0, state.orders.length - 1),
  );
  state.plate = [];
  spawnOrder(state);
  return "served";
}

export function tickGame(state, dt) {
  if (state.screen !== "play") return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);

  for (const order of state.orders) order.timeLeft -= dt;

  const expiredIndex = state.orders.findIndex((order) => order.timeLeft <= 0);
  if (expiredIndex !== -1) {
    const gone = state.orders[expiredIndex];
    state.orders.splice(expiredIndex, 1);
    state.hearts -= 1;
    state.combo = 0;
    if (expiredIndex === state.selectedOrder) state.plate = [];
    state.selectedOrder = Math.min(
      state.selectedOrder,
      Math.max(0, state.orders.length - 1),
    );
    setMessage(
      state,
      `${gone.customer} left hungry — the ${recipeById(gone.recipeId).name} took too long!`,
      "bad",
    );
    spawnOrder(state);
  }

  if (state.timeLeft <= 0 || state.hearts <= 0) {
    state.timeLeft = Math.max(0, state.timeLeft);
    state.screen = "end";
  }
}
