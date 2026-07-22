let mesas = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarMesas();
  document.getElementById("atualizarMesas").addEventListener("click", carregarMesas);
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
    const proporcao = mesa.capacidade ? mesa.ocupados / mesa.capacidade : 0;
    const classe = mesa.lotada ? "lotada" : proporcao >= 0.75 ? "quase-cheia" : "disponivel";
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `cartao-mesa ${classe}`;
    botao.innerHTML = `<span>Mesa</span><strong>${Util.escapar(mesa.mesa)}</strong>
      <small>${mesa.ocupados}/${mesa.capacidade || "—"}</small>`;
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
      API.convidadosMesa(numeroMesa), API.mesas()
    ]);

    conteudo.innerHTML = `
      <h2>Mesa ${Util.escapar(numeroMesa)}</h2>
      <p class="mensagem-neutra">Mesas lotadas ficam indisponíveis. Use “Retirar da mesa” para liberar uma vaga.</p>
      <div class="lista-mesa">
        ${convidados.length ? convidados.map((pessoa) => `
          <article class="linha-mesa">
            <div><strong>${Util.escapar(pessoa.nomeExibicao)}</strong>
            <small>${pessoa.checkin ? "Presente" : "Pendente"}</small></div>
            <select data-id="${Util.escapar(pessoa.id)}" data-mesa-atual="${Util.escapar(Util.mesaExibicao(pessoa))}">
              <option value="">Retirar da mesa</option>
              ${todasMesas.map((m) => {
                const atual = Util.mesaExibicao(pessoa) === m.mesa;
                const indisponivel = m.lotada && !atual;
                return `<option value="${Util.escapar(m.mesa)}"
                  ${atual ? "selected" : ""} ${indisponivel ? "disabled" : ""}>
                  Mesa ${Util.escapar(m.mesa)} — ${m.ocupados}/${m.capacidade || "—"}${m.lotada && !atual ? " (LOTADA)" : ""}
                </option>`;
              }).join("")}
            </select>
          </article>`).join("") : "<p>Nenhum convidado nesta mesa.</p>"}
      </div>`;

    conteudo.querySelectorAll("select").forEach((seletor) => {
      seletor.addEventListener("change", async () => {
        const anterior = seletor.dataset.mesaAtual === "Não definida" ? "" : seletor.dataset.mesaAtual;
        seletor.disabled = true;
        try {
          await API.alterarMesa(seletor.dataset.id, seletor.value);
          Util.toast(seletor.value ? "Mesa atualizada." : "Convidado retirado da mesa.");
          await carregarMesas();
          await abrirMesa(numeroMesa);
        } catch (erro) {
          seletor.value = anterior;
          Util.toast(erro.message, "erro");
          seletor.disabled = false;
        }
      });
    });
  } catch (erro) {
    conteudo.innerHTML = `<p>Erro: ${Util.escapar(erro.message)}</p>`;
  }
}
