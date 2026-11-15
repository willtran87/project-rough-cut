import * as THREE from './vendor/three/three.module.js';
import {angleDelta} from './back-nine-course.js';
import {mowerMouthTarget} from './chase-destruction.js';

const WIDTH=128,HEIGHT=64,CELL=8,CAPACITY=WIDTH*HEIGHT-1;
// One texel per authored soft plant; no growing list of historical mower
// positions and no per-frame search over the entire course. Texel zero keeps
// woody/raised planter foliage unchanged in the shared material batches.
export function createFoliageMowingMemory(){
 const data=new Uint8Array(WIDTH*HEIGHT*4),texture=new THREE.DataTexture(data,WIDTH,HEIGHT,THREE.RGBAFormat);
 texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;texture.needsUpdate=true;
 const cells=new Map(),plants=[null],active=[];
 let owner=null,lastTime=0,previous=null,cut=0,uploads=0;
 function register(p){
  if(!p.group)return 0;
  const id=plants.length;if(id>CAPACITY)throw new Error('Course foliage mowing capacity exceeded');
  const plant={id,x:p.x,y:p.y};plants.push(plant);const key=Math.floor(p.x/CELL)+','+Math.floor(p.y/CELL);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push(plant);return id;
 }
 function mark(x,y,yaw){
  const sx=Math.sin(yaw),sy=Math.cos(yaw),cx=x+sx*1.45,cy=y+sy*1.45;
  for(let bx=Math.floor((cx-2.3)/CELL);bx<=Math.floor((cx+2.3)/CELL);bx++)for(let by=Math.floor((cy-2.3)/CELL);by<=Math.floor((cy+2.3)/CELL);by++)for(const p of cells.get(bx+','+by)||[]){
   const offset=p.id*4;if(data[offset+3])continue;
   const dx=p.x-cx,dy=p.y-cy,across=dx*sy-dy*sx,along=dx*sx+dy*sy;
   if(Math.abs(across)>2.02||Math.abs(along)>.65)continue;
   data[offset+1]=Math.round((sx*.5+.5)*255);data[offset+2]=Math.round((-sy*.5+.5)*255);data[offset+3]=255;
   active.push(p.id);cut++;
  }
 }
 function reset(){data.fill(0);active.length=0;cut=0;previous=null;texture.needsUpdate=true;uploads++;}
 return {texture,register,
  update(run,reduced=false){
   uploads=0;
   if(owner!==run||run.time<lastTime){owner=run;reset();lastTime=run.time;}
   const dt=run.mode==='paused'?0:Math.max(0,Math.min(.1,run.time-lastTime));lastTime=run.time;
   const j=run.joe;
   if(mowerMouthTarget(run).cutting){
    const current={x:j.x,y:j.y,yaw:j.yaw};
    if(!previous)mark(current.x,current.y,current.yaw);
    else {const distance=Math.hypot(current.x-previous.x,current.y-previous.y),turn=angleDelta(current.yaw,previous.yaw);
     if(distance<=12){const steps=Math.max(1,Math.ceil(Math.max(distance/.55,Math.abs(turn)/.2)));for(let i=1;i<=steps;i++){const t=i/steps;mark(previous.x+(current.x-previous.x)*t,previous.y+(current.y-previous.y)*t,previous.yaw+turn*t);}}
    }
    previous=current;
   }else previous=null;
   let changed=false;
   for(let i=active.length-1;i>=0;i--){const offset=active[i]*4,before=data[offset];
    if(run.mode!=='paused')data[offset]=reduced?255:Math.min(255,before+Math.round(dt*255/.28));
    changed ||= data[offset]!==before;
    if(data[offset]===255){active[i]=active.at(-1);active.pop();}
   }
   if(changed){texture.needsUpdate=true;uploads++;}
  },
  sample(id){const i=id*4;return {cut:!!data[i+3],amount:data[i]/255,direction:[data[i+1]/255*2-1,data[i+2]/255*2-1]};},
  stats:()=>({registered:plants.length-1,capacity:CAPACITY,cut,settled:cut-active.length,active:active.length,uploads,bytes:data.byteLength}),
  dispose(){texture.dispose();cells.clear();plants.length=1;active.length=0;}
 };
}
