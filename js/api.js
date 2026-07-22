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
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify({acao, ...dados})
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

  config: () => API.get("config"),
  convidados: () => API.get("convidados"),
  nominata: () => API.get("nominata"),
  mesas: () => API.get("mesas"),
  convidadosMesa: (mesa) => API.get("mesa", {mesa}),
  checkin: (id, presente) => API.post("checkin", {id, presente}),
  alterarMesa: (id, mesa) => API.post("mesa", {id, mesa}),
  atualizarConvidado: (dados) => API.post("convidado", dados),
  uploadFoto: (id, nomeArquivo, mimeType, base64) =>
    API.post("uploadfoto", {id, nomeArquivo, mimeType, base64})
};
