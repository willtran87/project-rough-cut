/* World-anchored ground and depth-sorted solid cover, sharing the game's projection. */
(() => {
  let atlas=null, floor=null, pixels=null, surface=null;
  const W=480,H=148,AW=640,AH=1600,ORIGIN_X=160,ORIGIN_Y=40;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const noise=(x,y)=>{let n=(x*374761393+y*668265263)|0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295;};
  const textures={};
  function texture(stone){
    const key=stone?'stone':'hedge';if(textures[key])return textures[key];
    const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');
    g.fillStyle=stone?'#48514a':'#294631';g.fillRect(0,0,128,128);
    // Staggered leaf clusters avoid a regular checkerboard at close range.
    for(let i=0;i<850;i++){
      const x=noise(i,17)*128,y=noise(i,41)*128,n=noise(i,73),cluster=(Math.sin(x*.13)+Math.cos(y*.17))*.08;
      g.fillStyle=stone?`rgba(155,163,143,${n*.15})`:`rgba(${n>.48?'99,126,75':'9,28,18'},${.1+n*.22+cluster})`;
      g.fillRect(Math.round(x),Math.round(y),stone?3:2+n*4,stone?3:1+n*2);
    }
    if(stone){g.strokeStyle='#303c34';g.lineWidth=2;for(let y=0;y<=128;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(128,y);g.stroke();for(let x=(y%64?0:32);x<128;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke();}}}
    return textures[key]=c;
  }
  // Two affine triangles map a stable local texture onto each projected face.
  function texturedTriangle(ctx,pattern,p,u){
    const a=u[1].x-u[0].x,b=u[1].y-u[0].y,c=u[2].x-u[0].x,d=u[2].y-u[0].y,det=a*d-b*c;if(Math.abs(det)<.001)return;
    const ex=p[1].x-p[0].x,ey=p[1].y-p[0].y,fx=p[2].x-p[0].x,fy=p[2].y-p[0].y;
    const A=(ex*d-fx*b)/det,B=(ey*d-fy*b)/det,C=(fx*a-ex*c)/det,D=(fy*a-ey*c)/det;
    ctx.save();ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();ctx.clip();
    ctx.transform(A,B,C,D,p[0].x-A*u[0].x-C*u[0].y,p[0].y-B*u[0].x-D*u[0].y);ctx.fillStyle=pattern;
    const x=Math.min(...u.map(v=>v.x)),y=Math.min(...u.map(v=>v.y));ctx.fillRect(x-1,y-1,Math.max(...u.map(v=>v.x))-x+2,Math.max(...u.map(v=>v.y))-y+2);ctx.restore();
  }
  function buildAtlas(sample,paths){
    atlas=new Uint8ClampedArray(AW*AH*3);
    const marks=new Uint8Array(AW*AH);
    // Fixed paths are painted into terrain once; they never chase the objective.
    for(const path of paths)for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*2));
      for(let j=0;j<=steps;j++){
        const x=Math.round((a.x+(b.x-a.x)*j/steps+ORIGIN_X)*2),y=Math.round((a.y+(b.y-a.y)*j/steps+ORIGIN_Y)*2);
        for(let dy=-7;dy<=7;dy++)for(let dx=-10;dx<=10;dx++){if(dx*dx/100+dy*dy/49>1)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&xx<AW&&yy>=0&&yy<AH)marks[yy*AW+xx]=1;}
      }
    }
    for(let y=0;y<AH;y++)for(let x=0;x<AW;x++){
      const wx=x/2-ORIGIN_X,wy=y/2-ORIGIN_Y,material=sample(wx,wy);
      const lane=marks[y*AW+x]&&material==='grass';
      const palette=material==='sand'?[95,84,58]:material==='mud'?[49,44,31]:material==='wet'?[34,57,59]:material==='rough'?[24,43,30]:lane?[74,81,53]:[42,61,40];
      const grain=(noise(x,y)-.5)*10+(lane?Math.sin(wy*.7)*2:Math.sin(wy*.33)*3);
      const index=(y*AW+x)*3;for(let c=0;c<3;c++)atlas[index+c]=palette[c]+grain;
    }
    floor=document.createElement('canvas');floor.width=W;floor.height=H;surface=floor.getContext('2d');pixels=surface.createImageData(W,H);
  }
  function drawGround(ctx,player,yaw,camera,width,height,neutral=false){
    if(!atlas)return;
    const sy=Math.sin(yaw),cy=Math.cos(yaw),horizon=camera.horizonY;
    for(let row=0;row<H;row++){
      const screenY=horizon+(row+.5)/H*(height-horizon),depth=camera.cameraHeightMeters*camera.focalPixels/(screenY-horizon)-camera.nearPlane;
      const ppm=camera.focalPixels/(depth+camera.nearPlane),fog=clamp((depth-40)/170,0,.78),shade=.88+Math.min(depth,80)/500;
      const lateral=(.5/W*width-width/2-(camera.projectionOffsetX||0))/(camera.worldUnitMeters*ppm),step=width/W/(camera.worldUnitMeters*ppm);
      let x=player.x+lateral*cy+depth*sy/.72,y=player.y+depth*cy-lateral*.72*sy;
      const dx=step*cy,dy=-step*.72*sy,multiplier=shade*(1-fog),fr=26*fog,fg=42*fog,fb=44*fog,data=pixels.data;
      for(let col=0;col<W;col++,x+=dx,y+=dy){
        const ix=Math.floor((x+ORIGIN_X)*2),iy=Math.floor((y+ORIGIN_Y)*2),source=(iy*AW+ix)*3,i=(row*W+col)*4,inside=ix>=0&&ix<AW&&iy>=0&&iy<AH;
        if(neutral){const line=Math.abs(x/10-Math.round(x/10))<.025||Math.abs(y/10-Math.round(y/10))<.025?9:0;data[i]=(45+line)*multiplier+fr;data[i+1]=(57+line)*multiplier+fg;data[i+2]=(52+line)*multiplier+fb;data[i+3]=255;continue;}
        data[i]=(inside?atlas[source]:20)*multiplier+fr;data[i+1]=(inside?atlas[source+1]:35)*multiplier+fg;data[i+2]=(inside?atlas[source+2]:27)*multiplier+fb;data[i+3]=255;
      }
    }
    surface.putImageData(pixels,0,0);ctx.drawImage(floor,0,horizon,width,height-horizon);
  }
  function clipNear(points,relative,near=.6){
    let input=points.map(p=>({...p,...relative(p)})),out=[];
    for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],ain=a.depth>=near,bin=b.depth>=near;if(ain)out.push(a);if(ain!==bin){const t=(near-a.depth)/(b.depth-a.depth);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,depth:near});}}
    return out;
  }
  function drawSolid(ctx,obstacle,project,relative,height=2.2,neutral=false,viewer=null){
    const rx=(obstacle.radiusX??obstacle.radius??10)/.72,ry=obstacle.radiusY??obstacle.radius??10;
    const count=12,ring=Array.from({length:count},(_,i)=>({x:obstacle.x+Math.cos(i/count*Math.PI*2)*rx,y:obstacle.y+Math.sin(i/count*Math.PI*2)*ry}));
    const faces=[];
    for(let i=0;i<count;i++){
      const a=ring[i],b=ring[(i+1)%count],points=[{...a,z:0},{...b,z:0},{...b,z:height},{...a,z:height}];
      if(viewer){const nx=b.y-a.y,ny=-(b.x-a.x)*.72;if(nx*(viewer.x-(a.x+b.x)/2)*.72+ny*(viewer.y-(a.y+b.y)/2)<=0)continue;}
      faces.push({points,depth:(relative(a).depth+relative(b).depth)/2,shade:.75+.22*Math.cos(i/count*Math.PI*2-.5),side:true});
    }
    if(height<1.65)faces.push({points:ring.map(p=>({...p,z:height})),depth:relative(obstacle).depth+.01,shade:1.12});
    faces.sort((a,b)=>b.depth-a.depth);
    for(const face of faces){const clipped=clipNear(face.points,relative);if(clipped.length<3)continue;const projected=clipped.map(p=>{const q=project(p.x,p.y);return {x:q.x,y:q.y-p.z*q.pixelsPerMeter};});if(projected.every(p=>p.x<0)||projected.every(p=>p.x>1280))continue;
      ctx.save();ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
      const stone=obstacle.asset?.includes('stone')||obstacle.id.includes('stone'),base=neutral?[83,98,91]:stone?[65,73,67]:[34,66,42];
      ctx.fillStyle=`rgb(${base.map(c=>Math.round(c*face.shade)).join(',')})`;ctx.fill();ctx.clip();
      if(face.side&&!neutral){
        const a=face.points[0],b=face.points[1],dx=(b.x-a.x)*.72,dy=b.y-a.y,length=Math.hypot(dx,dy);
        const uv=clipped.map(p=>({x:((p.x-a.x)*.72*dx+(p.y-a.y)*dy)/length*.12*96,y:(height-p.z)*96}));
        const pattern=ctx.createPattern(texture(stone),'repeat');ctx.globalAlpha=.82;
        for(let i=1;i<projected.length-1;i++)texturedTriangle(ctx,pattern,[projected[0],projected[i],projected[i+1]],[uv[0],uv[i],uv[i+1]]);
        ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
        ctx.globalAlpha=1-face.shade*.72;ctx.fillStyle='#06170e';ctx.fill();
      }
      ctx.restore();
    }
  }
  window.RCCourseRenderer=Object.freeze({buildAtlas,drawGround,drawSolid});
})();
