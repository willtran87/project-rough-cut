import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createLocalLightCulling,stableLightMaterialSort} from '../web/local-light-culling.js';

const c=createLocalLightCulling(),geometry=new T.BoxGeometry(2,2,2),full=new T.MeshLambertMaterial();
geometry.computeBoundingBox();
let chained=0,disposed=0;
full.onBeforeCompile=s=>{chained++;s.fragmentShader+='\n// original texture grade';};
full.customProgramCacheKey=()=> 'original';
const mesh=new T.Mesh(geometry,full);mesh.position.x=10;c.register(mesh);
const lite=c.preparation.children[0].material;
lite.addEventListener('dispose',()=>disposed++);
assert.equal(c.preparation.children[0].geometry,geometry);
const shader={fragmentShader:'#include <lights_fragment_begin>'};lite.onBeforeCompile(shader);
assert.equal(chained,1);assert(shader.fragmentShader.includes('// original texture grade'));
assert(shader.fragmentShader.includes('#if 0'));assert(shader.fragmentShader.includes('getDirectionalLightInfo'));
assert.notEqual(lite.customProgramCacheKey(),full.customProgramCacheKey());
const draw=(material,overrides={})=>({material,groupOrder:0,renderOrder:0,materialVariant:0,z:1,id:1,...overrides});
const later=new T.MeshLambertMaterial();
assert.equal(stableLightMaterialSort(draw(full),draw(later)),stableLightMaterialSort(draw(lite),draw(later)),'shader specialization must preserve material order');
assert.equal(stableLightMaterialSort(draw(full),draw(lite)),0,'full and specialized materials share the same sort identity');
for(const priority of ['groupOrder','renderOrder','materialVariant','z','id'])assert(stableLightMaterialSort(draw(full,{[priority]:0}),draw(lite,{[priority]:1}))<0,priority+' tie-breaker is retained');
later.dispose();

const lamp=new T.PointLight(0xffffff,4,4);
c.update([lamp]);assert.equal(mesh.material,lite,'outside reach');
const updates=c.stats().updates;lamp.intensity=2;c.update([lamp]);assert.equal(c.stats().updates,updates,'changing nonzero power needs no bounds work');
lamp.position.x=5;c.update([lamp]);assert.equal(mesh.material,full,'touching boundary retains light');
lamp.position.x=4.995;c.update([lamp]);assert.equal(mesh.material,full,'boundary safety margin');
lamp.position.x=4.9;c.update([lamp]);assert.equal(mesh.material,lite);
lamp.position.x=10;c.update([lamp]);assert.equal(mesh.material,full);
lamp.intensity=0;c.update([lamp]);assert.equal(mesh.material,lite);
lamp.intensity=1;c.update([lamp]);assert.equal(mesh.material,full);
lamp.visible=false;c.update([lamp]);assert.equal(mesh.material,lite);
lamp.visible=true;lamp.position.x=100;lamp.distance=0;c.update([lamp]);assert.equal(mesh.material,full,'unlimited reach');
lamp.distance=Infinity;c.update([lamp]);assert.equal(mesh.material,full,'nonfinite reach fails open');
lamp.distance=4;
const second=new T.PointLight(0xffffff,1,4),parent=new T.Group();parent.position.x=10;parent.add(second);
c.update([lamp,second]);assert.equal(mesh.material,full,'second light and transformed parent');
parent.position.x=30;c.update([lamp,second]);assert.equal(mesh.material,lite);
c.update([]);assert.equal(mesh.material,lite);
const mesh2=new T.Mesh(geometry,full);c.register(mesh2);c.update([lamp]);
assert.equal(c.preparation.children.length,1,'shared material has one prepared variant');
c.dispose();assert.equal(mesh.material,full);assert.equal(mesh2.material,full);assert.equal(disposed,1);assert.equal(c.preparation.children.length,0);
console.log('PASS: local-light range boundaries, multiple/moving lights, cached selection, shader preservation, preparation and disposal');

// A merged fence can span a light while none of its visible pieces touch it.
const split=createLocalLightCulling(),wide=new T.BoxGeometry(24,2,2);wide.computeBoundingBox();
const fence=new T.Mesh(wide,full),pieces=[-10,10,0].map(x=>({visible:x!==0,bounds:new T.Box3(new T.Vector3(x-1,-1,-1),new T.Vector3(x+1,1,1))}));
split.register(fence,pieces);const unlit=split.preparation.children[0].material;
lamp.position.set(0,0,0);lamp.distance=4;lamp.intensity=1;lamp.visible=true;
split.update([lamp]);assert.equal(fence.material,unlit,'empty space inside batch bound must not force point-light shading');
pieces[2].visible=true;split.update([lamp]);assert.equal(fence.material,full,'visibility changes with stationary lights must restore shading');
pieces[2].visible=false;split.update([lamp]);assert.equal(fence.material,unlit);
lamp.position.x=5;split.update([lamp]);assert.equal(fence.material,full,'piece boundary includes safety margin');
lamp.position.x=0;second.position.x=10;parent.position.x=0;split.update([lamp,second]);assert.equal(fence.material,full,'any light reaching any piece keeps the full shader');
lamp.distance=0;split.update([lamp]);assert.equal(fence.material,full,'unlimited lights never use finite-piece exclusion');
split.dispose();wide.dispose();console.log('PASS: visible-piece light exclusion, stationary-light camera changes, boundaries and multiple lights');

// Camera turns alone do not change lamp parameters. A batch hidden while a
// lamp moves into range must still be correctly lit when it reappears.
const reveal=createLocalLightCulling(),revealed=new T.Mesh(geometry,full);
revealed.position.x=10;reveal.register(revealed);
lamp.position.set(100,0,0);lamp.distance=4;lamp.intensity=1;lamp.visible=true;
reveal.update([lamp]);assert.notEqual(revealed.material,full);
revealed.visible=false;lamp.position.x=10;reveal.update([lamp]);
revealed.visible=true;reveal.update([lamp]);
assert.equal(revealed.material,full,'camera reveal must restore light without lamp movement');
revealed.visible=false;lamp.position.x=100;reveal.update([lamp]);
revealed.visible=true;reveal.update([lamp]);
assert.notEqual(revealed.material,full,'out-of-range revealed batches retain zero-light shader');
reveal.dispose();console.log('PASS: hidden batch lighting survives camera reveal with stationary lamps');
