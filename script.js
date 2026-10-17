
/* Painel Fitness - compatibilidade com dados antigos e Gemini */

const STORAGE_KEYS = {
  TREINOS: 'fitness_treinos_db',
  PESO: 'fitness_peso_db',
  INJECOES: 'fitness_injecoes_db',
  AVALIACAO: 'fitness_avaliacao_db',
  NUVEM_CONFIG: 'fitness_nuvem_config'
};

let chartMensal = null;
let chartPeso = null;

function lerLista(chaveNova, chaveAntiga, normalizar = x => x) {
  let nova = [];

  try {
    nova = JSON.parse(localStorage.getItem(chaveNova) || '[]');
  } catch (e) {
    console.error('Erro ao ler dados novos:', e);
  }

  if (Array.isArray(nova) && nova.length > 0) {
    return nova.map(normalizar);
  }

  if (chaveAntiga) {
    try {
      const antiga = JSON.parse(
        localStorage.getItem(chaveAntiga) || '[]'
      );

      if (Array.isArray(antiga) && antiga.length > 0) {
        return antiga.map(normalizar);
      }
    } catch (e) {
      console.error('Erro ao ler dados antigos:', e);
    }
  }

  return Array.isArray(nova) ? nova.map(normalizar) : [];
}

function gravarLista(chaveNova, chaveAntiga, dados) {
  const conteudo = JSON.stringify(dados);

  localStorage.setItem(chaveNova, conteudo);

  if (chaveAntiga) {
    localStorage.setItem(chaveAntiga, conteudo);
  }
}

function normalizarTreino(item) {
  return typeof item === 'string'
    ? item
    : item && item.data
      ? item.data
      : '';
}

function obterTreinos() {
  return lerLista(
    STORAGE_KEYS.TREINOS,
    'treinos',
    normalizarTreino
  ).filter(Boolean);
}

function obterPesos() {
  return lerLista(
    STORAGE_KEYS.PESO,
    'pesos',
    p => ({
      ...p,
      peso: Number(p.peso),
      data: p.data
    })
  ).filter(p => p.data && Number.isFinite(p.peso));
}

function obterInjecoes() {
  return lerLista(
    STORAGE_KEYS.INJECOES,
    'injecoes',
    i => typeof i === 'string'
      ? { data: i, dose: 'Não informada' }
      : { ...i, dose: i.dose || 'Não informada' }
  ).filter(i => i.data);
}

function salvarTreinos(dados) {
  gravarLista(STORAGE_KEYS.TREINOS, 'treinos', dados);
}

function salvarPesos(dados) {
  gravarLista(STORAGE_KEYS.PESO, 'pesos', dados);
}

function salvarInjecoes(dados) {
  gravarLista(STORAGE_KEYS.INJECOES, 'injecoes', dados);
}

function dataLocalHoje() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

document.addEventListener('DOMContentLoaded', () => {
  const hoje = dataLocalHoje();

  ['dataPeso', 'dataInjecao', 'dataAvaliacao'].forEach(id => {
    const campo = document.getElementById(id);
    if (campo && !campo.value) campo.value = hoje;
  });

  renderizarTreinos();
  renderizarPeso();
  renderizarInjecoes();
  carregarNuvemConfig();

  if (typeof renderizarAvaliacaoCorporal === 'function') {
    renderizarAvaliacaoCorporal();
  }
});

function abrirAba(nome) {
  const mapa = {
    treinos: ['abaTreinos', 'tabTreinos'],
    peso: ['abaPeso', 'tabPeso'],
    inj: ['abaInj', 'tabInj'],
    nuvem: ['abaNuvem', 'tabNuvem']
  };

  Object.values(mapa).forEach(([aba, tab]) => {
    const a = document.getElementById(aba);
    const t = document.getElementById(tab);

    if (a) a.style.display = 'none';
    if (t) t.classList.remove('active');
  });

  const selecionada = mapa[nome];
  if (!selecionada) return;

  const [aba, tab] = selecionada;
  const elementoAba = document.getElementById(aba);
  const elementoTab = document.getElementById(tab);

  if (elementoAba) elementoAba.style.display = 'block';
  if (elementoTab) elementoTab.classList.add('active');

  if (nome === 'treinos') renderizarTreinos();

  if (nome === 'peso') {
    renderizarPeso();
    if (typeof renderizarAvaliacaoCorporal === 'function') {
      renderizarAvaliacaoCorporal();
    }
  }

  if (nome === 'inj') renderizarInjecoes();
}

function salvarRegistro() {
  const hoje = dataLocalHoje();
  const lista = obterTreinos();

  if (lista.includes(hoje)) {
    alert('Você já registrou o treino de hoje.');
    return;
  }

  lista.push(hoje);
  lista.sort();
  salvarTreinos(lista);
  renderizarTreinos();

  alert('Treino de hoje registrado com sucesso!');
}

function abrirRegistroData() {
  const modal = document.getElementById('modal');
  const campo = document.getElementById('dataTreino');

  if (modal) modal.style.display = 'flex';
  if (campo && !campo.value) campo.value = dataLocalHoje();
}

function fecharModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
}

function registrarDataEscolhida() {
  const data = document.getElementById('dataTreino')?.value;

  if (!data) {
    alert('Selecione uma data válida.');
    return;
  }

  const lista = obterTreinos();

  if (lista.includes(data)) {
    alert('Essa data já consta no histórico.');
    return;
  }

  lista.push(data);
  lista.sort();

  salvarTreinos(lista);
  fecharModal();
  renderizarTreinos();

  alert('Treino registrado!');
}

function resetar() {
  if (!confirm(
    'Atenção: deseja realmente apagar todo o histórico de treinos?'
  )) return;

  salvarTreinos([]);
  renderizarTreinos();
}

function mostrarTreinoDia() {
  const box = document.getElementById('boxTreino');
  if (!box) return;

  const dias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  const treinos = [
    'Descanso ativo ou alongamentos leves',
    'Musculação: pernas + esteira 15 min',
    'Membros superiores + core',
    'Glúteos e posteriores + esteira 15 min',
    'Costas e ombros',
    'Treino completo / cardio',
    'Caminhada ao ar livre / lazer'
  ];

  const dia = new Date().getDay();

  box.innerHTML =
    `<strong>Treino sugerido para hoje (${dias[dia]}):</strong><br>` +
    treinos[dia];

  box.style.display =
    box.style.display === 'none' ? 'block' : 'none';
}

function renderizarTreinos() {
  const contador = document.getElementById('contador');
  if (!contador) return;

  const lista = obterTreinos();
  const meta = 200;

  contador.textContent = lista.length;

  const faltam = document.getElementById('faltamDias');
  if (faltam) {
    faltam.textContent =
      `Faltam ${Math.max(0, meta - lista.length)} dias`;
  }

  const progresso = document.getElementById('progressFill');
  if (progresso) {
    progresso.style.width =
      `${Math.min(100, lista.length / meta * 100)}%`;
  }

  const historico = document.getElementById('historicoLista');

  if (historico) {
    historico.innerHTML = lista
      .slice(-10)
      .reverse()
      .map(data =>
        `<div class="item-historico">🏋️ Treino em: ${data}</div>`
      )
      .join('') || '<p>Nenhum treino registrado.</p>';
  }

  renderizarGraficoMensal(lista);
}

function renderizarGraficoMensal(lista) {
  const canvas = document.getElementById('graficoMensal');

  if (!canvas || typeof Chart === 'undefined') return;

  const agrupado = {};

  lista.forEach(data => {
    const mes = data.slice(0, 7);
    agrupado[mes] = (agrupado[mes] || 0) + 1;
  });

  if (chartMensal) chartMensal.destroy();

  const meses = Object.keys(agrupado).sort();

  chartMensal = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Treinos realizados',
        data: meses.map(mes => agrupado[mes]),
        backgroundColor: '#4a57ff'
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

function registrarPeso() {
  const data = document.getElementById('dataPeso')?.value;
  const textoPeso = document.getElementById('pesoInput')?.value || '';
  const peso = Number(String(textoPeso).replace(',', '.'));

  if (!data || !Number.isFinite(peso) || peso <= 0) {
    alert('Insira uma data e um peso válidos.');
    return;
  }

  const historico = obterPesos();
  const existente = historico.findIndex(p => p.data === data);

  const registro = {
    data,
    peso,
    imc: Number((peso / (1.75 * 1.75)).toFixed(2))
  };

  if (existente >= 0) {
    historico[existente] = registro;
  } else {
    historico.push(registro);
  }

  historico.sort((a, b) => a.data.localeCompare(b.data));
  salvarPesos(historico);

  const campo = document.getElementById('pesoInput');
  if (campo) campo.value = '';

  renderizarPeso();
  alert('Peso salvo com sucesso!');
}

function renderizarPeso() {
  const historico = obterPesos();
  const lista = document.getElementById('listaPeso');

  if (lista) {
    lista.innerHTML = historico
      .slice(-8)
      .reverse()
      .map(p =>
        `<div class="item-historico">⚖️ ${p.data}: ` +
        `<strong>${p.peso} kg</strong>` +
        `${p.imc ? ` — IMC ${p.imc}` : ''}</div>`
      )
      .join('') || '<p>Nenhum peso registrado.</p>';
  }

  const canvas = document.getElementById('graficoPeso');

  if (!canvas || typeof Chart === 'undefined') return;

  if (chartPeso) chartPeso.destroy();

  chartPeso = new Chart(canvas, {
    type: 'line',
    data: {
      labels: historico.map(p => p.data),
      datasets: [{
        label: 'Peso (kg)',
        data: historico.map(p => p.peso),
        borderColor: '#28a745',
        backgroundColor: 'rgba(40,167,69,.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}

function registrarInjecao() {
  const data = document.getElementById('dataInjecao')?.value;
  const dose = document.getElementById('doseInjecao')?.value;

  if (!data) {
    alert('Selecione a data da aplicação.');
    return;
  }

  const historico = obterInjecoes();
  historico.push({ data, dose: dose || 'Não informada' });
  historico.sort((a, b) => a.data.localeCompare(b.data));

  salvarInjecoes(historico);
  renderizarInjecoes();

  alert('Aplicação registrada!');
}

function renderizarInjecoes() {
  const historico = obterInjecoes();
  const lista = document.getElementById('listaInjecoes');
  const proxima = document.getElementById('proximaAplicacao');

  if (lista) {
    lista.innerHTML = historico
      .slice(-10)
      .reverse()
      .map(i =>
        `<div class="item-historico">💉 ${i.data} — Dose: ` +
        `<strong>${i.dose}</strong></div>`
      )
      .join('') || '<p>Nenhuma aplicação registrada.</p>';
  }

  if (proxima) {
    if (historico.length) {
      const data = new Date(
        historico[historico.length - 1].data + 'T12:00:00'
      );

      data.setDate(data.getDate() + 7);

      proxima.textContent =
        '📅 Próxima aplicação estimada: ' +
        data.toLocaleDateString('pt-BR');
    } else {
      proxima.textContent = 'Nenhuma aplicação gravada ainda.';
    }
  }
}

function carregarNuvemConfig() {
  let config = {};

  try {
    config = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}'
    );
  } catch (e) {
    console.error(e);
  }

  config.gistId =
    config.gistId || localStorage.getItem('github_gist_id') || '';

  config.token =
    config.token || localStorage.getItem('github_token') || '';

  const id = document.getElementById('gistIdInput');
  const token = document.getElementById('gistTokenInput');

  if (id) id.value = config.gistId;
  if (token) token.value = config.token;
}

function salvarConfigNuvem() {
  const gistId =
    document.getElementById('gistIdInput')?.value.trim();

  const token =
    document.getElementById('gistTokenInput')?.value.trim();

  if (!gistId || !token) {
    alert('Preencha o ID do Gist e o token.');
    return;
  }

  const config = { gistId, token };

  localStorage.setItem(
    STORAGE_KEYS.NUVEM_CONFIG,
    JSON.stringify(config)
  );

  localStorage.setItem('github_gist_id', gistId);
  localStorage.setItem('github_token', token);

  alert('Configurações salvas no navegador.');
}

async function uploadParaNuvem() {
  let config;

  try {
    config = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}'
    );
  } catch (e) {
    alert('Não foi possível ler a configuração da nuvem.');
    return;
  }

  if (!config.gistId || !config.token) {
    alert('Configure o Gist ID e o Token do GitHub primeiro.');
    return;
  }

  const payload = {
    treinos: obterTreinos(),
    pesos: obterPesos(),
    injecoes: obterInjecoes(),
    avaliacoes:
      typeof obterAvaliacoesCorporais === 'function'
        ? obterAvaliacoesCorporais()
        : []
  };

  try {
    const resposta = await fetch(
      `https://api.github.com/gists/${config.gistId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'fitness_data.json': {
              content: JSON.stringify(payload, null, 2)
            },
            'dados_fitness.json': {
              content: JSON.stringify(payload, null, 2)
            }
          }
        })
      }
    );

    if (!resposta.ok) {
      throw new Error('HTTP ' + resposta.status);
    }

    alert('Dados enviados para o GitHub Gist.');
  } catch (erro) {
    console.error(erro);
    alert(
      'Não foi possível enviar. Confira a conexão, o Gist ID ' +
      'e as permissões do token.'
    );
  }
}

async function downloadDaNuvem(alertaManual = false) {
  let config;

  try {
    config = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}'
    );
  } catch (e) {
    if (alertaManual) alert('Erro ao ler a configuração da nuvem.');
    return;
  }

  config.gistId =
    config.gistId || localStorage.getItem('github_gist_id') || '';

  if (!config.gistId) {
    if (alertaManual) alert('Configure o ID do Gist primeiro.');
    return;
  }

  try {
    const resposta = await fetch(
      `https://api.github.com/gists/${config.gistId}`
    );

    if (!resposta.ok) {
      throw new Error('HTTP ' + resposta.status);
    }

    const gist = await resposta.json();
    const arquivo =
      gist.files['fitness_data.json'] ||
      gist.files['dados_fitness.json'];

    if (!arquivo) {
      throw new Error('Arquivo de dados não encontrado no Gist.');
    }

    const dados = JSON.parse(arquivo.content);

    if (Array.isArray(dados.treinos)) {
      salvarTreinos(dados.treinos.map(normalizarTreino).filter(Boolean));
    }

    if (Array.isArray(dados.pesos)) {
      salvarPesos(dados.pesos);
    }

    if (Array.isArray(dados.injecoes)) {
      salvarInjecoes(dados.injecoes);
    }

    if (Array.isArray(dados.avaliacoes)) {
      localStorage.setItem(
        STORAGE_KEYS.AVALIACAO,
        JSON.stringify(dados.avaliacoes)
      );

      localStorage.setItem(
        'avaliacoesDobras',
        JSON.stringify(dados.avaliacoes)
      );
    }

    renderizarTreinos();
    renderizarPeso();
    renderizarInjecoes();

    if (typeof renderizarAvaliacaoCorporal === 'function') {
      renderizarAvaliacaoCorporal();
    }

    if (alertaManual) {
      alert('Dados baixados e atualizados.');
    }
  } catch (erro) {
    console.error(erro);

    if (alertaManual) {
      alert('Falha ao baixar: ' + erro.message);
    }
  }
}
