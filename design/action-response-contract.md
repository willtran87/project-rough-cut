# Action and response contract

The quality-reset candidate keeps responses brief and driven by actual state. Durations below are authored animation/message lifetimes, not physical latency measurements.

| Event | Immediate response | Persistent consequence | Interruption / priority |
| --- | --- | --- | --- |
| Aim | Club anticipates; shared arc, impact ring and rest marker appear on next render | Pitch selects position; held charge changes loft/roll | Escape/back cancels without a shot or ball cost; aim owns instruction |
| Chip release | Hand/club follow through; ball follows the shown plan | One ball is consumed; actual impact/roll creates recoverable ball | Moving/turning does not rewrite committed trajectory |
| Material hit | 3–10 bounded world particles; camera-relative filtered sound; small ground ring | Surface changes roll and lure behavior | Sand .65 s, wet .55 s, metal .35 s; reduced motion uses three particles |
| Bell / loud release | Bell swing or lever response on accepted action; local sound | Check completes once; real signal draws Joe to evidence | Threat guidance takes precedence over optional rewards |
| Diverted release | Single sign prompt while Joe investigates a distant golf ball | Signature completes without a new signal; original lure continues and expires normally | Requires more than .75 s of lure time, at least 35 course units from the station, no sight and investigate state; otherwise loud retreat choices apply |
| Quiet stamp | Progress and moving stamp during 1.6 s hold | Page retains ink; no signal | Movement cancels and releases temporary crouch |
| Pickup / valve | Pickup disappears or valve turns; inventory/access changes | Key ownership or drain grille opening persists | Same press cannot award a second pickup; unavailable Use gets a short reason |
| Suspicion / pursuit | Mower orientation/cadence follows actual state; concise cause/advice | Joe follows evidence or last observation, subject to fresh sight | Danger replaces ordinary lesson; captions do not cover center target |
| State reaction | Joe plants the mower and turns toward the actual movement target before advancing; head pose distinguishes inspection/search/pursuit | Investigate .45 s, chase .24 s; same-state announcements cannot refresh the pause | Authoritative time; repeated renders/Pause do not advance the pose; hand grip remains attached |
| Close contact | Mower warning and one urgent instruction, with camera-relative direction when threat captions are enabled | .65 s mower pause and capture grace on entering 12-unit unobstructed proximity; original 8.2-unit capture resumes afterward | One opportunity per engagement; rearm requires 8 continuous seconds beyond 42 units, unseen, outside chase/search; movement remains under player control |
| Escape from sight | Joe searches the observed area; sound attenuates through cover | Relocation and quiet recovery can end pursuit | Bonus feedback remains secondary to fresh danger |
| Exit filing | Actual stillness progress and cancel instruction | Authoritative completion opens exit; result transition follows | Deliberate movement cancels; unsafe entry explains risk |
| Failure / retry | Cause and counterplay, immediate retry action | Same intended challenge; learned device controls retained | No mandatory replay of an acknowledged intro |

HUD ownership is specified in quality-core.js, and its ordering is regression tested. The close-contact warning overrides ordinary hold/aim guidance until sealing has already succeeded. Danger uses one status/direction and one action; incidental captions, banter, rewards and optional choice buttons yield. Threat captions disabled also disables the direction label. Mixer ducking lowers ambience while aiming, chased, activating a station or filing; the independent buses and output compressor remain active. Sampled analyser peaks establish only that those samples did not clip; headphones/speaker intelligibility is a deferred study.


## Evidence-led pursuit and decision feedback — November 7

Joe predicts at most half a second / eight course units ahead from confirmed visible movement, only along a clear segment. Losing sight uses the last evidence position, never hidden live inputs. He checks a fixed sequence around that evidence and then resumes an authored patrol; exhausted searches give the director an eight-second recovery interval. Routes use 2.2-unit mower clearance, and corner waypoints are retained until the following segment is clear. Director patrol changes choose authored destinations independently of the hidden player's location and use ordinary movement, never teleportation. Fresh contact can interrupt them.

The open map compares the next access requirement, straight-line distance, and actual current filing hold for both exits. Selecting a route returns keyboard focus to the game. Aim feedback names the predicted landing surface and its actual lure-length modifier; banked shots are identified. Victory retry coaching recognizes a successful diversion, terrain trap, chase escape or quiet run and suggests another tactic. Existing performance targets remain on the result action.
