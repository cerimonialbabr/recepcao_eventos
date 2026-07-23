const Util = {

  escapar(valor) {
    return String(valor ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  },

  normalizar(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase()
      .trim();
  },

  async carregarCabecalhoEvento() {

    try{

      const config=await API.config();

      document.querySelectorAll("[data-evento-nome]").forEach(el=>{
        el.textContent=config.NOME_EVENTO||"Evento";
      });

      const dados=[
        config.DATA_EVENTO,
        config.LOCAL_EVENTO
      ].filter(Boolean).join(" • ");

      document.querySelectorAll("[data-evento-dados]").forEach(el=>{
        el.textContent=dados;
      });

      return config;

    }catch(erro){

      document.querySelectorAll("[data-evento-dados]").forEach(el=>{
        el.textContent="Não foi possível carregar os dados do evento.";
      });

      return {};

    }

  },

  mesaExibicao(pessoa){

    if(pessoa.semMesaAtual)
      return "Não definida";

    return pessoa.mesaAtual||
           pessoa.mesaPlanejada||
           "Não definida";

  },

  compararMesas(a,b){

    const x=String(a??"").trim();
    const y=String(b??"").trim();

    const xLetra=/^[A-Za-z]/.test(x);
    const yLetra=/^[A-Za-z]/.test(y);

    if(xLetra!==yLetra)
      return xLetra?-1:1;

    return x.localeCompare(
      y,
      "pt-BR",
      {
        numeric:true,
        sensitivity:"base"
      }
    );

  },

  numeroId(id){

    const encontrado=String(id??"").match(/(\d+)/);

    return encontrado
      ? Number(encontrado[1])
      : Number.MAX_SAFE_INTEGER;

  },

  agrupar(convidados){

    const mapa=new Map();

    convidados.forEach(pessoa=>{

      const chave=pessoa.grupo||pessoa.id;

      if(!mapa.has(chave))
        mapa.set(chave,[]);

      mapa.get(chave).push(pessoa);

    });

    return [...mapa.entries()].map(([grupo,membros])=>({

      grupo,

      membros,

      principal:
        membros.find(p=>p.posto)||
        membros[0]

    }));

  },

  toast(mensagem,tipo="sucesso"){

    const elemento=document.getElementById("toast");

    if(!elemento)
      return;

    elemento.textContent=mensagem;
    elemento.className=`toast ${tipo}`;

    clearTimeout(this._timerToast);

    this._timerToast=setTimeout(()=>{

      elemento.className="toast oculto";

    },4200);

  },

  abrirModal(id){

    const modal=document.getElementById(id);

    if(!modal)
      return;

    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden","false");

    document.body.classList.add("sem-rolagem");

  },

  fecharModal(id){

    const modal=document.getElementById(id);

    if(!modal)
      return;

    modal.classList.add("oculto");
    modal.setAttribute("aria-hidden","true");

    document.body.classList.remove("sem-rolagem");

  },

  lerArquivoBase64(arquivo){

    return new Promise((resolve,reject)=>{

      const leitor=new FileReader();

      leitor.onload=()=>{

        resolve(
          String(leitor.result||"")
          .split(",")[1]||""
        );

      };

      leitor.onerror=()=>{

        reject(
          new Error("Não foi possível ler a foto.")
        );

      };

      leitor.readAsDataURL(arquivo);

    });

  },

  abrirFoto(url,nome=""){

    let modal=document.getElementById("modalFoto");

    if(!modal){

      modal=document.createElement("div");

      modal.id="modalFoto";

      modal.className="modal oculto";

      modal.innerHTML=`

      <div class="modal-fundo" data-fechar-modal></div>

      <div class="modal-conteudo modal-foto">

          <button
              class="botao-fechar"
              data-fechar-modal
              type="button">

              &times;

          </button>

          <img id="fotoAmpliada">

          <h2 id="tituloFoto"></h2>

      </div>

      `;

      document.body.appendChild(modal);

    }

    document.getElementById("fotoAmpliada").src=url;
    document.getElementById("tituloFoto").textContent=nome;

    this.abrirModal("modalFoto");

  }

};

document.addEventListener("click",(evento)=>{

  const alvo=evento.target.closest("[data-fechar-modal]");

  if(!alvo)
    return;

  const modal=alvo.closest(".modal");

  if(modal)
    Util.fecharModal(modal.id);

});

document.addEventListener("keydown",(evento)=>{

  if(evento.key!=="Escape")
    return;

  document
    .querySelectorAll(".modal:not(.oculto)")
    .forEach(modal=>{

      Util.fecharModal(modal.id);

    });

});
