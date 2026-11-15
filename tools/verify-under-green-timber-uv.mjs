import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {applyDrainTimberUV} from '../web/under-green-timber-finish.js';
import {putCeilingOffshoot,putSecondaryRoot} from '../web/under-green-secondary-roots.js';

let faces=0;
for(const along of [0,1,2]){
 const g=new T.BoxGeometry(),scale=[.15,.18,.12];scale[along]=4;
 const unchanged=g.attributes.position.array.slice();applyDrainTimberUV(g,scale);
 assert.deepEqual(g.attributes.position.array,unchanged);
 const p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;
 for(let start=0;start<p.count;start+=4){
  const normal=[n.getX(start),n.getY(start),n.getZ(start)].map(Math.abs);
  if(normal[along]>.9)continue;
  for(let i=start;i<start+4;i++)assert(Math.abs(uv.getY(i)-p.array[i*3+along]*scale[along]/4)<1e-7,'Grain must follow member length');
  faces++;
 }
 g.dispose();
}
const handle=new T.CylinderGeometry(.024,.024,1.8,6),originalUV=handle.attributes.uv.array.slice();
applyDrainTimberUV(handle,[1,1,1]);
for(let i=0;i<handle.attributes.position.count;i++)if(Math.abs(handle.attributes.normal.getY(i))<.9){
 assert(Math.abs(handle.attributes.uv.getX(i)-originalUV[i*2]*Math.PI*2*.024/4)<1e-7);
 assert(Math.abs(handle.attributes.uv.getY(i)-originalUV[i*2+1]*1.8/4)<1e-7);
}
handle.dispose();
let roots=0,minHeight=Infinity;
const put=(g,type,x,y,z)=>{assert.equal(type,'root');assert(g.userData.preserveDrainUV);assert(g.attributes.color);g.computeBoundingBox();minHeight=Math.min(minHeight,g.boundingBox.min.y+y);for(const a of Object.values(g.attributes))assert([...a.array].every(Number.isFinite));roots++;};
for(let y=8;y<=72;y+=8)for(let i=0;i<3;i++)putCeilingOffshoot(put,Math.sin(y+i*4)*2.2,-y-i);
putSecondaryRoot(put,[[0,4.15,0],[.17,3.82,.09],[-.06,3.49,.19],[.16,3.24,.31]].map(p=>new T.Vector3(...p)),.055);
assert(minHeight>3.18);assert.equal(roots,28);
console.log(JSON.stringify({passed:true,longitudinalFaces:faces,roots,minHeight,cylindricalMetres:true}));
