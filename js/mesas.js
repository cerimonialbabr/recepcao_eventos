let mesas = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarMesas();

  document
    .getElementById("atualizarMesas")
    .addEventListener("click", carregarMesas);
});

async function carregarMesas() {
  const mensagem = document.getElementById("mensagemMesas");

  try {
    mesas = await API.mesas();
    renderizarMesas();
    mensagem.textContent = "";
  } catch (erro) {
    mensagem.textContent = `Erro: ${erro.message}`;
  }
}

function renderizarMesas() {
  const mapa = document.getElementById("mapaMesas");
  mapa.innerHTML = "";

  mesas.forEach((mesa) => {
    const ocupacao = mesa.capacidade
      ? mesa.ocupados / mesa.capacidade
      : 0;

    let classe = "disponivel";

    if (mesa.lotada) {
      classe = "lotada";
    } else if (ocupacao >= 0.75) {
      classe = "quase-cheia";
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `cartao-mesa ${classe}`;
    botao.style.setProperty("--pos-x", mesa.posX);
    botao.style.setProperty("--pos-y", mesa.posY);
    botao.innerHTML = `
      <span>Mesa</span>
      <strong>${Util.escapar(mesa.mesa)}</strong>
      <small>${mesa.ocupados}/${mesa.capacidade || "—"}</small>
    `;

    botao.addEventListener("click", () => abrirMesa(mesa.mesa));
    mapa.appendChild(botao);
  });
}

async function abrirMesa(numeroMesa) {
  const conteudo = document.getElementById("conteudoMesa");
  conteudo.innerHTML = "<p>Carregando...</p>";
  Util.abrirModal("modalMesa");

  try {
    const [convidados, todasMesas] = await Promise.all([
      API.convidadosMesa(numeroMesa),
      API.mesas()
    ]);

    conteudo.innerHTML = `
      <h2>Mesa ${Util.escapar(numeroMesa)}</h2>
      <div class="lista-mesa">
        ${convidados.length ? convidados.map((pessoa) => `
          <article class="linha-mesa">
            <div>
              <strong>${Util.escapar(pessoa.nomeExibicao)}</strong>
              <small>${pessoa.checkin ? "Presente" : "Pendente"}</small>
            </div>
            <select data-id="${Util.escapar(pessoa.id)}">
              <option value="">Sem mesa atual</option>
              ${todasMesas.map((mesa) => `
                <option value="${Util.escapar(mesa.mesa)}"
                  ${Util.mesaExibicao(pessoa) === mesa.mesa ? "selected" : ""}>
                  Mesa ${Util.escapar(mesa.mesa)}
                </option>
              `).join("")}
            </select>
          </article>
        `).join("") : "<p>Nenhum convidado nesta mesa.</p>"}
      </div>
    `;

    conteudo.querySelectorAll("select").forEach((seletor) => {
      seletor.addEventListener("change", async () => {
        seletor.disabled = true;

        try {
          await API.alterarMesa(
            seletor.dataset.id,
            seletor.value
          );
          Util.toast("Mesa atualizada.");
          await carregarMesas();
        } catch (erro) {
          Util.toast(erro.message, "erro");
        } finally {
          seletor.disabled = false;
        }
      });
    });
  } catch (erro) {
    conteudo.innerHTML = `<p>Erro: ${Util.escapar(erro.message)}</p>`;
  }
}
