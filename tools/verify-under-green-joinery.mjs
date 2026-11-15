import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout,onFloor} from '../web/under-green-course.js';
import {buildDistrictEnclosure,DISTRICT_WELLS} from '../web/under-green-district-enclosure.js';
import {GATE_ROOF_SLOT} from '../web/under-green-layout.js';
const layout=floorLayout(),out='output/under-green/visual-upgrade/pass31-source';
let src=fs.readFileSync(out+'/under-green-district-enclosure-before.js','utf8').replace(/from '\.\/([^']+)'/g,(_,f)=>`from '${pathToFileURL(process.cwd()+'/web/'+f).href}'`);
const before=(await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'))).buildDistrictEnclosure;
function collect(build){const boxes=[],members=[],materials={mudBank:new T.MeshPhongMaterial({vertexColors:true}),root:new T.MeshPhongMaterial({vertexColors:true}),machineIron:new T.MeshPhongMaterial()};materials.machineIron.userData.drainUVMetres=1;
 const stats=build({layout,materials,box(...args){boxes.push(args);},put(g,type,x,y,z){if(!g.userData.preserveDrainUV)return;const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,points=[];for(let i=0;i<p.count;i++){points.push([p.getX(i)+x,p.getY(i)+y,p.getZ(i)+z]);assert(Number.isFinite(uv.getX(i)+uv.getY(i)));}
 const span=materials[type].userData.drainUVMetres||2;
 for(let face=0;face<6;face++){const i=face*4;for(const j of [1,2]){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+j),d=a.distanceTo(b),t=Math.hypot(uv.getX(i)-uv.getX(i+j),uv.getY(i)-uv.getY(i+j));assert(Math.abs(t*span-d)<1e-5,'Rotated member UV scale changed');}}
 members.push({type,points});}});if(build===buildDistrictEnclosure){assert(!materials.bankEarth.vertexColors);assert(!materials.shoringWood.vertexColors);}return {boxes,members,stats};}
const a=collect(before),b=collect(buildDistrictEnclosure),existing=new Set(a.boxes.map(JSON.stringify)),added=b.boxes.filter(x=>!existing.has(JSON.stringify(x)));
assert.deepEqual(b.stats.wells,a.stats.wells);for(const key of ['bunkerPanels','rangePanels','supports'])assert.equal(b.stats[key],a.stats[key]);for(const box of a.boxes)assert(b.boxes.some(v=>JSON.stringify(v)===JSON.stringify(box)),'Existing roof or support moved');
assert(Math.abs(Math.min(...b.boxes.map(v=>v[2]-v[5]/2))-b.stats.minimumHeight)<1e-8,'Reported overall enclosure floor changed');assert(b.members.length>0);assert.equal(b.members.length,b.stats.kneeBraces);let min=Infinity;
for(const [type,x,y,z,w,h,d] of added){min=Math.min(min,y-h/2);assert(y-h/2>=3.4);for(const hole of [...DISTRICT_WELLS,GATE_ROOF_SLOT])assert(!(Math.abs(x-hole.x)<(w+hole.w)/2&&Math.abs(-z-hole.y)<(d+hole.d)/2),'Added member intersects inspection/gate shaft');}
for(const m of b.members){for(const [x,y,z]of m.points){min=Math.min(min,y);assert(y>=3.4);}const y=Math.min(...m.points.map(p=>p[1])),low=m.points.filter(p=>p[1]<y+.2),x=low.reduce((s,p)=>s+p[0],0)/low.length,z=low.reduce((s,p)=>s+p[2],0)/low.length;assert(!onFloor(x-.35,-z)||!onFloor(x+.35,-z),'Brace must anchor at an outer wall');}
const report={passed:true,baseline:a.stats,after:b.stats,addedBoxes:added.length,rotatedMembers:b.members.length,minimumAddedHeight:min,geometryTrianglesAdded:(added.length+b.members.length)*12};fs.writeFileSync(out+'/joinery-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
