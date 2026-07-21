const Util = {
  escapar(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  normalizar(valor) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  },

  toast(mensagem, tipo = "sucesso") {
    const elemento = document.getElementById("toast");

    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.className = `toast ${tipo}`;
    clearTimeout(this._toastTimer);

    this._toastTimer = setTimeout(() => {
      elemento.className = "toast oculto";
    }, 3200);
  },

  abrirModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sem-rolagem");
  },

  fecharModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("oculto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sem-rolagem");
  },

  mesaExibicao(convidado) {
    return convidado.mesaAtual || convidado.mesaPlanejada || "Não definida";
  },

  agrupar(convidados) {
    const grupos = new Map();

    convidados.forEach((convidado) => {
      const chave = convidado.grupo || convidado.id;

      if (!grupos.has(chave)) {
        grupos.set(chave, []);
      }

      grupos.get(chave).push(convidado);
    });

    return Array.from(grupos.entries()).map(([grupo, membros]) => {
      const principal =
        membros.find((pessoa) => pessoa.posto) ||
        membros[0];

      return {
        grupo,
        principal,
        membros
      };
    });
  }
};

document.addEventListener("click", (evento) => {
  const alvo = evento.target.closest("[data-fechar-modal]");

  if (alvo) {
    const modal = alvo.closest(".modal");
    if (modal) Util.fecharModal(modal.id);
  }
});
