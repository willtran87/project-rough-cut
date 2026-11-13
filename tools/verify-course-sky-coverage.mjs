import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseSkyCoverage} from '../web/course-sky-coverage.js';
const coverage=createCourseSkyCoverage(),camera=new THREE.PerspectiveCamera(64,16/9,.1,110),p=new THREE.Vector3(),near=new THREE.Vector3(),far=new THREE.Vector3();let clipped=0,rays=0;
for(let i=0;i<2500;i++){
 const angle=i*2.399963,height=[360,450,540,720,1600][i%5];camera.aspect=[16/9,9/16,21/9,1][i%4];camera.fov=40+i%60;camera.far=60+i%120;
 camera.position.set(Math.sin(i*1.31)*80,1+i%25,-((i*127)%910-35));camera.lookAt(camera.position.x+Math.sin(angle)*20,camera.position.y-12+(i%27),camera.position.z-Math.cos(angle)*20);camera.rotateZ(Math.sin(i*5)*.35);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const rows=coverage.rows(camera,height);assert(rows>=0&&rows<=height);if(!rows)continue;clipped++;
 for(const x of [-1,-.75,-.25,0,.25,.75,1])for(const row of [0,rows*.5,rows-.1]){
  const y=row/height*2-1;near.set(x,y,-1).unproject(camera);far.set(x,y,1).unproject(camera);const t=(-.005-near.y)/(far.y-near.y);p.copy(near).lerp(far,t);
  assert(t>=0&&t<=1,'omitted ray intersects within camera depth');assert(p.x>=-42&&p.x<=42&&p.z>=-840&&p.z<=0,'omitted ray intersects opaque turf');rays++;
 }
}
camera.position.y=-1;assert.equal(coverage.rows(camera,540),0);assert(clipped>100);console.log(JSON.stringify({passed:true,cameras:2500,clipped,rays}));
