class_name RoughCutGrassCurtain
extends Control
## Procedural pixel-grass mask used to reveal Joe's opening key art.

@export_range(0.0, 1.0, 0.001) var cut_progress: float = 0.0:
	set(value):
		cut_progress = clampf(value, 0.0, 1.0)
		queue_redraw()

@export_range(0.0, 1.0, 0.001) var spark_strength: float = 0.0:
	set(value):
		spark_strength = clampf(value, 0.0, 1.0)
		queue_redraw()

var wind_time: float = 0.0:
	set(value):
		wind_time = value
		queue_redraw()


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	queue_redraw()


func _draw() -> void:
	var canvas_size := size
	if canvas_size.x <= 0.0 or canvas_size.y <= 0.0:
		return

	var eased_progress := _ease_in_out(cut_progress)
	var center := Vector2(canvas_size.x * 0.515, canvas_size.y * 0.49)
	var radius_x := canvas_size.x * 0.355 * eased_progress
	var radius_y := canvas_size.y * 0.39 * eased_progress
	var strip_width := maxf(4.0, floorf(canvas_size.x / 288.0))
	var strip_count := int(ceilf(canvas_size.x / strip_width))

	for index in range(strip_count):
		var x := float(index) * strip_width
		var shade := _noise01(index * 13)
		var strip_color := Color(
			0.025 + shade * 0.025,
			0.105 + shade * 0.08,
			0.065 + shade * 0.035,
			0.97
		)
		var hole_top := canvas_size.y
		var hole_bottom := canvas_size.y
		var normalized_x := 2.0

		if radius_x > 1.0:
			normalized_x = (x - center.x) / radius_x

		if absf(normalized_x) < 1.0:
			var ellipse_height := radius_y * sqrt(maxf(0.0, 1.0 - normalized_x * normalized_x))
			var ragged := (
				sin(float(index) * 1.91 + wind_time * 0.7) * 7.0
				+ sin(float(index) * 0.37) * 10.0
				+ (_noise01(index * 31) - 0.5) * 13.0
			)
			hole_top = clampf(center.y - ellipse_height + ragged, 0.0, canvas_size.y)
			hole_bottom = clampf(center.y + ellipse_height + ragged * 0.42, 0.0, canvas_size.y)
			draw_rect(Rect2(x, 0.0, strip_width + 1.0, hole_top), strip_color)
			draw_rect(
				Rect2(x, hole_bottom, strip_width + 1.0, canvas_size.y - hole_bottom),
				strip_color
			)
			_draw_cut_edge_blade(Vector2(x, hole_top), -1.0, index)
			_draw_cut_edge_blade(Vector2(x, hole_bottom), 1.0, index + 97)
		else:
			draw_rect(Rect2(x, 0.0, strip_width + 1.0, canvas_size.y), strip_color)

		_draw_background_blade(x, hole_top, hole_bottom, index, canvas_size)

	_draw_cutting_sparks(center, radius_x, radius_y)
	_draw_vignette(canvas_size)


func _draw_background_blade(
	x: float,
	hole_top: float,
	hole_bottom: float,
	index: int,
	canvas_size: Vector2
) -> void:
	if index % 2 != 0:
		return

	var blade_height := canvas_size.y * (0.24 + _noise01(index * 17) * 0.42)
	var sway := sin(wind_time * 1.35 + float(index) * 0.43) * 8.0
	var blade_color := Color(0.12, 0.25 + _noise01(index) * 0.08, 0.10, 0.82)
	var bottom_start := Vector2(x, canvas_size.y)
	var bottom_end := Vector2(x + sway, canvas_size.y - blade_height)
	if bottom_end.y >= hole_bottom or hole_bottom >= canvas_size.y - 1.0:
		draw_line(bottom_start, bottom_end, blade_color, 2.0)

	var top_height := canvas_size.y * (0.14 + _noise01(index * 29) * 0.25)
	var top_start := Vector2(x, 0.0)
	var top_end := Vector2(x - sway * 0.7, top_height)
	if top_end.y <= hole_top or hole_top >= canvas_size.y - 1.0:
		draw_line(top_start, top_end, blade_color.darkened(0.08), 2.0)


func _draw_cut_edge_blade(origin: Vector2, direction: float, index: int) -> void:
	if cut_progress < 0.02 or index % 2 != 0:
		return

	var length := 8.0 + _noise01(index * 41) * 20.0
	var lean := sin(float(index) * 0.71 + wind_time * 2.0) * 7.0
	var endpoint := origin + Vector2(lean, direction * length)
	var color := Color(0.25, 0.39, 0.12, 0.92)
	draw_line(origin, endpoint, color, 2.0)


func _draw_cutting_sparks(center: Vector2, radius_x: float, radius_y: float) -> void:
	if spark_strength <= 0.01:
		return

	var cutter_position := Vector2(
		center.x - radius_x * 0.45 + sin(wind_time * 7.0) * 8.0,
		center.y + radius_y * 0.88
	)
	for index in range(26):
		var angle := -PI * 0.9 + _noise01(index * 53) * PI * 0.8
		var distance := (12.0 + _noise01(index * 71) * 54.0) * spark_strength
		var start := cutter_position + Vector2(
			_noise01(index * 11) * 12.0,
			_noise01(index * 19) * 7.0
		)
		var endpoint := start + Vector2.from_angle(angle) * distance
		var spark_color := Color(1.0, 0.25 + _noise01(index) * 0.35, 0.04, spark_strength)
		draw_line(start, endpoint, spark_color, 2.0)
		draw_circle(endpoint, 1.5, spark_color)


func _draw_vignette(canvas_size: Vector2) -> void:
	var band := maxf(18.0, canvas_size.x * 0.025)
	for index in range(6):
		var alpha := 0.055 + float(index) * 0.022
		var inset := float(index) * band
		var color := Color(0.0, 0.0, 0.0, alpha)
		draw_rect(Rect2(inset, inset, canvas_size.x - inset * 2.0, band), color)
		draw_rect(
			Rect2(inset, canvas_size.y - inset - band, canvas_size.x - inset * 2.0, band),
			color
		)
		draw_rect(Rect2(inset, inset, band, canvas_size.y - inset * 2.0), color)
		draw_rect(
			Rect2(canvas_size.x - inset - band, inset, band, canvas_size.y - inset * 2.0),
			color
		)


func _ease_in_out(value: float) -> float:
	return value * value * (3.0 - 2.0 * value)


func _noise01(value: int) -> float:
	return fposmod(sin(float(value) * 12.9898) * 43758.5453, 1.0)

