import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';
import {CAB_LAMP} from './final-cut-lamps.js';
import {rigLampState} from './final-cut-reveal.js';

export function createCabLighting(body,fixture,audit,{software=false}={}){
 const finish=createMachineFinishMaterial(),dial=new THREE.MeshBasicMaterial({color:'#09130f',vertexColors:true}),owned=[];
 const panel=new THREE.Group();panel.name='Cab-instrument-panel';panel.position.set(0,1.88,-.9);panel.rotation.x=-.35;body.add(panel);
 const shell=[],marks=[],needles=[];
 function box(parts,x,y,z,w,h,d,kind=4,angle=0){const g=new THREE.BoxGeometry(w,h,d);g.rotateZ(angle);g.translate(x,y,z);if(parts===marks){const c=new THREE.Color(kind),values=[];for(let i=0;i<g.attributes.position.count;i++)values.push(c.r,c.g,c.b);g.setAttribute('color',new THREE.Float32BufferAttribute(values,3));}else tagMachineSurface(g,kind,.37);parts.push(g);}
 function ring(x,y,z,r,tube,kind=1){const g=new THREE.TorusGeometry(r,tube,4,16);g.translate(x,y,z);tagMachineSurface(g,kind,.37);shell.push(g);}
 function mesh(parts,parent,material,id){const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());owned.push(g);const m=new THREE.Mesh(g,material);m.name=id;parent.add(m);audit(id,m);return m;}
 box(shell,0,0,0,.94,.34,.12);
 box(shell,0,0,.062,.85,.26,.018,0);
 for(const side of [-1,1]){box(shell,side*.45,0,.025,.035,.32,.16,1);for(const y of [-.14,.14])box(shell,side*.43,y,.087,.025,.025,.014,1);}
 box(shell,0,.18,.035,1,.035,.23,0);
 for(const [i,x]of [-.26,0].entries()){
  ring(x,.025,.085,.088,.012);ring(x,.025,.088,.071,.006,4);
  for(let k=0;k<9;k++){const a=-2.35+k*4.7/8;box(marks,x+Math.sin(a)*.059,.025+Math.cos(a)*.059,.094,.006,.014,.005,k>6?'#b9793c':'#c0d6ac',-a);}
  needles.push({first:marks.reduce((n,g)=>n+g.attributes.position.count,0),x,y:.025});box(marks,x,.047,.101,.007,.052,.006,'#dae8ba');ring(x,.025,.102,.009,.004);
 }
 // Small hour-meter segments and three status lamps, rather than a bright
 // modern screen. Their physical faces motivate the subdued upward fill.
 box(shell,.255,.035,.08,.23,.095,.025,4);
 const digits=['0110000','1111111','0110011','1101101'];
 for(let k=0;k<4;k++){const x=.18+k*.048;for(const [n,dx,dy,w,h]of [[0,0,.06,.024,.005],[1,.013,.045,.005,.024],[2,.013,.015,.005,.024],[3,0,0,.024,.005],[4,-.013,.015,.005,.024],[5,-.013,.045,.005,.024],[6,0,.03,.024,.005]])if(digits[k][n]==='1')box(marks,x+dx,dy,.096,w,h,.006,'#9dbd8e');}
 for(let k=0;k<3;k++){box(shell,.16+k*.09,-.075,.083,.057,.04,.02,1);box(marks,.16+k*.09,-.075,.096,.037,.02,.008,k===2?'#c7944c':'#a5c5a0');}
 mesh(shell,panel,finish,'cab-instruments');const face=mesh(marks,panel,dial,'cab-instrument-faces'),rest=face.geometry.attributes.position.array.slice();let lastNeedles='',angles=[0,0];
 for(const side of [-1,1]){const parts=[];box(parts,side*.44,1.56,-.9,.055,.47,.055,1);box(parts,side*.44,1.34,-.9,.15,.025,.15,1);mesh(parts,body,finish,`cab-instrument-support-${side}`);}
 // Origin is just outside the existing lens/guard, in its own local space.
 const key=new THREE.SpotLight('#ffe4bd',4.5,2.35,.83,.7,1.5);fixture.updateMatrix();key.position.set(0,0,-CAB_LAMP.d/2-.025).applyMatrix4(fixture.matrix);fixture.parent.add(key);
 key.target.position.set(0,2.04,.1);body.add(key.target);
 key.castShadow=true;key.shadow.mapSize.setScalar(software?128:256);key.shadow.camera.near=.08;key.shadow.camera.far=2.35;key.shadow.bias=.0001;key.shadow.normalBias=.015;key.shadow.autoUpdate=false;
 const fill=new THREE.SpotLight('#bad0a5',1.2,1.8,.8,.8,1.4);fill.position.set(.12,.015,.115);panel.add(fill);fill.target.position.set(0,2.48,.17);body.add(fill.target);
 const lights=[key,fill];let previous='',updates=0;
 return {lights,panel,update(r){angles=[Math.min(1,Math.abs(r.rig.speed||0)/12),r.rig.deployment].map(v=>-2.25+4.5*v);const needleKey=angles.join('|');if(needleKey!==lastNeedles){const p=face.geometry.attributes.position;needles.forEach((n,k)=>{const a=-angles[k],c=Math.cos(a),s=Math.sin(a);for(let i=n.first;i<n.first+24;i++){const x=rest[i*3]-n.x,y=rest[i*3+1]-n.y;p.setXY(i,n.x+x*c-y*s,n.y+x*s+y*c);}});p.needsUpdate=true;lastNeedles=needleKey;}const level=rigLampState(r).beam;key.intensity=4.5*level;fill.intensity=1.2*level;dial.color.setRGB(.018+.75*level,.025+.75*level,.018+.75*level);const state=[r.time,r.rig.x,r.rig.y,r.rig.yaw,r.rig.phase,r.rig.age,r.rig.steering,r.arrival.age,r.ending.age].join('|');if(level>0&&state!==previous){key.shadow.needsUpdate=true;previous=state;updates++;}},stats(){return {lights:lights.map(l=>({intensity:l.intensity,position:l.getWorldPosition(new THREE.Vector3()).toArray(),target:l.target.getWorldPosition(new THREE.Vector3()).toArray(),range:l.distance})),needleAngles:angles.slice(),shadowSize:key.shadow.mapSize.x,updates,meshes:4,triangles:owned.reduce((n,g)=>n+g.index.count/3,0),textures:0};},dispose(){finish.dispose();dial.dispose();owned.forEach(g=>g.dispose());key.shadow.map?.dispose();key.shadow.mapPass?.dispose();}};
}
