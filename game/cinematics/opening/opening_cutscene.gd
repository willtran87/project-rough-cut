extends Control
## Eight-second playable opening cutscene that resolves into the main menu.

const OPENING_TEXTURE: Texture2D = preload(
	"res://cinematics/opening/assets/rough_cut_opening_joe_through_grass_v1.png"
)
const FIRST_HOLE_SCENE := "res://levels/first_hole/first_hole.tscn"
const MIX_RATE := 22050.0
const CUT_START := 1.15
const CUT_END := 4.65
const LINE_START := 5.25
const LINE_END := 6.95
const MENU_TIME := 8.15

var _elapsed: float = 0.0
var _intro_finished: bool = false
var _image_stage: Control
var _scene_image: TextureRect
var _head_layer: TextureRect
var _head_base_position: Vector2
var _grass_curtain: RoughCutGrassCurtain
var _subtitle: Label
var _skip_label: Label
var _flash: ColorRect
var _main_menu: RoughCutMainMenu
var _audio_player: AudioStreamPlayer
var _audio_playback: AudioStreamGeneratorPlayback
var _audio_sample_clock: int = 0
var _random := RandomNumberGenerator.new()


func _ready() -> void:
	_random.seed = 7468821
	_build_visual_layers()
	_build_caption_layers()
	_build_menu()
	_build_procedural_audio()
	get_viewport().size_changed.connect(_on_viewport_resized)
	_on_viewport_resized()
	set_process(true)


func _process(delta: float) -> void:
	if not _intro_finished:
		_elapsed += delta
		_update_cutscene()
	else:
		_elapsed += delta
		_update_menu_ambience(delta)
	_fill_audio_buffer()


func _unhandled_input(event: InputEvent) -> void:
	if _intro_finished:
		return
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE or event.keycode == KEY_SPACE or event.keycode == KEY_ENTER:
			_finish_intro()
			get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed:
		_finish_intro()
		get_viewport().set_input_as_handled()


func _build_visual_layers() -> void:
	_image_stage = Control.new()
	_image_stage.name = "ImageStage"
	_image_stage.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_image_stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_image_stage)

	_scene_image = TextureRect.new()
	_scene_image.name = "OpeningKeyArt"
	_scene_image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_scene_image.texture = OPENING_TEXTURE
	_scene_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_scene_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_scene_image.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_scene_image.modulate = Color(0.72, 0.78, 0.69, 0.0)
	_scene_image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_image_stage.add_child(_scene_image)

	var head_texture := AtlasTexture.new()
	head_texture.atlas = OPENING_TEXTURE
	head_texture.region = Rect2(650.0, 55.0, 425.0, 435.0)

	_head_layer = TextureRect.new()
	_head_layer.name = "JoeHeadMotion"
	_head_layer.texture = head_texture
	_head_layer.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_head_layer.stretch_mode = TextureRect.STRETCH_SCALE
	_head_layer.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_head_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_head_layer.modulate.a = 0.0

	var head_mask_shader := Shader.new()
	head_mask_shader.code = """
shader_type canvas_item;

void fragment() {
	vec2 centered = (UV - vec2(0.5)) / vec2(0.48, 0.52);
	float edge = 1.0 - smoothstep(0.76, 1.0, length(centered));
	vec4 source = texture(TEXTURE, UV);
	source.a *= edge;
	COLOR = source;
}
"""
	var head_material := ShaderMaterial.new()
	head_material.shader = head_mask_shader
	_head_layer.material = head_material
	_image_stage.add_child(_head_layer)

	_grass_curtain = RoughCutGrassCurtain.new()
	_grass_curtain.name = "GrassCurtain"
	_grass_curtain.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_grass_curtain)

	var night_tint := ColorRect.new()
	night_tint.name = "NightTint"
	night_tint.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	night_tint.color = Color(0.0, 0.025, 0.04, 0.15)
	night_tint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(night_tint)

	_flash = ColorRect.new()
	_flash.name = "ImpactFlash"
	_flash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_flash.color = Color(0.82, 0.94, 0.62, 0.0)
	_flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_flash)


func _build_caption_layers() -> void:
	_subtitle = Label.new()
	_subtitle.name = "JoeSubtitle"
	_subtitle.anchor_left = 0.19
	_subtitle.anchor_top = 0.78
	_subtitle.anchor_right = 0.81
	_subtitle.anchor_bottom = 0.92
	_subtitle.text = "HERE'S JOEY!"
	_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_subtitle.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_subtitle.add_theme_font_size_override("font_size", 36)
	_subtitle.add_theme_color_override("font_color", Color(1.0, 0.93, 0.72))
	_subtitle.add_theme_color_override("font_outline_color", Color(0.015, 0.025, 0.018, 1.0))
	_subtitle.add_theme_constant_override("outline_size", 9)
	_subtitle.modulate.a = 0.0
	_subtitle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_subtitle)

	_skip_label = Label.new()
	_skip_label.name = "SkipHint"
	_skip_label.anchor_left = 0.72
	_skip_label.anchor_top = 0.92
	_skip_label.anchor_right = 0.97
	_skip_label.anchor_bottom = 0.98
	_skip_label.text = "SPACE / CLICK TO SKIP"
	_skip_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_skip_label.add_theme_font_size_override("font_size", 13)
	_skip_label.add_theme_color_override("font_color", Color(0.75, 0.79, 0.70, 0.72))
	_skip_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_skip_label)


func _build_menu() -> void:
	_main_menu = RoughCutMainMenu.new()
	_main_menu.name = "MainMenu"
	_main_menu.visible = false
	_main_menu.begin_requested.connect(_begin_round)
	_main_menu.replay_requested.connect(_replay_intro)
	add_child(_main_menu)


func _build_procedural_audio() -> void:
	var generator := AudioStreamGenerator.new()
	generator.mix_rate = MIX_RATE
	generator.buffer_length = 0.35

	_audio_player = AudioStreamPlayer.new()
	_audio_player.name = "ProceduralMowerAudio"
	_audio_player.stream = generator
	_audio_player.volume_db = -8.0
	add_child(_audio_player)
	_audio_player.play()
	_audio_playback = _audio_player.get_stream_playback() as AudioStreamGeneratorPlayback
	_fill_audio_buffer()


func _update_cutscene() -> void:
	var fade_in := clampf(_elapsed / 0.85, 0.0, 1.0)
	_scene_image.modulate = Color(0.72, 0.78, 0.69, fade_in)

	var raw_cut := inverse_lerp(CUT_START, CUT_END, _elapsed)
	_grass_curtain.cut_progress = clampf(raw_cut, 0.0, 1.0)
	_grass_curtain.spark_strength = _window_envelope(_elapsed, CUT_START + 0.2, CUT_END, 0.2)
	_grass_curtain.wind_time = _elapsed

	var shake_strength := 0.0
	if _elapsed >= CUT_START and _elapsed <= CUT_END:
		shake_strength = 2.5 + _grass_curtain.spark_strength * 2.0
	elif _elapsed >= LINE_START and _elapsed <= LINE_END:
		shake_strength = 1.4

	if _main_menu.reduced_motion_enabled():
		shake_strength = 0.0

	var shake := Vector2(
		_random.randf_range(-shake_strength, shake_strength),
		_random.randf_range(-shake_strength, shake_strength)
	)
	_image_stage.position = shake.round()

	var line_progress := clampf(inverse_lerp(LINE_START, LINE_END, _elapsed), 0.0, 1.0)
	var lean_curve := sin(line_progress * PI)
	var target_scale := 1.0 + lean_curve * 0.045
	if _main_menu.reduced_motion_enabled():
		target_scale = 1.0
	_image_stage.scale = Vector2.ONE * target_scale
	_image_stage.rotation = sin(_elapsed * 9.0) * 0.006 * lean_curve

	var subtitle_alpha := _window_envelope(_elapsed, LINE_START, LINE_END, 0.18)
	var head_alpha := _window_envelope(_elapsed, LINE_START - 0.12, LINE_END + 0.08, 0.16)
	var head_jolt := 0.0
	if line_progress > 0.38 and line_progress < 0.48:
		head_jolt = -4.0
	elif line_progress >= 0.48 and line_progress < 0.58:
		head_jolt = 5.0
	var head_motion_scale := 0.0 if _main_menu.reduced_motion_enabled() else 1.0
	_head_layer.position = (
		_head_base_position
		+ Vector2(
			sin(_elapsed * 18.0) * 2.0 + head_jolt,
			cos(_elapsed * 13.0) * 1.5
		) * head_motion_scale * lean_curve
	)
	_head_layer.rotation = (
		(sin(_elapsed * 16.0) * 0.012 + deg_to_rad(head_jolt * 0.35))
		* head_motion_scale
		* lean_curve
	)
	_head_layer.modulate.a = head_alpha
	_subtitle.modulate.a = subtitle_alpha if _main_menu.subtitles_enabled() else 0.0
	_subtitle.scale = Vector2.ONE * (0.94 + 0.06 * clampf(line_progress * 3.0, 0.0, 1.0))

	var flash_alpha := _window_envelope(_elapsed, 6.9, 7.45, 0.08) * 0.42
	_flash.color.a = flash_alpha

	if _elapsed >= MENU_TIME:
		_finish_intro()


func _update_menu_ambience(delta: float) -> void:
	_grass_curtain.wind_time += delta * 0.38
	if _main_menu.reduced_motion_enabled():
		_image_stage.position = Vector2.ZERO
		_head_layer.modulate.a = 0.0
		_head_layer.position = _head_base_position
		_head_layer.rotation = 0.0
		return
	var drift := Vector2(sin(_elapsed * 0.21), cos(_elapsed * 0.17)) * 1.5
	_image_stage.position = drift.round()
	var twitch := pow(maxf(0.0, sin(_elapsed * 0.71)), 18.0)
	_head_layer.modulate.a = twitch * 0.82
	_head_layer.position = _head_base_position + Vector2(
		sin(_elapsed * 19.0) * 3.0,
		cos(_elapsed * 14.0) * 2.0
	) * twitch
	_head_layer.rotation = sin(_elapsed * 17.0) * 0.018 * twitch


func _finish_intro() -> void:
	if _intro_finished:
		return
	_intro_finished = true
	_elapsed = MENU_TIME
	_grass_curtain.cut_progress = 1.0
	_grass_curtain.spark_strength = 0.0
	_image_stage.position = Vector2.ZERO
	_image_stage.rotation = 0.0
	_image_stage.scale = Vector2.ONE
	_scene_image.modulate = Color(0.72, 0.78, 0.69, 1.0)
	_head_layer.modulate.a = 0.0
	_head_layer.position = _head_base_position
	_head_layer.rotation = 0.0
	_subtitle.modulate.a = 0.0
	_skip_label.visible = false
	_flash.color.a = 0.0
	_main_menu.reveal()


func _replay_intro() -> void:
	_intro_finished = false
	_elapsed = 0.0
	_audio_sample_clock = 0
	_main_menu.visible = false
	_skip_label.visible = true
	_scene_image.modulate.a = 0.0
	_head_layer.modulate.a = 0.0
	_grass_curtain.cut_progress = 0.0
	_grass_curtain.spark_strength = 0.0
	_subtitle.modulate.a = 0.0


func _begin_round() -> void:
	get_tree().change_scene_to_file(FIRST_HOLE_SCENE)


func _on_viewport_resized() -> void:
	_image_stage.pivot_offset = size * 0.5
	_subtitle.pivot_offset = _subtitle.size * 0.5
	var texture_size := OPENING_TEXTURE.get_size()
	var cover_scale := maxf(size.x / texture_size.x, size.y / texture_size.y)
	var displayed_size := texture_size * cover_scale
	var image_origin := (size - displayed_size) * 0.5
	var head_region := Rect2(650.0, 55.0, 425.0, 435.0)
	_head_base_position = image_origin + head_region.position * cover_scale
	_head_layer.position = _head_base_position
	_head_layer.size = head_region.size * cover_scale
	_head_layer.pivot_offset = _head_layer.size * Vector2(0.5, 0.58)


func _fill_audio_buffer() -> void:
	if not is_instance_valid(_audio_playback):
		return

	var frames_available := _audio_playback.get_frames_available()
	for frame_index in range(frames_available):
		var sample_time := float(_audio_sample_clock) / MIX_RATE
		var sample := _sample_audio(sample_time)
		_audio_playback.push_frame(Vector2(sample, sample))
		_audio_sample_clock += 1


func _sample_audio(time: float) -> float:
	var sample := 0.0
	if time < 0.95:
		var sputter := 1.0 if sin(time * 29.0) * 0.5 + 0.5 >= 0.35 else 0.0
		sample = sin(TAU * 58.0 * time) * 0.035 * sputter
	elif time < CUT_END + 0.12:
		var throttle := 0.75 + sin(time * 5.4) * 0.16
		var motor := sin(TAU * 82.0 * time) + sin(TAU * 164.0 * time) * 0.34
		var cutter := sin(TAU * 287.0 * time) * 0.22
		var grit := _random.randf_range(-1.0, 1.0) * 0.16
		sample = (motor * 0.065 + cutter * 0.035 + grit * 0.025) * throttle
	elif time < LINE_START:
		sample = sin(TAU * 39.0 * time) * 0.012
	elif time < LINE_END:
		var pressure := sin(TAU * 43.0 * time) + sin(TAU * 61.0 * time) * 0.35
		sample = pressure * 0.015
	elif time < 7.55:
		var stinger_decay := 1.0 - inverse_lerp(LINE_END, 7.55, time)
		var stinger := sin(TAU * (54.0 + time * 8.0) * time)
		sample = stinger * stinger_decay * 0.12
	else:
		sample = (
			sin(TAU * 31.0 * time) * 0.009
			+ sin(TAU * 47.0 * time) * 0.004
			+ _random.randf_range(-1.0, 1.0) * 0.002
		)
	return clampf(sample, -0.32, 0.32)


func _window_envelope(
	value: float,
	start_time: float,
	end_time: float,
	fade_duration: float
) -> float:
	if value < start_time or value > end_time:
		return 0.0
	var fade_in := clampf((value - start_time) / fade_duration, 0.0, 1.0)
	var fade_out := clampf((end_time - value) / fade_duration, 0.0, 1.0)
	return minf(fade_in, fade_out)
