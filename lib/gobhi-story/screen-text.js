/* Browser-rendered glyphs for the settled, front-facing app tour. */
const NS='http://www.w3.org/2000/svg';
let sequence=0;
export function createScreenText(canvas){
 const svg=document.createElementNS(NS,'svg'),group=document.createElementNS(NS,'g'),content=document.createElementNS(NS,'g'),defs=document.createElementNS(NS,'defs'),clip=document.createElementNS(NS,'clipPath'),rect=document.createElementNS(NS,'rect'),id='gobhi-screen-text-'+(++sequence);
 svg.classList.add('phone-screen-text');svg.setAttribute('aria-hidden','true');
 Object.assign(svg.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'hidden'});
 clip.id=id;rect.setAttribute('width','720');rect.setAttribute('height','1500');rect.setAttribute('rx',String(.14/1.22*720));clip.append(rect);defs.append(clip);content.setAttribute('clip-path',`url(#${id})`);group.append(content);svg.append(defs,group);canvas.after(svg);
 let previous=null;
 return {
  update(runs,corners,width,height,opacity){
   svg.style.display=opacity>.0001?'block':'none';if(opacity<=.0001||corners.some(p=>!p))return;
   const [a,b,c]=corners;
   svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
   group.setAttribute('transform',`matrix(${(b.x-a.x)/720} ${(b.y-a.y)/720} ${(c.x-a.x)/1500} ${(c.y-a.y)/1500} ${a.x} ${a.y})`);
   group.setAttribute('opacity',String(opacity));
   if(runs===previous)return;previous=runs;
   while(content.children.length>runs.length)content.lastChild.remove();
   runs.forEach((run,i)=>{
    const node=content.children[i]||document.createElementNS(NS,'text');
    if(!node.parentNode)content.append(node);
    node.textContent=run.text;
    for(const [key,value] of Object.entries({x:run.x,y:run.y,'font-size':run.size,'font-weight':run.weight,'font-family':'GobhiWork,Arial,sans-serif',fill:run.color,opacity:run.opacity,transform:`matrix(${run.transform.join(' ')})`}))node.setAttribute(key,String(value));
   });
  },
  dispose(){svg.remove();}
 };
}
