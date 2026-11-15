import fs from 'node:fs';import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {practicalLightAnchors,createBackNinePracticalLights} from '../web/back-nine-practical-lights.js';
import {terrainHeight} from '../web/course-terrain.js';
const anchors=practicalLightAnchors([{x:0,z:-10},{x:6,z:-10},{x:-30,z:-200}],COURSE.checkpoints),field=createBackNinePracticalLights(anchors);
for(const a of anchors){assert(a.position.toArray().every(Number.isFinite));assert(a.power>0);}
assert.equal(anchors[0].position.y,terrainHeight(0,10)+.35);assert.equal(anchors[3].position.y,terrainHeight(0,300)+3.16);
let points=0;
for(let x=-41;x<=41;x+=1.7)for(let z=-817;z<14;z+=1.3){
 const ids=field.candidates(x,z);assert.equal(ids.length,new Set(ids).size);
 anchors.forEach((a,i)=>{if(Math.hypot(x-a.position.x,z-a.position.z)<8)assert(ids.includes(i),'field dropped source');});points++;
}
const map=field.textures[0],version=map.version;
for(let n=0;n<100;n++)field.update({y:n*8},n/100);assert.equal(map.version,version,'circuit never uploads static texture');
assert.deepEqual(field.stats().circuit,[792,.99]);
const material=new THREE.MeshLambertMaterial(),original=material.onBeforeCompile;field.apply(material);const wrapper=material.onBeforeCompile;field.apply(material);assert.equal(wrapper,material.onBeforeCompile);
const shader={uniforms:{},vertexShader:THREE.ShaderLib.lambert.vertexShader,fragmentShader:THREE.ShaderLib.lambert.fragmentShader};material.onBeforeCompile(shader,{});
assert(shader.fragmentShader.includes('RE_Direct(light,'));assert(shader.fragmentShader.includes('practicalDiffuse'));assert.equal(shader.uniforms.practicalLamps.value,map);
field.setStrength(0);assert.equal(shader.uniforms.practicalStrength.value,0);field.setStrength(1);
let disposals=0;map.addEventListener('dispose',()=>disposals++);const stats=field.stats();field.dispose();field.dispose();assert.equal(disposals,1);assert.equal(material.onBeforeCompile,original);material.dispose();
const report={passed:true,points,stats,checks:['All in-range sources retained through cell edges','Terrain-mounted fixture heights','Circuit updates do not reupload packed texture','Idempotent shader wrapping and disposal','Diagnostic source switch shares live shader uniform']};
const root='output/back-nine-visual-upgrade/practical-lights';fs.writeFileSync(root+'/rules.json',JSON.stringify(report,null,2));console.log(report);
