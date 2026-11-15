import * as THREE from './vendor/three/three.module.js';
import {HEDGE_PROFILE,coverRadiusAtHeight} from './course-cover-profile.js';

// Attached terminal shoots break the clipped hedge's edge. The solid body is
// retained by the caller; all foliage stays inside its horizontal footprint.
export function createHedgeGrowth(rx,rz,seed=0){
  const buckets=Array.from({length:8},()=>({positions:[],indices:[]}));
  const noise=n=>{const v=Math.sin(n*127.1+seed*.73+311.7)*43758.5453;return v-Math.floor(v);};
  function solid(points,faces,bucket){const offset=bucket.positions.length/3;for(const p of points)bucket.positions.push(...p);for(const f of faces)bucket.indices.push(...f.map(i=>i+offset));}
  function leaf(base,direction,normal,length,width,bucket){
    const across=new THREE.Vector3().crossVectors(direction,normal).normalize(),center=base.clone().addScaledVector(direction,length*.48);
    const points=[[0,0],[.20,.65],[.58,1],[1,0],[.58,-1],[.20,-.65]].map(([along,side])=>base.clone().addScaledVector(direction,length*along).addScaledVector(across,width*side));
    points.push(center.clone().addScaledVector(normal,.007),center.clone().addScaledVector(normal,-.003));
    const faces=[];for(let j=0;j<6;j++){const k=(j+1)%6;faces.push([6,j,k],[7,k,j]);}solid(points,faces,bucket);
  }
  function shoot(a,y,id,top=false){
    const radial=top?.25+noise(id+8)*.48:coverRadiusAtHeight(HEDGE_PROFILE,y);
    const base=new THREE.Vector3(Math.sin(a)*rx*radial,y,Math.cos(a)*rz*radial);
    // The crown slopes: place each root on that actual profile instead of a
    // flat plane which would leave the outer shoots suspended above it.
    if(top)base.y=radial<=.6?2.08-radial/.6*.02:2.06-(radial-.6)/.28*.18;
    const normal=top?new THREE.Vector3(0,1,0):new THREE.Vector3(Math.sin(a)/rx,.35,Math.cos(a)/rz).normalize();
    const tangent=new THREE.Vector3(Math.cos(a),0,-Math.sin(a));
    const up=new THREE.Vector3().crossVectors(normal,tangent).normalize();
    const direction=up.clone().addScaledVector(tangent,(noise(id+2)-.5)*1.2).addScaledVector(normal,.34).normalize();
    const length=.13+noise(id+3)*.14,bucket=buckets[Math.floor(((a%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/(Math.PI/4))];
    const first=bucket.positions.length;
    // A narrow, closed stem connects the staggered leaves to the clipped body.
    const start=base.clone().addScaledVector(normal,-.025),end=base.clone().addScaledVector(direction,length),side=tangent.clone().multiplyScalar(.008),depth=normal.clone().multiplyScalar(.007);
    solid([start.clone().add(side),start.clone().sub(side),start.clone().add(depth),end.clone().add(side),end.clone().sub(side),end.clone().add(depth)],[[0,2,1],[3,4,5],[0,4,3],[0,1,4],[1,5,4],[1,2,5],[2,3,5],[2,0,3]],bucket);
    for(let j=0;j<5;j++){
      const sign=j%2?1:-1,p=base.clone().addScaledVector(direction,length*(.16+j*.16));
      const axis=direction.clone().multiplyScalar(.4).addScaledVector(tangent,sign*.8).addScaledVector(normal,.25).normalize();
      leaf(p,axis,normal,.07+noise(id*7+j)*.045,.023+noise(id*9+j)*.013,bucket);
    }
    leaf(end,direction,normal,.075,.024,bucket);
    // Constrain the complete connected shoot with one affine transform.
    // Clamping individual vertices can fold a thin leaf inside out at the edge.
    let radius=0,height=0;const p=bucket.positions;
    for(let i=first;i<p.length;i+=3){radius=Math.max(radius,Math.hypot(p[i]/rx,p[i+2]/rz));height=Math.max(height,p[i+1]);}
    const scale=Math.min(1,.997/radius),drop=Math.max(0,height-2.22);
    for(let i=first;i<p.length;i+=3){p[i]*=scale;p[i+1]-=drop;p[i+2]*=scale;}
  }
  const perimeter=Math.PI*(3*(rx+rz)-Math.sqrt((3*rx+rz)*(rx+3*rz)));
  const count=Math.max(12,Math.min(24,Math.round(perimeter/.62)));
  for(let row=0;row<2;row++)for(let i=0;i<count;i++){
    const id=row*101+i,a=(i+(row?.42:0)+(noise(id+41)-.5)*.34)/count*Math.PI*2;
    shoot(a,(row?1.82:.88)+(noise(id+11)-.5)*.23,id);
  }
  for(let i=0;i<12;i++)shoot(i*2.39996,2.06+noise(i+303)*.015,i+500,true);
  const parts=buckets.map(({positions,indices})=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3*2),2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;});
  return {parts,shoots:count*2+12,leaves:(count*2+12)*6};
}
