import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {floodShoreField} from '../web/under-green-flood-shore.js';
const layout=floorLayout(),start=performance.now(),field=floodShoreField(layout),buildMs=performance.now()-start;
const walls=layout.walls.map(w=>new THREE.Box2(new THREE.Vector2(w.x-w.w/2,w.y-w.d/2),new THREE.Vector2(w.x+w.w/2,w.y+w.d/2)));
let samples=0,maxError=0,near=0,far=0;
for(let row=0;row<field.height;row+=13)for(let col=0;col<field.width;col+=11){
 const point=new THREE.Vector2(field.minX+(col+.5)/field.width*field.spanX,field.minY+(row+.5)/field.height*field.spanY);
 const expected=Math.min(1,...walls.map(b=>b.distanceToPoint(point))),actual=field.data[row*field.width+col]/255,error=Math.abs(actual-expected);
 maxError=Math.max(maxError,error);assert(error<=.5/255+1e-12);samples++;if(actual<.1)near++;if(actual===1)far++;
}
assert(near>100&&far>1000);assert(field.data.byteLength<1_500_000);
assert.deepEqual(floodShoreField(layout).data,field.data,'Stationary shore field must be deterministic');
const report={passed:true,size:[field.width,field.height],bytes:field.data.byteLength,buildMs,samples,maxError,near,far};
fs.writeFileSync('output/under-green/visual-pass84/shore-field.json',JSON.stringify(report,null,2));console.log(report);
