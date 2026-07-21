document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();

  document
    .getElementById("atualizarDashboard")
    .addEventListener("click", carregarDashboard);

  setInterval(
    carregarDashboard,
    APP_CONFIG.INTERVALO_ATUALIZACAO_MS
  );
});

async function carregarDashboard() {
  try {
    const [convidados, mesas] = await Promise.all([
      API.convidados(),
      API.mesas()
    ]);

    const presentes = convidados.filter(
      (pessoa) => pessoa.checkin
    );

    const total = convidados.length;
    const percentual = total
      ? Math.round((presentes.length / total) * 100)
      : 0;

    document.getElementById("dashPresentes").textContent =
      presentes.length;
    document.getElementById("dashPendentes").textContent =
      total - presentes.length;
    document.getElementById("dashTotal").textContent = total;
    document.getElementById("dashPercentual").textContent =
      `${percentual}%`;

    document.getElementById("ultimaAtualizacao").textContent =
      `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;

    renderizarTabelaMesas(mesas);
    renderizarUltimosCheckins(presentes);
  } catch (erro) {
    document.getElementById("ultimaAtualizacao").textContent =
      `Erro: ${erro.message}`;
  }
}

function renderizarTabelaMesas(mesas) {
  const elemento = document.getElementById("tabelaMesas");

  elemento.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Mesa</th>
          <th>Tipo</th>
          <th>Ocupados</th>
          <th>Capacidade</th>
          <th>Vagas</th>
        </tr>
      </thead>
      <tbody>
        ${mesas.map((mesa) => `
          <tr>
            <td><strong>${Util.escapar(mesa.mesa)}</strong></td>
            <td>${Util.escapar(mesa.tipo || "—")}</td>
            <td>${mesa.ocupados}</td>
            <td>${mesa.capacidade || "—"}</td>
            <td>${mesa.vagas}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderizarUltimosCheckins(presentes) {
  const elemento = document.getElementById("ultimosCheckins");

  const ordenados = [...presentes]
    .sort((a, b) =>
      String(b.horaCheckin).localeCompare(
        String(a.horaCheckin),
        "pt-BR"
      )
    )
    .slice(0, 15);

  elemento.innerHTML = ordenados.length
    ? ordenados.map((pessoa) => `
        <article>
          <div>
            <strong>${Util.escapar(pessoa.nomeExibicao)}</strong>
            <span>Mesa ${Util.escapar(Util.mesaExibicao(pessoa))}</span>
          </div>
          <time>${Util.escapar(pessoa.horaCheckin)}</time>
        </article>
      `).join("")
    : "<p>Nenhum check-in realizado.</p>";
}
