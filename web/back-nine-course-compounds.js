// Composed middle-distance scenes on the existing course apron. Each remains
// beyond the boundary fence, with an open view from a real chase approach.
export const BACK_NINE_COMPOUNDS=Object.freeze([
 {id:'irrigation-tank-yard',kind:'pump-compound',x:-51,y:250,width:16,length:20,height:9.4},
 {id:'abandoned-practice-shelter',kind:'practice-shelter',x:49,y:536,width:15,length:34,height:11.2},
 {id:'ruined-members-pavilion',kind:'pavilion',x:-49,y:668,width:13,length:16.4,height:7.9}
]);

export function buildBackNineCompounds({THREE,box:b,put:p,cylinder,beam}){
 function foundationEdge(x,z,w,d){
  // Damp sediment fades into the existing raised rough apron. Keep the
  // middle empty: the slab supplies the opaque foundation, not this trim.
  const positions=[],colors=[],uv=[],indices=[],tint=new THREE.Color(0x62634f).toArray().map(v=>v**.65),rows=[-.15,.12,.5,1.05];
  for(let side=0;side<4;side++)for(let step=0;step<=8;step++){
   const a=side*Math.PI/2+step*Math.PI/16,cx=(side===0||side===3?1:-1)*(w/2-.75),cz=(side<2?1:-1)*(d/2-.75);
   for(let row=0;row<rows.length;row++){
    const wave=.11*Math.sin(a*7+x)+.065*Math.sin(a*11+z),r=.75+rows[row]+wave,xx=cx+Math.cos(a)*r,zz=cz+Math.sin(a)*r;
    positions.push(xx,.124,zz);uv.push((x+xx)/4,(z+zz)/4);colors.push(...tint,[.45,.67,.32,0][row]*(.8+.2*Math.sin(a*3)**2));
   }
  }
  const count=positions.length/12;
  for(let n=0;n<count;n++)for(let row=0;row<3;row++){
   const a=n*4+row,b=a+1,c=((n+1)%count)*4+row,e=c+1;
   indices.push(a,c,b,b,c,e);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();p(g,'soilMargin',x,0,z);g.dispose();
 }
 function ring(type,x,y,z,r,t=.05){const g=new THREE.TorusGeometry(r,t,5,20);g.rotateX(Math.PI/2);p(g,type,x,y,z);g.dispose();}
 function pipe(a,c,r=.075,type='iron'){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...c),delta=end.clone().sub(start),g=new THREE.CylinderGeometry(r,r,delta.length(),8);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));const mid=start.add(end).multiplyScalar(.5);p(g,type,mid.x,mid.y,mid.z);g.dispose();
 }
 function roofPanel(points){
  // Closed triangular sheet: the missing roof section exposes real thickness.
  const vertices=[...points,...points.map(v=>[v[0],v[1]-.14,v[2]])],g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1,0,0,1,0,.5,1],2));
  g.setIndex([0,1,2,5,4,3,0,3,1,1,3,4,1,4,2,2,4,5,2,5,0,0,5,3]);
  const flat=g.toNonIndexed();flat.computeVertexNormals();flat.computeBoundingBox();const center=flat.boundingBox.getCenter(new THREE.Vector3());flat.translate(-center.x,-center.y,-center.z);p(flat,'roof',center.x,center.y,center.z);flat.dispose();g.dispose();
 }
 function pump(site){
  const {x,y}=site,z=-y,tx=x+3;
  foundationEdge(x,z,15.7,19.6);
  b('masonry',x,.12,z,15.7,.24,19.6);
  // Course-facing edge stays low, revealing the braced tank and repair shed.
  for(const dz of [-9.2,9.2]){b('masonry',x,.65,z+dz,15.7,1.05,.45);b('stone',x,1.22,z+dz,15.95,.14,.58);}
  b('masonry',x-7.7,.65,z,.45,1.05,18.8);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const xx=tx+sx*2.05,zz=z+sz*2.05;b('stone',xx,.35,zz,.7,.45,.7);b('iron',xx,1.85,zz,.19,3.0,.19);
   for(const side of [-1,1])b('brass',xx+side*.11,.7,zz,.05,.12,.22);
  }
  for(const sz of [-1,1])for(const direction of [-1,1])beam('iron',[tx-direction*2.05,.7,z+sz*2.05],[tx+direction*2.05,3.18,z+sz*2.05],.095);
  for(const sx of [-1,1])beam('iron',[tx+sx*2.05,.7,z-2.05],[tx+sx*2.05,3.18,z+2.05],.095);
  for(const sz of [-1,1])b('iron',tx,3.15,z+sz*2.05,4.5,.24,.24);
  p(cylinder,'paint',tx,4.85,z,2.9,3.4,2.9);
  for(const h of [3.18,4.87,6.52])ring('iron',tx,h,z,2.93,.065);
  const cap=new THREE.CylinderGeometry(.15,3.01,.9,20);p(cap,'roof',tx,6.98,z);cap.dispose();
  p(cylinder,'iron',tx,7.7,z,.13,.6,.13);p(cylinder,'brass',tx,8.55,z,.025,1.1,.025);
  for(const h of [3.32,6.35])for(let n=0;n<20;n++){const a=n*Math.PI/10;b('brass',tx+Math.cos(a)*2.94,h,z+Math.sin(a)*2.94,.075,.075,.075);}
  // A connected overflow, shutoff and discharge line supply a readable job.
  pipe([tx+2.93,6.15,z+.65],[tx+3.35,6.15,z+.65]);pipe([tx+3.35,6.15,z+.65],[tx+3.35,.52,z+.65]);
  pipe([tx+3.35,.52,z+.65],[tx+3.35,.52,z+6.4]);
  for(const h of [1.2,3.4,5.65])b('iron',tx+3.12,h,z+.65,.5,.075,.17);
  const valve=new THREE.TorusGeometry(.3,.042,6,12);p(valve,'rust',tx+3.48,1.55,z+.65,1,1,1,Math.PI/2);valve.dispose();
  b('iron',tx+3.38,1.55,z+.65,.38,.09,.09);
  // Fixed ladder, attached feet and a small landing at the tank shoulder.
  for(const dz of [-.34,.34])b('iron',tx+3.1,3.64,z-1.5+dz,.075,6.6,.075);
  for(let h=.55;h<6.8;h+=.36)b('iron',tx+3.1,h,z-1.5,.075,.055,.76);
  b('iron',tx+2.95,6.55,z-1.5,.68,.09,1.1);
  // Low pump shed behind the tank: projecting roof, open service aperture.
  const sx=x-4.8,sz=z+1.1;
  b('stone',sx,.35,sz,4.9,.35,7.3);b('weatherboard',sx-2.3,1.75,sz,.16,2.8,7);
  for(const dz of [-3.4,3.4])b('weatherboard',sx,1.75,sz+dz,4.7,2.8,.16);
  b('weatherboard',sx+2.3,2.8,sz,.15,.7,7);b('weatherboard',sx+2.3,.73,sz,.15,.8,7);
  for(const dz of [-3.35,0,3.35])b('iron',sx+2.4,1.76,sz+dz,.13,2.9,.13);
  b('roof',sx,3.24,sz,5.1,.2,7.65);b('iron',sx+2.57,3.21,sz,.12,.16,7.75);
  for(const dz of [-2,1.4]){
   b('iron',sx+.1,.73,sz+dz,1.7,.38,1.5);p(cylinder,'paint',sx+.1,1.17,sz+dz,.6,.75,.6);
   pipe([sx+.1,1.25,sz+dz],[sx+1.75,1.25,sz+dz],.12);b('brass',sx+1.8,1.25,sz+dz,.09,.28,.28);
  }
  b('wood',sx+1.7,1.26,sz,1.0,.13,5.8);
  for(let n=0;n<3;n++){b('paint',sx+1.65,1.55,sz-1+n*.7,.28,.45,.3);b('iron',sx+1.65,1.82,sz-1+n*.7,.13,.08,.1);}
  // Removed pipe sections and a pallet make the repair feel interrupted.
  for(let n=0;n<5;n++)b('wood',x-.7+n*.34,.34,z-6.8,.28,.12,2.1);
  for(const dz of [-7.5,-6.1])b('wood',x,.25,z+dz,2.0,.12,.12);
  for(let n=0;n<3;n++)pipe([x-.5+n*.38,.52,z-7.6],[x-.5+n*.38,.52,z-5.9],.12,'rust');
 }
 function practice(site){
  const {x,y}=site,z=-y,front=x-5.5,back=x+5.3;
  foundationEdge(x,z,12.4,29.7);
  b('stone',x,.13,z,12.4,.26,29.7);
  for(let bay=0;bay<6;bay++){
   const zz=z-14.5+bay*5.8;
   for(const xx of [front,back]){b('stone',xx,.35,zz,.6,.45,.6);b('weatherboard',xx,2.6,zz,.22,4.8,.22);}
   beam('weatherboard',[front,4.9,zz],[back,4.35,zz],.19,.22);
   beam('iron',[front,3.85,zz],[front+1,4.85,zz],.09);
   if(bay<5){
    b('rubber',x-2.8,.29,zz+2.85,2.9,.045,3.1);
    b('wood',back-.45,1.05,zz+2.85,.72,.13,4.2);
    for(const offset of [-1.7,1.7])b('iron',back-.45,.65,zz+2.85+offset,.1,.75,.1);
    // A missing roof bay exposes the rafters and breaks the long silhouette.
    if(bay!==3){const g=new THREE.BoxGeometry(11.4,.14,5.68);g.rotateZ(-Math.atan2(.55,10.8));p(g,'roof',x-.1,4.64,zz+2.85);g.dispose();}
    for(const xx of [front+.1,back-.1])b('iron',xx,4.66+(x-xx)*.05,zz+2.85,.13,.17,5.85);
    if(bay<4)b('iron',x-.2,1.45,zz+5.8,7,.055,.055);
   }
  }
  // Rear catch net: a sagging open lattice with a large torn lower bay.
  const nx=x+6.6;
  for(const dz of [-16.2,0,16.2]){b('stone',nx,.3,z+dz,.85,.5,.85);p(cylinder,'iron',nx,5.7,z+dz,.1,10.8,.1);}
  const top=t=>10.8-1.25*Math.sin(Math.PI*t);
  for(let half=0;half<2;half++){
   const start=z-16.2+half*16.2;
   for(let n=0;n<18;n++){
    const t=n/17,zz=start+t*16.2,h=top(t),torn=half===1&&n>5&&n<12,bottom=torn?4.6+(n%3)*.22:1.0;
    beam('iron',[nx,bottom,zz],[nx+.12*Math.sin(t*6),h,zz],.026);
    if(n<17)beam('iron',[nx,h,zz],[nx,top((n+1)/17),start+(n+1)/17*16.2],.055);
   }
   for(let row=1;row<10;row++)for(let section=0;section<3;section++){
    if(half===1&&section===1&&row<5)continue;
    const a=section/3,c=(section+1)/3,ha=1+(top(a)-1)*row/10,hc=1+(top(c)-1)*row/10;
    beam('iron',[nx,ha,start+a*16.2],[nx,hc,start+c*16.2],.026);
   }
  }
  // Small worn ball baskets remain within the inaccessible practice bay.
  for(const dz of [-11,6]){
   p(cylinder,'rust',x-.4,.57,z+dz,.36,.55,.36);ring('iron',x-.4,.86,z+dz,.37,.035);
   for(let n=0;n<5;n++)p(cylinder,'flag',x-.58+(n%3)*.16,.9,z+dz+Math.floor(n/3)*.16-.08,.075,.1,.075);
  }
 }
 function pavilion(site){
  const {x,y}=site,z=-y,w=11.5,d=14.5;
  foundationEdge(x,z,w+.7,d+.7);
  b('masonry',x,.18,z,w+.7,.36,d+.7);b('stone',x,.42,z,w,.13,d);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const xx=x+sx*5,zz=z+sz*6.5;b('stone',xx,.72,zz,.85,.45,.85);
   p(cylinder,'stone',xx,2.75,zz,.27,3.8,.27);b('stone',xx,4.68,zz,.75,.2,.75);
   b('masonry',xx,1.05,zz,.61,.13,.61);
  }
  for(const sz of [-1,1])b('weatherboard',x,4.88,z+sz*6.5,11,.22,.3);
  for(const sx of [-1,1])b('weatherboard',x+sx*5,4.88,z,.3,.22,13.3);
  const apex=[x,7.55,z],corners=[[x-6,5.05,z-7.5],[x+6,5.05,z-7.5],[x+6,5.05,z+7.5],[x-6,5.05,z+7.5]];
  for(let i=0;i<4;i++){
   const a=corners[i],c=corners[(i+1)%4];beam('weatherboard',a,c,.16,.22);beam('wood',a,apex,.17);
   // Course-facing east slope has an open missing section, with two surviving
   // sheets and exposed ridge supports. Other faces retain a complete roof.
   if(i===1){
    const h=7.55-2.5*(2.2/6),near=[x+2.2,h,z-2.1],far=[x+2.2,h,z+2.1];roofPanel([a,corners[1].map((v,j)=>v*.52+apex[j]*.48),near]);roofPanel([c,far,c.map((v,j)=>v*.52+apex[j]*.48)]);
    beam('wood',[x+5.7,5.06,z-2.7],apex,.12);beam('wood',[x+5.7,5.06,z+2.7],apex,.12);
   }else roofPanel([a,apex,c]);
  }
  for(const dz of [-5.8,5.8]){
   b('weatherboard',x,1.04,z+dz,7.8,.13,.85);b('wood',x,1.55,z+dz+(dz>0?.35:-.35),7.8,.65,.1);
   for(const dx of [-3.1,3.1])b('iron',x+dx,.73,z+dz,.13,.6,.6);
  }
  // Fallen roof boards lie against the rear bench, leaving the open doorway.
  for(let n=0;n<4;n++)beam('wood',[x-4+n*.35,.58,z+2.8],[x-3.2+n*.35,1.55,z+5.9],.18,.075);
  for(const dz of [-7.45,7.45]){
   b('masonry',x+4.2,.75,z+dz,1.6,.6,1.1);b('stone',x+4.2,1.08,z+dz,1.75,.12,1.25);
   b('rubber',x+4.2,1.15,z+dz,1.42,.035,.93);
   for(let n=0;n<5;n++)beam('wood',[x+3.8+n*.17,1.15,z+dz],[x+3.7+n*.19,1.65+(n%2)*.22,z+dz+.1],.025);
  }
 }
 for(const site of BACK_NINE_COMPOUNDS){if(site.kind==='pump-compound')pump(site);else if(site.kind==='practice-shelter')practice(site);else pavilion(site);}
 return BACK_NINE_COMPOUNDS.map(site=>({id:site.id,kind:site.kind}));
}
