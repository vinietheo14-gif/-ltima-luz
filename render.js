// Desenho na tela (canvas)
// ---------- DESENHO ----------
function P(id,px,py){
 if(isHost)return[px,py];
 const d=disp[id]||(disp[id]={x:px,y:py});d.x+=(px-d.x)*.35;d.y+=(py-d.y)*.35;return[d.x,d.y];
}
function drawGen(g){
 const im=g.done&&GENOK?GENOK:GEN;
 if(GEN.naturalWidth){x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(g.x,g.y+14,16,5,0,0,7);x.fill();
  x.imageSmoothingEnabled=false;x.drawImage(im,g.x-20,g.y-24,40,40);x.imageSmoothingEnabled=true}
 else{x.fillStyle=g.done?'#2ecc71':'#f1c40f';x.fillRect(g.x-12,g.y-12,24,24)}
}
function drawDoors(vis){
 MP.doors.forEach((d,i)=>{const s=G.dd[i],w=d.r;
  if(s<2&&vis(w[0]+w[2]/2,w[1]+w[3]/2,1.1)){x.fillStyle=s?'#1e8f4e':'#8e1c14';x.fillRect(w[0],w[1],w[2],w[3]);x.fillStyle=s?'#2ecc71':'#e74c3c';
   for(let k=0;k<Math.max(w[2],w[3]);k+=8){if(w[2]>w[3])x.fillRect(w[0]+k,w[1],4,w[3]);else x.fillRect(w[0],w[1]+k,w[2],4)}}
  for(const b of d.b)if(vis(b[0],b[1])){x.fillStyle=s===2?'#666':s?'#2ecc71':'#e74c3c';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(b[0],b[1],8,0,7);x.fill();x.stroke()}
 });
}
function drawKits(vis){if(!KIT.complete||!KIT.naturalWidth)return;for(const k of G.kits)if(k.on&&vis(k.x,k.y)){const b=Math.sin(performance.now()/300+k.x)*2;x.save();x.shadowColor='#2ecc71aa';x.shadowBlur=10;x.drawImage(KIT,k.x-15,k.y-17+b,30,30);x.restore()}}
function drawLamps(vis){if(!LAN.complete||!LAN.naturalWidth)return;for(const l of LT)if(vis(l.x,l.y,1.2))x.drawImage(LAN,l.x-9,l.y-26,18,27)}
function drawGlows(cx,cy){const t=performance.now()/1000;x.save();x.globalCompositeOperation='lighter';
 for(const l of LT){const sx=l.x-cx,sy=l.y-cy-10;if(sx<-l.r||sx>VW+l.r||sy<-l.r||sy>VH+l.r)continue;
  let a=l.a*(1+.18*Math.sin(t*(5+l.ph)+l.ph*9)+.1*Math.sin(t*13+l.ph*4));if(l.f&&Math.sin(t*2.3+l.ph*7)>.96)a*=.15;
  const g=x.createRadialGradient(sx,sy,0,sx,sy,l.r);g.addColorStop(0,'rgba('+l.c+','+a+')');g.addColorStop(1,'rgba('+l.c+',0)');x.fillStyle=g;x.fillRect(sx-l.r,sy-l.r,l.r*2,l.r*2)}
 x.restore()}
function drawTraps(vis,isH,vx,vy){
 for(const t of G.traps){if(isH?!vis(t.x,t.y):Math.hypot(t.x-vx,t.y-vy)>70)continue;
  x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(t.x,t.y+2,10,5,0,0,7);x.fill();x.strokeStyle='#9aa0a6';x.lineWidth=2;x.beginPath();x.ellipse(t.x,t.y,9,5,0,0,7);x.stroke();
  x.fillStyle='#c7ccd1';for(let k=0;k<8;k++){const a=k/8*6.28;x.fillRect(t.x+Math.cos(a)*9-1,t.y+Math.sin(a)*5-1,2,2)}
  x.fillStyle='#6b3b2a';x.fillRect(t.x-2,t.y-1,4,2)}
 for(const id in G.pl){const q=G.pl[id];if(q.role==='s'&&q.stuck>0&&vis(q.x,q.y)){x.strokeStyle='#e74c3c';x.lineWidth=2;x.beginPath();x.ellipse(q.x,q.y+8,14,6,0,0,7);x.stroke()}}}
function draw(){
 x.fillStyle='#17171e';x.fillRect(0,0,VW,VH);
 if(!G||!MP)return;
 const h=G.h,mq=G.pl[me],isH=mq&&mq.role==='h',xp=G.xt!=null,open=xp&&G.xt<=0;
 let[vx,vy]=isH?P('h',h.x,h.y):mq?P(me,mq.x,mq.y):[h.x,h.y];
 const R=isH?150*(xp?.9:1):170*(G.ap>0?.5:1),vis=(a,b,m=1)=>Math.hypot(a-vx,b-vy)<R*m&&los({x:vx,y:vy},{x:a,y:b});
 const cx=Math.max(0,Math.min(W-VW,vx-VW/2)),cy=Math.max(0,Math.min(H-VH,vy-VH/2));
 x.save();x.translate(-cx,-cy);
 if(BG)x.drawImage(BG,0,0);
 const ex=MP.ex;x.fillStyle=open?'#2ecc71':'#1f5c3a';x.fillRect(ex[0],ex[1],ex[2],ex[3]);
 x.fillStyle='#fff';x.font='11px system-ui';x.textAlign='center';x.fillText('SAÍDA',ex[0]+32,ex[1]+36);
 for(const g of G.gens)if(vis(g.x,g.y))drawGen(g);
 drawDoors(vis);drawKits(vis);drawLamps(vis);drawTraps(vis,isH,vx,vy);
 for(const n of G.noises)if(vis(n.x,n.y)){x.strokeStyle='rgba(255,200,60,'+(1-n.t)+')';x.lineWidth=2;x.beginPath();x.arc(n.x,n.y,n.t*90,0,7);x.stroke()}
 x.font='bold 11px system-ui';
 const[hx,hy]=P('h',h.x,h.y);
 if(vis(hx,hy)){x.globalAlpha=h.hid&&G.pl[h.hid]&&G.pl[h.hid].ch===1&&h.still>=1?(isH?.6:.25):1;x.fillStyle='#e74c3c';
  {const ki=KII[h.hid&&G.pl[h.hid]?G.pl[h.hid].ch:0],fr=h.sw>0?(h.sw>.15?3:4):(h.mv?1+Math.floor(performance.now()/170)%2:0);
   if(ki&&ki.naturalWidth)x.drawImage(ki,fr*CW,(h.dr||0)*CHH,CW,CHH,hx-CW/2,hy+12-CHH,CW,CHH);else{x.beginPath();x.arc(hx,hy,h.r,0,7);x.fill()}}
  if(h.sw>0){x.strokeStyle='rgba(255,255,255,'+h.sw*2+')';x.lineWidth=3;x.beginPath();x.arc(hx,hy,h.r+22,0,7);x.stroke()}
  x.fillStyle='#fff';x.fillText(h.hid&&G.pl[h.hid]?G.pl[h.hid].n:h.st==='c'?'!':h.st==='i'?'?':'',hx,hy-58);x.globalAlpha=1}
 for(const id in G.pl){
  const q=G.pl[id];if(q.role!=='s'||q.s===2)continue;
  const[px,py]=P(id,q.x,q.y);if(id!==me&&!vis(px,py))continue;
  if(q.s===1){x.fillStyle='#777';x.fillText('✖ '+q.n,px,py);continue}
  {const fr=q.sw>0?3:q.mv?1+Math.floor(performance.now()/150)%2:0;
   x.fillStyle=cols[q.ci%5];x.globalAlpha=.55;x.beginPath();x.ellipse(px,py+9,9,4,0,0,7);x.fill();
   x.globalAlpha=q.fl>0?.45:1;
   const si=SVI[q.ch];
   if(si&&si.naturalWidth)x.drawImage(si,fr*CW,(q.dr||0)*CHH,CW,CHH,px-CW/2,py+9-CHH,CW,CHH);
   else{x.fillStyle=cols[q.ci%5];x.beginPath();x.arc(px,py,q.r,0,7);x.fill()}
   x.globalAlpha=1;
   if(id===me){x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.ellipse(px,py+9,9,4,0,0,7);x.stroke()}}
  x.fillStyle='#fff';x.fillText(q.n,px,py-52);
  if(id!==me&&mq&&mq.role==='s'&&mq.ch===2&&Math.hypot(px-vx,py-vy)<160){x.fillStyle='#600';x.fillRect(px-12,py-62,24,4);x.fillStyle='#2ecc71';x.fillRect(px-12,py-62,24*Math.max(0,q.hp)/q.mh,4)}
 }
 if(isH)for(const a of G.al){const an=Math.atan2(a.y-hy,a.x-hx);x.fillStyle='rgba(255,60,60,'+(.4+.6*Math.min(1,a.t/5))+')';
  x.font='bold 26px system-ui';x.fillText('!',hx+Math.cos(an)*70,hy+Math.sin(an)*70+8)}
 x.restore();
 {const lx=vx-cx,ly=vy-cy,tt=performance.now(),fl=1+.05*Math.sin(tt/90)+.03*Math.sin(tt/37),g2=x.createRadialGradient(lx,ly,0,lx,ly,R*.9),tn=isH?'255,90,70':'255,205,130';
  g2.addColorStop(0,'rgba('+tn+','+.16*fl+')');g2.addColorStop(1,'rgba('+tn+',0)');x.globalCompositeOperation='lighter';x.fillStyle=g2;x.fillRect(0,0,VW,VH);x.globalCompositeOperation='source-over'}
 const sx=vx-cx,sy=vy-cy,gr=x.createRadialGradient(sx,sy,R*.35,sx,sy,R);
 gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.97)');x.fillStyle=gr;x.fillRect(0,0,VW,VH);drawGlows(cx,cy);if(isH)for(const t of G.traps){x.fillStyle='rgba(255,140,60,.85)';x.beginPath();x.arc(t.x-cx,t.y-cy,3,0,7);x.fill()}
 for(const b of G.bm){const a=Math.min(1,b.t/.2),c=b.b?'60,140,255':'255,50,50',ln=(col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(b.x1-cx,b.y1-cy);x.lineTo(b.x2-cx,b.y2-cy);x.stroke()};
  x.lineCap='round';ln('rgba('+c+','+.25*a+')',22);ln('rgba('+c+','+.6*a+')',10);ln('rgba(255,255,255,'+a+')',3);x.lineCap='butt'}
 if(isH&&mq.ch===2)for(const id in G.pl){const q=G.pl[id];if(q.role==='s'&&q.s===0&&q.hp<q.mh&&vis(q.x,q.y,1.4)&&!vis(q.x,q.y)){x.fillStyle='#e74c3c';x.beginPath();x.arc(q.x-cx,q.y-cy,5,0,7);x.fill()}}
 if(isH&&G.mk&&G.mk.t>0){const q=G.pl[G.mk.id];if(q){const qx=q.x-cx,qy=q.y-cy,p=1+.25*Math.sin(performance.now()/150);x.strokeStyle=x.fillStyle='#ff9f1a';x.lineWidth=3;
  if(qx>14&&qx<VW-14&&qy>14&&qy<VH-14){x.beginPath();x.arc(qx,qy,14*p,0,7);x.stroke();x.beginPath();x.arc(qx,qy,4,0,7);x.fill()}
  else{const dx=qx-VW/2,dy=qy-VH/2,s=Math.min((VW/2-24)/(Math.abs(dx)||1e-6),(VH/2-24)/(Math.abs(dy)||1e-6)),ax=VW/2+dx*s,ay=VH/2+dy*s;
   x.save();x.translate(ax,ay);x.rotate(Math.atan2(dy,dx));x.beginPath();x.moveTo(14,0);x.lineTo(-8,-10);x.lineTo(-8,10);x.closePath();x.fill();x.restore();
   x.fillStyle='#fff';x.font='bold 11px system-ui';x.textAlign='center';x.fillText(q.n,ax,ay+(dy>0?-16:24))}}}
 x.textAlign='left';x.font='bold 13px system-ui';
 if(mq){const mx=isH?200:mq.role==='s'?100:100,hpw=Math.max(0,mq.hp)/mx*100,stw=isH?mq.sta*100/60:mq.sta;
  x.fillStyle='#0008';x.fillRect(6,VH-30,112,24);x.fillStyle='#e74c3c';x.fillRect(10,VH-26,hpw,7);x.fillStyle='#3498db';x.fillRect(10,VH-15,stw,7)}
 if(xp){x.textAlign='center';x.fillStyle=open?'#2ecc71':'#e74c3c';x.font='bold 16px system-ui';
  x.fillText(open?'SAÍDA ABERTA!':'SAÍDA ABRE EM '+Math.ceil(G.xt)+'s',VW/2,22)}
 x.textAlign='start';
 audioTick(mq,isH,vx,vy,h);
 $('hg').textContent=TH[G.m][0]+' | Geradores '+G.gens.filter(g=>g.done).length+'/'+G.gens.length;
 const cn=mq?CH[mq.role][mq.ch][0]:'';
 $('hl').textContent=!mq?'':isH?'🔪 '+cn+(mq.ch===3?' 🪤'+G.traps.length+'/3':''):mq.s===2?'✔ Escapou!':mq.s===1?'Pego (assistindo)':cn+' ❤ '+Math.max(0,mq.hp)+' ⚡ '+Math.round(mq.sta)+(mq.cn?' 🎯':'')+' 🩹'+(mq.kit||0);
 $('atk').classList.toggle('hide',!isH);$('act').classList.toggle('hide',!!isH);
 if(isH)$('atk').style.opacity=h.cd>0?.5:1;
 $('it').classList.toggle('hide',!!isH);if(mq&&!isH){const ib=$('it');ib.textContent='KIT x'+(mq.kit||0);ib.style.opacity=(mq.kit||0)>0&&mq.hp<mq.mh&&mq.s===0?1:.45}
 if(mq){const sb=$('sk');sb.textContent=mq.cd>0?Math.ceil(mq.cd)+'s':'HABIL.';sb.style.opacity=mq.cd>0||mq.s!==0?.45:1}
 if(G.over){
  const o=G.over,ids=Object.keys(G.pl).filter(i=>!G.pl[i].gone),n=ids.filter(i=>G.rdy[i]).length;
  if($('ov').classList.contains('hide')){closeMG();$('ov').classList.remove('hide');$('ot').textContent=o.esc>0?'Fim de jogo':'O caçador venceu'}
  $('op').textContent=o.esc+' de '+o.total+' sobrevivente(s) escaparam. Prontos: '+n+'/'+ids.length;
  $('back').disabled=!!G.rdy[me];$('back').textContent=G.rdy[me]?'Aguardando os outros...':'Jogar novamente';
 }
}
