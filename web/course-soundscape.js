import {courseLook} from './course-atmosphere.js';

// Share the visual zone boundaries. These gains apply only to environmental
// flavor; mower, footsteps, interactions and spoken warnings have other buses.
const profiles={
 tee:{nature:1,pond:.6,shed:.4,radio:.4,fence:.7,bed:1},
 audit_row:{nature:.42,pond:.4,shed:.5,radio:.4,fence:.8,bed:.82},
 water_hazard:{nature:.7,pond:1,shed:.4,radio:.5,fence:.6,bed:.92},
 clubhouse_crossing:{nature:.35,pond:.55,shed:.5,radio:1,fence:.5,bed:.8},
 maintenance_maze:{nature:.18,pond:.3,shed:1,radio:.25,fence:1,bed:.75},
 dead_green:{nature:0,pond:0,shed:0,radio:0,fence:0,bed:.42},
 night_range:{nature:.12,pond:0,shed:.35,radio:.2,fence:1,bed:.85},
 release_corridor:{nature:.22,pond:.15,shed:1,radio:.1,fence:.5,bed:.75},
};
export function courseSoundscape(y){
 const {a,b,mix}=courseLook(Number.isFinite(y)?y:0),from=profiles[a.id],to=profiles[b.id];
 return {zone:mix<.5?a.id:b.id,...Object.fromEntries(Object.keys(from).map(k=>[k,from[k]+(to[k]-from[k])*mix]))};
}
