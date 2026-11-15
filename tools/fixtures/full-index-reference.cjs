// Test-only reference renderer. A buffer overwrite invalidates compacted-run
// offsets even when the camera and original visibility decisions are unchanged.
function restoreFullIndexReference(mesh){
 const g=mesh.geometry,source=mesh.userData.fullIndices;
 mesh.visible=true;
 g.index.array.set(source);
 // A pending partial range must not restrict the reference upload to a prefix.
 g.index.clearUpdateRanges();g.index.addUpdateRange(0,source.length);
 g.index.needsUpdate=true;g.setDrawRange(0,source.length);
 for(const part of mesh.userData.visibilityParts){part.drawOffset=-1;part.visible=true;}
 // The next ordinary update must compact again and recompute material reach.
 mesh.userData.compacted=false;
}
module.exports={restoreFullIndexReference};
