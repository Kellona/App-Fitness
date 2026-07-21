const META = 200;
let contador = 0;
let historico = JSON.parse(localStorage.getItem("treinos")) || [];
let pesos = JSON.parse(localStorage.getItem("pesos")) || [];
let injecoes = JSON.parse(localStorage.getItem("injecoes")) || [];
let fotos = JSON.parse(localStorage.getItem("fotos")) || [];
let grafico, graficoPeso;

function abrirAba(aba) {
    document.getElementById("abaTreinos").style.display = aba === "treinos" ? "block" : "none";
    document.getElementById("abaPeso").style.display = aba === "peso" ? "block" : "none";
    document.getElementById("abaInj").style.display = aba === "inj" ? "block" : "none";
    document.getElementById("abaFotos").style.display = aba === "fotos" ? "block" : "none";

    document.getElementById("tabTreinos").classList.toggle("active", aba === "treinos");
    document.getElementById("tabPeso").classList.toggle("active", aba === "peso");
    document.getElementById("tabInj").classList.toggle("active", aba === "inj");
    document.getElementById("tabFotos").classList.toggle("active", aba === "fotos");
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
    if (graficoPeso) graficoPeso.destroy();

    graficoPeso = new Chart(document.getElementById("graficoPeso"), {
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
         FUNÇÕES EVOLUÇÃO (FOTOS)
===================================== */
function salvarFoto() {
    const arquivo = document.getElementById("fotoInput").files[0];
    const data = document.getElementById("dataFoto").value;

    if (!arquivo || !data) {
        alert("Escolha a data e a foto.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        fotos.push({
            data: data,
            imagem: e.target.result
        });
        localStorage.setItem("fotos", JSON.stringify(fotos));
        carregarFotos();
        document.getElementById("fotoInput").value = "";
    };
    reader.readAsDataURL(arquivo);
}

function carregarFotos() {
    let galeria = document.getElementById("galeriaFotos");
    galeria.innerHTML = "";

    fotos.forEach((foto, index) => {
        galeria.innerHTML += `
            <div style="background:white; margin-bottom:20px; border-radius:12px; padding:12px; box-shadow:0 2px 8px rgba(0,0,0,.15); text-align: left;">
                <strong>${foto.data}</strong>
                <br><br>
                <img src="${foto.imagem}" style="width:100%; border-radius:10px; cursor:pointer;" onclick="window.open('${foto.imagem}')">
                <button style="margin-top:10px; background:#ff4d4d; color:white; width:100%; padding:10px; border:none; border-radius:8px; font-weight: bold;" onclick="apagarFoto(${index})">
                    Excluir
                </button>
            </div>
        `;
    });
}

function apagarFoto(i) {
    fotos.splice(i, 1);
    localStorage.setItem("fotos", JSON.stringify(fotos));
    carregarFotos();
}

/* =====================================
         FUNÇÕES TREINOS
===================================== */
const treinosSemana = {
    1: `<h3>🔥 SEGUNDA — TREINO A (Inferiores/Glúteos)</h3><strong>🏋️ MUSCULAÇÃO — 35 min</strong><br>1. Agachamento no banco – 3x12<br>2. Leg press – 3x12<br>3. Cadeira abdutora – 3x15<br>4. Mesa flexora – 3x12<br>5. Avanço estático – 3x10 por perna<br>6. Elevação pélvica – 3x12<br><br><strong>🚶‍♀️ ESTEIRA — 15 min</strong><br>• Ritmo confortável a moderado<br>• Inclinação opcional 1–3%`,
    2: `<h3>🔥 TERÇA — TREINO B (Superiores)</h3><strong>🏋️ MUSCULAÇÃO — 35 min</strong><br>1. Puxada frontal – 3x12<br>2. Remada baixa – 3x12<br>3. Supino máquina – 3x10<br>4. Desenvolvimento ombro – 3x10<br>5. Tríceps corda – 3x12<br>6. Rosca direta – 3x12<br>7. Prancha – 2x30s<br><br><strong>🚶‍♀️ ESTEIRA — 15 min</strong>`,
    3: `<h3>🔥 QUARTA — TREINO C (Inferiores + Abdome)</h3><strong>🏋️ MUSCULAÇÃO — 35 min</strong><br>1. Cadeira extensora – 3x12<br>2. Agachamento sumô com halter – 3x12<br>3. Stiff com halteres – 3x12<br>4. Glúteo no cabo/caneleira – 3x12 cada perna<br>5. Cadeira abdutora – 3x15<br>6. Abdômen prancha inclinada – 2x15<br>7. Prancha lateral – 2x20s<br><br><strong>🚶‍♀️ ESTEIRA — 15 min</strong>`,
    4: `<h3>🔥 QUINTA — TREINO A (Progressão leve)</h3><strong>🏋️ MUSCULAÇÃO — 35 min</strong><br>Segunda-feira + progressão suave:<br>➡️ +1–2 repetições OU +1–2 kg em 1 exercício<br>Tudo no amor, nada no desespero. 😍<br><br>1. Agachamento no banco – 3x12<br>2. Leg press – 3x12<br>3. Cadeira abdutora – 3x15<br>4. Mesa flexora – 3x12<br>5. Avanço estático – 3x10 por perna<br>6. Elevação pélvica – 3x12<br><br><strong>🚶‍♀️ ESTEIRA — 15 min</strong>`,
    5: `<h3>🔥 SEXTA — TREINO B (Funcional + Superior leve)</h3><strong>🏋️ MUSCULAÇÃO — 35 min</strong><br>1. Agachamento no banco – 2x15<br>2. Remada baixa – 2x12<br>3. Elevação pélvica – 2x15<br>4. Tríceps corda – 2x12<br>5. Abdômen supra – 2x15<br>6. Prancha – 30s<br>7. Desenvolvimento ombro – 2x12<br><br><strong>🚶‍♀️ ESTEIRA — 15 min</strong>`,
    6: "<h3>✨ SÁBADO — Livre</h3> Caminhada leve, alongamento, yoga… 🌿",
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
    document.getElementById("appContainer").className = "container " + temas[index];
}

function diasFaltando() { 
    return META - contador; 
}

function atualizarTela() {
    document.getElementById("contador").textContent = contador;
    document.getElementById("faltamDias").textContent = diasFaltando() > 0 ? `Faltam ${diasFaltando()} dias para a meta` : "Meta alcançada! 🎉🔥";
    document.getElementById("progressFill").style.width = (contador / META * 100) + "%";

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
    let meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    let dados = new Array(12).fill(0);

    historico.forEach(r => {
        let mes = new Date(r.data + 'T00:00:00').getMonth();
        dados[mes]++;
    });

    if (grafico) grafico.destroy();

    grafico = new Chart(document.getElementById("graficoMensal"), {
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

// Inicialização da tela ao carregar o script
contador = historico.length;
atualizarTela();
carregarListaPeso();
atualizarGraficoPeso();
carregarInjecoes();
carregarFotos();

// =====================================
//      SINCRONIZAÇÃO VIA GITHUB GIST
// =====================================

// Atualize a função abrirAba para incluir a aba 'nuvem'
/* 
  Na sua função abrirAba(aba) existente, certifique-se de adicionar:
  document.getElementById("abaNuvem").style.display = aba === "nuvem" ? "block" : "none";
  document.getElementById("tabNuvem").classList.toggle("active", aba === "nuvem");
*/

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
    document.getElementById("gistIdInput").value = localStorage.getItem("github_gist_id") || "";
    document.getElementById("gistTokenInput").value = localStorage.getItem("github_token") || "";
}

async function uploadParaNuvem() {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        alert("Configure o ID do Gist e o Token primeiro na aba Nuvem!");
        return;
    }

    // Monta o objeto completo com todos os dados do App
    const dadosCompletos = {
        treinos: JSON.parse(localStorage.getItem("treinos")) || [],
        pesos: JSON.parse(localStorage.getItem("pesos")) || [],
        injecoes: JSON.parse(localStorage.getItem("injecoes")) || [],
        fotos: JSON.parse(localStorage.getItem("fotos")) || []
    };

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `token ${token}`,
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

async function downloadDaNuvem() {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        alert("Configure o ID do Gist e o Token primeiro na aba Nuvem!");
        return;
    }

    if (!confirm("Isso substituirá os dados locais pelos dados salvos na nuvem. Continuar?")) return;

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const conteudo = JSON.parse(data.files["dados_fitness.json"].content);

            // Atualiza o localStorage local
            localStorage.setItem("treinos", JSON.stringify(conteudo.treinos || []));
            localStorage.setItem("pesos", JSON.stringify(conteudo.pesos || []));
            localStorage.setItem("injecoes", JSON.stringify(conteudo.injecoes || []));
            localStorage.setItem("fotos", JSON.stringify(conteudo.fotos || []));

            // Recarrega as variáveis e a tela
            historico = conteudo.treinos || [];
            pesos = conteudo.pesos || [];
            injecoes = conteudo.injecoes || [];
            fotos = conteudo.fotos || [];
            contador = historico.length;

            atualizarTela();
            carregarListaPeso();
            atualizarGraficoPeso();
            carregarInjecoes();
            carregarFotos();

            alert("🔄 Dados baixados e atualizados com sucesso!");
        } else {
            alert("❌ Erro ao baixar dados. Verifique seu ID e Token.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão ao baixar do GitHub.");
    }
}

// Chamar ao carregar a página para preencher os campos se já existirem
carregarConfigNuvem();