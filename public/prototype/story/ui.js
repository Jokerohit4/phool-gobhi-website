/* Animated product screens. Sample records and rewards stay in this browser. */
window.pgStoryPaint={
 screen(name,state={},motion={}){
  const c=this.canvas||(this.canvas=document.createElement('canvas'));if(c.width!==720){c.width=720;c.height=1500;}
  const x=c.getContext('2d'),t=motion.time||0,entry=motion.entry??1,action=motion.action??1;
  const ease=v=>1-Math.pow(1-Math.max(0,Math.min(1,v)),3);
  const palettes={home:['#d6f46c','#24462e','#fafbef'],water:['#a9e5fa','#095e88','#f4fbfc'],food:['#ffbb96','#9c3c26','#fff8ef'],workout:['#cfbaff','#52328b','#f9f6fd'],history:['#b9ed9b','#286036','#f5faef'],coins:['#ffda63','#86551d','#fffbeb']};
  const [accent,deep,paper]=palettes[name]||palettes.home,ink='#203b2b',muted='#78856d';
  x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.fillStyle=paper;x.fillRect(0,0,720,1500);
  const text=(s,a,b,size=24,color=ink,weight=400)=>{x.fillStyle=color;x.font=`${weight} ${size}px Work,Arial`;x.fillText(s,a,b);};
  const box=(a,b,w,h,r,color)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
  const circle=(a,b,r,color)=>{x.fillStyle=color;x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();};
  const line=y=>{x.strokeStyle='#203b2b18';x.lineWidth=2;x.beginPath();x.moveTo(48,y);x.lineTo(672,y);x.stroke();};
  const panel=(delay,fn)=>{const e=ease((entry-delay)/(1-delay));x.save();x.globalAlpha=e;x.translate(0,(1-e)*45);fn(e);x.restore();};
  const badge=(s,a,b,w=175)=>{box(a,b,w,40,20,ink);text(s,a+17,b+27,16,'#fffef5',600);};
  const subtitle=(s,y)=>text(s,48,y,22,muted);
  const heading=(a,b,sub)=>{text(a,48,222,64,ink,800);text(b,48,286,64,deep,800);subtitle(sub,337);};
  const check=(a,b,color=deep)=>{x.strokeStyle=color;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(a+8,b+8);x.lineTo(a+23,b-10);x.stroke();};
  const button=s=>{box(48,1248,624,76,38,deep);text(s,82,1296,24,'#fffdf4',600);text('\u2192',610+Math.sin(t*2)*4,1297,30,'#fffdf4');};
  text('9:41',48,58,20,ink,600);[0,1,2].forEach(i=>box(608+i*9,48-i*4,5,10+i*4,1,ink));box(647,41,24,13,3,ink);
  text('PHOOL GOBHI',48,147,18,muted,600);circle(643,139,27,accent);text('G',631,149,25,deep,800);
  if(name==='home'){
   heading('Your day.','Turn it up.','Your training. Your habits. Your kind of good.');
   panel(0,()=>{box(44,383,632,355,30,accent);badge('YOUR NEXT WIN',74,412);text('SHOW UP.',74,535,79,ink,800);text('FEEL STRONG.',74,615,66,ink,800);text('Full body strength \u00b7 Your gym',76,677,23,deep);circle(620,430,30,'#fffef565');text('\u2197',601,443,38,deep,600);});
   panel(.12,e=>{box(44,763,306,204,27,'#b9e7f5');box(369,763,307,204,27,'#ffd18e');text('WATER',70,807,17,'#26677f',600);text(e.toFixed(1)+' L',70,883,55,'#095e88',800);text('A little sip?',70,925,20,'#26677f');text('YOUR STEPS',397,807,17,'#936029',600);text(Math.round(6240*e).toLocaleString('en-IN'),397,883,52,'#754818',800);text('Every little bit.',397,925,20,'#936029');});
   panel(.25,()=>{text('SMALL THINGS. BIG ENERGY.',48,1040,18,muted,600);line(1061);check(55,1100);text('A moment for yourself.',100,1110,25);check(55,1170);text('Breakfast, logged.',100,1180,25);});button('Start with a little water');
  }else if(name==='water'){
   heading('SIP. LOG.','LET\u2019S GO.','A little hydration. A lot of good.');
   panel(0,e=>{box(48,382,624,627,32,accent);badge('DAILY HYDRATION',77,412,206);
    const before=motion.previousWater??state.water??1000,amount=before+((state.water||1000)-before)*ease(action),level=Math.min(amount/2500,1)*e;
    x.save();x.translate(360,665);x.rotate(Math.sin(t*1.3)*.018);box(-126,-166,252,334,43,'#ffffff75');x.save();x.beginPath();x.roundRect(-115,-155,230,312,34);x.clip();
    const top=157-312*level,g=x.createLinearGradient(0,top,0,160);g.addColorStop(0,'#35b8ed');g.addColorStop(1,'#087db8');x.fillStyle=g;x.beginPath();x.moveTo(-130,170);x.lineTo(-130,top);x.bezierCurveTo(-50,top+Math.sin(t*2)*18,55,top-Math.sin(t*2)*18,130,top);x.lineTo(130,170);x.closePath();x.fill();
    for(let i=0;i<6;i++){const by=150-((t*30+i*39)%200);if(by>top+14)circle(-72+(i*37)%150,by,3+i%3,'#c9f5ff99');}x.restore();x.strokeStyle='#095e8840';x.lineWidth=3;x.beginPath();x.roundRect(-126,-166,252,334,43);x.stroke();x.restore();
    text((amount/1000).toFixed(2).replace(/0$/,'')+' L',78,932,80,deep,800);text('of your 2.5 L goal',78,974,22,deep);badge(Math.round(level*100)+'% THERE',466,912,165);
   });
   panel(.25,()=>{text(state.water>1000?'NICE. KEEP THE FLOW.':'ONE GLASS. ONE GOOD MOVE.',48,1072,21,deep,800);subtitle(state.water>1000?'Your 250 ml is logged. You\u2019re building a rhythm.':'Tap below. Add a little good to your day.',1124);});button('Log 250 ml of water');
  }else if(name==='food'){
   heading('GOOD FOOD.','GOOD MOOD.','Your everyday meals. All in one place.');
   panel(0,()=>{box(48,382,624,363,32,accent);badge('TODAY\u2019S FUEL',77,411);
    x.save();x.translate(360,572+Math.sin(t*1.5)*5);x.rotate(-.08+Math.sin(t)*.015);
    [['#b9503320',24,208,111],['#fff4d4',0,202,111],['#eed7ac',0,177,90]].forEach(([color,y,rx,ry])=>{x.fillStyle=color;x.beginPath();x.ellipse(0,y,rx,ry,0,0,Math.PI*2);x.fill();});
    [['#df8540',-.2],['#629543',2],['#efc75e',4]].forEach(([color,a])=>{x.fillStyle=color;x.beginPath();x.ellipse(Math.cos(a)*72,Math.sin(a)*32,79,43,-.2,0,Math.PI*2);x.fill();});x.restore();
    for(let i=0;i<3;i++){x.strokeStyle='#fff8ef99';x.lineWidth=4;x.beginPath();const sy=490-((t*12+i*9)%26);x.moveTo(307+i*48,sy);x.bezierCurveTo(290+i*48,sy-15,324+i*48,sy-25,307+i*48,sy-40);x.stroke();}
   });
   panel(.12,()=>{text('Dal, rice & a little sabzi',48,805,33,ink,600);subtitle('Your saved meal \u00b7 1 serving',850);[['Protein','18g','#cceba8'],['Carbs','62g','#ffd678'],['Fat','12g','#efc5eb']].forEach((a,i)=>{const px=48+i*215;box(px,894,195,119,20,a[2]);text(a[0],px+19,937,18,deep);text(a[1],px+19,985,37,ink,800);});});
   panel(.25,()=>{line(1059);text(state.foodSaved?'LUNCH, LOGGED. NICE ONE.':'FAMILIAR FOOD. FRESH START.',48,1110,21,deep,800);subtitle('Save favourites. Make everyday easier.',1160);});button(state.foodSaved?'Meal logged. Nice one!':'Log this meal');
  }else if(name==='workout'){
   heading('YOUR SETS.','YOUR STRONG.','Show up. Put it down. Build your story.');
   panel(0,()=>{box(48,382,624,180,30,accent);badge('FULL BODY STRENGTH',76,410,244);text('GOBLET SQUAT',77,518,42,deep,800);circle(614,485,27,'#fffaf07f');text('\u2197',596,499,35,deep,600);});
   text('SET',65,632,18,muted,600);text('WEIGHT',228,632,18,muted,600);text('REPS',443,632,18,muted,600);
   [1,2,3].forEach((set,i)=>panel(.08+i*.14,e=>{const y=673+i*114;box(48,y,624,87,19,i===2?accent:'#ece4f6');circle(91,y+44,25,'#fffaf096');text(String(set),82,y+55,29,deep,800);text('24 kg',231,y+55,32,ink,800);text('10',456,y+55,32,ink,600);if(e>.75)check(606,y+44);}));
   panel(.45,()=>{line(1053);text(state.workoutSaved?'SAVED. THAT\u2019S YOUR STRONG.':'3 SETS. ALL YOU.',48,1110,25,deep,800);subtitle('Your gym or your home. Your routine.',1158);});button(state.workoutSaved?'Workout saved. Keep going!':'Save this workout');
  }else if(name==='history'){
   heading('SMALL STEPS.','LOOK AT YOU.','See the everyday adding up.');
   panel(0,()=>{box(48,382,624,323,30,accent);badge(state.historyWeek?'YOUR WEEK':'YOUR TRAINING',76,410,184);text('3 sessions',76,516,59,deep,800);text('ONE GOOD WEEK',439,442,15,deep,600);
    [.55,.35,1,.2,.8,.12,.12].forEach((h,i)=>{const px=80+i*80,height=h*92*ease((entry-i*.06)*1.6);box(px,628-height,46,Math.max(2,height),8,i===2?deep:'#5ca84480');text(['M','T','W','T','F','S','S'][i],px+13,672,16,deep);});});
   [['\u2197','Full body strength','Today \u00b7 3 sets recorded','#cfbaff'],['\u25d2','A little hydration','Today \u00b7 Your water logs','#a9e5fa'],['\u2713','Lunch, remembered','Today \u00b7 Dal, rice & sabzi','#ffbb96']].forEach((a,i)=>panel(.14+i*.12,()=>{const y=773+i*140;box(48,y,61,61,18,a[3]);text(a[0],65,y+42,29,ink,600);text(a[1],135,y+22,27,ink,600);text(a[2],135,y+60,19,muted);line(y+102);}));button(state.historyWeek?'Back to recent history':'See your week');
  }else if(name==='coins'){
   heading('SHOW UP.','GLOW UP.','A little win deserves a little celebration.');
   const values=['10','15','20','25','30','50'],cx=360,cy=682,r=246,turn=state.coinsCollected?(Math.PI*8+2.15)*ease(action):Math.sin(t*.8)*.035;
   panel(0,()=>{circle(cx,cy,r+19,'#f2bb3c');circle(cx,cy,r+8,ink);x.save();x.translate(cx,cy);x.rotate(turn);values.forEach((v,i)=>{const a=i/6*Math.PI*2;x.fillStyle=['#ffdb5b','#c8f06f','#ffab81','#cbb3f6','#ffe7a1','#aadd9a'][i];x.beginPath();x.moveTo(0,0);x.arc(0,0,r,a,a+Math.PI/3);x.closePath();x.fill();x.save();x.rotate(a+Math.PI/6);text(v,139,12,39,ink,800);x.restore();});x.restore();circle(cx,cy,62,ink);text('G',336,704,61,'#fff8e7',800);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;circle(cx+Math.cos(a)*(r+14),cy+Math.sin(a)*(r+14),3,Math.sin(t*3+i)>.2?'#fffaf0':'#c48625');}x.fillStyle=ink;x.beginPath();x.moveTo(338,393);x.lineTo(382,393);x.lineTo(360,444);x.closePath();x.fill();});
   const won=state.coinsCollected&&action>.8;panel(.2,()=>{text(won?'+20 GOBHI COINS':'YOUR NEXT LITTLE WIN.',won?107:87,1053,47,deep,800);subtitle(won?'Collected. A little boost for your everyday.':'Go on. Give the wheel a spin.',1107);text('SAMPLE REWARD \u00b7 NO CASH VALUE',157,1161,16,muted);});button(state.coinsCollected?'A little win, collected!':'Spin for a little win');
  }
  if(action<1&&motion.hasAction){x.save();x.globalAlpha=Math.sin(action*Math.PI);for(let i=0;i<14;i++){const a=i*2.399,rad=45+action*245;x.save();x.translate(360+Math.cos(a)*rad,1030+Math.sin(a)*rad*.48-action*80);x.rotate(a+action*3);box(-4,-8,8,16,2,[accent,deep,'#efb93e','#ed7a5b'][i%4]);x.restore();}x.restore();}
  line(1375);[['\u2302','Home'],['\u2197','Train'],['\u2661','Health'],['\u25ce','You']].forEach((a,i)=>{const px=91+i*174,selected=i===(name==='workout'?1:name==='water'||name==='food'?2:name==='history'||name==='coins'?3:0);if(selected)box(px-24,1388,82,49,24,accent);text(a[0],px,1424,34,selected?deep:'#95a184');text(a[1],px-4,1462,15,selected?deep:'#95a184',selected?600:400);});return c;
 },
 speech(){const c=document.createElement('canvas');c.width=1100;c.height=520;const x=c.getContext('2d');x.fillStyle='#24462e';x.font='600 89px Work,Arial';x.fillText('Hi, I am Gobhi.',88,207);x.fillStyle='#738566';x.font='400 48px Work,Arial';x.fillText('Your health and fitness buddy.',91,307);x.fillStyle='#b78432';x.font='400 30px Work,Arial';x.fillText('A little better, together.',92,396);return c;},
 back(){const c=document.createElement('canvas');c.width=360;c.height=760;const x=c.getContext('2d');x.fillStyle='#314e3b';x.fillRect(0,0,360,760);x.fillStyle='#7b9271';x.textAlign='center';x.font='600 29px Work,Arial';x.fillText('G',180,418);x.font='400 12px Work,Arial';x.fillText('phool gobhi',180,455);return c;}
};
