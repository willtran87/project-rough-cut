// Conservative support of the shaped rubber outsole, in ankle coordinates.
// Shared by terrain IK and the cart-ejection landing presentation.
export function runnerSoleSupport(x,y,z){
 return -.055*z-.075*y-Math.hypot(.083*x,.155*z);
}
