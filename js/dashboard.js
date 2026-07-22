document.addEventListener("DOMContentLoaded", () => {
  carregar();
  document.getElementById("atualizarDashboard").addEventListener("click", carregar);
  setInterval(carregar, APP_CONFIG.INTERVALO_ATUALIZACAO_MS);
});

async function carregar() {
  try {
    const [convidados, mesas] = await Promise.all([API.convidados(), API.mesas()]);
    const presentes = convidados.filter((p) => p.checkin);
    const total = convidados.length;
    const percentual = total ? Math.round(presentes.length / total * 100) : 0;

    document.getElementById("dashPresentes").textContent = presentes.length;
    document.getElementById("dashPendentes").textContent = total - presentes.length;
    document.getElementById("dashTotal").textContent = total;
    document.getElementById("dashPercentual").textContent = `${percentual}%`;
    document.getElementById("ultimaAtualizacao").textContent =
      `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;

    document.getElementById("tabelaMesas").innerHTML = `
      <table><thead><tr><th>Mesa</th><th>Tipo</th><th>Ocupados</th><th>Capacidade</th><th>Vagas</th></tr></thead>
      <tbody>${mesas.map((m) => `<tr><td><strong>${Util.escapar(m.mesa)}</strong></td>
      <td>${Util.escapar(m.tipo || "—")}</td><td>${m.ocupados}</td>
      <td>${m.capacidade || "—"}</td><td>${m.vagas}</td></tr>`).join("")}</tbody></table>`;

    const ultimos = [...presentes].sort((a,b) =>
      String(b.horaCheckin).localeCompare(String(a.horaCheckin), "pt-BR")).slice(0,15);

    document.getElementById("ultimosCheckins").innerHTML = ultimos.length
      ? ultimos.map((p) => `<article><div><strong>${Util.escapar(p.nomeExibicao)}</strong>
      <span>Mesa ${Util.escapar(Util.mesaExibicao(p))}</span></div>
      <time>${Util.escapar(p.horaCheckin)}</time></article>`).join("")
      : "<p>Nenhum check-in realizado.</p>";
  } catch (erro) {
    document.getElementById("ultimaAtualizacao").textContent = `Erro: ${erro.message}`;
  }
}
