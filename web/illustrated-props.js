import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// Complete authored silhouettes, with world-space anchors. Rendering never edits
// gameplay coordinates or collision hulls. Cylindrical billboards stay upright.
export function createIllustratedProps() {
  const entries = [], counts = {};
  function add(parent, name, crop, x, z, width, height, options = {}) {
    const root = new THREE.Group(); root.position.set(x, options.y || 0, z); parent.add(root);
    const mesh = Art.card(name, crop, width, height, { alphaTest: .18, color: options.color || 0xffffff });
    mesh.position.y = height / 2; root.add(mesh);
    const entry = { root, mesh, width, height, ...options }; entries.push(entry);
    const kind = options.kind || name; counts[kind] = (counts[kind] || 0) + 1;
    return entry;
  }
  function cart(parent, x, z, width, depth) {
    const crops = [[190,8,390,494],[776,8,752,494],[160,522,440,494],[776,522,752,494]];
    const maps = crops.map(crop => Art.texture('rough-cut-cart-directions-v1', crop));
    const entry = add(parent,'rough-cut-cart-directions-v1',crops[0],x,z,width,2.15,{kind:'directional-cart',hull:{width,depth},maps,view:0});
    return entry;
  }
  const origin = new THREE.Vector3();
  function update(camera) {
    for (const e of entries) {
      e.root.getWorldPosition(origin);
      const dx = camera.position.x - origin.x, dz = camera.position.z - origin.z;
      if (!e.fixed) e.root.rotation.y = Math.atan2(dx, dz);
      if (e.hull) {
        const a = Math.atan2(dz,dx), face = Math.cos(a), threshold = e.view === 0 || e.view === 2 ? .62 : .76;
        e.view = face < -threshold ? 0 : face > threshold ? 2 : dz > 0 ? 1 : 3;
        e.mesh.material.map = e.maps[e.view];
        // Project the existing rectangular footprint onto the view's right axis.
        const visibleWidth = Math.abs(Math.sin(a)) * e.hull.width + Math.abs(Math.cos(a)) * e.hull.depth;
        e.mesh.scale.x = visibleWidth / e.width;
      } else if (e.ellipse) {
        const a = Math.atan2(dx,dz), { rx, rz } = e.ellipse;
        e.mesh.scale.x = 2 * Math.sqrt((rx*Math.cos(a))**2 + (rz*Math.sin(a))**2) / e.width;
      }
    }
  }
  return { add, cart, update, stats: () => ({ counts: { ...counts }, carts: entries.filter(e=>e.hull).map(e=>({view:e.view,width:e.width*e.mesh.scale.x})) }) };
}
