// Build one rounded volume so the puffs meet without seams or radial creases.
const puffs = [
  [0, .11, .04, 1.36, .55, .42],
  [-1.03, .16, -.07, .48, .40, .39],
  [-.62, .44, -.06, .53, .40, .43],
  [.02, .49, -.08, .59, .44, .48],
  [.70, .40, -.08, .59, .37, .40],
  [1.06, .10, -.07, .44, .38, .39],
  [.59, -.20, -.07, .56, .29, .35],
];
const tails = {
  desktop: [[.94, -.36, -.04, .28, .22, .27], [1.15, -.50, -.02, .15, .13, .16]],
  mobile: [[0, -.38, -.04, .26, .20, .27], [.02, -.53, -.02, .12, .13, .15]],
};
const cells = [38, 24, 16], origin = [-1.75, -.75, -.69], size = [3.50, 1.80, 1.38];
const corners = [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
const tetrahedra = [[0,1,3,7],[0,3,2,7],[0,2,6,7],[0,6,4,7],[0,4,5,7],[0,5,1,7]];
const blend = .12;

export function speechCloudGeometry(mobile) {
  const lobes = [...puffs, ...(mobile ? tails.mobile : tails.desktop)].map(([x,y,z,rx,ry,rz]) =>
    [x,y,z,1/rx,1/ry,1/rz,Math.min(rx,ry,rz)]);
  const field = (x,y,z) => {
    let result = Infinity;
    for (const [cx,cy,cz,rx,ry,rz,radius] of lobes) {
      const dx = (x-cx)*rx, dy = (y-cy)*ry, dz = (z-cz)*rz;
      const distance = (Math.sqrt(dx*dx+dy*dy+dz*dz)-1)*radius;
      const overlap = Math.max(0, blend-Math.abs(result-distance));
      result = Math.min(result,distance)-overlap*overlap/(4*blend);
    }
    return result;
  };
  const stride = cells[0]+1, plane = stride*(cells[1]+1);
  const count = plane*(cells[2]+1), grid = new Float32Array(count*3);
  const values = new Float32Array(count);
  const index = (x,y,z) => x + stride*y + plane*z;
  for (let z=0; z<=cells[2]; z++) for (let y=0; y<=cells[1]; y++) for (let x=0; x<=cells[0]; x++) {
    const id=index(x,y,z), px=origin[0]+x*size[0]/cells[0], py=origin[1]+y*size[1]/cells[1], pz=origin[2]+z*size[2]/cells[2];
    grid[id*3]=px;grid[id*3+1]=py;grid[id*3+2]=pz;
    values[id]=field(px,py,pz);
  }

  const vertices=[], normals=[], uv=[], triangles=[], edges=new Map();
  function edge(a,b) {
    const key=Math.min(a,b)*count+Math.max(a,b);
    const previous=edges.get(key);
    if(previous!==undefined)return previous;
    const t=values[a]/(values[a]-values[b]);
    const coord=i=>grid[3*a+i]+(grid[3*b+i]-grid[3*a+i])*t;
    const x=coord(0),y=coord(1),z=coord(2),eps=.003;
    const nx=field(x+eps,y,z)-field(x-eps,y,z);
    const ny=field(x,y+eps,z)-field(x,y-eps,z);
    const nz=field(x,y,z+eps)-field(x,y,z-eps);
    const length=Math.hypot(nx,ny,nz)||1, id=vertices.length/3;
    vertices.push(x,y,z);
    normals.push(nx/length,ny/length,nz/length);
    uv.push(x/3.28+.5,y/1.78+.5);
    edges.set(key,id);
    return id;
  }
  function triangle(a,b,c) {
    const ax=vertices[b*3]-vertices[a*3],ay=vertices[b*3+1]-vertices[a*3+1],az=vertices[b*3+2]-vertices[a*3+2];
    const bx=vertices[c*3]-vertices[a*3],by=vertices[c*3+1]-vertices[a*3+1],bz=vertices[c*3+2]-vertices[a*3+2];
    const facing=(ay*bz-az*by)*normals[a*3]+(az*bx-ax*bz)*normals[a*3+1]+(ax*by-ay*bx)*normals[a*3+2];
    if(facing>=0)triangles.push(a,b,c);
    else triangles.push(a,c,b);
  }
  for(let z=0;z<cells[2];z++)for(let y=0;y<cells[1];y++)for(let x=0;x<cells[0];x++){
    const ids=corners.map(([dx,dy,dz])=>index(x+dx,y+dy,z+dz));
    const inside=ids.filter(id=>values[id]<0).length;
    if(inside===0||inside===8)continue;
    for(const tetra of tetrahedra){
      const inner=[],outer=[];
      for(const c of tetra)(values[ids[c]]<0?inner:outer).push(ids[c]);
      if(inner.length===1)triangle(...outer.map(id=>edge(inner[0],id)));
      if(outer.length===1)triangle(...inner.map(id=>edge(outer[0],id)));
      if(inner.length===2){
        const a=edge(inner[0],outer[0]),b=edge(inner[0],outer[1]),c=edge(inner[1],outer[0]),d=edge(inner[1],outer[1]);
        triangle(a,b,c);triangle(b,d,c);
      }
    }
  }
  return { vertices, normals, uv, triangles };
}
