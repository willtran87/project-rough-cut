// Gameplay retains its normal cadence. Idle screens only poll controllers;
// their owners repaint on a state change, not on every display refresh.
export function createMenuFrameGate() {
  let nextPoll = 0;
  return (now, active) => {
    if (document.hidden || (!active && !document.hasFocus())) {
      nextPoll = now;
      return false;
    }
    if (active) { nextPoll = now; return true; }
    if (now < nextPoll) return false;
    nextPoll = now + 50;
    return true;
  };
}
