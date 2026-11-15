// Service hardware shares the authored metal family with the pump, at the
// architectural density of 313.5 texels/metre. Reuse its maps and the existing
// Lambert materials: no added texture allocation, light or specular shader.
export function finishDrainHardware(materials,surfaces){
 const profiles=[
  ['iron','metal',0x8a938b],
  ['steel','metal',0xc6c8b7],
  ['brass','metal',0xc6a969],
  ['rust','rust',0xbca58d],
  ['red','red',0xd4c8b8],
 ];
 for(const [name,source,color]of profiles){
  const material=materials[name];
  material.map=surfaces.sets[source].map;
  material.color.setHex(color);
  // Static batches use world coordinates; moving handles get physical local
  // coordinates before their unit geometry is scaled by the scene builder.
  material.userData.drainWorldUV=true;
  material.userData.drainUVMetres=2;
  material.userData.drainHardwareSource=source;
  material.needsUpdate=true;
 }
 return {stats:()=>({materials:profiles.map(([name,source])=>({name,source,texelsPerMetre:surfaces.sets[source].map.image.width/2})),worldTileMetres:2,newTextures:0,newGeometry:0})};
}
