import assert from 'node:assert/strict';
import fs from 'node:fs';
import {floorLayout} from '../web/under-green-course.js';
import {structureEdges} from '../web/under-green-structure.js';
import {bunkerBankFaceGeometry,bunkerBankProfile,bunkerBankSeams} from '../web/under-green-bunker-bank-face.js';
const edges=structureEdges(floorLayout().tiles).filter(e=>e.kind==='retaining'&&(e.axis==='x'?e.line:(e.start+e.end)/2)<-12),records=[];
for(const e of edges)for(let layer=0;layer<3;layer++){
 const g=bunkerBankFaceGeometry(e,layer),a=g.attributes.position,n=g.attributes.normal,idx=g.index,uses=new Map(),directed=new Map();
 for(let i=0;i<a.count;i++){assert([a.getX(i),a.getY(i),a.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite));assert(a.getY(i)>1.879&&a.getY(i)<4.901);const d=(e.axis==='x'?a.getX(i)-e.line:-a.getZ(i)-e.line)*-e.side;assert(d<=.23101&&d>=-.02501);}
 for(let i=0;i<idx.count;i+=3){const v=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];for(let j=0;j<3;j++){const x=v[j],y=v[(j+1)%3],key=[Math.min(x,y),Math.max(x,y)].join(':');uses.set(key,(uses.get(key)||0)+1);directed.set(key,(directed.get(key)||0)+(x<y?1:-1));}}
 assert([...uses.values()].every(v=>v===2),'Open bank geometry');assert([...directed.values()].every(v=>v===0),'Inconsistent winding');
 const face=a.count/2,inward=-e.side;let dots=0;for(let i=0;i<face;i++)dots+=e.axis==='x'?n.getX(i)*inward:-n.getZ(i)*inward;assert(dots>0,'Front points away from passage');
 for(let u=e.start;u<=e.end;u+=.1){const seams=bunkerBankSeams(e,u);assert(seams.every((v,i)=>!i||v>seams[i-1]));assert(bunkerBankProfile(e,u,3.2)<=.231);}
 records.push({edge:e,layer,vertices:a.count,triangles:idx.count/3});g.dispose();
}
const report={passed:true,edges:edges.length,parts:records.length,vertices:records.reduce((s,v)=>s+v.vertices,0),triangles:records.reduce((s,v)=>s+v.triangles,0),records};fs.mkdirSync('output/under-green/visual-pass104',{recursive:true});fs.writeFileSync('output/under-green/visual-pass104/geometry.json',JSON.stringify(report,null,2));console.log({...report,records:undefined});
