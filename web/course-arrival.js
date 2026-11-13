// Simulation-time opening beat. The boundary is already locked when control
// begins: this is the latch settling, never an invisible change to collision.
export function freshCourseArrival() {
  return { age: 0, phase: 'waiting', lockAt: null, phoneCaptionShown: false };
}

export function advanceCourseArrival(arrival, dt, { active = true, skip = false } = {}) {
  if (!active || arrival.phase === 'skipped') return false;
  if (arrival.phase === 'complete') { arrival.age = Math.min(12, arrival.age + Math.max(0, dt)); return false; }
  if (skip) { arrival.phase = 'skipped'; return false; }
  arrival.age += Math.max(0, dt);
  if (arrival.phase === 'waiting' && arrival.age >= .55) {
    arrival.phase = 'latched';
    arrival.lockAt = arrival.age;
    return true;
  }
  if (arrival.phase === 'latched' && arrival.age - arrival.lockAt >= 2.4) arrival.phase = 'complete';
  return false;
}

export function arrivalPhoneVisible(arrival, clear = true) {
  return Boolean(clear && !arrival?.phoneDismissed && arrival?.lockAt !== null && ['latched','complete'].includes(arrival?.phase) && arrival.age-arrival.lockAt<6.2);
}

export function arrivalGatePose(arrival, impact = 0, reducedMotion = false, flashes = false) {
  const age = arrival?.lockAt === null || !arrival ? Infinity : arrival.age - arrival.lockAt;
  const latch = Math.max(0, 1 - age / 1.1);
  const contact = Math.max(0, Math.min(1, impact / .72));
  return {
    recoil: reducedMotion ? 0 : Math.sin(age < 1.1 ? age * 24 : (1 - contact) * 18) * Math.max(latch, contact) * .016,
    // One slow settling glow. Reduced flashing keeps the same steady indicator.
    lamp: flashes && !reducedMotion ? .65 + .35 * latch : .65,
    locked: true,
  };
}
