// Four authored paper faces in one atlas. Coordinates stay on the pixel grid;
// folds, ink and water damage are separate marks rather than uniform noise.
export function paintKeeperRecords(canvas){
 canvas.width=canvas.height=1024;
 const g=canvas.getContext('2d'),hash=n=>{const v=Math.sin(n*73.19+8.4)*14371.7;return v-Math.floor(v);};
 function line(points,color,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();}
 function text(value,x,y,size=16,color='#414834'){g.fillStyle=color;g.font=`${size>=22?'bold ':''}${size}px monospace`;g.fillText(value,x,y);}
 function sheet(index,draw){
  g.save();g.translate(index%2*512,Math.floor(index/2)*512);
  g.fillStyle='#b8ab84';g.fillRect(0,0,512,512);
  for(let i=0;i<1250;i++){const x=Math.floor(hash(i+index*31)*512),y=Math.floor(hash(i+911)*512);g.fillStyle=i%4?'#b2a580':'#c0b38d';g.fillRect(x,y,i%5+1,1);}
  // Ragged edge staining follows two old wet corners, leaving the entries clear.
  for(let x=0;x<512;x+=2){const h=Math.round(10+10*hash(Math.floor(x/11)+index*113)+18*Math.pow(x/512,3));g.fillStyle='#8c8062';g.fillRect(x,512-h,2,h);g.fillStyle='#9e916e';g.fillRect(x,510-h,2,4);}
  for(let y=0;y<512;y+=3){g.fillStyle='#9b8f6d';g.fillRect(0,y,3+Math.floor(hash(y+index)*5),3);g.fillRect(508,y,4,3);}
  draw();
  // Broken folds include a narrow light lip and a dark pressed crease.
  for(let y=18;y<490;y+=4){if(hash(y+index*27)<.14)continue;g.fillStyle='#a19472';g.fillRect(251,y,2,4);g.fillStyle='#c5b991';g.fillRect(253,y,1,4);}
  g.clearRect(0,0,2,2);g.clearRect(508,509,4,3);
  for(const [x,y,w,h]of [[17,508,7,4],[438,0,4,3],[0,371,4,9]])g.clearRect(x,y,w,h);
  g.restore();
 }
 sheet(0,()=>{
  text('NIGHT / 18',28,43,28);text('DRAIN RETURN REGISTER',29,69,15);
  line([[26,82],[482,82]],'#62694f',2);text('TIME',32,109);text('RETURN',169,109);text('VALVE',350,109);
  const times=['21:10','21:45','22:20','23:05','23:40','00:15','00:50','01:25'];
  for(let i=0;i<9;i++){const y=126+i*35;line([[27,y],[483,y]],'#8c8c6b');if(i<8){text(times[i],33,y+24,17);text(i<5?'OPEN':'CLOSED',169,y+24,17);text(i<5?'B / 2':'B / 0',350,y+24,17);}}
  text('RETURN CHECK / KEEP DRY',31,478,13,'#6f654d');
 });
 sheet(1,()=>{
  text('PRESSURE',29,43,28);text('PUMP HOUSE / SECTION C',30,69,15);
  line([[26,82],[482,82]],'#62694f',2);text('HEAD',32,109);text('STATE',151,109);text('SIGNED',352,109);
  for(let i=0;i<9;i++){
   const y=126+i*35;line([[27,y],[483,y]],'#8c8c6b');if(i>7)continue;
   text(['1.2','1.2','1.3','1.4','1.9','2.3','2.8','3.1'][i],33,y+24,17);
   text(i<4?'NORMAL':i<7?'RISING':'HIGH',151,y+24,17);
   if(i<7)line([[355,y+22],[365,y+12],[362,y+26],[381,y+15],[386,y+23],[404,y+17]],'#4b513d',2);
  }
  line([[143,368],[265,366],[274,397],[144,400],[139,375]],'#824f3c',3);
  // The final signature ends in a short stroke next to the abandoned pencil.
  line([[355,393],[367,385],[371,395]],'#4b513d',2);text('CHECK BYPASS SEAL',31,478,13,'#79523d');
 });
 sheet(2,()=>{
  text('RETURN SEAL',30,47,28);text('PUMP / BYPASS B',31,74,17);line([[29,90],[483,90]],'#72765a',2);
  g.strokeStyle='#565d48';g.lineWidth=3;
  for(const radius of [106,72]){g.beginPath();g.arc(243,237,radius,0,Math.PI*2);g.stroke();}
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;g.beginPath();g.arc(243+Math.cos(a)*89,237+Math.sin(a)*89,8,0,Math.PI*2);g.stroke();}
  line([[243,113],[243,353]],'#828468');line([[123,237],[364,237]],'#828468');
  line([[315,310],[397,355],[472,355]],'#7c4b38',3);text('SPLIT',391,379,17,'#7c4b38');
  text('REPLACE BEFORE NIGHT RUN',29,431,18);text('OLD SEAL / DO NOT REFIT',29,464,15,'#7c4b38');
 });
 sheet(3,()=>{
  text('18 / KEEPER',35,58,30);line([[31,82],[481,82]],'#686d51',2);
  text('RETURN RECORDS',35,122,22);text('SURVEY + NIGHT LOG',35,153,17);
  line([[33,181],[477,181]],'#8d8c69');text('SECTION C',35,223,24);
  text('KEEP ABOVE',35,293,22);text('FLOOD LINE',35,325,22);
  g.strokeStyle='#855943';g.lineWidth=4;g.strokeRect(32,260,280,86);
  text('CHECKED',35,402,17);line([[176,399],[194,416],[232,379]],'#525c40',4);
  text('COURSE MAINTENANCE',35,469,15);
 });
 return canvas;
}
