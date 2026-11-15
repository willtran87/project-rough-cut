import * as THREE from './vendor/three/three.module.js';
import {KEEPER_TIMBER_SPAN} from './under-green-keeper-timber.js';

// The wall recess is filled by a real, closed cabinet. Its missing drawer
// reveals a shallow timber interior, never an apparent doorway or outside void.
export function buildKeeperCabinet({materials,box,put,desk}){
 const face=desk.boundary+.132,back=desk.boundary-.70,parts=[];
 const timber=materials.keeperWood.clone();timber.vertexColors=true;
 timber.userData.drainWorldUV=false;materials.keeperCabinetWood=timber;
 function block(type,x,h,y,w,t,d){box(type,x,h,-y,w,t,d);parts.push({type,min:[x-w/2,h-t/2,-y-d/2],max:[x+w/2,h+t/2,-y+d/2]});}
 function panel(x,h,width,height,{seed=0,broken=false,horizontal=false,sag=0}={}){
  // Unequal long splinters interrupt one rotten bottom edge. Most boards
  // remain intact, with only a slight concave bow behind the old face.
  const shape=new THREE.Shape(),outline=[[-.5,.5],[-.25,.5],[0,.5],[.25,.5],[.5,.5],[.5,-.5],
   ...(broken?[[.32,-.48],[.28,-.23],[.245,-.42],[.19,-.20],[.145,-.47],[.08,-.33],[.02,-.49]]:[[.25,-.5],[0,-.5]]),[-.25,-.5],[-.5,-.5]];
  outline.forEach(([u,v],i)=>i?shape.lineTo(u*width,v*height):shape.moveTo(u*width,v*height));shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:.026,steps:1,bevelEnabled:false}),p=g.attributes.position,uv=g.attributes.uv,colors=[];
  for(let i=0;i<p.count;i++){
   const u=p.getX(i)/width+.5,v=p.getY(i)/height+.5,z=p.getZ(i),level=h+p.getY(i)-sag*u;
   const bow=.008*Math.sin(Math.PI*u)+.003*Math.sin(v*4.1+seed);
   p.setXYZ(i,x+p.getX(i),level,-face+z+bow);
   // Physical grain scale, oriented along each board; no stretched unit UVs.
   uv.setXY(i,(horizontal?level:x+p.getX(i))/KEEPER_TIMBER_SPAN+seed*.137,(horizontal?x+p.getX(i):level)/KEEPER_TIMBER_SPAN+seed*.219);
   const tide=.32+.028*Math.sin(x*4+u*5+seed),wet=Math.max(0,Math.min(1,(tide+.09-level)/.14));
   const tone=(.91+.06*Math.sin(seed*2.3+u*2))*(1-wet*.29);
   colors.push(tone,tone*(1-wet*.035),tone*(1-wet*.10));
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingBox();
  const bounds=g.boundingBox.clone(),anchor=bounds.getCenter(new THREE.Vector3());parts.push({type:'keeperCabinetWood',min:bounds.min.toArray(),max:bounds.max.toArray()});
  g.translate(-anchor.x,-anchor.y,-anchor.z);g.userData.preserveDrainUV=true;put(g,'keeperCabinetWood',anchor.x,anchor.y,anchor.z);g.dispose();
 }
 // Back, sides and inset plinth close the original masonry aperture.
 block('keeperEndgrain',11.65,.53,back,4.32,.94,.05);
 for(const x of [9.57,13.73])block('keeperEndgrain',x,.53,(back+face)/2,.06,.94,face-back);
 block('keeperEndgrain',11.65,.11,(back+face)/2,4.2,.07,face-back);
 block('keeperEndgrain',11.65,.075,face-.12,4.2,.15,.07);
 for(const x of [9.60,10.63,12.36,13.70])block('keeperWood',x,.55,face-.015,.065,.87,.055);
 for(const h of [.16,.96])block('keeperWood',11.65,h,face-.015,4.14,.065,.055);
 // Tall left door; two unequal central drawers over an empty lower socket;
 // a slightly dropped right door gives three distinct large shapes.
 panel(10.115,.55,.95,.73,{seed:3,broken:true});
 panel(11.495,.815,1.64,.215,{seed:7,horizontal:true});
 panel(11.495,.565,1.64,.215,{seed:11,horizontal:true,sag:.012});
 panel(13.03,.53,1.26,.73,{seed:19,sag:.024});
 // Empty drawer bay: recessed bottom, runner rails and a dark back. Its
 // opening is 24 cm high and terminates visibly inside the cabinet.
 block('keeperEndgrain',11.495,.305,face-.48,1.65,.25,.035);
 block('keeperWood',11.495,.185,face-.245,1.65,.035,.47);
 for(const x of [10.70,12.29])block('keeperWood',x,.22,face-.245,.045,.06,.47);
 for(const h of [.445,.695])block('keeperEndgrain',11.495,h,face-.018,1.68,.032,.04);
 // Small intact hardware explains how each surface opens.
 for(const [x,h,width]of [[10.46,.66,.075],[11.495,.82,.22],[11.495,.57,.22],[12.52,.64,.075]]){
  block('machineIron',x,h,face+.003,width,.023,.018);
  for(const dx of [-width*.32,width*.32])block('machineRust',x+dx,h,face+.014,.014,.014,.008);
 }
 for(const [x,h]of [[9.67,.78],[9.67,.31],[13.62,.76],[13.62,.29]])block('machineIron',x,h,face+.002,.065,.073,.012);
 return {parts,missingDrawer:1,brokenDoor:1,maximumFace:face+.018,closedBack:true,addedColliders:0,newTextures:0,newLights:0,dispose(){timber.dispose();}};
}
