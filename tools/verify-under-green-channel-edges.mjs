import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WATERS} from '../web/under-green-layout.js';
import {waterPoint,waterLocal,onFloor} from '../web/under-green-course.js';
import {buildDrainChannelEdges,channelRetainingSpans,channelSiltProfile} from '../web/under-green-channel-edges.js';

const faces=[],meshes=[];
const stats=buildDrainChannelEdges({waters:WATERS,put(g,type,x,y,z,sx=1,sy=1,sz=1){const copy=g.clone();copy.scale(sx,sy,sz);copy.translate(x,y,z);(type==='mudBank'?meshes:faces).push({g:copy,type});}});
assert.equal(stats.grates.length,WATERS.length*2);assert.equal(meshes.length,stats.deposits.length);
let vertices=0,triangles=0,backingSamples=0;
for(const [i,{g,type}]of meshes.entries()){
 const d=stats.deposits[i],w=WATERS.find(w=>w.id===d.id),p=g.attributes.position,ix=g.index.array,edges=new Map();let volume=0,exposed=0;
 assert.equal(type,'mudBank');assert.equal(g.attributes.uv.count,p.count);assert.equal(g.attributes.color.count,p.count);
 for(let k=0;k<p.count;k++){
  const point={x:p.getX(k),y:-p.getZ(k)},local=waterLocal(point,w),h=p.getY(k);
  assert(Number.isFinite(h)&&h>=-.00801&&h<.353);
  assert(Math.abs(local.x)<=w.width/2-.10499);assert(Math.abs(local.x)>=w.width/2-.29001);
  assert(local.y>=d.start-.00001&&local.y<=d.end+.00001);
  if(h>.11&&Math.abs(local.x)<w.width/2-.12)exposed++;
  if(h>.015){const q=waterPoint(w,d.side*(w.width/2+.08),local.y);assert(!onFloor(q.x,q.y),'Raised silt must have real backing');backingSamples++;}
 }
 for(let k=0;k<ix.length;k+=3){
  const [a,b,c]=ix.slice(k,k+3);
  for(const [x,y]of [[a,b],[b,c],[c,a]]){const key=[Math.min(x,y),Math.max(x,y)].join(':');edges.set(key,(edges.get(key)||0)+1);}
  volume+=(p.getX(a)*(p.getY(b)*p.getZ(c)-p.getZ(b)*p.getY(c))+p.getY(a)*(p.getZ(b)*p.getX(c)-p.getX(b)*p.getZ(c))+p.getZ(a)*(p.getX(b)*p.getY(c)-p.getY(b)*p.getX(c)))/6;
 }
 assert([...edges.values()].every(n=>n===2),'Deposit must be closed');assert(volume>0,'Deposit winding must face out');
 assert(exposed>0,'Each bank must expose a shoulder above high water and in front of masonry');
 vertices+=p.count;triangles+=ix.length/3;g.dispose();
}
for(const {g,type}of faces){assert(['rubber','iron','steel'].includes(type));assert.equal(g.index.count,6);const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){assert(p.getY(i)<=.00181&&p.getY(i)>0);assert(n.getY(i)>.999);}g.dispose();}
for(let seed=0;seed<400;seed++)for(const t of [0,.01,.1,.5,.9,.99,1]){const v=channelSiltProfile(t,seed);assert(v.foot<=.29001&&v.height<=.35201);if(t===0||t===1)assert.equal(v.height,0);}
// A channel placed in the middle of the broad arrival floor must not create
// free-standing raised banks along nonexistent walls.
assert.deepEqual(channelRetainingSpans({x:0,y:8,width:2,depth:2}),[]);
const out='output/under-green/visual-pass62';fs.mkdirSync(out,{recursive:true});
const report={passed:true,grates:stats.grates.length,panels:stats.grates.reduce((n,g)=>n+g.panels,0),deposits:meshes.length,grateFaces:faces.length,grateTriangles:faces.length*2,vertices,triangles,backingSamples};fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(report);
