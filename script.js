
/* =====================================================
   PAINEL FITNESS
   Treinos, peso, IMC, injeções e sincronização.
   Compatível com os registros antigos do navegador.
   ===================================================== */

const CHAVES = {
  treinos: "fitness_treinos_db",
  pesos: "fitness_peso_db",
  injecoes: "fitness_injecoes_db",
  avaliacoes: "fitness_avaliacao_db",
  nuvem: "fitness_nuvem_config"
};

let graficoTreinos = null;
let graficoPesos = null;

const ALTURA_IMC = 1.75;

// ---------- ARMAZENAMENTO COMPATÍVEL ----------

function lerDados(chaveNova, chaveAntiga, converter = x => x) {
  try {
    const novos = JSON.parse(localStorage.getItem(chaveNova) || "[]");

    if (Array.isArray(novos) && novos.length > 0) {
      return novos.map(converter);
    }

    if (chaveAntiga) {
      const antigos = JSON.parse(
        localStorage.getItem(chaveAntiga) || "[]"
      );

      if (Array.isArray(antigos) && antigos.length > 0) {
        return antigos.map(converter);
      }
    }

    return Array.isArray(novos) ? novos.map(converter) : [];
  } catch (erro) {
    console.error("Erro ao ler dados:", erro);
    return [];
  }
}

function gravarDados(chaveNova, chaveAntiga, dados) {
  const texto = JSON.stringify(dados);

  localStorage.setItem(chaveNova, texto);

  if (chaveAntiga) {
    localStorage.setItem(chaveAntiga, texto);
  }
}

function converterTreino(item) {
  if (typeof item === "string") return item;
  return item && item.data ? item.data : "";
}

function obterTreinos() {
  return lerDados(
    CHAVES.treinos,
    "treinos",
    converterTreino
  ).filter(Boolean);
}

function obterPesos() {
  return lerDados(
    CHAVES.pesos,
    "pesos",
    item => ({
      ...item,
      peso: Number(item.peso),
      imc: Number(item.imc)
    })
  ).filter(item => item.data && item.peso > 0);
}

function obterInjecoes() {
  return lerDados(
    CHAVES.injecoes,
    "injecoes",
    item => typeof item === "string"
      ? { data: item, dose: "Não informada" }
      : item
  ).filter(item => item.data);
}

function salvarTreinos(dados) {
  gravarDados(CHAVES.treinos, "treinos", dados);
}

function salvarPesos(dados) {
  gravarDados(CHAVES.pesos, "pesos", dados);
}

function salvarInjecoes(dados) {
  gravarDados(CHAVES.injecoes, "injecoes", dados);
}

function dataHoje() {
  const data = new Date();
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  return data.toISOString().slice(0, 10);
}

function formatarData(data) {
  if (!data) return "";
  const partes = data.split("-");
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : data;
}

// ---------- INICIALIZAÇÃO ----------

document.addEventListener("DOMContentLoaded", () => {
  const hoje = dataHoje();

  ["dataPeso", "dataInjecao"].forEach(id => {
    const campo = document.getElementById(id);
    if (campo && !campo.value) campo.value = hoje;
  });

  renderizarTreinos();
  renderizarPeso();
  renderizarInjecoes();
  carregarConfiguracaoNuvem();

  if (typeof renderizarAvaliacaoCorporal === "function") {
    renderizarAvaliacaoCorporal();
  }
});

// ---------- ABAS ----------

function abrirAba(nome) {
  const abas = {
  inicio: ["abaInicio", "tabInicio"],
  treinos: ["abaTreinos", "tabTreinos"],
  peso: ["abaPeso", "tabPeso"],
  composicao: ["abaComposicao", "tabComposicao"],
  medidas: ["abaMedidas", "tabMedidas"],
  inj: ["abaInj", "tabInj"],
  nuvem: ["abaNuvem", "tabNuvem"]
};

  Object.values(abas).forEach(([idAba, idBotao]) => {
    const aba = document.getElementById(idAba);
    const botao = document.getElementById(idBotao);

    if (aba) aba.style.display = "none";
    if (botao) botao.classList.remove("active");
  });

  if (!abas[nome]) return;

  const [idAba, idBotao] = abas[nome];
  const aba = document.getElementById(idAba);
  const botao = document.getElementById(idBotao);

  if (aba) aba.style.display = "block";
  if (botao) botao.classList.add("active");

  if (nome === "treinos") renderizarTreinos();
  if (nome === "inicio") {
  atualizarVisaoGeral();
}

  if (nome === "peso") {
  renderizarPeso();
}

if (nome === "composicao") {
  if (typeof renderizarAvaliacaoCorporal === "function") {
    renderizarAvaliacaoCorporal();
  }
}
  if (nome === "inj") renderizarInjecoes();
}

// ---------- TREINOS ----------

function salvarRegistro() {
  registrarTreinoNaData(dataHoje());
}

function abrirRegistroData() {
  const modal = document.getElementById("modal");
  const campo = document.getElementById("dataTreino");

  if (modal) modal.style.display = "flex";
  if (campo && !campo.value) campo.value = dataHoje();
}

function fecharModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}

function registrarDataEscolhida() {
  const campo = document.getElementById("dataTreino");

  if (!campo || !campo.value) {
    alert("Selecione uma data para o treino.");
    return;
  }

  registrarTreinoNaData(campo.value);
  fecharModal();
}

function registrarTreinoNaData(data) {
  const treinos = obterTreinos();

  if (treinos.includes(data)) {
    alert("Já existe um treino registrado nessa data.");
    renderizarTreinos();
    return;
  }

  treinos.push(data);
  treinos.sort();

  salvarTreinos(treinos);
  renderizarTreinos();

  alert("Treino registrado com sucesso!");
}

function apagarTreino(data) {
  if (!confirm(
    `Deseja excluir o treino do dia ${formatarData(data)}?`
  )) return;

  const treinos = obterTreinos();
  const indice = treinos.indexOf(data);

  if (indice < 0) {
    alert("Não encontrei esse treino.");
    return;
  }

  treinos.splice(indice, 1);
  salvarTreinos(treinos);
  renderizarTreinos();

  alert("Treino excluído.");
}

function resetar() {
  if (!confirm(
    "Deseja excluir TODOS os registros de treino? Essa ação não pode ser desfeita."
  )) return;

  salvarTreinos([]);
  renderizarTreinos();
}

function mostrarTreinoDia() {
  const caixa = document.getElementById("boxTreino");
  if (!caixa) return;

  const dias = [
    "Domingo", "Segunda-feira", "Terça-feira",
    "Quarta-feira", "Quinta-feira", "Sexta-feira",
    "Sábado"
  ];

  const sugestoes = [
    "Descanso ativo ou alongamentos leves",
    "Musculação: pernas e cardio leve",
    "Membros superiores e core",
    "Glúteos e posteriores",
    "Costas e ombros",
    "Treino completo ou cardio",
    "Caminhada leve ou lazer"
  ];

  const dia = new Date().getDay();

  caixa.innerHTML =
    `<strong>Treino sugerido para ${dias[dia]}:</strong><br>` +
    sugestoes[dia];

  caixa.style.display =
    caixa.style.display === "none" ? "block" : "none";
}

function renderizarTreinos() {
  const treinos = obterTreinos();

  const contador = document.getElementById("contador");
  if (contador) contador.textContent = treinos.length;

  const faltam = document.getElementById("faltamDias");
  if (faltam) {
    faltam.textContent =
      `Faltam ${Math.max(0, 200 - treinos.length)} dias`;
  }

  const progresso = document.getElementById("progressFill");
  if (progresso) {
    progresso.style.width =
      `${Math.min(100, treinos.length / 200 * 100)}%`;
  }

  const historico = document.getElementById("historicoLista");

  if (historico) {
    historico.innerHTML = [...treinos]
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30)
      .map(data => `
        <div class="registro-item"
             style="display:flex;align-items:center;gap:8px;">
          <span>🏋️ ${formatarData(data)}</span>
          <button type="button"
            onclick="apagarTreino('${data}')"
            style="width:auto;margin-left:auto;background:#dc3545;
                   color:white;padding:6px 10px;font-size:13px;">
            Excluir
          </button>
        </div>
      `).join("") || "<p>Nenhum treino registrado.</p>";
  }

  renderizarGraficoTreinos(treinos);
}

function renderizarGraficoTreinos(treinos) {
  const canvas = document.getElementById("graficoMensal");

  if (!canvas || typeof Chart === "undefined") return;

  if (graficoTreinos) graficoTreinos.destroy();

  const meses = {};

  treinos.forEach(data => {
    const mes = data.slice(0, 7);
    meses[mes] = (meses[mes] || 0) + 1;
  });

  const chaves = Object.keys(meses).sort();

  graficoTreinos = new Chart(canvas, {
    type: "bar",
    data: {
      labels: chaves,
      datasets: [{
        label: "Treinos realizados",
        data: chaves.map(mes => meses[mes]),
        backgroundColor: "#4a57ff"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// ---------- IMC E PESO ----------

function calcularIMC(peso) {
  return Number((peso / (ALTURA_IMC * ALTURA_IMC)).toFixed(2));
}

function classificarIMC(imc) {
  if (imc < 18.5) {
    return { nome: "Abaixo do peso", cor: "#2196F3" };
  }

  if (imc < 25) {
    return { nome: "Peso adequado", cor: "#4CAF50" };
  }

  if (imc < 30) {
    return { nome: "Sobrepeso", cor: "#FBC02D" };
  }

  if (imc < 35) {
    return { nome: "Obesidade grau I", cor: "#FB8C00" };
  }

  if (imc < 40) {
    return { nome: "Obesidade grau II", cor: "#E53935" };
  }

  return { nome: "Obesidade grau III", cor: "#8E24AA" };
}

function registrarPeso() {
  const campoData = document.getElementById("dataPeso");
  const campoPeso = document.getElementById("pesoInput");

  const data = campoData?.value;
  const peso = Number(
    String(campoPeso?.value || "").replace(",", ".")
  );

  if (!data || !Number.isFinite(peso) || peso <= 0) {
    alert("Preencha uma data e um peso válido.");
    return;
  }

  const historico = obterPesos();
  const imc = calcularIMC(peso);

  const registro = { data, peso, imc };

  // Se a data já existe, corrige a pesagem daquele dia.
  const indice = historico.findIndex(item => item.data === data);

  if (indice >= 0) {
    historico[indice] = registro;
  } else {
    historico.push(registro);
  }

  historico.sort((a, b) => a.data.localeCompare(b.data));

  salvarPesos(historico);

  if (campoPeso) campoPeso.value = "";

  renderizarPeso();
  alert("Peso salvo com sucesso!");
}

function apagarPeso(data) {
  if (!confirm(
    `Deseja excluir o peso registrado em ${formatarData(data)}?`
  )) return;

  const historico = obterPesos();
  const atualizado = historico.filter(item => item.data !== data);

  if (atualizado.length === historico.length) {
    alert("Não encontrei essa pesagem.");
    return;
  }

  salvarPesos(atualizado);
  renderizarPeso();

  alert("Pesagem excluída.");
}

function renderizarPeso() {
  const historico = obterPesos();
  const lista = document.getElementById("listaPeso");

  const legenda = `
    <div style="padding:12px;margin-bottom:14px;border:1px solid #ddd;
                border-radius:10px;background:#fff;text-align:left;
                line-height:1.9;font-size:13px;">
      <strong>📊 Classificação do IMC</strong><br>
      <span style="color:#2196F3">●</span>
      Abaixo de 18,5 — Abaixo do peso<br>
      <span style="color:#4CAF50">●</span>
      18,5 a 24,9 — Peso adequado<br>
      <span style="color:#FBC02D">●</span>
      25,0 a 29,9 — Sobrepeso<br>
      <span style="color:#FB8C00">●</span>
      30,0 a 34,9 — Obesidade grau I<br>
      <span style="color:#E53935">●</span>
      35,0 a 39,9 — Obesidade grau II<br>
      <span style="color:#8E24AA">●</span>
      40,0 ou mais — Obesidade grau III
      <p style="font-size:11px;color:#666;margin-bottom:0;">
        Referência geral para adultos. O IMC não avalia sozinho
        a composição corporal nem diagnostica doenças.
      </p>
    </div>`;

  if (lista) {
    const registros = [...historico].sort(
      (a, b) => b.data.localeCompare(a.data)
    );

    lista.innerHTML = legenda + (
      registros.map(item => {
        const imc = item.imc > 0
          ? Number(item.imc)
          : calcularIMC(Number(item.peso));

        const classificacao = classificarIMC(imc);

        return `
          <div class="registro-item"
               style="display:flex;align-items:center;gap:8px;
                      border-left:6px solid ${classificacao.cor};
                      margin-bottom:8px;background:#fff;
                      border-radius:7px;padding:10px;">
            <div style="text-align:left;flex:1;">
              <strong>${formatarData(item.data)}</strong><br>
              Peso: ${Number(item.peso).toFixed(1)} kg<br>
              IMC: <strong>${imc.toFixed(2)}</strong><br>
              <span style="color:${classificacao.cor};font-weight:bold;">
                ${classificacao.nome}
              </span>
            </div>
            <button type="button"
              onclick="apagarPeso('${item.data}')"
              style="width:auto;background:#dc3545;color:white;
                     padding:7px 9px;font-size:12px;">
              Excluir
            </button>
          </div>`;
      }).join("") || "<p>Nenhum peso registrado.</p>"
    );
  }

  const canvas = document.getElementById("graficoPeso");

  if (!canvas || typeof Chart === "undefined") return;

  if (graficoPesos) graficoPesos.destroy();

  const ordenados = [...historico].sort(
    (a, b) => a.data.localeCompare(b.data)
  );

  graficoPesos = new Chart(canvas, {
    type: "line",
    data: {
      labels: ordenados.map(item => formatarData(item.data)),
      datasets: [{
        label: "Peso (kg)",
        data: ordenados.map(item => Number(item.peso)),
        borderColor: "#28a745",
        backgroundColor: "rgba(40,167,69,.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}

// ---------- INJEÇÕES ----------

function registrarInjecao() {
  const campoData = document.getElementById("dataInjecao");
  const campoDose = document.getElementById("doseInjecao");

  const data = campoData?.value || dataHoje();
  const dose = campoDose?.value || "Não informada";

  const historico = obterInjecoes();

  historico.push({ data, dose });
  historico.sort((a, b) => a.data.localeCompare(b.data));

  salvarInjecoes(historico);
  renderizarInjecoes();

  alert("Aplicação registrada!");
}

function apagarInjecao(indice) {
  if (!confirm("Deseja excluir esta aplicação?")) return;

  const historico = obterInjecoes();
  historico.splice(indice, 1);

  salvarInjecoes(historico);
  renderizarInjecoes();
}

function renderizarInjecoes() {
  const historico = obterInjecoes();
  const lista = document.getElementById("listaInjecoes");

  if (lista) {
    lista.innerHTML = historico
      .map((item, indice) => ({ ...item, indice }))
      .sort((a, b) => b.data.localeCompare(a.data))
      .map(item => `
        <div class="registro-item"
             style="display:flex;align-items:center;gap:8px;">
          <span>💉 ${formatarData(item.data)} — ${item.dose || "Não informada"}</span>
          <button type="button"
            onclick="apagarInjecao(${item.indice})"
            style="width:auto;margin-left:auto;background:#dc3545;
                   color:white;padding:6px 10px;font-size:13px;">
            Excluir
          </button>
        </div>
      `).join("") || "<p>Nenhuma aplicação registrada.</p>";
  }
}

// ---------- CONFIGURAÇÃO DA NUVEM ----------

function carregarConfiguracaoNuvem() {
  let config = {};

  try {
    config = JSON.parse(
      localStorage.getItem(CHAVES.nuvem) || "{}"
    );
  } catch (erro) {
    console.error(erro);
  }

  config.gistId =
    config.gistId || localStorage.getItem("github_gist_id") || "";

  config.token =
    config.token || localStorage.getItem("github_token") || "";

  const campoId = document.getElementById("gistIdInput");
  const campoToken = document.getElementById("gistTokenInput");

  if (campoId) campoId.value = config.gistId;
  if (campoToken) campoToken.value = config.token;
}

function salvarConfigNuvem() {
  const gistId =
    document.getElementById("gistIdInput")?.value.trim();

  const token =
    document.getElementById("gistTokenInput")?.value.trim();

  if (!gistId || !token) {
    alert("Preencha o ID do Gist e o token.");
    return;
  }

  localStorage.setItem(
    CHAVES.nuvem,
    JSON.stringify({ gistId, token })
  );

  localStorage.setItem("github_gist_id", gistId);
  localStorage.setItem("github_token", token);

  alert("Configuração salva.");
}

async function uploadParaNuvem() {
  let config;

  try {
    config = JSON.parse(
      localStorage.getItem(CHAVES.nuvem) || "{}"
    );
  } catch {
    alert("Erro ao ler a configuração da nuvem.");
    return;
  }

  config.gistId =
    config.gistId || localStorage.getItem("github_gist_id");

  config.token =
    config.token || localStorage.getItem("github_token");

  if (!config.gistId || !config.token) {
    alert("Configure o Gist ID e o token primeiro.");
    return;
  }

  const dados = {
    treinos: obterTreinos(),
    pesos: obterPesos(),
    injecoes: obterInjecoes(),
    avaliacoesDobras: JSON.parse(
      localStorage.getItem("avaliacoesDobras") || "[]"
    )
  };

  try {
    const resposta = await fetch(
      `https://api.github.com/gists/${config.gistId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files: {
            "dados_fitness.json": {
              content: JSON.stringify(dados, null, 2)
            }
          }
        })
      }
    );

    if (!resposta.ok) throw new Error("HTTP " + resposta.status);

    alert("Dados enviados para a nuvem.");
  } catch (erro) {
    console.error(erro);
    alert("Falha no envio. Confira a conexão e a configuração do Gist.");
  }
}

async function downloadDaNuvem(alertaManual = true) {
  let config;

  try {
    config = JSON.parse(
      localStorage.getItem(CHAVES.nuvem) || "{}"
    );
  } catch {
    alert("Erro ao ler a configuração da nuvem.");
    return;
  }

  config.gistId =
    config.gistId || localStorage.getItem("github_gist_id");

  if (!config.gistId) {
    if (alertaManual) alert("Configure o Gist ID primeiro.");
    return;
  }

  if (alertaManual && !confirm(
    "Baixar os dados da nuvem pode substituir os dados locais. Deseja continuar?"
  )) return;

  try {
    const resposta = await fetch(
      `https://api.github.com/gists/${config.gistId}`
    );

    if (!resposta.ok) throw new Error("HTTP " + resposta.status);

    const gist = await resposta.json();
    const arquivo =
      gist.files["dados_fitness.json"] ||
      gist.files["fitness_data.json"];

    if (!arquivo) throw new Error("Arquivo de dados não encontrado.");

    const dados = JSON.parse(arquivo.content);

    if (Array.isArray(dados.treinos)) {
      salvarTreinos(dados.treinos.map(converterTreino).filter(Boolean));
    }

    if (Array.isArray(dados.pesos)) salvarPesos(dados.pesos);
    if (Array.isArray(dados.injecoes)) salvarInjecoes(dados.injecoes);

    if (Array.isArray(dados.avaliacoesDobras)) {
      localStorage.setItem(
        "avaliacoesDobras",
        JSON.stringify(dados.avaliacoesDobras)
      );
      localStorage.setItem(
        CHAVES.avaliacoes,
        JSON.stringify(dados.avaliacoesDobras)
      );
    }

    renderizarTreinos();
    renderizarPeso();
    renderizarInjecoes();

    if (typeof renderizarAvaliacaoCorporal === "function") {
      renderizarAvaliacaoCorporal();
    }

    if (alertaManual) alert("Dados carregados da nuvem.");
  } catch (erro) {
    console.error(erro);
    if (alertaManual) alert("Não foi possível baixar: " + erro.message);
  }
}

function atualizarVisaoGeral() {
  // 1. Total de treinos registrados
  const treinos = typeof obterTreinos === "function"
    ? obterTreinos()
    : [];

  const elementoTreinos = document.getElementById("resumoTreinos");

  if (elementoTreinos) {
    elementoTreinos.textContent = treinos.length;
  }

  // 2. Peso mais recente
  const pesos = typeof obterPesos === "function"
    ? obterPesos()
    : [];

  const elementoPeso = document.getElementById("resumoPeso");

  if (elementoPeso) {
    const pesosOrdenados = [...pesos].sort((a, b) =>
      b.data.localeCompare(a.data)
    );

    if (pesosOrdenados.length > 0) {
      elementoPeso.textContent =
        `${pesosOrdenados[0].peso} kg`;
    } else {
      elementoPeso.textContent = "Não cadastrado";
    }
  }

  // 3. Total de avaliações corporais
  const avaliacoes =
    typeof obterAvaliacoesCorporais === "function"
      ? obterAvaliacoesCorporais()
      : [];

  const elementoAvaliacoes =
    document.getElementById("resumoAvaliacoes");

  if (elementoAvaliacoes) {
    elementoAvaliacoes.textContent = avaliacoes.length;
  }


  // 4. Próxima aplicação: intervalo de 7 dias
  const injecoes = typeof obterInjecoes === "function"
    ? obterInjecoes()
    : [];

  const elementoAplicacao =
    document.getElementById("resumoAplicacao");

  if (elementoAplicacao) {
    if (injecoes.length > 0) {
      // Identifica a aplicação mais recente
      const ultimaAplicacao = [...injecoes]
        .filter(item => item.data)
        .sort((a, b) => b.data.localeCompare(a.data))[0];

      if (ultimaAplicacao) {
        // Converte a data registrada em data local
        const partes = ultimaAplicacao.data.split("-").map(Number);
        const proxima = new Date(
          partes[0],
          partes[1] - 1,
          partes[2]
        );

        // Soma 7 dias à última aplicação
        proxima.setDate(proxima.getDate() + 7);

        const dataFormatada = proxima.toLocaleDateString("pt-BR");

        elementoAplicacao.textContent =
          `${dataFormatada} — ${ultimaAplicacao.dose || "Dose não informada"}`;
      } else {
        elementoAplicacao.textContent = "Cadastre uma aplicação";
      }
    } else {
      elementoAplicacao.textContent = "Cadastre uma aplicação";
    }
  }
}
document.addEventListener("DOMContentLoaded", function () {
  abrirAba("inicio");
});