class_name RoughCutMainMenu
extends Control
## Functional title menu revealed at the end of the opening cutscene.

signal begin_requested
signal replay_requested

var _first_button: Button
var _settings_panel: PanelContainer
var _status_label: Label
var _subtitles_enabled: bool = true
var _reduced_motion_enabled: bool = false


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_PASS
	_build_backdrop()
	_build_primary_menu()
	_build_settings_panel()


func reveal() -> void:
	visible = true
	modulate.a = 0.0
	var reveal_tween := create_tween()
	reveal_tween.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	reveal_tween.tween_property(self, "modulate:a", 1.0, 0.75)
	reveal_tween.tween_callback(_focus_first_button)


func subtitles_enabled() -> bool:
	return _subtitles_enabled


func reduced_motion_enabled() -> bool:
	return _reduced_motion_enabled


func _build_backdrop() -> void:
	var shade := ColorRect.new()
	shade.name = "MenuShade"
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.color = Color(0.0, 0.018, 0.008, 0.22)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(shade)


func _build_primary_menu() -> void:
	var menu_panel := PanelContainer.new()
	menu_panel.name = "PrimaryMenu"
	menu_panel.anchor_left = 0.055
	menu_panel.anchor_top = 0.05
	menu_panel.anchor_right = 0.41
	menu_panel.anchor_bottom = 0.95
	menu_panel.add_theme_stylebox_override(
		"panel",
		_make_panel_style(Color(0.015, 0.04, 0.025, 0.88), Color(0.28, 0.43, 0.20, 0.72), 2)
	)
	add_child(menu_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 30)
	margin.add_theme_constant_override("margin_top", 26)
	margin.add_theme_constant_override("margin_right", 30)
	margin.add_theme_constant_override("margin_bottom", 24)
	menu_panel.add_child(margin)

	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 9)
	margin.add_child(stack)

	var eyebrow := Label.new()
	eyebrow.text = "A JOE HORROR GAME"
	eyebrow.add_theme_font_size_override("font_size", 15)
	eyebrow.add_theme_color_override("font_color", Color(0.72, 0.79, 0.57))
	stack.add_child(eyebrow)

	var title := Label.new()
	title.text = "ROUGH CUT"
	title.add_theme_font_size_override("font_size", 56)
	title.add_theme_color_override("font_color", Color(0.92, 0.94, 0.83))
	title.add_theme_color_override("font_shadow_color", Color(0.0, 0.0, 0.0, 0.95))
	title.add_theme_constant_override("shadow_offset_x", 5)
	title.add_theme_constant_override("shadow_offset_y", 5)
	stack.add_child(title)

	var tagline := Label.new()
	tagline.text = "THE COURSE CLOSES AT DUSK.\nJOE DOES NOT."
	tagline.add_theme_font_size_override("font_size", 16)
	tagline.add_theme_color_override("font_color", Color(0.94, 0.57, 0.26))
	stack.add_child(tagline)

	var spacer := Control.new()
	spacer.custom_minimum_size.y = 12.0
	stack.add_child(spacer)

	_first_button = _add_menu_button(stack, "BEGIN THE ROUND")
	_first_button.pressed.connect(func() -> void: begin_requested.emit())

	var settings_button := _add_menu_button(stack, "ACCEPTANCE CRITERIA")
	settings_button.pressed.connect(_show_settings)

	var claim_button := _add_menu_button(stack, "FILE A CLAIM")
	claim_button.pressed.connect(_show_claim_message)

	var replay_button := _add_menu_button(stack, "REPLAY INCIDENT")
	replay_button.pressed.connect(func() -> void: replay_requested.emit())

	var quit_button := _add_menu_button(stack, "CLOCK OUT")
	quit_button.pressed.connect(func() -> void: get_tree().quit())

	_status_label = Label.new()
	_status_label.text = "Every blade is in scope."
	_status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_status_label.add_theme_font_size_override("font_size", 13)
	_status_label.add_theme_color_override("font_color", Color(0.67, 0.72, 0.64))
	_status_label.custom_minimum_size.y = 42.0
	stack.add_child(_status_label)


func _build_settings_panel() -> void:
	_settings_panel = PanelContainer.new()
	_settings_panel.name = "SettingsPanel"
	_settings_panel.anchor_left = 0.5
	_settings_panel.anchor_top = 0.5
	_settings_panel.anchor_right = 0.5
	_settings_panel.anchor_bottom = 0.5
	_settings_panel.offset_left = -260.0
	_settings_panel.offset_top = -205.0
	_settings_panel.offset_right = 260.0
	_settings_panel.offset_bottom = 205.0
	_settings_panel.add_theme_stylebox_override(
		"panel",
		_make_panel_style(Color(0.018, 0.035, 0.024, 0.98), Color(0.74, 0.39, 0.13), 3)
	)
	_settings_panel.visible = false
	add_child(_settings_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 32)
	margin.add_theme_constant_override("margin_top", 28)
	margin.add_theme_constant_override("margin_right", 32)
	margin.add_theme_constant_override("margin_bottom", 28)
	_settings_panel.add_child(margin)

	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 14)
	margin.add_child(stack)

	var heading := Label.new()
	heading.text = "ACCEPTANCE CRITERIA"
	heading.add_theme_font_size_override("font_size", 30)
	heading.add_theme_color_override("font_color", Color(0.94, 0.91, 0.77))
	stack.add_child(heading)

	var volume_label := Label.new()
	volume_label.text = "JOE VOLUME"
	stack.add_child(volume_label)

	var volume_slider := HSlider.new()
	volume_slider.min_value = 0.0
	volume_slider.max_value = 1.0
	volume_slider.step = 0.01
	volume_slider.value = 0.72
	volume_slider.value_changed.connect(_on_volume_changed)
	stack.add_child(volume_slider)

	var subtitles_toggle := CheckButton.new()
	subtitles_toggle.text = "SUBTITLES"
	subtitles_toggle.button_pressed = _subtitles_enabled
	subtitles_toggle.toggled.connect(_on_subtitles_toggled)
	stack.add_child(subtitles_toggle)

	var motion_toggle := CheckButton.new()
	motion_toggle.text = "REDUCED CAMERA MOTION"
	motion_toggle.button_pressed = _reduced_motion_enabled
	motion_toggle.toggled.connect(_on_motion_toggled)
	stack.add_child(motion_toggle)

	var note := Label.new()
	note.text = "Settings are currently session-only."
	note.add_theme_color_override("font_color", Color(0.63, 0.68, 0.61))
	stack.add_child(note)

	var back_button := _add_menu_button(stack, "RETURN TO COURSE")
	back_button.pressed.connect(_hide_settings)


func _add_menu_button(parent: VBoxContainer, label_text: String) -> Button:
	var button := Button.new()
	button.text = label_text
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.custom_minimum_size = Vector2(0.0, 46.0)
	button.add_theme_font_size_override("font_size", 17)
	button.add_theme_color_override("font_color", Color(0.87, 0.9, 0.78))
	button.add_theme_color_override("font_hover_color", Color(1.0, 0.73, 0.34))
	button.add_theme_color_override("font_focus_color", Color(1.0, 0.73, 0.34))
	button.add_theme_stylebox_override(
		"normal",
		_make_panel_style(Color(0.035, 0.075, 0.045, 0.88), Color(0.15, 0.25, 0.14, 0.9), 1)
	)
	button.add_theme_stylebox_override(
		"hover",
		_make_panel_style(Color(0.10, 0.14, 0.055, 0.96), Color(0.93, 0.45, 0.12, 1.0), 2)
	)
	button.add_theme_stylebox_override(
		"focus",
		_make_panel_style(Color(0.10, 0.14, 0.055, 0.96), Color(0.93, 0.45, 0.12, 1.0), 2)
	)
	button.mouse_entered.connect(func() -> void: button.grab_focus())
	parent.add_child(button)
	return button


func _make_panel_style(fill: Color, border: Color, width: int) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = border
	style.border_width_left = width
	style.border_width_top = width
	style.border_width_right = width
	style.border_width_bottom = width
	style.corner_radius_top_left = 3
	style.corner_radius_top_right = 3
	style.corner_radius_bottom_left = 3
	style.corner_radius_bottom_right = 3
	style.content_margin_left = 14.0
	style.content_margin_right = 14.0
	return style


func _focus_first_button() -> void:
	if is_instance_valid(_first_button):
		_first_button.grab_focus()


func _show_settings() -> void:
	_settings_panel.visible = true
	var focus_target := _settings_panel.find_children("*", "CheckButton", true, false)
	if not focus_target.is_empty():
		(focus_target[0] as CheckButton).grab_focus()


func _hide_settings() -> void:
	_settings_panel.visible = false
	_focus_first_button()


func _show_claim_message() -> void:
	_status_label.text = "COVERAGE DENIED: unauthorized presence in the rough."


func _on_volume_changed(value: float) -> void:
	var master_index := AudioServer.get_bus_index("Master")
	var safe_value := maxf(value, 0.0001)
	AudioServer.set_bus_volume_db(master_index, linear_to_db(safe_value))
	AudioServer.set_bus_mute(master_index, value <= 0.0001)


func _on_subtitles_toggled(enabled: bool) -> void:
	_subtitles_enabled = enabled


func _on_motion_toggled(enabled: bool) -> void:
	_reduced_motion_enabled = enabled


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		if _settings_panel.visible:
			_hide_settings()
		else:
			_show_claim_message()
		get_viewport().set_input_as_handled()
