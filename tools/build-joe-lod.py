"""Build a distant real-mesh LOD; preserve the original close-up GLB untouched."""
import bpy, pathlib, json
root = pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root / 'web/assets/models/joe-pixel-rig.glb'))
before = after = 0
for obj in list(bpy.context.scene.objects):
    if obj.type != 'MESH':
        continue
    before += sum(len(p.vertices)-2 for p in obj.data.polygons)
    if len(obj.data.polygons) > 120:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        dec = obj.modifiers.new('Distant silhouette', 'DECIMATE')
        dec.ratio = .16 if 'face' not in obj.name.lower() else .30
        dec.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier=dec.name)
        obj.select_set(False)
    after += sum(len(p.vertices)-2 for p in obj.data.polygons)
# Runtime reuses the original materials and textures. Keep material slots for
# primitive/name matching, but do not package and decode the same images twice.
for material in bpy.data.materials:
    if material.node_tree:
        for node in list(material.node_tree.nodes):
            if node.type == 'TEX_IMAGE':
                material.node_tree.nodes.remove(node)
bpy.ops.export_scene.gltf(filepath=str(root / 'web/assets/models/joe-pixel-rig-lod.glb'), export_format='GLB', export_animations=True, export_skins=True)
report={'originalTriangles':before,'lodTriangles':after,'ratio':after/before,'source':'joe-pixel-rig.glb','output':'joe-pixel-rig-lod.glb','purpose':'Distance LOD only; original mesh, materials and animations remain available nearby.'}
(root / 'output/gameplay-intelligence/joe-lod.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
