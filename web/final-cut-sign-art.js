import * as THREE from './vendor/three/three.module.js';

// Painted estate enamel and paper use a discrete source grid. Text is fitted
// at that grid before integer enlargement, never squeezed with fillText's
// maxWidth argument. Keep distress at the rim, away from directions and clues.
export function paintFinalCutSign(ctx,text,{width,height,color='#ded3a9',bg='#172c27',kind='direction'}={}){
 const scale=width<1?8:width<3?4:width<8?2:1,w=ctx.canvas.width/scale,h=ctx.canvas.height/scale;
 const source=document.createElement('canvas');source.width=w;source.height=Math.ceil(h);const c=source.getContext('2d');
 const paper=kind==='paper',board=kind==='board',warning=kind==='warning',identity=kind==='identity';
 const ink=paper?'#29362e':color,face=paper?'#d3c69f':bg,rim=Math.max(1,Math.round(Math.min(w,h)*.045));
 c.fillStyle=paper?'#695c3e':'#091512';c.fillRect(0,0,w,h);
 c.fillStyle=face;c.fillRect(rim,rim,w-rim*2,h-rim*2);
 c.fillStyle=paper?'#e0d4b1':'#34473a';c.fillRect(rim,rim,w-rim*2,1);
 c.fillStyle=paper?'#a99a74':'#10221c';c.fillRect(rim,h-rim-2,w-rim*2,2);
 // Short edge chips, incomplete pinstripes and water runs are deliberately
 // placed clusters rather than full-surface noise or worn-through lettering.
 c.fillStyle=paper?'#b6a881':'#4a5942';
 for(const [u,v,n]of [[.035,.16,3],[.17,.06,5],[.31,.94,4],[.67,.05,3],[.84,.95,5],[.965,.61,2]]){
  const x=Math.floor(u*w),y=Math.floor(v*h);c.fillRect(x,y,n,1);c.fillRect(x+1,y+1,Math.max(1,n-2),1);
 }
 if(!paper&&!board){c.fillStyle='#687052';c.fillRect(rim+2,rim+2,w-rim*2-4,1);c.fillRect(rim+2,h-rim-3,w-rim*2-4,1);}
 let left=paper?rim+8:rim+5,right=w-left;
 if(warning){const stripe=Math.max(3,Math.round(h*.08));c.fillStyle='#a48b4e';c.fillRect(rim+2,rim+2,stripe,h-rim*2-4);left+=stripe+3;}
 const lines=String(text).split('\n'),top=rim+(paper?5:3),bottom=h-rim-(paper?5:3),available=bottom-top;
 const weights=lines.map((_,i)=>i===0&&lines.length>1?1.17:1),unit=available/weights.reduce((a,b)=>a+b,0),layout=[];
 let cursor=top;
 c.textAlign='center';c.textBaseline='middle';
 for(let i=0;i<lines.length;i++){
  const line=lines[i],slot=unit*weights[i],family=identity||board?'Georgia, serif':'monospace';
  let size=Math.max(6,Math.floor(Math.min(slot*.72,w/(board?13:identity?14:10))));
  const font=()=>c.font=`${identity||board?'bold':'600'} ${size}px ${family}`;font();
  while(size>5&&c.measureText(line).width>right-left){size--;font();}
  const x=Math.round((left+right)/2),y=Math.round(cursor+slot/2),metrics=c.measureText(line);
  c.fillStyle=ink;c.fillText(line,x,y);
  layout.push({text:line,font:size,grid:[w,source.height],bounds:[x-metrics.width/2,y-size/2,x+metrics.width/2,y+size/2],available:[left,top,right,bottom]});cursor+=slot;
 }
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.drawImage(source,0,0,ctx.canvas.width,ctx.canvas.height);
 return {kind,scale,lines:layout,width,height};
}

// A restrained visibility floor keeps painted directions useful during the
// blacked-out opening. Actual world lights and shadows still shape the face.
export function finalCutSignMaterial(texture){
 return new THREE.MeshLambertMaterial({map:texture,emissiveMap:texture,emissive:new THREE.Color().setRGB(.035,.041,.032)});
}
