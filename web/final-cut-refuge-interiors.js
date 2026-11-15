import * as THREE from './vendor/three/three.module.js';
import {REFUGE_FURNITURE,REFUGES} from './final-cut-course.js';

// Construction detail is static and shares the scene's existing material and
// spatial batches. Small kept objects sit inside their host furniture bounds.
export function buildFinalCutRefugeInteriors({mesh,unit,cylinder}){
 let pieces=0,storedParts=0;const bounds=[];
 const emit=(mat,g,x,h,z,w,d,t,rx=0,ry=0,rz=0)=>{pieces++;mesh(mat,g,x,h,z,w,d,t,null,rx,ry,rz);};
 const b=(mat,x,h,z,w,d,t)=>emit(mat,unit,x,h,z,w,d,t);
 const c=(mat,x,h,z,r,l,rx=0,rz=0)=>emit(mat,cylinder,x,h,z,r,l,r,rx,0,rz);
 const ring=new THREE.TorusGeometry(1,.065,6,32);
 const cup=new THREE.LatheGeometry([new THREE.Vector2(.045,0),new THREE.Vector2(.035,.018),new THREE.Vector2(.018,.07),new THREE.Vector2(.06,.10),new THREE.Vector2(.095,.20),new THREE.Vector2(.083,.20),new THREE.Vector2(.048,.105)],12);
 // A front-facing cabinet helper rotates the pavilion joinery toward the
 // room, keeping all surfaces and drawer handles attached to the case.
 function cabinet(f,turned=false){
  const span=turned?f.d:f.w,depth=turned?f.w:f.d,top=f.bodyTop;
  const part=(mat,x,h,z,w,d,t)=>turned?b(mat,f.x+z,h,-f.y+x,t,d,w):b(mat,f.x+x,h,-f.y+z,w,d,t);
  part('dark',0,(top+.09)/2,0,span-.045,top-.09,depth-.045);
  part(f.kind==='bench'?'green':'wood',0,top-.025,0,span,.05,depth);
  for(const side of [-1,1]){
   part(f.kind==='bench'?'metal':'wood',side*(span/2-.035),top/2+.045,0,.07,top-.09,depth);
   part('dark',side*(span/2-.12),.09,0,.17,.04,depth-.06);
  }
  const drawers=f.kind==='bench'?3:4,step=(span-.18)/drawers;
  for(let n=0;n<drawers;n++){
   const x=-span/2+.09+(n+.5)*step;
   for(const h of [.29,.64]){
    part(f.kind==='bench'?'green':'wood',x,h,depth/2-.022,step-.023,.30,.026);
    part('dark',x,h+.03,depth/2-.005,.16,.045,.006);
    // Inset pulls do not enlarge the collision envelope.
    part('brass',x,h+.025,depth/2-.008,.12,.012,.014);
   }
   for(const dx of [-1,1])part('metal',x+dx*(step/2-.045),.76,depth/2-.005,.012,.012,.008);
  }
  // Chipped edging, end grain and uneven patches follow useful contact edges.
  for(const [x,w]of [[-.31,.21],[.32,.09]])part('wood',x,top+.003,depth/2-.045,w,.009,.055);
  return {part,top,span,depth};
 }
 for(const f of REFUGE_FURNITURE){
  bounds.push({...f});
  if(f.kind==='grit'){
   const z=-f.y;
   b('dark',f.x,.42,z,f.w-.045,.70,f.d-.045);
   for(const side of [-1,1])b('green',f.x+side*(f.w/2-.035),.46,z,.07,.78,f.d);
   for(const end of [-1,1])b('green',f.x,.46,z+end*(f.d/2-.025),f.w,.78,.05);
   b('metal',f.x,.88,z,f.w,.075,f.d);
   b('green',f.x,.927,z,f.w-.04,.019,f.d-.04);
   for(const side of [-1,1]){b('dark',f.x+side*.36,.09,z,.18,.04,.62);c('metal',f.x+side*.32,.91,z-.28,.027,.17,0,Math.PI/2);b('metal',f.x+side*.32,.865,z-.29,.15,.08,.03);}
   b('dark',f.x,.69,z+.33,.42,.17,.012);b('cream',f.x,.69,z+.339,.27,.032,.008);
   b('brass',f.x,.83,z+.335,.07,.14,.026);
   for(const x of [-.46,.46])for(const h of [.18,.77])c('metal',f.x+x,h,z+.346,.019,.008,Math.PI/2);
  }else if(f.kind==='bench'){
   const {part,top}=cabinet(f);
   // Spare flanged valve on timber blocks, a shallow tool tray and closed tin.
   for(const x of [-.86,-.48])part('wood',x,top+.025,0,.10,.05,.26);
   c('metal',f.x-.67,top+.12,-f.y,.09,.64,0,Math.PI/2);
   for(const x of [-.96,-.38]){c('brass',f.x+x,top+.12,-f.y,.125,.04,0,Math.PI/2);storedParts++;}
   c('brass',f.x-.67,top+.20,-f.y,.024,.10);
   emit('red',ring,f.x-.67,top+.265,-f.y,.10,.10,.10,Math.PI/2);storedParts++;
   part('dark',.13,top+.016,0,.55,.03,.35);
   for(const side of [-1,1]){part('metal',.13+side*.27,top+.04,0,.016,.05,.35);part('metal',.13,top+.04,side*.167,.55,.05,.016);}
   for(const offset of [-.12,.04,.15]){part('metal',.13+offset,top+.04,0,.025,.018,.24);part('brass',.13+offset,top+.05,-.10,.055,.014,.04);storedParts++;}
   part('green',.88,top+.10,-.03,.36,.20,.30);part('metal',.88,top+.207,-.03,.38,.014,.32);storedParts++;
  }else if(f.kind==='tools'){
   // Wall-backed pegboard: the bench prevents entry into the shallow mounts.
   const z=-f.y;
   b('wood',f.x,1.78,z,2.20,.66,.025);
   for(const side of [-1,1])b('metal',f.x+side*1.08,1.78,z+.02,.045,.70,.025);
   for(let row=0;row<3;row++)for(let col=0;col<13;col++)b('dark',f.x-1+col/6,1.55+row*.19,z+.018,.015,.015,.006);
   for(const [x,h]of [[-.76,1.82],[-.38,1.73],[.25,1.85],[.74,1.79]]){
    b('brass',f.x+x,h+.10,z+.045,.024,.025,.06);b('metal',f.x+x,h-.04,z+.06,.035,.26,.026);
    b('metal',f.x+x-.038,h+.075,z+.06,.025,.08,.027);b('metal',f.x+x+.038,h+.075,z+.06,.025,.08,.027);b('metal',f.x+x,h+.04,z+.06,.09,.025,.027);storedParts++;
   }
  }else if(f.kind==='hose'){
   const x=f.x,z=-f.y;
   b('wood',x-.09,1.15,z,.035,1.45,1.04);
   for(const end of [-1,1])b('metal',x-.045,1.52,z+end*.23,.12,.06,.04);
   for(const offset of [-.025,.035])emit('dark',ring,x+offset,1.15,z,.43,.43,.43,0,Math.PI/2);
   for(const end of [-1,1]){c('dark',x+.07,.60,z+end*.22,.027,.46);c('brass',x+.07,.37,z+end*.22,.042,.08);c('metal',x+.07,.39,z+end*.22,.046,.03);storedParts++;}
   b('metal',x+.05,1.57,z,.16,.045,.23);
  }else{
   const {part,top}=cabinet(f,true);
   // A closed scorecard box and a single tarnished cup suggest the departed
   // championship staff without adding a new collectible or objective.
   part('green',-.67,top+.085,0,.65,.17,.45);part('cream',-.67,top+.176,0,.63,.012,.43);
   part('dark',.60,top+.024,0,.28,.048,.28);
   emit('brass',cup,f.x,top+.048,-f.y+.60,1,1,1);storedParts+=2;
   for(let k=0;k<4;k++)part(k%2?'cream':'green',.05,top+.012+k*.008,.08,.30,.008,.38);
   // Empty label holders and a missing handle expose darker timber beneath.
   part('dark',-.90,.64,.353,.17,.06,.006);
  }
 }
 // Localized rising damp sits on the actual inside masonry face, with stepped
 // silhouettes instead of a tiled full-wall stain. The floor stays navigable.
 const pump=REFUGES.find(r=>r.id==='pump'),wallZ=-pump.y-pump.d/2+.352;
 const stainShape=new THREE.Shape(),profile=[.13,.19,.16,.28,.32,.48,.41,.73,.66,.86,1,.93,.78,.59,.66,.43,.29,.21,.16,.09];
 stainShape.moveTo(-.5,0);stainShape.lineTo(.5,0);
 for(let col=63;col>=0;col--){const at=col/63*(profile.length-1),index=Math.floor(at),fraction=at-index,height=Math.round(((profile[index]||0)*(1-fraction)+(profile[Math.min(profile.length-1,index+1)]||0)*fraction)*64)/64;stainShape.lineTo((col+1)/64-.5,height);stainShape.lineTo(col/64-.5,height);}
 stainShape.closePath();
 const stain=new THREE.ShapeGeometry(stainShape);
 for(const [x,w,h]of [[6.4,.75,.80],[8.2,.55,.45],[13.2,.95,.66]])emit('refugeDamp',stain,x,.07,wallZ,w,h,1);
 for(const [x,w]of [[6.2,.55],[7.9,.42],[12.9,.8]])emit('refugeDamp',stain,x,.073,-41.35,w,.28,1,-Math.PI/2);
 // Faded, torn pennant ends remain attached to a real timber tie at the
 // pavilion's north end. Their lowest tips stay above standing head height.
 const clothShape=new THREE.Shape();clothShape.moveTo(-.5,0);for(const [x,y]of [[.5,0],[.5,-.64],[.29,-.64],[.29,-.80],[.15,-.80],[.15,-.71],[-.04,-.71],[-.04,-.96],[-.23,-.96],[-.23,-.78],[-.5,-.78]])clothShape.lineTo(x,y);clothShape.closePath();
 const cloth=new THREE.ExtrudeGeometry(clothShape,{depth:.005,bevelEnabled:false,steps:1,curveSegments:1}),pavilion=REFUGES.find(r=>r.id==='pavilion');
 const cp=cloth.attributes.position;for(let i=0;i<cp.count;i++)cp.setZ(i,cp.getZ(i)+.018*(1+Math.sin(cp.getX(i)*13))*cp.getY(i)*cp.getY(i));cloth.computeVertexNormals();
 for(const [offset,mat]of [[-2.5,'cream'],[-1.5,'green']]){
  const x=pavilion.x+offset,z=-pavilion.y-2.95;
  b('wood',x,2.61,z,.66,.065,.065);
  emit(mat,cloth,x,2.585,z+.035,.58,.51,1);
  for(const side of [-1,1])b('brass',x+side*.23,2.61,z+.044,.028,.028,.025);
 }
 return {pieces,storedParts,furniture:bounds,stains:3,pennants:2,style:'Service storage, worn starter joinery, grounded fittings and localized damp'};
}
