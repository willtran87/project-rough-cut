import * as THREE from './vendor/three/three.module.js';
import { arrivalGatePose } from './course-arrival.js';

// Bounded instanced geometry at the authoritative south boundary. Nothing
// protrudes into the walkable side; the existing boundary owns all collision.
export function createCourseEntryGate(parent, { halfWidth, z }) {
  const root = new THREE.Group(); root.name = 'south-service-gate'; root.position.z = z;
  parent.add(root);
  const iron = [], stone = [], brass = [], lamps = [];
  const add = (list, x, y, zz, w, h, d, roll = 0) => list.push({ x, y, z: zz, w, h, d, roll });
  for (const side of [-1, 1]) {
    add(stone, side * 2.2, 1.18, .24, .46, 2.36, .48);
    add(stone, side * 2.2, 2.38, .24, .59, .16, .6);
    add(stone, side * 2.2, .13, .24, .66, .26, .66);
    for(let course=1;course<8;course++){
      add(iron,side*2.2,course*.28,.002,.46,.012,.012);
      add(iron,side*2.2+(course%2?.09:-.07),course*.28-.14,.002,.012,.27,.012);
    }
    add(iron, side * 2.2, 2.6, .24, .22, .30, .22);
    add(lamps, side * 2.2, 2.6, .10, .15, .19, .06);
    for (const y of [.25, 1.08, 1.96]) add(iron, side * 1.04, y, .22, 2.08, .075, .08);
    for (let i = 0; i < 10; i++) {
      const x = side * (.12 + i * .205), height = 2.05 + .15 * (1 - i / 10);
      add(iron, x, height / 2 + .12, .22, .035, height, .045);
      add(brass, x, height + .14, .22, .055, .075, .055, Math.PI / 4);
    }
    const width = Math.max(0, halfWidth - 2.43);
    for (const y of [.36, 1.35]) add(iron, side * (2.43 + width / 2), y, .24, width, .07, .07);
    const count = Math.ceil(width / .24);
    for (let i = 0; i < count; i++) add(iron, side * (2.46 + i * width / count), .9, .24, .035, 1.8, .04);
    for (let x = 4.8; x < halfWidth; x += 2.5) add(stone, side * x, .92, .26, .20, 1.84, .24);
  }
  // A crossing chain and a heavy central lock remain legible from the start.
  for (let i = -5; i <= 5; i++) {
    add(brass, i * .095, 1.05 - Math.cos(i / 5 * Math.PI / 2) * .15, .12, .115, .032, .035, i % 2 ? .55 : -.55);
  }
  add(brass, 0, .84, .08, .20, .23, .10);
  add(iron, 0, .85, .018, .025, .07, .015);
  const geometry = new THREE.BoxGeometry(1, 1, 1), matrix = new THREE.Matrix4();
  const position = new THREE.Vector3(), scale = new THREE.Vector3(), quaternion = new THREE.Quaternion(), axis = new THREE.Vector3(0, 0, 1);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x617477, roughness: .68, metalness: .28 }),
    new THREE.MeshStandardMaterial({ color: 0x84928a, roughness: .96 }),
    new THREE.MeshStandardMaterial({ color: 0xb79858, roughness: .54, metalness: .32 }),
    new THREE.MeshBasicMaterial({ color: 0xe8a254 }),
  ];
  const meshes = [iron, stone, brass, lamps].map((items, index) => {
    const mesh = new THREE.InstancedMesh(geometry, materials[index], items.length);
    items.forEach((p, i) => {
      position.set(p.x, p.y, p.z); scale.set(p.w, p.h, p.d); quaternion.setFromAxisAngle(axis, p.roll);
      matrix.compose(position, quaternion, scale); mesh.setMatrixAt(i, matrix);
      if(index<3)mesh.setColorAt(i,new THREE.Color().setScalar(.87+(i*17%11)*.013));
    });
    mesh.computeBoundingSphere(); mesh.castShadow = index < 3; mesh.receiveShadow = index < 3;
    root.add(mesh); return mesh;
  });
  return {
    update(frame) {
      const pose = arrivalGatePose(frame.fx?.arrival, frame.fx?.gateImpact, frame.reducedMotion, frame.fx?.flashes);
      // Chain and lock move; the pillars and collision silhouette remain fixed.
      meshes[2].position.z = pose.recoil;
      materials[3].color.setHex(0xe8a254).multiplyScalar(pose.lamp);
    },
    stats: () => ({ instances: iron.length + stone.length + brass.length + lamps.length, batches: 4, z, halfWidth }),
  };
}
