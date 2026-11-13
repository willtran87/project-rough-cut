import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import { yieldPreparation } from './render-preparation.js';

// Branches and root flares are actual geometry; small fixed needle sprays carry
// the original illustration's fine edge pixels into a spatial crown.
export function createTrees({root,mesh,geometryOnly=false}){
  const pending=[],requests=new Map();let worker=null,workerTimeout=null,disposed=false,nextId=0,workerTrees=0,fallbackTrees=0,bakedTrees=0;
  const visibility=()=>{worker?.postMessage({paused:document.hidden});watchWorker();};
  function stopWorker(){if(typeof document!=='undefined')document.removeEventListener('visibilitychange',visibility);clearTimeout(workerTimeout);workerTimeout=null;worker?.terminate();worker=null;for(const resolve of requests.values())resolve(null);requests.clear();}
  function watchWorker(){clearTimeout(workerTimeout);workerTimeout=requests.size&&!(typeof document!=='undefined'&&document.hidden)?setTimeout(stopWorker,30000):null;}
  if(!geometryOnly&&typeof Worker!=='undefined')try{
    worker=new Worker(new URL('./tree-geometry-worker.js',import.meta.url),{type:'module'});
    if(typeof document!=='undefined'){document.addEventListener('visibilitychange',visibility);visibility();}
    worker.onmessage=({data})=>{const resolve=requests.get(data.id);requests.delete(data.id);resolve?.(data.error?null:data);watchWorker();};
    worker.onerror=event=>{event.preventDefault();stopWorker();};
    worker.onmessageerror=stopWorker;
  }catch{stopWorker();}
  const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  let needlesIndex=0;
  const needles=[[24,170,600,380],[650,180,600,340],[24,790,600,330],[650,740,600,390]].map(crop=>{
    const m=new THREE.MeshLambertMaterial({map:geometryOnly?null:Art.texture('rough-cut-needle-sprays-v1',crop),alphaTest:.32,side:THREE.DoubleSide,color:0xc3d0bc});
    m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.72));');};
    m.customProgramCacheKey=()=> 'rough-cut-needle-sprays-v1';
    m.userData.needleIndex=needlesIndex++;return m;
  });
  function limb(r,points,radius,tip=.18){
    const steps=points.length>3?10:3,sides=6,curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),g=new THREE.TubeGeometry(curve,steps,radius,sides,false),p=g.attributes.position;
    // Tube taper follows the centerline, keeping a continuous bent trunk.
    // Every vertex around a ring has the same center. Reuse the exact sampled
    // point instead of repeating arc-length lookup and spline evaluation seven times.
    const centers=Array.from({length:steps+1},(_,i)=>curve.getPointAt(i/steps));
    for(let i=0;i<p.count;i++){const ring=Math.floor(i/(sides+1)),t=ring/steps,c=centers[ring],s=1-t*(1-tip);p.setXYZ(i,c.x+(p.getX(i)-c.x)*s,c.y+(p.getY(i)-c.y)*s,c.z+(p.getZ(i)-c.z)*s);}g.computeVertexNormals();
    return mesh(r,g,'wood',0xaaa58c);
  }
  function spray(r,x,y,z,w,h,angle,seed){
    // Bent planes avoid the flat cross visible on the old four-card rings.
    const g=new THREE.PlaneGeometry(w,h,3,2),p=g.attributes.position;
    for(let i=0;i<p.count;i++)p.setZ(i,.15*w*Math.sin(p.getX(i)/w*Math.PI)+.12*h*Math.cos(p.getY(i)/h*Math.PI));
    g.computeVertexNormals();g.setAttribute('surfacePosition',p.clone());g.setAttribute('surfaceNormal',g.attributes.normal.clone());
    const m=new THREE.Mesh(g,needles[Math.floor(random(seed)*4)]);m.position.set(x,y,z);m.rotation.set((random(seed+4)-.5)*.85,angle,(random(seed+3)-.5)*.22);r.add(m);
  }
  function populate(r,x,z,height,radius){
    const seed=x*19+z*13,age=random(seed),open=age>.70,young=age<.25;
    if(young){height*=.82;radius*=.76;}
    const bendX=(random(seed+2)-.5)*height*.09,bendZ=(random(seed+3)-.5)*height*.07;
    const at=t=>[bendX*t*t,height*t,bendZ*t*t];
    const trunk=limb(r,[[0,0,0],at(.22),at(.48),at(.73),at(1)],.11+height*.014,.08);
    r.userData.treeForm=open?'weathered-pine':age<.25?'young-fir':'spreading-pine';
    for(let i=0;i<5;i++){
      const a=i*2.4+seed,length=.4+random(seed+i+50)*.5;
      limb(r,[[Math.cos(a)*length,.025,Math.sin(a)*length],[Math.cos(a)*.23,.12,Math.sin(a)*.23],[0,.45,0]],.065,.4);
    }
    const count=young?28:open?22:32,start=young?.12:open?.28:.22;
    for(let i=0;i<count;i++){
      const t=start+i/count*(.93-start)+random(seed+i)*.025,a=i*2.39996+random(seed+i+12)*.65;
      const reach=radius*(1.65*(1-t)+.12)*(.72+random(seed+i+29)*.55),base=at(t);
      const mid=[base[0]+Math.cos(a)*reach*.48,base[1]-.015*height,base[2]+Math.sin(a)*reach*.48];
      const end=[base[0]+Math.cos(a)*reach,base[1]+(.02+random(seed+i+30)*.045)*height,base[2]+Math.sin(a)*reach];
      limb(r,[base,mid,end],.026+(1-t)*.045,.15);
      if(open&&i%5===1)continue;
      const size=reach*(open?.65:.88);
      const cx=mid[0]*.38+end[0]*.62,cy=mid[1]*.20+end[1]*.80,cz=mid[2]*.38+end[2]*.62;
      spray(r,cx,cy+.04,cz,size*2.2,size*1.25,-a,seed+i);
      spray(r,cx,cy,cz,size*1.8,size*1.1,-a+Math.PI/2,seed+i+8);
      spray(r,mid[0],mid[1]+.10,mid[2],size*1.8,size*.95,-a+.65,seed+i+19);
    }
    const tip=at(.93);spray(r,tip[0],tip[1],tip[2],radius*.55,height*.16,seed,seed+100);
    return trunk;
  }
  function tree(x,z,height,radius){
    const r=root('tree',x,z),anchor=new THREE.Object3D();r.add(anchor);
    // The caller can set the terrain height immediately. Detailed crowns are
    // built in bounded loading slices, under the existing simulation-ready gate.
    let result=null;
    if(worker){const id=nextId++;result=new Promise(resolve=>requests.set(id,resolve));try{worker.postMessage({id,x,z,height,radius});watchWorker();}catch{stopWorker();}}
    pending.push({r,x,z,height,radius,result});return anchor;
  }
  async function prepareTrees(cancelled=()=>false){
    let slice=performance.now();
    try{for(const job of pending){
      if(disposed||cancelled())break;
      const data=job.result?await job.result:null;
      if(disposed||cancelled())break;
      if(data){
        job.r.userData.treeForm=data.form;workerTrees++;
        if(data.baked)bakedTrees++;
        for(const part of data.parts){
          const g=new THREE.BufferGeometry();
          for(const [name,a]of Object.entries(part.attributes))g.setAttribute(name,new THREE.BufferAttribute(a.array,a.itemSize));
          if(part.index)g.setIndex(new THREE.BufferAttribute(part.index,1));
          const m=part.needle===undefined?mesh(job.r,g,'wood',0xaaa58c):new THREE.Mesh(g,needles[part.needle]);
          m.position.fromArray(part.position);m.quaternion.fromArray(part.quaternion);if(!m.parent)job.r.add(m);
          if(performance.now()-slice>5){await yieldPreparation(()=>disposed||cancelled());slice=performance.now();if(disposed||cancelled())break;}
        }
      }else{populate(job.r,job.x,job.z,job.height,job.radius);fallbackTrees++;}
      if(performance.now()-slice>5){await yieldPreparation(()=>disposed||cancelled());slice=performance.now();}
    }}finally{pending.length=0;if(!geometryOnly)stopWorker();}
  }
  return {tree,prepareTrees,disposeTrees:()=>{disposed=true;stopWorker();pending.length=0;},treePreparationStats:()=>({workerTrees,fallbackTrees,bakedTrees})};
}
