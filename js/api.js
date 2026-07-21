const API = {
  url(acao, parametros = {}) {
    const url = new URL(APP_CONFIG.API_URL);
    url.searchParams.set("acao", acao);

    Object.entries(parametros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== "") {
        url.searchParams.set(chave, valor);
      }
    });

    return url.toString();
  },

  async get(acao, parametros = {}) {
    const resposta = await fetch(this.url(acao, parametros), {
      method: "GET",
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error(`Falha HTTP ${resposta.status}`);
    }

    const json = await resposta.json();

    if (!json.sucesso) {
      throw new Error(json.erro || "Erro na API.");
    }

    return json.dados;
  },

  async post(acao, dados = {}) {
    const resposta = await fetch(APP_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        acao,
        ...dados
      })
    });

    if (!resposta.ok) {
      throw new Error(`Falha HTTP ${resposta.status}`);
    }

    const json = await resposta.json();

    if (!json.sucesso) {
      throw new Error(json.erro || "Erro na API.");
    }

    return json.dados;
  },

  config() {
    return this.get("config");
  },

  convidados() {
    return this.get("convidados");
  },

  autoridades() {
    return this.get("autoridades");
  },

  mesas() {
    return this.get("mesas");
  },

  convidadosMesa(mesa) {
    return this.get("mesa", { mesa });
  },

  presentes() {
    return this.get("presentes");
  },

  checkin(id, presente) {
    return this.post("checkin", { id, presente });
  },

  alterarMesa(id, mesa) {
    return this.post("mesa", { id, mesa });
  },

  confirmarAutoridade(id, confirmado) {
    return this.post("autoridade", { id, confirmado });
  }
};
