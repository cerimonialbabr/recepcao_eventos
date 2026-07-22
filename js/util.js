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

  mesaExibicao(pessoa) {
    return pessoa.mesaAtual || pessoa.mesaPlanejada || "Não definida";
  },

  agrupar(convidados) {
    const mapa = new Map();

    convidados.forEach((pessoa) => {
      const chave = pessoa.grupo || pessoa.id;
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(pessoa);
    });

    return [...mapa.entries()].map(([grupo, membros]) => ({
      grupo,
      membros,
      principal: membros.find((p) => p.posto) || membros[0]
    }));
  },

  toast(mensagem, tipo = "sucesso") {
    const elemento = document.getElementById("toast");
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.className = `toast ${tipo}`;

    clearTimeout(this._timerToast);
    this._timerToast = setTimeout(() => {
      elemento.className = "toast oculto";
    }, 3300);
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

  lerArquivoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const resultado = String(leitor.result || "");
        resolve(resultado.split(",")[1] || "");
      };
      leitor.onerror = () => reject(new Error("Não foi possível ler a foto."));
      leitor.readAsDataURL(arquivo);
    });
  }
};

document.addEventListener("click", (evento) => {
  const alvo = evento.target.closest("[data-fechar-modal]");
  if (!alvo) return;
  const modal = alvo.closest(".modal");
  if (modal) Util.fecharModal(modal.id);
});
