let mesas=[];

document.addEventListener("DOMContentLoaded",async()=>{
  await Util.carregarCabecalhoEvento();
  carregarMesas();
  document.getElementById("atualizarMesas").addEventListener("click",carregarMesas);
});

async function carregarMesas(){
  const mensagem=document.getElementById("mensagemMesas");
  try{
    mesas=(await API.mesas()).sort((a,b)=>Util.compararMesas(a.mesa,b.mesa));
    renderizarMesas(); mensagem.textContent="";
  }catch(erro){mensagem.textContent=`Erro: ${erro.message}`;}
}

function renderizarMesas(){
  const mapa=document.getElementById("mapaMesas"); mapa.innerHTML="";
  mesas.forEach((mesa)=>{
    const proporcao=mesa.capacidade?mesa.ocupados/mesa.capacidade:0;
    const classe=mesa.lotada?"lotada":proporcao>=.75?"quase-cheia":"disponivel";
    const botao=document.createElement("button");
    botao.type="button"; botao.className=`cartao-mesa ${classe}`;
    botao.innerHTML=`<span>Mesa</span><strong>${Util.escapar(mesa.mesa)}</strong>
      <em>${Util.escapar(mesa.tipo||"Sem tipo")}</em>
      <small>${mesa.ocupados}/${mesa.capacidade||"—"}</small>`;
    botao.addEventListener("click",()=>abrirMesa(mesa.mesa));
    mapa.appendChild(botao);
  });
}

async function abrirMesa(numeroMesa){
  const conteudo=document.getElementById("conteudoMesa");
  conteudo.innerHTML="<p>Carregando...</p>"; Util.abrirModal("modalMesa");
  try{
    const [convidados,todasMesas]=await Promise.all([API.convidadosMesa(numeroMesa),API.mesas()]);
    todasMesas.sort((a,b)=>Util.compararMesas(a.mesa,b.mesa));
    conteudo.innerHTML=`
      <h2>Mesa ${Util.escapar(numeroMesa)}</h2>
      <p class="mensagem-neutra">Mesas lotadas ficam indisponíveis. Use “Retirar da mesa” para liberar uma vaga.</p>
      <div class="lista-mesa">${convidados.length?convidados.map((pessoa)=>`
        <article class="linha-mesa"><div><strong>${Util.escapar(pessoa.nomeExibicao)}</strong>
        <small>${pessoa.checkin?"Presente":"Pendente"}</small></div>
        <select data-id="${Util.escapar(pessoa.id)}">
          <option value="">Retirar da mesa</option>
          ${todasMesas.map((m)=>{
            const atual=Util.mesaExibicao(pessoa)===m.mesa;
            const indisponivel=m.lotada&&!atual;
            return `<option value="${Util.escapar(m.mesa)}" ${atual?"selected":""} ${indisponivel?"disabled":""}>
              Mesa ${Util.escapar(m.mesa)} — ${m.ocupados}/${m.capacidade||"—"}${indisponivel?" (LOTADA)":""}</option>`;
          }).join("")}
        </select></article>`).join(""):"<p>Nenhum convidado nesta mesa.</p>"}</div>`;

    conteudo.querySelectorAll("select").forEach((seletor)=>{
      seletor.addEventListener("change",async()=>{
        seletor.disabled=true;
        try{
          await API.alterarMesa(seletor.dataset.id,seletor.value);
          Util.toast(seletor.value?"Mesa atualizada.":"Convidado retirado da mesa.");
          await carregarMesas();
          if(seletor.value===""){await abrirMesa(numeroMesa);}
          else{await abrirMesa(seletor.value);}
        }catch(erro){Util.toast(erro.message,"erro");await abrirMesa(numeroMesa);}
      });
    });
  }catch(erro){conteudo.innerHTML=`<p>Erro: ${Util.escapar(erro.message)}</p>`;}
}
