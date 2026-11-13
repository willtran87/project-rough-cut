import * as THREE from './vendor/three/three.module.js';

const hash=n=>{const v=Math.sin(n*127.1+23.9)*43758.5453;return v-Math.floor(v);};
function canvas(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;return c;}
function texture(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;return t;}
function paper(c){
 const g=c.getContext('2d');g.fillStyle='#a79d7c';g.fillRect(0,0,c.width,c.height);
 for(let y=0;y<c.height;y+=3)for(let x=0;x<c.width;x+=4){const n=hash(x*.7+y*13);if(n<.42){g.fillStyle=n<.12?'#958c70':'#b5ab8b';g.fillRect(x,y,2+n*3,1+n*2);}}
 for(let i=0;i<18;i++){const x=hash(i+41)*c.width,w=9+hash(i)*65,y=c.height*(.84+hash(i+51)*.13);g.fillStyle=`rgba(67,62,42,${.03+hash(i+8)*.07})`;g.fillRect(x,y,w,c.height-y);}
 return g;
}
function poly(g,points,fill){g.fillStyle=fill;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function stroke(g,points,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}

export function createKeeperArt(){
 const wood=canvas(512,512),w=wood.getContext('2d');w.fillStyle='#554631';w.fillRect(0,0,512,512);
 for(let i=0;i<260;i++){const x=hash(i)*512,y=hash(i+81)*512,length=20+hash(i+37)*170;w.strokeStyle=i%3?'#61503a':'#403a2c';w.lineWidth=i%5===0?2:1;w.beginPath();w.moveTo(x,y);w.bezierCurveTo(x+8,y+length*.35,x-4,y+length*.6,x+3,y+length);w.stroke();}
 for(const x of [126,255,386]){w.fillStyle='#292a20';w.fillRect(x,0,3,512);w.fillStyle='#796248';w.fillRect(x+3,0,1,512);}
 for(let i=0;i<35;i++){const x=hash(i+311)*512,y=hash(i+401)*512;stroke(w,[[x,y],[x+2,y+8+hash(i)*24]],'#9b8057',1);}
 for(const [cx,cy]of [[47,108],[181,379],[315,242],[452,91]]){
  for(let ring=0;ring<6;ring++){w.strokeStyle=ring%2?'#786044':'#3e3629';w.lineWidth=1;w.beginPath();w.ellipse(cx,cy,2+ring*1.6,4+ring*3.8,.08,0,Math.PI*2);w.stroke();}
  stroke(w,[[cx,cy-42],[cx-1,cy-15],[cx+2,cy+10],[cx,cy+49]],'#302f24',1);
 }
 for(let i=0;i<44;i++){
  const x=Math.floor(hash(i+301)*512),y=Math.floor(hash(i+509)*512),wide=10+Math.floor(hash(i+71)*39),tall=5+Math.floor(hash(i+22)*38);
  w.fillStyle='rgba(28,30,23,.12)';for(let row=0;row<tall;row+=3)w.fillRect(x+Math.sin(row*.2+i)*3,y+row,wide*(.6+.4*Math.sin(row/tall*Math.PI)),3);
 }
 for(const x of [126,255,386])for(let i=0;i<16;i++){w.fillStyle=i%3?'#89704f':'#342f24';w.fillRect(x-1,hash(i+x)*512,2+hash(i+8)*4,3+hash(i+61)*11);}
 const woodTexture=texture(wood);woodTexture.wrapS=woodTexture.wrapT=THREE.RepeatWrapping;

 const plan=canvas(1024,512),g=paper(plan);
 g.strokeStyle='#5b604b';g.lineWidth=2;g.strokeRect(21,20,982,472);g.strokeRect(26,25,972,462);
 g.fillStyle='#343d31';g.font='bold 28px monospace';g.fillText('18 / CHAMPIONSHIP GREEN',46,66);g.font='15px monospace';g.fillText('KEEPER\u2019S SURVEY     DRAINAGE / SECTION C',47,91);
 const fairway=[[90,390],[166,337],[243,352],[365,276],[444,257],[537,164],[630,126],[729,145],[797,203],[755,271],[650,273],[550,347],[466,361],[300,433],[154,448]];
 poly(g,fairway,'#6c795b');
 for(let n=0;n<5;n++)stroke(g,fairway.map(([x,y])=>[450+(x-450)*(1+n*.045),285+(y-285)*(1+n*.045)]),'#878c6b',1);
 poly(g,[[583,194],[610,166],[664,151],[719,166],[746,195],[726,230],[676,250],[626,239]],'#899268');
 for(let i=0;i<6;i++)stroke(g,[[588+i*18,221],[613+i*18,176]],'#79845d',2);
 poly(g,[[547,199],[560,176],[582,170],[589,184],[575,204]],'#c5b68b');poly(g,[[738,238],[766,221],[777,234],[759,256],[741,254]],'#c5b68b');
 stroke(g,[[592,292],[629,321],[693,329],[782,290],[828,296]],'#506c68',7);
 stroke(g,[[595,293],[631,318],[693,326],[781,287],[828,293]],'#809187',2);
 g.setLineDash([8,8]);stroke(g,[[122,412],[421,311],[667,204]],'#424a3a',3);g.setLineDash([]);
 for(let i=0;i<7;i++){const x=596+i*31;stroke(g,[[x,279],[x+12,318]],'#8b583c',2);}
 g.strokeStyle='#884c37';g.lineWidth=3;g.beginPath();g.ellipse(674,207,99,67,-.15,0,Math.PI*2);g.stroke();
 g.fillStyle='#864936';g.fillRect(677,173,3,45);poly(g,[[680,172],[704,178],[680,186]],'#864936');
 g.fillStyle='#3e4939';g.font='bold 17px monospace';g.fillText('OUTFALL 18',793,346);g.font='14px monospace';g.fillText('ROOT MAT',763,388);g.fillText('SAND LENS',763,411);g.fillText('CLAY / DRAIN',763,434);
 for(let i=0;i<3;i++){g.fillStyle=['#78845c','#b8a479','#746648'][i];g.fillRect(724,376+i*23,25,10);}
 g.font='15px monospace';g.fillStyle='#544d39';g.fillText('KEEP RECORDS ABOVE FLOOD LINE',48,470);
 // A real fold and localized damaged lower edge keep the plan legible.
 g.fillStyle='rgba(62,51,36,.13)';g.fillRect(508,26,4,458);g.fillStyle='rgba(226,218,175,.2)';g.fillRect(512,26,2,458);
 for(let i=0;i<16;i++){g.fillStyle='#746c52';g.fillRect(29+i*61,480-hash(i)*6,8+hash(i+1)*12,2);}

 const log=canvas(768,512),l=paper(log);l.fillStyle='#30392e';l.font='bold 28px monospace';l.fillText('PUMP / NIGHT RECORD',40,53);l.font='17px monospace';l.fillText('18     RETURN     PRESSURE     KEEPER',40,85);
 for(let i=0;i<9;i++){
  const y=116+i*37;stroke(l,[[35,y],[732,y]],'#7d8168',1);l.fillStyle='#555b45';l.font='16px monospace';l.fillText(['21:10','21:45','22:20','23:05','23:40','00:15','00:50','01:25','02:00'][i],43,y+24);
  l.fillText(i<5?'OPEN':'CLOSED',188,y+24);l.fillText(i<4?'NORMAL':i<7?'RISING':'HIGH',365,y+24);
  stroke(l,[[572,y+22],[585,y+16],[591,y+24],[609,y+13],[631,y+20]],'#4f5541',2);
 }
 l.strokeStyle='#8d4938';l.lineWidth=3;l.strokeRect(350,372,135,57);stroke(l,[[511,421],[536,400],[529,438]],'#8d4938',2);

 const rack=canvas(512,768),r=rack.getContext('2d');r.fillStyle='#3a4437';r.fillRect(0,0,512,768);
 for(let i=0;i<170;i++){r.fillStyle=i%3?'#434a3a':'#303a30';r.fillRect(hash(i)*512,hash(i+9)*768,3+hash(i+42)*17,1+hash(i+71)*4);}
 // The pale protected patch is the empty scythe's dust outline. No glow.
 stroke(r,[[222,684],[214,540],[229,350],[241,126]],'#646650',20);
 poly(r,[[241,126],[270,104],[315,91],[360,102],[397,125],[432,158],[449,185],[429,172],[397,147],[359,126],[315,116],[277,121]],'#646650');
 stroke(r,[[218,510],[263,495]],'#646650',12);stroke(r,[[227,353],[191,338]],'#646650',12);
 r.fillStyle='#a19a79';r.font='bold 20px monospace';r.fillText('SCYTHE / 18',148,735);
 const sole=canvas(128,256),s=sole.getContext('2d');
 for(let y=8;y<247;y++)for(let x=13;x<115;x++){
  const py=y/256,px=(x-64)/64,width=py<.25?.64*Math.sqrt(Math.max(0,1-((py-.25)/.24)**2)):py<.65?.64:.48,edge=Math.abs(px)/Math.max(width,.01);
  if(edge>1||py>.67&&py<.72)continue;
  const wear=hash(Math.floor(x/4)+Math.floor(y/5)*71),tread=Math.floor((y+x*.2)/15)%3===0;
  if(wear>.2){s.fillStyle=`rgba(169,151,112,${(1-edge*.7)*(tread?.15:.65)*wear})`;s.fillRect(x,y,1,1);}
 }
 const maps={wood:woodTexture,plan:texture(plan),log:texture(log),rack:texture(rack),sole:texture(sole)};
 return {maps,sizes:{wood:[512,512],plan:[1024,512],log:[768,512],rack:[512,768],sole:[128,256]},dispose(){Object.values(maps).forEach(t=>t.dispose());}};
}
