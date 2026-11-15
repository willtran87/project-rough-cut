import * as THREE from './vendor/three/three.module.js';
import {courseBallFlightPosition} from './course-ball-motion.js';

export function createCourseBallPresentation(world, {scale, xScale}) {
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 6),
    new THREE.MeshBasicMaterial({color:0xf5f0d7}));
  ball.name = 'CourseGolfBall';
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.065, 16),
    new THREE.MeshBasicMaterial({color:0x07110a, transparent:true, opacity:.3,
      depthWrite:false, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1}));
  shadow.name = 'CourseGolfBallShadow';
  shadow.rotation.x = -Math.PI / 2;
  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.Float32BufferAttribute(new Float32Array(27), 3);
  geometry.setAttribute('position', positions);
  const trail = new THREE.Line(geometry, new THREE.LineBasicMaterial({
    color:0xe2dfbb, transparent:true, opacity:.34, depthWrite:false}));
  trail.name = 'CourseGolfBallFlightTrail';
  world.add(ball, shadow, trail);
  function update(frame) {
    ball.visible = shadow.visible = Boolean(frame.ball);
    trail.visible = Boolean(frame.ballFlight && !frame.reducedMotion);
    if (frame.ball) {
      const p = frame.ball, height = p.height ?? .055;
      ball.position.set(p.x * xScale, height, -p.y * scale);
      shadow.position.set(p.x * xScale, .014, -p.y * scale);
      shadow.scale.setScalar(1 + Math.min(3, height * .7));
      shadow.material.opacity = .3 / (1 + height * 1.6);
    }
    if (trail.visible) {
      const flight = frame.ballFlight;
      const t = Math.min(1, flight.elapsed / flight.duration);
      const tail = Math.max(0, t - .065 / flight.duration);
      for (let i = 0; i < 9; i++) {
        const p = courseBallFlightPosition(flight, tail + (t - tail) * i / 8);
        positions.setXYZ(i, p.x * xScale, p.height, -p.y * scale);
      }
      positions.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }
  return {ball, update, stats:()=>({visible:ball.visible, position:ball.position.toArray(),
    shadowVisible:shadow.visible, shadowPosition:shadow.position.toArray(),
    shadowOpacity:shadow.material.opacity, trailVisible:trail.visible})};
}
