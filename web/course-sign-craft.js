// Construction stays inside the existing sign silhouette. All parts join the
// existing body batch; the lettering atlas and gameplay anchors remain fixed.
export function buildCourseSignCraft(box,{x,y,z,size=1,mastX=null,mastHeight=0,frontOnly=false}){
 const paint=0x697360,wood=0x79715a,iron=0x56605a,steel=0x9b9a7b;
 for(const side of [-1,1]){
  // Rolled top/bottom edges and rear battens give the panel a real thickness.
  box(x,y+side*.417*size,z+.065,1.68*size,.025,.032,paint);
  if(frontOnly)box(x,y+side*.25*size,z-.085,1.58*size,.062,.068,wood);
  for(const xx of [-.765,.765]){
   box(x+xx*size,y+side*.35*size,z+.066,.032,.032,.018,steel);
   box(x+xx*size,y+side*.35*size,z+.076,.019,.005,.003,iron);
  }
 }
 // Rear-board joints and exposed end grain read when passing the sign.
 if(frontOnly)for(const offset of [-.14,.14])box(x,y+offset*size,z-.052,1.64*size,.012,.006,0x343d32);
 for(let i=0;frontOnly&&i<7;i++){
  const xx=x+(-.67+i*.213)*size,yy=y+((i%3)-1)*.26*size;
  box(xx,yy,z-.054,(.12+i%3*.045)*size,.007,.006,i%2?wood:0x444e3e);
 }
 if(mastX!==null){
  // Two-sided boards use an under-edge saddle; battens across their back
  // would cover the reverse lettering. Front-only junctions get a full mast.
  if(frontOnly){const top=y+.25*size+.05;
   box(mastX,(mastHeight+top)/2,z-.14,.075,top-mastHeight,.075,0x596052);
  }else box(mastX,y-.415*size,z-.08,.12,.045,.22,iron);
  for(const side of frontOnly?[-1,1]:[]){
   box(mastX,y+side*.25*size,z-.14,.13,.085,.10,iron);
   for(const offset of [-.047,.047])box(mastX+offset,y+side*.25*size,z-.194,.016,.016,.012,steel);
  }
  box(mastX,.095,z-.14,.09,.19,.09,iron);
  // Long connected marks follow the post grain, stopping below the panel.
  for(let i=0;i<3;i++)box(mastX+(i-1)*.019,mastHeight*(.28+i*.20),z-.101,.006,mastHeight*.23,.004,i%2?0x7b8066:0x363f33);
 }
}

export function paintCourseSignPatina(g,columns=5,cells=33){
 // Chips stay on the perimeter, outside every glyph and directional arrow.
 // The same wear accompanies all state cells, so completion does not repair it.
 for(let cell=0;cell<cells;cell++){
  const x=cell%columns*192,y=Math.floor(cell/columns)*96;
  for(let i=0;i<8;i++){
   const px=15+i*22,py=i%2?89:5;
   g.fillStyle=i%3?'#59604a':'#8c8363';g.fillRect(x+px,y+py,5+i%4,1);
   g.fillStyle='#26372b';g.fillRect(x+px+2,y+py+1,3,1);
  }
  for(const px of [10,181])for(const py of [11,84]){
   g.fillStyle='#101e1a';g.fillRect(x+px-1,y+py,3,5);
   g.fillStyle='#746e50';g.fillRect(x+px,y+py,2,2);
  }
 }
}
