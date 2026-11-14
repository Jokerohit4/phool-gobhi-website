/* Anatomical green hands. Each forearm and hand is welded into one mesh. */
window.createGobhiHands = function createGobhiHands(E){
'use strict';
const {mesh,multiply,matrix,tube,draw}=E,PI=Math.PI,TAU=PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),scale=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>scale(a,1/(Math.hypot(...a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const skin=[.47,.63,.31],nailColor=[.53,.67,.37];
function smin(a,b,k){const h=clamp(.5+.5*(b-a)/k,0,1);return b*(1-h)+a*h-k*h*(1-h);}
function ellipsoid(p,c,r){return(Math.hypot((p[0]-c[0])/r[0],(p[1]-c[1])/r[1],(p[2]-c[2])/r[2])-1)*Math.min(...r);}
function taperedCapsule(p,a,b,r0,r1){const ab=sub(b,a),t=clamp(dot(sub(p,a),ab)/(dot(ab,ab)||1),0,1),q=sub(p,add(a,scale(ab,t)));return Math.hypot(...q)-(r0+(r1-r0)*t);}
function sculptHand(mode){
 const config=[{name:'index',x:.059,y:.143,length:.155,radius:.0175,spread:.10},{name:'middle',x:.017,y:.158,length:.174,radius:.0185,spread:.012},{name:'ring',x:-.027,y:.150,length:.160,radius:.0172,spread:-.055},{name:'little',x:-.065,y:.130,length:.126,radius:.0142,spread:-.17}];
 const curls={open:[.06,.10,.06],relaxed:[.24,.34,.22],phone:[.38,.78,.65],grip:[.80,1.18,.98]}[mode];
 const bones=[],joints=[],nails=[];
 for(const digit of config){let p=[digit.x,digit.y,.002],angle=0;const points=[p],fractions=[.45,.32,.23];
  for(let i=0;i<3;i++){angle+=curls[i];const length=digit.length*fractions[i],direction=norm([Math.sin(digit.spread),Math.cos(angle)*Math.cos(digit.spread),-Math.sin(angle)]),q=add(p,scale(direction,length)),r0=digit.radius*(1-i*.10),r1=digit.radius*(.92-i*.12);bones.push({a:p,b:q,r0,r1});if(i<2)joints.push({p:q,axis:direction,radius:r1});
   if(i===2){const dorsal=norm([0,Math.sin(angle),Math.cos(angle)]);nails.push({a:p,b:q,radius:(r0+r1)*.5,dorsal,length:Math.min(.032,length*.73),width:r1*1.5});}
   p=q;points.push(p);
  }
 }
 // The thumb grows out of the thenar mound, on its own angled axis.
 const thumbs={
  open:[[.070,.039,.002],[.121,.069,.006],[.151,.116,-.004]],
  relaxed:[[.070,.039,.002],[.116,.070,-.009],[.139,.109,-.027]],
  phone:[[.070,.039,.002],[.116,.085,-.025],[.071,.123,-.073]],
  grip:[[.070,.039,.002],[.111,.092,-.045],[.049,.125,-.100]]
 }[mode];
 bones.push({a:thumbs[0],b:thumbs[1],r0:.030,r1:.024},{a:thumbs[1],b:thumbs[2],r0:.024,r1:.0185});
 const thumbD=norm(sub(thumbs[2],thumbs[1])),thumbN=norm(sub([0,0,1],scale(thumbD,thumbD[2])));
 nails.push({a:thumbs[1],b:thumbs[2],radius:.021,dorsal:thumbN,length:.028,width:.026});
 const segments=bones.map(b=>{const dx=b.b[0]-b.a[0],dy=b.b[1]-b.a[1],dz=b.b[2]-b.a[2];return{ax:b.a[0],ay:b.a[1],az:b.a[2],dx,dy,dz,inverse:1/(dx*dx+dy*dy+dz*dz),r:b.r0,dr:b.r1-b.r0};});
 const ellipse=(x,y,z,cx,cy,cz,rx,ry,rz)=>(Math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2)-1)*Math.min(rx,ry,rz);
 const field=(x,y,z)=>{
  if(y<.010)return Math.hypot(x,z)-.064;
  let d=ellipse(x,y,z,0,.070,-.001,.091,.097,.039);
  d=smin(d,ellipse(x,y,z,.058,.047,-.006,.049,.062,.043),.021);
  d=smin(d,ellipse(x,y,z,-.061,.064,-.005,.033,.081,.035),.017);
  for(let i=0;i<segments.length;i++){const b=segments[i],px=x-b.ax,py=y-b.ay,pz=z-b.az,t=clamp((px*b.dx+py*b.dy+pz*b.dz)*b.inverse,0,1),qx=px-b.dx*t,qy=py-b.dy*t,qz=pz-b.dz*t;d=smin(d,Math.sqrt(qx*qx+qy*qy+qz*qz)-b.r-b.dr*t,.0065);}
  for(let i=0;i<config.length;i++){const digit=config[i];d=smin(d,ellipse(x,y,z,digit.x,digit.y-.005,.001,digit.radius*1.13,.023,digit.radius*1.06),.008);}
  for(let i=0;i<joints.length;i++){const joint=joints[i];if(z>=joint.p[2]-.004)continue;const dx=x-joint.p[0],dy=y-joint.p[1],dz=z-joint.p[2],squared=dx*dx+dy*dy+dz*dz;if(squared>=.001444)continue;const distance=Math.sqrt(squared),plane=dx*joint.axis[0]+dy*joint.axis[1]+dz*joint.axis[2];d+=.0011*Math.exp(-Math.pow(plane/.0045,2))*Math.exp(-Math.pow((distance-joint.radius)/.010,2));}
  const wy=clamp(y/.055,0,1),wrist=Math.hypot(x,y-.055*wy,z)-(.064-.012*wy),joined=smin(d,wrist,.017),transition=smooth(.010,.035,y);d=(Math.hypot(x,z)-.064)*(1-transition)+joined*transition;
  return d;
 };
 const endpoints=bones.flatMap(b=>[b.a,b.b]);
 const min=[-.116,0,Math.min(-.062,...endpoints.map(p=>p[2]-.032))],max=[Math.max(.13,...endpoints.map(p=>p[0]+.034)),Math.max(.20,...endpoints.map(p=>p[1]+.024)),.065];
 const step=.0055,nx=Math.ceil((max[0]-min[0])/step)+1,ny=Math.ceil(max[1]/step)+1,nz=Math.ceil((max[2]-min[2])/step)+1;
 const values=new Float32Array(nx*ny*nz),positions=new Array(values.length),id=(i,j,k)=>(i*ny+j)*nz+k;
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){const p=[min[0]+i/(nx-1)*(max[0]-min[0]),j/(ny-1)*max[1],min[2]+k/(nz-1)*(max[2]-min[2])],n=id(i,j,k);positions[n]=p;values[n]=field(...p);}
 const v=[],n=[],uv=[],indices=[],edges=new Map();
 function edge(a,b){const key=a<b?a+':'+b:b+':'+a;if(edges.has(key))return edges.get(key);const t=values[a]/(values[a]-values[b]),p=positions[a].map((v,i)=>v+(positions[b][i]-v)*t),h=.0006,normal=norm([field(p[0]+h,p[1],p[2])-field(p[0]-h,p[1],p[2]),field(p[0],p[1]+h,p[2])-field(p[0],p[1]-h,p[2]),field(p[0],p[1],p[2]+h)-field(p[0],p[1],p[2]-h)]),index=v.length/3;v.push(...p);n.push(...normal);uv.push((p[0]-min[0])/(max[0]-min[0]),p[1]/max[1]);edges.set(key,index);return index;}
 function tri(a,b,c){const pa=v.slice(a*3,a*3+3),pb=v.slice(b*3,b*3+3),pc=v.slice(c*3,c*3+3);if(dot(cross(sub(pb,pa),sub(pc,pa)),n.slice(a*3,a*3+3))<0)indices.push(a,c,b);else indices.push(a,b,c);}
 const tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
 for(let i=0;i<nx-1;i++)for(let j=0;j<ny-1;j++)for(let k=0;k<nz-1;k++){const cube=[id(i,j,k),id(i+1,j,k),id(i+1,j+1,k),id(i,j+1,k),id(i,j,k+1),id(i+1,j,k+1),id(i+1,j+1,k+1),id(i,j+1,k+1)];for(const tet of tets){const inside=[],outside=[];tet.forEach(n=>(values[cube[n]]<0?inside:outside).push(cube[n]));if(!inside.length||!outside.length)continue;if(inside.length===1||outside.length===1){const a=inside.length===1?inside[0]:outside[0],others=inside.length===1?outside:inside;tri(edge(a,others[0]),edge(a,others[1]),edge(a,others[2]));}else{const a=edge(inside[0],outside[0]),b=edge(inside[0],outside[1]),c=edge(inside[1],outside[0]),d=edge(inside[1],outside[1]);tri(a,b,c);tri(b,d,c);}}}
 const rim=[];for(let i=0;i<v.length/3;i++)if(Math.abs(v[i*3+1])<1e-6)rim.push(i);
 return{v,n,uv,indices,rim,nails,mode};
}
const hands={grip:sculptHand('grip'),phone:sculptHand('phone'),open:sculptHand('open'),relaxed:sculptHand('relaxed')};
function nailMesh(nails){const v=[],n=[],uv=[],indices=[];for(const nail of nails){const direction=norm(sub(nail.b,nail.a)),dorsal=norm(sub(nail.dorsal,scale(direction,dot(nail.dorsal,direction)))),across=norm(cross(direction,dorsal)),center=add(nail.a,scale(sub(nail.b,nail.a),.64)),offset=v.length/3;
  for(let r=0;r<=4;r++)for(let c=0;c<=24;c++){const radius=r/4,angle=c/24*TAU,along=Math.cos(angle)*radius*nail.length*.5,lateral=Math.sin(angle)*radius*nail.width*.5,bulge=Math.sqrt(Math.max(0,1-Math.pow(lateral/(nail.radius*1.12),2)))*nail.radius+.0005,p=add(add(add(center,scale(direction,along)),scale(across,lateral)),scale(dorsal,bulge));v.push(...p);n.push(...norm(add(scale(dorsal,.9),scale(across,lateral/nail.radius*.22))));uv.push(c/24,r/4);if(r<4&&c<24){const a=offset+r*25+c,b=a+25;indices.push(a,b,a+1,a+1,b,b+1);}}
 }return{v,n,uv,indices};}
function frameAt(points){const wrist=points[3],Y=norm(sub(wrist,points[2])),Z=norm(sub([0,0,1],scale(Y,Y[2]))),X=norm(cross(Y,Z));return{wrist,X,Y,Z,point:p=>add(wrist,add(add(scale(X,p[0]),scale(Y,p[1])),scale(Z,p[2]))),normal:p=>norm(add(add(scale(X,p[0]),scale(Y,p[1])),scale(Z,p[2])))};}
function weld(v,n,uv,indices){const map=new Map(),outV=[],outN=[],outUV=[],remap=[],used=new Set(indices);for(let i=0;i<v.length/3;i++){if(!used.has(i))continue;const p=v.slice(i*3,i*3+3),key=p.map(x=>Math.round(x*100000)).join(',');let id=map.get(key);if(id===undefined){id=outV.length/3;map.set(key,id);outV.push(...p);outN.push(0,0,0);outUV.push(uv[i*2]||0,uv[i*2+1]||0);}remap[i]=id;for(let k=0;k<3;k++)outN[id*3+k]+=n[i*3+k];}for(let i=0;i<outN.length;i+=3){const length=Math.hypot(outN[i],outN[i+1],outN[i+2])||1;outN[i]/=length;outN[i+1]/=length;outN[i+2]/=length;}const idx=indices.map(i=>remap[i]),parents=Array.from({length:outV.length/3},(_,i)=>i);function root(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;}for(let i=0;i<idx.length;i+=3){const r=root(idx[i]);parents[root(idx[i+1])]=r;parents[root(idx[i+2])]=r;}const components=new Set(idx.map(root)).size;if(outV.length/3>65535)throw Error('Hand mesh exceeds index budget');return{geometry:mesh(outV,outN,outUV,idx),components,vertices:outV.length/3};}
function buildLimb(points,mode,mirror=false,handScale=1){const hand=hands[mode],frame=frameAt(points),shift=scale(frame.Y,-.024*handScale),armPoints=points.map((p,i)=>i>=2?add(p,shift):p),arm=tube(armPoints,.115,.064*handScale),v=Array.from(arm.cpu.positions),n=Array.from(arm.cpu.normals),uv=Array.from(arm.cpu.uv),indices=Array.from(arm.cpu.indices.slice(0,32*24*6));
 // Close the shoulder end. The wrist end is joined to the hand boundary below.
 if(E.blendShoulderNormal)for(let i=0;i<v.length;i+=3){const blended=E.blendShoulderNormal(v.slice(i,i+3),n.slice(i,i+3));for(let k=0;k<3;k++)n[i+k]=blended[k];}
 const capStart=arm.cpu.indices.slice(32*24*6,32*24*6+24*3);indices.push(...capStart);
 const offset=v.length/3,flip=p=>[p[0]*(mirror?-1:1),p[1],p[2]];
 for(let i=0;i<hand.v.length;i+=3){v.push(...frame.point(scale(flip(hand.v.slice(i,i+3)),handScale)));n.push(...frame.normal(flip(hand.n.slice(i,i+3))));uv.push(hand.uv[i/3*2],hand.uv[i/3*2+1]);}
 for(let i=0;i<hand.indices.length;i+=3){const a=hand.indices[i]+offset,b=hand.indices[i+1]+offset,c=hand.indices[i+2]+offset;indices.push(a,mirror?c:b,mirror?b:c);}
 const angle=id=>{const local=sub(v.slice(id*3,id*3+3),frame.wrist);return(Math.atan2(dot(local,frame.Z),dot(local,frame.X))+TAU)%TAU;};
 const A=Array.from({length:24},(_,i)=>32*25+i).sort((a,b)=>angle(a)-angle(b)),B=hand.rim.map(i=>i+offset).sort((a,b)=>angle(a)-angle(b));
 function triangle(a,b,c){const pa=v.slice(a*3,a*3+3),pb=v.slice(b*3,b*3+3),pc=v.slice(c*3,c*3+3),normal=n.slice(a*3,a*3+3);if(dot(cross(sub(pb,pa),sub(pc,pa)),normal)<0)indices.push(a,c,b);else indices.push(a,b,c);}
 let i=0,j=0;while(i<A.length||j<B.length){const ai=A[i%A.length],bj=B[j%B.length],nextA=i+1<A.length?angle(A[i+1]):angle(A[0])+TAU,nextB=j+1<B.length?angle(B[j+1]):angle(B[0])+TAU;if(i<A.length&&(j>=B.length||nextA<=nextB)){triangle(ai,A[(i+1)%A.length],bj);i++;}else{triangle(ai,B[(j+1)%B.length],bj);j++;}}
 const joined=weld(v,n,uv,indices),patch=nailMesh(hand.nails),nailV=[],nailN=[];for(let k=0;k<patch.v.length;k+=3){nailV.push(...frame.point(scale(flip(patch.v.slice(k,k+3)),handScale)));nailN.push(...frame.normal(flip(patch.n.slice(k,k+3))));}const nailIndices=[];for(let k=0;k<patch.indices.length;k+=3)nailIndices.push(patch.indices[k],patch.indices[k+(mirror?2:1)],patch.indices[k+(mirror?1:2)]);
 return{...joined,nails:mesh(nailV,nailN,patch.uv,nailIndices),wrist:frame.wrist,mode};
}
const limbs={
 // Palms cup the small phone's lower edge; fingers curl onto the lower back.
 frontPhoneLeft:buildLimb([[-.19,1.03,-.01],[-.43,.54,.26],[-.28,.40,.58],[-.16,.47,.72]],'phone',false,.72),
 frontPhoneRight:buildLimb([[.19,1.03,-.01],[.43,.54,.26],[.28,.40,.58],[.16,.47,.72]],'phone',true,.72),
 logoLeft:buildLimb([[-.33,.90,0],[-.78,.67,.02],[-.88,.80,.12],[-.84,1.08,.14]],'grip'),
 logoRight:buildLimb([[.33,.90,0],[.78,.67,.02],[.88,.80,.12],[.84,1.08,.14]],'grip',true),
 phoneLeft:buildLimb([[-.33,.93,.03],[.12,.64,.30],[.26,.67,.75],[.149,.86,.90]],'phone'),
 phoneRight:buildLimb([[.33,.93,.03],[.47,.68,.10],[.12,.72,.30],[0,.857,.30]],'phone',true),
 waveLeft:buildLimb([[-.19,1.03,-.01],[-.50,.82,.02],[-.49,.66,.08],[-.46,.57,.10]],'relaxed'),
 waveRight:buildLimb([[.19,1.03,-.01],[.59,.86,.08],[.59,1.01,.19],[.68,1.16,.25]],'open',true)
};
function renderLimb(key,parent,alpha=1){const limb=limbs[key];draw(limb.geometry,[0,0,0],[1,1,1],[0,0,0],skin,null,{alpha,gloss:.10},parent);draw(limb.nails,[0,0,0],[1,1,1],[0,0,0],nailColor,null,{alpha,gloss:.17},parent);}
return{draw:renderLimb,detail(parent){renderLimb('waveLeft',parent);},stats:{digitsPerHand:5,phalangesPerFinger:3,opposableThumb:true,joinedForearmHand:true,components:Object.fromEntries(Object.entries(limbs).map(([key,value])=>[key,value.components])),vertices:Object.fromEntries(Object.entries(limbs).map(([key,value])=>[key,value.vertices]))}};
};
