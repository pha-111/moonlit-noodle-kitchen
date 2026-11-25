// Everything the player sees: the night kitchen, the order board, the
// ingredient counter and the plate. Pure canvas drawing, no images.

import { INGREDIENTS, ingredientById, recipeById } from "./recipes.js";
import { currentOrder, plateProgress } from "./state.js";

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 800;

// ---- Layout (shared with input.js) ---------------------------------------

export const ORDER_BOARD = { x: 20, y: 80, w: 360, h: 340 };
export const KITCHEN = { x: 400, y: 80, w: 860, h: 340 };
export const PLATE_PANEL = { x: 20, y: 440, w: 600, h: 270 };
export const COUNTER = { x: 640, y: 440, w: 620, h: 270 };

export function orderCardRect(index) {
  return { x: ORDER_BOARD.x + 14, y: ORDER_BOARD.y + 58 + index * 94, w: ORDER_BOARD.w - 28, h: 86 };
}

export function ingredientTileRect(index) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  return { x: COUNTER.x + 16 + col * 118, y: COUNTER.y + 52 + row * 108, w: 110, h: 100 };
}

export const SERVE_BUTTON = { x: 428, y: 622, w: 168, h: 60 };
export const TRASH_BUTTON = { x: 244, y: 622, w: 168, h: 60 };
export const BIG_BUTTON = { x: 470, y: 540, w: 340, h: 76 };

// ---- Small drawing helpers ----------------------------------------------

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillRound(ctx, rect, r, color) {
  roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function label(ctx, text, x, y, size, color, align = "left", weight = 700) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ---- Ingredient icons -----------------------------------------------------

export function drawIngredientIcon(ctx, id, cx, cy, size) {
  const s = size / 40;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = "rgba(60,35,10,0.55)";
  switch (id) {
    case "noodles":
      ctx.fillStyle = "#fff7dd";
      ctx.beginPath(); ctx.ellipse(0, 6, 17, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#e8a812";
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-12, 2 + i * 3);
        ctx.bezierCurveTo(-4, -6 + i * 3, 4, 8 + i * 3, 12, 0 + i * 3);
        ctx.stroke();
      }
      break;
    case "pasta":
      ctx.fillStyle = "#f9e08a";
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath(); ctx.ellipse(i * 6, 0, 4.4, 13, i * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      break;
    case "egg":
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ffb703";
      ctx.beginPath(); ctx.arc(0, 0, 6.4, 0, Math.PI * 2); ctx.fill();
      break;
    case "shrimp":
      ctx.strokeStyle = "#ff7d95";
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0, 0, 11, Math.PI * 0.15, Math.PI * 1.55); ctx.stroke();
      ctx.fillStyle = "#ff8fa3";
      ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(19, -15); ctx.lineTo(16, -4); ctx.closePath(); ctx.fill();
      break;
    case "greens":
      ctx.fillStyle = "#57cc5e";
      for (const dx of [-9, 0, 9]) {
        ctx.beginPath(); ctx.ellipse(dx, 0, 6.4, 13, dx * 0.03, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      break;
    case "tomato":
      ctx.fillStyle = "#ef476f";
      ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2a9d5f";
      ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(0, -16); ctx.lineTo(6, -9); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill();
      break;
    case "mushroom":
      ctx.fillStyle = "#c08552";
      ctx.beginPath(); ctx.arc(0, -2, 14, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f3e2c7";
      ctx.fillRect(-4.4, -2, 8.8, 12);
      ctx.fillStyle = "#fff3e0";
      ctx.beginPath(); ctx.arc(-6, -8, 2.6, 0, Math.PI * 2); ctx.arc(5, -10, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case "cheese":
      ctx.fillStyle = "#ffd60a";
      ctx.beginPath(); ctx.moveTo(-15, 8); ctx.lineTo(15, 8); ctx.lineTo(15, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e8a812";
      ctx.beginPath(); ctx.arc(4, 2, 3, 0, Math.PI * 2); ctx.arc(10, 5, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case "dough":
      ctx.fillStyle = "#e8c39e";
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f7e3c3";
      ctx.beginPath(); ctx.ellipse(-4, -3, 6, 3.6, -0.4, 0, Math.PI * 2); ctx.fill();
      break;
    case "basil":
      ctx.fillStyle = "#2a9d5f";
      ctx.beginPath(); ctx.ellipse(-6, 0, 7, 12, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(6, 0, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill();
      break;
    default:
      ctx.fillStyle = "#cccccc";
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---- Scene pieces ---------------------------------------------------------

function drawBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  grad.addColorStop(0, "#241a3d");
  grad.addColorStop(0.72, "#33234f");
  grad.addColorStop(0.721, "#5b3a29");
  grad.addColorStop(1, "#6f452c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

function drawHud(ctx, state) {
  label(ctx, "🌙 MOONLIT NOODLE KITCHEN", 24, 34, 27, "#ffe9b8");
  // Score pill
  fillRound(ctx, { x: 520, y: 12, w: 210, h: 46 }, 23, "#fff4e0");
  label(ctx, `SCORE  ${state.score}`, 625, 36, 22, "#5b3413", "center", 800);
  // Game timer pill with shrinking bar
  fillRound(ctx, { x: 750, y: 12, w: 270, h: 46 }, 23, "#fff4e0");
  label(ctx, `⏱ ${formatTime(state.timeLeft)}`, 800, 36, 22, "#5b3413", "center", 800);
  const frac = Math.max(0, state.timeLeft / 120);
  fillRound(ctx, { x: 852, y: 26, w: 150 * frac, h: 18 }, 9, frac < 0.2 ? "#ef476f" : "#57cc5e");
  // Hearts + served
  label(ctx, "♥".repeat(Math.max(0, state.hearts)) + "♡".repeat(Math.max(0, 3 - state.hearts)), 1062, 36, 24, "#ff8fa3", "center");
  label(ctx, `Served: ${state.served}`, 1195, 36, 20, "#ffe9b8", "center", 800);
}

function drawOrderBoard(ctx, state, phase) {
  fillRound(ctx, ORDER_BOARD, 18, "#fff4e0");
  label(ctx, "📋 ORDER BOARD", ORDER_BOARD.x + 20, ORDER_BOARD.y + 28, 23, "#5b3413", "left", 800);
  state.orders.forEach((order, index) => {
    const rect = orderCardRect(index);
    const dish = recipeById(order.recipeId);
    const selected = index === state.selectedOrder;
    fillRound(ctx, rect, 14, selected ? "#ffe1a8" : "#ffffff");
    if (selected) {
      ctx.strokeStyle = "#ff8c42";
      ctx.lineWidth = 4;
      roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
      ctx.stroke();
    }
    label(ctx, `${index + 1}. ${dish.name}`, rect.x + 14, rect.y + 20, 19, "#3d2408", "left", 800);
    label(ctx, order.customer, rect.x + 14, rect.y + 44, 14, "#8a6a44", "left", 600);
    label(ctx, `${dish.points} pts`, rect.x + rect.w - 14, rect.y + 20, 16, "#c2510d", "right", 800);
    // Ingredient steps as mini chips
    dish.steps.forEach((stepId, stepIndex) => {
      const chipX = rect.x + 14 + stepIndex * 40;
      const chipY = rect.y + 66;
      ctx.fillStyle = ingredientById(stepId).color;
      ctx.beginPath(); ctx.arc(chipX + 12, chipY, 12, 0, Math.PI * 2); ctx.fill();
      label(ctx, String(stepIndex + 1), chipX + 12, chipY + 1, 12, "#3d2408", "center", 800);
    });
    // Per-order countdown bar
    const frac = Math.max(0, order.timeLeft / order.timeLimit);
    ctx.fillStyle = "#e8dcc4";
    roundedRect(ctx, rect.x + 190, rect.y + 58, 128, 14, 7); ctx.fill();
    fillRound(ctx, { x: rect.x + 190, y: rect.y + 58, w: 128 * frac, h: 14 }, 7, frac < 0.3 ? "#ef476f" : "#ffb703");
    label(ctx, `${Math.ceil(order.timeLeft)}s`, rect.x + 254, rect.y + 50, 13, "#8a6a44", "center", 700);
  });
  if (state.orders.length === 0) {
    label(ctx, "No orders — enjoy the quiet!", ORDER_BOARD.x + 180, ORDER_BOARD.y + 180, 18, "#8a6a44", "center");
  }
  void phase;
}

function drawKitchen(ctx, state) {
  fillRound(ctx, KITCHEN, 18, "#3a2a5e");
  // Window with moon
  fillRound(ctx, { x: KITCHEN.x + 26, y: KITCHEN.y + 22, w: 190, h: 150 }, 14, "#171233");
  ctx.fillStyle = "#ffeeb0";
  ctx.beginPath(); ctx.arc(KITCHEN.x + 160, KITCHEN.y + 66, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#171233";
  ctx.beginPath(); ctx.arc(KITCHEN.x + 176, KITCHEN.y + 56, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (const [sx, sy] of [[50, 44], [86, 110], [52, 140], [196, 130], [120, 36]]) {
    ctx.beginPath(); ctx.arc(KITCHEN.x + sx, KITCHEN.y + sy, 2.4, 0, Math.PI * 2); ctx.fill();
  }
  label(ctx, "the night shift window", KITCHEN.x + 121, KITCHEN.y + 192, 14, "#cbb8ff", "center", 600);

  // Shelf with jars
  ctx.fillStyle = "#8a5a33";
  ctx.fillRect(KITCHEN.x + 250, KITCHEN.y + 60, 300, 12);
  const jarColors = ["#ef476f", "#ffb703", "#57cc5e", "#f6c945", "#ff8fa3"];
  jarColors.forEach((color, i) => {
    const jx = KITCHEN.x + 268 + i * 58;
    fillRound(ctx, { x: jx, y: KITCHEN.y + 24, w: 36, h: 36 }, 8, color);
  });
  label(ctx, "spice shelf", KITCHEN.x + 400, KITCHEN.y + 92, 14, "#cbb8ff", "center", 600);

  // Hanging pans
  for (const px of [600, 668, 736]) {
    ctx.strokeStyle = "#cbb8ff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(KITCHEN.x + px, KITCHEN.y + 22); ctx.lineTo(KITCHEN.x + px, KITCHEN.y + 52); ctx.stroke();
    ctx.fillStyle = "#9aa3b2";
    ctx.beginPath(); ctx.arc(KITCHEN.x + px, KITCHEN.y + 76, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c3cad6";
    ctx.beginPath(); ctx.arc(KITCHEN.x + px - 6, KITCHEN.y + 70, 9, 0, Math.PI * 2); ctx.fill();
  }

  // Stove and steaming pot
  fillRound(ctx, { x: KITCHEN.x + 240, y: KITCHEN.y + 216, w: 340, h: 96 }, 14, "#57406e");
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath(); ctx.ellipse(KITCHEN.x + 410, KITCHEN.y + 300, 86, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#39424f";
  roundedRect(ctx, KITCHEN.x + 322, KITCHEN.y + 190, 176, 92, 16); ctx.fill();
  ctx.fillStyle = "#4d5969";
  ctx.fillRect(KITCHEN.x + 322, KITCHEN.y + 190, 176, 16);
  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 4; ctx.lineCap = "round";
  const wobble = Math.sin(state.elapsed * 2.4) * 4;
  for (const dx of [-44, 0, 44]) {
    ctx.beginPath();
    ctx.moveTo(KITCHEN.x + 410 + dx, KITCHEN.y + 178);
    ctx.bezierCurveTo(KITCHEN.x + 410 + dx + wobble, KITCHEN.y + 156, KITCHEN.x + 410 + dx - wobble, KITCHEN.y + 140, KITCHEN.x + 410 + dx, KITCHEN.y + 118);
    ctx.stroke();
  }
  label(ctx, "tonight's broth, always simmering", KITCHEN.x + 410, KITCHEN.y + 330 - 6, 14, "#cbb8ff", "center", 600);

  // Miso, the cat chef (our mascot, drawn from circles)
  const mx = KITCHEN.x + 716;
  const my = KITCHEN.y + 236;
  ctx.fillStyle = "#f7a072";
  ctx.beginPath(); ctx.arc(mx, my, 52, 0, Math.PI * 2); ctx.fill();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(mx + side * 34, my - 38);
    ctx.lineTo(mx + side * 52, my - 72);
    ctx.lineTo(mx + side * 12, my - 54);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, mx - 36, my - 96, 72, 34, 12); ctx.fill();
  ctx.beginPath(); ctx.arc(mx, my - 62, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3d2408";
  ctx.beginPath(); ctx.arc(mx - 18, my - 4, 5, 0, Math.PI * 2); ctx.arc(mx + 18, my - 4, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ef476f";
  ctx.beginPath(); ctx.moveTo(mx - 4, my + 10); ctx.lineTo(mx + 4, my + 10); ctx.lineTo(mx, my + 17); ctx.closePath(); ctx.fill();
  label(ctx, "Miso, head chef", mx, my + 74, 15, "#ffe9b8", "center", 800);
}

function drawPlatePanel(ctx, state) {
  fillRound(ctx, PLATE_PANEL, 18, "#fff4e0");
  label(ctx, "🍽 YOUR PLATE — building:", PLATE_PANEL.x + 20, PLATE_PANEL.y + 26, 21, "#5b3413", "left", 800);
  const order = currentOrder(state);
  const dish = order ? recipeById(order.recipeId) : null;
  label(ctx, dish ? dish.name : "—", PLATE_PANEL.x + 330, PLATE_PANEL.y + 26, 21, "#c2510d", "left", 800);

  // The plate itself, with ingredients stacked in the middle
  const plateCx = PLATE_PANEL.x + 128;
  const plateCy = PLATE_PANEL.y + 138;
  ctx.fillStyle = "#d9c9a8";
  ctx.beginPath(); ctx.ellipse(plateCx, plateCy + 8, 96, 30, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.ellipse(plateCx, plateCy, 96, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#b8d4ea"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(plateCx, plateCy, 74, 25, 0, 0, Math.PI * 2); ctx.stroke();
  state.plate.forEach((ingredientId, i) => {
    drawIngredientIcon(ctx, ingredientId, plateCx + (i % 3 - 1) * 30, plateCy - 6 - Math.floor(i / 3) * 16, 44);
  });
  if (state.plate.length === 0) {
    label(ctx, "empty plate", plateCx, plateCy + 52, 14, "#8a6a44", "center", 600);
  }

  // Step checklist: what the recipe wants vs what is on the plate
  const steps = dish ? dish.steps : [];
  steps.forEach((stepId, i) => {
    const rowY = PLATE_PANEL.y + 66 + i * 34;
    const onPlate = state.plate[i];
    const ok = onPlate === stepId;
    const wrong = onPlate !== undefined && !ok;
    fillRound(ctx, { x: PLATE_PANEL.x + 252, y: rowY - 14, w: 218, h: 28 }, 8, ok ? "#d9f5d0" : wrong ? "#ffd9d9" : "#ffffff");
    drawIngredientIcon(ctx, stepId, PLATE_PANEL.x + 272, rowY, 26);
    label(ctx, `${i + 1}. ${ingredientById(stepId).name}`, PLATE_PANEL.x + 292, rowY + 1, 16, "#3d2408", "left", 700);
    label(ctx, ok ? "✓" : wrong ? "✗" : "…", PLATE_PANEL.x + 448, rowY + 1, 17, ok ? "#2a9d5f" : wrong ? "#d90429" : "#8a6a44", "center", 800);
  });

  const progress = plateProgress(state);
  if (progress.complete) {
    fillRound(ctx, { x: PLATE_PANEL.x + 478, y: PLATE_PANEL.y + 56, w: 108, h: 84 }, 12, "#57cc5e");
    label(ctx, "READY", PLATE_PANEL.x + 532, PLATE_PANEL.y + 84, 20, "#ffffff", "center", 800);
    label(ctx, "TO SERVE!", PLATE_PANEL.x + 532, PLATE_PANEL.y + 110, 16, "#ffffff", "center", 800);
  } else {
    fillRound(ctx, { x: PLATE_PANEL.x + 478, y: PLATE_PANEL.y + 56, w: 108, h: 84 }, 12, "#e8dcc4");
    label(ctx, `${progress.matched}/${progress.total}`, PLATE_PANEL.x + 532, PLATE_PANEL.y + 88, 24, "#5b3413", "center", 800);
    label(ctx, "steps done", PLATE_PANEL.x + 532, PLATE_PANEL.y + 116, 13, "#8a6a44", "center", 600);
  }

  // Buttons
  fillRound(ctx, TRASH_BUTTON, 14, "#9aa3b2");
  label(ctx, "🗑 BIN IT  (X)", TRASH_BUTTON.x + TRASH_BUTTON.w / 2, TRASH_BUTTON.y + 31, 19, "#ffffff", "center", 800);
  fillRound(ctx, SERVE_BUTTON, 14, progress.complete ? "#2a9d5f" : "#ff8c42");
  label(ctx, "🔔 SERVE  (Space)", SERVE_BUTTON.x + SERVE_BUTTON.w / 2, SERVE_BUTTON.y + 31, 18, "#ffffff", "center", 800);
}

function drawCounter(ctx, state, phase) {
  fillRound(ctx, COUNTER, 18, "#7a4a26");
  label(ctx, "🥕 INGREDIENT COUNTER — click to add (in recipe order!)", COUNTER.x + 20, COUNTER.y + 26, 20, "#ffe9b8", "left", 800);
  const order = currentOrder(state);
  const nextStep = order ? recipeById(order.recipeId).steps[state.plate.length] : null;
  INGREDIENTS.forEach((ingredient, index) => {
    const rect = ingredientTileRect(index);
    const isNext = ingredient.id === nextStep;
    const pulse = isNext ? 3 + Math.sin(phase * 5) * 2 : 0;
    fillRound(ctx, { x: rect.x - pulse / 2, y: rect.y - pulse / 2, w: rect.w + pulse, h: rect.h + pulse }, 14, isNext ? "#ffe1a8" : "#fff7e8");
    if (isNext) {
      ctx.strokeStyle = "#ff8c42"; ctx.lineWidth = 4;
      roundedRect(ctx, rect.x - pulse / 2, rect.y - pulse / 2, rect.w + pulse, rect.h + pulse, 14); ctx.stroke();
    }
    drawIngredientIcon(ctx, ingredient.id, rect.x + rect.w / 2, rect.y + 36, 52);
    label(ctx, ingredient.name, rect.x + rect.w / 2, rect.y + 80, 16, "#3d2408", "center", 800);
    if (isNext) label(ctx, "▼ next", rect.x + rect.w / 2, rect.y + 12, 13, "#c2510d", "center", 800);
  });
}

function drawMessageBar(ctx, state) {
  const colors = { info: "#171233", good: "#1d5c38", bad: "#7f1d2d" };
  fillRound(ctx, { x: 20, y: 722, w: 1240, h: 58 }, 14, colors[state.messageKind] ?? colors.info);
  label(ctx, state.message, 640, 752, 21, "#ffffff", "center", 700);
}

function drawStartScreen(ctx, state) {
  drawKitchenBackdropOnly(ctx, state);
  ctx.fillStyle = "rgba(16,10,34,0.82)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  label(ctx, "🌙  MOONLIT NOODLE KITCHEN  🍜", 640, 190, 52, "#ffe9b8", "center", 800);
  label(ctx, "The little night kitchen where the whole town eats after dark.", 640, 248, 22, "#cbb8ff", "center", 600);
  const lines = [
    "📋  Orders land on the board — each with a ticking timer.",
    "🥕  Click ingredients on the counter to build the dish IN ORDER.",
    "🔔  Finish the plate, hit SERVE (or Space) before the timer runs out!",
    "🗑  Wrong stack? BIN IT (X) and start the plate again.",
    "⌨️  Keys 1-3 pick an order · Space serves · X bins the plate.",
    "⏱  You have 2 minutes and 3 hearts. Combos earn bonus points!",
  ];
  lines.forEach((line, i) => label(ctx, line, 640, 312 + i * 36, 21, "#ffffff", "center", 600));
  fillRound(ctx, BIG_BUTTON, 20, "#ff8c42");
  label(ctx, "▶  START COOKING", 640, BIG_BUTTON.y + 40, 28, "#ffffff", "center", 800);
  label(ctx, "an original kitchen game · headphones not required, appetite is", 640, 664, 16, "#8f83b8", "center", 600);
}

function drawKitchenBackdropOnly(ctx, state) {
  drawOrderBoard(ctx, { ...state, orders: state.orders }, 0);
  drawKitchen(ctx, state);
  drawPlatePanel(ctx, state);
  drawCounter(ctx, state, 0);
}

function drawEndScreen(ctx, state) {
  drawKitchenBackdropOnly(ctx, state);
  ctx.fillStyle = "rgba(16,10,34,0.85)";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  label(ctx, "🌙  SERVICE OVER!  🌙", 640, 210, 50, "#ffe9b8", "center", 800);
  label(ctx, `Final score: ${state.score} points`, 640, 292, 36, "#ffffff", "center", 800);
  label(ctx, `Dishes served: ${state.served}      Best combo: x${state.bestCombo}`, 640, 348, 24, "#cbb8ff", "center", 700);
  const verdict =
    state.served >= 8 ? "The town is dreaming of your cooking. Legendary night!" :
    state.served >= 5 ? "A delicious shift — the regulars will be back." :
    state.served >= 2 ? "A warm start. Miso believes in you." :
    "Miso ate the leftovers. Practice makes perfect!";
  label(ctx, verdict, 640, 404, 22, "#ffe9b8", "center", 600);
  fillRound(ctx, BIG_BUTTON, 20, "#2a9d5f");
  label(ctx, "↻  COOK AGAIN", 640, BIG_BUTTON.y + 40, 28, "#ffffff", "center", 800);
}

export function drawGame(ctx, state, phase = 0) {
  drawBackground(ctx);
  const shakeX = state.shake > 0 ? Math.sin(phase * 60) * 6 * state.shake : 0;
  ctx.save();
  ctx.translate(shakeX, 0);
  drawHud(ctx, state);
  if (state.screen === "start") {
    drawStartScreen(ctx, state);
  } else if (state.screen === "end") {
    drawEndScreen(ctx, state);
  } else {
    drawOrderBoard(ctx, state, phase);
    drawKitchen(ctx, state);
    drawPlatePanel(ctx, state);
    drawCounter(ctx, state, phase);
    drawMessageBar(ctx, state);
  }
  ctx.restore();
}
