const EstadoRecepcao = {
  config: {},
  convidados: [],
  grupos: [],
  grupoAberto: null
};

document.addEventListener("DOMContentLoaded", iniciarRecepcao);

async function iniciarRecepcao() {
  try {
    validarApi();
    const [config, convidados] = await Promise.all([
      API.config(),
      API.convidados()
    ]);

    EstadoRecepcao.config = config;
    EstadoRecepcao.convidados = convidados;
    EstadoRecepcao.grupos = Util.agrupar(convidados);

    preencherCabecalho();
    atualizarResumo();
    configurarPesquisa();
  } catch (erro) {
    document.getElementById("mensagemPesquisa").textContent =
      `Erro ao carregar: ${erro.message}`;
  }
}

function validarApi() {
  if (
    !APP_CONFIG.API_URL ||
    APP_CONFIG.API_URL.includes("COLE_AQUI")
  ) {
    throw new Error("Informe a URL do Web App em js/config.js.");
  }
}

function preencherCabecalho() {
  const { NOME_EVENTO, DATA_EVENTO, LOCAL_EVENTO } =
    EstadoRecepcao.config;

  document.getElementById("nomeEvento").textContent =
    NOME_EVENTO || "Recepção";

  document.getElementById("dadosEvento").textContent =
    [DATA_EVENTO, LOCAL_EVENTO].filter(Boolean).join(" • ");
}

function atualizarResumo() {
  const total = EstadoRecepcao.convidados.length;
  const presentes = EstadoRecepcao.convidados.filter(
    (pessoa) => pessoa.checkin
  ).length;

  document.getElementById("totalConvidados").textContent = total;
  document.getElementById("totalPresentes").textContent = presentes;
  document.getElementById("totalPendentes").textContent =
    total - presentes;
}

function configurarPesquisa() {
  const campo = document.getElementById("pesquisa");

  campo.addEventListener("input", () => {
    pesquisarGrupos(campo.value);
  });

  campo.focus();
}

function pesquisarGrupos(termoOriginal) {
  const termo = Util.normalizar(termoOriginal);
  const resultados = document.getElementById("resultados");
  const mensagem = document.getElementById("mensagemPesquisa");

  resultados.innerHTML = "";

  if (!termo) {
    mensagem.textContent =
      "Digite para localizar um convidado ou grupo.";
    return;
  }

  const encontrados = EstadoRecepcao.grupos.filter((grupo) => {
    const textoGrupo = grupo.membros
      .map((pessoa) => [
        pessoa.id,
        pessoa.grupo,
        pessoa.posto,
        pessoa.nomeCompleto,
        pessoa.nomeGuerra,
        pessoa.nomeExibicao,
        pessoa.mesaPlanejada,
        pessoa.mesaAtual
      ].join(" "))
      .join(" ");

    return Util.normalizar(textoGrupo).includes(termo);
  });

  mensagem.textContent = encontrados.length
    ? `${encontrados.length} grupo(s) encontrado(s).`
    : "Nenhum grupo encontrado.";

  encontrados.slice(0, 40).forEach((grupo) => {
    resultados.appendChild(criarCartaoGrupo(grupo));
  });
}

function criarCartaoGrupo(grupo) {
  const presentes = grupo.membros.filter((pessoa) => pessoa.checkin).length;
  const total = grupo.membros.length;
  const principal = grupo.principal;
  const artigo = document.createElement("button");

  artigo.type = "button";
  artigo.className = "cartao-grupo";
  artigo.innerHTML = `
    <div class="cartao-grupo-topo">
      <div>
        <span class="etiqueta">${Util.escapar(grupo.grupo)}</span>
        <h3>${Util.escapar(principal.nomeExibicao)}</h3>
      </div>
      <span class="status ${presentes ? "presente" : "pendente"}">
        ${presentes ? `${presentes}/${total} presentes` : "Pendente"}
      </span>
    </div>
    <div class="cartao-grupo-rodape">
      <span>${total} pessoa(s)</span>
      <strong>Mesa ${Util.escapar(Util.mesaExibicao(principal))}</strong>
    </div>
  `;

  artigo.addEventListener("click", () => abrirGrupo(grupo.grupo));

  return artigo;
}

function abrirGrupo(codigoGrupo) {
  const grupo = EstadoRecepcao.grupos.find(
    (item) => item.grupo === codigoGrupo
  );

  if (!grupo) return;

  EstadoRecepcao.grupoAberto = grupo;
  renderizarModalGrupo();
  Util.abrirModal("modalGrupo");
}

function renderizarModalGrupo() {
  const grupo = EstadoRecepcao.grupoAberto;
  const conteudo = document.getElementById("conteudoModal");
  const principal = grupo.principal;
  const foto = principal.fotoUrl
    ? `<img class="foto-principal" src="${Util.escapar(principal.fotoUrl)}" alt="">`
    : `<div class="foto-placeholder">${Util.escapar(
        principal.nomeExibicao.charAt(0) || "?"
      )}</div>`;

  conteudo.innerHTML = `
    <div class="perfil-grupo">
      ${foto}
      <div>
        <span class="etiqueta">${Util.escapar(grupo.grupo)}</span>
        <h2>${Util.escapar(principal.nomeExibicao)}</h2>
        <p>Mesa prevista: <strong>${Util.escapar(
          principal.mesaPlanejada || "Não definida"
        )}</strong></p>
      </div>
    </div>

    <div class="lista-presenca">
      ${grupo.membros.map((pessoa) => `
        <label class="linha-presenca">
          <input
            type="checkbox"
            data-id="${Util.escapar(pessoa.id)}"
            ${pessoa.checkin ? "checked" : ""}
          >
          <span>
            <strong>${Util.escapar(pessoa.nomeExibicao)}</strong>
            <small>Mesa ${Util.escapar(Util.mesaExibicao(pessoa))}</small>
          </span>
        </label>
      `).join("")}
    </div>

    <button id="salvarPresencas" class="botao-principal largura-total" type="button">
      Confirmar presença
    </button>
  `;

  document
    .getElementById("salvarPresencas")
    .addEventListener("click", salvarPresencasGrupo);
}

async function salvarPresencasGrupo() {
  const botao = document.getElementById("salvarPresencas");
  const seletores = Array.from(
    document.querySelectorAll(".linha-presenca input")
  );

  botao.disabled = true;
  botao.textContent = "Salvando...";

  try {
    for (const seletor of seletores) {
      const pessoa = EstadoRecepcao.convidados.find(
        (item) => item.id === seletor.dataset.id
      );

      if (!pessoa || pessoa.checkin === seletor.checked) {
        continue;
      }

      const atualizado = await API.checkin(
        seletor.dataset.id,
        seletor.checked
      );

      Object.assign(pessoa, atualizado);
    }

    EstadoRecepcao.grupos = Util.agrupar(
      EstadoRecepcao.convidados
    );

    atualizarResumo();
    pesquisarGrupos(
      document.getElementById("pesquisa").value
    );

    const mesa = Util.mesaExibicao(
      EstadoRecepcao.grupoAberto.principal
    );

    Util.fecharModal("modalGrupo");
    Util.toast(`Presença registrada. Mesa ${mesa}.`);
  } catch (erro) {
    Util.toast(erro.message, "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Confirmar presença";
  }
}
