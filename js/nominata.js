let pessoasNominata=[];

document.addEventListener("DOMContentLoaded",async()=>{
  await Util.carregarCabecalhoEvento();
  carregar();
  document.getElementById("atualizarNominata").addEventListener("click",carregar);
  setInterval(carregar,APP_CONFIG.INTERVALO_ATUALIZACAO_MS);
});

async function carregar(){
  const mensagem=document.getElementById("mensagemNominata");
  try{
    pessoasNominata=await API.nominata();
    renderizar();
  }catch(erro){mensagem.textContent=`Erro: ${erro.message}`;}
}

function renderizar(){
  const lista=document.getElementById("listaNominata");
  const mensagem=document.getElementById("mensagemNominata");
  lista.innerHTML="";
  mensagem.textContent=pessoasNominata.length?"":"Nenhuma pessoa foi inserida na nominata.";

  pessoasNominata.forEach((pessoa)=>{
    const artigo=document.createElement("article");
    artigo.className=`cartao-nominata ${pessoa.checkin?"confirmado":""}`;
    const foto=pessoa.fotoUrl?`<img src="${Util.escapar(pessoa.fotoUrl)}" alt="">`:"";
    artigo.innerHTML=`
      ${foto}
      <div class="dados-nominata ${foto?"":"sem-foto"}">
        <span>${Util.escapar(pessoa.posto||"")}</span>
        <h3>${Util.escapar(pessoa.nomeGuerra||pessoa.nomeCompleto)}</h3>
        <p>${pessoa.checkin?`Presença confirmada${pessoa.horaCheckin?` às ${Util.escapar(pessoa.horaCheckin)}`:""}`:"Aguardando chegada"}</p>
      </div>
      <button class="${pessoa.checkin?"botao-desfazer":"botao-principal"}" type="button">
        ${pessoa.checkin?"Desfazer":"Confirmar presença"}
      </button>`;

    artigo.querySelector("button").addEventListener("click",async()=>{
      const botao=artigo.querySelector("button");
      botao.disabled=true;
      try{
        await API.checkin(pessoa.id,!pessoa.checkin);
        Util.toast(pessoa.checkin?"Presença desfeita.":"Presença confirmada.");
        await carregar();
      }catch(erro){Util.toast(erro.message,"erro");botao.disabled=false;}
    });
    lista.appendChild(artigo);
  });
}
