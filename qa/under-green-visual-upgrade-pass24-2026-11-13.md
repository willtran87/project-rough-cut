# Under the Green visual pass 24: scythe attack body weight

V45 accepted locally. The complete 53-item visual plan and seven full-level release gates remain in scope.

## Change

Joe now initiates the existing broad cut through his shoulders, leans forward into it, lets the blade pass the torso, and settles during recovery. Secondary rotations use analytic phase curves with zero-velocity joins at the cut endpoints. Head counter-rotation keeps attention on the player. The actual weapon transform, two-hand IK, wrist alignment, planted-foot solver, collision sweep, 0.22-second cut and 1.3-second recovery durations remain authoritative.

A blocked attack retains its exact interrupted body pose in recoveryFrom. Recovery decays that offset while the existing weapon recovery returns from its own interrupted pose. This avoids a torso snap on contact. The extra state is cosmetic; no new attack reach, damage timing, pursuit, control, banner or checkpoint behavior. No screen shake or camera movement was added.

Production: web/under-green-attack-acting.js; integration in web/under-green-actor.js and cosmetic recovery capture in web/under-green-clearance.js.

## Final verification

- verify-under-green-attack-acting.mjs: PASS. 242 windup/cut interruption positions preserve exact initial recovery pose and return to neutral. 30/60/120Hz sampled curves are finite/deterministic. Boundary velocity checks cover cut start/end and recovery hold/end.
- verify-under-green-attack-acting.cjs: PASS,25 native/responsive views at actual2560x1600,1280x720,390x844 and844x390;19 software views at actual960x600. Front/side/rear/close,windup,early/mid/late cut,follow-through,scheduled ghost and pause freeze. No browser/page errors. Final artifacts: output/under-green/visual-upgrade/pass24-final/{hardware,software}/report.json.
- 523 rendered pose samples per renderer at30/60/120Hz. Final native maxhanderror9.492323054434175e-8m,maxfooterror1.3754953954511955e-7m,max visible-versus-collision blade endpoint error7.191640501203643e-15m. Cut/recovery world-space sole drift remains below5.24e-9m. Existing initial windup stance settlement remains; it is not incorrectly counted as sliding during the cut. A persistent support-foot assertion was added to the verifier after launch and also executed directly against both final saved sample sets.
- verify-under-green-moving-clearance.cjs --dry: PASS on final production.1379routeframes/106actual rendered mesh audits,zero scenery intersections,all sampled camera checks pass,maxfooterror2.4146861866040165e-7m. Artifacts: pass24-final-clearance.
- verify-under-green-clearance.mjs: PASS after body/recovery integration,1288floor/heading samples and11093live-Joe routeframes; blocked strike safety,raised close-wall turns,gate interception and route completion. Final easing-only refinement changes no simulation/collision rules.
- verify-under-green-scythes.mjs: PASS; physical blade remains inside the shared hit capsule.
- Installed develop-web-game client final: terminalexit0,five screenshot/state pairs,no error artifact. Initial disabled Preparing button exceeded its5sec click timeout; subsequent Enter bursts reached gameplay. Final shot4 inspected at(0,12.68),actual960x540. Artifacts: pass24-client-final. This is normal-input smoke evidence, not attack coverage; dedicated pose/render tests provide that.

Final visual inspection: native early cut/follow-through/landscape phone,software late cut,and installed-client final gameplay. Earlier iteration also inspected windup/portrait/late-cut views. Final source snapshots and SHA256 manifest: pass24-source/final-hashes.json. Intermediate pass24-acting,pass24-clearance andpass24-client are superseded by final directories above.

## Cost and limits

Matched native front view stays138draws,170704triangles,79textures,131programs at2560x1600. No added meshes,maps or lights. CPU pose math and tiny cosmetic state are not claimed to be free; full-level frame-time/startup acceptance remains open.

Ledger19implemented/30in_progress/4pending. All seven full-level gates remain open. V46 actual-contact scrape/dirt/splash effects, V30 moving shadow, V34 dark-value grading,V53 final camera finishing and remaining partial environment requirements remain unfinished. No full Level1 parity or goal-completion claim.

Next V46 work must derive effects from real swept contact positions, distinguish blade contact from shaft clearance, use bounded pooled fragments, preserve audio event delivery, and verify pause/retry/occlusion. Do not emit generic sparks simply because an attack misses the player.
