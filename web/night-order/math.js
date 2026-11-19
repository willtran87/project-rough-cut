// Pure numeric helpers shared across Night Order (no game state).
export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

export function smoothstep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function inverseLerp(a, b, value) {
  return clamp((value - a) / (b - a), 0, 1);
}

export function hash(value) {
  const raw = Math.sin(value * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

export function worldDistance(a, b) {
  return Math.hypot((a.x - b.x) * 0.72, a.y - b.y);
}

export function wrapRadians(angle) {
  let wrapped = angle;
  while (wrapped > Math.PI) {
    wrapped -= Math.PI * 2;
  }
  while (wrapped < -Math.PI) {
    wrapped += Math.PI * 2;
  }
  return wrapped;
}
