// Ordinary shots retain their planar rollout. Cover contacts first rebound and
// drop to clear ground; surface hops then settle at the planned recovery point.
export function courseBallFlightPosition(flight, progress) {
  const plan=flight.shotPlan, end=plan?.flightTarget||plan?.impact||flight.target;
  const t=Math.max(0,Math.min(1,progress))*(plan?.flightFraction??1);
  return {x:flight.start.x+(end.x-flight.start.x)*t,y:flight.start.y+(end.y-flight.start.y)*t,
    height:.055+Math.sin(t*Math.PI)*(1.4+flight.power*1.6)};
}

export function courseBallRollPosition(roll, elapsed = roll.elapsed) {
  const dropHeight=Math.max(0,(roll.flightContact?.height||.055)-.055);
  const dropDuration=dropHeight?Math.min(roll.duration*.65,Math.sqrt(2*dropHeight/9.8)):0;
  const progress = Math.max(0, Math.min(1, (elapsed-dropDuration) / (roll.duration-dropDuration)));
  const travel = 1 - Math.pow(1 - progress, 2.15);
  const bounceTime=elapsed-dropDuration;
  const window = Math.min(.6, (roll.duration-dropDuration) * .62);
  const first = window * .65;
  let lift = 0;
  if(dropDuration&&elapsed<dropDuration)lift=dropHeight*(1-(Math.max(0,elapsed)/dropDuration)**2);
  else if (bounceTime >= 0 && bounceTime < window && roll.distance > .05) {
    const second = bounceTime >= first;
    const phase = second ? (bounceTime - first) / (window - first) : bounceTime / first;
    const amplitude = (roll.initialSurface?.bounce || 0) * (.25 + .2 * roll.power)
      * (roll.impactObstacle ? .4 : 1) * (second ? .24 : 1);
    lift = amplitude * 4 * phase * (1 - phase);
  }
  const falling=dropDuration&&elapsed<dropDuration, drop=falling?1-Math.pow(1-Math.max(0,elapsed/dropDuration),3):1;
  return {
    x: falling?roll.flightContact.x+(roll.start.x-roll.flightContact.x)*drop:roll.start.x + (roll.target.x - roll.start.x) * travel,
    y: falling?roll.flightContact.y+(roll.start.y-roll.flightContact.y)*drop:roll.start.y + (roll.target.y - roll.start.y) * travel,
    height: .055 + lift,
  };
}
