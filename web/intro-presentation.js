(() => {
 'use strict';
 // Cached painted poses; all motion uses the existing 30Hz game clock.
 const SW=1280,SH=720,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const timing=Object.freeze({cuts:[1.3,1.98,3.65,5],motorStop:5.4,grin:6.28,lineStart:6.45,lineEnd:8.15,handoff:8.9,menu:9.85});
 let clockTime=0;
 // Map the established visual poses to the new asymmetric score. The repeated
 // key holds the cutter against a stem before it breaks through.
 const score=[[0,0],[1.3,1.12],[1.98,2.18],[3.65,3.18],[3.78,3.31],[3.98,3.31],[4.16,3.42],[5,4.22],[5.4,4.6],[6.28,5.25],[6.45,5.39],[8.15,6.95],[8.9,7.2],[9.85,8.15]];
 function sceneTime(t){for(let i=1;i<score.length;i++){const a=score[i-1],b=score[i];if(t<=b[0])return a[1]+clamp((t-a[0])/(b[0]-a[0]))*(b[1]-a[1]);}return 8.15;}
 function retreat(){return reduced?0:ease((clockTime-2.65)/.22)*(1-ease((clockTime-3.25)/.2));}
 let W=SW,H=SH,portrait=false,cssWidth=SW,cssHeight=SH;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const load=src=>{const image=new Image();image.decoding='async';image.src=src;return image;};
 const joe=load('./assets/optimized/intro-joe-grin-cutout.webp');
 const anticipation=load('./assets/optimized/intro-joe-neutral-cutout.webp');
 const grass=load('./assets/optimized/rough-cut-grass-curtain.webp');
 const logo=load('./assets/menu/rough-cut-weathered.svg');
 const destination=load('./assets/menu/night-order-scene.webp');
 const shell=document.getElementById('game-shell');
 new ResizeObserver(()=>{cssWidth=shell.clientWidth||SW;cssHeight=shell.clientHeight||SH;}).observe(shell);
 const available=i=>i.complete&&i.naturalWidth>0;
 const surface=()=>{const c=document.createElement('canvas');c.width=SW;c.height=SH;return c;};
 let poses=null,shade=null,curtain=null,tornGrass=null,titleAtlas=null,landing=null,landingSource='',lightCatch=null,reduced=false,phase='ready',frames=0,poseIndex=-1,gatePrompt='CLICK / ENTER / SPACE TO BEGIN';
 function cover(ctx,image,x=0,y=0,w=SW,h=SH){const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,s=Math.max(w/iw,h/ih);ctx.drawImage(image,x+(w-iw*s)/2,y+(h-ih*s)/2,iw*s,ih*s);}
 function foreground(image){const c=surface(),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,0,SW,SH);return c;}
 function bake(){
  if(!titleAtlas&&available(logo)){titleAtlas=document.createElement('canvas');titleAtlas.width=416;titleAtlas.height=88;const g=titleAtlas.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(logo,0,0,416,88);}
  if(!poses&&available(joe)&&available(anticipation)){
   const neutral=foreground(anticipation),grin=foreground(joe),grip=surface();const p=grip.getContext('2d');p.drawImage(neutral,0,0);p.save();p.beginPath();p.rect(0,395*SH/941,SW,SH);p.rect(0,210*SH/941,700*SW/1672,190*SH/941);p.rect(970*SW/1672,210*SH/941,SW,190*SH/941);p.clip();p.clearRect(0,0,SW,SH);p.drawImage(grin,0,0);p.restore();poses=[neutral,grip,grin];
   // Bake cool side shadow into the poses; retain the warm face and lamps.
   for(const pose of poses){const g=pose.getContext('2d');g.save();g.globalCompositeOperation='source-atop';const grade=g.createLinearGradient(390,0,940,0);grade.addColorStop(0,'#07131c30');grade.addColorStop(.4,'#07131c00');grade.addColorStop(.65,'#07131c0a');grade.addColorStop(1,'#06162270');g.fillStyle=grade;g.fillRect(0,0,SW,SH);g.restore();}
   shade=surface();const d=shade.getContext('2d');d.drawImage(neutral,0,0);d.globalCompositeOperation='source-atop';d.fillStyle='#06130fbd';d.fillRect(0,0,SW,SH);
   lightCatch=surface();const c=lightCatch.getContext('2d');c.drawImage(grin,0,0);c.globalCompositeOperation='source-in';const glow=c.createRadialGradient(SW*.51,SH*.79,10,SW*.51,SH*.79,250);glow.addColorStop(0,'#e8cd9540');glow.addColorStop(1,'#e8cd9500');c.fillStyle=glow;c.fillRect(0,0,SW,SH);
  }
  if(!curtain&&available(grass)){curtain=surface();const g=curtain.getContext('2d');g.imageSmoothingEnabled=false;cover(g,grass);const shade=g.createRadialGradient(635,320,100,640,360,760);shade.addColorStop(0,'#02090610');shade.addColorStop(1,'#010604b0');g.fillStyle=shade;g.fillRect(0,0,SW,SH);}
  if(!tornGrass&&available(grass)){tornGrass=document.createElement('canvas');tornGrass.width=96;tornGrass.height=176;const g=tornGrass.getContext('2d');g.imageSmoothingEnabled=false;g.beginPath();g.moveTo(38,176);g.lineTo(13,123);g.lineTo(4,39);g.lineTo(26,91);g.lineTo(19,3);g.lineTo(46,73);g.lineTo(62,11);g.lineTo(61,99);g.lineTo(94,43);g.lineTo(81,126);g.lineTo(57,176);g.closePath();g.clip();g.drawImage(grass,620,220,180,330,0,0,96,176);g.fillStyle='#15291d35';g.fillRect(0,0,96,176);}
  if(available(destination)&&landingSource!==destination.src){landing=surface();const g=landing.getContext('2d');g.fillStyle='#07110f';g.fillRect(0,0,SW,SH);g.globalAlpha=.84;cover(g,destination);landingSource=destination.src;}
 }
 function prepare(){const src=window.RCChapterSelect?.selected().art||'./assets/menu/night-order-scene.webp';if(!destination.src.endsWith(src.replace('./',''))){landing=null;destination.src=src;}bake();}
 function configure(ctx){portrait=cssHeight>cssWidth;W=portrait?720:SW;H=portrait?Math.round(720*cssHeight/cssWidth):SH;ctx.scale(SW/W,SH/H);}
 function poseAt(t){
  const approach=reduced?1:ease((t-4.18)/.38),recoil=reduced?0:Math.sin(clamp((t-4.56)/.22)*Math.PI)*2;
  const area=portrait?{x:0,y:82,w:W,h:H-210}:{x:0,y:0,w:W,h:H};
  const base=Math.max(area.w/SW,area.h/SH),scale=base*(.98+approach*.06);
  return {scale,x:Math.round(W/2-SW*scale/2),y:Math.round(area.y+area.h-SH*scale+recoil*base),deckY:Math.round(area.y+area.h-SH*.16*scale),half:400*scale,area};
 }
 const seeds=Array.from({length:80},(_,i)=>({x:(i*.61803398875)%1,y:(i*.41421356237+.17)%1,d:i%9===0?1:i%3===0?.35:.7,i}));
 // Same seeds, gusts, depth bands and olive/brass colors as menu grass. Work in
 // CSS pixels so the menu can continue this clock without changing the breeze.
 function breeze(ctx,t,alpha=1){
  if(reduced)return;
  const count=Math.max(24,Math.min(80,Math.round(cssWidth*cssHeight/16000)));
  ctx.save();ctx.scale(W/cssWidth,H/cssHeight);
  for(let n=0;n<count;n++){
   const {x:sx,y:sy,d,i}=seeds[n],gust=Math.sin(t*.52-sy*5),speed=(13+i%7*2)*(.45+d*.75)*1.65;
   const x=(sx*(cssWidth+80)+t*speed+gust*22*d+Math.sin(t*.23)*10*d)%(cssWidth+80)-40;
   const margin=Math.min(70,cssHeight*.12),y=margin+sy*(cssHeight-margin*2)-Math.cos(t*.52-sy*5)*14*d+Math.sin(t*.38+i*.8)*(6+8*d)+Math.sin(t*.83+i)*2.5-Math.sin(t*.12+i)*16*d;
   const flutter=Math.sin(t*(.62+d*.2)+i*1.7),angle=(-26+gust*12+flutter*(12+14*d))*Math.PI/180;
   const len=(d>.9?12+i%3:d<.5?3+i%2:6+i%3)*(i%10===9?.55:1),h=d>.9?3.4:d<.5?1.7:2.4;
   ctx.globalAlpha=alpha*(d>.9?.86:d<.5?.43:.7)*clamp(Math.min((x+20)/60,(cssWidth+20-x)/60));ctx.fillStyle=i%4===2?'#c0bd78':'#9eaf70';
   const c=Math.cos(angle),s=Math.sin(angle);ctx.beginPath();ctx.moveTo(x-len*.5*c,y-len*.5*s);ctx.lineTo(x+h*.5*s,y-h*.5*c);ctx.lineTo(x+len*.5*c,y+len*.5*s);ctx.lineTo(x-len*.12*c-h*.4*s,y-len*.12*s+h*.4*c);ctx.closePath();ctx.fill();
  }ctx.restore();
 }

 const glints=[[420,349,8],[470,350,5],[790,350,6],[840,359,5],[559,436,4],[735,465,3],[420,597,7],[477,613,4],[630,594,6],[762,612,5],[861,631,4],[342,668,3],[960,671,3]];
 const lightPool=document.createElement('canvas');lightPool.width=256;lightPool.height=96;
 {const g=lightPool.getContext('2d');g.scale(1,.375);const a=g.createRadialGradient(128,128,8,128,128,128);a.addColorStop(0,'#d8c58a40');a.addColorStop(1,'#d8c58a00');g.fillStyle=a;g.fillRect(0,0,256,256);}
 function groundLight(ctx,p,t){ctx.save();ctx.globalAlpha=reduced?.45:ease((t-3.65)/.5)*.65;for(const x of [440,860])ctx.drawImage(lightPool,p.x+(x-128)*p.scale,p.deckY+14*p.scale,256*p.scale,96*p.scale);ctx.restore();}
 // Four irreversible cuts, separated by holds. A single ragged opening joins
 // the machine slit to the eye slit only on the final cut; Joe never fades in.
 const cuts=[1.12,2.18,3.18,4.22];
 const toolShade=document.createElement('canvas');toolShade.width=240;toolShade.height=60;
 {const g=toolShade.getContext('2d');g.fillStyle='#010603';g.fillRect(0,23,225,14);for(let i=0;i<14;i++){g.fillRect(30+i*14,15,6,30);}}
 function approachingShadow(ctx,p){
  if(reduced)return;for(const cut of [timing.cuts[1],timing.cuts[2]]){const age=clockTime-(cut-.4);if(age<0||age>.4)continue;const f=age/.4;ctx.save();ctx.globalAlpha=Math.sin(f*Math.PI)*.48;ctx.translate(p.x+(475+f*70)*p.scale,p.y+(155+f*20)*p.scale);ctx.rotate(-.22);ctx.drawImage(toolShade,0,0,260*p.scale,68*p.scale);ctx.restore();}
 }
 function tension(t){if(reduced)return 0;let value=0;for(const cut of cuts){const age=t-cut;if(age>-.23&&age<.24)value+=Math.sin((age+.23)/.47*Math.PI)*Math.sin(age*43);}return value;}
 const cutStep=(t,i)=>reduced?(t>=cuts[i]+.26?1:0):ease((t-cuts[i])/(i===3?.34:.24));
 function aperture(t){
  const a=cutStep(t,0),b=cutStep(t,1),c=cutStep(t,2),d=cutStep(t,3),points=[];
  for(let y=20,i=0;y<=740;y+=8,i++){
   const lower=a*160*ease((y-510)/105)*(1+.12*Math.sin(y*.05));
   const eye=b*48*Math.pow(Math.max(0,1-Math.abs((y-171)/24)),.4);
   const cheek=c*72*Math.pow(Math.max(0,1-Math.abs((y-200)/133)),.5);
   const breach=d*ease((y-28)/45)*Math.min(390,128+(y-65)*.42);
   const half=Math.max(lower,eye,cheek,breach),center=(y<340?623:640)+Math.sin(y*.028)*7;
   const teeth=half>0?((i*17%23)-11)*Math.min(1,half/24):0;
   points.push({y,left:center-Math.max(0,half+teeth),right:center+Math.max(0,half-teeth*.7)});
  }
  return points;
 }
 function grassWall(ctx,p,t){
  if(!curtain)return;
  // Avoid a degenerate zero-width clip leaking isolated pixels before contact.
  if(t<=cuts[0]){const tremor=tension(t);cover(ctx,curtain,-3+Math.round(tremor*2),-3+Math.round(tremor),W+6,H+6);return;}
  const points=aperture(t);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);
  // Clip each actual opening separately: closed centerline sections must not
  // leave antialiased pinholes that expose Joe before the upper cuts.
  const opening=run=>{if(!run.length)return;ctx.moveTo(p.x+run[0].left*p.scale,p.y+run[0].y*p.scale);for(const q of run)ctx.lineTo(p.x+q.left*p.scale,p.y+q.y*p.scale);for(let i=run.length-1;i>=0;i--){const q=run[i];ctx.lineTo(p.x+q.right*p.scale,p.y+q.y*p.scale);}ctx.closePath();};
  let run=[];for(const q of points){if(q.right-q.left>0)run.push(q);else if(run.length){opening(run);run=[];}}opening(run);
  // A short shudder anticipates contact. Overscan keeps all edges concealed.
  const tremor=tension(t);ctx.clip('evenodd');cover(ctx,curtain,-3+Math.round(tremor*2),-3+Math.round(tremor),W+6,H+6);approachingShadow(ctx,p);ctx.restore();
  ctx.save();ctx.beginPath();for(const side of ['left','right']){let active=false;for(const q of points){if(q.right-q.left<1){active=false;continue;}const x=p.x+q[side]*p.scale,y=p.y+q.y*p.scale;if(active)ctx.lineTo(x,y);else ctx.moveTo(x,y);active=true;}}ctx.strokeStyle='#02090699';ctx.lineWidth=4*p.scale;ctx.stroke();ctx.restore();

 }
 function cutDebris(ctx,p,t){
  if(reduced||clockTime>=5.85)return;
  for(let burst=0;burst<4;burst++){const age=t-cuts[burst];if(age<0||age>1.05)continue;
   const sourceY=[570,171,225,345][burst],sourceX=burst===1?623:640;
   for(let i=0;i<8;i++){const side=i%2?1:-1,x=sourceX+side*(18+i*5+age*(70+i*13)),y=sourceY-age*(60+i*9)+age*age*260;
    ctx.save();ctx.globalAlpha=Math.min(1,age/.05)*(1-ease((age-.55)/.5))*(1-ease((clockTime-5.5)/.35));ctx.translate(Math.round(p.x+x*p.scale),Math.round(p.y+y*p.scale));ctx.rotate(side*(i*.37+age*2));ctx.fillStyle=i%3?'#5c7040':'#a0a16c';ctx.fillRect(-2,0,(7+i%4*4)*p.scale,Math.max(1,2*p.scale));ctx.restore();}
  }
 }
 function fallingGrass(ctx,p,t){
  if(reduced||!tornGrass||clockTime>=5.85)return;
  // Six textured clumps retain their weight and tumble clear of the face.
  for(let i=0;i<6;i++){const born=i<2?3.24:4.25+(i-2)*.035,age=t-born;if(age<0||age>1.1)continue;const side=i%2?1:-1,baseX=i<2?623+side*80:640+side*(165+(i%3)*30),baseY=i<2?230:300+(i%3)*90;
   const x=baseX+side*(age*(105+i*8)),y=baseY-age*48+age*age*(270+i*17),size=i<2?.24:.38+(i%3)*.08;
   ctx.save();ctx.globalAlpha=(1-ease((age-.72)/.38))*(1-ease((clockTime-5.5)/.35));ctx.translate(Math.round(p.x+x*p.scale),Math.round(p.y+y*p.scale));ctx.rotate(side*(.16+age*(1.6+i*.12)));ctx.scale(size*p.scale, size*p.scale);ctx.drawImage(tornGrass,-48,-75);ctx.restore();
  }
 }
 function cutMist(ctx,p,t){
  if(reduced||clockTime>=5.85)return;const age=t-4.25;if(age<0||age>1.15)return;
  // A finite spray of dew catches the headlights, not a persistent overlay.
  ctx.save();for(let i=0;i<14;i++){const side=i%2?1:-1,x=640+side*(180+age*(100+i*9)),y=480-age*(75+i*4)+age*age*160;ctx.globalAlpha=(1-age/1.15)*.55*(1-ease((clockTime-5.5)/.35));ctx.fillStyle=i%3?'#b0b79a':'#ead9a6';ctx.fillRect(Math.round(p.x+x*p.scale),Math.round(p.y+y*p.scale),Math.max(1,p.scale),Math.max(1,p.scale*(i%4===0?3:1)));}ctx.restore();
 }
 function cuttingBar(ctx,p,t){
  if(reduced)return;
  // Only the working end emerges; the grip stays concealed behind the grass.
  // Two short hedge-cutter strokes make the upper breaches before the mower
  // shoulders the severed mass aside. The bar retracts before Joe's stare.
  for(const i of [1,2]){const age=t-cuts[i];if(age<0||age>.43)continue;const thrust=Math.sin(clamp(age/.43)*Math.PI);
   ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);ctx.translate(i===1?452+thrust*80:609,i===1?184:420-thrust*65);ctx.rotate(i===1?-.09:-1.46);
   ctx.fillStyle='#0b110e';ctx.fillRect(0,-9,162,18);ctx.fillStyle='#4d5b50';ctx.fillRect(0,-6,155,12);ctx.fillStyle='#b3bba3';ctx.fillRect(12,-5,141,2);ctx.fillStyle='#25392b';ctx.fillRect(0,-8,34,16);
   for(let tooth=0;tooth<11;tooth++){const x=35+tooth*11;ctx.fillStyle=tooth%2?'#8d9988':'#6a7969';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x,side*4);ctx.lineTo(x+4,side*13);ctx.lineTo(x+8,side*12);ctx.lineTo(x+9,side*4);ctx.closePath();ctx.fill();}ctx.fillStyle='#111e16';ctx.fillRect(x+3,-1,3,2);}ctx.restore();
  }
 }
 function paintScene(ctx,p,t){ctx.save();if(portrait){ctx.beginPath();ctx.rect(p.area.x,p.area.y,p.area.w,p.area.h);ctx.clip();}groundLight(ctx,p,t);body(ctx,p,t);cuttingBar(ctx,p,t);ctx.restore();grassWall(ctx,p,t);cutDebris(ctx,p,t);fallingGrass(ctx,p,t);cutMist(ctx,p,t);}
 function practicalLight(ctx,p,t){
  if(clockTime>=timing.lineEnd)t=6.95;
  const impact=reduced?0:Math.sin(clamp((t-4.22)/.5)*Math.PI);
  const catchLight=reduced?.3:ease((t-3.65)/.5)*(1-.3*ease((t-4.3)/.3))+impact*.38;
  ctx.save();ctx.globalAlpha=catchLight;ctx.drawImage(lightCatch,p.x,p.y,SW*p.scale,SH*p.scale);
  // Warm receiver strokes sit on painted steel and handle edges, not in the air.
  ctx.fillStyle='#e8d7a1';for(let i=0;i<glints.length;i++){const [x,y,n]=glints[i];ctx.globalAlpha=catchLight*(.22+.35*(reduced?1:Math.pow(Math.max(0,Math.sin(t*.8+i)),4)));ctx.fillRect(Math.round(p.x+x*p.scale),Math.round(p.y+y*p.scale),Math.max(2,Math.round(n*p.scale)),Math.max(1,Math.round(p.scale)));}ctx.restore();
 }
 function body(ctx,p,t){
  const withdraw=retreat();if(withdraw)p={...p,x:p.x+withdraw*42*p.scale,y:p.y+withdraw*9*p.scale};
  const reveal=reduced?1:.68+.32*ease((t-4.22)/.34),pose=reduced||t>=5.25?2:t>=4.5?1:0,blend=reduced?1:ease((t-(pose===2?5.25:4.5))/.14);poseIndex=t<2.18?-1:pose;
  ctx.save();if(reveal<1)ctx.drawImage(shade,p.x,p.y,SW*p.scale,SH*p.scale);
  if(reveal>0){ctx.globalAlpha=reveal;if(pose>0&&blend<1)ctx.drawImage(poses[pose-1],p.x,p.y,SW*p.scale,SH*p.scale);ctx.globalAlpha=reveal*(pose>0?blend:1);ctx.drawImage(poses[pose],p.x,p.y,SW*p.scale,SH*p.scale);}if(withdraw){ctx.globalAlpha=withdraw*.96;ctx.drawImage(shade,p.x,p.y,SW*p.scale,SH*p.scale);}ctx.globalAlpha=1;practicalLight(ctx,p,t);ctx.restore();
 }
 function titleBox(){const width=portrait?400:416;return {x:(W-width)/2,y:H-(portrait?260:150),width,scale:width/416};}
 function openingTitle(ctx,time){
  const b=titleBox(),impact=timing.cuts[0],elapsed=time-impact;
  if(elapsed>1.1||(reduced&&elapsed>=0))return;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(!titleAtlas){ctx.font='bold 40px Georgia';ctx.fillStyle='#e9dab1';ctx.textAlign='center';ctx.fillText('ROUGH CUT',W/2,b.y+45);}
  else if(elapsed<0){ctx.drawImage(titleAtlas,b.x,b.y,b.width,88*b.scale);}
  else {
   // Source pixels become 26 solid fragments. The middle breaks first; pieces
   // keep their opacity and fall outside the stage rather than dissolving.
   for(let row=0;row<2;row++)for(let col=0;col<13;col++){
    const delay=Math.abs(col-6)*.012+row*.018,age=Math.max(0,elapsed-delay),side=col<6?-1:1;
    const x=b.x+(col*32+16)*b.scale+(col-6)*age*35*b.scale;
    const y=b.y+(row*44+22)*b.scale+(-95+row*30)*age*b.scale+900*age*age;
    if(y-50>H)continue;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(side*age*(.6+(col%4)*.24));ctx.drawImage(titleAtlas,col*32,row*44,32,44,-16*b.scale,-22*b.scale,32*b.scale,44*b.scale);ctx.restore();
   }
  }ctx.restore();
 }
 function openingPrompt(ctx,time){
  if(time>.2)return;ctx.save();ctx.fillStyle='#e9dab1';ctx.font=(portrait?25:20)+'px "Segoe UI",sans-serif';ctx.textAlign='center';ctx.fillText(portrait?'TAP TO BEGIN':gatePrompt,W/2,H-40+(reduced?(time>0?90:0):ease(time/.2)*90));ctx.restore();
 }
 function caption(ctx,t,subtitles){
  t=5.25+(clockTime-timing.lineStart);
  if(!subtitles||t<5.25||t>6.95)return;const font=portrait?32:30,width=portrait?420:436,x=(W-width)/2,y=portrait?H-114:H-124;
  ctx.save();ctx.globalAlpha=Math.min(clamp((t-5.25)/.18),clamp((6.95-t)/.18));ctx.fillStyle='#0a1814ed';ctx.fillRect(x,y,width,font+32);ctx.fillStyle='#ad9565';ctx.fillRect(x,y,2,font+32);ctx.textAlign='center';ctx.fillStyle='#e9dab1';ctx.font='bold '+font+'px Georgia';ctx.fillText('HERE’S JOEY!',W/2,y+font+8);ctx.restore();
 }
 function draw(ctx,t,options={}){
  clockTime=t;t=sceneTime(t);
  bake();reduced=!!options.reducedMotion||motion.matches;frames++;
  // Loading must not flash the old, already-visible portrait underneath.
  if(!poses||!landing||!curtain){phase='concealed';poseIndex=-1;ctx.save();configure(ctx);ctx.fillStyle='#07110f';ctx.fillRect(0,0,W,H);if(curtain)cover(ctx,curtain,-3,-3,W+6,H+6);openingTitle(ctx,-1);openingPrompt(ctx,clockTime);ctx.restore();return true;}
  ctx.save();configure(ctx);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#07110f';ctx.fillRect(0,0,W,H);cover(ctx,landing,0,0,W,H);
  const p=poseAt(t),handoff=reduced?(t>=7.55?1:0):ease((t-7.2)/.95);
  phase=t<1.12?'concealed':t<2.18?'machine-glimpse':retreat()>.1?'retreat':t<3.18?'eye-glimpse':t<4.22?'partial-face':clockTime<timing.lineStart?'silent-stare':t<6.95?'joe':t<7.2?'final-stare':'handoff';
  if(handoff===0){paintScene(ctx,p,t);}
  else if(handoff<1){drawSceneLayer(p,t);ctx.globalAlpha=1-handoff;ctx.drawImage(stageLayer,0,0);ctx.globalAlpha=1;}
  openingTitle(ctx,clockTime);openingPrompt(ctx,clockTime);
  if(t>7.2)breeze(ctx,t,ease((t-7.2)/.95));caption(ctx,t,options.subtitles);
  ctx.restore();return true;
 }
 const stageLayer=document.createElement('canvas');
 function drawSceneLayer(p,t){
  if(stageLayer.width!==W||stageLayer.height!==H){stageLayer.width=W;stageLayer.height=H;}
  const c=stageLayer.getContext('2d');c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;paintScene(c,p,t);
 }
 function gate(ctx,prompt){bake();reduced=true;clockTime=-1;gatePrompt=prompt;phase='concealed';poseIndex=-1;ctx.save();configure(ctx);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#07110f';ctx.fillRect(0,0,W,H);if(curtain)cover(ctx,curtain,-3,-3,W+6,H+6);openingTitle(ctx,-1);openingPrompt(ctx,0);ctx.restore();return true;}
 function motor(t){const opening=timing.cuts.reduce((sum,c)=>sum+ease((t-c)/.28),0)/4,cutoff=340+opening*5860;if(t>=timing.motorStop)return {level:0,hz:39,cutoff};if(t>=3.78&&t<=3.98)return {level:.075,hz:49,cutoff:1450};const s=sceneTime(t);let surge=0;for(const cut of cuts){const age=s-cut;if(age>=-.12&&age<.4)surge=Math.max(surge,Math.sin(clamp((age+.12)/.52)*Math.PI));}return {level:.012+surge*.105,hz:43+surge*58,cutoff};}
 window.RCIntroPresentation={draw,gate,prepare,motor,timing,motorStop:timing.motorStop,stats:()=>({ready:!!poses&&!!curtain&&!!landing&&!!titleAtlas,phase,pose:poseIndex,retreat:retreat(),titlePhase:clockTime<timing.cuts[0]?'intact':clockTime<timing.cuts[0]+1.1?'breaking':'cleared',drawnGrass:false,titleFragmentLimit:26,reduced,portrait,frames,particleLimit:80,clippingLimit:32,clumpLimit:6,dewLimit:14,clock:'game-intro-30hz'})};
})();
