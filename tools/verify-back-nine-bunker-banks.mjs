import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE,navigationStats} from '../web/back-nine-course.js';
import {buildBunkerBanks,bunkerBankHeight,BUNKER_BANK_SEGMENTS} from '../web/back-nine-bunker-banks.js';
import {routeDistanceXY} from '../web/back-nine-landscape.js';
import {contourGround,terrainHeight} from '../web/course-terrain.js';

const initial=JSON.stringify(COURSE),nav=navigationStats(),results=[];
let vertices=0,triangles=0,pathSamples=0,featherVertices=0;
for(const s of COURSE.sand){
 const bank=buildBunkerBanks(s,COURSE.paths);
 assert.equal(bank.parts.filter(p=>!['footprint','raking'].includes(p.role)).length,4);
 assert(bank.stats.footprints>0&&bank.stats.footprints<=8);
 for(const {geometry:g,type,role}of bank.parts){
  for(const attribute of Object.values(g.attributes))for(const value of attribute.array)assert(Number.isFinite(value));
  const p=g.attributes.position,c=g.attributes.color;
  for(let i=0;i<g.index.count;i+=3){
   const [a,b,d]=[0,1,2].map(j=>g.index.getX(i+j));
   const up=(p.getZ(b)-p.getZ(a))*(p.getX(d)-p.getX(a))-(p.getX(b)-p.getX(a))*(p.getZ(d)-p.getZ(a));
   assert(up>0,'every rendered source face points upward and has area');
  }
  if(role==='footprint'||role==='raking')assert.equal(type,'sandMargin','footprints render after the sand shoulder');
  else{
   const stride=BUNKER_BANK_SEGMENTS+1;
   for(let row=0;row<p.count/stride;row++){
    const a=row*stride,b=a+BUNKER_BANK_SEGMENTS;
    assert(Math.abs(p.getX(a)-p.getX(b))<1e-5&&Math.abs(p.getZ(a)-p.getZ(b))<1e-5,'closed bank seam');
    if(c.itemSize===4)assert(Math.abs(c.getW(a)-c.getW(b))<1e-6);
   }
   if(role!=='core')for(let i=p.count-stride;i<p.count;i++)assert.equal(c.getW(i),0,'outer edge feathers fully into the ground');
  }
  for(let i=0;i<p.count;i++)if(routeDistanceXY(p.getX(i),-p.getZ(i),COURSE.paths)<3.349){assert(p.getY(i)<=.03001,'no raised lip crosses a cart route');pathSamples++;}
  const ground=contourGround(THREE,g,{retainFlatTriangles:!!g.userData.bunkerSurface}),gp=ground.attributes.position,gc=ground.attributes.color;
  assert.equal(gc.itemSize,c.itemSize);
  for(let i=0;i<gp.count;i++){
   const height=gp.getY(i)-terrainHeight(gp.getX(i),-gp.getZ(i));
   assert(height>.0279&&height<.181,'geometry follows the common terrain without sinking or floating');
   if(role==='core')assert(Math.abs(height-.028)<1e-4);
   if(gc.itemSize===4){assert(gc.getW(i)>=0&&gc.getW(i)<=1);if(gc.getW(i)>0&&gc.getW(i)<1)featherVertices++;}
  }
  // The terrain tessellator must keep the surface above the ground between
  // vertices too, especially on the sloping western bunker.
  for(let i=0;i<ground.index.count;i+=3){
   const ids=[0,1,2].map(j=>ground.index.getX(i+j));
   const x=ids.reduce((n,id)=>n+gp.getX(id),0)/3,y=ids.reduce((n,id)=>n+gp.getY(id),0)/3,z=ids.reduce((n,id)=>n+gp.getZ(id),0)/3;
   assert(y-terrainHeight(x,-z)>.0278,'triangle interior clears terrain');
  }
  vertices+=gp.count;triangles+=ground.index.count/3;ground.dispose();g.dispose();
 }
 results.push(bank.stats);
}
assert(pathSamples>0);assert(featherVertices>1000);
for(let r=0;r<=1.3;r+=.001){assert.equal(bunkerBankHeight(r,3.35),0);assert(bunkerBankHeight(r,10)>=0&&bunkerBankHeight(r,10)<=.148);}
assert.equal(JSON.stringify(COURSE),initial);assert.deepEqual(navigationStats(),nav);
const report={passed:true,vertices,triangles,pathSamples,featherVertices,results,checks:['finite upward geometry and closed seams','transparent outer bank edges','road approaches remain flat','shared terrain contact including triangle interiors','footprints share the top sand batch','course and navigation unchanged']};
const out=process.argv[2]||'output/back-nine-visual-upgrade/bunker-banks';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
