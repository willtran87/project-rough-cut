import * as THREE from './vendor/three/three.module.js';
import {KEEPER_NICHES} from './under-green-keeper-layout.js';

// Coordinates describe actual boundary walls. Long quiet intervals and one
// dominant root per composition replace uniformly distributed root curtains.
export const ROOT_COMPOSITIONS=Object.freeze([
 {id:'entrance-claw',axis:'x',boundary:5,side:-1,along:10.6,span:2.2,top:4.12,material:'rootStone',lean:-.8},
 {id:'crossing-strangle',axis:'x',boundary:-3,side:1,along:27.2,span:2.1,top:4.10,material:'rootStone',lean:.85},
 {id:'junction-split',axis:'x',boundary:-9,side:1,along:34.7,span:1.6,top:4.10,material:'rootStone',lean:-.55},
 {id:'bunker-taproot',axis:'x',boundary:-32,side:1,along:63.2,span:2.4,top:5.10,material:'sand',lean:.45},
 {id:'pump-buttress',axis:'x',boundary:-27,side:1,along:34.8,span:1.9,top:4.10,material:'pumpStone',lean:-.7},
 {id:'keeper-corner',axis:'y',boundary:11.35,side:1,along:8.9,span:1.35,top:4.10,material:'keeperStone',lean:.4}
]);

// Authored branch topology, in fractions of each wall composition's width and
// height. These are different growth patterns, not mirrored copies of a vine.
const BRANCH_SHAPES=[
 [{from:1,r:.31,p:[[-.48,.72],[-.87,.37],[-.75,.03]]},{from:2,r:.22,p:[[.48,.64],[.78,.50],[.92,.17]]},{from:3,r:.15,p:[[-.12,.29],[-.42,.13],[-.57,.04]]}],
 [{from:1,r:.29,p:[[-.48,.88],[-.81,.66],[-.32,.45],[.28,.36]]},{from:2,r:.25,p:[[.65,.60],[.80,.35],[.65,.05]]},{from:3,r:.14,p:[[-.25,.28],[-.59,.16],[-.72,.02]]}],
 [{from:1,r:.34,p:[[-.21,.67],[-.71,.39],[-.86,.03]]},{from:2,r:.21,p:[[.44,.48],[.79,.28],[.94,.03]]}],
 [{from:2,r:.24,p:[[-.29,.57],[-.55,.22],[-.87,.02]]},{from:3,r:.26,p:[[.46,.31],[.71,.17],[.88,.02]]},{from:1,r:.12,p:[[.42,.78],[.59,.67],[.71,.62]]}],
 [{from:1,r:.30,p:[[.46,.78],[.83,.68],[.94,.36]]},{from:2,r:.23,p:[[-.45,.52],[-.72,.29],[-.83,.03]]},{from:3,r:.17,p:[[.29,.27],[.54,.16],[.58,.03]]}],
 [{from:1,r:.24,p:[[-.48,.74],[-.77,.55],[-.82,.19]]},{from:2,r:.22,p:[[.44,.56],[.62,.29],[.53,.03]]}]
];

export function reservedRootWall(w){
 const axis=w.w<w.d?'x':'y',boundary=w[axis],along=w[axis==='x'?'y':'x'],length=axis==='x'?w.d:w.w;
 if(ROOT_COMPOSITIONS.some(c=>c.axis===axis&&Math.abs(c.boundary-boundary)<.02&&Math.abs(c.along-along)<c.span+length/2+.45))return true;
 if(KEEPER_NICHES.some(n=>n.axis===axis&&Math.abs(n.boundary-boundary)<.02&&Math.abs(n.along-along)<(n.width+length)/2+.25))return true;
 // Leave the keeper's framed course plan readable, with roots at its margins.
 return axis==='y'&&Math.abs(boundary-11.35)<.02&&along+length/2>10.3&&along-length/2<13.7;
}

export function buildDrainRootCompositions({root,put,materials,lowDetail,growth=null}){
 const block=new THREE.BoxGeometry(1,1,1),soil=new THREE.IcosahedronGeometry(1,1);
 // Damp soil is pinched beneath displaced mortar, with a subdued dry upper
 // lip. Reuse the existing mud material/batches rather than add another pass.
 const soilColors=[];for(let i=0;i<soil.attributes.position.count;i++){const y=soil.attributes.position.getY(i),tone=.68+Math.max(0,y)*.15;soilColors.push(tone,tone*.94,tone*.81);}
 soil.setAttribute('color',new THREE.Float32BufferAttribute(soilColors,3));
 materials.rootCrevice=new THREE.MeshLambertMaterial({color:0x151b13});
 let forks=0,hairs=0,embeddedEntries=0,soilPockets=0;
 for(let ci=0;ci<ROOT_COMPOSITIONS.length;ci++){
  const c=ROOT_COMPOSITIONS[ci],vertical=c.axis==='x',face=c.boundary+c.side*.125;
  const wall={vertical,face,side:c.side,boundary:c.boundary,maxIntrusion:.20};
  const point=(along,height,normal=.125)=>new THREE.Vector3(vertical?c.boundary+c.side*normal:along,height,-(vertical?along:c.boundary+c.side*normal));
  const main=[point(c.along-c.lean*.5,c.top,.03),point(c.along-c.lean*.2,c.top*.84),point(c.along+c.lean*.6,c.top*.65),point(c.along+c.lean,c.top*.4),point(c.along+c.lean*.7,.62),point(c.along+c.lean*.5,.035)];
  root(main,.46,wall,{taper:.35,branchPoints:BRANCH_SHAPES[ci].map(limb=>main[limb.from])});
  for(const limb of BRANCH_SHAPES[ci]){
   root([main[limb.from],...limb.p.map(([u,v])=>point(c.along+u*c.span,v*c.top))],limb.r,wall,{taper:.80});forks++;
  }
  // A returning, thinner root crosses and wraps the dominant limb, while its
  // flattened depth remains within the same wall-clearance allowance.
  if(ci!==3)root([point(c.along+c.span*.55,c.top),point(c.along+c.span*.18,c.top*.76,.18),point(c.along-c.span*.28,c.top*.56,.18),point(c.along+c.lean*.8,c.top*.32),point(c.along+.25,.15)],ci===1?.25:.16,wall);
  // Actual broken mortar and lifted brick pieces surround the entry. The dark
  // crevice is small, opaque and high on the wall; never a false doorway.
  const entry=main[1],entryAlong=vertical?-entry.z:entry.x;
  const crack=new THREE.Shape();
  for(let i=0;i<14;i++){
   const a=i/14*Math.PI*2,r=i%3===0?1:.8,px=Math.cos(a)*.54*r,py=Math.sin(a)*.39*r;
   if(i===0)crack.moveTo(px,py);else crack.lineTo(px,py);
  }
  crack.closePath();const gap=new THREE.ShapeGeometry(crack),at=point(entryAlong,entry.y,.112);
  put(gap,'rootCrevice',at.x,at.y,at.z,1,1,1,0,vertical?c.side*Math.PI/2:c.side===1?Math.PI:0);gap.dispose();
  for(let i=0;i<6;i++){
   const a=i*1.13+ci*.37,loc=point(entryAlong+Math.cos(a)*(.45+i%2*.1),entry.y+Math.sin(a)*.37,.138),width=.13+i%3*.047;
   put(block,c.material,loc.x,loc.y,loc.z,vertical?.085:width,.08+i%2*.04,vertical?width:.085,vertical?Math.sin(a)*.17:0,0,vertical?0:Math.sin(a)*.17);
  }
  for(let i=0;i<3;i++){
   const along=entryAlong+(i-1)*.34+(ci%2?.045:-.035),at=point(along,entry.y-.28-i%2*.085,.141);
   put(soil,'mudBank',at.x,at.y,at.z,vertical?.038:.17,.075+i%2*.035,vertical?.17:.038);soilPockets++;
  }
  embeddedEntries++;
  growth?.rootEntry(c,entryAlong,entry.y,ci);
  for(let i=0;i<(lowDetail?4:8);i++){
   const along=c.along+(i-3.5)*.13,h=c.top*.72-i%3*.08,start=point(along,h,.15);
   root([start,point(along+.06,h-.18,.16),point(along-.03,h-.34-i%2*.11,.14)],.012+i%3*.003,wall);hairs++;
  }
 }
 // The former rectangular gallery pillar becomes a massive living root.
 // It occupies the exact existing collider; fluting and braids stay inside it.
 const trunk=[new THREE.Vector3(-1.82,4.14,-15),new THREE.Vector3(-1.76,3.2,-15.02),new THREE.Vector3(-1.82,2.25,-14.96),new THREE.Vector3(-1.78,1.15,-15.03),new THREE.Vector3(-1.8,.03,-15)];
 root(trunk,.40,null,{taper:.12});
 for(let branch=0;branch<3;branch++){
  const points=[];for(let i=0;i<10;i++){const t=i/9,a=branch*Math.PI*2/3+t*3.7;points.push(new THREE.Vector3(-1.8+Math.cos(a)*.29,3.9-t*3.86,-15+Math.sin(a)*.29));}
  root(points,.105,null,{taper:.32});
 }
 // Two asymmetric ceiling forks carry that pillar's silhouette into the vault.
 for(const side of [-1,1])root([trunk[0],new THREE.Vector3(-1.8+side*.7,3.78,-15.2),new THREE.Vector3(-1.8+side*1.15,3.9,-16.1),new THREE.Vector3(-1.8+side*1.35,4.14,-16.8)],side<0?.23:.29,null,{taper:.8});
 block.dispose();soil.dispose();
 return {compositions:ROOT_COMPOSITIONS.map(c=>({id:c.id,axis:c.axis,boundary:c.boundary,along:c.along,span:c.span})),forks,hairs,embeddedEntries,soilPockets,pillar:{x:-1.8,y:15,w:1,d:1},maximumWallIntrusion:.20,maximumUpperIntrusion:.32,upperIntrusionStartsAt:2.3};
}
