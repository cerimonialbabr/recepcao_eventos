const organizacao = {convidados: [], mesas: [], pessoa: null};

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("filtroOrganizacao").addEventListener("input", renderizarLista);
  document.getElementById("filtroNominata").addEventListener("change", renderizarLista);
  await carregar();
});

async function carregar() {
  const mensagem = document.getElementById("mensagemOrganizacao");
  try {
    [organizacao.convidados, organizacao.mesas] = await Promise.all([
      API.convidados(), API.mesas()
    ]);
    mensagem.textContent = "";
    renderizarLista();
  } catch (erro) {
    mensagem.textContent = `Erro: ${erro.message}`;
  }
}

function renderizarLista() {
  const termo = Util.normalizar(document.getElementById("filtroOrganizacao").value);
  const filtroNom = document.getElementById("filtroNominata").value;
  const lista = document.getElementById("listaOrganizacao");

  const filtrados = organizacao.convidados.filter((p) => {
    const correspondeTexto = !termo || Util.normalizar([
      p.id,p.grupo,p.posto,p.nomeCompleto,p.nomeGuerra,p.mesaPlanejada,p.mesaAtual
    ].join(" ")).includes(termo);
    const correspondeNom = !filtroNom ||
      (filtroNom === "sim" && p.nominata) ||
      (filtroNom === "nao" && !p.nominata);
    return correspondeTexto && correspondeNom;
  });

  lista.innerHTML = filtrados.map((p) => `
    <button class="linha-organizacao" data-id="${Util.escapar(p.id)}" type="button">
      <div class="miniatura-organizacao">${p.fotoUrl ? `<img src="${Util.escapar(p.fotoUrl)}" alt="">` : ""}</div>
      <div class="nome-organizacao"><strong>${Util.escapar(p.nomeExibicao)}</strong>
      <span>${Util.escapar(p.grupo || "Sem grupo")}</span></div>
      <div><span class="rotulo-mini">Mesa prevista</span><strong>${Util.escapar(p.mesaPlanejada || "—")}</strong></div>
      <div><span class="rotulo-mini">Nominata</span><strong>${p.nominata ? "SIM" : "NÃO"}</strong></div>
      <span class="acao-editar">Editar</span>
    </button>`).join("");

  lista.querySelectorAll("[data-id]").forEach((botao) => {
    botao.addEventListener("click", () => abrirEdicao(botao.dataset.id));
  });
}

function abrirEdicao(id) {
  organizacao.pessoa = organizacao.convidados.find((p) => p.id === id);
  if (!organizacao.pessoa) return;

  const p = organizacao.pessoa;
  const foto = p.fotoUrl
    ? `<img class="foto-edicao" src="${Util.escapar(p.fotoUrl)}" alt="">`
    : `<div class="sem-foto-edicao">Nenhuma foto adicionada</div>`;

  document.getElementById("conteudoEdicao").innerHTML = `
    <h2>${Util.escapar(p.nomeExibicao)}</h2>
    <p class="mensagem-neutra">Grupo ${Util.escapar(p.grupo || "—")} • ID ${Util.escapar(p.id)}</p>
    <div class="grade-edicao">
      <section>
        <div id="areaFotoEdicao" class="area-foto-edicao">${foto}</div>
        <label class="botao-secundario botao-arquivo">
          Adicionar ou substituir foto
          <input id="arquivoFoto" type="file" accept="image/jpeg,image/png,image/webp">
        </label>
        <p class="ajuda">JPEG, PNG ou WEBP. Máximo de ${APP_CONFIG.TAMANHO_MAXIMO_FOTO_MB} MB.</p>
      </section>
      <section class="formulario-edicao">
        <label><span>Posto</span><input id="editPosto" value="${Util.escapar(p.posto)}"></label>
        <label><span>Nome completo</span><input id="editNomeCompleto" value="${Util.escapar(p.nomeCompleto)}"></label>
        <label><span>Nome de guerra</span><input id="editNomeGuerra" value="${Util.escapar(p.nomeGuerra)}"></label>
        <label><span>Mesa prevista</span>
          <select id="editMesaPlanejada">
            <option value="">Sem mesa</option>
            ${organizacao.mesas.map((m) => {
              const atual = p.mesaPlanejada === m.mesa;
              const indisponivel = m.lotada && !atual;
              return `<option value="${Util.escapar(m.mesa)}" ${atual ? "selected" : ""}
                ${indisponivel ? "disabled" : ""}>Mesa ${Util.escapar(m.mesa)} — ${m.ocupados}/${m.capacidade || "—"}${indisponivel ? " (LOTADA)" : ""}</option>`;
            }).join("")}
          </select>
        </label>
        <label class="campo-check"><input id="editNominata" type="checkbox" ${p.nominata ? "checked" : ""}>
          <span>Inserir na nominata</span></label>
        <label><span>Observações</span><textarea id="editObservacoes" rows="5">${Util.escapar(p.observacoes)}</textarea></label>
      </section>
    </div>
    <button id="salvarEdicao" class="botao-principal largura-total">Salvar alterações</button>`;

  document.getElementById("arquivoFoto").addEventListener("change", prepararFoto);
  document.getElementById("salvarEdicao").addEventListener("click", salvarEdicao);
  Util.abrirModal("modalEdicao");
}

async function prepararFoto(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;

  const limite = APP_CONFIG.TAMANHO_MAXIMO_FOTO_MB * 1024 * 1024;
  if (arquivo.size > limite) {
    evento.target.value = "";
    Util.toast(`A foto ultrapassa ${APP_CONFIG.TAMANHO_MAXIMO_FOTO_MB} MB.`, "erro");
    return;
  }

  const area = document.getElementById("areaFotoEdicao");
  area.innerHTML = `<img class="foto-edicao" src="${URL.createObjectURL(arquivo)}" alt="">`;
}

async function salvarEdicao() {
  const botao = document.getElementById("salvarEdicao");
  const arquivo = document.getElementById("arquivoFoto").files[0];
  botao.disabled = true;
  botao.textContent = "Salvando...";

  try {
    const atualizado = await API.atualizarConvidado({
      id: organizacao.pessoa.id,
      posto: document.getElementById("editPosto").value,
      nomeCompleto: document.getElementById("editNomeCompleto").value,
      nomeGuerra: document.getElementById("editNomeGuerra").value,
      mesaPlanejada: document.getElementById("editMesaPlanejada").value,
      nominata: document.getElementById("editNominata").checked,
      observacoes: document.getElementById("editObservacoes").value
    });

    if (arquivo) {
      const base64 = await Util.lerArquivoBase64(arquivo);
      await API.uploadFoto(atualizado.id, arquivo.name, arquivo.type, base64);
    }

    Util.toast("Dados atualizados.");
    Util.fecharModal("modalEdicao");
    await carregar();
  } catch (erro) {
    Util.toast(erro.message, "erro");
  } finally {
    botao.disabled = false;
    botao.textContent = "Salvar alterações";
  }
}
