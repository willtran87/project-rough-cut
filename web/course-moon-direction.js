// One bearing for the painted moon and Level 1's physical source. The short
// offset keeps the existing shadow camera's depth range around the player.
export const SKY_MOON_POSITION=Object.freeze([-280,280,-720]);
export const COURSE_MOON_OFFSET=Object.freeze(SKY_MOON_POSITION.map(v=>v/20));
