// Merge only exact rectangular unions of physically closed wall pieces.
// Equal cross-sections and touching/overlapping intervals cannot fill a door,
// recess or corner. The caller insets the result after merging, rather than
// treating the old artificial gaps between inset pieces as physical openings.
export function mergeDrainWallBoxes(boxes,{maxSpan=Infinity}={}){
 const merged=boxes.map(box=>box.clone()),axes=['x','y','z'];let changed=true;
 while(changed){
  changed=false;
  for(const axis of axes){
   const cross=axes.filter(a=>a!==axis);
   for(let i=0;i<merged.length;i++)for(let j=i+1;j<merged.length;j++){
    const a=merged[i],b=merged[j];
    if(!cross.every(k=>a.min[k]===b.min[k]&&a.max[k]===b.max[k]))continue;
    if(a.max[axis]<b.min[axis]||b.max[axis]<a.min[axis])continue;
    if(Math.max(a.max[axis],b.max[axis])-Math.min(a.min[axis],b.min[axis])>maxSpan)continue;
    a.union(b);merged.splice(j--,1);changed=true;
   }
  }
 }
 return merged;
}
