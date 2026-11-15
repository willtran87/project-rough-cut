import * as THREE from './vendor/three/three.module.js';

const dim=new THREE.Color(0x7e999f),bright=new THREE.Color(0xc4ddf2),unpowered=new THREE.Color(0x26332d);
export function floodlightTint(power,target){return target.copy(dim).lerp(bright,THREE.MathUtils.clamp(Number.isFinite(power)?power:0,0,1));}

// One power sample drives the emitting lens, ground pool and atmospheric shaft.
// The finite local light follows that same power so nearby actors/scenery agree.
export function updateFloodlight(light,power){
  const p=THREE.MathUtils.clamp(Number.isFinite(power)?power:0,0,1);
  light.power=p;
  if(light.source)light.source.intensity=18*p;
  light.tint??=new THREE.Color();floodlightTint(p,light.tint);
  if(light.source)light.source.color.copy(light.tint);
  const lens=light.fixture.material;
  if(lens.emissive){lens.color.copy(unpowered);lens.emissive.copy(light.tint);lens.emissiveIntensity=1.6*p;}
  else lens.color.copy(unpowered).lerp(light.tint,p);
  // A real local source already lights the terrain. Its old unlit floor disc
  // flattened albedo and painted over contact shade; retain it only for the
  // illustrated fallback, which has no physical point light.
  light.pool.material.color.copy(light.tint);light.pool.material.opacity=(light.source?0:.14)*p;
  light.pool.visible=!light.source&&p>0;
}
