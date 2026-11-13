// Small simulation-time helpers; pause and navigation remain owned by game.js.
export function advanceCartTimer(timer, dt) {
  let remainingDt = Math.max(0, dt), rang = false;
  if (timer.phase === 'winding') {
    const elapsed = Math.min(timer.remaining, remainingDt);
    timer.remaining = Math.max(0, timer.remaining - elapsed);
    remainingDt -= elapsed;
    if (timer.remaining > 1e-7) return { rang: false, expired: false };
    timer.remaining = 0;
    timer.phase = 'ringing';
    rang = true;
  }
  timer.ringRemaining = Math.max(0, timer.ringRemaining - remainingDt);
  return { rang, expired: timer.ringRemaining <= 1e-7 };
}

export function courseSoundMix(source, player, yaw) {
  const dx = (source.x - player.x) * .72, forward = source.y - player.y;
  const distance = Math.hypot(dx, forward);
  // Positive pan is the listener's right, including when facing back down-course.
  const side = dx * Math.cos(yaw) - forward * Math.sin(yaw);
  return { pan: Math.max(-.85, Math.min(.85, side / Math.max(1, distance))),
    gain: Math.max(.28, Math.min(1, 30 / Math.max(30, distance))) };
}
