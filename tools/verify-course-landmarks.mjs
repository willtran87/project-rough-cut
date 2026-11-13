import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildCourseLandmarks,COURSE_LANDMARKS} from '../web/course-landmarks.js';
import {COURSE,navigationStats} from '../web/back-nine-course.js';
import {lampFlicker} from '../web/chase-night.js';

const snapshot=JSON.stringify(COURSE),bounds=COURSE_LANDMARKS.map(()=>new THREE.Box3()),counts=[0,0,0];let triangles=0;
function put(g,type,x,y,z,sx=1,sy=1,sz=1){const i=z> -250?0:z> -500?1:2,m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy,sz)),v=new THREE.Vector3();for(let n=0;n<g.attributes.position.count;n++)bounds[i].expandByPoint(v.fromBufferAttribute(g.attributes.position,n).applyMatrix4(m));counts[i]++;triangles+=(g.index?.count??g.attributes.position.count)/3;}
function box(type,x,y,z,w,h,d){const g=new THREE.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();}
const cylinder=new THREE.CylinderGeometry(1,1,1,12);buildCourseLandmarks({THREE,put,box,cylinder});cylinder.dispose();
// New supports stay inside existing solid structures; routes and baked paths
// cannot acquire a decorative collision or an unexplained overhanging wall.
const pump=COURSE.machinery.find(p=>p.y===190),range=COURSE.features.find(f=>f.id==='range-irrigation');
assert(bounds[0].min.x>=pump.x-1.8&&bounds[0].max.x<=pump.x+1.8);assert(bounds[0].min.z>=-pump.y-1.8&&bounds[0].max.z<=-pump.y+1.8);assert(bounds[0].min.y>=.6);
assert(bounds[1].min.x>=range.x-range.rx&&bounds[1].max.x<=range.x+range.rx);assert(bounds[1].min.z>=-range.y-range.ry&&bounds[1].max.z<=-range.y+range.ry);assert(bounds[1].min.y>1.15);
assert(bounds[2].min.y>8&&bounds[2].max.y<9.81);assert.equal(JSON.stringify(COURSE),snapshot);assert(navigationStats().baked);
const faults=[];
for(const station of [190,342,811]){let min=1,max=0,maxStep=0,last=lampFlicker(0,station);for(let i=0;i<3600;i++){const t=i/60,v=lampFlicker(t,station);min=Math.min(min,v);max=Math.max(max,v);maxStep=Math.max(maxStep,Math.abs(v-last));last=v;assert.equal(lampFlicker(t,station,0),1);assert.equal(lampFlicker(t,station,1,true),1);}assert(min>.58&&min<.65);assert(maxStep<.011);faults.push({station,min,max,maxStep});}
assert.notEqual(lampFlicker(14.73,190),lampFlicker(14.73,342));
const out='output/back-nine-experience/landmarks';fs.mkdirSync(out,{recursive:true});const report={passed:true,counts,triangles,bounds:bounds.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),faults,navigation:navigationStats()};fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
