import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE_GREENS} from '../web/back-nine-landscape.js';
import {COURSE,navigationSnapshot} from '../web/back-nine-course.js';
import {turfConditionAt,createTurfConditionField,finishTurfCondition,TURF_CONDITION_AREAS,TURF_CONDITION_FIELD} from '../web/back-nine-turf-condition.js';
import {finishBackNineSurface} from '../web/back-nine-surface-finish.js';
import {finishMowerScarSoil} from '../web/back-nine-mower-scars.js';

const original=JSON.stringify({COURSE,nav:navigationSnapshot()}),field=createTurfConditionField(),{width,height,xMin,yMin,texelsPerMeter}=TURF_CONDITION_FIELD,data=field.image.data;
assert.equal(data.byteLength,563136);assert.equal(field.format,THREE.RGFormat);assert.equal(field.minFilter,THREE.LinearFilter);assert.equal(field.generateMipmaps,false);
export function sampleField(x,y){
 const u=(x-xMin)*texelsPerMeter-.5,v=(y-yMin)*texelsPerMeter-.5,ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;
 const value=(cx,cy,k)=>data[(Math.max(0,Math.min(height-1,cy))*width+Math.max(0,Math.min(width-1,cx)))*2+k]/255;
 return [0,1].map(k=>value(ix,iy,k)*(1-fx)*(1-fy)+value(ix+1,iy,k)*fx*(1-fy)+value(ix,iy+1,k)*(1-fx)*fy+value(ix+1,iy+1,k)*fx*fy);
}
let samples=0,maxError=0;
for(let y=0;y<835;y+=1.37)for(let x=-39;x<=39;x+=1.13){
 const a=turfConditionAt(x,y),b=sampleField(x,y);assert(Number.isFinite(a.dry+a.thin));assert(a.dry>=0&&a.thin>=0&&a.dry+a.thin<=.900001);
 maxError=Math.max(maxError,Math.abs(a.dry-b[0]),Math.abs(a.thin-b[1]));samples++;
}
assert(maxError<.025,'half-metre field preserves authored broad shape');
for(const area of TURF_CONDITION_AREAS){const w=sampleField(area.x,area.y);assert(w[0]+w[1]>.1,area.id+' appears in the field');}
let greenSamples=0;
for(const g of COURSE_GREENS)for(let r=0;r<=1.30;r+=.1)for(let i=0;i<80;i++){
 const a=i/80*Math.PI*2,w=sampleField(g.x+Math.cos(a)*g.rx*r,g.y+Math.sin(a)*g.ry*r);assert.deepEqual(w,[0,0],'maintained green and irregular fringe protected');greenSamples++;
}
for(const p of [[-100,100],[100,100],[0,-100],[0,900]])assert.deepEqual(sampleField(...p),[0,0],'no clamped strip beyond field');
for(const scar of [false,true]){
 const m=new THREE.MeshLambertMaterial();finishBackNineSurface(m,scar?'mown':'grass');if(scar)finishMowerScarSoil(m,null);finishTurfCondition(m,null,null,field);
 const s={uniforms:{},vertexShader:THREE.ShaderLib.lambert.vertexShader,fragmentShader:THREE.ShaderLib.lambert.fragmentShader};m.onBeforeCompile(s);
 assert.equal(s.uniforms.turfConditionField.value,field);assert(s.fragmentShader.includes('conditionedTurf(texture2D(map,vMapUv).rgb)'));
 if(scar)assert(s.fragmentShader.includes('texture2D(scarSoilMap,vTurfMeters/4.0).rgb'),'torn soil still bypasses intact turf');
 assert(!s.vertexShader.includes('attribute vec2 turfCondition'),'blend is independent of ground tessellation');m.dispose();
}
assert.equal(JSON.stringify({COURSE,nav:navigationSnapshot()}),original,'appearance does not mutate gameplay');
const clone=createTurfConditionField();assert.deepEqual(clone.image.data,data,'rebuild deterministic');clone.dispose();let disposed=0;field.addEventListener('dispose',()=>disposed++);field.dispose();assert.equal(disposed,1);
const report={passed:true,areas:TURF_CONDITION_AREAS.length,bytes:data.byteLength,samples,greenSamples,maxError,deterministic:true,gameplayUnchanged:true};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));console.log(JSON.stringify(report));
