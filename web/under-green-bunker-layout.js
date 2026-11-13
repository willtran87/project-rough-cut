// This cut faces only the exterior of the level, never another playable route.
// Keep the existing 1.8m boundary wall; reveal the sand/soil bank above it.
export const BUNKER_BANK = Object.freeze({faceX:-32,near:52,far:72,turfTop:5.2});

export function isExposedBunkerEdge(edge) {
  return edge.kind === 'retaining' && edge.axis === 'x' &&
    Math.abs(edge.line - BUNKER_BANK.faceX) < 1e-6 && edge.side === -1 &&
    edge.start >= BUNKER_BANK.near && edge.end <= BUNKER_BANK.far;
}
