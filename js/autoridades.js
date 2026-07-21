let autoridades = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarAutoridades();
  document
    .getElementById("atualizarAutoridades")
    .addEventListener("click", carregarAutoridades);

  setInterval(
    carregarAutoridades,
    APP_CONFIG.INTERVALO_ATUALIZACAO_MS
  );
});

async function carregarAutoridades() {
  const mensagem = document.getElementById("mensagemAutoridades");

  try {
    autoridades = await API.autoridades();
    renderizarAutoridades();
  } catch (erro) {
    mensagem.textContent = `Erro: ${erro.message}`;
  }
}

function renderizarAutoridades() {
  const pendentes = autoridades.filter(
    (pessoa) => pessoa.checkin && !pessoa.confirmarAutoridade
  );

  const confirmadas = autoridades.filter(
    (pessoa) => pessoa.checkin && pessoa.confirmarAutoridade
  );

  const lista = document.getElementById("listaAutoridades");
  const listaConfirmadas =
    document.getElementById("autoridadesConfirmadas");
  const mensagem = document.getElementById("mensagemAutoridades");

  lista.innerHTML = "";
  listaConfirmadas.innerHTML = "";

  mensagem.textContent = pendentes.length
    ? ""
    : "Nenhuma autoridade aguardando confirmação.";

  pendentes.forEach((pessoa) => {
    lista.appendChild(criarCartaoAutoridade(pessoa, true));
  });

  confirmadas.forEach((pessoa) => {
    listaConfirmadas.appendChild(
      criarCartaoAutoridade(pessoa, false)
    );
  });
}

function criarCartaoAutoridade(pessoa, permitirConfirmacao) {
  const artigo = document.createElement("article");
  artigo.className = "cartao-autoridade";

  const foto = pessoa.fotoUrl
    ? `<img src="${Util.escapar(pessoa.fotoUrl)}" alt="">`
    : `<div class="foto-autoridade-placeholder">${
        Util.escapar(pessoa.nomeExibicao.charAt(0) || "?")
      }</div>`;

  artigo.innerHTML = `
    ${foto}
    <div class="dados-autoridade">
      <span>${Util.escapar(pessoa.posto || "Autoridade")}</span>
      <h3>${Util.escapar(
        pessoa.nomeGuerra || pessoa.nomeCompleto
      )}</h3>
      <p>${pessoa.horaCheckin
        ? `Chegada: ${Util.escapar(pessoa.horaCheckin)}`
        : "Presença não registrada"}</p>
    </div>
    ${permitirConfirmacao ? `
      <button class="botao-principal" type="button">
        Confirmar presença
      </button>
    ` : `<span class="confirmado">Confirmado</span>`}
  `;

  if (permitirConfirmacao) {
    artigo
      .querySelector("button")
      .addEventListener("click", async () => {
        const botao = artigo.querySelector("button");
        botao.disabled = true;
        botao.textContent = "Confirmando...";

        try {
          await API.confirmarAutoridade(pessoa.id, true);
          Util.toast("Presença confirmada.");
          await carregarAutoridades();
        } catch (erro) {
          Util.toast(erro.message, "erro");
          botao.disabled = false;
          botao.textContent = "Confirmar presença";
        }
      });
  }

  return artigo;
}
