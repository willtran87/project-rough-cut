import {REFUGE_ARCHITECTURE} from './final-cut-architecture-layout.js';
import * as THREE from './vendor/three/three.module.js';
import {REFUGES,WALLS,REFUGE_TIMBER_POSTS} from './final-cut-course.js';
import {ROUTE_WALLS} from './final-cut-route-layout.js';
import {ARRIVAL_WALLS,OVERLOOK} from './final-cut-arrival-layout.js';
import {createMasonryBuilder} from './final-cut-masonry.js';
import {buildFinalCutRoofDetail} from './final-cut-roof-detail.js';

// Architectural relief is anchored to existing solid envelopes. Low details
// stay inside masonry; overhead roofwork never creates a false blocked route.
// All pieces join the scene's material/geometry instance batches.
export function buildFinalCutEstateDetail({box,cyl,mesh,unit,cylinder,sign}){
 let pieces=0,slates=0,chippedSlates=0,corrugatedSheets=0,masonryBlocks=0,ceilingBoards=0,jointPlates=0,timberPegs=0;
 const masonry=createMasonryBuilder(mesh);
 const gusset=new THREE.BufferGeometry();
 gusset.setAttribute('position',new THREE.Float32BufferAttribute([-.15,.1,-.008,.15,.1,-.008,0,-.16,-.008,-.15,.1,.008,.15,.1,.008,0,-.16,.008],3));
 gusset.setIndex([0,2,1,3,4,5,0,1,4,0,4,3,1,2,5,1,5,4,2,0,3,2,3,5]);gusset.computeVertexNormals();
 const ceilingBoard=new THREE.BoxGeometry(1,1,1,8,1,1),bp=ceilingBoard.attributes.position;
 for(let i=0;i<bp.count;i++)bp.setY(i,bp.getY(i)+.12*Math.sin(bp.getX(i)*Math.PI*2));ceilingBoard.computeVertexNormals();
 const chippedSlate=new THREE.BufferGeometry(),sp=[],si=[];
 const slateOutline=[[-.5,-.5],[.5,-.5],[.5,.28],[.42,.37],[.36,.5],[-.5,.5]];
 for(const h of [-.5,.5])for(const [x,z]of slateOutline)sp.push(x,h,z);
 for(let k=1;k<slateOutline.length-1;k++){si.push(0,k,k+1,6,6+k+1,6+k);}
 for(let k=0;k<6;k++){const j=(k+1)%6;si.push(k,6+k,j,j,6+k,6+j);}
 chippedSlate.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));chippedSlate.setIndex(si);chippedSlate.computeVertexNormals();
 // Open half-round gutters: a thin outer shell and visible dark trough, not
 // solid bars. Section ends are capped; the outlet joins its real downpipe.
 const gutter=new THREE.BufferGeometry(),gp=[],gi=[];
 for(let k=0;k<=12;k++){const a=Math.PI+k*Math.PI/12;for(const radius of [.083,.073])for(const z of [-.5,.5])gp.push(Math.cos(a)*radius,Math.sin(a)*radius,z);}
 const gutterQuad=(a,b,c,d)=>gi.push(a,b,c,a,c,d);
 for(let k=0;k<12;k++){const a=k*4,b=a+4;gutterQuad(a,b,b+1,a+1);gutterQuad(a+2,a+3,b+3,b+2);gutterQuad(a,a+2,b+2,b);gutterQuad(a+1,b+1,b+3,a+3);}
 for(const a of [0,48])gutterQuad(a,a+1,a+3,a+2);
 gutter.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));gutter.setIndex(gi);gutter.computeVertexNormals();
 // One reusable folded sheet profile, instanced across the pump roof.
 const corrugation=new THREE.BufferGeometry(),cp=[],ci=[],cu=[];
 for(let k=0;k<=64;k++){const t=k/64,h=.065+.025*(1+Math.cos(t*Math.PI*16));for(const x of [-.5,.5]){cp.push(x,h,t-.5);cu.push(x+.5,t);}if(k<64){const a=k*2;ci.push(a,a+2,a+1,a+1,a+2,a+3);}}
 corrugation.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));corrugation.setAttribute('uv',new THREE.Float32BufferAttribute(cu,2));corrugation.setIndex(ci);corrugation.computeVertexNormals();
 const cap=new THREE.BufferGeometry(),rp=[],ri=[];
 const at=(a,r,z)=>[Math.cos(a)*r,Math.sin(a)*r,z];
 const quad=(a,b,c,d)=>{const n=rp.length/3;rp.push(...a,...b,...c,...d);ri.push(n,n+1,n+2,n,n+2,n+3);};
 for(let i=0;i<8;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;
  quad(at(a,.13,-.285),at(b,.13,-.285),at(b,.13,.285),at(a,.13,.285));
  quad(at(b,.11,-.285),at(a,.11,-.285),at(a,.11,.285),at(b,.11,.285));
  quad(at(a,.13,.285),at(b,.13,.285),at(b,.11,.285),at(a,.11,.285));
  quad(at(b,.13,-.285),at(a,.13,-.285),at(a,.11,-.285),at(b,.11,-.285));
 }
 for(const a of [0,Math.PI])quad(at(a,.13,-.285),at(a,.13,.285),at(a,.11,.285),at(a,.11,-.285));
 cap.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));cap.setAttribute('uv',new THREE.Float32BufferAttribute(Array(rp.length/3*2).fill(0),2));cap.setIndex(ri);cap.computeVertexNormals();
 const b=(...args)=>{pieces++;return box(...args);};
 for(const s of REFUGES){
  const style=REFUGE_ARCHITECTURE[s.id],roof=style.roof,half=(s.w+.9)/2,rise=style.rise,slope=Math.atan2(rise,half),length=Math.hypot(half,rise);
  for(const side of [-1,1]){
   mesh(roof,unit,s.x+side*half/2,3.12+rise/2,-s.y,length,.13,s.d+.95,null,0,0,-side*slope);pieces++;
   if(s.id==='pump'){
    const count=Math.ceil((s.d+.95)/.85),width=(s.d+.95)/count;
    for(let n=0;n<count;n++){mesh('roof',corrugation,s.x+side*half/2,3.12+rise/2,-s.y-(s.d+.95)/2+(n+.5)*width,length,1,width+.025,null,0,0,-side*slope);corrugatedSheets++;pieces++;}
   }else{
    const rows=Math.ceil(length/.43),run=length/rows,cols=Math.ceil((s.d+.95)/.48),span=(s.d+.95)/cols;
    for(let row=0;row<rows;row++)for(let col=0;col<=cols;col++){
     const start=Math.max(0,(col-(row%2)*.5)*span),end=Math.min(s.d+.95,(col+1-(row%2)*.5)*span);if(end-start<.03)continue;
     const along=(row+.5)*run,across=along*Math.cos(slope),z=-s.y-(s.d+.95)/2+(start+end)/2;
     const chipped=(row*17+col*11+(s.id==='pavilion'?3:0))%13===0;
     const lift=.003*Math.sin(row*11.7+col*4.3);
     mesh('slate',chipped?chippedSlate:unit,s.x+side*across,3.12+rise-along*Math.sin(slope)+.09+(row%2)*.004+lift,z,run+.075,.045,end-start-.018,null,0,0,-side*slope);slates++;pieces++;if(chipped)chippedSlates++;
    }
   }
   b('wood',s.x+side*(s.w/2+.32),2.94,-s.y,.2,.28,s.d+.85);
   // Copper gutter, downpipe and brackets are part of the roof edge / wall.
   const gutterX=s.x+side*(s.w/2+.43);
   mesh('brass',gutter,gutterX,3.02,-s.y,1,1,s.d+.9);pieces++;
   for(const end of [-1,1])b('brass',gutterX,2.98,-s.y+end*(s.d+.9)/2,.166,.08,.014);
   for(let z=-s.y-s.d/2+.15;z<-s.y+s.d/2;z+=1.15){b('metal',gutterX-side*.03,2.92,z,.16,.025,.035);b('metal',gutterX-side*.1,2.97,z,.025,.1,.035);}
   const x=s.x+side*(s.w/2+.22),z=-s.y+s.d/2-.3;
   cyl('metal',x,1.45,z,.065,2.9);pieces++;
   const dx=x-gutterX,dy=-.18;
   mesh('metal',cylinder,(x+gutterX)/2,2.88,z,.065,Math.hypot(dx,dy),.065,null,0,0,-Math.atan2(dx,dy));pieces++;
   cyl('brass',gutterX,2.98,z,.078,.08);pieces++;
   for(const h of [.4,1.5,2.6])b('brass',x,h,z,.16,.055,.14);
  }
  // Half-round ridge sections have real end thickness and sit on the slope.
  for(let z=-s.y-(s.d+.95)/2+.25;z<-s.y+(s.d+.95)/2;z+=.51){mesh('metal',cap,s.x,3.12+rise+.06,z,1,1,1);pieces++;}
  // Tied rafters and purlins are visible below the roof, above head clearance.
  // Cladding covers the former uninterrupted green underside. Its bow is only
  // a few millimetres, and every piece remains above the existing tie beams.
  const boardDepth=s.id==='pump'?.72:.23,boardCount=Math.ceil((s.d+.45)/boardDepth),boardStep=(s.d+.45)/boardCount;
  for(let n=0;n<boardCount;n++){
   const z=-s.y-(s.d+.45)/2+(n+.5)*boardStep;
   mesh(s.id==='pump'?'roof':'wood',ceilingBoard,s.x,2.738,z,s.w+.45,.022,boardStep-.009);ceilingBoards++;pieces++;
   if(s.id==='pump')for(const side of [-1,1])b('metal',s.x+side*(s.w/2-.25),2.718,z,.045,.018,.08);
  }
  for(let z=-s.y-s.d/2+.3;z<-s.y+s.d/2;z+=1.25){
   b('wood',s.x,2.70,z,s.w-.35,.14,.13);
   for(const side of [-1,1]){
    mesh('wood',unit,s.x+side*(s.w/2-.52),2.51,z,.7,.12,.12,null,0,0,-side*.58);pieces++;b('metal',s.x+side*(s.w/2-.21),2.69,z,.08,.18,.16);
    const jointX=s.x+side*(s.w/2-.52-.35*Math.cos(.58));
    for(const face of [-1,1]){
     mesh('metal',gusset,jointX,2.62,z+face*.079,1,1,1);jointPlates++;pieces++;
     for(const [dx,dy]of [[-.085,.055],[.085,.055],[0,-.075]]){mesh('brass',cylinder,jointX+dx,2.62+dy,z+face*.092,.013,.013,.013,null,Math.PI/2);pieces++;}
    }
   }
  }
  for(const z of [-s.y-s.d/2-.43,-s.y+s.d/2+.43]){
   for(let x=-half+.14;x<half;x+=.28){const h=Math.max(.02,rise-Math.abs(x)/half*rise);b('wood',s.x+x,3.07+h/2,z,.265,h,.09);}
   // Cut timber fascia and individually raised roof seams.
   for(const side of [-1,1]){mesh('wood',unit,s.x+side*half/2,3.1+rise/2,z,length,.18,.12,null,0,0,-side*slope);pieces++;}
   for(let k=-3;k<=3;k++)b('wood',s.x+k*.6,3.1+rise-Math.abs(k*.6)/half*rise-.08,z,.065,.16,.13);
  }
  // Finish the exposed structural deck edge with real fascia boards/sheets.
  // Individual lengths have restrained joints; the old green mass stays behind.
  const fasciaSpan=s.w+.72,fasciaCount=Math.ceil(fasciaSpan/1.8),fasciaStep=fasciaSpan/fasciaCount;
  for(const end of [-1,1])for(let n=0;n<fasciaCount;n++){
   const x=s.x-fasciaSpan/2+(n+.5)*fasciaStep,z=-s.y+end*(s.d/2+.368);
   b(s.id==='pump'?'roof':'wood',x,2.9,z,fasciaStep-.006,.286,.036);
   for(const side of [-1,1])b('metal',x+side*(fasciaStep/2-.08),2.9,z+end*.021,.015,.015,.009);
  }
  // Corrugated sheets have fasteners at the purlins. Slate roofs retain their
  // overlapping courses without the former regularly spaced metal bars.
  if(s.id==='pump')for(let z=-s.y-s.d/2;z<=-s.y+s.d/2;z+=.85)for(const side of [-1,1])for(const fraction of [.2,.72]){
   const along=length*fraction;
   mesh('metal',cylinder,s.x+side*along*Math.cos(slope),3.12+rise-along*Math.sin(slope)+.14,z,.018,.025,.018,null,0,0,-side*slope);pieces++;
  }
  for(const w of WALLS.filter(w=>w.id.startsWith(s.id)&&!ROUTE_WALLS.includes(w)))masonry.build(w,{course:style.stoneCourse,length:style.stoneLength,stone:s.id==='pump'?'ashlarDark':s.id==='pavilion'?'ashlarWarm':'ashlar',accent:'ashlar'});
  for(const post of REFUGE_TIMBER_POSTS.filter(p=>p.refuge===s.id)){
   const {x,side,end,base}=post,z=-post.y;
   b('wood',x,(base+post.h)/2,z,post.w,post.h-base,post.d);b('metal',x,base+.04,z,.19,.08,.19);
   for(const h of [base+.07,2.77])b('brass',x+.085,h,z,.025,.055,.055);
   for(const h of [2.59,2.70]){
    mesh('wood',cylinder,x+side*.085,h,z,.016,.024,.016,null,0,0,Math.PI/2);
    mesh('wood',cylinder,x,h,z+end*.085,.016,.024,.016,null,Math.PI/2);timberPegs+=2;pieces+=2;
   }
  }
  // Recessed, shuttered service windows on the existing solid west wall.
  for(const z of [-s.y-1.9,-s.y+1.9]){
   const x=s.x-s.w/2+.356;
   b('dark',x,1.55,z,.012,1.04,1.34);
   for(let k=0;k<8;k++)b(s.id==='bunker'?'metal':'wood',x+.012,1.14+k*.115,z,.018,.085,1.2);
   for(const end of [-1,1])b('cream',x+.03,1.55,z+end*.66,.03,1.12,.055);
   b('cream',x+.03,2.08,z,.03,.07,1.4);b('path',x+.04,1.01,z,.06,.08,1.4);
  }
 }
 for(const w of ROUTE_WALLS)masonry.build(w,{course:.31,length:.86});
 for(const w of ARRIVAL_WALLS)masonry.build(w,{course:.34,length:.94});
 masonry.build(OVERLOOK,{course:.34,length:1.02});
 masonryBlocks=masonry.stats().blocks;pieces+=masonryBlocks;
 // Flush drains and curb joints make the service paths built surfaces. These
 // are millimetres above their existing walking slabs, not new trip hazards.
 for(const x of [-23,23])for(let y=7;y<94;y+=6){
  b('dark',x+.8,.047,-y,.29,.014,1.1);
  for(let k=0;k<9;k++)b('metal',x+.8,.056,-y-.46+k*.115,.28,.014,.035);
  b('stone',x-1.09,.043,-y,.12,.02,1.25);
 }
 // Stacked masonry coping and an illuminated number plate on the road gate.
 for(const x of [-2,2]){b('metal',x,2.65,-94,.18,.15,.18);b('brass',x,2.74,-94,.12,.04,.12);}
 // The plate sits in front of the king-post trim, not inside its front face.
 b('metal',-16,3.38,-80.91,.14,.18,.04);
 sign('XVIII',-16,3.38,-80.875,1.1,.32,'#d3c39a','#243d36');
 const roofDetail=buildFinalCutRoofDetail({refuges:REFUGES,mesh,unit,cylinder});pieces+=roofDetail.pieces;
 return {pieces,roofDetail,slates,chippedSlates,corrugatedSheets,ceilingBoards,jointPlates,timberPegs,gutters:6,masonryBlocks,masonry:masonry.stats(),identities:REFUGE_ARCHITECTURE,refuges:REFUGES.length,drains:30,style:'Authored pixel materials / cut timber grain / pegged joints / overlapping slates / open gutters / tied rafters'};
}
