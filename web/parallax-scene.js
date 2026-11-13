import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// A separate far scene keeps decorative depth independent of gameplay collision,
// target projection and the near scene's draw distance.
export function createParallax({travelScale=1,showEstate=true,storm=0,night=0}={}) {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, 16 / 9, .1, 1200);
  const layers = [], clouds = [];
  let motionTime = 0, lastTime = null,coverage=0,nightfallProgress=0;
  const layer = (name, influence) => {
    const root = new THREE.Group(); scene.add(root);
    const entry = { name, influence, root, anchor: new THREE.Vector3(0, 0, -180) }; layers.push(entry); return entry;
  };
  const sky = layer('sky', 0);
  const domeGeometry = new THREE.SphereGeometry(1000, 48, 24);
  const uv = domeGeometry.attributes.uv, positions = domeGeometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, Math.max(0, Math.asin(positions.getY(i) / 1000) / (Math.PI / 2)));
  const skyMap=Art.texture('rough-cut-night-sky-v2');skyMap.wrapS=THREE.RepeatWrapping;skyMap.repeat.x=2;
  const dome = new THREE.Mesh(domeGeometry, new THREE.MeshBasicMaterial({ map: skyMap, color: 0x6d7a8b, side: THREE.BackSide, depthWrite: false, fog: false }));
  dome.renderOrder = -10; sky.root.add(dome);
  dome.material.color.multiplyScalar((1-storm*.16)*(1-night*.5));
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: Art.texture('rough-cut-moon-v1', [225, 195, 815, 835]), color: 0xc7d8cc, depthWrite: false }));
  moon.position.set(-280, 280, -720); moon.scale.set(58, 58, 1); sky.root.add(moon);
  moon.material.color.multiplyScalar(1-night*.4);

  const domeColor=dome.material.color.clone(),moonColor=moon.material.color.clone();
  const cloudLayer = layer('clouds', .025);
  for (let i = 0; i < 9; i++) {
    const cloud = Art.card('rough-cut-cloud-atlas-v2', [(i % 3) * 512, i % 2 ? 512 : 0, 512, 512], 210 + i % 3 * 45, 145, { transparent: true, opacity: .48, alphaTest: .025, color: 0x8eabb8, depthWrite: false });
    cloud.material.opacity+=storm*.18;cloud.scale.set(1+storm*.35,1+storm*.12,1);cloud.material.color.multiplyScalar((1-storm*.15)*(1-night*.3));
    cloudLayer.root.add(cloud); clouds.push({ mesh: cloud, baseScale:cloud.scale.clone(),baseOpacity:cloud.material.opacity, angle: i * Math.PI * 2 / 9 + .2, height: 145 + (i % 3) * 60 });
  }
  const ring = (entry, name, crop, radius, height, bottom, repeat, color) => {
    const map = Art.texture(name, crop); map.wrapS = THREE.RepeatWrapping; map.repeat.x = repeat;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 96, 1, true), new THREE.MeshBasicMaterial({ map, color, side: THREE.BackSide, alphaTest: .12 }));
    mesh.position.y = bottom + height / 2; entry.root.add(mesh); entry.anchor.set(0, height + bottom, -radius);
  };
  ring(layer('ridge', .08), 'rough-cut-far-ridge-v1', [0, 620, 1672, 321], 360, 57, -17, 3, 0x62737b);
  ring(layer('distant-trees', .30), 'rough-cut-distant-treeline-v1', [0, 350, 1672, 385], 180, 27, -8, 4, 0x41575e);
  const estate = layer('estate', .65);
  for (const [x, z, turn] of (showEstate?[[-60, -128, .25], [105, 32, -1.8]]:[])) {
    const house = Art.card('rough-cut-distant-clubhouse-v1', [80, 280, 1525, 465], 62, 18.9, { color: 0x899789 });
    house.position.set(x, 8, z); house.rotation.y = turn; estate.root.add(house);
  }
  estate.anchor.set(-60, 12, -128);

  function update(view, time, reducedMotion, paused, nightfall=null) {
    nightfallProgress=nightfall?.progress||0;
    dome.material.color.copy(domeColor).multiplyScalar(nightfall?.skyScale??1);
    moon.material.color.copy(moonColor).multiplyScalar(nightfall?.moonScale??1);
    const dt = lastTime === null ? 0 : Math.max(0, Math.min(.1, time - lastTime)); lastTime = time;
    if (!reducedMotion && !paused) motionTime += dt;
    camera.position.copy(view.position);camera.position.x*=travelScale;camera.position.z*=travelScale; camera.quaternion.copy(view.quaternion); camera.fov = view.fov; camera.aspect = view.aspect;
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    for (const entry of layers) entry.root.position.set(camera.position.x * (1 - entry.influence), 0, camera.position.z * (1 - entry.influence));
    for (const cloud of clouds) {
      cloud.mesh.scale.copy(cloud.baseScale);
      cloud.mesh.scale.x*=nightfall?.cloudWidth??1;cloud.mesh.scale.y*=nightfall?.cloudHeight??1;
      cloud.mesh.material.opacity=nightfall?.cloudOpacity??cloud.baseOpacity;
      const a = cloud.angle + motionTime * .00065;
      cloud.mesh.position.set(Math.sin(a) * 720, cloud.height, -Math.cos(a) * 720);
      cloud.mesh.rotation.y = -a;
    }
    // Estimate coverage from these actual 3D cloud positions, independently of
    // the viewer's yaw. Turning the camera must not change the world's light.
    coverage=0;const moonAngle=Math.atan2(moon.position.x,-moon.position.z),moonElevation=Math.atan2(moon.position.y,Math.hypot(moon.position.x,moon.position.z));
    for(const cloud of clouds){const a=Math.atan2(cloud.mesh.position.x,-cloud.mesh.position.z),delta=Math.atan2(Math.sin(a-moonAngle),Math.cos(a-moonAngle)),elevation=Math.atan2(cloud.height,720),width=cloud.mesh.geometry.parameters.width/1440*(nightfall?cloud.mesh.scale.x:1);coverage+=Math.max(0,1-Math.abs(delta)/width)*Math.max(0,1-Math.abs(elevation-moonElevation)/.14)*(nightfall?cloud.mesh.material.opacity:.48);}
    coverage=Math.min(.85,coverage);
    scene.updateMatrixWorld(true);
  }
  function stats() {
    return { motionTime, moonCoverage:coverage, nightfall:nightfallProgress,clouds:clouds.length,cloudWidth:clouds[0].mesh.scale.x,cloudOpacity:clouds[0].mesh.material.opacity,skyColor:dome.material.color.getHex(), layers: layers.map(({ name, influence, root, anchor }) => {
      const point = anchor.clone().add(root.position).project(camera);
      return { name, influence, origin: [root.position.x, root.position.z], screen: [point.x, point.y] };
    }) };
  }
  function dispose() {
    scene.traverse(o => { o.geometry?.dispose(); if (o.material) o.material.dispose(); });
  }
  return { scene, camera, update, stats, moonCoverage:()=>coverage, dispose };
}
