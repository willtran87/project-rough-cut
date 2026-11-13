import * as THREE from './vendor/three/three.module.js';

export function finishDrainLamps({lamps,box,put,cyl}){
 for(const lamp of lamps){
  const x=lamp.x,h=lamp.height||2.8,z=-lamp.y+(lamp.lensOffset??.18),face=lamp.facing??1,wide=lamp.height?.38:.19,tall=lamp.height?.25:.32;
  // A deep gasket, riveted hood and bars sit in front of the existing lit lens.
  for(const side of [-1,1]){
   box('rubber',x+side*(wide/2+.022),h,z+face*.025,.04,tall+.10,.055);
   box('iron',x,h+side*(tall/2+.045),z+face*.02,wide+.14,.055,.17);
   for(const end of [-1,1])put(cyl,'brass',x+side*(wide/2+.035),h+end*(tall/2+.035),z+face*.115,.012,.018,.012,Math.PI/2);
  }
  for(const side of [-1,0,1])box('iron',x+side*wide*.36,h,z+face*.13,.012,tall+.10,.015);
  box('iron',x,h,z+face*.13,wide+.08,.012,.015);
  box('rust',x,h+tall/2+.08,z+face*.05,wide+.18,.035,.24);
  box('white',x,h-tall/2-.09,z-face*.035,.08,.06,.08);
 }
 return {finishedLamps:lamps.length};
}

export function finishSignalHousing({signal,box,put,cyl}){
 for(const facing of [-1,1]){
  box('rust',0,.19,facing*.10,1.16,.035,.32,signal);
  box('rubber',0,-.17,facing*.13,1.10,.025,.08,signal);
  for(const x of [-.49,.49])for(const y of [-.12,.12])put(cyl,'steel',x,y,facing*.17,.016,.018,.016,Math.PI/2,0,0,signal);
  for(let i=0;i<3;i++){
   const ring=new THREE.TorusGeometry(.148,.014,4,12);put(ring,'iron',-.32+i*.32,0,facing*.15,1,1,1,0,0,0,signal);ring.dispose();
   // A dark circular seat behind the symbol gives the lit glass a real recess.
   const seat=new THREE.CircleGeometry(.143,24);put(seat,'rubber',-.32+i*.32,0,facing*.124,1,1,1,0,facing<0?Math.PI:0,0,signal);seat.dispose();
   // Open-bottom weather hood; stays inside the former rectangular hood depth.
   const brow=new THREE.Shape();
   for(const [radius,reverse]of [[.174,false],[.162,true]])for(let j=0;j<=12;j++){
    const angle=Math.PI/6+(reverse?12-j:j)*Math.PI/18,x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
    if(!reverse&&j===0)brow.moveTo(x,y);else brow.lineTo(x,y);
   }
   brow.closePath();const hood=new THREE.ExtrudeGeometry(brow,{depth:.10,bevelEnabled:false,steps:1});hood.translate(0,0,-.05);
   put(hood,'iron',-.32+i*.32,0,facing*.195,1,1,1,0,0,0,signal);hood.dispose();
  }
 }
}

// ShapeGeometry UVs are local metres, unlike CircleGeometry's normalized UVs.
// Give every symbol the same physical lens-art domain and shallow glass crown.
export function prepareSignalLens(geometry){
 const p=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),radius=Math.hypot(x,y)/.145;
  uv.setXY(i,.5+x/.29,.5+y/.29);p.setZ(i,.012*Math.max(0,1-radius*radius));
 }
 p.needsUpdate=uv.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

// One shared pixel-art lens: fluted glass, shaded rim, dirt and worn highlights.
export function signalGlassTexture(){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),ramp=[56,72,92,112,132,152,174,196,218,238];
 for(let y=0;y<128;y+=2)for(let x=0;x<128;x+=2){
  const px=(x-63)/63,py=(y-63)/63,r=Math.hypot(px,py);
  const fluting=(Math.floor(y/6)%2?-.055:.055),rim=Math.max(0,(r-.68)/.32);
  const dirt=Math.max(0,py-.30)*(.10+.08*Math.sin(px*6+1)**2);
  const crescent=r>.50&&r<.72&&px<-.18&&py<-.12?.10:0;
  const value=Math.max(0,Math.min(1,.90-r*r*.28-rim*.28+fluting-dirt+crescent));
  const shade=ramp[Math.round(value*(ramp.length-1))];g.fillStyle=`rgb(${shade},${shade},${shade})`;g.fillRect(x,y,2,2);
 }
 // Sparse short scratches and a lower-edge deposit, not all-over pixel noise.
 for(const [x,y,w,h]of [[24,43,9,2],[89,33,5,2],[42,94,3,5],[78,103,12,2],[26,86,5,2]]){g.fillStyle='#797975';g.fillRect(x,y,w,h);g.fillStyle='#cacac3';g.fillRect(x,y-2,w,1);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;return t;
}
