// Use the smallest lossless index type for the complete batch, including parts
// currently outside the view. A later camera turn must never overflow an index.
export function createIndexArray(vertexCount,length){
  // WebGL2 reserves index 65535 for fixed primitive restart.
  return vertexCount<=65535?new Uint16Array(length):new Uint32Array(length);
}

// Parts retain their packed offsets between views. Unchanged runs need neither
// copying nor uploading; removing only a tail changes the draw count alone.
export function compactVisibleIndices(geometry,parts,source){
  let count=0,first=Infinity,last=0;
  for(const part of parts){
    if(!part.visible){part.drawOffset=-1;continue;}
    if(part.drawOffset!==count){
      geometry.index.array.set(source.subarray(part.offset,part.offset+part.count),count);
      first=Math.min(first,count);last=count+part.count;part.drawOffset=count;
    }
    count+=part.count;
  }
  geometry.setDrawRange(0,count);
  if(last>first){
    // Retain any ranges not consumed by WebGL yet (for example a batch that
    // became hidden before its upload). Three merges and clears them on upload.
    geometry.index.addUpdateRange(first,last-first);
    geometry.index.needsUpdate=true;
    return last-first;
  }
  return 0;
}
