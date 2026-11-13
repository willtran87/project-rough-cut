import * as THREE from './vendor/three/three.module.js';

const clamp=THREE.MathUtils.clamp;
const hash=n=>{const v=Math.sin(n*127.1+43.71)*43758.5453;return v-Math.floor(v);};
const gaussian=(t,centre,width)=>Math.exp(-(((t-centre)/width)**2));

export function drainRootProfile(curve,radius,{taper=.83,branchPoints=[]}={}){
 const start=curve.getPointAt(0),end=curve.getPointAt(1),seed=start.x*3.13+start.y*5.71+start.z*.91+end.x*.37+end.z*1.7+radius*31;
 const phase=hash(seed)*Math.PI*2,collars=[];
 for(const point of branchPoints){
  let best=Infinity,at=0;
  for(let i=0;i<=96;i++){const t=i/96,d=curve.getPointAt(t).distanceToSquared(point);if(d<best){best=d;at=t;}}
  collars.push(at);
 }
 const burl=.20+hash(seed+3)*.53,scar=.18+hash(seed+11)*.40;
 const widthAt=t=>radius*(1-t*taper)*clamp(.88+.055*Math.sin(t*(8+hash(seed+4)*5)+phase)+.12*gaussian(t,burl,.075)+collars.reduce((n,c)=>n+.15*gaussian(t,c,.055),0),.79,1.08);
 return {seed,phase,collars,burl,scar,widthAt};
}

export function drainRootGeometry(curve,radius,wall,{taper=.83,branchPoints=[],lowDetail=false}={}){
 const profile=drainRootProfile(curve,radius,{taper,branchPoints});
 const segments=lowDetail?(radius>=.13?13:7):(radius>=.13?22:10),sides=lowDetail?(radius>=.13?7:5):(radius>=.13?10:6);
 const geometry=new THREE.TubeGeometry(curve,segments,radius,sides,false),positions=geometry.attributes.position,uv=geometry.attributes.uv,colors=[];
 const length=curve.getLength();
 for(let ring=0;ring<=segments;ring++){
  const t=ring/segments,centre=curve.getPointAt(t),width=profile.widthAt(t),twist=profile.phase+Math.sin(t*4.7+profile.phase)*.32;
  for(let side=0;side<=sides;side++){
   const n=ring*(sides+1)+side,angle=side/sides*Math.PI*2;
   const ridge=(.5+.5*Math.cos(angle*3+twist))**2;
   const cleft=gaussian(t,profile.scar,.16)*(.5+.5*Math.cos(angle*2-profile.phase))**12;
   const radial=.84+ridge*.15-cleft*.17;
   const scale=width/radius*radial;
   let x=centre.x+(positions.getX(n)-centre.x)*scale,y=centre.y+(positions.getY(n)-centre.y)*scale,z=centre.z+(positions.getZ(n)-centre.z)*scale;
   const upper=wall?.maxIntrusion?THREE.MathUtils.smoothstep(y,2.3,3.1):0,flatten=.23+upper*.27;
   if(wall){if(wall.vertical)x=wall.face+(x-wall.face)*flatten;else z=-wall.face+(z+wall.face)*flatten;}
   if(wall?.maxIntrusion){
    const intrusion=wall.maxIntrusion+upper*.12;
    if(wall.vertical)x=wall.boundary+wall.side*clamp((x-wall.boundary)*wall.side,-.15,intrusion);
    else z=-(wall.boundary+wall.side*clamp((-z-wall.boundary)*wall.side,-.15,intrusion));
   }
   positions.setXYZ(n,x,y,z);uv.setXY(n,side/sides*Math.PI*radius,t*length/2);
   const tone=clamp(.88+ridge*.12-cleft*.20,.68,1);colors.push(tone,tone*(.975+.025*ridge),tone*(.94+.06*ridge));
  }
 }
 // Measure bark around the final tapered/flattened section, after all wall
 // constraints. Two metres per texture repeat matches the architectural bank.
 // Measuring each edge also prevents elliptical sections compressing the grain.
 for(let ring=0;ring<=segments;ring++){
  let around=0;
  for(let side=0;side<=sides;side++){
   const n=ring*(sides+1)+side;
   if(side)around+=Math.hypot(positions.getX(n)-positions.getX(n-1),positions.getY(n)-positions.getY(n-1),positions.getZ(n)-positions.getZ(n-1));
   uv.setX(n,around/2);
  }
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 // Tube UVs duplicate the seam. Average those coincident normals so a bark
 // repeat does not introduce a bright stitched edge along the root's length.
 const normals=geometry.attributes.normal,normal=new THREE.Vector3();
 for(let ring=0;ring<=segments;ring++){const a=ring*(sides+1),b=a+sides;normal.set(normals.getX(a)+normals.getX(b),normals.getY(a)+normals.getY(b),normals.getZ(a)+normals.getZ(b)).normalize();normals.setXYZ(a,normal.x,normal.y,normal.z);normals.setXYZ(b,normal.x,normal.y,normal.z);}
 geometry.userData.rootProfile={collars:profile.collars,seed:profile.seed,segments,sides};
 return {geometry,profile};
}
