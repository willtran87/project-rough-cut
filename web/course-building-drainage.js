import * as THREE from './vendor/three/three.module.js';

// Shared by the stone and surrounding planting: the footprint follows the
// mirrored outlet, not a broad rectangular exclusion around the whole building.
export function drainageFootprints(width,front){
 return [-1,1].map(side=>({x:side*(width/2-.10),z:side*(front+.55),rx:.28,rz:.39}));
}
export function clearDrainageFootprints(footprints,x,z,radius=0){
 return footprints.every(p=>Math.hypot(Math.max(0,Math.abs(x-p.x)-p.rx),Math.max(0,Math.abs(z-p.z)-p.rz))>radius);
}

export function splashStoneGeometry(){
 const outline=[[-.19,-.19],[-.14,-.24],[.13,-.24],[.20,-.18],[.18,.17],[.12,.24],[-.13,.23],[-.20,.15]];
 const positions=[],indices=[],quad=(points)=>{const i=positions.length/3;positions.push(...points.flat());indices.push(i,i+1,i+2,i,i+2,i+3);};
 const top=(x,z)=>[x,.055-z*.04,z];
 // A small fall towards the ground carries water away from the wall.
 for(let i=0;i<outline.length;i++){
  const [x,z]=outline[i],[nx,nz]=outline[(i+1)%outline.length],n=positions.length/3;
  positions.push(...top(0,0),...top(nx,nz),...top(x,z));indices.push(n,n+1,n+2);
  quad([[x,0,z],[nx,0,nz],top(nx,nz),top(x,z)]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function splashStainGeometry(){
 // Connected, stepped clusters at 2 cm intervals. The wider impact area narrows
 // into an off-centre runnel; every pixel remains attached to the sloping stone.
 const rows=[[-2,1],[-3,2],[-4,3],[-4,4],[-5,3],[-4,4],[-3,3],[-3,2],[-2,2],[-2,1],[-1,2],[-1,1],[0,2],[0,1],[0,2],[1,2],[1,3],[1,2]],positions=[],indices=[];
 for(let row=0;row<rows.length;row++){
  const [a,b]=rows[row],x0=a*.02,x1=(b+1)*.02,z0=-.17+row*.02,z1=z0+.02,i=positions.length/3;
  for(const [x,z]of [[x0,z0],[x0,z1],[x1,z1],[x1,z0]])positions.push(x,.056-z*.04,z);
  indices.push(i,i+1,i+2,i,i+2,i+3);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function gutterGeometry(width,outletX){
 const positions=[],indices=[],xs=[-width/2,outletX-.032,outletX+.032,width/2],steps=8;
 const quad=(a,b,c,d)=>{const i=positions.length/3;positions.push(...a,...b,...c,...d);indices.push(i,i+1,i+2,i,i+2,i+3);};
 const at=(x,r,j)=>[x,-Math.sin(j*Math.PI/steps)*r,Math.cos(j*Math.PI/steps)*r];
 for(let part=0;part<xs.length-1;part++)for(let j=0;j<steps;j++){
  // The small bottom opening meets the downpipe rather than sealing its inlet.
  if(part===1&&(j===3||j===4))continue;
  quad(at(xs[part],.075,j+1),at(xs[part+1],.075,j+1),at(xs[part+1],.075,j),at(xs[part],.075,j));
  quad(at(xs[part],.062,j),at(xs[part+1],.062,j),at(xs[part+1],.062,j+1),at(xs[part],.062,j+1));
 }
 // Closed end cheeks and rolled upper edges leave the trough open to the roof.
 for(const [x,flip]of [[xs[0],true],[xs.at(-1),false]])for(let j=0;j<steps;j++){
  const q=[at(x,.075,j),at(x,.075,j+1),at(x,.062,j+1),at(x,.062,j)];if(flip)q.reverse();quad(...q);
 }
 for(const j of [0,steps]){const q=[at(xs[0],.075,j),at(xs.at(-1),.075,j),at(xs.at(-1),.062,j),at(xs[0],.062,j)];if(j===steps)q.reverse();quad(...q);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function downpipeGeometry(){
 const v=(y,z)=>new THREE.Vector3(0,y,z),curve=new THREE.CurvePath();
 curve.add(new THREE.LineCurve3(v(2.53,0),v(.35,0)));
 const bend=new THREE.QuadraticBezierCurve3(v(.35,0),v(.22,0),v(.17,.10));curve.add(bend);
 curve.add(new THREE.LineCurve3(v(.17,.10),v(.115,.19)));
 // Spend rings on the bend, not the straight drop. Both walls and annular end
 // rims are real geometry; 432 triangles replace a uniform 1200-triangle sweep.
 const rings=[{p:v(2.53,0),t:v(-1,0)}];for(let i=0;i<=6;i++)rings.push({p:bend.getPoint(i/6),t:bend.getTangent(i/6)});rings.push({p:v(.115,.19),t:curve.getTangent(1)});
 const positions=[],indices=[],segments=12;
 const at=(ring,r,j)=>{const a=j*Math.PI*2/segments,frame=new THREE.Vector3().crossVectors(ring.t,new THREE.Vector3(1,0,0));return [Math.cos(a)*r,ring.p.y+frame.y*Math.sin(a)*r,ring.p.z+frame.z*Math.sin(a)*r];};
 const quad=q=>{const i=positions.length/3;positions.push(...q.flat());indices.push(i,i+1,i+2,i,i+2,i+3);};
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++)for(const r of [.052,.039]){const q=[at(rings[i],r,j),at(rings[i],r,j+1),at(rings[i+1],r,j+1),at(rings[i+1],r,j)];if(r===.039)q.reverse();quad(q);}
 for(const [ring,flip]of [[rings[0],false],[rings.at(-1),true]])for(let j=0;j<segments;j++){const q=[at(ring,.052,j),at(ring,.039,j),at(ring,.039,j+1),at(ring,.052,j+1)];if(flip)q.reverse();quad(q);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));g.setIndex(indices);g.computeVertexNormals();
 return {geometry:g,curve,outlet:v(.115,.19),direction:curve.getTangent(1)};
}

export function buildBuildingDrainage(root,width,front,{mesh,box,cylinder}){
 const group=new THREE.Group();group.name='BuildingDrainage';root.add(group);
 for(const side of [-1,1]){
  const run=new THREE.Group();run.name=side===1?'FrontDrainage':'RearDrainage';run.rotation.y=side===1?0:Math.PI;group.add(run);
  const span=width+.32,x=width/2-.10,z=front+.25;
  const gutter=mesh(run,gutterGeometry(span,x),'iron',0x829593,0,2.59,z);gutter.name='OpenGutter';
  for(const dz of [-.075,.075]){const lip=cylinder(run,'iron',0,2.59,z+dz,.009,span,0x9aaba3);lip.rotation.z=Math.PI/2;}
  const pipe=downpipeGeometry(),body=mesh(run,pipe.geometry,'iron',0x768c86,x,0,z);body.name='HollowDownpipe';
  // The spigot collar surrounds the inlet without a disc across the bore.
  for(const y of [2.49,1.37]){const collar=new THREE.LatheGeometry([[.060,-.028],[.060,.028],[.052,.028],[.052,-.028],[.060,-.028]].map(p=>new THREE.Vector2(...p)),12);mesh(run,collar,'iron',0x8c9a8f,x,y,z);}
  for(const y of [.64,1.92]){
   box(run,'iron',x,y,front+.07,.15,.13,.035,0x64776f,.004);
   box(run,'iron',x,y,front+.15,.032,.035,.16,0x64776f,.004);
   const strap=new THREE.TorusGeometry(.056,.009,4,12);strap.rotateX(Math.PI/2);mesh(run,strap,'iron',0x9a9d88,x,y,z);
   for(const dx of [-.055,.055]){const screw=cylinder(run,'iron',x+dx,y,front+.092,.013,.018,0xa2a38e);screw.rotation.x=Math.PI/2;}
  }
  // Brackets follow the eave rhythm and physically join trough to fascia.
  for(let bx=-width/2+.18;bx<=width/2;bx+=.82){
   box(run,'iron',bx,2.53,front+.16,.026,.12,.035,0x657970,.004);
   box(run,'iron',bx,2.505,front+.235,.026,.025,.18,0x657970,.004);
  }
  const ring=new THREE.TorusGeometry(.048,.009,4,12);const rim=mesh(run,ring,'iron',0x9b9d87,x,pipe.outlet.y,z+pipe.outlet.z);rim.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),pipe.direction);
  // Localized seam oxidation and a low splash stone explain the runoff path.
  for(const y of [2.455,1.336]){const rust=new THREE.TorusGeometry(.054,.004,3,12);rust.rotateX(Math.PI/2);mesh(run,rust,'rust',0x86694b,x,y,z);}
  const stone=mesh(run,splashStoneGeometry(),'stone',0x657369,x,0,z+.22);stone.name='DrainageSplashStone';
  const stain=mesh(run,splashStainGeometry(),'stone',0x3d554c,x,0,z+.22);stain.name='DrainageSplashStain';stain.castShadow=false;
 }
 group.userData.drainage={runs:2,span:width+.32,front,outletX:width/2-.10};
 return group;
}
