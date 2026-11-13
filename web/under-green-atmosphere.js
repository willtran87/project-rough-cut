import * as THREE from './vendor/three/three.module.js';
import {shadeDrainMaterial} from './under-green-crafted-surfaces.js';
import {buildDrainOrganicGeometry} from './under-green-organic-geometry.js';
export {mudDepositProfile} from './under-green-organic-geometry.js';
import {createDrainLampGlass} from './under-green-lamp-glass.js';
import {drainRootGeometry} from './under-green-root-geometry.js';
import {createDrainGrowth} from './under-green-growth.js';

// Uneven, independently phased power failures. The broad dips never strobe;
// simulation time freezes on pause, and reduced motion keeps a steady level.
export function dampLampLevel(time,index,reduced=false){
 if(reduced)return .72;
 const period=17.3+(index%5)*2.71,t=time+index*6.37;
 const cycle=((t%period)+period)%period;
 const failure=Math.exp(-(((cycle-6.1)/1.05)**4))*.57;
 const hesitation=Math.exp(-(((cycle-8.2)/.49)**2))*.22;
 return THREE.MathUtils.clamp(.78+Math.sin(t*.73+index)*.09+Math.sin(t*2.17)*.035-failure-hesitation,.16,.96);
}

export function buildDampAtmosphere({scene,layout,materials,put,lamps,barkTexture,mudTexture,barkRelief,barkWet,mudRelief,mudWet,lowDetail=false,contactShade=null}){
 materials.root=new THREE.MeshPhongMaterial({color:0xd2c8ab,map:barkTexture,bumpMap:barkRelief,bumpScale:.025,specularMap:barkWet,specular:0x64745b,shininess:12,vertexColors:true});
 shadeDrainMaterial(materials.root,{root:true});
 materials.mudBank=new THREE.MeshPhongMaterial({map:mudTexture,bumpMap:mudRelief,bumpScale:.017,specularMap:mudWet,color:0xc4bea1,specular:0x69765b,shininess:26,vertexColors:true});shadeDrainMaterial(materials.mudBank);
 const growth=createDrainGrowth({materials,put});
 const root=(points,radius=.16,wall=null,{taper=.83,branchPoints=[]}={})=>{
  const curve=new THREE.CatmullRomCurve3(points),{geometry,profile}=drainRootGeometry(curve,radius,wall,{taper,branchPoints,lowDetail});
  contactShade?.root(curve,radius,wall,{taper,widthAt:profile.widthAt});
  // Localize geometry so the existing 24m batching uses its real location.
  const anchor=points[0];geometry.translate(-anchor.x,-anchor.y,-anchor.z);
  put(geometry,'root',anchor.x,anchor.y,anchor.z);geometry.dispose();
 };
 const {wallRoots,hangingRoots,mudBanks,ceilingHairs,authoredRoots}=buildDrainOrganicGeometry({layout,root,put,materials,lowDetail,growth});
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
 const context=canvas.getContext('2d'),gradient=context.createRadialGradient(32,32,1,32,32,32);
 gradient.addColorStop(0,'rgba(255,255,255,.65)');gradient.addColorStop(.15,'rgba(255,255,255,.2)');gradient.addColorStop(1,'rgba(255,255,255,0)');
 context.fillStyle=gradient;context.fillRect(0,0,64,64);
 const texture=new THREE.CanvasTexture(canvas);
 const glows=lamps.map((lamp,index)=>{
  const material=new THREE.SpriteMaterial({map:texture,color:lamp.color??(index%3===1?0x6bc2bd:0xe9b575),transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending});
  const sprite=new THREE.Sprite(material);sprite.position.set(lamp.x,lamp.height||2.8,-lamp.y+(lamp.lensOffset??.18)+.07*(lamp.facing??1));sprite.scale.set(.85,.85,1);scene.add(sprite);return sprite;
 });
 const glass=createDrainLampGlass(),lensGeometry=new THREE.BoxGeometry(1,1,1),lensMaterial=glass.material;
 glass.bind(lensGeometry,lamps.length);
 const lenses=new THREE.InstancedMesh(lensGeometry,lensMaterial,lamps.length),matrix=new THREE.Object3D(),color=new THREE.Color();
 lamps.forEach((lamp,i)=>{matrix.position.set(lamp.x,lamp.height||2.8,-lamp.y+(lamp.lensOffset??.18));matrix.scale.set(lamp.height?.38:.19,lamp.height?.25:.32,lamp.height?.15:.08);matrix.updateMatrix();lenses.setMatrixAt(i,matrix.matrix);});
 lenses.instanceMatrix.needsUpdate=true;lenses.computeBoundingSphere();scene.add(lenses);
 const stats={wallRoots,hangingRoots,ceilingHairs,mudBanks,authoredRoots,growth:growth.stats(),practicalGlows:glows.length,lampGlass:glass.stats,lightLevels:[]};
 return {
  update(time,reduced){glows.forEach((glow,i)=>{const level=dampLampLevel(time,i,reduced);stats.lightLevels[i]=level;glow.material.opacity=.3*level;color.setHex(lamps[i].color??(i%3===1?0x8ac9c3:0xffc27c)).multiplyScalar(.13+level*.87);lenses.setColorAt(i,color);});lenses.instanceColor.needsUpdate=true;},
  stats,
  dispose(){texture.dispose();glass.dispose();growth.dispose();glows.forEach(g=>g.material.dispose());},
 };
}
