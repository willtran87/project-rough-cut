import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout,onFloor} from '../web/under-green-course.js';
import {buildDistrictEnclosure,DISTRICT_WELLS} from '../web/under-green-district-enclosure.js';
import {GATE_ROOF_SLOT} from '../web/under-green-layout.js';
const layout=floorLayout(),out='output/under-green/visual-upgrade/pass31-source';
// Pass 31 rotated knee-brace joinery. The original audit diffed against an
// untracked pre-pass copy of the enclosure module; members are now checked
// directly on the current build (which also requires the shared wood material).
function collect(build){const boxes=[],members=[],materials={mudBank:new T.MeshPhongMaterial({vertexColors:true}),root:new T.MeshPhongMaterial({vertexColors:true}),machineIron:new T.MeshPhongMaterial(),wood:new T.MeshPhongMaterial()};materials.machineIron.userData.drainUVMetres=1;
 const stats=build({layout,materials,box(...args){boxes.push(args);},put(g,type,x,y,z){// Only the rotated box knee braces; shaped shoring timbers and range lining
 // carry their own UV contracts (verify-under-green-bunker-shoring etc.).
 if(!g.userData.preserveDrainUV||g.type!=='BoxGeometry')return;const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,points=[];for(let i=0;i<p.count;i++){points.push([p.getX(i)+x,p.getY(i)+y,p.getZ(i)+z]);assert(Number.isFinite(uv.getX(i)+uv.getY(i)));}
 const span=materials[type].userData.drainUVMetres||2;
 for(let face=0;face<6;face++){const i=face*4;for(const j of [1,2]){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+j),d=a.distanceTo(b),t=Math.hypot(uv.getX(i)-uv.getX(i+j),uv.getY(i)-uv.getY(i+j));assert(Math.abs(t*span-d)<1e-5,'Rotated member UV scale changed');}}
 members.push({type,points});}});if(build===buildDistrictEnclosure){assert(!materials.bankEarth.vertexColors);assert(!materials.shoringWood.vertexColors);}return {boxes,members,stats};}
const b=collect(buildDistrictEnclosure);
assert(Math.abs(Math.min(...b.boxes.map(v=>v[2]-v[5]/2))-b.stats.minimumHeight)<1e-8,'Reported overall enclosure floor changed');assert(b.members.length>0);
// Bunker knees are now shaped shoring timbers (pass 67) counted per frame.
const braces=b.members,shoringKnees=b.stats.bunkerShoring.reduce((n,f)=>n+f.knees,0);assert(shoringKnees>0);assert.equal(braces.length,b.stats.kneeBraces-shoringKnees);let min=Infinity;
for(const m of braces){for(const [x,y,z]of m.points){min=Math.min(min,y);assert(y>=3.4);}const y=Math.min(...m.points.map(p=>p[1])),low=m.points.filter(p=>p[1]<y+.2),x=low.reduce((s,p)=>s+p[0],0)/low.length,z=low.reduce((s,p)=>s+p[2],0)/low.length;assert(!onFloor(x-.35,-z)||!onFloor(x+.35,-z),'Brace must anchor at an outer wall');}
const report={passed:true,after:b.stats,rotatedMembers:b.members.length,kneeBraces:braces.length,minimumBraceHeight:min};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/joinery-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
