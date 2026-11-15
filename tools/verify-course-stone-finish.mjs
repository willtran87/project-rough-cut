import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createStoneCourses} from '../web/course-stone-courses.js';
import {stoneFinishUV} from '../web/course-stone-finish.js';

const baselineSource=fs.readFileSync('output/level-one-stone-weathering/baseline-source/course-stone-courses.js','utf8').replaceAll("'./vendor/three/three.module.js'",JSON.stringify(pathToFileURL(process.cwd()+'/web/vendor/three/three.module.js').href)).replaceAll("'./course-cover-profile.js'",JSON.stringify(pathToFileURL(process.cwd()+'/web/course-cover-profile.js').href));
const old=await import('data:text/javascript;base64,'+Buffer.from(baselineSource).toString('base64'));
const sizes=[[1.6,.96],[3.52,1.12],[1.6,.8],[4,1.28],[3.04,1.28]];
let vertices=0,triangles=0;
for(const [rx,rz]of sizes)for(const seed of [0,274,591]){
  const a=createStoneCourses(rx,rz,seed),b=old.createStoneCourses(rx,rz,seed);
  assert.equal(a.stones,b.stones);assert.equal(a.parts.length,b.parts.length);
  for(let i=0;i<a.parts.length;i++){
    const g=a.parts[i].geometry,previous=b.parts[i].geometry;
    for(const attr of ['position','normal'])assert.deepEqual(g.attributes[attr].array,previous.attributes[attr].array,'Only surface coordinates may change');
    assert.deepEqual(g.index.array,previous.index.array);assert.equal(a.parts[i].palette,b.parts[i].palette);
    const uv=g.attributes.uv;assert.equal(uv.count,g.attributes.position.count);
    for(let j=0;j<uv.count;j++){
      const x=uv.getX(j)*1024,y=(1-uv.getY(j))*512,col=Math.floor(x/128),row=Math.floor(y/64);
      assert(col>=0&&col<8&&row>=0&&row<5);
      assert(x-col*128>=7.999&&x-col*128<=120.001&&y-row*64>=3.999&&y-row*64<=60.001,'UV stays inside atlas gutters');
    }
    vertices+=g.attributes.position.count;triangles+=g.index.count/3;
    g.dispose();previous.dispose();
  }
}
for(let row=0;row<5;row++)for(let variant=0;variant<8;variant++){
  const bottom=stoneFinishUV(row,variant,0,0),top=stoneFinishUV(row,variant,1,1);
  assert(top[0]>bottom[0]&&top[1]>bottom[1],'Damp bottom of canvas tile maps to the physical base');
}
console.log(JSON.stringify({passed:true,wallConfigurations:15,vertices,triangles,geometryAndNormalsExact:true,atlasFaces:40}));
