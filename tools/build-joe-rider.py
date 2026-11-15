"""Build a textured rider from the existing low-poly rig and original pixel materials.
Keeps original image bytes and UVs; excludes the old push mower and its textures.
"""
import copy,json,struct
from pathlib import Path

def read(path):
 b=Path(path).read_bytes();n=struct.unpack_from('<I',b,12)[0]
 return json.loads(b[20:20+n]),b[28+n:]
low,body=read('web/assets/models/joe-pixel-rig-lod.glb');high,source=read('web/assets/models/joe-pixel-rig.glb')
original={m['name']:m for m in high['materials']}
for n in low['nodes']:
 if n.get('name')=='MowerRigidBody' or n.get('name','').startswith('Wheel'):n.pop('mesh',None)
used_meshes=sorted({n['mesh'] for n in low['nodes'] if 'mesh' in n});meshes=[low['meshes'][i] for i in used_meshes]
for n in low['nodes']:
 if 'mesh' in n:n['mesh']=used_meshes.index(n['mesh'])
low['meshes']=meshes
used_mats=sorted({p['material'] for m in meshes for p in m['primitives']})
materials=[copy.deepcopy(original[low['materials'][i]['name']]) for i in used_mats]
for m in meshes:
 for p in m['primitives']:p['material']=used_mats.index(p['material'])
textures=[];images=[];chunks=[body];offset=len(body);texture_map={};image_map={}
for mat in materials:
 t=mat.get('pbrMetallicRoughness',{}).get('baseColorTexture')
 if not t:continue
 idx=t['index']
 if idx not in texture_map:
  tex=copy.deepcopy(high['textures'][idx]);image_idx=tex.get('extensions',{}).get('EXT_texture_webp',{}).get('source',tex.get('source'))
  if image_idx not in image_map:
   im=copy.deepcopy(high['images'][image_idx]);view=high['bufferViews'][im['bufferView']];raw=source[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]
   im['bufferView']=len(low['bufferViews']);low['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(raw)});chunks.append(raw);offset+=len(raw);pad=(-offset)%4;chunks.append(b'\0'*pad);offset+=pad
   image_map[image_idx]=len(images);images.append(im)
  tex.pop('source',None);tex['extensions']={'EXT_texture_webp':{'source':image_map[image_idx]}}
  texture_map[idx]=len(textures);textures.append(tex)
 t['index']=texture_map[idx]
low.update(materials=materials,textures=textures,images=images,samplers=high.get('samplers',[]),extensionsUsed=['EXT_texture_webp'],extensionsRequired=['EXT_texture_webp'])
low['buffers'][0]['byteLength']=offset
raw=json.dumps(low,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);data=b''.join(chunks)
result=struct.pack('<III',0x46546c67,2,28+len(raw)+len(data))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(data),0x004e4942)+data
Path('web/assets/models/joe-riding-pixel.glb').write_bytes(result)
print({'bytes':len(result),'images':len(images),'materials':len(materials),'meshes':len(meshes),'originalImageBytesPreserved':True})
