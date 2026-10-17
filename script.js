/* ==========================================================================
   PAINEL FITNESS COMPLETO - LÓGICA CORE, GRÁFICOS E PERSISTÊNCIA LOCAL/NUVEM
   ========================================================================== */

// Instâncias Globais dos Gráficos (evita erro de re-renderização)
let chartMensal = null;
let chartPeso = null;

// Estrutura de Armazenamento no LocalStorage
const STORAGE_KEYS = {
    TREINOS: 'fitness_treinos_db',
    PESO: 'fitness_peso_db',
    INJECOES: 'fitness_injecoes_db',
    AVALIACAO: 'fitness_avaliacao_db',
    NUVEM_CONFIG: 'fitness_nuvem_config'
};

/* --------------------------------------------------------------------------
   1. GERENCIAMENTO DE ABAS E EVENTOS DE INICIALIZAÇÃO
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // Define a data padrão para o dia atual nos inputs de data
    const hoje = new Date().toISOString().split('T')[0];
    if (document.getElementById('dataPeso')) document.getElementById('dataPeso').value = hoje;
    if (document.getElementById('dataInjecao')) document.getElementById('dataInjecao').value = hoje;
    if (document.getElementById('dataAvaliacao')) document.getElementById('dataAvaliacao').value = hoje;

    // Carrega a interface inicial
    renderizarTreinos();
    carregarNuvemConfig();
});

function abrirAba(nomeAba) {
    const abas = ['abaTreinos', 'abaPeso', 'abaInj', 'abaNuvem'];
    const tabsButtons = ['tabTreinos', 'tabPeso', 'tabInj', 'tabNuvem'];

    abas.forEach(aba => {
        const el = document.getElementById(aba);
        if (el) el.style.display = 'none';
    });

    tabsButtons.forEach(btn => {
        const el = document.getElementById(btn);
        if (el) el.classList.remove('active');
    });

    // Ativa a aba selecionada
    if (nomeAba === 'treinos') {
        document.getElementById('abaTreinos').style.display = 'block';
        document.getElementById('tabTreinos').classList.add('active');
        renderizarTreinos();
    } else if (nomeAba === 'peso') {
        document.getElementById('abaPeso').style.display = 'block';
        document.getElementById('tabPeso').classList.add('active');
        renderizarPeso();
        if (typeof renderizarAvaliacaoCorporal === 'function') {
            renderizarAvaliacaoCorporal();
        }
    } else if (nomeAba === 'inj') {
        document.getElementById('abaInj').style.display = 'block';
        document.getElementById('tabInj').classList.add('active');
        renderizarInjecoes();
    } else if (nomeAba === 'nuvem') {
        document.getElementById('abaNuvem').style.display = 'block';
        document.getElementById('tabNuvem').classList.add('active');
    }
}

/* --------------------------------------------------------------------------
   2. ABA TREINOS (LOGICA + GRÁFICO MENSAL)
   -------------------------------------------------------------------------- */
function obterTreinos() {
    const dados = localStorage.getItem(STORAGE_KEYS.TREINOS);
    return dados ? JSON.parse(dados) : [];
}

function salvarRegistro() {
    const hoje = new Date().toISOString().split('T')[0];
    const treinos = obterTreinos();

    if (!treinos.includes(hoje)) {
        treinos.push(hoje);
        localStorage.setItem(STORAGE_KEYS.TREINOS, JSON.stringify(treinos));
        alert('Treino de hoje registrado com sucesso!');
    } else {
        alert('Você já registrou o treino de hoje.');
    }
    renderizarTreinos();
}

function abrirRegistroData() {
    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function registrarDataEscolhida() {
    const dataInput = document.getElementById('dataTreino').value;
    if (!dataInput) {
        alert('Selecione uma data válida.');
        return;
    }

    const treinos = obterTreinos();
    if (!treinos.includes(dataInput)) {
        treinos.push(dataInput);
        treinos.sort();
        localStorage.setItem(STORAGE_KEYS.TREINOS, JSON.stringify(treinos));
        alert('Treino antigo registrado!');
    } else {
        alert('Data já consta no histórico.');
    }
    fecharModal();
    renderizarTreinos();
}

function resetar() {
    if (confirm('Atenção: deseja realmente apagar todo o histórico de treinos?')) {
        localStorage.removeItem(STORAGE_KEYS.TREINOS);
        renderizarTreinos();
    }
}

function mostrarTreinoDia() {
    const box = document.getElementById('boxTreino');
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const diaHoje = new Date().getDay();

    const treinosExemplo = [
        "Descanso ativo ou Alongamentos leves",
        "Musculação: Pernas + Esteira 15 min",
        "Musculação: Membros Superiores + Core",
        "Musculação: Glúteos e Posteriores + Esteira 15 min",
        "Musculação: Costas e Ombros",
        "Musculação: Treino Completo / Cardio",
        "Caminhada ao ar livre / Lazer"
    ];

    box.innerHTML = `<strong>Treino sugerido para hoje (${diasSemana[diaHoje]}):</strong><br>${treinosExemplo[diaHoje]}`;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function renderizarTreinos() {
    const treinos = obterTreinos();
    const totalMeta = 200;
    const concluidos = treinos.length;
    const faltam = Math.max(0, totalMeta - concluidos);
    const porcentagem = Math.min(100, (concluidos / totalMeta) * 100);

    // Atualiza Indicadores
    document.getElementById('contador').innerText = concluidos;
    document.getElementById('faltamDias').innerText = `Faltam ${faltam} dias`;
    document.getElementById('progressFill').style.width = `${porcentagem}%`;

    // Renderiza Lista
    const historicoEl = document.getElementById('historicoLista');
    if (historicoEl) {
        historicoEl.innerHTML = treinos.slice(-10).reverse().map(d => `<div class="item-historico">🏋️ Treino em: ${d}</div>`).join('') || '<p>Nenhum treino registrado.</p>';
    }

    // Renderiza Gráfico Mensal
    renderizarGraficoMensal(treinos);
}

function renderizarGraficoMensal(treinos) {
    const ctx = document.getElementById('graficoMensal');
    if (!ctx) return;

    // Agrupa os treinos por ano-mês (Ex: 2026-05)
    const agrupado = {};
    treinos.forEach(data => {
        const mesAno = data.substring(0, 7);
        agrupado[mesAno] = (agrupado[mesAno] || 0) + 1;
    });

    const labels = Object.keys(agrupado).sort();
    const valores = labels.map(l => agrupado[l]);

    if (chartMensal) chartMensal.destroy();

    chartMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Treinos Realizados',
                data: valores,
                backgroundColor: '#4a57ff'
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, stepSize: 1 } }
        }
    });
}

/* --------------------------------------------------------------------------
   3. ABA PESO & IMC (LOGICA + GRÁFICO EVOLUÇÃO)
   -------------------------------------------------------------------------- */
function obterPesos() {
    const dados = localStorage.getItem(STORAGE_KEYS.PESO);
    return dados ? JSON.parse(dados) : [];
}

function registrarPeso() {
    const data = document.getElementById('dataPeso').value;
    const peso = parseFloat(document.getElementById('pesoInput').value);

    if (!data || isNaN(peso) || peso <= 0) {
        alert('Insira uma data e peso válidos.');
        return;
    }

    const historico = obterPesos();
    historico.push({ data, peso });
    historico.sort((a, b) => new Date(a.data) - new Date(b.data));

    localStorage.setItem(STORAGE_KEYS.PESO, JSON.stringify(historico));
    document.getElementById('pesoInput').value = '';
    renderizarPeso();
}

function renderizarPeso() {
    const historico = obterPesos();

    // Renderiza Lista
    const listaEl = document.getElementById('listaPeso');
    if (listaEl) {
        listaEl.innerHTML = historico.slice(-8).reverse().map(p => `<div class="item-historico">⚖️ ${p.data}: <strong>${p.peso} kg</strong></div>`).join('') || '<p>Nenhum peso registrado.</p>';
    }

    // Renderiza Gráfico de Peso
    const ctx = document.getElementById('graficoPeso');
    if (!ctx) return;

    const labels = historico.map(h => h.data);
    const valores = historico.map(h => h.peso);

    if (chartPeso) chartPeso.destroy();

    chartPeso = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso (kg)',
                data: valores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true }
    });
}

/* --------------------------------------------------------------------------
   4. ABA INJEÇÕES / APLICAÇÕES
   -------------------------------------------------------------------------- */
function obterInjecoes() {
    const dados = localStorage.getItem(STORAGE_KEYS.INJECOES);
    return dados ? JSON.parse(dados) : [];
}

function registrarInjecao() {
    const data = document.getElementById('dataInjecao').value;
    const dose = document.getElementById('doseInjecao').value;

    if (!data) {
        alert('Selecione a data da aplicação.');
        return;
    }

    const historico = obterInjecoes();
    historico.push({ data, dose });
    historico.sort((a, b) => new Date(a.data) - new Date(b.data));

    localStorage.setItem(STORAGE_KEYS.INJECOES, JSON.stringify(historico));
    renderizarInjecoes();
}

function renderizarInjecoes() {
    const historico = obterInjecoes();
    const listaEl = document.getElementById('listaInjecoes');
    const proxEl = document.getElementById('proximaAplicacao');

    if (listaEl) {
        listaEl.innerHTML = historico.slice(-5).reverse().map(i => `<div class="item-historico">💉 ${i.data} — Dose: <strong>${i.dose}</strong></div>`).join('') || '<p>Nenhuma aplicação registrada.</p>';
    }

    if (proxEl && historico.length > 0) {
        const ultimaData = new Date(historico[historico.length - 1].data);
        ultimaData.setDate(ultimaData.getDate() + 7); // Intervalo de 7 dias
        proxEl.innerHTML = `📅 Próxima aplicação estimada: <u>${ultimaData.toLocaleDateString('pt-BR')}</u>`;
    } else if (proxEl) {
        proxEl.innerHTML = 'Nenhuma aplicação gravada ainda.';
    }
}

/* --------------------------------------------------------------------------
   5. ABA NUVEM (SINCRONIZAÇÃO GITHUB GIST)
   -------------------------------------------------------------------------- */
function carregarNuvemConfig() {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}');
    if (config.gistId) document.getElementById('gistIdInput').value = config.gistId;
    if (config.token) document.getElementById('gistTokenInput').value = config.token;
}

function salvarConfigNuvem() {
    const gistId = document.getElementById('gistIdInput').value.trim();
    const token = document.getElementById('gistTokenInput').value.trim();

    localStorage.setItem(STORAGE_KEYS.NUVEM_CONFIG, JSON.stringify({ gistId, token }));
    alert('Configurações salvas no navegador!');
}

async function uploadParaNuvem() {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}');
    if (!config.gistId || !config.token) {
        alert('Configure o Gist ID e o Token do GitHub primeiro!');
        return;
    }

    const payload = {
        treinos: obterTreinos(),
        pesos: obterPesos(),
        injecoes: obterInjecoes(),
        avaliacoes: JSON.parse(localStorage.getItem(STORAGE_KEYS.AVALIACAO) || '[]')
    };

    try {
        const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${config.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'fitness_data.json': {
                        content: JSON.stringify(payload, null, 2)
                    }
                }
            })
        });

        if (response.ok) {
            alert('Dados sincronizados com a nuvem com sucesso!');
        } else {
            alert('Erro ao enviar dados. Verifique o Token e o Gist ID.');
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao acessar a API do GitHub.');
    }
}

async function downloadDaNuvem(alertaManual = false) {
    const config = JSON.parse(localStorage.getItem(STORAGE_KEYS.NUVEM_CONFIG) || '{}');
    if (!config.gistId) return;

    try {
        const response = await fetch(`https://api.github.com/gists/${config.gistId}`);
        if (response.ok) {
            const data = await response.json();
            const conteudo = JSON.parse(data.files['fitness_data.json'].content);

            if (conteudo.treinos) localStorage.setItem(STORAGE_KEYS.TREINOS, JSON.stringify(conteudo.treinos));
            if (conteudo.pesos) localStorage.setItem(STORAGE_KEYS.PESO, JSON.stringify(conteudo.pesos));
            if (conteudo.injecoes) localStorage.setItem(STORAGE_KEYS.INJECOES, JSON.stringify(conteudo.injecoes));
            if (conteudo.avaliacoes) localStorage.setItem(STORAGE_KEYS.AVALIACAO, JSON.stringify(conteudo.avaliacoes));

            renderizarTreinos();
            if (alertaManual) alert('Dados baixados da nuvem e atualizados localmente!');
        }
    } catch (err) {
        console.error(err);
        if (alertaManual) alert('Erro ao baixar dados do GitHub.');
    }
}