import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE,pathDistance,blocked,surfaceAt,navigationStats} from '../web/back-nine-course.js';
import {COURSE_GREENS,COURSE_FAIRWAYS,buildEstateGround,bunkerLip,buildBunkerRouteEdges,routeDistanceXY,coursePatch} from '../web/back-nine-landscape.js';
const before=JSON.stringify(COURSE),checks=[],tees=[];
for(const f of COURSE_FAIRWAYS){
 const green=COURSE_GREENS.find(g=>g.hole===f.hole),last=f.spine.at(-1);assert(green);assert.deepEqual(last,[green.x,green.y]);assert.equal(f.spine.length,f.widths.length);
 const [x,y]=f.spine[0],yaw=Math.atan2(f.spine[1][0]-x,f.spine[1][1]-y);
 for(const a of [-3.5,0,3.5])for(const b of [-2.25,0,2.25]){
  const p={x:x+Math.cos(yaw)*a+Math.sin(yaw)*b,y:y-Math.sin(yaw)*a+Math.cos(yaw)*b};
  assert(!blocked(p,.1),'Tee footprint clears solids');assert(!['sand','wet'].includes(surfaceAt(p)),'Tee must not be laid over a hazard');
 }
 assert(pathDistance({x,y})>3,'Tee is off the driving lane');tees.push({hole:f.hole,x,y,surface:surfaceAt({x,y}),pathDistance:pathDistance({x,y})});
 assert(!blocked(green,.3));
 assert(!COURSE.obstacles.some(o=>((green.x-o.x)/green.rx)**2+((green.y-o.y)/green.ry)**2<1),'No equipment centre inside a putting green');
 const patch=coursePatch(THREE,green.hole,2.5),positions=patch.attributes.position;
 for(let i=1;i<positions.count;i++){const p={x:green.x+positions.getX(i)*green.rx,y:green.y-positions.getZ(i)*green.ry};assert(pathDistance(p)>3,'Putting green must not be sliced by a cart lane: '+green.hole);}
 patch.dispose();
}
checks.push('six paired tee/approach/green layouts; full tee footprints clear hazards and solids; no tee on driving lane; no equipment centre in greens');
let triangles=0,parts=0,walkSamples=0;const terrainBounds=new THREE.Box3(),world=new THREE.Matrix4(),v=new THREE.Vector3(),rotation=new THREE.Quaternion();
const put=(g,type,x,y,z,sx=1,sy=1,sz=1,ry=0)=>{rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),ry);world.compose(new THREE.Vector3(x,y,z),rotation,new THREE.Vector3(sx,sy,sz));const p=g.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(world);assert(v.toArray().every(Number.isFinite));if(['grass','fairway','fairwayCut','green'].includes(type))terrainBounds.expandByPoint(v);}
 if(type==='fairway'&&p.count===4&&Math.abs(p.getY(0)-.007)<1e-5){const a=new THREE.Vector3().fromBufferAttribute(p,0).add(new THREE.Vector3().fromBufferAttribute(p,1)).multiplyScalar(.5),b=new THREE.Vector3().fromBufferAttribute(p,2).add(new THREE.Vector3().fromBufferAttribute(p,3)).multiplyScalar(.5),n=Math.ceil(a.distanceTo(b)/.2);for(let i=0;i<=n;i++){v.copy(a).lerp(b,i/n);assert(!blocked({x:v.x,y:-v.z},.32),'Tee walk must not point into a solid object');walkSamples++;}}
 triangles+=(g.index?.count??p.count)/3;parts++;};
const box=(type,x,y,z,w,h,d,ry=0)=>{const g=new THREE.BoxGeometry(w,h,d);put(g,type,x,y,z,1,1,1,ry);g.dispose();};
const cylinder=new THREE.CylinderGeometry(1,1,1,12),circle=new THREE.CircleGeometry(1,28);circle.rotateX(-Math.PI/2);
const turfColors=Object.fromEntries(Object.entries({grass:0x455b43,fairway:0x687e5b,fairwayCut:0x718563,green:0x819279}).map(([k,c])=>[k,new THREE.Color(c)]));
const landscape=buildEstateGround({THREE,put,box,cylinder,circle,COURSE,turfColors});assert.equal(landscape.teeConnections,6,'Every separated tee has a mown connection');assert(terrainBounds.min.x>=-40&&terrainBounds.max.x<=40,'Playing turf stays within the course boundary');
const lips=[];for(const s of COURSE.sand){const g=bunkerLip(THREE,s,COURSE.paths),p=g.attributes.position,index=g.index.array;
 for(let i=0;i<index.length;i+=3){let x=0,y=0;for(let n=0;n<3;n++){x+=p.getX(index[i+n])/3;y-=p.getZ(index[i+n])/3;}assert(routeDistanceXY(s.x+x,s.y+y,COURSE.paths)>3,'Bunker bank cannot rise through a fast lane');}
 lips.push({x:s.x,y:s.y,triangles:index.length/3});g.dispose();
}
const edges=[];const count=buildBunkerRouteEdges({COURSE,box:(type,x,y,z,w,h,d,ry)=>{assert(y+h*.5<.075,'Kerb remains a shallow traversable detail');assert(pathDistance({x,y:-z})>2.85);edges.push({x,y:-z,height:y+h*.5});}});assert(count>0&&count<40);
assert.equal(JSON.stringify(COURSE),before,'Visual composition never mutates collisions or navigation');assert.equal(navigationStats().signature,2693326411);assert(navigationStats().baked);cylinder.dispose();circle.dispose();
checks.push('finite bounded static geometry; six tee walks; bank opens at real lane; shallow retaining edges; unchanged collision/pathing signature');
const report={passed:true,checks,tees,landscape,parts,triangles,walkSamples,terrainBounds:{min:terrainBounds.min.toArray(),max:terrainBounds.max.toArray()},lips,edges,navigation:navigationStats()};fs.mkdirSync('output/back-nine-experience/course-layout',{recursive:true});fs.writeFileSync('output/back-nine-experience/course-layout/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,edges:edges.length}));
