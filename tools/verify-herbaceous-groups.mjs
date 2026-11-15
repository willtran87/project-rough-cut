import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DETAIL_PLANTS,PLANTING_SWEEPS,plantingGroupProfile} from '../web/back-nine-planting.js';
const root='output/back-nine-visual-upgrade/herbaceous-groups';
let oldSource=fs.readFileSync(root+'/baseline-source/back-nine-planting.js','utf8');
oldSource=oldSource.replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL('../web/'+p.slice(2),import.meta.url).href}'`);
const before=await import('data:text/javascript;base64,'+Buffer.from(oldSource).toString('base64'));
const changed=PLANTING_SWEEPS.filter(s=>s.islands),results=[];
assert.equal(changed.length,3);
for(const sweep of PLANTING_SWEEPS){
 const current=DETAIL_PLANTS.filter(p=>p.cluster===sweep.id),previous=before.DETAIL_PLANTS.filter(p=>p.cluster===sweep.id);
 if(!sweep.islands){assert.deepEqual(current,previous,sweep.id+' unrelated drift unchanged');continue;}
 const counts=[];
 const centerAt=d=>{for(let i=1;i<sweep.axis.length;i++){const a=sweep.axis[i-1],b=sweep.axis[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=length)return [a[0]+(b[0]-a[0])*d/length,a[1]+(b[1]-a[1])*d/length];d-=length;}throw Error('island outside axis');};
 for(let i=0;i<sweep.islands.length;i++){
  const [center,radius,width,height]=sweep.islands[i],profile=plantingGroupProfile(sweep,center);
  assert.equal(profile.coverage,1);assert.equal(profile.width,width);assert.equal(profile.height,height);
  assert.equal(plantingGroupProfile(sweep,center-radius).coverage,0);assert.equal(plantingGroupProfile(sweep,center+radius).coverage,0);
  assert(plantingGroupProfile(sweep,center+radius*.8).height<height*.6,'ends feather down');
  const [x,y]=centerAt(center),plants=current.filter(p=>Math.hypot(p.x-x,p.y-y)<radius*1.15);
  assert(plants.length>=4,sweep.id+' island '+i+' survives gameplay clearance');counts.push(plants.length);
  if(i){const previousEnd=sweep.islands[i-1][0]+sweep.islands[i-1][1],gap=center-radius-previousEnd;assert(gap>=2,'at least 2m between source groups');assert.equal(plantingGroupProfile(sweep,(previousEnd+center-radius)/2).coverage,0);}
 }
 const tall=plants=>plants.filter(p=>p.h>1.2).length;
 assert(tall(current)<tall(previous),sweep.id+' fewer tall screens');
 results.push({id:sweep.id,plants:[previous.length,current.length],tall:[tall(previous),tall(current)],islandPlants:counts});
}
assert(DETAIL_PLANTS.length<before.DETAIL_PLANTS.length);
const report={passed:true,plants:[before.DETAIL_PLANTS.length,DETAIL_PLANTS.length],groups:results,unchangedDrifts:PLANTING_SWEEPS.length-changed.length};
fs.writeFileSync(root+'/groups.json',JSON.stringify(report,null,2));console.log(report);
