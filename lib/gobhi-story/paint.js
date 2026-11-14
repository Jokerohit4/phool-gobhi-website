/* Animated product screens. Sample records and rewards stay in this browser. */
import { meals, littleWins, contexts, mapPlaces } from './journey';
export const storyPaint={
 screen(name,state={},motion={}){
  const c=this.canvas||(this.canvas=document.createElement('canvas')),textureWidth=motion.textureWidth||512;if(c.width!==textureWidth){c.width=textureWidth;c.height=Math.round(textureWidth*1500/720);}
  const x=c.getContext('2d'),t=motion.time||0,entry=motion.entry??1,action=motion.action??1;
  const ease=v=>1-Math.pow(1-Math.max(0,Math.min(1,v)),3);
  const palettes={home:['#d6f46c','#24462e','#fafbef'],water:['#a9e5fa','#095e88','#f4fbfc'],food:['#ffbb96','#9c3c26','#fff8ef'],workout:['#cfbaff','#52328b','#f9f6fd'],history:['#b9ed9b','#286036','#f5faef'],coins:['#ffda63','#86551d','#fffbeb'],plan:['#d8ed9b','#365c2b','#fbfdef'],assistant:['#cbb9f7','#553b86','#fbf8ff'],map:['#b5e0b2','#2d6540','#f4faf1'],buddies:['#ecc3d9','#813b62','#fff8fc']};
  const [accent,deep,paper]=palettes[name]||palettes.home,ink='#203b2b',muted='#78856d';
  x.setTransform(c.width/720,0,0,c.height/1500,0,0);x.globalAlpha=1;x.fillStyle=paper;x.fillRect(0,0,720,1500);
  c.screenText=[];
  const text=(s,a,b,size=24,color=ink,weight=400)=>{
   x.fillStyle=color;x.font=`${weight} ${size}px GobhiWork,Arial`;
   const opacity=x.globalAlpha;
   if(motion.captureText){const m=x.getTransform(),sx=720/c.width,sy=1500/c.height;c.screenText.push({text:String(s),x:a,y:b,size,color,weight,opacity,transform:[m.a*sx,m.b*sy,m.c*sx,m.d*sy,m.e*sx,m.f*sy]});}
   x.globalAlpha=opacity*(motion.textOpacity??1);x.fillText(s,a,b);x.globalAlpha=opacity;
  };
  const box=(a,b,w,h,r,color)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
  const circle=(a,b,r,color)=>{x.fillStyle=color;x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();};
  const line=y=>{x.strokeStyle='#203b2b18';x.lineWidth=2;x.beginPath();x.moveTo(48,y);x.lineTo(672,y);x.stroke();};
  const panel=(delay,fn)=>{const e=ease((entry-delay)/(1-delay));x.save();x.globalAlpha=e;x.translate(0,(1-e)*45);fn(e);x.restore();};
  const badge=(s,a,b,w=175)=>{box(a,b,w,40,20,ink);text(s,a+17,b+27,16,'#fffef5',600);};
  const subtitle=(s,y)=>text(s,48,y,22,muted);
  const heading=(a,b,sub)=>{text(a,48,222,64,ink,800);text(b,48,286,64,deep,800);subtitle(sub,337);};
  const check=(a,b,color=deep)=>{x.strokeStyle=color;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(a+8,b+8);x.lineTo(a+23,b-10);x.stroke();};
  const growingCheck=(a,b,amount,color=deep)=>{const p=ease(amount);x.strokeStyle=color;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(a,b);if(p<.34)x.lineTo(a+8*p/.34,b+8*p/.34);else{x.lineTo(a+8,b+8);const q=(p-.34)/.66;x.lineTo(a+8+15*q,b+8-18*q);}x.stroke();};
  const button=s=>{box(48,1248,624,76,38,deep);text(s,82,1296,24,'#fffdf4',600);text('\u2192',610+Math.sin(t*2)*4,1297,30,'#fffdf4');};
  const delight=motion.delight||{reveal:1,save:1,hasEvent:false,mapFrom:0},reveal=delight.reveal;
  const sparkle=(a,b,r,color,opacity=1)=>{x.save();x.globalAlpha*=opacity;x.strokeStyle=color;x.lineWidth=2.5;x.beginPath();x.moveTo(a-r,b);x.lineTo(a+r,b);x.moveTo(a,b-r);x.lineTo(a,b+r);x.stroke();x.restore();};
  const flourish=(a,b)=>{if(motion.still||!delight.hasEvent||delight.save>=1)return;const p=delight.save;for(let i=0;i<7;i++){const angle=i*2.399,spread=18+p*58;sparkle(a+Math.cos(angle)*spread,b+Math.sin(angle)*spread,3+(i%2)*2,i%2?deep:'#b68a32',Math.sin(p*Math.PI)*.8);}};
  text('9:41',48,58,20,ink,600);[0,1,2].forEach(i=>box(608+i*9,48-i*4,5,10+i*4,1,ink));box(647,41,24,13,3,ink);
  text('PHOOL GOBHI',48,147,18,muted,600);circle(643,139,27,accent);text('G',631,149,25,deep,800);
  const wellbeing=state.context==='wellbeing',homeRoutine=(state.loggedWorkoutContext||state.context)==='home';
  if(name==='plan'){
   heading('YOUR LIFE.','YOUR PLAN.','One week. A little room for you.');
   panel(0,()=>{box(48,382,624,173,30,accent);badge(wellbeing?'WELLBEING':'YOUR KIND OF FITNESS',76,410,260);text(contexts[state.context]||'At home',77,511,45,deep,800);});
   text(wellbeing?'A week of small intentions':(state.trainingDays||3)+' training days. Rest belongs here, too.',48,612,25,ink,600);
   const build=Math.max((motion.planProgress??1)*.15,reveal);
   ['M','T','W','T','F','S','S'].forEach((day,i)=>{const on=!wellbeing&&[0,2,4,5].slice(0,state.trainingDays||3).includes(i),rise=ease(build*1.6-i*.08),px=48+i*90;box(px,655+(1-rise)*26,80,142,22,on?accent:'#e9eddd');text(day,px+27,696+(1-rise)*26,25,deep,600);text(wellbeing?'♡':on?'↗':'·',px+25,756+(1-rise)*26,31,deep,600);});
   if(!motion.still){x.save();x.globalAlpha=.22;for(let i=0;i<7;i++){const selected=wellbeing||[0,2,4,5].slice(0,state.trainingDays||3).includes(i);if(selected){const px=48+i*90,phase=(t*.42+i*.13)%1;box(px+15+phase*25,781,25,3,1.5,deep);}}x.restore();}
   [['WATER','2.5 L'],['STEPS','8,000'],['SLEEP','8 hours']].forEach((a,i)=>{const grow=ease(reveal*1.45-i*.14),px=48+i*215,lift=(1-grow)*18;box(px,846+lift,195,133,22,i===0?'#b9e7f5':i===1?'#d9edaf':'#dcd0f3');text(a[0],px+18,888+lift,18,deep,600);text(i===0?(2.5*grow).toFixed(1)+' L':i===1?Math.round(8000*grow).toLocaleString('en-IN'):Math.round(8*grow)+' hours',px+18,944+lift,32,ink,800);});
   if(state.planSaved){const pop=delight.hasEvent?Math.sin(delight.save*Math.PI)*4:0;circle(617,1053,25+pop,accent);growingCheck(606,1053,delight.hasEvent?delight.save:1);flourish(617,1053);}
   text(state.planSaved?'YOUR WEEK, SAVED.':'PREVIEW YOUR WEEK.',48,1067,27,deep,800);subtitle('Your completed habits stay with you.',1122);subtitle('Training days and targets are yours to change.',1164);button(state.planSaved?'Plan saved. Ask Gobhi next':'Save this sample plan');
  }else if(name==='assistant'){
   heading('A LITTLE ASK.','A WAY FORWARD.','Ask Gobhi. Make the next step yours.');
   box(48,385,624,166,29,'#eee6fb');text(wellbeing?'I have 20 minutes for myself.':state.context==='gym'?'I have 20 minutes at my gym.':'I have 20 minutes at home.',76,443,29,ink,600);text(wellbeing?'Help me make a little space.':'What can I train today?',76,491,28,ink,600);
   const response=motion.assistantProgress??1;
   if(response<.70&&!state.routineSaved){for(let i=0;i<3;i++)circle(567+i*23,524+(motion.still?0:Math.sin(t*5-i*.8)*3),4.5,deep);}
   panel(0,()=>{box(48,586,624,464,30,accent);badge('GOBHI SUGGESTS',77,618,236);x.save();x.translate(619,638);x.rotate(motion.still?0:t*.6);sparkle(0,0,12+(motion.still?0:Math.sin(t*2)*2),deep,.65);x.restore();text(wellbeing?'A LITTLE RESET':'20-MINUTE FULL BODY',77,731,34,deep,800);
    const rows=wellbeing?['A gentle 10-minute walk','5 minutes to stretch','5 minutes to breathe']:state.context==='gym'?['Goblet squat · 3 sets','Cable row · 3 sets','An easy five-minute finish']:['Bodyweight squat · 3 sets','Incline push-up · 3 sets','A little stretch to finish'];
    rows.forEach((row,i)=>{const arrival=ease(response*1.8-i*.28);x.save();x.globalAlpha=arrival;x.translate(0,(1-arrival)*12);growingCheck(80,803+i*76,arrival);text(row,126,812+i*76,26,deep,600);x.restore();});});
   if(state.routineSaved){circle(619,1094,24,accent);growingCheck(608,1094,delight.hasEvent?delight.save:1);flourish(619,1094);}
   text(state.routineStarted?'YOUR ROUTINE IS READY.':state.routineSaved?'SAVED TO YOUR ROUTINES.':'YOU CHOOSE WHAT TO KEEP.',48,1110,25,deep,800);subtitle('Illustrative AI conversation · sample response',1160);button(state.routineStarted?'Ready. Let’s see Today':state.routineSaved?'Start this routine':'Save this suggested routine');
  }else if(name==='home'){
   heading('YOUR PLAN.','YOUR TODAY.','Your habits. One connected little day.');
   panel(0,()=>{box(48,382,624,211,30,accent);badge(state.planSaved?'YOUR SAVED PLAN':'YOUR SAMPLE DAY',76,410,235);text(wellbeing?'MAKE A LITTLE SPACE.':state.routineStarted?'YOUR ROUTINE IS READY.':'SHOW UP FOR YOURSELF.',76,522,34,ink,800);text(wellbeing?'Water, steps, sleep and a check-in.':state.context==='gym'?'Your gym. Your own strong.':'At home. Your own pace.',77,567,24,deep);});
   const rows=[['A little hydration',state.waterLogs>0,((state.water||1000)/1000).toFixed(2).replace(/0$/,'')+' L / 2.5 L'],['A good meal',!!state.foodSaved,state.foodSaved?meals[state.loggedMeal||'dal'].short:'Your next little fuel'],[wellbeing?'A little wellbeing':'Your own strong',wellbeing?!!state.wellbeingDone:!!state.workoutSaved,wellbeing?'Steps, sleep and mood':state.routineSaved?'Your saved 20-minute routine':'A little movement for you']];
   rows.forEach((row,i)=>{const arrival=ease(reveal*1.55-i*.18),py=673+i*151;x.save();x.globalAlpha=arrival;x.translate((1-arrival)*18,0);circle(82,py+29,30,row[1]?'#b9ed9b':'#e7eddb');x.strokeStyle=row[1]?deep:'#a7b78e';x.lineWidth=2.5;x.beginPath();x.arc(82,py+29,35+(motion.still?0:Math.sin(t*1.8-i*.6)*1.5),-Math.PI/2,-Math.PI/2+Math.PI*2*arrival);x.stroke();if(row[1])growingCheck(71,py+29,arrival);text(row[0],132,py+22,29,ink,600);text(row[2],132,py+65,23,muted);line(py+102);x.restore();});
   text(Math.round(littleWins(state)*ease(reveal))+' OF 3 LITTLE WINS',48,1179,24,deep,800);button('Start with a little water');
  }else if(name==='water'){
   heading('SIP. LOG.','LET\u2019S GO.','A little hydration. A lot of good.');
   panel(0,e=>{box(48,382,624,627,32,accent);badge('DAILY HYDRATION',77,412,206);
    const amount=motion.waterDisplay??state.water??1000,level=Math.min(amount/2500,1),pouring=!motion.still&&((state.waterLogs===0&&(motion.waterScroll||0)>.01)||Math.abs(amount-state.water)>2),saved=state.waterLogs>0&&Math.abs(amount-state.water)<3;
    x.save();x.translate(360,665);x.rotate(Math.sin(t*.6)*.007);box(-126,-166,252,334,43,'#ffffff75');x.save();x.beginPath();x.roundRect(-115,-155,230,312,34);x.clip();
    const top=157-312*level,g=x.createLinearGradient(0,top,0,160);g.addColorStop(0,'#35b8ed');g.addColorStop(1,'#087db8');x.fillStyle=g;x.beginPath();x.moveTo(-130,170);x.lineTo(-130,top);x.bezierCurveTo(-50,top+Math.sin(t*.75)*8,55,top-Math.sin(t*.75)*8,130,top);x.lineTo(130,170);x.closePath();x.fill();
    for(let i=0;i<5;i++){const by=150-((t*9+i*39)%200);if(by>top+14)circle(-72+(i*37)%150,by,2+i%2,'#c9f5ff80');}
    if(pouring){const phase=(t*.36)%1,dy=-165+(top+160)*phase;x.save();x.globalAlpha=Math.sin(phase*Math.PI)*.7;x.fillStyle='#35afe0';x.beginPath();x.moveTo(0,dy-8);x.bezierCurveTo(11,dy+3,5,dy+9,0,dy+9);x.bezierCurveTo(-5,dy+9,-11,dy+3,0,dy-8);x.fill();x.restore();for(let i=0;i<2;i++){const ripple=(t*.18+i*.5)%1;x.strokeStyle=`rgba(220,249,255,${(1-ripple)*.28})`;x.lineWidth=1.5;x.beginPath();x.ellipse(0,top+4,18+ripple*74,2+ripple*5,0,0,Math.PI*2);x.stroke();}}
    x.restore();x.strokeStyle='#095e8840';x.lineWidth=3;x.beginPath();x.roundRect(-126,-166,252,334,43);x.stroke();x.restore();
    box(443,851,193,38,19,saved?'#d7eddc':'#ffffff66');text(saved?'SIP SAVED \u2713':state.waterLogs>0?'A LITTLE SIP...':'SCROLL TO POUR',457,877,15,deep,600);
    text((amount/1000).toFixed(2).replace(/0$/,'')+' L',78,932,80,deep,800);text('of your 2.5 L goal',78,974,22,deep);badge(Math.round(level*100)+'% THERE',466,912,165);
   });
   panel(.25,()=>{text(state.waterLogs>0?'NICE. KEEP THE FLOW.':'A SLOW SCROLL. A LITTLE SIP.',48,1072,21,deep,800);subtitle(state.waterScrollLogged?'One little glass, saved with your scroll.':state.waterLogs>0?state.waterLogs+' little sips, remembered.':'Or tap below to log a glass yourself.',1124);});button('Log '+(state.waterAmount||250)+' ml of water');
  }else if(name==='food'){
   heading('GOOD FOOD.','GOOD MOOD.','Your everyday meals. All in one place.');
   panel(0,()=>{box(48,382,624,363,32,accent);badge('TODAY\u2019S FUEL',77,411);
    const gather=motion.mealProgress??1;x.save();x.translate(360,572+Math.sin(t*1.1)*4+(1-gather)*13);x.rotate(-.08+Math.sin(t*.7)*.012);
    [['#b9503320',24,208,111],['#fff4d4',0,202,111],['#eed7ac',0,177,90]].forEach(([color,y,rx,ry])=>{x.fillStyle=color;x.beginPath();x.ellipse(0,y,rx,ry,0,0,Math.PI*2);x.fill();});
    (state.meal==='paneer'?[['#ecd49a',-.2],['#629543',2],['#e0a65c',4]]:[['#df8540',-.2],['#629543',2],['#efc75e',4]]).forEach(([color,a],i)=>{const g=ease(gather*1.5-i*.15);x.save();x.globalAlpha=.45+.55*g;x.fillStyle=color;x.beginPath();x.ellipse(Math.cos(a)*(72+(1-g)*38),Math.sin(a)*32-(1-g)*24,79,43,-.2,0,Math.PI*2);x.fill();x.restore();});x.restore();
    for(let i=0;i<3;i++){x.strokeStyle='#fff8ef99';x.lineWidth=4;x.beginPath();const sy=490-((t*12+i*9)%26);x.moveTo(307+i*48,sy);x.bezierCurveTo(290+i*48,sy-15,324+i*48,sy-25,307+i*48,sy-40);x.stroke();}
   });
   const meal=meals[state.meal||'dal'],mealDone=state.foodSaved&&state.loggedMeal===state.meal;
   panel(.12,()=>{text(meal.name,48,805,33,ink,600);subtitle('Your sample meal \u00b7 1 serving',850);[['Protein',meal.protein,'#cceba8'],['Carbs',meal.carbs,'#ffd678'],['Fat',meal.fat,'#efc5eb']].forEach((a,i)=>{const px=48+i*215,pop=mealDone?Math.sin(Math.max(0,Math.min(1,(motion.mealSave||0)*1.5-i*.18))*Math.PI)*7:0;box(px,894-pop,195,119,20,a[2]);text(a[0],px+19,937-pop,18,deep);text(a[1],px+19,985-pop,37,ink,800);});});
   if(mealDone){x.save();x.globalAlpha=ease(motion.mealSave??1);box(420,655,215,45,22,ink);text('MEAL SAVED',439,685,17,'#fff8ef',600);growingCheck(592,678,motion.mealSave??1,'#fff8ef');x.restore();}
   panel(.25,()=>{line(1059);text(mealDone?'LUNCH, LOGGED. NICE ONE.':'A LITTLE SCROLL. LUNCH, SORTED.',48,1110,21,deep,800);subtitle(state.foodScrollLogged?'Your meal found its way into your day.':'Scroll to save. Or tap to log it yourself.',1160);});button(mealDone?'Meal logged. Nice one!':'Log this meal');
  }else if(name==='workout'){
   if(wellbeing){
    heading('A LITTLE SPACE.','A BETTER DAY.','No workout required. This day is yours.');
    [['STEPS','A gentle walk','#d8ed9b'],['SLEEP','Make room for 8 hours','#dcd0f3'],['MOOD','A moment to check in','#ffcfab']].forEach((a,i)=>{const arrive=ease(reveal*1.6-i*.18),py=400+i*231;x.save();x.globalAlpha=arrive;x.translate(0,(1-arrive)*18);box(48,py,624,197,28,a[2]);text(a[0],77,py+54,22,deep,600);text(a[1],77,py+119,35,ink,800);const breath=motion.still?1:1+Math.sin(t*1.3+i*.6)*.13;x.strokeStyle=deep;x.lineWidth=2;x.beginPath();x.arc(611,py+91,25*breath,0,Math.PI*2);x.stroke();if(state.wellbeingDone)growingCheck(600,py+91,delight.hasEvent?delight.save:arrive);x.restore();});
    subtitle('Your intentions belong in Today, too.',1170);button(state.wellbeingDone?'Your little reset, saved':'Save these sample intentions');
   }else{

   heading('YOUR SETS.','YOUR STRONG.','Show up. Put it down. Build your story.');
   panel(0,()=>{box(48,382,624,180,30,accent);badge('FULL BODY STRENGTH',76,410,244);text(homeRoutine?'BODYWEIGHT SQUAT':'GOBLET SQUAT',77,518,homeRoutine?35:42,deep,800);circle(614,485,27,'#fffaf07f');text('\u2197',596,499,35,deep,600);});
   text('SET',65,632,18,muted,600);text('WEIGHT',228,632,18,muted,600);text('REPS',443,632,18,muted,600);
   [1,2,3].forEach((set,i)=>panel(.08+i*.14,()=>{const y=673+i*114,done=set<=(state.workoutSets||0),pulse=done?(motion.setAnimations?.[i]??1):0;x.save();x.translate(0,done?-Math.sin(pulse*Math.PI)*4:0);box(48,y,624,87,19,done?accent:'#ece4f6');circle(91,y+44,25,'#fffaf096');text(String(set),82,y+55,29,deep,800);text(homeRoutine?'Bodyweight':'24 kg',231,y+55,homeRoutine?22:32,ink,800);text('10',456,y+55,32,ink,600);if(done){circle(617,y+44,20,'#ffffff55');growingCheck(606,y+44,pulse);}else circle(617,y+44,11,'#d2c3e5');x.restore();}));
   panel(.45,()=>{line(1053);text(state.workoutSaved?'SAVED. THAT\u2019S YOUR STRONG.':(state.workoutSets||0)+' OF 3 SETS. KEEP SHOWING UP.',48,1110,25,deep,800);subtitle(state.workoutSaved?'Three little efforts. One good feeling.':'Keep scrolling. One set at a time.',1158);});button(state.workoutSaved?'Workout saved. Keep going!':'Log set '+((state.workoutSets||0)+1));
   }
  }else if(name==='history'){
   heading('SMALL STEPS.','LOOK AT YOU.','See the everyday adding up.');
   const growth=motion.historyProgress??1,week=state.historyWeek,values=week?[.55,.35,1,.2,.8,.12,.12]:[Math.min(1,(state.water||1000)/2500),state.foodSaved?1:0,wellbeing?(state.wellbeingDone?1:0):(state.workoutSets||0)/3],labels=week?['M','T','W','T','F','S','S']:['WATER','MEALS',wellbeing?'HABITS':'TRAIN'];
   panel(0,()=>{box(48,382,624,323,30,accent);badge(week?'SAMPLE WEEK':'YOUR LITTLE DAY',76,410,184);text(Math.round(littleWins(state)*ease(growth))+' little wins',76,516,59,deep,800);text('ALL ADDING UP',439,442,15,deep,600);
    values.forEach((h,i)=>{const px=week?80+i*80:114+i*190,width=week?46:74,rise=ease((growth-i*.055)*1.45),height=h*88*rise;box(px,635-height,width,Math.max(3,height),8,i===2?deep:'#5ca84490');text(labels[i],px+(week?13:3),674,week?16:15,deep,600);});
    // The rising trace shows cumulative contributions, using this demo day's actual logs.
    const total=values.reduce((a,b)=>a+b,0);if(total>0){let sum=0;const points=[[92,635],...values.map((v,i)=>{sum+=v;return[week?105+i*80:151+i*190,635-100*sum/values.length];})],trace=ease((growth-.12)/.82)*(points.length-1),visible=[points[0]];for(let i=1;i<points.length;i++){const q=Math.max(0,Math.min(1,trace-(i-1)));if(q<=0)break;visible.push([points[i-1][0]+(points[i][0]-points[i-1][0])*q,points[i-1][1]+(points[i][1]-points[i-1][1])*q]);}
     x.save();x.lineJoin=x.lineCap='round';x.strokeStyle='#fffef1';x.lineWidth=5;x.beginPath();visible.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.stroke();const [px,py]=visible[visible.length-1],pulse=motion.still?0:(Math.sin(t*2)+1)*3;circle(px,py,10+pulse,'#fffef135');circle(px,py,6,'#fffef1');x.restore();}
   });
   [['\u2197',wellbeing?'Your little reset':'Your own strong',wellbeing?(state.wellbeingDone?'Intentions saved':'Room for a little care'):(state.workoutSets||0)+' of 3 sets'+(state.workoutSaved?' \u00b7 Saved':' logged'),'#cfbaff'],['\u25d2','A little hydration',((state.water||1000)/1000).toFixed(2).replace(/0$/,'')+' L \u00b7 '+(state.waterLogs||0)+' glasses logged','#a9e5fa'],['\u2713',state.foodSaved?'Lunch, remembered':'A little room for lunch',state.loggedMeal?meals[state.loggedMeal].short+' \u00b7 Logged':'Your meal is waiting to be logged','#ffbb96']].forEach((a,i)=>panel(.14+i*.12,()=>{const y=773+i*140;circle(78.5,y+30.5,35,a[3]);const fill=ease((growth-.16-i*.15)/.48);x.strokeStyle=deep;x.lineWidth=3;x.beginPath();x.arc(78.5,y+30.5,35,-Math.PI/2,-Math.PI/2+Math.PI*2*fill);x.stroke();text(a[0],65,y+42,29,ink,600);text(a[1],135,y+22,27,ink,600);text(a[2],135,y+60,19,muted);line(y+102);}));if(!wellbeing&&state.workoutSets>0)text(homeRoutine?(state.workoutSets*10)+' bodyweight reps, remembered.':(state.workoutSets*24*10)+' kg training volume in this sample day.',48,1179,19,deep,600);text(wellbeing?'A little care. A little more room for you.':'Planned rest tomorrow. Your next session follows.',48,1212,20,deep,600);button(state.historyWeek?'Back to your day':'See your sample week');
  }else if(name==='buddies'){
   heading('YOUR PEOPLE.','YOUR PACE.','Find your people. Keep showing up together.');
   const arrive=ease(reveal);x.save();x.globalAlpha=arrive;x.translate(0,(1-arrive)*16);
   box(48,385,624,250,30,accent);circle(133,475,52,'#fff9ee');text('A',112,492,47,deep,800);text('Asha',215,467,39,ink,800);text(wellbeing?'Walks \u00b7 Wellbeing \u00b7 Your pace':state.context==='gym'?'Strength \u00b7 My gym \u00b7 Your pace':'Strength \u00b7 At home \u00b7 Your pace',215,512,23,deep);badge(state.buddyFollowing?'FOLLOWING \u2713':'MEET YOUR PEOPLE',215,552,247);if(state.buddyFollowing){circle(617,573,23,'#fff9ee');growingCheck(606,573,delight.hasEvent&&!state.buddyShared?delight.save:1);if(!state.buddyShared)flourish(617,573);}x.restore();
   [['DISCOVER','Find your people','#dcebb4'],['CHAT','With your matches','#d6c6f4'],['SHARE','Your own records','#f7d3b2']].forEach((a,i)=>{const px=48+i*215,pop=ease(reveal*1.65-i*.15);x.save();x.globalAlpha=pop;x.translate(0,(1-pop)*14);box(px,673,195,139,23,a[2]);text(a[0],px+18,718,21,deep,800);text(a[1],px+18,774,18,ink,600);if(i===1&&!motion.still)for(let k=0;k<3;k++)circle(px+24+k*14,739,2.5+Math.sin(t*3-k*.6),deep);x.restore();});
   text('A LITTLE WIN. A LITTLE ENCOURAGEMENT.',48,875,22,deep,800);
   box(48,911,624,258,28,'#f6e9f1');circle(89,961,22,accent);text('A',80,970,23,deep,800);text('Asha \u00b7 A personal record',132,967,25,ink,600);text(wellbeing?'Made room for a gentle walk.':'Showed up. One set stronger.',78,1027,28,deep,600);
   line(1053);circle(89,1100,22,'#d8ed9b');text('Y',81,1109,22,ink,800);
   text(state.buddyShared?'You \u00b7 A little win, shared':'Your next little win belongs here.',132,1094,24,ink,600);
   text(state.buddyShared?(wellbeing?'A little reset, remembered.':state.workoutSets?state.workoutSets+' sets, remembered.':'Made room for a little movement.'):'Follow a buddy. Share your own progress.',132,1134,21,muted);
   if(state.buddyShared){circle(620,1091,23,accent);growingCheck(609,1091,delight.hasEvent?delight.save:1);flourish(619,1091);}
   text('Sample profiles \u00b7 interactive preview',48,1210,18,muted);button(state.buddyShared?'Your little win, shared':state.buddyFollowing?'Share your sample win':'Follow Asha');
  }else if(name==='map'){
   heading('YOUR WORLD.','MORE WAYS IN.','Find a little movement around you.');
   x.save();x.beginPath();x.roundRect(48,385,624,596,30);x.clip();box(48,385,624,596,30,'#e3edda');
   for(let i=0;i<6;i++){x.strokeStyle=i%2?'#fffdf4':'#d1dfc3';x.lineWidth=i%2?26:40;x.beginPath();x.moveTo(30,440+i*113);x.lineTo(710,270+i*162);x.stroke();}
   box(70,442,114,110,26,'#bdd8a1');box(465,721,148,161,29,'#bdd8a1');
   const places=[[242,570],[501,634],[314,839]],selected=state.mapPlace||0,from=delight.hasEvent?delight.mapFrom:(selected+2)%3,travel=ease(delight.hasEvent?delight.save:reveal),start=places[from],finish=places[selected],bend=[(start[0]+finish[0])/2+60,(start[1]+finish[1])/2-70];
   const route=Array.from({length:29},(_,i)=>{const q=i/28*travel,u=1-q;return [u*u*start[0]+2*u*q*bend[0]+q*q*finish[0],u*u*start[1]+2*u*q*bend[1]+q*q*finish[1]];});
   x.setLineDash([7,11]);x.lineDashOffset=motion.still?0:-t*16;x.strokeStyle='#4b7a5790';x.lineWidth=5;x.lineCap='round';x.beginPath();route.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.stroke();x.setLineDash([]);x.lineDashOffset=0;
   if(travel>.02){const cursor=route[route.length-1];circle(cursor[0],cursor[1],9,'#fffef4');circle(cursor[0],cursor[1],4,deep);}
   if(!motion.still){const beat=(t*.35)%1;x.save();x.globalAlpha=(1-beat)*.20;x.strokeStyle=deep;x.lineWidth=2;x.beginPath();x.arc(finish[0],finish[1],44+beat*22,0,Math.PI*2);x.stroke();x.restore();}
   places.forEach(([px,py],i)=>{const arrive=ease(reveal*1.7-i*.17),pulse=motion.still?1:1+Math.sin(t*1.4+i)*.035,selectedPulse=selected===i&&delight.hasEvent?(1-delight.save)*.22:0;if(selected===i&&delight.hasEvent&&delight.save<1){x.save();x.globalAlpha=(1-delight.save)*.45;x.strokeStyle=deep;x.lineWidth=3;x.beginPath();x.arc(px,py,45+delight.save*37,0,Math.PI*2);x.stroke();x.restore();}circle(px,py+(1-arrive)*24,(i===selected?42:32)*pulse*arrive*(1+selectedPulse),i===selected?deep:'#72a778');x.save();x.globalAlpha=arrive;text(String(i+1),px-10,py+12+(1-arrive)*24,30,'#fffef4',800);x.restore();});x.restore();
   text(mapPlaces[state.mapPlace||0],48,1062,31,deep,800);subtitle('Illustrative places · no location access needed',1122);subtitle('Explore gyms and find your kind of fitness.',1170);button('Explore another sample place');
  }else if(name==='coins'){
   heading('SHOW UP.','GLOW UP.',littleWins(state)?littleWins(state)+' little wins. A little celebration.':'Showing up is a little win, too.');
   const values=['10','15','20','25','30','50'],cx=360,cy=682,r=246,turn=motion.wheelAngle??t*.36,won=motion.rewardPhase==='won',spinning=motion.rewardPhase==='spinning',win=motion.rewardWin??0;
   x.save();x.translate(cx,cy);x.rotate(t*.08);for(let i=0;i<16;i++){const a=i*Math.PI/8,ray=(won?18+Math.sin(win*Math.PI)*22:8);x.strokeStyle=won?'#e7b93f55':'#e7b93f22';x.lineWidth=i%2?2:4;x.beginPath();x.moveTo(Math.cos(a)*(r+28),Math.sin(a)*(r+28));x.lineTo(Math.cos(a)*(r+28+ray),Math.sin(a)*(r+28+ray));x.stroke();}x.restore();
   panel(0,()=>{circle(cx,cy,r+19,'#f2bb3c');circle(cx,cy,r+8,ink);x.save();x.translate(cx,cy);x.rotate(turn);values.forEach((v,i)=>{const a=i/6*Math.PI*2;x.fillStyle=['#ffdb5b','#c8f06f','#ffab81','#cbb3f6','#ffe7a1','#aadd9a'][i];x.beginPath();x.moveTo(0,0);x.arc(0,0,r,a,a+Math.PI/3);x.closePath();x.fill();x.save();x.rotate(a+Math.PI/6);text(v,139,12,39,ink,800);x.restore();});x.restore();circle(cx,cy,62,ink);text('G',336,704,61,'#fff8e7',800);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;circle(cx+Math.cos(a)*(r+14),cy+Math.sin(a)*(r+14),3,Math.sin(t*3+i)>.2?'#fffaf0':'#c48625');}x.fillStyle=ink;x.beginPath();x.moveTo(338,393);x.lineTo(382,393);x.lineTo(360,444);x.closePath();x.fill();});
   panel(.2,()=>{if(won){x.save();const pop=1+Math.sin(win*Math.PI)*.04;x.translate(360,1037);x.scale(pop,pop);text('+'+(motion.rewardCount??20)+' GOBHI COINS',-253,16,47,deep,800);x.restore();}else text(spinning?'A LITTLE SUSPENSE...':'YOUR NEXT LITTLE WIN.',spinning?102:87,1053,47,deep,800);subtitle(won?'That little day? Worth celebrating.':spinning?'Here comes your little win.':'Keep scrolling to spin. Or give it a tap.',1107);text('SAMPLE REWARD \u00b7 NO CASH VALUE',157,1161,16,muted);});button(won?'A little win, collected!':spinning?'Spinning for your little win...':'Spin for a little win');
   if(won&&win<1&&!motion.still){x.save();x.globalAlpha=Math.sin(win*Math.PI);for(let i=0;i<24;i++){const a=i*2.399,spread=65+win*240;x.save();x.translate(cx+Math.cos(a)*spread,900+Math.sin(a)*spread*.65-win*60);x.rotate(a+win*3);box(-4,-7,8,14,2,['#e9b43e','#d2ed8a','#e9b3a0','#d1b9ee'][i%4]);x.restore();}x.restore();}
  }
  if(name!=='water'&&name!=='coins'&&(name!=='workout'||state.workoutSaved)&&action<1&&motion.hasAction){x.save();x.globalAlpha=Math.sin(action*Math.PI);for(let i=0;i<10;i++){const a=i*2.399,rad=45+action*245;x.save();x.translate(360+Math.cos(a)*rad,1030+Math.sin(a)*rad*.48-action*80);x.rotate(a+action*3);box(-4,-8,8,16,2,[accent,deep,'#efb93e','#ed7a5b'][i%4]);x.restore();}x.restore();}
  line(1375);
  const tabs=wellbeing?[['\u2302','Home'],['map','Map'],['buddies','Buddies'],['\u25ce','You']]:[['\u2302','Home'],['\u2197','Train'],['map','Map'],['buddies','Buddies'],['\u25ce','You']];
  tabs.forEach((a,i)=>{const center=720/tabs.length*(i+.5),px=center-14,selected=a[1]===(name==='buddies'?'Buddies':name==='map'?'Map':name==='workout'&&!wellbeing?'Train':name==='history'||name==='coins'?'You':'Home');if(selected)box(center-41,1388,82,49,24,accent);
   if(a[0]==='map'){x.strokeStyle=selected?deep:'#95a184';x.lineWidth=3;x.beginPath();x.moveTo(px-4,1399);x.lineTo(px+8,1394);x.lineTo(px+20,1399);x.lineTo(px+32,1394);x.lineTo(px+32,1424);x.lineTo(px+20,1429);x.lineTo(px+8,1424);x.lineTo(px-4,1429);x.closePath();x.moveTo(px+8,1394);x.lineTo(px+8,1424);x.moveTo(px+20,1399);x.lineTo(px+20,1429);x.stroke();}
   else if(a[0]==='buddies'){circle(center-8,1403,6.5,selected?deep:'#95a184');circle(center+9,1406,6.5,selected?deep:'#95a184');x.strokeStyle=selected?deep:'#95a184';x.lineWidth=3;x.beginPath();x.arc(center-8,1425,11,Math.PI,Math.PI*2);x.stroke();x.beginPath();x.arc(center+9,1428,11,Math.PI,Math.PI*2);x.stroke();}
   else text(a[0],px,1424,34,selected?deep:'#95a184');
   x.font=(selected?'600':'400')+' 15px GobhiWork,Arial';const labelWidth=x.measureText(a[1]).width;text(a[1],center-labelWidth/2,1462,15,selected?deep:'#95a184',selected?600:400);
  });return c;
 },
 coinMark(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.textAlign='center';x.fillStyle='#8c591b';x.font='800 174px GobhiWork,Arial';x.fillText('G',128,193);x.strokeStyle='#a7722455';x.lineWidth=4;x.beginPath();x.arc(128,128,118,0,Math.PI*2);x.stroke();return c;},
 speech(){const c=document.createElement('canvas');c.width=1100;c.height=520;const x=c.getContext('2d');x.fillStyle='#24462e';x.font='600 89px GobhiWork,Arial';x.fillText('Hi, I am Gobhi.',88,207);x.fillStyle='#738566';x.font='400 48px GobhiWork,Arial';x.fillText('Your health and fitness buddy.',91,307);x.fillStyle='#b78432';x.font='400 30px GobhiWork,Arial';x.fillText('A little better, together.',92,396);return c;},
 back(){const c=document.createElement('canvas');c.width=360;c.height=760;const x=c.getContext('2d');x.fillStyle='#314e3b';x.fillRect(0,0,360,760);x.fillStyle='#7b9271';x.textAlign='center';x.font='600 29px GobhiWork,Arial';x.fillText('G',180,418);x.font='400 12px GobhiWork,Arial';x.fillText('phool gobhi',180,455);return c;}
};
