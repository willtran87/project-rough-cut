// Fixed build-time facing toward the Level 1 entrance/spawn (0, 0).
// Model fronts are local +Z; course +y is -Z and x uses the 0.72 world scale.
// Neither authored paths nor the current camera can turn an objective sideways.
export function stationFacing(target){
 return Math.atan2(-target.x*.72,target.y);
}
