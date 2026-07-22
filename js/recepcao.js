const estado = {convidados: [], grupos: [], grupoAberto: null};

document.addEventListener("DOMContentLoaded", async () => { await Util.carregarCabecalhoEvento(); iniciar(); });

async function iniciar() {
  try {
    validarApi();
    estado.convidados = await API.convidados();
    estado.grupos = Util.agrupar(estado.convidados);
    configurarPesquisa();
  } catch (erro) {
    document.getElementById("mensagemPesquisa").textContent = `Erro: ${erro.message}`;
  }
}

function validarApi() {
  if (!APP_CONFIG.API_URL || APP_CONFIG.API_URL.includes("COLE_AQUI")) {
    throw new Error("Informe a URL do Web App em js/config.js.");
  }
}

function configurarPesquisa() {
  const campo = document.getElementById("pesquisa");
  campo.addEventListener("input", () => pesquisar(campo.value));
  campo.focus();
}

function pesquisar(valor) {
  const termo = Util.normalizar(valor);
  const area = document.getElementById("resultados");
  const mensagem = document.getElementById("mensagemPesquisa");
  area.innerHTML = "";

  if (!termo) {
    mensagem.textContent = "Digite para localizar um convidado ou grupo.";
    return;
  }

  const encontrados = estado.grupos.filter((grupo) => {
    const texto = grupo.membros.map((p) => [
      p.id, p.grupo, p.posto, p.nomeCompleto, p.nomeGuerra,
      p.nomeExibicao, p.mesaPlanejada, p.mesaAtual
    ].join(" ")).join(" ");
    return Util.normalizar(texto).includes(termo);
  });

  mensagem.textContent = encontrados.length
    ? `${encontrados.length} grupo(s) encontrado(s).`
    : "Nenhum grupo encontrado.";

  encontrados.slice(0, 40).forEach((grupo) => area.appendChild(cartaoGrupo(grupo)));
}

function cartaoGrupo(grupo) {
  const principal = grupo.principal;
  const presentes = grupo.membros.filter((p) => p.checkin).length;
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "cartao-grupo";
  botao.innerHTML = `
    <div class="cartao-grupo-topo">
      <div><span class="etiqueta">${Util.escapar(grupo.grupo)}</span>
      <h3>${Util.escapar(principal.nomeExibicao)}</h3></div>
      <span class="status ${presentes ? "presente" : "pendente"}">
        ${presentes ? `${presentes}/${grupo.membros.length} presentes` : "Pendente"}
      </span>
    </div>
    <div class="cartao-grupo-rodape">
      <span>${grupo.membros.length} pessoa(s)</span>
      <strong>Mesa ${Util.escapar(Util.mesaExibicao(principal))}</strong>
    </div>`;
  botao.addEventListener("click", () => abrirGrupo(grupo.grupo));
  return botao;
}

function abrirGrupo(codigo) {
  estado.grupoAberto = estado.grupos.find((g) => g.grupo === codigo);
  if (!estado.grupoAberto) return;
  renderizarModal();
  Util.abrirModal("modalGrupo");
}

function renderizarModal() {
  const grupo = estado.grupoAberto;
  const principal = grupo.principal;
  const foto = principal.fotoUrl
    ? `<img class="foto-principal" src="${Util.escapar(principal.fotoUrl)}" alt="">`
    : "";

  document.getElementById("conteudoModal").innerHTML = `
    <div class="perfil-grupo ${foto ? "" : "sem-foto"}">
      ${foto}
      <div><span class="etiqueta">${Util.escapar(grupo.grupo)}</span>
      <h2>${Util.escapar(principal.nomeExibicao)}</h2>
      <p>Mesa prevista: <strong>${Util.escapar(principal.mesaPlanejada || "Não definida")}</strong></p></div>
    </div>
    <div class="lista-presenca">
      ${grupo.membros.map((p) => `
        <label class="linha-presenca">
          <input type="checkbox" data-id="${Util.escapar(p.id)}" ${p.checkin ? "checked" : ""}>
          <span><strong>${Util.escapar(p.nomeExibicao)}</strong>
          <small>Mesa ${Util.escapar(Util.mesaExibicao(p))}</small></span>
        </label>`).join("")}
    </div>
    <button id="salvarPresencas" class="botao-principal largura-total">Confirmar presença</button>`;

  document.getElementById("salvarPresencas").addEventListener("click", salvar);
}

async function salvar() {
  const botao = document.getElementById("salvarPresencas");
  const caixas = [...document.querySelectorAll(".linha-presenca input")];
  botao.disabled = true;
  botao.textContent = "Salvando...";

  try {
    for (const caixa of caixas) {
      const pessoa = estado.convidados.find((p) => p.id === caixa.dataset.id);
      if (!pessoa || pessoa.checkin === caixa.checked) continue;
      Object.assign(pessoa, await API.checkin(pessoa.id, caixa.checked));
    }

    estado.grupos = Util.agrupar(estado.convidados);
    pesquisar(document.getElementById("pesquisa").value);
    Util.fecharModal("modalGrupo");
    Util.toast("Presença registrada.");
  } catch (erro) {
    Util.toast(erro.message, "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Confirmar presença";
  }
}
