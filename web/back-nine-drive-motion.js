// Exposed drive markers and restrained loose-part motion follow Joe's real
// speed and engine state. Fixed instance pools retain the mower's silhouette.
export function createDriveMotion({THREE,body,materials}){
 const box=new THREE.BoxGeometry(1,1,1),link=new THREE.TorusGeometry(.043,.009,4,10);
 const pools=[];
 function pool(g,count,type){const m=new THREE.InstancedMesh(g,materials[type],count);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;body.add(m);pools.push(m);return m;}
 const spokes=pool(box,8,'iron'),chains=pool(link,12,'rust'),panels=pool(box,2,'iron');
 const dummy=new THREE.Object3D();let previous='',angle=0,lastRun=null;
 const state={angle:0,chainSway:0,panelFlex:0,uploads:0};
 function write(pool,i,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();pool.setMatrixAt(i,dummy.matrix);}
 return {update(run,dt,reduced){
  if(run.mode==='paused'&&lastRun===run)return;
  if(lastRun!==run){lastRun=run;angle=0;previous='';}
  const speed=Math.min(1,Math.abs(run.joe.speed||0)/18),t=run.time||0;
  if(!reduced)angle=(angle+Math.max(0,dt)*(3+speed*15))%(Math.PI*2);
  state.angle=reduced?0:angle;state.chainSway=reduced?0:Math.sin(t*7.1)*speed*.12;state.panelFlex=reduced?0:Math.sin(t*23)*speed*.018;
  const key=[state.angle,state.chainSway,state.panelFlex].join(':');if(key===previous){state.uploads=0;return;}previous=key;
  let index=0;
  for(const side of [-1,1])for(const z of [.35,.86])for(const spoke of [0,1])write(spokes,index++,side*1.369,.88,z,.012,.245,.024,state.angle+spoke*Math.PI/2);
  index=0;
  for(const side of [-1,1])for(let n=0;n<6;n++){
   const sway=state.chainSway*n/6;
   write(chains,index++,side*(1.07+sway*.12),1.13-n*.062,1.40+sway*.18,1,1.25,1,0,n%2?Math.PI/2:0,side*sway);
  }
  for(let i=0;i<2;i++){const side=i?1:-1;write(panels,i,side*.71,.69,1.875,.38,.24,.024,side*state.panelFlex,0,side*.025);}
  for(const pool of pools)pool.instanceMatrix.needsUpdate=true;state.uploads=3;
 },stats:()=>({...state,pulleys:4,chainLinks:12,panels:2}),dispose(){for(const p of pools){p.dispose();p.removeFromParent();}box.dispose();link.dispose();}};
}
