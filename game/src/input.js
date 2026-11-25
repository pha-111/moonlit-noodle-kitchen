// Mouse and keyboard handling. The canvas is a fixed logical size;
// pointer positions are scaled from the element's on-screen size so
// clicks land in the same place at any window size.

import { VIEW_HEIGHT, VIEW_WIDTH } from "./render.js";

function toLogical(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * VIEW_WIDTH,
    y: ((event.clientY - box.top) / box.height) * VIEW_HEIGHT,
  };
}

export function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h
  );
}

/**
 * Wire up a canvas. `handlers` provides onTap(point) and onKey(key);
 * both are plain callbacks owned by main.js.
 */
export function attachInput(canvas, handlers) {
  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    handlers.onTap(toLogical(canvas, event));
  });
  window.addEventListener("keydown", (event) => {
    handlers.onKey(event.key);
  });
}
