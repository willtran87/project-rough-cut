import * as THREE from './vendor/three/three.module.js';

// A broad, shallow drainage vault follows the existing entrance arch. The
// upper roof remains a solid mass, with its original flat 4.35 m outer face.
// Shared x stations keep the soffit and its attached damage exactly seated.
export const GALLERY_ROOF=Object.freeze({halfWidth:5,near:0,far:16,step:.125,base:3.05,rise:1.10,oldHeight:4.15,top:4.35});
const heights=Array.from({length:81},(_,i)=>GALLERY_ROOF.base+GALLERY_ROOF.rise*Math.sqrt(Math.max(0,1-((-5+i*.125)/5)**2)));
const arcs=[0];for(let i=1;i<heights.length;i++)arcs.push(arcs[i-1]+Math.hypot(.125,heights[i]-heights[i-1]));
function sample(values,x){const at=THREE.MathUtils.clamp((x+5)/.125,0,80),i=Math.min(79,Math.floor(at));return THREE.MathUtils.lerp(values[i],values[i+1],at-i);}
export const galleryRoofHeight=x=>sample(heights,x);
export const galleryRoofArc=x=>sample(arcs,x)-arcs[40];
export const isGalleryRoofPanel=t=>t.x-t.w/2>=-5.00001&&t.x+t.w/2<=5.00001&&t.y-t.d/2>=-.00001&&t.y+t.d/2<=16.00001;

// Upper wall remnants follow the lower springing line without compressing
// their damp feet. Their thickness, original brick backing and floor stay put.
export function galleryWallFinishHeight(height){const seam=2.2,top=galleryRoofHeight(4.874)-.035;return height<=seam?height:seam+(height-seam)*(top-seam)/(4.15-seam);}

export function galleryRoofPanelGeometry(t){
 const left=t.x-t.w/2,right=t.x+t.w/2,near=t.y-t.d/2,far=t.y+t.d/2,xs=[left];
 for(let x=(Math.floor((left+5)/.125)+1)*.125-5;x<right-1e-7;x+=.125)xs.push(x);xs.push(right);
 const positions=[],uv=[],indices=[];
 const v=(x,h,y)=>new THREE.Vector3(x,h,-y);
 function quad(points,normal,soffit=false){
  if(points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0])).dot(normal)<0)points=[points[0],points[3],points[2],points[1]];
  const start=positions.length/3;for(const p of points){positions.push(...p.toArray());uv.push((soffit?galleryRoofArc(p.x):p.x)/2,soffit||Math.abs(normal.y)>.5?p.z/2:p.y/2);}indices.push(start,start+1,start+2,start,start+2,start+3);
 }
 for(let i=0;i<xs.length-1;i++){
  const a=xs[i],b=xs[i+1],ha=galleryRoofHeight(a),hb=galleryRoofHeight(b),top=GALLERY_ROOF.top;
  quad([v(a,ha,near),v(b,hb,near),v(b,hb,far),v(a,ha,far)],new THREE.Vector3(0,-1,0),true);
  quad([v(a,top,near),v(b,top,near),v(b,top,far),v(a,top,far)],new THREE.Vector3(0,1,0));
  for(const y of [near,far])quad([v(a,ha,y),v(b,hb,y),v(b,top,y),v(a,top,y)],new THREE.Vector3(0,0,y===near?1:-1));
 }
 for(const x of [left,right])quad([v(x,galleryRoofHeight(x),near),v(x,galleryRoofHeight(x),far),v(x,GALLERY_ROOF.top,far),v(x,GALLERY_ROOF.top,near)],new THREE.Vector3(x===left?-1:1,0,0));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.userData.preserveDrainUV=true;return g;
}

// Clip each source triangle at the same x stations as the roof before bending.
// This seats broad stains and exposed brick on the actual faceted soffit;
// simply bending their outline would leave flat triangles floating beneath it.
export function bendGalleryRoofFinish(source,matrix){
 const p=source.attributes.position,index=source.index,attrs=Object.keys(source.attributes).filter(n=>n!=='position'&&n!=='normal'),data={position:[]};
 for(const name of attrs)data[name]=[];
 const vertex=i=>{const point=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix),v={position:point.toArray()};for(const name of attrs){const a=source.attributes[name];v[name]=Array.from({length:a.itemSize},(_,k)=>a.array[i*a.itemSize+k]);}return v;};
 const mix=(a,b,t)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k].map((v,i)=>v+(b[k][i]-v)*t)]));
 function clip(poly,boundary,side){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.position[0]-boundary)*side,db=(b.position[0]-boundary)*side;if(da>=-1e-9)out.push(a);if((da>1e-9&&db< -1e-9)||(da< -1e-9&&db>1e-9))out.push(mix(a,b,da/(da-db)));}return out;}
 for(let i=0;i<(index?.count||p.count);i+=3){
  const triangle=[0,1,2].map(j=>vertex(index?index.getX(i+j):i+j)),xs=triangle.map(v=>v.position[0]);
  const first=Math.floor((Math.min(...xs)+5)/.125),last=Math.max(first,Math.ceil((Math.max(...xs)+5)/.125)-1);
  for(let stripe=first;stripe<=last;stripe++){
   const lower=stripe*.125-5,poly=clip(clip(triangle,lower,1),lower+.125,-1);
   for(let k=1;k<poly.length-1;k++){
    const points=[poly[0],poly[k],poly[k+1]].map(v=>({...v,position:[v.position[0],v.position[1]-4.15+galleryRoofHeight(v.position[0]),v.position[2]]}));
    const a=new THREE.Vector3(...points[0].position),b=new THREE.Vector3(...points[1].position),c=new THREE.Vector3(...points[2].position);if(b.sub(a).cross(c.sub(a)).lengthSq()<1e-18)continue;
    for(const v of points){data.position.push(...v.position);for(const name of attrs)data[name].push(...(name==='uv'?[galleryRoofArc(v.position[0])/2,v.position[2]/2]:v[name]));}
   }
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));for(const name of attrs)g.setAttribute(name,new THREE.Float32BufferAttribute(data[name],source.attributes[name].itemSize));g.computeVertexNormals();g.userData.preserveDrainUV=true;g.computeBoundingBox();return g;
}

export function galleryRoofFinishPut(put){const stats={pieces:0,triangles:0,minimumHeight:Infinity,maximumHeight:-Infinity};const wrapped=(g,type,x,h,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{
 // Wall seeps and buried floor fragments remain in their original planes.
 if(h<4.10)return put(g,type,x,h,z,sx,sy,sz,rx,ry,rz);
 const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,h,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
 const bent=bendGalleryRoofFinish(g,matrix),anchor=bent.boundingBox.getCenter(new THREE.Vector3());stats.pieces++;stats.triangles+=bent.attributes.position.count/3;stats.minimumHeight=Math.min(stats.minimumHeight,bent.boundingBox.min.y);stats.maximumHeight=Math.max(stats.maximumHeight,bent.boundingBox.max.y);bent.translate(-anchor.x,-anchor.y,-anchor.z);const result=put(bent,type,anchor.x,anchor.y,anchor.z);bent.dispose();return result;
};wrapped.stats=stats;return wrapped;}
