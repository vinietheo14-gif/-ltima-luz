// Personagens e habilidades (dados) e tela de escolha
// ---------- PERSONAGENS ----------
const CH={s:[['Corredor','mobilidade e fuga','Dash: avança rápido na direção em que está indo (ou olhando) e fica imune a golpes por 0,35 s (recarga 20 s)','Resistência: stamina recupera 20% mais rápido'],
['Engenheiro','reparo de geradores','Concentração: o próximo minigame fica 40% menor (recarga 40 s)','Precisão: ao errar, guarda 25% do progresso'],
['Médica','suporte e recuperação','Primeiros socorros: cura 20 de vida de um aliado próximo (recarga 50 s)','Diagnóstico: vê a vida dos aliados próximos'],
['Mago','ataque à distância','Raio: dispara um raio reto para onde olha. Azul (acertou o caçador): 25 de dano e ele fica lento por 3 s. Vermelho (errou): você perde 10 de vida e fica lento por 3 s (recarga 20 s)','Nenhuma por enquanto']],
h:[['Açougueiro','perseguição e velocidade','Investida: avança rápido em linha reta (recarga 18 s)','Fúria: depois de acertar, +15% de velocidade por 2 s'],
['Sombra','furtividade e visão','Apagão: reduz a visão dos sobreviventes por 5 s (recarga 35 s)','Camuflagem: fica quase invisível quando parado'],
['Infectado','rastreamento','Contaminação: marca o sobrevivente mais próximo, em qualquer lugar do mapa, e mostra a posição por 8 s (recarga 30 s)','Instinto: vê feridos de mais longe'],
['Armadilheiro','controle de área','Armadilha: coloca uma armadilha escondida no chão (máx. 3; recarga 12 s). Quem pisa fica preso por 2,5 s e você é avisado. Sobreviventes desarmam apertando AÇÃO perto dela, ou soltam um aliado preso','Rastreador: sempre vê as suas armadilhas; os sobreviventes só as veem de perto']]};
let pick={sv:0,ki:0};
function renderChars(){
 for(const[id,k,pk]of[['csv','s','sv'],['cki','h','ki']]){const box=$(id);box.innerHTML='';
  CH[k].forEach((c,i)=>{const b=document.createElement('button');b.className='cc'+(pick[pk]===i?' on':'');
   const im=(k==='s'?SVI:KII)[i],cn=document.createElement('canvas');cn.width=CW;cn.height=CHH;cn.style.cssText='float:left;width:72px;margin-right:8px;image-rendering:pixelated';if(im.naturalWidth)cn.getContext('2d').drawImage(im,0,0,CW,CHH,0,0,CW,CHH);b.append(cn);
   b.insertAdjacentHTML('beforeend','<b>'+c[0]+'</b> ('+c[1]+')<br>Ativa: '+c[2]+'<br>Passiva: '+c[3]);b.onclick=()=>{pick[pk]=i;renderChars()};box.append(b)})}
}
