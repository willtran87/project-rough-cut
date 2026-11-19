// Pure obstacle-footprint geometry for Night Order collision and sight tests.
import {clamp} from './math.js?v=20261119-extract';
export function obstacleFootprintAxes(
  obstacle,
  padding = 0,
) {
  return {
    x: Math.max(
      0.01,
      (obstacle.radiusX ??
        obstacle.radius ??
        0) +
        padding,
    ),
    y: Math.max(
      0.01,
      (obstacle.radiusY ??
        obstacle.radius ??
        0) +
        padding,
    ),
  };
}

export function obstacleNormalizedDistance(
  point,
  obstacle,
  padding = 0,
) {
  const axes =
    obstacleFootprintAxes(
      obstacle,
      padding,
    );
  if(obstacle.shape==='box')return Math.max(Math.abs((point.x-obstacle.x)*.72)/axes.x,Math.abs(point.y-obstacle.y)/axes.y);
  return Math.hypot(
    (point.x - obstacle.x) *
      0.72 /
      axes.x,
    (point.y - obstacle.y) /
      axes.y,
  );
}

export function obstacleClearance(
  point,
  obstacle,
  padding = 0,
) {
  const axes =
    obstacleFootprintAxes(
      obstacle,
      padding,
    );
  if(obstacle.shape==='box'){
    const x=Math.abs((point.x-obstacle.x)*.72)-axes.x,y=Math.abs(point.y-obstacle.y)-axes.y;
    return Math.hypot(Math.max(0,x),Math.max(0,y))+Math.min(0,Math.max(x,y));
  }
  const deltaX =
    (point.x - obstacle.x) *
    0.72;
  const deltaY =
    point.y - obstacle.y;
  const centerDistance =
    Math.hypot(deltaX, deltaY);
  if (centerDistance < 0.0001) {
    return -Math.min(
      axes.x,
      axes.y,
    );
  }
  const normalizedDistance =
    Math.hypot(
      deltaX / axes.x,
      deltaY / axes.y,
    );
  const boundaryDistance =
    centerDistance /
    Math.max(
      0.0001,
      normalizedDistance,
    );
  return centerDistance -
    boundaryDistance;
}

export function segmentObstacleIntersection(
  start,
  end,
  obstacle,
  padding = 0,
) {
  const axes =
    obstacleFootprintAxes(
      obstacle,
      padding,
    );
  const startX =
    (start.x - obstacle.x) *
    0.72 /
    axes.x;
  const startY =
    (start.y - obstacle.y) /
    axes.y;
  const endX =
    (end.x - obstacle.x) *
    0.72 /
    axes.x;
  const endY =
    (end.y - obstacle.y) /
    axes.y;
  if(obstacle.shape==='box'){
    let lo=0,hi=1;for(const [a,b]of [[startX,endX],[startY,endY]]){const d=b-a;if(Math.abs(d)<1e-9){if(Math.abs(a)>1){hi=-1;break;}}else{let t1=(-1-a)/d,t2=(1-a)/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);}}
    return {amount:clamp((lo+hi)/2,0,1),startDistance:Math.max(Math.abs(startX),Math.abs(startY)),endDistance:Math.max(Math.abs(endX),Math.abs(endY)),closestDistance:lo<=hi?0:1.01};
  }
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const segmentLengthSquared =
    segmentX * segmentX +
    segmentY * segmentY;
  const amount =
    segmentLengthSquared <= 0.0001
      ? 0
      : clamp(
          -(
            startX * segmentX +
            startY * segmentY
          ) /
            segmentLengthSquared,
          0,
          1,
        );
  const closestX =
    startX +
    segmentX * amount;
  const closestY =
    startY +
    segmentY * amount;
  return {
    amount,
    startDistance:
      Math.hypot(startX, startY),
    endDistance:
      Math.hypot(endX, endY),
    closestDistance:
      Math.hypot(
        closestX,
        closestY,
      ),
  };
}
