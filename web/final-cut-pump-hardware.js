import * as THREE from './vendor/three/three.module.js';
import {PUMP,clamp} from './final-cut-course.js';

// Fixed fittings enter the existing spatial batches. Only the gauge needle and
// telltale change with the saved irrigation state; no presentation timer.
export function buildFinalCutPumpHardware({box,mesh,unit,cylinder,scene,materials}){
 let parts=0,flanges=0,bolts=0;
 const root=new THREE.Group();root.name='FinalCutPumpInstruments';scene.add(root);
 const b=(mat,x,h,z,w,d,t)=>{parts++;box(mat,PUMP.x+x,h,-PUMP.y+z,w,d,t);};
 const c=(mat,x,h,z,r,length,rx=0,rz=0)=>{parts++;mesh(mat,cylinder,PUMP.x+x,h,-PUMP.y+z,r,length,r,null,rx,0,rz);};
 // Pressed enclosure, folded return edges and a separate service door all stay
 // in the original one-metre cabinet envelope. The feet carry it to the slab.
 b('dark',0,.81,0,.96,1.46,.54);
 b('green',0,.83,-.272,.97,1.44,.036);
 for(const side of [-1,1]){
  b('green',side*.478,.83,0,.044,1.44,.57);
  b('metal',side*.35,.055,0,.22,.11,.55);
  b('dark',side*.35,.009,0,.24,.012,.57);
  for(const z of [-.19,.19])c('brass',side*.35,.116,z,.024,.018);
 }
 b('green',0,1.568,0,1,.064,.6);
 b('green',0,1.52,.287,.97,.055,.025);
 b('green',0,.14,.279,.97,.07,.034);
 b('green',0,.83,.274,.85,1.28,.026);
 for(const side of [-1,1])b('brass',side*.441,.83,.282,.008,1.27,.012);
 // Three barrel hinges and a supported latch, rather than a painted seam.
 for(const h of [.34,.82,1.3]){
  b('metal',-.435,h,.296,.09,.075,.024);
  c('metal',-.43,h,.315,.026,.11);
  for(const x of [-.465,-.403])c('brass',x,h,.315,.012,.014,Math.PI/2);
 }
 b('dark',.35,.92,.3,.09,.23,.025);b('brass',.35,.92,.325,.035,.16,.035);
 // A real recessed louvre bank, with sloping lips and shadowed openings.
 b('dark',0,.48,.291,.66,.42,.012);
 for(let n=0;n<6;n++){
  parts++;mesh('green',unit,PUMP.x,.307+n*.065,-PUMP.y+.315,.66,.038,.044,null,-.3);
 }
 for(const x of [-.35,.35])for(const h of [.25,.71,1.45]){c('metal',x,h,.3,.018,.014,Math.PI/2);bolts++;}
 // Selective chipped edges and leak tracks use rectangular pixel clusters.
 // Each lies on its real panel, away from the instrument and interaction label.
 for(const [x,h,w]of [[-.32,1.533,.13],[.16,1.533,.08],[.28,.166,.12],[-.27,.166,.06]])b('metal',x,h,.305,w,.014,.008);
 for(const [x,h,w,length]of [[-.386,.47,.014,.32],[.395,.36,.018,.23],[.18,.23,.01,.12]])b('brass',x,h,.292,w,length,.004);
 // Bezel, socket and stem physically connect the dial to the enclosure.
 c('brass',-.22,1.31,.307,.184,.06,Math.PI/2);
 c('dark',-.22,1.31,.343,.161,.02,Math.PI/2);
 c('brass',-.22,1.09,.305,.035,.12);
 b('brass',-.22,1.04,.292,.10,.045,.035);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#c6bea1';ctx.fillRect(0,0,128,128);
 // Quantized marks, restrained printed arcs and large endpoints retain the
 // character of an old mechanical instrument at close range.
 for(let i=0;i<=24;i++){
  const a=-2.3+i*4.6/24,major=i%4===0;
  ctx.fillStyle=i>=20?'#52695a':'#39443d';
  for(let r=major?43:47;r<=52;r+=2)ctx.fillRect(Math.round(64+Math.sin(a)*r)-1,Math.round(64-Math.cos(a)*r)-1,major?3:2,3);
 }
 ctx.fillStyle='#39443d';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('LINE',64,43);ctx.fillText('CHARGE',64,54);
 ctx.font='bold 11px monospace';ctx.fillText('0',37,94);ctx.fillText('1',91,94);
 ctx.font='7px monospace';ctx.fillText('ESTATE 18',64,109);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
 const dialMaterial=new THREE.MeshLambertMaterial({map:texture}),dialGeometry=new THREE.CircleGeometry(.153,32);
 const dial=new THREE.Mesh(dialGeometry,dialMaterial);dial.position.set(PUMP.x-.22,1.31,-PUMP.y+.356);root.add(dial);
 const needle=new THREE.Group();needle.position.copy(dial.position);needle.position.z+=.008;root.add(needle);
 const needleGeometry=new THREE.BufferGeometry();needleGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.008,-.027,0,.008,-.027,0,.005,.09,0,0,.12,0,-.005,.09,0],3));needleGeometry.setIndex([0,1,2,0,2,4,4,2,3]);needleGeometry.computeVertexNormals();
 const needleMaterial=new THREE.MeshLambertMaterial({color:'#3c423a'});needle.add(new THREE.Mesh(needleGeometry,needleMaterial));
 const hub=new THREE.Mesh(new THREE.CircleGeometry(.018,12),needleMaterial);hub.position.z=.003;needle.add(hub);
 c('metal',0,1.1,.345,.075,.12,Math.PI/2);c('brass',0,1.1,.41,.045,.055,Math.PI/2);
 // Guarded telltale: the saved fill state controls it, not a cosmetic clock.
 b('dark',.28,1.42,.301,.12,.12,.03);
 const indicatorGeometry=new THREE.BoxGeometry(.07,.07,.018),indicator=new THREE.Mesh(indicatorGeometry,materials.dark);indicator.position.set(PUMP.x+.28,1.42,-PUMP.y+.326);root.add(indicator);
 for(const side of [-1,1])b('metal',.28+side*.047,1.42,.335,.012,.11,.018);
 // Cylindrical outlet joins the original x17 feed. Flanges, gasket seams and
 // saddles replace the disconnected rectangular bars without raising the pipe.
 const tube=(x,h,z,r,length,rz=0,rx=0)=>{parts++;mesh('metal',cylinder,x,h,z,r,length,r,null,rx,0,rz);};
 tube(12.74,.2,-39,.14,8.52,Math.PI/2);
 tube(17,.2,-56.5,.14,35,0,Math.PI/2);
 // A rounded elbow fills the meeting of both actual pipe centrelines.
 const elbowGeometry=new THREE.SphereGeometry(.14,12,8);parts++;mesh('metal',elbowGeometry,17,.2,-39,1,1,1);
 const flange=(x,z,axis)=>{
  flanges++;
  const rot=axis==='x'?[0,Math.PI/2]:[Math.PI/2,0];
  for(const offset of [-.032,.032]){parts++;mesh('metal',cylinder,x+(axis==='x'?offset:0),.2,z+(axis==='z'?offset:0),.193,.048,.193,null,rot[0],0,rot[1]);}
  parts++;mesh('dark',cylinder,x,.2,z,.186,.014,.186,null,rot[0],0,rot[1]);
  for(let k=0;k<6;k++){
   const a=k*Math.PI/3,across=Math.cos(a)*.164,h=.2+Math.sin(a)*.164;
   parts++;bolts++;mesh('brass',cylinder,x+(axis==='z'?across:0),h,z+(axis==='x'?across:0),.022,.125,.022,null,rot[0],0,rot[1]);
  }
 };
 flange(8.62,-39,'x');flange(16.7,-39,'x');
 for(const y of [43,52,61,70]){
  flange(17,-y,'z');box('dark',17,.027,-y,.46,.054,.45);parts++;
  for(const side of [-1,1]){box('metal',17+side*.17,.11,-y,.045,.17,.18);box('brass',17+side*.17,.201,-y,.05,.025,.18);parts+=2;}
 }
 let state={fill:0,open:false,needle:2.3};
 return {update(r){const fill=clamp(r.water,0,1);needle.rotation.z=2.3-fill*4.6;indicator.material=materials[fill>=1?'mint':r.pump?'amber':'dark'];state={fill,open:r.pump,needle:needle.rotation.z};},stats:()=>({...state,parts,flanges,bolts,gaugePixels:128}),dispose(){scene.remove(root);texture.dispose();dialMaterial.dispose();dialGeometry.dispose();needleGeometry.dispose();needleMaterial.dispose();hub.geometry.dispose();indicatorGeometry.dispose();}};
}
