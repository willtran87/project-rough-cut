extends Control
## Atmospheric handoff from the title menu into the first playable-hole prototype.

var _elapsed: float = 0.0
var _overlay: ColorRect


func _ready() -> void:
	_build_interface()
	_overlay = ColorRect.new()
	_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.color = Color.BLACK
	_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_overlay)
	var fade := create_tween()
	fade.tween_property(_overlay, "color:a", 0.0, 1.25)
	queue_redraw()


func _process(delta: float) -> void:
	_elapsed += delta
	queue_redraw()


func _draw() -> void:
	var canvas_size := size
	for band_index in range(18):
		var band_height := canvas_size.y / 18.0
		var depth := float(band_index) / 17.0
		var color := Color(0.018 + depth * 0.015, 0.045 + depth * 0.045, 0.07 - depth * 0.02)
		draw_rect(Rect2(0.0, band_height * band_index, canvas_size.x, band_height + 1.0), color)

	var horizon := canvas_size.y * 0.43
	var fairway := PackedVector2Array(
		[
			Vector2(canvas_size.x * 0.45, horizon),
			Vector2(canvas_size.x * 0.57, horizon),
			Vector2(canvas_size.x * 0.82, canvas_size.y),
			Vector2(canvas_size.x * 0.16, canvas_size.y),
		]
	)
	draw_colored_polygon(fairway, Color(0.08, 0.20, 0.10))

	var rough_left := PackedVector2Array(
		[
			Vector2(0.0, horizon),
			Vector2(canvas_size.x * 0.45, horizon),
			Vector2(canvas_size.x * 0.16, canvas_size.y),
			Vector2(0.0, canvas_size.y),
		]
	)
	draw_colored_polygon(rough_left, Color(0.035, 0.12, 0.055))
	var rough_right := PackedVector2Array(
		[
			Vector2(canvas_size.x * 0.57, horizon),
			Vector2(canvas_size.x, horizon),
			Vector2(canvas_size.x, canvas_size.y),
			Vector2(canvas_size.x * 0.82, canvas_size.y),
		]
	)
	draw_colored_polygon(rough_right, Color(0.035, 0.12, 0.055))

	for index in range(90):
		var x := fposmod(float(index) * 89.0, canvas_size.x)
		var side_factor := absf(x / canvas_size.x - 0.5)
		if side_factor < 0.17:
			continue
		var base_y := horizon + fposmod(float(index) * 43.0, canvas_size.y - horizon)
		var height := 8.0 + fposmod(float(index) * 17.0, 25.0)
		var sway := sin(_elapsed * 1.2 + float(index)) * 3.0
		draw_line(
			Vector2(x, base_y),
			Vector2(x + sway, base_y - height),
			Color(0.18, 0.29, 0.10, 0.75),
			2.0
		)

	var lamp_position := Vector2(canvas_size.x * 0.70, horizon - 62.0)
	draw_line(lamp_position, lamp_position + Vector2(0.0, 65.0), Color(0.19, 0.20, 0.17), 4.0)
	draw_circle(lamp_position, 7.0, Color(1.0, 0.73, 0.28))
	draw_circle(lamp_position, 26.0, Color(1.0, 0.63, 0.20, 0.07))

	var fog_offset := sin(_elapsed * 0.18) * canvas_size.x * 0.025
	draw_rect(
		Rect2(fog_offset - 60.0, horizon - 18.0, canvas_size.x + 120.0, 54.0),
		Color(0.48, 0.57, 0.51, 0.075)
	)


func _build_interface() -> void:
	var heading := Label.new()
	heading.anchor_left = 0.06
	heading.anchor_top = 0.08
	heading.anchor_right = 0.55
	heading.anchor_bottom = 0.22
	heading.text = "HOLE 1 — THE PILOT"
	heading.add_theme_font_size_override("font_size", 42)
	heading.add_theme_color_override("font_color", Color(0.93, 0.92, 0.78))
	heading.add_theme_color_override("font_outline_color", Color(0.0, 0.0, 0.0, 0.9))
	heading.add_theme_constant_override("outline_size", 8)
	add_child(heading)

	var objective := Label.new()
	objective.anchor_left = 0.06
	objective.anchor_top = 0.20
	objective.anchor_right = 0.58
	objective.anchor_bottom = 0.38
	objective.text = "OBJECTIVE UPDATED\nReach the maintenance shed.\nDo not enter the rough."
	objective.add_theme_font_size_override("font_size", 21)
	objective.add_theme_color_override("font_color", Color(0.87, 0.63, 0.28))
	objective.add_theme_color_override("font_outline_color", Color(0.0, 0.0, 0.0, 0.9))
	objective.add_theme_constant_override("outline_size", 6)
	add_child(objective)

	var prototype_note := Label.new()
	prototype_note.anchor_left = 0.06
	prototype_note.anchor_top = 0.84
	prototype_note.anchor_right = 0.66
	prototype_note.anchor_bottom = 0.95
	prototype_note.text = "OPENING HANDOFF COMPLETE — FIRST-PERSON VERTICAL SLICE BEGINS HERE"
	prototype_note.add_theme_font_size_override("font_size", 14)
	prototype_note.add_theme_color_override("font_color", Color(0.66, 0.72, 0.62))
	add_child(prototype_note)

	var return_hint := Label.new()
	return_hint.anchor_left = 0.73
	return_hint.anchor_top = 0.91
	return_hint.anchor_right = 0.96
	return_hint.anchor_bottom = 0.97
	return_hint.text = "ESC — RETURN TO MENU"
	return_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	return_hint.add_theme_font_size_override("font_size", 13)
	return_hint.add_theme_color_override("font_color", Color(0.7, 0.74, 0.67))
	add_child(return_hint)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		get_tree().change_scene_to_file("res://cinematics/opening/opening.tscn")
		get_viewport().set_input_as_handled()

