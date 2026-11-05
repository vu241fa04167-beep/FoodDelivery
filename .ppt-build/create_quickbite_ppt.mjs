import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const outDir = path.resolve('.ppt-build/rendered');
const finalDir = path.resolve('.ppt-output');
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(finalDir, { recursive: true });

const W = 1280, H = 720;
const C = { orange:'#F97316', orangeDark:'#C2410C', cream:'#FFF7ED', ink:'#172033', muted:'#64748B', line:'#E2E8F0', green:'#15803D', blue:'#0F766E', white:'#FFFFFF', soft:'#FFEDD5' };
const deck = Presentation.create({ slideSize:{width:W,height:H} });

function box(slide, x,y,w,h, fill=C.white, radius=18, line=null) {
  return slide.shapes.add({ geometry: radius ? 'roundRect' : 'rect', position:{left:x,top:y,width:w,height:h}, fill, line: line ? {style:'solid',fill:line,width:1} : {style:'solid',fill:'none',width:0}, borderRadius: radius ? 'rounded-xl' : undefined });
}
function text(slide, value, x,y,w,h, style={}) {
  const s = slide.shapes.add({geometry:'textbox', position:{left:x,top:y,width:w,height:h}, fill:'none', line:{style:'solid',fill:'none',width:0}});
  s.text = value;
  s.text.style = {fontFamily:'Aptos', fontSize:style.fontSize ?? 20, color:style.color ?? C.ink, bold:style.bold ?? false, italic:style.italic ?? false, align:style.align ?? 'left', verticalAlign:style.verticalAlign ?? 'top'};
  return s;
}
function title(slide, kicker, heading, sub='') {
  text(slide,kicker.toUpperCase(),64,42,500,20,{fontSize:12,color:C.orangeDark,bold:true});
  text(slide,heading,64,72,1120,58,{fontSize:34,color:C.ink,bold:true});
  if(sub) text(slide,sub,64,136,1020,34,{fontSize:17,color:C.muted});
}
function footer(slide, n) { text(slide,`QUICKBITE  /  ${String(n).padStart(2,'0')}`,64,681,300,16,{fontSize:10,color:C.muted,bold:true}); }
function bullet(slide, x,y, label, body, color=C.orange) { box(slide,x,y,10,10,color,5); text(slide,label,x+24,y-5,220,24,{fontSize:18,bold:true}); text(slide,body,x+24,y+23,420,42,{fontSize:15,color:C.muted}); }
function iconCircle(slide, x,y,label,fill=C.orange) { box(slide,x,y,48,48,fill,24); text(slide,label,x,y+9,48,28,{fontSize:18,color:C.white,bold:true,align:'center'}); }

// 1 Cover
{
 const s=deck.slides.add(); s.background.fill=C.cream;
 box(s,0,0,520,H,C.orange,0); text(s,'QUICKBITE',70,92,350,28,{fontSize:18,color:C.white,bold:true});
 text(s,'A simpler way\nto order food',70,166,380,150,{fontSize:46,color:C.white,bold:true});
 text(s,'MERN Stack Food Delivery Platform',70,354,350,34,{fontSize:21,color:'#FFEDD5'});
 text(s,'Team: [Add team member names]',70,600,360,24,{fontSize:16,color:C.white,bold:true});
 box(s,610,82,570,556,C.white,28); text(s,'01',655,118,70,50,{fontSize:28,color:C.orange,bold:true});
 text(s,'Browse',662,208,240,40,{fontSize:27,color:C.ink,bold:true}); text(s,'Choose',662,272,240,40,{fontSize:27,color:C.ink,bold:true}); text(s,'Book',662,336,240,40,{fontSize:27,color:C.ink,bold:true});
 box(s,962,190,120,200,C.soft,26); text(s,'🍛',975,245,95,70,{fontSize:52,align:'center'}); text(s,'Fresh biryani,\nclear tracking',952,420,180,55,{fontSize:16,color:C.orangeDark,bold:true,align:'center'});
 text(s,'Project presentation',662,575,260,28,{fontSize:15,color:C.muted}); footer(s,1);
}
// 2 problem
{
 const s=deck.slides.add({background:{fill:C.cream}}); title(s,'01 / Context','The problem we wanted to solve','Ordering food should feel clear from the first click to the final delivery update.');
 box(s,64,220,1152,330,C.white,24);
 bullet(s,110,270,'Scattered choices','Customers often jump between menus, categories, and unclear restaurant information.');
 bullet(s,110,370,'Uncertain delivery','After placing an order, customers need a clear status and expected delivery time.');
 bullet(s,690,270,'Broken trust','Wrong images, stale sessions, and confusing errors make a simple order feel risky.',C.green);
 bullet(s,690,370,'Disconnected operations','Restaurant staff and administrators need one place to receive and manage orders.',C.green);
 text(s,'QuickBite focuses the experience around one trusted restaurant catalog.',110,488,930,28,{fontSize:19,color:C.orangeDark,bold:true}); footer(s,2);
}
// 3 objectives
{
 const s=deck.slides.add({background:{fill:C.white}}); title(s,'02 / Direction','Project objectives','A focused set of goals guided the build.');
 const objs=[['01','Make discovery simple','A clean home page and category-led menu.'],['02','Make ordering reliable','Validated prices, quantities, addresses, and payments.'],['03','Make delivery visible','ETA, status steps, partner details, and order history.'],['04','Make operations practical','Owner and admin views for incoming orders and platform control.']];
 objs.forEach((o,i)=>{const x=64+(i%2)*580,y=210+Math.floor(i/2)*190; box(s,x,y,530,150,i===0?C.soft:'#F8FAFC',20); iconCircle(s,x+26,y+26,o[0],i<2?C.orange:C.green); text(s,o[1],x+94,y+27,380,28,{fontSize:20,bold:true}); text(s,o[2],x+94,y+66,380,45,{fontSize:15,color:C.muted});}); footer(s,3);
}
// 4 tech
{
 const s=deck.slides.add({background:{fill:C.cream}}); title(s,'03 / Build','Technologies and tools','The stack keeps the project familiar, modular, and easy to extend.');
 const tech=[['M','MongoDB','Document database for users, restaurants, menu items, and orders.',C.green],['E','Express','REST API routes, validation, authentication, and error handling.',C.orange],['R','React','Responsive customer, owner, and admin interfaces.',C.blue],['N','Node.js','Backend runtime connecting the API, database, and business logic.',C.orangeDark]];
 tech.forEach((t,i)=>{const x=80+i*290; box(s,x,235,250,230,C.white,22); iconCircle(s,x+28,264,t[0],t[3]); text(s,t[1],x+28,340,190,28,{fontSize:21,bold:true}); text(s,t[2],x+28,385,188,65,{fontSize:14,color:C.muted});});
 text(s,'Supporting tools',80,525,200,25,{fontSize:16,color:C.orangeDark,bold:true}); text(s,'Vite  ·  JWT  ·  Mongoose  ·  Tailwind CSS  ·  Render  ·  MongoDB Atlas',80,557,900,28,{fontSize:17,color:C.ink,bold:true}); footer(s,4);
}
// 5 architecture
{
 const s=deck.slides.add({background:{fill:C.white}}); title(s,'04 / Structure','System architecture and workflow','The customer, operations team, and database meet through one API layer.');
 box(s,64,210,1152,350,'#F8FAFC',24);
 const nodes=[['Customer UI','React + Vite',100,300,C.orange],['REST API','Express + Node.js',400,300,C.blue],['MongoDB','Mongoose models',700,300,C.green],['Operations','Owner + Admin',1000,300,C.orangeDark]];
 nodes.forEach(([a,b,x,y,c])=>{box(s,x,y,190,110,C.white,18,c); text(s,a,x+18,y+24,154,25,{fontSize:18,bold:true,align:'center'}); text(s,b,x+18,y+60,154,25,{fontSize:13,color:C.muted,align:'center'});});
 // editable connectors
 [290,590,890].forEach(x=>{const l=s.shapes.add({geometry:'line',position:{left:x,top:350,width:100,height:0},line:{style:'solid',fill:C.orange,width:3}});});
 text(s,'1. Browse menu',94,475,170,20,{fontSize:13,color:C.muted,align:'center'}); text(s,'2. Validate order',380,475,220,20,{fontSize:13,color:C.muted,align:'center'}); text(s,'3. Save + track',680,475,220,20,{fontSize:13,color:C.muted,align:'center'}); text(s,'4. Prepare + deliver',965,475,220,20,{fontSize:13,color:C.muted,align:'center'}); footer(s,5);
}
// 6 features
{
 const s=deck.slides.add({background:{fill:C.cream}}); title(s,'05 / Product','Features customers can feel','The important parts are visible in the flow, not hidden in the code.');
 const features=[['Menu discovery','Browse categories, filter veg or non-veg, and sort by price or name.'],['Accurate catalog','Dish-specific images, descriptions, prices, and availability.'],['Cart and checkout','Quantity controls, coupons, addresses, tax, and payment choice.'],['Order tracking','Live status steps, ETA, delivery partner, and review after delivery.'],['Operations','Owner receives incoming orders. Admin can monitor platform orders.'],['Responsive UI','The same flow works on desktop and mobile screens.']];
 features.forEach((f,i)=>{const x=70+(i%3)*390,y=210+Math.floor(i/3)*190; box(s,x,y,340,145,C.white,20); text(s,`0${i+1}`,x+24,y+22,40,22,{fontSize:13,color:C.orange,bold:true}); text(s,f[0],x+24,y+53,290,25,{fontSize:19,bold:true}); text(s,f[1],x+24,y+88,286,42,{fontSize:14,color:C.muted});}); footer(s,6);
}
// 7 data/API
{
 const s=deck.slides.add({background:{fill:C.white}}); title(s,'06 / Engineering','Database design and API integration','Each major user action maps to a small, testable API surface.');
 box(s,64,205,520,360,C.cream,22); text(s,'Core collections',96,240,260,28,{fontSize:20,bold:true});
 const cols=['User','Restaurant','MenuItem','Order','Coupon','DeliveryPartner']; cols.forEach((c,i)=>{const y=292+i*38; box(s,96,y,180,28,i%2?C.white:C.soft,10); text(s,c,110,y+5,150,18,{fontSize:14,bold:true});});
 box(s,640,205,576,360,'#F8FAFC',22); text(s,'Representative API flow',675,240,300,28,{fontSize:20,bold:true});
 const flow=[['GET','/restaurants/:id/menu'],['POST','/orders'],['GET','/orders/mine'],['PATCH','/orders/:id/status'],['GET','/admin/orders']]; flow.forEach((f,i)=>{const y=292+i*46; box(s,675,y,74,28,f[0]==='POST'?C.orange:C.blue,10); text(s,f[0],675,y+5,74,18,{fontSize:12,color:C.white,bold:true,align:'center'}); text(s,f[1],775,y+5,350,18,{fontSize:15,color:C.ink,bold:true});}); footer(s,7);
}
// 8 screenshots
{
 const s=deck.slides.add({background:{fill:C.cream}}); title(s,'07 / Evidence','Project screenshots','The interface keeps restaurant identity and ordering context visible.');
 const img1=path.resolve('.ppt-build/header-rating.png'); const img2=path.resolve('.ppt-build/header-name.png');
 box(s,64,210,530,330,C.white,20); await slideImage(s,img1,'Restaurant info header',92,246,474,168); text(s,'Rating and delivery time stay easy to scan.',92,448,420,26,{fontSize:16,color:C.muted});
 box(s,650,210,566,330,C.white,20); await slideImage(s,img2,'Menu context header',678,246,510,168); text(s,'The restaurant name and cuisine anchor the menu.',678,448,460,26,{fontSize:16,color:C.muted});
 text(s,'The full app continues the journey through menu, cart, checkout, and order tracking.',64,594,1000,28,{fontSize:18,color:C.orangeDark,bold:true}); footer(s,8);
}
async function slideImage(slide,path,alt,x,y,w,h){ slide.images.add({blob:await fs.readFile(path),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}}); }
// 9 challenges
{
 const s=deck.slides.add({background:{fill:C.white}}); title(s,'08 / Learning','Challenges and future scope','The build became stronger by fixing the details customers notice first.');
 box(s,64,210,530,320,C.cream,22); text(s,'Challenges we handled',96,245,300,25,{fontSize:20,bold:true}); ['Keeping menu images matched to names','Preventing stale tokens from breaking orders','Protecting server-side totals and status changes','Keeping the single-restaurant flow focused'].forEach((v,i)=>{iconCircle(s,96,298+i*50,String(i+1),C.orange); text(s,v,162,308+i*50,370,24,{fontSize:15,color:C.ink,bold:true});});
 box(s,650,210,566,320,'#F8FAFC',22); text(s,'Next steps',682,245,300,25,{fontSize:20,bold:true}); ['Real payment gateway integration','Push notifications for status changes','Delivery partner location updates','Analytics for menu and order trends'].forEach((v,i)=>{iconCircle(s,682,298+i*50,String(i+1),C.green); text(s,v,748,308+i*50,400,24,{fontSize:15,color:C.ink,bold:true});}); footer(s,9);
}
// 10 conclusion
{
 const s=deck.slides.add({background:{fill:C.orange}}); text(s,'QUICKBITE',70,70,300,26,{fontSize:17,color:C.white,bold:true}); text(s,'A complete food ordering flow,\nfrom menu to doorstep.',70,170,800,120,{fontSize:42,color:C.white,bold:true}); text(s,'The project combines a focused customer experience with practical restaurant and admin operations.',74,335,670,58,{fontSize:21,color:'#FFEDD5'}); box(s,74,480,410,72,C.white,18); text(s,'Thank you',104,502,300,30,{fontSize:24,color:C.orangeDark,bold:true}); text(s,'Questions?',70,625,260,30,{fontSize:18,color:C.white,bold:true}); footer(s,10);
}

for (const [idx, slide] of deck.slides.items.entries()) {
  const png = await deck.export({slide, format:'png', scale:1});
  await fs.writeFile(path.join(outDir, `slide-${String(idx+1).padStart(2,'0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(path.join(finalDir,'QuickBite_Project_Presentation_draft.pptx'));
console.log('created', path.join(finalDir,'QuickBite_Project_Presentation_draft.pptx'));
