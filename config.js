// Constantes, sprites e estado global
const $=id=>document.getElementById(id),W=960,H=704,VW=640,VH=480,C=64,cv=$('c'),x=cv.getContext('2d');
const cols=['#3498db','#2ecc71','#e67e22','#9b59b6','#1abc9c'];
// Sprites dos personagens (cada sheet: 5 colunas x 4 linhas: baixo, esquerda, direita, cima)
const CW=96,CHH=76,mkI=f=>{const i=new Image();i.src='assets/sprites/'+f+'.png';return i};
const SVI=['corredor','engenheiro','medica','mago'].map(mkI),KII=['acougueiro','sombra','infectado','armadilheiro'].map(mkI);
// Textura do gerador (48x48) e versão esverdeada para gerador pronto
const GEN=new Image();let GENOK=null;
GEN.addEventListener('load',()=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');g.drawImage(GEN,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(46,204,113,.55)';g.fillRect(0,0,48,48);GENOK=c});
GEN.src='assets/textures/generator.png';
let peer,isHost=false,me='',code='',conns={},lobby={},wts={},G=null,MP=null,inGame=false,hostConn=null,myName='',keys={},joy={x:0,y:0},runH=false,disp={},lastT=0,acc=0,mgI=null,mgOff=0;
const KIT=new Image();KIT.src='assets/textures/medkit.png';
const LAN=new Image();LAN.src='assets/lanterna.png';
