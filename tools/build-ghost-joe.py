"""Bake a single-draw apparition with compact authored walk/idle morph poses."""
import bpy, pathlib, math, json
from mathutils import Vector, Quaternion
root = pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root / 'web/assets/models/joe-pixel-rig.glb'))
scene = bpy.context.scene
rig=bpy.data.objects['JoeRig']
rig.animation_data.use_nla=False
meshes = [o for o in bpy.data.objects['JoePixelModel'].children_recursive if o.type == 'MESH']
for obj in meshes:
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    # Simplify the bind mesh once, retaining weights and topology across poses.
    # An exported morph needs the same vertices in every sampled gait phase.
    if len(obj.data.polygons) > 100:
        dec = obj.modifiers.new('Apparition silhouette', 'DECIMATE')
        dec.ratio = .12 if 'face' in obj.name.lower() else .04
        dec.use_collapse_triangulate = True
        while obj.modifiers.find(dec.name)>0:
            bpy.ops.object.modifier_move_up(modifier=dec.name)
        bpy.ops.object.modifier_apply(modifier=dec.name)
def pose(action,phase):
    a=bpy.data.actions[action]
    rig.animation_data.action=a
    if a.slots: rig.animation_data.action_slot=a.slots[0]
    f=a.frame_range[0]+(a.frame_range[1]-a.frame_range[0])*phase
    scene.frame_set(int(f),subframe=f-int(f))
    bpy.context.view_layer.update()
pose('PlantedIdle',0)
deps=bpy.context.evaluated_depsgraph_get()
baked=[]
for obj in meshes:
    data=bpy.data.meshes.new_from_object(obj.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
    data.transform(obj.matrix_world)
    wheel=data.attributes.new(name='_ghost_wheel',type='FLOAT_VECTOR',domain='POINT')
    center=obj.matrix_world.translation
    # Custom attributes are not axis-converted by glTF. Store the runtime
    # coordinate system explicitly; center height is also the wheel radius.
    value=Vector((center.x,center.z,-center.y)) if obj.name.startswith('Wheel') else Vector((0,0,0))
    for entry in wheel.data: entry.vector=value
    target=bpy.data.objects.new(obj.name+'Ghost',data);scene.collection.objects.link(target)
    target.shape_key_add(name='Basis');baked.append(target)
samples=[('Walk'+str(i),'PushWalk',i/6) for i in range(6)]+[('IdleHigh','PlantedIdle',.25),('IdleLow','PlantedIdle',.75)]
for name,action,phase in samples:
    pose(action,phase)
    if action=='PlantedIdle':
        head=rig.pose.bones['Head']
        head.rotation_quaternion=head.rotation_quaternion@Quaternion((0,1,0),.10 if phase<.5 else -.10)
        bpy.context.view_layer.update()
    for source,target in zip(meshes,baked):
        evaluated=source.evaluated_get(deps);data=evaluated.to_mesh()
        key=target.shape_key_add(name=name)
        assert len(data.vertices)==len(key.data),'Morph topology changed'
        for v,k in zip(data.vertices,key.data):
            k.co=source.matrix_world@v.co
        evaluated.to_mesh_clear()
pose('PlantedIdle',0)
bpy.ops.object.select_all(action='DESELECT')
for obj in baked: obj.select_set(True)
bpy.context.view_layer.objects.active = baked[0]
bpy.ops.object.join()
ghost = bpy.context.object
ghost.name = 'GhostJoe'
ghost.animation_data_clear()
ghost.parent = None
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for obj in list(scene.objects):
    if obj != ghost: bpy.data.objects.remove(obj, do_unlink=True)
# Keep original UVs as the source for every existing material's texture node.
old_uv = ghost.data.uv_layers.active.name
for material in ghost.data.materials:
    if not material or not material.use_nodes: continue
    for node in list(material.node_tree.nodes):
        if node.type == 'TEX_IMAGE':
            uv = material.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map = old_uv
            material.node_tree.links.new(uv.outputs['UV'], node.inputs['Vector'])
ghost.data.uv_layers.new(name='GhostAtlas')
ghost.data.uv_layers.active_index = len(ghost.data.uv_layers)-1
ghost.data.uv_layers.active.active_render = True
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=.003)
bpy.ops.object.mode_set(mode='OBJECT')
atlas = bpy.data.images.new('GhostJoePixelAtlas', width=1024, height=1024, alpha=False)
for material in ghost.data.materials:
    if not material or not material.use_nodes: continue
    node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=atlas
    material.node_tree.nodes.active=node
scene.render.engine='CYCLES';scene.cycles.samples=1
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False
scene.render.bake.use_pass_color=True;scene.render.bake.margin=3
bpy.ops.object.bake(type='DIFFUSE')
atlas.pack()
material=bpy.data.materials.new('SpectralPixelJoe');material.use_nodes=True
nodes=material.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=atlas;tex.interpolation='Closest'
material.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
ghost.data.materials.clear();ghost.data.materials.append(material)
for polygon in ghost.data.polygons: polygon.material_index=0
ghost.data.uv_layers.remove(ghost.data.uv_layers.get(old_uv))
out=root/'web/assets/models/ghost-joe.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_animations=False,export_skins=False,export_materials='EXPORT',export_morph=True,export_morph_normal=False,export_attributes=True)
report={'triangles':sum(len(p.vertices)-2 for p in ghost.data.polygons),'bytes':out.stat().st_size,'atlas':[1024,1024],'meshes':1,'poses':[s[0] for s in samples],'source':'joe-pixel-rig.glb'}
report_dir=root/'output/ghost-motion-20261107';report_dir.mkdir(parents=True,exist_ok=True)
(report_dir/'ghost-build.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
