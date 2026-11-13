import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {HYDRAULIC,hydraulicLayout} from '../web/final-cut-hydraulic-layout.js';
import {RIG_BANK,RIG_WHEELS,rigWheelAngle} from '../web/final-cut-rig.js';
const checks=[],samples=[],near=(a,b,t=3e-5)=>assert(Math.abs(a-b)<t,`${a} != ${b}`),geo=new THREE.CylinderGeometry(1,1,1,12,16),up=new THREE.Vector3(0,1,0),point=new THREE.Vector3(),direction=new THREE.Vector3(),object=new THREE.Object3D();let maxHoseError=0,minLength=Infinity,maxLength=0,clearanceSamples=0;
for(let n=0;n<=120;n++){
 const angle=1.15*n/120,pose=hydraulicLayout(angle,RIG_BANK);minLength=Math.min(minLength,pose.length);maxLength=Math.max(maxLength,pose.length);assert(pose.extension>.03&&pose.extension<.96);
 const rod=pose.parts.find(p=>p.id==='rod'),rodTail=pose.length-.06-HYDRAULIC.rodLength;near(Math.hypot(rod.end.side-rod.start.side,rod.end.height-rod.start.height,rod.end.forward-rod.start.forward),HYDRAULIC.rodLength);assert(rodTail>.135&&rodTail<HYDRAULIC.barrelEnd-.06,'Rigid piston rod stays inside the barrel throughout its stroke');
 for(let h=0;h<2;h++){const points=pose.hoses[h],length=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.side-points[i].side,p.height-points[i].height,p.forward-points[i].forward),0);maxHoseError=Math.max(maxHoseError,Math.abs(length-(h?1.18:.74)));near(length,h?1.18:.74);}
 // Check the real connection chain independently of the render buckets.
 const gap=(a,b)=>Math.hypot(a.side-b.side,a.height-b.height,a.forward-b.forward);
 for(let h=0;h<2;h++){
  const points=pose.hoses[h];assert.deepEqual(points[0],pose.parts.find(p=>p.id==='supply-'+h).end);assert.deepEqual(points.at(-1),pose.parts.find(p=>p.id==='port-'+h).end);
  for(const [end,a,b]of [['supply',points[0],points[1]],['port',points.at(-1),points.at(-2)]]){
   const crimp=pose.parts.find(p=>p.id===`hose-${h}-${end}-crimp`),sleeve=pose.parts.find(p=>p.id===`hose-${h}-${end}-sleeve`);assert(gap(a,b)>.112);near(gap(a,crimp.start),.003,1e-10);near(gap(crimp.start,crimp.end),.047,1e-10);assert.deepEqual(crimp.end,sleeve.start);near(gap(sleeve.start,sleeve.end),.062,1e-10);near(gap(a,sleeve.end),.112,1e-10);
  }
 }
 // Sample the conservative twelve-sided tube surfaces, including 16 longitudinal
 // subdivisions, against tyre envelopes at seven steering settings.
 for(const part of pose.parts.filter(p=>p.type==='tube')){
  const a=part.start,b=part.end;direction.set(b.side-a.side,b.height-a.height,-(b.forward-a.forward));object.position.set((a.side+b.side)/2,(a.height+b.height)/2,-(a.forward+b.forward)/2);object.scale.set(part.radius,direction.length(),part.radius);object.quaternion.setFromUnitVectors(up,direction.normalize());object.updateMatrix();
  for(const steering of [-.65,-.4,-.2,0,.2,.4,.65])for(let i=0;i<geo.attributes.position.count;i++){
   point.fromBufferAttribute(geo.attributes.position,i).applyMatrix4(object.matrix);const side=point.x,height=point.y,forward=-point.z;
   for(const wheel of RIG_WHEELS.filter(w=>w.side>0)){const yaw=rigWheelAngle({steering},wheel),c=Math.cos(yaw),s=Math.sin(yaw),dx=side-wheel.side,dy=forward-wheel.forward,localSide=dx*c-dy*s,localForward=dx*s+dy*c;
    assert(!(Math.abs(localSide)<(wheel.width+.04)/2-.001&&Math.hypot(height-wheel.height,localForward)<wheel.treadRadius-.001),`Tyre intersection angle=${angle} part=${part.id} steering=${steering} point=${[side,height,forward]}`);clearanceSamples++;
   }
   if(part.id.startsWith('hose-'))for(const x of [-1,1])for(const f of [-.8,1])assert(!(Math.abs(side-x)<.04&&Math.abs(forward-f)<.04&&height>1.3&&height<3.6),'Hose crosses cab pillar');
  }
 }
 samples.push({angle,length:pose.length,extension:pose.extension});
}
checks.push('121 deployment poses retain reachable barrel/rod stroke and both approximately fixed-length slack hoses');
checks.push('Sampled tube surfaces clear conservative tyre volumes at seven steering settings; hose samples clear cab posts');
for(const angle of [0,.098,.28,1.15]){const a=hydraulicLayout(angle,RIG_BANK);for(let i=0;i<10;i++)assert.strictEqual(hydraulicLayout(angle,RIG_BANK),a);}
checks.push('Both hoses terminate at physical supplies/ports; four crimp and strain-relief assemblies retain fixed lengths and contiguous joints through every fold');
checks.push('Repeated unchanged poses reuse bounded layout data instead of solving the hoses again');
fs.mkdirSync('output/final-cut/hydraulics',{recursive:true});fs.writeFileSync('output/final-cut/hydraulics/rules.json',JSON.stringify({passed:true,checks,minLength,maxLength,maxHoseError,clearanceSamples,samples},null,2));console.log(JSON.stringify({passed:true,checks,minLength,maxLength,maxHoseError,clearanceSamples}));
