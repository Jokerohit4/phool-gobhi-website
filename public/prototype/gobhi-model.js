/* Logo-derived Gobhi sculpt. Geometry and articulation are authored here. */
window.createGobhiModel = function createGobhiModel(E) {
'use strict';
const {mesh,surface,draw,matrix,sphere,cylinder,cap}=E;
const PI=Math.PI,TAU=PI*2;
const leaf=[.43,.59,.28],stem=[.47,.63,.31],dark=[.13,.29,.17],crown=[.40,.56,.245];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const norm=a=>{const s=Math.hypot(...a)||1;return a.map(v=>v/s);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
function organicCrown(){
 const lobes=[
 [0,1.78,-.02,.68,.46,.43],[0,2.16,-.02,.43,.39,.36],
 [-.43,2.00,0,.37,.35,.36],[.45,1.99,-.01,.38,.35,.36],
 [-.79,1.76,-.02,.35,.37,.33],[.79,1.74,-.02,.35,.37,.33],
 [-.57,1.49,.02,.35,.28,.35],[.56,1.47,.025,.35,.28,.35],
 [0,1.49,.025,.46,.28,.36],[-.55,1.84,.25,.30,.31,.29],[0,2.00,.28,.30,.31,.30],[.48,1.85,.24,.30,.32,.29],[-.30,1.55,.27,.27,.25,.25],[.32,1.56,.25,.27,.25,.25],[-.28,2.22,.06,.28,.29,.30],[.30,2.22,-.03,.28,.27,.28]
 ];
 const field=(x,y,z)=>{
  let d=100;
  for(const [cx,cy,cz,rx,ry,rz] of lobes){const q=(Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1)*Math.min(rx,ry,rz),k=.055,h=clamp(.5+.5*(q-d)/k,0,1);d=q*(1-h)+d*h-k*h*(1-h);}
  // A faint broad grain makes the sculpture organic without changing its logo silhouette.
  return d+.004*Math.sin(x*18+z*9)*Math.sin(y*19-z*8);
 };
 const nx=49,ny=35,nz=29,min=[-1.23,1.10,-.58],max=[1.23,2.66,.58];
 const total=nx*ny*nz,values=new Float32Array(total),points=new Array(total);
 const index=(i,j,k)=>(i*ny+j)*nz+k;
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){
  const p=[min[0]+i/(nx-1)*(max[0]-min[0]),min[1]+j/(ny-1)*(max[1]-min[1]),min[2]+k/(nz-1)*(max[2]-min[2])],id=index(i,j,k);points[id]=p;values[id]=field(...p);
 }
 const vertices=[],normals=[],uv=[],indices=[],cache=new Map();
 function edge(a,b){const key=a<b?a+':'+b:b+':'+a;if(cache.has(key))return cache.get(key);const t=values[a]/(values[a]-values[b]),p=points[a].map((v,i)=>v+(points[b][i]-v)*t),h=.0015;
  const n=norm([field(p[0]+h,p[1],p[2])-field(p[0]-h,p[1],p[2]),field(p[0],p[1]+h,p[2])-field(p[0],p[1]-h,p[2]),field(p[0],p[1],p[2]+h)-field(p[0],p[1],p[2]-h)]),id=vertices.length/3;
  vertices.push(...p);normals.push(...n);uv.push((p[0]-min[0])/(max[0]-min[0]),(p[1]-min[1])/(max[1]-min[1]));cache.set(key,id);return id;
 }
 function triangle(a,b,c){const pa=vertices.slice(a*3,a*3+3),pb=vertices.slice(b*3,b*3+3),pc=vertices.slice(c*3,c*3+3),n=cross(minus(pb,pa),minus(pc,pa)),expected=normals.slice(a*3,a*3+3);if(n.reduce((sum,v,i)=>sum+v*expected[i],0)<0)indices.push(a,c,b);else indices.push(a,b,c);}
 const tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
 for(let i=0;i<nx-1;i++)for(let j=0;j<ny-1;j++)for(let k=0;k<nz-1;k++){
  const cube=[index(i,j,k),index(i+1,j,k),index(i+1,j+1,k),index(i,j+1,k),index(i,j,k+1),index(i+1,j,k+1),index(i+1,j+1,k+1),index(i,j+1,k+1)];
  for(const tet of tets){const inside=[],outside=[];tet.forEach(n=>(values[cube[n]]<0?inside:outside).push(cube[n]));if(!inside.length||!outside.length)continue;
   if(inside.length===1||outside.length===1){const a=inside.length===1?inside[0]:outside[0],others=inside.length===1?outside:inside;triangle(edge(a,others[0]),edge(a,others[1]),edge(a,others[2]));}
   else{const a=edge(inside[0],outside[0]),b=edge(inside[0],outside[1]),c=edge(inside[1],outside[0]),d=edge(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c);}
  }
 }
 if(vertices.length/3>65535)throw Error('Gobhi crown exceeds the mesh index budget');
 return mesh(vertices,normals,uv,indices);
}
const crownMesh=organicCrown();
const profile=[[0,.28],[.10,.36],[.30,.29],[.62,.30],[.93,.34],[1.20,.40],[1.44,.47],[1.53,.42]];
function bodyRadius(y){let i=0;while(i<profile.length-2&&y>profile[i+1][0])i++;const a=profile[i],b=profile[i+1],t=clamp((y-a[0])/(b[0]-a[0]),0,1),s=t*t*(3-2*t);return a[1]+(b[1]-a[1])*s;}
function stemPoint(y,a){
 const original=bodyRadius(y),x=Math.cos(a)*original;
 const path=.15+.05*Math.pow(1-clamp(y/.63,0,1),2);
 const groove=(Math.exp(-Math.pow((x-path)/.022,2))+Math.exp(-Math.pow((x+path)/.022,2)))*smooth(.05,.13,y)*(1-smooth(.48,.64,y))*smooth(.15,.80,Math.sin(a));
 const r=original-.028*groove;
 return[Math.cos(a)*r,y,Math.sin(a)*r*.76];
}
const bodyMesh=surface(96,192,(v,u)=>{
 const y=v*1.53,a=u*TAU,p=stemPoint(y,a),dy=minus(stemPoint(Math.min(1.53,y+.001),a),stemPoint(Math.max(0,y-.001),a)),da=minus(stemPoint(y,a+.001),stemPoint(y,a-.001));
 return[p,norm(cross(dy,da))];
});
// Compact, overlapping floret buds give the canopy actual broccoli density.
// Buds are embedded in the parent sculpt; only their rounded tips are exposed.
function broccoliBuds(){
 const golden=(1+Math.sqrt(5))/2,base=[],faces=[];
 [[-1,golden,0],[1,golden,0],[-1,-golden,0],[1,-golden,0],[0,-1,golden],[0,1,golden],[0,-1,-golden],[0,1,-golden],[golden,0,-1],[golden,0,1],[-golden,0,-1],[-golden,0,1]].forEach(v=>base.push(norm(v)));
 const raw=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],midpoints=new Map();
 const midpoint=(a,b)=>{const key=Math.min(a,b)+':'+Math.max(a,b);if(midpoints.has(key))return midpoints.get(key);const id=base.length;base.push(norm(base[a].map((v,i)=>(v+base[b][i])*.5)));midpoints.set(key,id);return id;};
 raw.forEach(([a,b,c])=>{const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);faces.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]);});
 const groups=Array.from({length:3},()=>({v:[],n:[],uv:[],idx:[]})),grid=new Map(),accepted=[],cell=.045;
 const data=crownMesh.cpu,N=data.positions.length/3;
 const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 for(let step=0;step<N&&accepted.length<2800;step++){
  const id=step*7919%N,p=Array.from(data.positions.subarray(id*3,id*3+3)),no=Array.from(data.normals.subarray(id*3,id*3+3));if(p[1]<1.30)continue;
  const radius=.019+hash(id)*.010,spacing=.038+radius*.18,ix=Math.floor(p[0]/cell),iy=Math.floor(p[1]/cell),iz=Math.floor(p[2]/cell);let clear=true;
  for(let x=ix-1;x<=ix+1&&clear;x++)for(let y=iy-1;y<=iy+1&&clear;y++)for(let z=iz-1;z<=iz+1&&clear;z++){
   for(const other of grid.get(x+':'+y+':'+z)||[])if(Math.hypot(...minus(p,other))<spacing){clear=false;break;}
  }
  if(!clear)continue;const key=ix+':'+iy+':'+iz;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p);accepted.push(p);
  const group=groups[Math.min(2,Math.floor(hash(id+74)*3))],offset=group.v.length/3,center=p.map((v,i)=>v-no[i]*radius*.56);
  base.forEach((v,i)=>{group.v.push(...v.map((x,j)=>center[j]+x*radius));group.n.push(...v);group.uv.push(i/base.length,0);});
  faces.forEach(face=>group.idx.push(...face.map(i=>i+offset)));
 }
 return{meshes:groups.map(g=>mesh(g.v,g.n,g.uv,g.idx)),count:accepted.length,triangles:accepted.length*faces.length};
}
const buds=broccoliBuds();
function tube(points,radius=.075,endRadius=radius){
 const point=t=>{const a=points.map(p=>p.slice());for(let level=points.length-1;level>0;level--)for(let i=0;i<level;i++)a[i]=a[i].map((v,j)=>v+(a[i+1][j]-v)*t);return a[0];};
 const rows=32,cols=12,vertices=[],normals=[],uv=[],indices=[];let previous=null;
 for(let row=0;row<=rows;row++){
  const v=row/rows,p=point(v),tangent=norm(minus(point(Math.min(1,v+.002)),point(Math.max(0,v-.002))));
  let n;
  if(previous){const projection=previous.reduce((sum,x,i)=>sum+x*tangent[i],0);n=norm(previous.map((x,i)=>x-tangent[i]*projection));}
  else n=norm(cross(tangent,Math.abs(tangent[1])>.9?[1,0,0]:[0,1,0]));
  previous=n;const binormal=cross(tangent,n),r=radius+(endRadius-radius)*v;
  for(let col=0;col<=cols;col++){
   const angle=col/cols*TAU,no=n.map((x,i)=>x*Math.cos(angle)+binormal[i]*Math.sin(angle));vertices.push(...p.map((x,i)=>x+no[i]*r));normals.push(...no);uv.push(col/cols,v);
   if(row<rows&&col<cols){const a=row*(cols+1)+col,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
  }
 }
 for(const end of [0,1]){
  const center=point(end),tangent=norm(minus(point(Math.min(1,end+.002)),point(Math.max(0,end-.002)))),normal=tangent.map(v=>v*(end===0?-1:1)),centerIndex=vertices.length/3;
  vertices.push(...center);normals.push(...normal);uv.push(.5,.5);
  const ringStart=vertices.length/3;
  for(let col=0;col<=cols;col++){const original=(end===0?0:rows)*(cols+1)+col;vertices.push(...vertices.slice(original*3,original*3+3));normals.push(...normal);uv.push(.5,.5);}
  for(let col=0;col<cols;col++){const a=ringStart+col,b=a+1,pa=vertices.slice(a*3,a*3+3),pb=vertices.slice(b*3,b*3+3),face=cross(minus(pa,center),minus(pb,center));if(face.reduce((sum,v,i)=>sum+v*normal[i],0)>0)indices.push(centerIndex,a,b);else indices.push(centerIndex,b,a);}
 }
 return mesh(vertices,normals,uv,indices);
}
const humanHands=window.createGobhiHands({mesh,draw,matrix,multiply:E.multiply,tube});
function piece(geo,p,s,c,parent,r=[0,0,0],options={}){draw(geo,p,s,r,c,null,{gloss:.13,...options},parent);}
function ball(p,s,c,parent,r=[0,0,0],options={}){piece(sphere,p,s,c,parent,r,options);}
function barbell(parent){piece(cylinder,[0,1.22,.095],[.045,1.26,.045],[.30,.44,.27],parent,[0,0,PI/2],{gloss:.38});for(const sign of [-1,1]){
 const x=sign*1.26;piece(cylinder,[x,1.22,.095],[.42,.095,.42],[.16,.34,.22],parent,[0,0,PI/2],{gloss:.26});piece(cap,[x+sign*.097,1.22,.095],[.42,1,.42],[.26,.46,.29],parent,[0,0,-sign*PI/2]);piece(cap,[x-sign*.097,1.22,.095],[.42,1,.42],[.22,.40,.25],parent,[0,0,sign*PI/2]);piece(cylinder,[x-sign*.12,1.22,.095],[.31,.05,.31],[.37,.55,.31],parent,[0,0,PI/2]);piece(cylinder,[x+sign*.11,1.22,.095],[.10,.08,.10],[.28,.40,.25],parent,[0,0,PI/2]);}
}
function drawGobhi(pos,scale=1,rotation=0,usingPhone=false,time=0,alpha=1,pose='wave'){
 const breath=E.isReduced()?0:Math.sin(time*.0013)*.009,root=matrix([pos[0],pos[1]+breath,pos[2]],[scale,scale,scale],[0,rotation,0]);
 piece(bodyMesh,[0,0,0],[1,1,1],stem,root,[0,0,0],{alpha,outline:.012});
 // Flared root leaves preserve the logo's stem silhouette, rather than adding shoes.
 ball([-.28,.09,.035],[.24,.10,.22],[.40,.57,.27],root,[0,0,.18],{alpha});ball([.28,.09,.035],[.24,.10,.22],[.44,.60,.29],root,[0,0,-.18],{alpha});
 // The two stem lines are recessed directly into bodyMesh, with no added strips.
 const head=E.multiply(root,matrix([0,0,0],[1,1,1],[0,E.isReduced()?0:Math.sin(time*.0007)*.015,0]));
 piece(crownMesh,[0,0,0],[1,1,1],crown,head,[0,0,0],{alpha,outline:.019,gloss:.10});
 buds.meshes.forEach((geometry,i)=>piece(geometry,[0,0,0],[1,1,1],[[.35,.51,.20],[.40,.56,.23],[.44,.59,.26]][i],head,[0,0,0],{alpha,gloss:.055}));
 // Two small, inset forest-green eyes, with restrained highlights.
 for(const x of [-.14,.14]){ball([x,1.025,.267],[.044,.083,.022],[.33,.49,.25],root,[0,0,0],{alpha});ball([x,1.025,.284],[.027,.065,.018],dark,root,[0,0,0],{alpha,gloss:.38});ball([x-.006,1.049,.301],[.006,.012,.004],[.74,.81,.58],root,[0,0,0],{alpha,gloss:.05});}
 if(usingPhone||pose==='phone'){
  humanHands.draw('phoneLeft',root,alpha);humanHands.draw('phoneRight',root,alpha);
 }else if(pose==='logo'){
  barbell(root);humanHands.draw('logoLeft',root,alpha);humanHands.draw('logoRight',root,alpha);
 }else{
  humanHands.draw('waveLeft',root,alpha);humanHands.draw('waveRight',root,alpha);
 }

}
return {draw:drawGobhi,drawHandDetail(){humanHands.detail(matrix());},stats:{hands:humanHands.stats,crownVertices:crownMesh.cpu.positions.length/3,crownTriangles:crownMesh.count/3,floretBuds:buds.count,floretTriangles:buds.triangles,stemGrooves:'Recessed 0.028 into the stem mesh',armSpan:.84,method:'Defined broccoli clusters, densely embedded floret buds and recessed stem grooves'},palette:{crown:'#668f3e',stem:'#78a14f',outline:'#214a2b'}};
};
