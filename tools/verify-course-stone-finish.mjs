import assert from 'node:assert/strict';
import {createStoneCourses} from '../web/course-stone-courses.js';
import {stoneFinishUV} from '../web/course-stone-finish.js';

const sizes=[[1.6,.96],[3.52,1.12],[1.6,.8],[4,1.28],[3.04,1.28]];
let vertices=0,triangles=0;
for(const [rx,rz]of sizes)for(const seed of [0,274,591]){
  const a=createStoneCourses(rx,rz,seed);
  assert(a.stones>0&&a.parts.length>0);
  for(let i=0;i<a.parts.length;i++){
    const g=a.parts[i].geometry;
    assert(g.attributes.normal&&g.attributes.normal.count===g.attributes.position.count&&g.index);
    const uv=g.attributes.uv;assert.equal(uv.count,g.attributes.position.count);
    for(let j=0;j<uv.count;j++){
      const x=uv.getX(j)*1024,y=(1-uv.getY(j))*512,col=Math.floor(x/128),row=Math.floor(y/64);
      assert(col>=0&&col<8&&row>=0&&row<5);
      assert(x-col*128>=7.999&&x-col*128<=120.001&&y-row*64>=3.999&&y-row*64<=60.001,'UV stays inside atlas gutters');
    }
    vertices+=g.attributes.position.count;triangles+=g.index.count/3;
    g.dispose();
  }
}
for(let row=0;row<5;row++)for(let variant=0;variant<8;variant++){
  const bottom=stoneFinishUV(row,variant,0,0),top=stoneFinishUV(row,variant,1,1);
  assert(top[0]>bottom[0]&&top[1]>bottom[1],'Damp bottom of canvas tile maps to the physical base');
}
console.log(JSON.stringify({passed:true,wallConfigurations:15,vertices,triangles,atlasFaces:40}));
