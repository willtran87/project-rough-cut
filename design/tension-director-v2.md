# Tension Director v2

## Goal

Create suspense through controlled anticipation, incomplete but truthful information, direct consequence, and protected recovery. The pass deliberately avoids increasing Joe's speed, detection, collision, or teleport frequency.

## Shared dramatic phases

- `quiet`: no direct threat or authored warning; quiet time accumulates toward a bounded beat.
- `warning`: a service intercept, environmental omen, Silent Stalk, or rear sighting owns the presentation budget.
- `confrontation`: chase, search, material detection, or close Joe proximity takes priority. Unrelated visual flashes pause.
- `recovery`: an existing relief window after contact break or emergency intervention lowers horror intensity and postpones new beats.

Phase, phase duration, transitions, pressure, current omen, Silent Stalk, rear sightings, intercepts, and fairness rules are exposed through `render_game_to_text`.

## Environmental omens

The director selects among bent grass, fleeing birds, and a parted fog wake. Each omen is positioned approximately between the player and Joe with bounded lateral error, making it incomplete but directionally honest. Omens are decorative, quality-scaled, Reduced Camera Motion-safe, and never alter detection or collision.

## Silent Stalk

1. A 1.65-second engine cough announces the change and asks the player to mark Joe's direction.
2. Mower audio falls to 1.2% for 3.4–4.8 seconds. Joe continues moving, routing, detecting, cutting, and colliding normally.
3. Grass/fog disturbance remains available as visual evidence.
4. Chase, detection above 0.5, or Joe within 28 meters immediately restarts the engine.
5. Natural completion restarts from Joe's current angle, adds a mower sputter, and protects a short recovery before another beat.
6. A 24-second cooldown and five-event run cap prevent repetition.

## Rear sightings

After the opening grace and outside active pursuit, a rear glance can reveal either a spectral Shadow Joe crossing or a mower-light sweep. The sighting is clamped away from the persistent map and HUD, receives a restrained cold fog rim, reports left/right movement, and disappears without changing any gameplay state. The 14-second cooldown prevents glance spam.

## Validation

- Standard organic route: reached Audit Row at x 0 / y 99 with no movement, collision, HUD, or browser-console regression.
- Natural early-course sequence: reached Silent Stalk at 13.07 seconds with Joe still patrolling 209 meters away, `mowerState: silent`, and no errors.
- Natural restart: at 17.82 seconds the phase returned to quiet, `lastBeat: mower_restart_ahead`, `silentStalk: null`, and `mowerState: running` while Joe remained in patrol.
- Rear-glance chain: held R to a stable 180-degree view while moving remained body-relative; one `rear_crossing` appeared on the left with no real Joe visible and `gameplayEffect: none_atmospheric_only`; release returned the camera to zero. No browser or page errors occurred.
