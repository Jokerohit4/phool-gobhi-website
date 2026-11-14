"""Generate smaller website derivatives; never change the approved sculpt archive."""
import json, math, struct, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'gobhi'
OUT = ROOT / 'runtime'
OUT.mkdir(exist_ok=True)
def add(a,b): return [x+y for x,y in zip(a,b)]
def sub(a,b): return [x-y for x,y in zip(a,b)]
def scale(a,s): return [x*s for x in a]
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def norm(a): return scale(a,1/(math.sqrt(dot(a,a)) or 1))
def cross(a,b): return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def frames(points,hand_scale):
    shift=scale(norm(sub(points[3],points[2])),-.024*hand_scale)
    p=[add(v,shift) if i>=2 else v for i,v in enumerate(points)]
    out=[]
    for i in range(65):
        t=i/64;u=1-t
        center=[u**3*p[0][k]+3*u*u*t*p[1][k]+3*u*t*t*p[2][k]+t**3*p[3][k] for k in range(3)]
        y=norm([3*u*u*(p[1][k]-p[0][k])+6*u*t*(p[2][k]-p[1][k])+3*t*t*(p[3][k]-p[2][k]) for k in range(3)])
        z=norm(sub([0,0,1],scale(y,y[2])));out.append((center,[norm(cross(y,z)),y,z]))
    return out
def deform(v,n,source,target,shrink_hand=False):
    out=[];normal=[]
    for i in range(0,len(v),3):
        point=v[i:i+3];nearest=min(range(65),key=lambda k:dot(sub(point,source[k][0]),sub(point,source[k][0])))
        a,axes=source[nearest];b,other=target[nearest]
        local=[dot(sub(point,a),axis) for axis in axes];ln=[dot(n[i:i+3],axis) for axis in axes]
        t=max(0,min(1,(nearest/64-.6)/.4));shrink=1-.28*t*t*(3-2*t) if shrink_hand else 1
        out.extend(b[k]+sum(other[j][k]*local[j]*(1 if j==1 else shrink) for j in range(3)) for k in range(3))
        normal.extend(norm([sum(other[j][k]*ln[j] for j in range(3)) for k in range(3)]))
    return out,normal
def cluster(v,n,indices,cell):
    groups={};sums=[];remap=[]
    for i in range(0,len(v),3):
        key=tuple(math.floor(x/cell) for x in v[i:i+3])
        if key not in groups:groups[key]=len(sums);sums.append([0]*7)
        group=groups[key];remap.append(group);s=sums[group]
        for k in range(3):s[k]+=v[i+k];s[k+3]+=n[i+k]
        s[6]+=1
    vv=[];nn=[]
    for s in sums:vv.extend(x/s[6] for x in s[:3]);nn.extend(norm(s[3:6]))
    ii=[];seen=set()
    for i in range(0,len(indices),3):
        tri=tuple(remap[x] for x in indices[i:i+3]);key=tuple(sorted(tri))
        if len(set(tri))<3 or key in seen:continue
        seen.add(key);ii.extend(tri)
    return vv,nn,ii
def read(name):
    data=(ROOT/name).read_bytes();size=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+size]);binary=data[28+size:]
    def array(index):
        a=g['accessors'][index];view=g['bufferViews'][a['bufferView']];count=a['count']*(3 if a['type']=='VEC3' else 1)
        return list(struct.unpack_from('<'+('f' if a['componentType']==5126 else 'H')*count,binary,view.get('byteOffset',0)+a.get('byteOffset',0)))
    nodes=[]
    for node in g['nodes']:
        p=g['meshes'][node['mesh']]['primitives'][0]
        nodes.append(dict(name=node['name'],matrix=node.get('matrix'),material=g['materials'][p['material']],v=array(p['attributes']['POSITION']),n=array(p['attributes']['NORMAL']),i=array(p['indices'])))
    return nodes
def write(name,nodes):
    g=dict(asset={'version':'2.0','generator':'Gobhi website optimized derivative'},buffers=[{}],bufferViews=[],accessors=[],meshes=[],nodes=[],materials=[],scenes=[{'nodes':list(range(len(nodes)))}],scene=0);binary=bytearray()
    def accessor(values,kind):
        while len(binary)%4:binary.append(0)
        offset=len(binary);binary.extend(struct.pack('<'+('H' if kind=='SCALAR' else 'f')*len(values),*values));view=len(g['bufferViews']);g['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':len(binary)-offset})
        a={'bufferView':view,'componentType':5123 if kind=='SCALAR' else 5126,'type':kind,'count':len(values)//(1 if kind=='SCALAR' else 3)}
        if kind=='VEC3':a.update(min=[min(values[k::3]) for k in range(3)],max=[max(values[k::3]) for k in range(3)])
        g['accessors'].append(a);return len(g['accessors'])-1
    for node in nodes:
        if node['name'].startswith('florets'):
            # Keep every bud at its exact authored position, using its original
            # twelve icosahedron vertices instead of the subdivided 42 vertices.
            faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]
            v=[];n=[];i=[]
            for start in range(0,len(node['v']),42*3):
                offset=len(v)//3;v.extend(node['v'][start:start+36]);n.extend(node['n'][start:start+36]);i.extend(offset+j for face in faces for j in face)
        else:v,n,i=cluster(node['v'],node['n'],node['i'],.008 if node['name'].startswith('arm-') else .025 if node['name'] in ['stem','crown'] else .15)
        primitive={'attributes':{'POSITION':accessor(v,'VEC3'),'NORMAL':accessor(n,'VEC3')},'indices':accessor(i,'SCALAR'),'material':len(g['materials'])}
        if name=='gobhi-wave.glb' and node['name'].startswith('arm-'):
            right=node['name'].endswith('right');sign=1 if right else -1
            source=frames([[.19,1.03,-.01],[.59,.86,.08],[.59,1.01,.19],[.68,1.16,.25]] if right else [[-.19,1.03,-.01],[-.50,.82,.02],[-.49,.66,.08],[-.46,.57,.10]],1)
            target=frames([[sign*.19,1.03,-.01],[sign*.43,.54,.26],[sign*.28,.40,.58],[sign*.16,.47,.72]],.72)
            end,en=deform(v,n,source,target,True)
            primitive['targets']=[{'POSITION':accessor([b-a for a,b in zip(v,end)],'VEC3'),'NORMAL':accessor([b-a for a,b in zip(n,en)],'VEC3')}]
        g['materials'].append(node['material']);g['meshes'].append({'primitives':[primitive]});outnode={'name':node['name'],'mesh':len(g['meshes'])-1}
        if node['matrix']:outnode['matrix']=node['matrix']
        g['nodes'].append(outnode)
    g['buffers'][0]['byteLength']=len(binary)
    while len(binary)%4:binary.append(0)
    js=json.dumps(g,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
    (OUT/name).write_bytes(struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary)
    print(name, 'bytes', (OUT/name).stat().st_size,'triangles',sum(g['accessors'][m['primitives'][0]['indices']]['count']//3 for m in g['meshes']))

wave=read('gobhi-wave.glb');hold=read('gobhi-hold.glb')
if '--grip-only' not in sys.argv:
    write('gobhi-wave.glb',[n for n in wave if not n['name'].startswith('nails-')])
    write('gobhi-hold.glb',[n for n in hold if not n['name'].startswith('nails-')])
grip=next(n for n in hold if n['name']=='arm-left').copy()
grip['v'],grip['n']=deform(grip['v'],grip['n'],frames([[-.19,1.03,-.01],[-.43,.54,.26],[-.28,.40,.58],[-.16,.47,.72]],.72),frames([[-.19,1.03,-.01],[-.50,.66,.15],[-.90,.47,.53],[-1.02,.55,.72]],.72))
grip['name']='arm-grip-right';write('gobhi-display-grip.glb',[grip])
