const META = 200;
let contador = 0;
let historico = JSON.parse(localStorage.getItem("treinos")) || [];
let pesos = JSON.parse(localStorage.getItem("pesos")) || [];
let injecoes = JSON.parse(localStorage.getItem("injecoes")) || [];
let grafico, graficoPeso;

function abrirAba(aba) {
    document.getElementById("abaTreinos").style.display = aba === "treinos" ? "block" : "none";
    document.getElementById("abaPeso").style.display = aba === "peso" ? "block" : "none";
    document.getElementById("abaInj").style.display = aba === "inj" ? "block" : "none";
    document.getElementById("abaNuvem").style.display = aba === "nuvem" ? "block" : "none";

    document.getElementById("tabTreinos").classList.toggle("active", aba === "treinos");
    document.getElementById("tabPeso").classList.toggle("active", aba === "peso");
    document.getElementById("tabInj").classList.toggle("active", aba === "inj");
    document.getElementById("tabNuvem").classList.toggle("active", aba === "nuvem");
}

/* =====================================
         FUNÇÕES – INJEÇÕES
===================================== */
function registrarInjecao() {
    const data = document.getElementById("dataInjecao").value;
    const dose = document.getElementById("doseInjecao").value;

    if (!data) {
        alert("Escolha a data.");
        return;
    }

    injecoes.push({ data: data, dose: dose });
    injecoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    localStorage.setItem("injecoes", JSON.stringify(injecoes));
    carregarInjecoes();
}

function carregarInjecoes() {
    let lista = document.getElementById("listaInjecoes");
    if (!lista) return;
    lista.innerHTML = "";

    injecoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    injecoes.forEach((inj, i) => {
        lista.innerHTML += `
            <div class="registro-item">
                <span>
                    <strong>${inj.data}</strong><br>
                    💉 ${inj.dose}
                </span>
                <button onclick="apagarInjecao(${i})">X</button>
            </div>
        `;
    });

    atualizarProximaAplicacao();
}

function atualizarProximaAplicacao() {
    let caixa = document.getElementById("proximaAplicacao");
    if (!caixa) return;

    if (injecoes.length === 0) {
        caixa.innerHTML = "Nenhuma aplicação registrada.";
        return;
    }

    let ultima = new Date(injecoes[0].data);
    let proxima = new Date(ultima);
    proxima.setDate(proxima.getDate() + 7);

    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let dias = Math.ceil((proxima - hoje) / (1000 * 60 * 60 * 24));

    if (dias > 0) {
        caixa.innerHTML = `💉 Próxima aplicação em <strong>${dias}</strong> dia(s)<br><br>📅 ${proxima.toLocaleDateString("pt-BR")}`;
    } else if (dias === 0) {
        caixa.innerHTML = `🔔 <span style="color:red;">Hoje é o dia da aplicação!</span>`;
    } else {
        caixa.innerHTML = `⚠️ Você está com <strong>${Math.abs(dias)}</strong> dia(s) de atraso na aplicação.`;
    }
}

function apagarInjecao(i) {
    injecoes.splice(i, 1);
    localStorage.setItem("injecoes", JSON.stringify(injecoes));
    carregarInjecoes();
}

/* =====================================
         FUNÇÕES PESO
===================================== */
function registrarPeso() {
    let data = document.getElementById("dataPeso").value;
    let peso = parseFloat(document.getElementById("pesoInput").value);

    if (!data || !peso) {
        alert("Preencha data e peso!");
        return;
    }

    let imc = calcularIMC(peso);
    pesos.push({ data, peso, imc });
    localStorage.setItem("pesos", JSON.stringify(pesos));

    carregarListaPeso();
    atualizarGraficoPeso();

    document.getElementById("pesoInput").value = "";
}

function calcularIMC(peso) {
    const ALTURA = 1.75;
    return (peso / (ALTURA * ALTURA)).toFixed(2);
}

function carregarListaPeso() {
    let lista = document.getElementById("listaPeso");
    if (!lista) return;
    lista.innerHTML = "";

    lista.innerHTML += `
        <div style="margin-bottom:15px; padding:12px; background:#f8f8f8; border-radius:10px; border:1px solid #ddd; font-size:14px; line-height:1.8; text-align: left;">
            <strong style="display:block; margin-bottom:8px;">📊 Classificação do IMC</strong>
            <div><span style="display:inline-block;width:18px;height:18px;background:#4DA6FF;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> Abaixo de <strong>18,5</strong> — Abaixo do peso</div>
            <div><span style="display:inline-block;width:18px;height:18px;background:#4CAF50;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> <strong>18,5 a 24,9</strong> — Peso ideal</div>
            <div><span style="display:inline-block;width:18px;height:18px;background:#FFD54F;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> <strong>25,0 a 29,9</strong> — Sobrepeso</div>
            <div><span style="display:inline-block;width:18px;height:18px;background:#FF9800;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> <strong>30,0 a 34,9</strong> — Obesidade Grau I</div>
            <div><span style="display:inline-block;width:18px;height:18px;background:#F44336;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> <strong>35,0 a 39,9</strong> — Obesidade Grau II</div>
            <div><span style="display:inline-block;width:18px;height:18px;background:#9C27B0;border-radius:4px;margin-right:8px;vertical-align:middle;"></span> <strong>40 ou mais</strong> — Obesidade Grau III</div>
        </div>
    `;

    pesos.forEach((p, i) => {
        const imc = parseFloat(p.imc);
        let cor = "#4CAF50";

        if (imc < 18.5) { cor = "#4DA6FF"; } 
        else if (imc < 25) { cor = "#4CAF50"; } 
        else if (imc < 30) { cor = "#FFD54F"; } 
        else if (imc < 35) { cor = "#FF9800"; } 
        else if (imc < 40) { cor = "#F44336"; } 
        else { cor = "#9C27B0"; }

        lista.innerHTML += `
            <div class="registro-item" style="border-left:8px solid ${cor}; background:${cor}15; margin-bottom:8px; border-radius:8px;">
                <span>
                    <strong>${p.data}</strong><br>
                    ${p.peso} kg — <strong>IMC: ${p.imc}</strong>
                </span>
                <button onclick="apagarPeso(${i})">X</button>
            </div>
        `;
    });
}

function apagarPeso(i) {
    pesos.splice(i, 1);
    localStorage.setItem("pesos", JSON.stringify(pesos));
    carregarListaPeso();
    atualizarGraficoPeso();
}

function atualizarGraficoPeso() {
    let el = document.getElementById("graficoPeso");
    if (!el) return;
    if (graficoPeso) graficoPeso.destroy();

    graficoPeso = new Chart(el, {
        type: "line",
        data: {
            labels: pesos.map(p => p.data),
            datasets: [{
                label: "Peso (kg)",
                data: pesos.map(p => p.peso),
                borderWidth: 3,
                borderColor: '#3cb371',
                backgroundColor: 'rgba(60, 179, 113, 0.1)'
            }]
        },
        options: {
            responsive: false,
            tension: 0.3,
            scales: { y: { beginAtZero: false } }
        }
    });
}

/* =====================================
         FUNÇÕES TREINOS
===================================== */
/* =====================================
         FUNÇÕES TREINOS
===================================== */
const treinosSemana = {
    1: `<h3>🔥 SEGUNDA-FEIRA — Glúteos + Pernas (Protegendo o Joelho)</h3>
        <strong>🚶‍♀️ TODOS OS DIAS:</strong> 15 min de Esteira (ou Bike/Elíptico)<br><br>
        <strong>🏋️ MUSCULAÇÃO:</strong><br>
        1. Cadeira Abdutora – 3x15 (ativação e estabilização)<br>
        2. Elevação Pélvica no banco – 3x12<br>
        3. Leg Press 45° (pés altos, amplitude controlada) – 3x12<br>
        4. Mesa Flexora – 3x12<br>
        5. Elevação de Panturrilha – 2x15<br><br>
        ⏱️ <i>Descanso: 40s entre as séries</i><br>
        🎯 <i>Meta: Ativar glúteos, melhorar circulação e fortalecer a base com segurança.</i>`,

    2: `<h3>🔥 TERÇA-FEIRA — Braços + Costas + Abdômen</h3>
        <strong>🚶‍♀️ TODOS OS DIAS:</strong> 15 min de Esteira (ou Bike/Elíptico)<br><br>
        <strong>🏋️ MUSCULAÇÃO:</strong><br>
        1. Puxada na frente / Pulley – 3x12<br>
        2. Remada Baixa – 3x12<br>
        3. Supino Máquina – 3x12<br>
        4. Tríceps Corda / Polia – 3x12<br>
        5. Rosca Polia / Martelo – 2x12<br>
        6. Abdômen Infra no colchonete – 2x15<br><br>
        🎯 <i>Meta: Postura firme e membros superiores desenhados sem sobrecarga.</i>`,

    3: `<h3>🌿 QUARTA-FEIRA — Treino C (Mobilidade, Postura e Alongamentos)</h3>
        <strong>🚶‍♀️ TODOS OS DIAS:</strong> 15 min de Esteira (ou Bike/Elíptico)<br><br>
        <strong>🧘 MOBILIDADE (2 séries de 8 reps cada):</strong><br>
        1. Agachamento sem carga (lento, 2s embaixo + mobilidade de quadril)<br>
        2. Elevação de quadril a partir do agachamento profundo<br>
        3. Mobilidade em posição de afundo (joelho de trás no chão)<br>
        4. Perdigueiro (4 apoios)<br>
        5. Anjo de Parede (cotovelos a 90°)<br>
        6. Passagem de Bastão/Cabo de Vassoura<br>
        7. Alongamentos estáticos passivos<br><br>
        🎯 <i>Meta: Devolver mobilidade ao quadril/tornozelos, aliviar dores no joelho e recuperar o corpo.</i>`,

    4: `<h3>🔥 QUINTA-FEIRA — Ombro + Peito + Core</h3>
        <strong>🚶‍♀️ TODOS OS DIAS:</strong> 15 min de Esteira (ou Bike/Elíptico)<br><br>
        <strong>🏋️ MUSCULAÇÃO:</strong><br>
        1. Desenvolvimento Máquina – 3x12<br>
        2. Elevação Lateral – 3x12<br>
        3. Peitoral Máquina / Voador – 2x12<br>
        4. Remada Alta – 2x12<br>
        5. Prancha Isométrica – 2x 30 a 40s<br><br>
        🎯 <i>Meta: Acelerar o metabolismo e fortalecer o tronco.</i>`,

    5: `<h3>🔥 SEXTA-FEIRA — Posterior + Glúteo + Full Body Leve</h3>
        <strong>🚶‍♀️ TODOS OS DIAS:</strong> 15 min de Esteira (ou Bike/Elíptico)<br><br>
        <strong>🏋️ MUSCULAÇÃO:</strong><br>
        1. Stiff com Halteres leves – 3x12 (joelhos semiflexionados)<br>
        2. Glúteo 4 Apoios (Polia ou Caneleira) – 3x12<br>
        3. Cadeira Flexora – 3x12<br>
        4. Remada (máquina livre) – 2x12<br>
        5. Tríceps Corda – 2x12<br>
        6. Prancha + Canivete alternado – 2x12<br><br>
        🎯 <i>Meta: Treino leve e global com foco em glúteo e posterior.</i>`,

    6: "<h3>✨ SÁBADO — Livre</h3> Caminhada leve, alongamento, descanso ativo… 🌿",
    0: "<h3>✨ DOMINGO — Descanso</h3> Recuperar energias 💙"
};

function mostrarTreinoDia() {
    const hoje = new Date().getDay();
    document.getElementById("boxTreino").innerHTML = treinosSemana[hoje];
    document.getElementById("boxTreino").style.display = "block";
}

function atualizarTema() {
    const temas = ["tema1", "tema2", "tema3", "tema4", "tema5"];
    let index = Math.floor(contador / 30) % temas.length;
    let container = document.getElementById("appContainer");
    if (container) container.className = "container " + temas[index];
}

function diasFaltando() { 
    return META - contador; 
}

function atualizarTela() {
    let elContador = document.getElementById("contador");
    let elFaltam = document.getElementById("faltamDias");
    let elFill = document.getElementById("progressFill");

    if (elContador) elContador.textContent = contador;
    if (elFaltam) elFaltam.textContent = diasFaltando() > 0 ? `Faltam ${diasFaltando()} dias para a meta` : "Meta alcançada! 🎉🔥";
    if (elFill) elFill.style.width = (contador / META * 100) + "%";

    atualizarTema();
    carregarListaTreinos();
    atualizarGraficoTreinos();
}

function salvarRegistro() {
    const hoje = new Date().toISOString().slice(0, 10);
    historico.push({ data: hoje });
    contador++;
    salvarTreinos();
}

function abrirRegistroData() {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("dataTreino").value = new Date().toISOString().slice(0, 10);
}

function registrarDataEscolhida() {
    let d = document.getElementById("dataTreino").value;
    if (!d) return;
    historico.push({ data: d });
    contador++;
    salvarTreinos();
    fecharModal();
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}

function salvarTreinos() {
    localStorage.setItem("treinos", JSON.stringify(historico));
    atualizarTela();
}

function carregarListaTreinos() {
    let lista = document.getElementById("historicoLista");
    if (!lista) return;
    lista.innerHTML = "";
    historico.forEach((r, i) => {
        lista.innerHTML += `
            <div class="registro-item">
                <span>${r.data}</span>
                <button onclick="apagarTreino(${i})">Excluir</button>
            </div>
        `;
    });
}

function apagarTreino(i) {
    historico.splice(i, 1);
    contador--;
    salvarTreinos();
}

function resetar() {
    if (!confirm("Deseja zerar tudo?")) return;
    historico = [];
    contador = 0;
    salvarTreinos();
}

function atualizarGraficoTreinos() {
    let el = document.getElementById("graficoMensal");
    if (!el) return;

    let meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    let dados = new Array(12).fill(0);

    historico.forEach(r => {
        let mes = new Date(r.data + 'T00:00:00').getMonth();
        dados[mes]++;
    });

    if (grafico) grafico.destroy();

    grafico = new Chart(el, {
        type: "bar",
        data: {
            labels: meses,
            datasets: [{
                label: "Treinos no mês",
                data: dados,
                backgroundColor: '#4a57ff'
            }]
        },
        options: {
            responsive: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

/* =====================================
       SINCRONIZAÇÃO VIA GITHUB GIST
===================================== */
function salvarConfigNuvem() {
    const gistId = document.getElementById("gistIdInput").value.trim();
    const token = document.getElementById("gistTokenInput").value.trim();

    if (!gistId || !token) {
        alert("Preencha o ID do Gist e o Token!");
        return;
    }

    localStorage.setItem("github_gist_id", gistId);
    localStorage.setItem("github_token", token);
    alert("Configurações salvas com sucesso!");
}

function carregarConfigNuvem() {
    let elGist = document.getElementById("gistIdInput");
    let elToken = document.getElementById("gistTokenInput");

    if (elGist) elGist.value = localStorage.getItem("github_gist_id") || "";
    if (elToken) elToken.value = localStorage.getItem("github_token") || "";
}

async function uploadParaNuvem() {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        alert("Configure o ID do Gist e o Token primeiro na aba Nuvem!");
        return;
    }

    const dadosCompletos = {
        treinos: JSON.parse(localStorage.getItem("treinos")) || [],
        pesos: JSON.parse(localStorage.getItem("pesos")) || [],
        injecoes: JSON.parse(localStorage.getItem("injecoes")) || []
    };

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                files: {
                    "dados_fitness.json": {
                        content: JSON.stringify(dadosCompletos, null, 2)
                    }
                }
            })
        });

        if (response.ok) {
            alert("✅ Dados enviados com sucesso para a nuvem!");
        } else {
            alert("❌ Erro ao enviar dados. Verifique seu ID e Token.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão ao enviar para o GitHub.");
    }
}

async function downloadDaNuvem(manual = true) {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        if (manual) alert("Configure o ID do Gist e o Token primeiro na aba Nuvem!");
        return;
    }

    if (manual && !confirm("Isso substituirá os dados locais pelos dados salvos na nuvem. Continuar?")) return;

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}?t=${Date.now()}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            const arquivoGist = data.files["dados_fitness.json"] || Object.values(data.files)[0];

            if (arquivoGist && arquivoGist.content) {
                const conteudo = JSON.parse(arquivoGist.content);

                localStorage.setItem("treinos", JSON.stringify(conteudo.treinos || []));
                localStorage.setItem("pesos", JSON.stringify(conteudo.pesos || []));
                localStorage.setItem("injecoes", JSON.stringify(conteudo.injecoes || []));

                historico = conteudo.treinos || [];
                pesos = conteudo.pesos || [];
                injecoes = conteudo.injecoes || [];
                contador = historico.length;

                renderizarTudo();

                if (manual) alert("🔄 Dados baixados e atualizados com sucesso!");
            }
        } else if (manual) {
            alert("❌ Erro ao baixar dados. Verifique seu ID e Token.");
        }
    } catch (erro) {
        console.error(erro);
        if (manual) alert("Erro de conexão ao baixar do GitHub.");
    }
}

function renderizarTudo() {
    contador = historico.length;
    atualizarTela();
    carregarListaPeso();
    atualizarGraficoPeso();
    carregarInjecoes();
    carregarConfigNuvem();
}

/* =====================================
         INICIALIZAÇÃO DA PÁGINA
===================================== */
document.addEventListener("DOMContentLoaded", () => {
    renderizarTudo();

    // Sincroniza em segundo plano ao abrir se já houver credenciais salvas
    if (localStorage.getItem("github_gist_id") && localStorage.getItem("github_token")) {
        downloadDaNuvem(false);
    }
});