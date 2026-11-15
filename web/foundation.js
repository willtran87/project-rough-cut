/* Shared movement and presentation contracts. No DOM or game-state dependencies. */
(() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const units=Object.freeze({x:0.72,visual:0.12,walk:24,sprint:38,crouch:15,listen:15});
  const defaults=Object.freeze({cameraBob:0,cameraRoll:false,cameraShake:false,flashes:false,apparitions:true,ghostInterference:true,crouchToggle:false,sprintToggle:false,touchSprintToggle:false});
  let previousComfort={...defaults};
  function readComfort(){try{const p=JSON.parse(localStorage.getItem('rough-cut.feel.v1')||'{}');previousComfort=Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,typeof v==='boolean'?(typeof p?.[k]==='boolean'?p[k]:v):Number.isFinite(p?.[k])?clamp(p[k],0,.6):v]));}catch{previousComfort={...defaults};}return {...previousComfort};}
  function saveComfort(state){
    const changes=Object.fromEntries(Object.keys(defaults).filter(k=>state[k]!==undefined&&state[k]!==previousComfort[k]).map(k=>[k,state[k]]));
    if(!Object.keys(changes).length)return true;
    try{let latest;try{latest=JSON.parse(localStorage.getItem('rough-cut.feel.v1')||'{}');}catch{latest={};}
      if(!latest||typeof latest!=='object'||Array.isArray(latest))latest={};
      localStorage.setItem('rough-cut.feel.v1',JSON.stringify({...latest,...changes}));previousComfort={...previousComfort,...changes};return true;
    }catch{return false;}
  }
  function stick(x,y,deadzone){const m=Math.hypot(x,y);if(m<=deadzone)return {x:0,y:0};const scale=clamp((m-deadzone)/(1-deadzone),0,1)/m;return {x:x*scale,y:y*scale};}
  function relativePoint(player,target,yaw){const dx=(target.x-player.x)*units.x,dy=target.y-player.y;return {x:(dx*Math.cos(yaw)-dy*Math.sin(yaw))/units.x,y:dx*Math.sin(yaw)+dy*Math.cos(yaw)};}
  function moveVector(input,yaw){return {x:(input.x*Math.cos(yaw)+input.y*Math.sin(yaw))/units.x,y:input.y*Math.cos(yaw)-input.x*Math.sin(yaw)};}
  function project(relative,camera,width,offsetX=0){const ppm=camera.focalPixels/(Math.max(-camera.nearPlane+.6,relative.y)+camera.nearPlane);return {x:width*.5+relative.x*camera.worldUnitMeters*ppm+offsetX*.46,y:camera.horizonY+camera.cameraHeightMeters*ppm,scale:ppm/camera.referencePixelsPerMeter,pixelsPerMeter:ppm,forwardDistance:relative.y,visible:relative.y>-5&&relative.y<122};}
  function slideStep(player,dx,dy,obstacle,padding,blocked,constrain){
    const start={x:player.x,y:player.y}, test=(t)=>constrain({x:start.x+dx*t,y:start.y+dy*t});
    const rx=(obstacle.radiusX??obstacle.radius??0)+padding,ry=(obstacle.radiusY??obstacle.radius??0)+padding;
    const normalized=p=>obstacle.shape==="box"?Math.max(Math.abs((p.x-obstacle.x)*units.x)/rx,Math.abs(p.y-obstacle.y)/ry):Math.hypot((p.x-obstacle.x)*units.x/Math.max(rx,.01),(p.y-obstacle.y)/Math.max(ry,.01));
    if(normalized(start)<1){const p=test(1);return normalized(p)>normalized(start)+.00001&&(!blocked(p)||blocked(p).id===obstacle.id)?p:start;}
    let lo=0,hi=1;
    for(let i=0;i<10;i++){const mid=(lo+hi)/2;if(blocked(test(mid)))hi=mid;else lo=mid;}
    const contact=test(Math.max(0,lo-.001));
    let nx=(contact.x-obstacle.x)*units.x/Math.max(rx*rx,.001),ny=(contact.y-obstacle.y)/Math.max(ry*ry,.001);
    if(obstacle.shape==='box'){if(Math.abs((contact.x-obstacle.x)*units.x/rx)>Math.abs((contact.y-obstacle.y)/ry)){nx=Math.sign(contact.x-obstacle.x);ny=0;}else{nx=0;ny=Math.sign(contact.y-obstacle.y);}}
    const len=Math.hypot(nx,ny);if(len<.00001)return contact;nx/=len;ny/=len;
    let vx=dx*units.x*(1-lo),vy=dy*(1-lo);const into=Math.min(0,vx*nx+vy*ny);vx-=nx*into;vy-=ny*into;
    for(const amount of [1,.5,.25]){const p=constrain({x:contact.x+vx/units.x*amount,y:contact.y+vy*amount});if(!blocked(p))return p;}
    return contact;
  }
  function selectTarget(candidates,player,yaw,previousId){
    return candidates.map(c=>{const dx=(c.x-player.x)*units.x,dy=c.y-player.y,d=Math.hypot(dx,dy);const forward=dx*Math.sin(yaw)+dy*Math.cos(yaw);return {action:c,distance:d,score:d-(forward/Math.max(d,1))*2-(c.id===previousId?2:0)};})
      .filter(c=>c.distance<c.action.radius).sort((a,b)=>a.score-b.score)[0]||null;
  }
  window.RCFoundation=Object.freeze({units,defaults,readComfort,saveComfort,stick,relativePoint,moveVector,project,slideStep,selectTarget});
})();
