"""Editable Joe / push mower, generated material atlases, skinned distance-driven gait.
Run with Blender --background --python tools/build-joe-model.py.
Coordinates: Blender Z up, +Y forward. Export converts to Three Y up, -Z forward.
"""
import bpy, bmesh, math, json, os
from mathutils import Vector, Matrix
from pathlib import Path
P=Path(__file__).resolve().parents[1]
OUT=P/'assets/enemies/joe-hd/model'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.fps=30
model=bpy.data.objects.new('JoePixelModel',None);scene.collection.objects.link(model)
images=[bpy.data.images.load(str(OUT/(n+'.png'))) for n in ['face-albedo-v2','skin','wool-fine-v1','trousers','red','engine','leather','hair']]
for im in images: im.pack()
mats={}
def mat(name,color=(1,1,1),tile=None,atlas=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.94
    if tile is not None:
        tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=images[atlas*4+tile];tex.interpolation='Closest'
        m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    m['tile']=tile if tile is not None else -1
    mats[name]=m
    return m
mat('Face',tile=0);mat('Skin',tile=1);mat('Sweater',(.66,.69,.72),tile=2);mat('Trousers',tile=3)
mat('RedEnamel',tile=0,atlas=1);mat('Engine',tile=1,atlas=1);mat('Leather',tile=2,atlas=1);mat('Hair',tile=3,atlas=1)
mat('Collar',tile=3);mat('CollarEdge',(.065,.10,.16));mat('Steel',(.075,.085,.078));mat('Rubber',(.025,.029,.026));mat('Seam',(.09,.10,.095));mat('Brass',(.22,.18,.095))
skin_objects=[];static_objects=[];wheel_objects={};bone_defs={}
def uv_tile(u,v,m):
    tile=int(m.get('tile',-1))
    if tile<0:return (u,v)
    return (u,v)
def finish(obj,material,bone=None,wheel=None,uvs=None,wrap_u=None):
    obj.parent=model;obj.data.materials.append(mats[material])
    for p in obj.data.polygons:p.use_smooth=True
    native_skin_uv=[tuple(item.uv) for item in obj.data.uv_layers.active.data] if material=='Skin' and obj.data.uv_layers else None
    if not obj.data.uv_layers:obj.data.uv_layers.new()
    uv=obj.data.uv_layers.active.data
    for p in obj.data.polygons:
        seam=False
        if uvs is not None and wrap_u and len(p.vertices)==4:
            us=[uvs[vi][0] for vi in p.vertices];seam=max(us)-min(us)>wrap_u*.5
        for li in p.loop_indices:
            vi=obj.data.loops[li].vertex_index;co=obj.data.vertices[vi].co
            if uvs is not None:
                u,v=uvs[vi]
                if seam and u<wrap_u*.5:u+=wrap_u
            elif native_skin_uv:
                u,v=native_skin_uv[li];u=.25+u*.35;v=.25+v*.35
            else:
                n=p.normal;axes=sorted(range(3),key=lambda a:abs(n[a]))[:2]
                u=(co[axes[0]]/.24)%1;v=(co[axes[1]]/.24)%1
            uv[li].uv=uv_tile(u,v,mats[material])
    if bone:
        obj.vertex_groups.new(name=bone).add(list(range(len(obj.data.vertices))),1,'REPLACE');skin_objects.append(obj)
    elif wheel:wheel_objects.setdefault(wheel,[]).append(obj)
    else:static_objects.append(obj)
    return obj
def mesh(name,vs,fs,material,bone=None,uvs=None,wrap_u=None):
    d=bpy.data.meshes.new(name);d.from_pydata(vs,[],fs);d.update();o=bpy.data.objects.new(name,d);scene.collection.objects.link(o)
    return finish(o,material,bone,uvs=uvs,wrap_u=wrap_u)
def box(name,loc,size,material,bone=None,bevel=.015,wheel=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft constructed edges','BEVEL');mod.width=min(bevel,min(size)*.28);mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,material,bone,wheel)
def ellipsoid(name,loc,scale,material,bone=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,material,bone)
def cyl(name,a,b,r,material,bone=None,wheel=None,r2=None):
    a,b=Vector(a),Vector(b);d=b-a
    bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=r,radius2=r if r2 is None else r2,depth=d.length,location=(a+b)/2)
    o=bpy.context.object;o.name=name;o.rotation_mode='QUATERNION';o.rotation_quaternion=d.to_track_quat('Z','Y')
    return finish(o,material,bone,wheel)
def tube(name,points,r,material,bone=None):
    # Polyline rods / piping with rounded joints remain actual geometry.
    for i,(a,b) in enumerate(zip(points,points[1:])):cyl(name+str(i),a,b,r,material,bone)

def finger(name,points,radii,bone):
    # Continuous tapered fingers: Catmull-Rom centerline, rounded cross sections,
    # and a closed fingertip instead of intersecting constant-radius rods.
    points=[Vector(p) for p in points];centers=[];sizes=[];vs=[];fs=[];uv=[]
    for segment in range(len(points)-1):
        a=points[max(0,segment-1)];b=points[segment];c=points[segment+1];d=points[min(len(points)-1,segment+2)]
        for k in range(7):
            t=k/7
            centers.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
            sizes.append(radii[segment]*(1-t)+radii[segment+1]*t)
    centers.append(points[-1]);sizes.append(radii[-1]);N=12
    for k,(center,radius) in enumerate(zip(centers,sizes)):
        tangent=(centers[min(k+1,len(centers)-1)]-centers[max(0,k-1)]).normalized()
        x=Vector((1,0,0));x=(x-tangent*x.dot(tangent)).normalized();y=tangent.cross(x).normalized()
        for j in range(N):
            a=j/N*math.tau;vs.append(center+radius*(x*math.cos(a)+y*math.sin(a)));uv.append((.3+j/N*.2,.3+k/(len(centers)-1)*.2))
            if k:fs.append(((k-1)*N+j,(k-1)*N+(j+1)%N,k*N+(j+1)%N,k*N+j))
    fs.extend([tuple(reversed(range(N))),tuple((len(centers)-1)*N+j for j in range(N))])
    return mesh(name,vs,fs,'Skin',bone,uv)
def rings(name,rows,material,bone,segments=32):
    vs=[];uv=[];fs=[]
    for j,(z,cx,cy,rx,ry) in enumerate(rows):
        for i in range(segments):
            a=2*math.pi*i/segments+math.pi;vs.append((cx+rx*math.sin(a),cy+ry*math.cos(a),z));uv.append((i/segments*3,j/(len(rows)-1)*2))
    for j in range(len(rows)-1):
        for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
    fs.extend([tuple(reversed(range(segments))),tuple((len(rows)-1)*segments+i for i in range(segments))])
    return mesh(name,vs,fs,material,bone,uv,3)
def bone(name,a,b,parent=None):bone_defs[name]=(Vector(a),Vector(b),parent)
bone('Root',(0,0,0),(0,0,.15))
bone('Hips',(0,-.38,.94),(0,-.38,1.04),'Root')
bone('Spine',(0,-.38,1.04),(0,-.31,1.38),'Hips')
bone('Chest',(0,-.31,1.38),(0,-.29,1.51),'Spine')
bone('Head',(0,-.29,1.51),(0,-.29,1.84),'Chest')
for sign,side in [(-1,'L'),(1,'R')]:
    bone('Thigh'+side,(sign*.11,-.38,.94),(sign*.11,-.365,.53),'Hips')
    bone('Shin'+side,(sign*.11,-.365,.53),(sign*.11,-.38,.12),'Thigh'+side)
    bone('Foot'+side,(sign*.11,-.38,.12),(sign*.11,-.19,.065),'Shin'+side)
    bone('UpperArm'+side,(sign*.215,-.29,1.44),(sign*.27,-.18,1.16),'Chest')
    bone('Forearm'+side,(sign*.27,-.18,1.16),(sign*.225,.10,1.07),'UpperArm'+side)
    bone('Hand'+side,(sign*.225,.10,1.07),(sign*.225,.17,1.065),'Forearm'+side)

# Anchored cuffs, gripping hands and shoes.
for s,side in [(-1,'L'),(1,'R')]:
    # The sleeve root overlaps the torso and is sewn into the unified shell.
    cyl('RibCuff'+side,(s*.225,.065,1.081),(s*.225,.106,1.069),.049,'Sweater','Forearm'+side)
    cyl('ShirtCuff'+side,(s*.225,.103,1.069),(s*.225,.121,1.065),.042,'Collar','Hand'+side)
    ellipsoid('Palm'+side,(s*.225,.145,1.067),(.040,.042,.022),'Skin','Hand'+side)
    for k in range(4):
        x=s*(.225+(k-1.5)*.017);length=[0,.004,.002,-.006][k]
        finger('Finger'+side+str(k),[(x,.143,1.078),(x,.168+length,1.078),(x,.183+length,1.059),(x,.182+length,1.040),(x,.167+length,1.033)],[.010,.0105,.009,.008,.003],'Hand'+side)
        ellipsoid('Knuckle'+side+str(k),(x,.158+length,1.082),(.010,.012,.008),'Skin','Hand'+side)
    finger('Thumb'+side,[(s*.202,.126,1.065),(s*.183,.144,1.062),(s*.177,.165,1.046),(s*.195,.173,1.034)],[.014,.013,.011,.004],'Hand'+side)
    # Lasted leather shoe with actual sole, heel, tongue and lace rows.
    foot='Foot'+side
    ellipsoid('ShoeUpper'+side,(s*.11,-.315,.077),(.066,.145,.065),'Leather',foot)
    ellipsoid('Sole'+side,(s*.11,-.31,.026),(.069,.152,.020),'Rubber',foot)
    box('Heel'+side,(s*.11,-.405,.038),(.12,.075,.046),'Rubber',foot,.008)
    for k in range(4):tube('Lace'+side+str(k),[(s*.11-.025,-.335+k*.022,.132-k*.003),(s*.11+.025,-.324+k*.022,.13-k*.003)],.003,'Seam',foot)

# Anatomical head topology from MakeHuman's CC0 core mesh, reshaped for Joe.
# The source and morph targets are retained with their license/provenance.
from mathutils.bvhtree import BVHTree
raw=[];raw_faces={};group=''
for line in (OUT/'anatomy/base.obj').read_text().splitlines():
    if line.startswith('v '):raw.append(Vector(map(float,line.split()[1:])))
    elif line.startswith('g '):group=line[2:]
    elif line.startswith('f '):raw_faces.setdefault(group,[]).append([int(x.split('/')[0])-1 for x in line.split()[1:]])
for filename,weight in [('caucasian-male-young.target',.82),('caucasian-male-old.target',.18),('head-rectangular.target',.28)]:
    for line in (OUT/'anatomy'/filename).read_text().splitlines():
        if not line or line.startswith('#'):continue
        values=line.split();raw[int(values[0])]+=Vector(map(float,values[1:]))*weight

# Fit connected clothing to the rig rest pose.
def smooth01(t):t=max(0,min(1,t));return t*t*(3-2*t)
def source_joint(name):
    ids={i for f in raw_faces[name] for i in f};p=sum((raw[i] for i in ids),Vector())/len(ids);return Vector((p.x,p.z,p.y))
def torso_point(p):
    rows=[(-1,.77),(1.2,.94),(2.4,1.04),(4.5,1.27),(5.7433,1.44),(6.79,1.51),(7.5,1.60)]
    lo,hi=next((a,b) for a,b in zip(rows,rows[1:]) if a[0]<=p.y<=b[0]);t=(p.y-lo[0])/(hi[0]-lo[0]);z=lo[1]*(1-t)+hi[1]*t
    cy=-.38+.09*smooth01((z-.99)/.45)
    return Vector((p.x*.119,cy+p.z*.11,z))
def mapped_segment(p,a,b,target_a,target_b,inflate):
    axis=b-a;t=max(0,min(1,(p-a).dot(axis)/axis.length_squared));center=a+axis*t
    radial=p-center;rot=axis.rotation_difference(target_b-target_a);scale=(target_b-target_a).length/axis.length
    v=target_a+rot@(p-a)*scale
    if radial.length>1e-5:v+=rot@radial.normalized()*inflate
    return v,t

def garment_point(p,kind):
    sign=1 if p.x>=0 else -1;side='R' if sign>0 else 'L';src='l' if sign>0 else 'r';q=Vector((p.x,p.z,p.y))
    if kind=='Sweater':
        body=torso_point(p);body.x*=1+.12*math.exp(-((body.z-1.10)/.14)**2);radial=Vector((body.x,body.y-(-.38+.09*smooth01((body.z-.99)/.45)),0))
        if radial.length>0:body+=radial.normalized()*.030
        # Wool hangs across the chest instead of tracing the pectorals. A broad
        # fabric envelope and restrained diagonal compression folds add slack.
        cy=-.38+.09*smooth01((body.z-.99)/.45)
        envelope=cy+.180*math.sqrt(max(0,1-(body.x/.245)**2))
        drape=smooth01((body.y-cy)/.08)*smooth01((body.z-.97)/.09)*(1-smooth01((body.z-1.38)/.10))
        body.y=body.y*(1-drape*.85)+envelope*drape*.85
        a=source_joint('joint-'+src+'-shoulder');b=source_joint('joint-'+src+'-elbow');c=source_joint('joint-'+src+'-hand')
        ta,tb,_=bone_defs['UpperArm'+side];_,tc,_=bone_defs['Forearm'+side]
        up,t1=mapped_segment(q,a,b,ta,tb,.021);low,t2=mapped_segment(q,b,c,tb,tc,.024)
        lower=smooth01((q-b).dot((c-a).normalized())/.75+.5);arm=up.lerp(low,lower)
        # Compression gathers follow the bent elbow, not horizontal body rings.
        gather=math.exp(-((lower-.50)/.24)**2)*.0015*math.sin(lower*23)
        arm.y+=gather;arm.z+=gather*.45
        armWeight=smooth01((abs(p.x)-1.35)/1.00);pos=body.lerp(arm,armWeight)
        weights={'Spine':1-armWeight,'UpperArm'+side:armWeight*(1-lower),'Forearm'+side:armWeight*lower}
    else:
        a=source_joint('joint-'+src+'-upper-leg');b=source_joint('joint-'+src+'-knee');c=source_joint('joint-'+src+'-ankle')
        ta,tb,_=bone_defs['Thigh'+side];_,tc,_=bone_defs['Shin'+side]
        up,t1=mapped_segment(q,a,b,ta,tb,.019);low,t2=mapped_segment(q,b,c,tb,tc,.014)
        lower=smooth01((q-b).dot((c-a).normalized())/1.2+.5);pos=up.lerp(low,lower)
        hip=smooth01((p.y-.2)/1.3);body=Vector((p.x*.12,-.38+p.z*.11,.94+(p.y-1.06)*.105))
        pos=pos.lerp(body,hip);weights={'Hips':hip,'Thigh'+side:(1-hip)*(1-lower),'Shin'+side:(1-hip)*lower}
        pos.y+=.007*math.sin(pos.z*76+pos.x*17)*(math.exp(-((pos.z-.53)/.14)**2)+math.exp(-((pos.z-.20)/.10)**2))
    return pos,weights
for kind in ['Sweater','Trousers']:
    faces=[]
    for face in raw_faces['helper-tights']:
        pts=[raw[i] for i in face]
        if kind=='Sweater':
            keep=all(1.35<=p.y<=7.0 and abs(p.x)<4.85 for p in pts)
        else:keep=all(-7.35<=p.y<=1.65 for p in pts)
        if keep:faces.append(face)
    ids=sorted({i for f in faces for i in f});lookup={v:i for i,v in enumerate(ids)}
    shaped=[garment_point(raw[i],kind) for i in ids]
    if kind=='Sweater':
        for pos,w in shaped:pos.z=min(pos.z,1.515)
    o=mesh('Tailored'+kind,[p for p,w in shaped],[[lookup[i] for i in f] for f in faces],kind)
    static_objects.remove(o);skin_objects.append(o)
    for name in bone_defs:o.vertex_groups.new(name=name)
    for i,(pos,w) in enumerate(shaped):
        for name,value in w.items():
            if value>0:o.vertex_groups[name].add([i],value,'REPLACE')
    bpy.context.view_layer.objects.active=o
    mod=o.modifiers.new('Tailored cloth surface','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
    # Wool compresses in broad, uneven patches. Localize each fold so neither
    # the torso nor the bent sleeves acquire continuous molded ridges.
    for vertex in o.data.vertices:
        p=vertex.co.copy();delta=Vector();x,y,z=p
        if kind=='Sweater':
            cy=-.38+.09*smooth01((z-.99)/.45)
            front=smooth01((y-cy)/.085)*(1-smooth01((abs(x)-.16)/.07))
            for height,slope,amplitude,width,origin,spread in [(1.045,.19,.014,.030,-.065,.22),(1.13,-.24,.017,.034,.055,.24),(1.215,.15,.009,.040,-.08,.20)]:
                center=height+slope*x+.028*(x/.23)**2
                d=z-center
                taper=math.exp(-((x-origin)/spread)**2)
                delta.y+=front*taper*(amplitude*math.exp(-(d/width)**2)-amplitude*.23*math.exp(-((d-.038)/.025)**2))
            sign=1 if x>=0 else -1;side='R' if sign>0 else 'L'
            armWeight=smooth01((abs(x)-.16)/.065)
            for boneName,ridgeCenters in [('UpperArm'+side,[.70,.91]),('Forearm'+side,[.14,.36])]:
                a,b,_=bone_defs[boneName];axis=b-a;t=(p-a).dot(axis)/axis.length_squared
                center=a+axis*t;radial=p-center
                if radial.length and -.05<t<1.05:
                    radial.normalize();fold=0
                    # Inner elbow compression fades across the outer arm;
                    # stagger left/right gathering to avoid mirrored rings.
                    compression=.28+.72*smooth01((radial.y+.30)/1.05)
                    for k,c in enumerate(ridgeCenters):
                        d=t-c-.15*radial.x*sign-.024*sign
                        fold+=(.008 if k%2 else .010)*math.exp(-(d/.105)**2)-.002*math.exp(-((d-.13)/.075)**2)
                    delta+=radial*fold*armWeight*compression
            # Roll the sleeve cap into a sloping shoulder instead of a pad.
            shoulder=math.exp(-((abs(x)-.225)/.105)**2)*math.exp(-((z-1.46)/.075)**2)
            delta.z-=.032*shoulder;delta.x-=sign*.008*shoulder
        else:
            sign=1 if x>=0 else -1
            for height,amplitude in [(.23,.008),(.49,.008),(.57,.006)]:
                center=height+sign*x*.12
                delta.y+=amplitude*math.exp(-((z-center)/.022)**2)*smooth01((y+.40)/.06)
        vertex.co+=delta
    if kind=='Sweater':
        # Tailor each sleeve opening perpendicular to the forearm and into its cuff.
        bm=bmesh.new();bm.from_mesh(o.data)
        for v in bm.verts:
            if v.is_boundary and v.co.z>1.47 and abs(v.co.x)<.15:
                a=math.atan2(v.co.x,v.co.y+.29)
                v.co=Vector((.072*math.sin(a),-.29+.071*math.cos(a),1.51))
            if v.is_boundary and abs(v.co.x)>.15 and v.co.y>-.04:
                sign=1 if v.co.x>0 else -1;side='R' if sign>0 else 'L'
                a,b,_=bone_defs['Forearm'+side];axis=(b-a).normalized();center=b-axis*.012
                radial=v.co-center;radial-=axis*radial.dot(axis)
                if radial.length>1e-6:v.co=center+radial.normalized()*.050
        bm.to_mesh(o.data);bm.free()
    mod=o.modifiers.new('Cloth thickness','SOLIDIFY');mod.thickness=.003;bpy.ops.object.modifier_apply(modifier=mod.name)
    mod=o.modifiers.new('Garment runtime topology','DECIMATE');mod.ratio=.38;bpy.ops.object.modifier_apply(modifier=mod.name)
    if kind=='Sweater':
        # Fit the visible shirt and collar before adding thickness. Projecting
        # both solidified sides onto a surface collapses them and causes flicker.
        garment_surface=BVHTree.FromPolygons([v.co for v in o.data.vertices],[list(p.vertices) for p in o.data.polygons])
        # Cut a real V opening; the old round sweater neckline must not cross
        # the exposed shirt as a dark horizontal bar.
        verts=[(x,y,z) for y in [-.275,.5] for x,z in [(-.3,1.752142857),(.3,1.752142857),(0,1.395)]]
        cutter_data=bpy.data.meshes.new('V opening cutter')
        cutter_data.from_pydata(verts,[],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)])
        bm=bmesh.new();bm.from_mesh(cutter_data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(cutter_data);bm.free()
        cutter=bpy.data.objects.new('V opening cutter',cutter_data);scene.collection.objects.link(cutter)
        bpy.context.view_layer.objects.active=o
        mod=o.modifiers.new('Open V neckline','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
        bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
        # Newly cut neckline vertices belong to the same torso surface.
        for vertex in o.data.vertices:
            if not vertex.groups:o.vertex_groups['Spine'].add([vertex.index],1,'REPLACE')
        def fitted_panel(name,points,faces,lift=.004,material='Collar'):
            panel=mesh(name,points,faces,material,'Spine')
            bm=bmesh.new();bm.from_mesh(panel.data)
            bmesh.ops.triangulate(bm,faces=list(bm.faces))
            bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=7,use_grid_fill=True)
            bm.to_mesh(panel.data);bm.free()
            for v in panel.data.vertices:
                hit=garment_surface.ray_cast(Vector((v.co.x,.5,v.co.z)),Vector((0,-1,0)),2)[0]
                if hit:
                    fitted=max(v.co.y,hit.y+lift)
                    neck=smooth01((v.co.z-1.475)/.04) if material=='Skin' else (.7*smooth01((v.co.z-1.495)/.03) if name.startswith('Folded') else 0)
                    v.co.y=fitted*(1-neck)+v.co.y*neck
            for li,loop in enumerate(panel.data.loops):
                co=panel.data.vertices[loop.vertex_index].co;panel.data.uv_layers.active.data[li].uv=(co.x*3,co.z*3) if material=='Skin' else (co.x*4,co.z*4)
            panel.vertex_groups['Spine'].add(list(range(len(panel.data.vertices))),1,'REPLACE')
            bpy.context.view_layer.objects.active=panel
            mod=panel.modifiers.new('Folded cloth thickness','SOLIDIFY');mod.thickness=.0015
            bpy.ops.object.modifier_apply(modifier=mod.name)
            return panel
        # A continuous curved neck/chest patch closes the open shirt at oblique
        # views. Its perimeter stays under the collar, rather than exposing the
        # edge of a single triangular insert.
        vs=[];fs=[];uv=[];NX=16;NZ=16
        for j in range(NZ):
            z=1.44+j/(NZ-1)*.11;neck=smooth01((z-1.46)/.065)
            for i in range(NX):
                x=(-1+2*i/(NX-1))*(.075-.015*neck)
                hit=garment_surface.ray_cast(Vector((x,.5,z)),Vector((0,-1,0)),2)[0]
                chest_y=hit.y-.002 if hit else -.24
                neck_y=-.29+.061*math.sqrt(max(0,1-(x/.063)**2))+.001
                vs.append((x,chest_y*(1-neck)+neck_y*neck,z));uv.append((x*3,z*3))
                if i and j:fs.append(((j-1)*NX+i-1,(j-1)*NX+i,j*NX+i,j*NX+i-1))
        mesh('OpenShirtThroat',vs,fs,'Skin','Spine',uv)
        for s in [-1,1]:
            fitted_panel('ShirtV',[(s*.105,-.29,1.520),(s*.028,-.222,1.527),(0,-.22,1.465),(0,-.29,1.395)],[(0,1,2),(0,2,3)])
        for z in [1.423,1.447]:
            hit=garment_surface.ray_cast(Vector((0,.5,z)),Vector((0,-1,0)),2)[0]
            if hit:ellipsoid('ShirtButton',(0,hit.y+.008,z),(.003,.0015,.003),'Collar','Spine')
        # Open collar band: the neck remains visible above the office shirt.
        vs=[];fs=[];N=48
        for z,rx,ry in [(1.500,.072,.069),(1.530,.067,.067)]:
            for k in range(N):
                a=.70+(math.tau-1.40)*k/(N-1)
                vs.append((rx*math.sin(a),-.29+ry*math.cos(a),z))
        for k in range(N-1):fs.append((k,k+1,k+1+N,k+N))
        band=mesh('ShirtCollarBand',vs,fs,'Collar','Chest')
        bpy.context.view_layer.objects.active=band
        mod=band.modifiers.new('Band thickness','SOLIDIFY');mod.thickness=.002
        bpy.ops.object.modifier_apply(modifier=mod.name)
        for side in [-1,1]:
            pts=[]
            for k in range(97):
                x=side*.105*k/96;z=1.395+abs(x)*(.125/.105)
                hit=garment_surface.ray_cast(Vector((x,.5,z)),Vector((0,-1,0)),2)[0]
                if hit:pts.append(Vector((x,hit.y+.004,z)))
            # A continuous strip avoids the necklace-like segmented cylinders.
            vs=[];fs=[]
            columns=7
            for k,p in enumerate(pts):
                tangent=pts[min(k+1,len(pts)-1)]-pts[max(0,k-1)]
                normal=Vector((tangent.z,0,-tangent.x)).normalized()*.006
                for j in range(columns):
                    u=-1+2*j/(columns-1);q=p+normal*(u+side)
                    hit=garment_surface.ray_cast(Vector((q.x,.5,q.z)),Vector((0,-1,0)),2)[0]
                    if hit:q.y=hit.y+.003+.0008*(.5+.5*math.cos(k*math.pi/2))*math.cos(u*math.pi/2)
                    vs.append(q)
                    if k and j:fs.append(((k-1)*columns+j-1,(k-1)*columns+j,k*columns+j,k*columns+j-1))
            mesh('BoundVneck',vs,fs,'Sweater','Spine')
            fitted_panel('FoldedOfficeCollar',[(side*.028,-.221,1.530),(side*.067,-.238,1.532),(side*.092,-.23,1.502),(side*.098,-.19,1.455),(side*.045,-.20,1.485)],[(0,1,2,4),(4,2,3)],.010)
    for face in o.data.polygons:
        side=abs(face.normal.x)>abs(face.normal.y)
        for li in face.loop_indices:
            co=o.data.vertices[o.data.loops[li].vertex_index].co;o.data.uv_layers.active.data[li].uv=((co.y if side else co.x)*4,co.z*4)

def head_point(p):
    v=Vector((p.x*.128,-.29+(p.z-.13)*.112,1.54+(p.y-6.7866)*.12))
    front=smooth01((p.z-.7)/.5)
    # Preserve the intent expression with softer jaw and orbital transitions.
    v.x*=1+.08*math.exp(-((p.y-7.3)/.36)**2)
    v.y-=front*.004*math.exp(-((p.y-7.40)/.21)**2)*math.exp(-(p.x/.40)**4)
    brow=front*math.exp(-((p.y-8.25)/.14)**2)*math.exp(-((abs(p.x)-.20)/.23)**2)
    v.y+=brow*.003;v.z-=brow*.0035
    lid=front*math.exp(-((p.y-8.11)/.065)**2)*math.exp(-((abs(p.x)-.27)/.18)**2)
    v.z-=lid*.0003
    # Fuller cheek planes and a firmer chin avoid the gaunt mannequin silhouette.
    v.y+=front*.003*math.exp(-((p.y-7.78)/.22)**2)*math.exp(-((abs(p.x)-.43)/.20)**2)
    v.y+=front*.0015*math.exp(-((p.y-7.13)/.20)**2)*math.exp(-(p.x/.36)**4)
    # One mouth corner sits slightly higher, matching the restrained smirk.
    mouth=front*math.exp(-((p.y-7.38)/.15)**2)
    v.z+=mouth*(.0045*math.exp(-((p.x-.31)/.18)**2)+.0015*math.exp(-((p.x+.31)/.18)**2))
    v.x+=mouth*.0015*math.exp(-((p.x-.31)/.18)**2)
    return v
def face_uv(p):
    # Align projected material landmarks to mesh eyelids, lips and nose.
    marks=[(6.4,-.15),(6.75,-.12),(7.08,.03),(7.36,.26),(7.67,.43),(8.04,.70),(8.60,.96),(9.3,1.0)]
    lo,hi=next((a,b) for a,b in zip(marks,marks[1:]) if a[0]<=p.y<=b[0]);t=(p.y-lo[0])/(hi[0]-lo[0]);v=lo[1]*(1-t)+hi[1]*t
    return (max(.008,min(.992,.5+p.x*.67)),max(.008,min(.992,v)))
faces=[f for f in raw_faces['body'] if all(raw[i].y>=6.45 for i in f)]
ids=sorted({i for f in faces for i in f});lookup={v:i for i,v in enumerate(ids)}
head=mesh('AnatomicalHead',[head_point(raw[i]) for i in ids],[[lookup[i] for i in f] for f in faces],'Face','Head',[face_uv(raw[i]) for i in ids])
# Store an authored blend mask through subdivision/export. The runtime blends
# the matching skin atlas around the ears/jaw instead of a hard material edge.
blend=head.data.color_attributes.new(name='FaceBlend',type='FLOAT_COLOR',domain='POINT')
for i,source in enumerate(ids):
    p=raw[source];weight=smooth01((p.z-.15)/.75)*smooth01((p.y-6.98)/.30)
    blend.data[i].color=(weight,weight,weight,1)
# Real eye surfaces behind the modeled eyelids, using the matching pixel detail.
for group in ['helper-l-eye','helper-r-eye']:
    faces=raw_faces[group];ids=sorted({i for f in faces for i in f});idx={v:i for i,v in enumerate(ids)}
    eye=mesh('EyeSurface'+group,[head_point(raw[i]) for i in ids],[[idx[i] for i in f] for f in faces],'Face','Head',[face_uv(raw[i]) for i in ids])
    eye_blend=eye.data.color_attributes.new(name='FaceBlend',type='FLOAT_COLOR',domain='POINT')
    for value in eye_blend.data:value.color=(1,1,1,1)
# Flat neck boundary closes under the shirt instead of leaving jagged cut faces.
bm=bmesh.new();bm.from_mesh(head.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,1.51),plane_no=(0,0,1),clear_inner=True)
bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary and all(v.co.z<1.53 for v in e.verts)],sides=0)
for v in bm.verts:
    if v.co.z<1.575:
        # An elliptical neck fits inside the collar in every direction. A box
        # clamp left diagonal corners protruding through the shirt band.
        t=smooth01((1.575-v.co.z)/.035)
        radial=Vector((v.co.x/.063,(v.co.y+.29)/.061))
        if radial.length>1:radial.normalize()
        v.co.x=v.co.x*(1-t)+radial.x*.063*t
        v.co.y=v.co.y*(1-t)+(-.29+radial.y*.061)*t
bm.to_mesh(head.data);bm.free();head.vertex_groups['Head'].add(list(range(len(head.data.vertices))),1,'REPLACE')
# One subdivision preserves the actual nose/lips/lid topology in profile.
bpy.context.view_layer.objects.active=head
mod=head.modifiers.new('Facial surface','SUBSURF');mod.levels=1;bpy.ops.object.modifier_apply(modifier=mod.name)
scalp=BVHTree.FromPolygons([v.co for v in head.data.vertices],[list(p.vertices) for p in head.data.polygons],all_triangles=False)
# A single continuous scalp surface carries the swept locks. Shallow irregular
# flow ridges avoid the hard edges and repeated UV resets of separate ribbons.
vs=[];fs=[];uv=[];HN=128;HR=40;center_y=-.245
hair_origin=Vector((0,center_y,1.70))
def hair_lift(direction):
    return .003+.012*smooth01((direction.z-.45)/.45)*smooth01((direction.y+.35)/.75)
hair_guides=[]
for lock,root in enumerate([-.91,-.73,-.52,-.34,-.13,.09,.30,.48,.69,.87]):
    path=[];start=.74+.035*math.sin(lock*2.1);length=1.65+.12*math.cos(lock*1.7)
    for j in range(34):
        t=j/33;theta=start+t*length
        direction=Vector((root*(1-.18*t)-.28*math.sin(math.pi*t),math.cos(theta),math.sin(theta))).normalized()
        hit=scalp.ray_cast(hair_origin,direction,1)[0]
        if hit is not None:path.append(hit)
    hair_guides.append((path,.006+.001*math.sin(lock*2.3),.0033+.0006*math.cos(lock*1.9)))
for j in range(HR):
    t=j/(HR-1)
    for i in range(HN):
        a=i/HN*math.tau+math.pi;front=math.cos(a);side=math.sin(a)
        # Uneven swept hairline, close sides and a modest off-center forelock.
        bottom=1.708+.074*max(0,front)-.055*max(0,-front)+.005*side*max(0,front)
        bottom+=.0012*math.sin(a*7)+.0006*math.sin(a*13+.7)
        bottom-=.010*math.exp(-((side-.20)/.28)**2)*max(0,front)**3
        bottom+=.006*math.exp(-((abs(side)-.63)/.17)**2)*max(0,front)
        theta0=math.atan2(bottom-1.70,.10);theta=theta0+(math.pi/2-theta0)*t
        direction=Vector((math.cos(theta)*side,math.cos(theta)*front,math.sin(theta)))
        hit,normal,_,_=scalp.ray_cast(hair_origin,direction,1)
        if hit is None:hit=hair_origin+direction*.12;normal=direction
        if normal.dot(direction)<0:normal=-normal
        ridge=0
        for path,width,height in hair_guides:
            nearest=1;along=0
            for k,(a0,b0) in enumerate(zip(path,path[1:])):
                axis=b0-a0;u=max(0,min(1,(hit-a0).dot(axis)/max(axis.length_squared,1e-10)))
                d=(hit-(a0+axis*u)).length
                if d<nearest:nearest=d;along=(k+u)/(len(path)-1)
            ridge+=height*math.exp(-(nearest/width)**2)*math.sin(math.pi*along)**.6
        point=hit+normal.normalized()*(hair_lift(direction)+ridge)
        # Continuous strand coordinates follow the back-swept direction across
        # the crown instead of restarting at every modeled lock.
        progress=math.atan2(hit.z-1.70,hit.y-center_y)
        if progress<0:progress+=math.tau
        flow=progress/math.pi*.75
        vs.append(tuple(point));uv.append((.5+hit.x*4+flow,flow))
for j in range(HR-1):
    for i in range(HN):a=j*HN+i;b=j*HN+(i+1)%HN;fs.append((a,b,b+HN,a+HN))
mesh('SweptHair',vs,fs,'Hair','Head',uv,1)

# Shape the complete rest pose around the mower grip. The height ramp is zero
# at wrists/hands and legs, so the authoritative contact anchors stay unchanged.
def pushing_point(p,is_head=False):
    v=p.copy()
    if is_head:
        pivot=Vector((0,-.29,1.51))
        v=pivot+Matrix.Rotation(-.15,3,'X')@(v-pivot)
    t=smooth01((p.z-1.12)/.37)
    v.y+=.130*t;v.z-=.045*t
    shoulder=math.exp(-((abs(p.x)-.22)/.10)**2)*math.exp(-((p.z-1.43)/.11)**2)
    v.y+=.012*shoulder;v.z-=.016*shoulder
    return v
for o in skin_objects:
    head_group=o.vertex_groups.get('Head')
    is_head=head_group is not None and any(g.group==head_group.index and g.weight>.5 for v in o.data.vertices for g in v.groups)
    inverse=o.matrix_world.inverted()
    for vertex in o.data.vertices:
        vertex.co=inverse@pushing_point(o.matrix_world@vertex.co,is_head)
for name,(a,b,parent) in list(bone_defs.items()):
    bone_defs[name]=(pushing_point(a,name=='Head'),pushing_point(b,name=='Head'),parent)

# Real mower construction; separate wheel nodes rotate without deforming the deck.
def stamped_deck():
    levels=[(.09,.60,.69,.115),(.115,.61,.70,.12),(.14,.59,.68,.12),(.205,.53,.63,.115),(.225,.45,.53,.10)]
    vs=[];fs=[];N=32
    for z,w,d,r in levels:
        for corner,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for i in range(8):
                a=corner*math.pi/2+i/7*math.pi/2
                vs.append((sx*(w/2-r)+r*math.cos(a),.73+sy*(d/2-r)+r*math.sin(a),z))
    for j in range(len(levels)-1):
        for i in range(N):a=j*N+i;b=j*N+(i+1)%N;fs.append((a,b,b+N,a+N))
    fs.extend([tuple(reversed(range(N))),tuple((len(levels)-1)*N+i for i in range(N))]);mesh('StampedDeck',vs,fs,'RedEnamel')
stamped_deck()
box('EngineCrankcase',(0,.72,.285),(.24,.255,.17),'Engine',bevel=.035)
cyl('RecoilHousing',(0,.72,.34),(0,.72,.40),.14,'Engine')
cyl('StarterInset',(0,.72,.398),(0,.72,.411),.09,'Steel')
for i in range(16):
    a=i/16*math.tau;cyl('StarterVent'+str(i),(.08*math.sin(a),.72+.08*math.cos(a),.408),(.119*math.sin(a),.72+.119*math.cos(a),.402),.005,'Rubber')
for z in [.255,.275,.295,.315]:box('CoolingFin',(0,.84,z),(.21,.045,.009),'Steel',bevel=.002)
box('AirFilter',(.16,.70,.29),(.10,.16,.14),'Engine',bevel=.015)
box('Muffler',(-.15,.76,.275),(.075,.14,.10),'Steel',bevel=.012)
for z in [.25,.272,.294]:box('MufflerSlot',(-.191,.76,z),(.003,.09,.006),'Rubber',bevel=0)
cyl('FuelCap',(.08,.61,.36),(.08,.61,.402),.04,'Engine')
box('DischargeChute',(-.35,.71,.115),(.20,.29,.085),'Engine',bevel=.025)
for s in [-1,1]:
    tube('HandleTube'+str(s),[(s*.24,.48,.19),(s*.25,.39,.52),(s*.245,.15,1.055)],.014,'Steel')
    cyl('HandleMount'+str(s),(s*.25,.47,.17),(s*.25,.47,.29),.024,'Engine')
    cyl('WingNut'+str(s),(s*.245,.36,.58),(s*.27,.36,.58),.02,'Steel')
cyl('HandleGrip',(-.245,.15,1.055),(.245,.15,1.055),.021,'Rubber')
tube('BailLever',[(-.24,.14,1.04),(-.20,.105,1.055),(.20,.105,1.055),(.24,.14,1.04)],.005,'Steel')
tube('ThrottleCable',[(.21,.12,1.055),(.255,.22,.84),(.268,.39,.53),(.23,.58,.29)],.0035,'Rubber')
# Serviceable machine details, all batched into the existing rigid materials.
# The deck, axles, wheel radii and grip anchors remain unchanged.
for s in [-1,1]:
    for y in [.55,.91]:
        cyl('DeckMountBolt',(s*.19,y,.208),(s*.19,y,.222),.011,'Steel')
        box('BoltSlot',(s*.19,y,.223),(.013,.0025,.0015),'Rubber',bevel=0)
    tube('RolledDeckEdge',[(s*.25,.46,.138),(s*.285,.52,.135),(s*.292,.94,.135),(s*.25,1.02,.138)],.004,'Steel')
    tube('HeightAdjuster',[(s*.279,.48,.15),(s*.285,.43,.23),(s*.285,.37,.26)],.006,'Steel')
    box('AdjusterGrip',(s*.285,.37,.263),(.022,.055,.018),'Rubber',bevel=.006)
    for y in [.40,.425,.45]:box('HeightNotch',(s*.273,y,.218),(.009,.006,.023),'Steel',bevel=.002)
    for y in [.64,.79]:
        cyl('CrankcaseFastener',(s*.115,y,.28),(s*.128,y,.28),.009,'Brass')
    for y in [.48,.62,.88]:
        box('DeckPaintWear',(s*.29,y,.141),(.006,.019,.003),'Brass',bevel=.001)
    tube('CableClip',[(s*.253,.385,.53),(s*.266,.385,.53),(s*.266,.397,.54)],.0025,'Steel')
cyl('StarterBadge',(0,.72,.410),(0,.72,.414),.036,'RedEnamel')
for x in [-.012,0,.012]:box('BadgeRidge',(x,.72,.415),(.004,.032,.002),'Steel',bevel=.001)
cyl('SparkPlug',(-.115,.87,.32),(-.17,.90,.34),.009,'CollarEdge')
tube('IgnitionLead',[(-.17,.90,.34),(-.19,.89,.37),(-.18,.75,.39),(-.10,.71,.36)],.004,'Rubber')
tube('FuelLine',[(.08,.61,.30),(.13,.59,.26),(.14,.69,.25)],.004,'Rubber')
tube('StarterCord',[(.10,.68,.386),(.19,.57,.43),(.23,.44,.57)],.002,'Brass')
box('StarterPull',(.23,.44,.57),(.065,.021,.022),'Rubber',bevel=.007)
for y in [.65,.68,.71,.74]:box('FilterPleat',(.212,y,.29),(.004,.006,.085),'Steel',bevel=.001)
for k in range(12):
    a=k/12*math.tau
    box('FuelCapGrip',(.08+.038*math.sin(a),.61+.038*math.cos(a),.392),(.006,.006,.019),'Rubber',bevel=.001)
for s,side in [(-1,'L'),(1,'R')]:
    for y,label,radius in [(.48,'Rear',.125),(.97,'Front',.103)]:
        key='Wheel'+label+side;cx=s*.317;z=radius
        cyl(key+'Tire',(cx-.043,y,z),(cx+.043,y,z),radius,'Rubber',wheel=key)
        cyl(key+'Rim',(cx+s*.042,y,z),(cx+s*.049,y,z),radius*.67,'Steel',wheel=key)
        cyl(key+'Hub',(cx+s*.049,y,z),(cx+s*.056,y,z),radius*.19,'Brass',wheel=key)
        for k in range(24):
            a=k/24*math.tau
            tread=box(key+'Tread'+str(k),(cx,y+math.sin(a)*radius,z+math.cos(a)*radius),(.087,.024,.011),'Rubber',bevel=.003,wheel=key);tread.rotation_euler.x=-a
        for k in range(5):
            a=k/5*math.tau;cyl(key+'Bolt'+str(k),(cx+s*.05,y+math.sin(a)*radius*.43,z+math.cos(a)*radius*.43),(cx+s*.055,y+math.sin(a)*radius*.43,z+math.cos(a)*radius*.43),.006,'Steel',wheel=key)

# Build an editable 17-bone armature and merge skin/material batches.
ad=bpy.data.armatures.new('JoeSkeleton');rig=bpy.data.objects.new('JoeRig',ad);scene.collection.objects.link(rig);rig.parent=model
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,(a,b,parent) in bone_defs.items():
    eb=ad.edit_bones.new(name);eb.head=a;eb.tail=b
    if parent:eb.parent=ad.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
def join(objs,name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=bpy.context.object;o.name=name;return o
body=join(skin_objects,'JoeSkinnedBody');mod=body.modifiers.new('Joe skeletal deformation','ARMATURE');mod.object=rig
body.parent=rig
deck=join(static_objects,'MowerRigidBody')
for name,objs in wheel_objects.items():
    o=join(objs,name)
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    # Set origin at physical axle center, preserving geometry in world space.
    s=-1 if name.endswith('L') else 1;y=.48 if 'Rear' in name else .97;r=.125 if 'Rear' in name else .103
    scene.cursor.location=(s*.317,y,r);bpy.context.view_layer.objects.active=o;bpy.ops.object.origin_set(type='ORIGIN_CURSOR');o['wheelRadius']=r
scene.cursor.location=(0,0,0)
for o in scene.objects:
    if o.type=='MESH':
        o.data.validate(clean_customdata=False)
        bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free()

def solve(a,b,L1,L2,pole):
    d=b-a;dist=min(d.length,L1+L2-.0001);axis=d.normalized();along=(L1*L1-L2*L2+dist*dist)/(2*dist)
    side=(Vector(pole)-axis*Vector(pole).dot(axis)).normalized()
    return a+axis*along+side*math.sqrt(max(0,L1*L1-along*along))
def place(name,a,b):
    p=rig.pose.bones[name];rest=ad.bones[name];rotation=(rest.tail_local-rest.head_local).rotation_difference(b-a)
    p.matrix=Matrix.Translation(a)@rotation.to_matrix().to_4x4()@rest.matrix_local.to_3x3().to_4x4();bpy.context.view_layer.update()
def gait(t):
    stance=.62;sweep=.46
    if t<stance:return sweep*(.5-t/stance),0, .12*math.sin(t/stance*math.tau)
    q=(t-stance)/(1-stance);q2=q*q*(3-2*q)
    return sweep*(-.5+q2),.065*math.sin(math.pi*q),-.10*math.sin(math.pi*q)
rig.animation_data_create();action=bpy.data.actions.new('PushWalk');action.use_fake_user=True;rig.animation_data.action=action
for f in range(74):
    idle=f>=37
    if f==37:
        action=bpy.data.actions.new('PlantedIdle');action.use_fake_user=True;rig.animation_data.action=action
    keyframe=f-37 if idle else f
    phase=(f-37)/36 if idle else f/36;scene.frame_set(keyframe);bob=.002*math.sin(phase*math.tau) if idle else .007*math.cos(phase*math.tau*2);shift=Vector((0 if idle else .007*math.sin(phase*math.tau),0,-.055+bob))
    for name in ['Root','Hips','Spine','Chest','Head']:
        a,b,_=bone_defs[name];off=Vector((0,0,0)) if name=='Root' else shift;place(name,a+off,b+off)
    for s,side,offset in [(-1,'L',0),(1,'R',.5)]:
        y,lift,roll=(0,0,0) if idle else gait((phase+offset)%1)
        hip=bone_defs['Thigh'+side][0]+shift;ankle=Vector((s*.11,-.38+y,.12+lift))
        knee=solve(hip,ankle,.411,.411,(0,1,0));place('Thigh'+side,hip,knee);place('Shin'+side,knee,ankle)
        toe=ankle+Vector((0,.19,.19*math.tan(roll)-.055));place('Foot'+side,ankle,toe)
        shoulder=bone_defs['UpperArm'+side][0]+shift;wrist=bone_defs['Forearm'+side][1]
        arm_a,arm_b,_=bone_defs['UpperArm'+side];fore_a,fore_b,_=bone_defs['Forearm'+side]
        elbow=solve(shoulder,wrist,(arm_b-arm_a).length,(fore_b-fore_a).length,(s*.16,-.1,-1));place('UpperArm'+side,shoulder,elbow);place('Forearm'+side,elbow,wrist)
        ha,hb,_=bone_defs['Hand'+side];place('Hand'+side,ha,hb)
    for pb in rig.pose.bones:
        pb.rotation_mode='QUATERNION';pb.keyframe_insert('location',frame=keyframe);pb.keyframe_insert('rotation_quaternion',frame=keyframe);pb.keyframe_insert('scale',frame=keyframe)
rig.animation_data.action=bpy.data.actions['PushWalk']
scene.frame_start=0;scene.frame_end=36;scene.frame_set(0)
model['gaitDistanceMeters']=.46/.62;model['gaitDurationSeconds']=1.2
model['style']='Generated pixel material atlases on continuous skinned and rigid geometry'

# Reproducible source and standalone runtime asset, no Blender process needed at runtime.
assert all(v.groups for v in body.data.vertices), 'Unweighted body vertices cannot be exported'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'joe-pixel-rig.blend'))
bpy.ops.object.select_all(action='DESELECT')
for o in [model,rig,body,deck]+[bpy.data.objects[n] for n in wheel_objects]:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(P/'web/assets/models/joe-pixel-rig.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_frame_range=True,export_yup=True,export_extras=True,export_vertex_color='NAME',export_vertex_color_name='FaceBlend')
report={'meshes':len([o for o in scene.objects if o.type=='MESH']),'vertices':sum(len(o.data.vertices) for o in scene.objects if o.type=='MESH'),'triangles':sum(len(p.vertices)-2 for o in scene.objects if o.type=='MESH' for p in o.data.polygons),'bones':len(ad.bones),'action':'PushWalk','frames':37,'duration':1.2,'gaitDistance':.46/.62,'unweightedVertices':sum(not v.groups for v in body.data.vertices),'file':str(P/'web/assets/models/joe-pixel-rig.glb')}
(OUT/'build-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
