import assert from 'node:assert/strict';
import fs from 'node:fs';
import {floorLayout} from '../web/under-green-course.js';
import {COURSE_SHAFTS,ROOF_OPENINGS,roofPanels} from '../web/under-green-overhead.js';
const tiles=floorLayout().tiles,panels=roofPanels(tiles),area=rects=>rects.reduce((n,r)=>n+r.w*r.d,0);
const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2))*Math.max(0,Math.min(a.y+a.d/2,b.y+b.d/2)-Math.max(a.y-a.d/2,b.y-b.d/2));
const removed=tiles.filter(t=>t.covered).reduce((sum,t)=>sum+ROOF_OPENINGS.reduce((n,hole)=>n+overlap(t,hole),0),0);
const expected=area(tiles.filter(t=>t.covered))-removed;
assert(Math.abs(area(panels)-expected)<1e-7);
for(const p of panels){assert(p.w>0&&p.d>0);for(const s of ROOF_OPENINGS)assert(overlap(p,s)<1e-8);}
for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++)assert(overlap(panels[i],panels[j])<1e-8);
// A hole spanning four tiles must leave the same roof as one spanning a single
// panel. Also exercise a partial-edge cut and an aperture outside the roof.
const square=[{x:0,y:0,w:4,d:4,covered:true}],split=[-1,1].flatMap(x=>[-1,1].map(y=>({x,y,w:2,d:2,covered:true})));
for(const holes of [[{x:0,y:0,w:1,d:1}],[{x:2,y:0,w:2,d:2}],[{x:8,y:8,w:2,d:2}]])assert(Math.abs(area(roofPanels(square,holes))-area(roofPanels(split,holes)))<1e-8);
const result={passed:true,coveredArea:area(tiles.filter(t=>t.covered)),roofArea:area(panels),courseApertureArea:area(COURSE_SHAFTS),removedArea:removed,openings:ROOF_OPENINGS,panels:panels.length,checks:['Actual covered-floor union loses exactly the intersecting aperture area, including the gate pocket at the roof edge; no overlapping roof strips or roof across an aperture','Cross-tile, edge and outside apertures preserve unaffected roof area']};
fs.mkdirSync('output/under-green/overhead',{recursive:true});fs.writeFileSync('output/under-green/overhead/rules.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
