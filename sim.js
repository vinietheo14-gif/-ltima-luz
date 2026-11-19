// Simulação do jogo (roda só no anfitrião): movimento, geradores, caçador, habilidades
// ---------- SIMULAÇÃO (anfitrião) ----------
// Corrida: gasta stamina mais rápido (sprint curto), mas é mais veloz. Andar normal não mudou.
const STA_DRAIN=60,RUN_SV=200,RUN_KI=200;
function hitWall(px,py,r){
 if(px<r||py<r||px>W-r||py>H-r)return true;
 for(const w of MP.wl){const cx=Math.max(w[0],Math.min(px,w[0]+w[2])),cy=Math.max(w[1],Math.min(py,w[1]+w[3]));if((px-cx)**2+(py-cy)**2<r*r)return true}
 return false;
}
function doorDist(px,py,i){const w=MP.doors[i].r;return Math.hypot(px-Math.max(w[0],Math.min(px,w[0]+w[2])),py-Math.max(w[1],Math.min(py,w[1]+w[3])))}
function hitDoor(px,py,r){for(let i=0;i<MP.doors.length;i++)if(G.dd[i]===1&&doorDist(px,py,i)<r)return true;return false}
function doorNear(){const h=G.h;return G.dd.findIndex((s,i)=>s===1&&doorDist(h.x,h.y,i)<h.r+16)}
function pressBtn(q){for(let i=0;i<MP.doors.length;i++)if(G.dd[i]===0&&MP.doors[i].b.some(b=>Math.hypot(q.x-b[0],q.y-b[1])<24)&&doorDist(G.h.x,G.h.y,i)>G.h.r+6){G.dd[i]=1;return true}return false}
function move(e,dx,dy){const hit=(a,b)=>hitWall(a,b,e.r)||(e===G.h&&hitDoor(a,b,e.r));if(!hit(e.x+dx,e.y))e.x+=dx;if(!hit(e.x,e.y+dy))e.y+=dy}
function los(a,b){
 const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.ceil(d/8);
 for(let i=1;i<n;i++){const t=i/n,px=a.x+(b.x-a.x)*t,py=a.y+(b.y-a.y)*t;
  for(const w of MP.wl)if(px>w[0]&&px<w[0]+w[2]&&py>w[1]&&py<w[1]+w[3])return false}
 return true;
}
function mkKits(){const c=MP.spots.filter(s=>!MP.gens.some(g=>Math.hypot(g.x-s[0],g.y-s[1])<40)&&!MP.sp.some(p=>Math.hypot(p[0]-s[0],p[1]-s[1])<110)&&Math.hypot(s[0]-MP.hs[0],s[1]-MP.hs[1])>200&&Math.hypot(s[0]-MP.ex[0]-32,s[1]-MP.ex[1]-32)>100).sort(()=>Math.random()-.5),o=[];for(const d of [260,130])for(const s of c){if(o.length>=7)break;if(!o.some(k=>k.x===s[0]&&k.y===s[1])&&o.every(k=>Math.hypot(k.x-s[0],k.y-s[1])>d))o.push({x:s[0],y:s[1],on:1})}return o}
function startGame(){
 if(inGame&&G&&!G.over)return;
 {let gone=false;for(const id of Object.keys(lobby))if(id!=='host'&&!(conns[id]&&conns[id].open)){delete lobby[id];gone=true}if(gone)pushLobby()}
 const m=Math.floor(Math.random()*10);MP=build(m);BG=themeBg(m);
 const ids=Object.keys(lobby);let hid=null;
 if(ids.length>1){const c=chances();let r=Math.random()*100,a=0;for(const i of ids){a+=c[i];if(r<a){hid=i;break}}if(!hid)hid=ids[0]}
 G={m,pl:{},h:{x:MP.hs[0],y:MP.hs[1],r:12,st:hid?'h':'p',tx:300,ty:150,mem:0,stun:0,jit:0,ja:0,px:0,py:0,chk:0,cd:0,sw:0,sta:60,tired:0,dr:0,mv:0,dash:0,fu:0,fx:-1,fy:0,still:0,hp:200,slow:0,hid},
  gens:MP.gens.map(g=>({...g})),noises:[],al:[],xt:null,over:null,rdy:{},ap:0,mk:null,bm:[],traps:[],kits:mkKits(),dd:MP.doors.map(()=>0),hbk:0};
 let k=0;
 for(const id of ids){const s=MP.sp[k++];
  G.pl[id]={n:lobby[id].n,role:id===hid?'h':'s',x:s[0],y:s[1],r:9,hp:id===hid?200:100,sta:id===hid?60:100,inv:0,fl:0,s:0,mg:null,gc:0,kills:0,inp:{x:0,y:0,r:false},act:false,ci:k-1,dr:0,mv:0,ch:id===hid?lobby[id].ki:lobby[id].sv,mh:id===hid?200:100,cd:0,bf:0,cn:0,cu:0,sl:0,sw:0,kit:0,dash:0,dx:0,dy:0,stuck:0}}
 inGame=true;disp={};closeMG();$('ov').classList.add('hide');sendAll({t:'go',m});show('gv');
}
function noise(nx,ny){
 G.noises.push({x:nx,y:ny,t:0});
 if(!G.h.hid&&G.h.st!=='c'){G.h.st='i';G.h.tx=nx;G.h.ty=ny}
}
function mageBeam(q){
 if(q.mg!=null)return;
 const h=G.h,dv=[[0,1],[-1,0],[1,0],[0,-1]][q.dr||0];let ex=q.x,ey=q.y,hit=false;
 for(let d=8;d<=600;d+=8){const px=q.x+dv[0]*d,py=q.y+dv[1]*d;if(hitWall(px,py,2))break;ex=px;ey=py;if(Math.hypot(px-h.x,py-h.y)<h.r+6){hit=true;break}}
 G.bm.push({x1:q.x,y1:q.y-12,x2:ex,y2:ey-12,t:.45,b:hit?1:0});q.sw=.35;q.cd=20;
 if(hit){const hp=h.hid&&G.pl[h.hid];if(hp)hp.hp=Math.max(0,hp.hp-25);else h.hp=Math.max(0,h.hp-25);h.slow=3}
 else{q.hp=Math.max(1,q.hp-10);q.fl=.2;q.sl=3}
}
function freeOrDisarm(q){
 const ti=G.traps.findIndex(t=>Math.hypot(q.x-t.x,q.y-t.y)<26);if(ti>=0){G.traps.splice(ti,1);return true}
 for(const k in G.pl){const o=G.pl[k];if(o!==q&&o.role==='s'&&o.stuck>0&&Math.hypot(q.x-o.x,q.y-o.y)<30){o.stuck=0;return true}}
 return false}
function skill(q,id){
 if(q.s!==0||q.cd>0||G.over)return;
 const h=G.h;
 if(q.role==='s'){
  if(q.stuck>0)return;
  if(q.ch===0){const m=Math.hypot(q.inp.x,q.inp.y);let dx,dy;if(m>.1){dx=q.inp.x/m;dy=q.inp.y/m}else{[dx,dy]=[[0,1],[-1,0],[1,0],[0,-1]][q.dr||0]}q.dx=dx;q.dy=dy;q.dash=.2;q.inv=.35;q.cd=20}
  else if(q.ch===1){if(!q.cn){q.cn=1;q.cd=40}}
  else if(q.ch===3)mageBeam(q);
  else{let t=null,bd=70;for(const k in G.pl){const o=G.pl[k];if(o!==q&&o.role==='s'&&o.s===0&&o.hp<o.mh){const d=Math.hypot(o.x-q.x,o.y-q.y);if(d<bd&&los(q,o)){bd=d;t=o}}}
   if(t){t.hp=Math.min(t.mh,t.hp+20);q.cd=50}}
 }else if(h.hid===id){
  if(q.ch===0){h.dash=.25;q.cd=18}
  else if(q.ch===1){G.ap=5;q.cd=35}
  else if(q.ch===3){G.traps.push({x:h.x,y:h.y});if(G.traps.length>3)G.traps.shift();q.cd=12}
  else{let t=null,bd=1e9;for(const k in G.pl){const o=G.pl[k];if(o.role==='s'&&o.s===0){const d=Math.hypot(o.x-h.x,o.y-h.y);if(d<bd){bd=d;t=k}}}
   if(t){G.mk={id:t,t:8};q.cd=30}}
 }
}
function doAttack(){
 const h=G.h;if(h.cd>0||G.over)return;h.cd=1.45;h.sw=.3;
 for(const q of Object.values(G.pl))if(q.role==='s'&&q.s===0&&!(q.inv>0)&&Math.hypot(q.x-h.x,q.y-h.y)<h.r+q.r+22){
  q.hp-=10;q.fl=.2;q.mg=null;if(h.hid&&G.pl[h.hid]&&G.pl[h.hid].ch===0)h.fu=2;
  if(q.hp<=0){q.s=1;if(h.hid&&G.pl[h.hid])G.pl[h.hid].kills++}
 }
}
function chkRdy(){const ids=Object.keys(lobby);if(ids.length&&ids.every(i=>G.rdy[i])){inGame=false;G=null;$('ov').classList.add('hide');pushLobby();show('lobby')}}
function sim(dt){
 if(G.over)return;
 const h=G.h,S=Object.values(G.pl).filter(q=>q.role==='s'&&q.s===0),xp=G.xt!=null;
 if(xp&&G.xt>0)G.xt=Math.max(0,G.xt-dt);
 const open=xp&&G.xt<=0,mul=xp?2:1,ex=MP.ex;
 for(const b of G.bm)b.t-=dt;G.bm=G.bm.filter(b=>b.t>0);
 for(const a of G.al)a.t-=dt;G.al=G.al.filter(a=>a.t>0);
 for(const n of G.noises)n.t+=dt;G.noises=G.noises.filter(n=>n.t<1);
 G.ap=Math.max(0,G.ap-dt);if(G.mk){G.mk.t-=dt;const o=G.pl[G.mk.id];if(G.mk.t<=0||!o||o.s!==0)G.mk=null}
 for(const q of S){
  q.inv=Math.max(0,q.inv-dt);q.cd=Math.max(0,q.cd-dt);q.bf=Math.max(0,q.bf-dt);q.sl=Math.max(0,q.sl-dt);q.sw=Math.max(0,q.sw-dt);q.stuck=Math.max(0,(q.stuck||0)-dt);if(q.mg==null)q.cu=0;else q.mv=0;
  if(q.mg!=null){const g=G.gens[q.mg];if(g.done||Math.hypot(q.x-g.x,q.y-g.y)>60)q.mg=null}
  if(q.mg==null){
   let ix=q.inp.x,iy=q.inp.y,m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m}
   if(q.stuck>0){ix=iy=m=0}
   const run=q.inp.r&&q.sta>0&&m>.1,v=(run?RUN_SV:100)*(q.bf>0?1.4:1)*(q.sl>0?.6:1)*dt;
   q.mv=m>.05?1:0;if(m>.05){move(q,ix*v,iy*v);q.dr=Math.abs(ix)>Math.abs(iy)?(ix<0?1:2):(iy<0?3:0)}
   q.sta=run?Math.max(0,q.sta-STA_DRAIN*dt):Math.min(100,q.sta+12*(q.ch===0?1.2:1)*dt);
  }
  {const ti=G.traps.findIndex(t=>Math.hypot(q.x-t.x,q.y-t.y)<14);if(ti>=0&&!(q.inv>0)){const t=G.traps.splice(ti,1)[0];q.stuck=2.5;q.mg=null;noise(t.x,t.y);G.al.push({x:t.x,y:t.y,t:8})}}
  if(q.dash>0){q.dash=Math.max(0,q.dash-dt);const v=750*dt/3;for(let i=0;i<3;i++)move(q,q.dx*v,q.dy*v);q.mv=1}
  for(const k of G.kits)if(k.on&&(q.kit||0)<2&&Math.hypot(q.x-k.x,q.y-k.y)<18){k.on=0;q.kit=(q.kit||0)+1}
  if(q.act){q.act=false;if(q.mg==null&&!pressBtn(q)&&!freeOrDisarm(q)){const i=G.gens.findIndex(g=>!g.done&&Math.hypot(q.x-g.x,q.y-g.y)<34);if(i>=0){q.mg=i;if(q.cn){q.cu=1;q.cn=0}}}}
  if(open&&q.x>ex[0]&&q.x<ex[0]+ex[2]&&q.y>ex[1]&&q.y<ex[1]+ex[3]){q.s=2;q.mg=null}
 }
 if(h.hid&&G.pl[h.hid]){
  const hp=G.pl[h.hid],inp=hp.inp;let ix=inp.x,iy=inp.y,m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m}
  if(hp.mg!=null){const di=hp.mg-100;if(G.dd[di]!==1||doorDist(h.x,h.y,di)>h.r+40)hp.mg=null;else{ix=0;iy=0;m=0}}
  const run=inp.r&&hp.sta>0&&m>.1;let sp=(run?RUN_KI:108)*mul*(h.fu>0?1.15:1)*(h.slow>0?.55:1);
  if(h.stun>0){h.stun-=dt;sp=0}
  const mm=Math.hypot(ix,iy);if(mm>.05){h.fx=ix/mm;h.fy=iy/mm;h.dr=Math.abs(ix)>Math.abs(iy)?(ix<0?1:2):(iy<0?3:0)}h.mv=mm>.05||h.dash>0?1:0;
  hp.cd=Math.max(0,hp.cd-dt);h.fu=Math.max(0,h.fu-dt);h.still=mm<.05&&h.dash<=0?h.still+dt:0;
  if(h.dash>0){h.dash-=dt;move(h,h.fx*420*dt,h.fy*420*dt)}else if(sp&&m>.05)move(h,ix*sp*dt,iy*sp*dt);
  hp.sta=run?Math.max(0,hp.sta-STA_DRAIN*dt):Math.min(60,hp.sta+12*dt);
 }else{
  {const di=G.dd.findIndex((s,i)=>s===1&&doorDist(h.x,h.y,i)<h.r+16);if(di>=0){G.hbk+=dt;if(G.hbk>2.5){G.dd[di]=2;G.hbk=0}}else G.hbk=0}
  let tgt=null,bd=1e9;
  for(const q of S){const d=Math.hypot(q.x-h.x,q.y-h.y);if(d<bd&&(d<50||(d<200&&los(h,q)))){bd=d;tgt=q}}
  if(tgt){h.st='c';h.mem=2.5;h.tx=tgt.x;h.ty=tgt.y}
  else if(h.st==='c'){h.mem-=dt;if(h.mem<=0)h.st='p'}
  const runAI=h.st==='c'&&!h.tired&&h.sta>0&&h.stun<=0;
  let sp=(h.st==='c'?(runAI?RUN_KI:100):h.st==='i'?85:68)*mul*(h.slow>0?.55:1);
  h.sta=runAI?Math.max(0,h.sta-STA_DRAIN*dt):Math.min(60,h.sta+12*dt);
  if(h.sta<=0)h.tired=1;else if(h.sta>=30)h.tired=0;
  if(h.stun>0){h.stun-=dt;sp=0}
  const tdx=h.tx-h.x,tdy=h.ty-h.y;
  if(Math.hypot(tdx,tdy)<14&&h.st!=='c'){const s=MP.spots[Math.floor(Math.random()*MP.spots.length)];h.tx=s[0];h.ty=s[1];h.st='p'}
  h.mv=sp>0?1:0;
  if(sp>0){
   h.jit-=dt;const ang=Math.atan2(tdy,tdx)+(h.jit>0?h.ja:0);
   move(h,Math.cos(ang)*sp*dt,Math.sin(ang)*sp*dt);h.chk+=dt;{const ca=Math.cos(ang),sa=Math.sin(ang);h.dr=Math.abs(ca)>Math.abs(sa)?(ca<0?1:2):(sa<0?3:0)}
   if(h.chk>.4){if(Math.hypot(h.x-h.px,h.y-h.py)<sp*.16){h.jit=.5;h.ja=(Math.random()<.5?-1:1)*(1.2+Math.random()*1.2);
     if(h.st!=='c'){const s=MP.spots[Math.floor(Math.random()*MP.spots.length)];h.tx=s[0];h.ty=s[1]}}
    h.px=h.x;h.py=h.y;h.chk=0}
  }
 }
 h.cd=Math.max(0,h.cd-dt);h.sw=Math.max(0,h.sw-dt);h.slow=Math.max(0,h.slow-dt);
 for(const q of S)q.fl=Math.max(0,q.fl-dt);
 if(!h.hid&&S.some(q=>Math.hypot(q.x-h.x,q.y-h.y)<h.r+q.r+22))doAttack();
 if(!Object.values(G.pl).some(q=>q.role==='s'&&q.s===0)){
  const all=Object.values(G.pl).filter(q=>q.role==='s');
  G.over={esc:all.filter(q=>q.s===2).length,total:all.length};
  for(const id in G.pl){const q=G.pl[id];wts[id]=(wts[id]||0)+1+2*(q.gc||0)+2*(q.kills||0)}
 }
}

