import * as THREE from './vendor/three/three.module.js';

// Each existing noise trigger has two prepared physical poses. Only visibility
// changes when it is spent; no new collision, lights or activation-time uploads.
export function createNoiseHazardScene(parent,hazards,{scale,xScale}) {
 const root=new THREE.Group();root.name='course-noise-hazards';parent.add(root);
 const material=new THREE.MeshLambertMaterial({vertexColors:true});
 const records=[];
 for(const h of hazards){
  const radius=h.radius*scale,poses=[];
  for(const spent of [false,true]){
   const positions=[],normals=[],colors=[],matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),tint=new THREE.Color();
   const add=(geometry,color,x,y,z,rx=0,ry=0,rz=0)=>{
    q.setFromEuler(new THREE.Euler(rx,ry,rz));matrix.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(1,1,1));geometry.applyMatrix4(matrix);
    const flat=geometry.index?geometry.toNonIndexed():geometry;tint.setHex(color);if(spent)tint.multiplyScalar(.82);
    const p=flat.attributes.position,n=flat.attributes.normal;
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));const shade=.80+.20*Math.max(0,n.getY(i));colors.push(tint.r*shade,tint.g*shade,tint.b*shade);}
    if(flat!==geometry)flat.dispose();geometry.dispose();
   };
   const box=(c,x,y,z,w,hh,d,angle=0)=>add(new THREE.BoxGeometry(w,hh,d),c,x,y,z,0,angle);
   const rod=(c,x,y,z,r,length,rx=0,rz=0)=>add(new THREE.CylinderGeometry(r,r,length,8),c,x,y,z,rx,0,rz);
   const ring=(c,x,y,z,r,t,rx=0,ry=0)=>add(new THREE.TorusGeometry(r,t,5,20),c,x,y,z,rx,ry);
   const scatter=(i,count)=>{const a=i*2.39996+.35;const r=radius*(.28+.56*((i*7%count)/Math.max(1,count-1)));return [Math.cos(a)*r,Math.sin(a)*r];};
   if(h.kind==='balls'){
    // A tipped range basket and loose ivory balls, with no solid-looking lid.
    for(const z of [-.18,.18])ring(0xb8a886,-.25,.22,z,.21,.012,0,0);
    for(let i=0;i<10;i++){const a=i*Math.PI/5;rod(0x8c9584,-.25+Math.cos(a)*.21,.22+Math.sin(a)*.21,0,.009,.36,Math.PI/2);}
    for(let i=0;i<12;i++){const [x,z]=scatter(i,12),a=spent?.15:0;add(new THREE.IcosahedronGeometry(.045,1),i%4?0xe3ddba:0xcbb665,x+a*Math.sin(i),.05,z+a*Math.cos(i));}
   }else if(h.kind==='tools'){
    box(0x7e8973,-.18,.06,.16,.60,.10,.35,-.22);
    rod(0xc5ad7e,.04,.10,-.12,.025,.95,Math.PI/2,spent?.35:.12);
    box(0xa4aaa2,.04,.11,-.59,.43,.04,.09);
    for(let i=0;i<6;i++)box(0xa4aaa2,-.15+i*.075,.07,-.63,.018,.10,.10);
    box(0xbba071,.37,.06,.18,.045,.045,.52,spent?.9:.4);box(0x7d8d91,.49,.10,.40,.24,.12,.10,.4);
    box(0xc2c4b1,-.39,.07,-.34,.07,.045,.44,-.7);
   }else if(h.kind==='bag'){
    add(new THREE.CylinderGeometry(.23,.23,.80,12,1,true),0x8c715b,0,.25,0,Math.PI/2,0,spent?.18:0);
    rod(0x63584b,0,.25,-.39,.23,.025,Math.PI/2);
    for(const z of [-.39,.24])ring(0xbdab82,0,.25,z,.235,.025);
    box(0x9b8e69,.16,.23,.02,.15,.22,.42);
    box(0xb6a27a,0,.49,-.02,.055,.045,.46);
    for(let i=0;i<5;i++){const x=(i-2)*.085,z=.47+i*.035+(spent?(i%2)*.15:0);rod(0xc1c6bd,x,.21,z,.013,.55,Math.PI/2);box(0x9eaaa5,x+.015,.22,z+.28,.065,.08,.09,(i-2)*.24);}
   }else if(h.kind==='hose'){
    const points=[];for(let i=0;i<=24;i++){const a=i/24*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*radius*.72,.055,-.08+Math.sin(a)*radius*.56));}
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.037,6,false),0x758774,0,0,0);
    rod(0xc4ae70,spent?.39:.27,.075,-radius*.58,.075,.22,Math.PI/2);
    for(const z of [-radius*.58-.09,-radius*.58+.09])ring(0x939c91,spent?.39:.27,.075,z,.077,.015);
   }else{
    for(let i=0;i<14;i++){const [x,z]=scatter(i,14);add(new THREE.DodecahedronGeometry(.07+(i%3)*.025,0),[0xb3ada0,0x8e968d,0xc7bda4][i%3],x,.06,z,0,i*.9);}
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();
   const mesh=new THREE.Mesh(geometry,material);mesh.name=h.id+(spent?'-spent':'-ready');mesh.position.set(h.x*xScale,.015,-h.y*scale);mesh.castShadow=mesh.receiveShadow=true;mesh.visible=!spent;root.add(mesh);poses.push(mesh);
  }
  records.push({id:h.id,kind:h.kind,radius,poses,spent:false});
 }
 return {
  update(states){for(const r of records){const spent=!!states?.[r.id]?.triggered;if(spent===r.spent)continue;r.spent=spent;r.poses[0].visible=!spent;r.poses[1].visible=spent;}},
  stats:()=>({count:records.length,meshes:records.length*2,materials:1,records:records.map(r=>({id:r.id,kind:r.kind,position:r.poses[0].position.toArray(),radius:r.radius,spent:r.spent,geometry:r.poses.map(p=>p.geometry.uuid)}))}),
 };
}
