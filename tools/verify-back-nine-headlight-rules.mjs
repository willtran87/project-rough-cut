import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createChaseBeaconShadows} from '../web/chase-beacon-shadows.js';
import {createBackNineHeadlights,finishHeadlightGround} from '../web/back-nine-headlights.js';
import {createLocalLightCulling} from '../web/local-light-culling.js';
import {withoutPointLights} from '../web/zero-point-light-material.js';

const scene=new T.Scene(),cover=createChaseBeaconShadows(scene),material=new T.MeshLambertMaterial();
const walls=[];
for(const z of [-8,-70,-130]){const geometry=new T.BoxGeometry(4,3,.4);geometry.translate(0,1.5,z);cover.collect(geometry,material);const wall=new T.Mesh(geometry,material);scene.add(wall);walls.push(wall);}
const beacon=new T.PointLight(0xff2010,600,40);scene.add(beacon);cover.build(beacon);
const lamps=createBackNineHeadlights(scene,cover.coverGeometry()),cart={body:new T.Group()},joe={body:new T.Group()},runner={root:new T.Group()};runner.body=new T.Group();runner.root.add(runner.body);scene.add(cart.body,joe.body,runner.root);
runner.attachUpperBody=g=>runner.body.add(g);lamps.mountRunner(runner,{rubber:material,iron:material,lamp:material});
const run={time:1,cart:{x:0,y:0},joe:{x:0,y:-10}};joe.body.position.z=10;
const proxies=scene.children.filter(o=>o.name==='HeadlightCover'),ray=new T.Raycaster();ray.layers.enable(30);
let checks=0;
for(const y of [0,62,122]){run.cart.y=y;cart.body.position.z=-y;run.time++;lamps.update(run,cart,joe,runner);scene.updateMatrixWorld(true);
 for(const x of [-1.8,-.7,0,.7,1.8]){const target=new T.Vector3(x,1,-y-8),origin=lamps.player.position;ray.set(origin,target.clone().sub(origin).normalize());ray.far=27;
  assert.equal(ray.intersectObject(proxies[0]).length>0,ray.intersectObjects(walls).length>0);checks++;
 }
 const forwardCount=proxies[0].geometry.drawRange.count;assert(forwardCount>0);
 cart.body.rotation.y=Math.PI;lamps.update(run,cart,joe,runner);assert.equal(proxies[0].geometry.drawRange.count,0,'A rearward lamp must not submit the wall ahead');cart.body.rotation.y=0;
}
run.cart.y=0;cart.body.position.z=0;lamps.update(run,cart,joe,runner);let before=lamps.stats().shadows.map(s=>s.updates);
for(let i=0;i<60;i++){run.time+=1/60;lamps.update(run,cart,joe,runner);}assert.deepEqual(lamps.stats().shadows.map(s=>s.updates),before,'Idle time must not rebuild the shadow maps');
const door=new T.Mesh(new T.BoxGeometry(2,2,.2),material);door.position.set(0,1,-5);scene.add(door);lamps.addCaster(door);lamps.update(run,cart,joe,runner);before=lamps.stats().shadows.map(s=>s.updates);door.position.y+=3;lamps.update(run,cart,joe,runner);assert(lamps.stats().shadows.every((s,i)=>s.updates>before[i]));
run.foot={x:0,y:0};runner.root.rotation.y=-Math.PI/2;lamps.update(run,cart,joe,runner);assert(lamps.player.target.position.x>lamps.player.position.x+10);assert.equal(lamps.player.distance,19);
before=lamps.stats().shadows.map(s=>s.updates);run.time=0;lamps.update(run,cart,joe,runner);assert(lamps.stats().shadows.every((s,i)=>s.updates>before[i]),'Retry invalidates shadow caches');
delete run.foot;cart.body.rotation.set(.13,-.6,.08);cart.body.position.set(3,.7,-12);lamps.update(run,cart,joe,runner);const expected=new T.Vector3(0,.83,-1.49).applyMatrix4(cart.body.matrixWorld);assert(lamps.player.position.distanceTo(expected)<1e-9,'Lamp follows authored lens and body slope');
const pos=lamps.player.position.clone(),direction=lamps.player.target.position.clone().sub(pos).normalize();assert(direction.y!==0);

const geometry=new T.BoxGeometry(2,2,2);geometry.computeBoundingBox();const mesh=new T.Mesh(geometry,material);mesh.position.x=100;scene.add(mesh);
const culling=createLocalLightCulling({prepareFull:true,includeSpots:true});culling.register(mesh);culling.update([beacon,lamps.player,lamps.mower]);assert.notEqual(mesh.material,material);assert.equal(culling.preparation.children.length,2);
let shader={fragmentShader:'#include <lights_fragment_begin>'};mesh.material.onBeforeCompile(shader);assert(!shader.fragmentShader.includes('#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )'));assert(shader.fragmentShader.includes('getDirectionalLightInfo'));
const ground=new T.MeshLambertMaterial();ground.onBeforeCompile=s=>s.fragmentShader+='outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));';
for(const m of [ground,withoutPointLights(ground,{includeSpots:true})]){finishHeadlightGround(m);shader={fragmentShader:'#include <lights_fragment_begin>'};m.onBeforeCompile(shader);assert(shader.fragmentShader.includes('outgoingLight-backNineHeadlightDiffuse'));assert(shader.fragmentShader.includes('vec3 backNineHeadlightDiffuse=vec3(0.0);'));}
lamps.dispose();assert.equal(scene.children.filter(o=>o.name==='HeadlightCover').length,0);assert(!door.layers.isEnabled(30)&&!door.layers.isEnabled(31));assert.equal(scene.children.filter(o=>o.name==='BeaconCover').length,6,'Disposing lamps preserves beacon geometry');culling.dispose();cover.dispose();
console.log(JSON.stringify({passed:true,rayComparisons:checks,checks:['finite cone cover','turning','stationary cache','moving door','foot facing','retry','sloped lens attachment','lit/unlit preparation','ground contribution','disposal']}));
