
/* PAINEL FITNESS — AVALIAÇÃO CORPORAL COM 7 DOBRAS
   Este arquivo deve ser carregado depois de script.js.
*/

var avaliacoesDobras = JSON.parse(
    localStorage.getItem("avaliacoesDobras") || "[]"
);

var graficoMassaMagra = null;
var graficoPercentualGordura = null;

// --------------------------------------------------
// CÁLCULO E SALVAMENTO DA AVALIAÇÃO
// --------------------------------------------------

function salvarAvaliacaoCorporal() {
    const data = document.getElementById("dataAvaliacao").value;
    const idade = Number(document.getElementById("idadeAvaliacao").value);
    const peso = Number(document.getElementById("pesoAvaliacao").value);

    const campos = {
        peitoral: "dobraPeitoral",
        axilarMedia: "dobraAxilar",
        triceps: "dobraTriceps",
        subescapular: "dobraSubescapular",
        abdominal: "dobraAbdominal",
        supraIliaca: "dobraSuprailiaca",
        coxa: "dobraCoxa"
    };

    const dobras = {};

    for (const chave in campos) {
        dobras[chave] = Number(
            document.getElementById(campos[chave]).value
        );
    }

    if (
        !data ||
        !idade ||
        idade < 18 ||
        idade > 100 ||
        !peso ||
        peso <= 0 ||
        Object.values(dobras).some(v => !Number.isFinite(v) || v <= 0)
    ) {
        alert("Preencha a data, a idade, o peso e as sete dobras com valores válidos.");
        return;
    }

    const soma = Object.values(dobras).reduce((a, b) => a + b, 0);

    // Jackson-Pollock: 7 dobras para mulheres.
    const densidade =
        1.097 -
        (0.00046971 * soma) +
        (0.00000056 * soma * soma) -
        (0.00012828 * idade);

    if (!Number.isFinite(densidade) || densidade <= 0) {
        alert("Não foi possível calcular. Confira as medidas.");
        return;
    }

    // Equação de Siri para estimativa do percentual de gordura.
    const percentualGordura = (495 / densidade) - 450;

    if (
        !Number.isFinite(percentualGordura) ||
        percentualGordura < 0 ||
        percentualGordura > 70
    ) {
        alert("Resultado fora da faixa esperada. Confira as medidas.");
        return;
    }

    const massaGorda = peso * percentualGordura / 100;
    const massaMagra = peso - massaGorda;

    const avaliacao = {
        data,
        idade,
        peso,
        ...dobras,
        soma,
        densidade,
        percentualGordura,
        massaGorda,
        massaMagra,
        protocolo: "Jackson-Pollock 7 dobras - mulheres"
    };

    // Uma avaliação por data: evita duplicação no mesmo dia.
    avaliacoesDobras = avaliacoesDobras.filter(a => a.data !== data);
    avaliacoesDobras.push(avaliacao);
    avaliacoesDobras.sort((a, b) => a.data.localeCompare(b.data));

    localStorage.setItem(
        "avaliacoesDobras",
        JSON.stringify(avaliacoesDobras)
    );

    const resultado = document.getElementById("resultadoAvaliacao");

    resultado.style.display = "block";
    resultado.innerHTML = `
        <div style="padding:15px;margin-top:15px;background:#eef3ff;border-radius:10px;line-height:1.9">
            <h3>📊 Resultado da avaliação</h3>
            <strong>Data:</strong> ${formatarDataCorporal(data)}<br>
            <strong>Soma das dobras:</strong> ${soma.toFixed(1)} mm<br>
            <strong>Densidade corporal:</strong> ${densidade.toFixed(4)} g/cm³<br>
            <strong>Percentual de gordura:</strong> ${percentualGordura.toFixed(1)}%<br>
            <strong>Massa gorda:</strong> ${massaGorda.toFixed(1)} kg<br>
            <strong>Massa magra estimada:</strong> ${massaMagra.toFixed(1)} kg
        </div>
    `;

    carregarHistoricoAvaliacaoCorporal();
    atualizarGraficosComposicao();
    gerarRelatorioCorporal();
}

// --------------------------------------------------
// FORMATAÇÃO DE DATA
// --------------------------------------------------

function formatarDataCorporal(data) {
    if (!data) return "—";

    const partes = data.split("-");

    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : data;
}

function formatarNumeroCorporal(valor) {
    return Number(valor).toFixed(1).replace(".", ",");
}

// --------------------------------------------------
// GRÁFICO DE MASSA MAGRA E GORDURA CORPORAL
// --------------------------------------------------

function atualizarGraficosComposicao() {
    const lista = [...avaliacoesDobras].sort(
        (a, b) => a.data.localeCompare(b.data)
    );

    const canvasMagra = document.getElementById("graficoMassaMagra");
    const canvasGordura = document.getElementById("graficoPercentualGordura");

    if (!canvasMagra || !canvasGordura || typeof Chart === "undefined") {
        return;
    }

    if (graficoMassaMagra) graficoMassaMagra.destroy();
    if (graficoPercentualGordura) graficoPercentualGordura.destroy();

    const datas = lista.map(a => formatarDataCorporal(a.data));

    graficoMassaMagra = new Chart(canvasMagra, {
        type: "line",
        data: {
            labels: datas,
            datasets: [{
                label: "Massa magra (kg)",
                data: lista.map(a => Number(a.massaMagra)),
                borderColor: "#25865a",
                backgroundColor: "rgba(37,134,90,0.12)",
                borderWidth: 3,
                pointRadius: 4,
                tension: 0.25,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Massa magra (kg)"
                    }
                }
            }
        }
    });

    graficoPercentualGordura = new Chart(canvasGordura, {
        type: "line",
        data: {
            labels: datas,
            datasets: [{
                label: "Gordura corporal (%)",
                data: lista.map(a => Number(a.percentualGordura)),
                borderColor: "#e07832",
                backgroundColor: "rgba(224,120,50,0.12)",
                borderWidth: 3,
                pointRadius: 4,
                tension: 0.25,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Gordura corporal (%)"
                    }
                }
            }
        }
    });
}

// --------------------------------------------------
// HISTÓRICO DAS AVALIAÇÕES
// --------------------------------------------------

function carregarHistoricoAvaliacaoCorporal() {
    const lista = document.getElementById("historicoAvaliacaoCorporal");

    if (!lista) return;

    lista.innerHTML = "";

    if (avaliacoesDobras.length === 0) {
        lista.innerHTML = "<p>Nenhuma avaliação registrada ainda.</p>";
        return;
    }

    [...avaliacoesDobras]
        .sort((a, b) => b.data.localeCompare(a.data))
        .forEach(a => {
            const indice = avaliacoesDobras.findIndex(
                item => item.data === a.data
            );

            lista.innerHTML += `
                <div class="registro-item"
                     style="display:block;margin-bottom:10px;padding:12px">

                    <strong>${formatarDataCorporal(a.data)}</strong><br>
                    Peso: ${formatarNumeroCorporal(a.peso)} kg<br>
                    Gordura corporal:
                    ${formatarNumeroCorporal(a.percentualGordura)}%<br>
                    Massa gorda:
                    ${formatarNumeroCorporal(a.massaGorda)} kg<br>
                    Massa magra:
                    ${formatarNumeroCorporal(a.massaMagra)} kg<br>

                    <small>
                        Dobras (mm): peitoral ${a.peitoral},
                        axilar ${a.axilarMedia},
                        tríceps ${a.triceps},
                        subescapular ${a.subescapular},
                        abdominal ${a.abdominal},
                        supra-ilíaca ${a.supraIliaca},
                        coxa ${a.coxa}
                    </small>

                    <br>
                    <button onclick="apagarAvaliacaoCorporal(${indice})">
                        Excluir
                    </button>
                </div>
            `;
        });
}

function apagarAvaliacaoCorporal(indice) {
    if (!confirm("Deseja excluir esta avaliação corporal?")) return;

    avaliacoesDobras.splice(indice, 1);

    localStorage.setItem(
        "avaliacoesDobras",
        JSON.stringify(avaliacoesDobras)
    );

    carregarHistoricoAvaliacaoCorporal();
    atualizarGraficosComposicao();
    gerarRelatorioCorporal();
}

// --------------------------------------------------
// RELATÓRIO: PRIMEIRA AVALIAÇÃO X MAIS RECENTE
// --------------------------------------------------

function gerarRelatorioCorporal() {
    const alvo = document.getElementById("relatorioCorporal");

    if (!alvo) return;

    const lista = [...avaliacoesDobras].sort(
        (a, b) => a.data.localeCompare(b.data)
    );

    if (lista.length < 2) {
        alvo.innerHTML = `
            <div style="padding:14px;border:1px solid #ddd;border-radius:10px">
                Registre pelo menos <strong>duas avaliações em datas diferentes</strong>
                para gerar o relatório comparativo.
            </div>
        `;
        return;
    }

    const primeira = lista[0];
    const recente = lista[lista.length - 1];

    const difMagra = recente.massaMagra - primeira.massaMagra;
    const difGorda = recente.massaGorda - primeira.massaGorda;
    const difPercentual =
        recente.percentualGordura - primeira.percentualGordura;
    const difPeso = recente.peso - primeira.peso;

    function cartao(titulo, inicial, atual, diferenca, unidade) {
        const sinal = diferenca > 0 ? "+" : "";

        return `
            <div style="padding:13px;border:1px solid #ddd;border-radius:10px">
                <strong>${titulo}</strong>
                <p>Primeira: ${formatarNumeroCorporal(inicial)} ${unidade}</p>
                <p>Mais recente: ${formatarNumeroCorporal(atual)} ${unidade}</p>
                <div style="font-size:21px;font-weight:bold">
                    ${sinal}${formatarNumeroCorporal(diferenca)} ${unidade}
                </div>
                <small>Mais recente menos primeira</small>
            </div>
        `;
    }

    alvo.innerHTML = `
        <div id="conteudoRelatorioCorporal"
             style="padding:16px;border:1px solid #ddd;border-radius:12px;background:white;color:#222">

            <div style="text-align:center">
                <h3>Relatório Comparativo de Avaliação Corporal</h3>
                <p>Protocolo de 7 dobras cutâneas — estimativas</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
                <div style="padding:12px;background:#f4f6f8;border-radius:9px">
                    <strong>Primeira avaliação</strong><br>
                    ${formatarDataCorporal(primeira.data)}<br>
                    Peso: ${formatarNumeroCorporal(primeira.peso)} kg
                </div>

                <div style="padding:12px;background:#f4f6f8;border-radius:9px">
                    <strong>Avaliação mais recente</strong><br>
                    ${formatarDataCorporal(recente.data)}<br>
                    Peso: ${formatarNumeroCorporal(recente.peso)} kg
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px">
                ${cartao("Massa magra", primeira.massaMagra, recente.massaMagra, difMagra, "kg")}
                ${cartao("Massa gorda", primeira.massaGorda, recente.massaGorda, difGorda, "kg")}
                ${cartao("Percentual de gordura", primeira.percentualGordura, recente.percentualGordura, difPercentual, "p.p.")}
            </div>

            <div style="margin-top:14px;padding:12px;background:#f4f6f8;border-radius:9px">
                <strong>Variação do peso total:</strong>
                ${difPeso > 0 ? "+" : ""}${formatarNumeroCorporal(difPeso)} kg

                <p style="font-size:12px">
                    Os valores são estimativas. Para comparar a evolução,
                    procure realizar as avaliações com o mesmo protocolo,
                    técnica e condições semelhantes.
                </p>
            </div>
        </div>
    `;
}

// --------------------------------------------------
// IMPRIMIR OU SALVAR RELATÓRIO EM PDF
// --------------------------------------------------

function imprimirRelatorioCorporal() {
    gerarRelatorioCorporal();

    const conteudo = document.getElementById("conteudoRelatorioCorporal");

    if (
        avaliacoesDobras.length < 2 ||
        !conteudo ||
        !conteudo.innerText.includes("Primeira avaliação")
    ) {
        alert("Registre pelo menos duas avaliações antes de imprimir.");
        return;
    }

    const janela = window.open("", "_blank");

    if (!janela) {
        alert("Permita a abertura de janelas para imprimir ou salvar em PDF.");
        return;
    }

    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Corporal</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 24px;
                    color: #222;
                }
                @media print {
                    body { margin: 10mm; }
                }
            </style>
        </head>
        <body>
            ${conteudo.outerHTML}
            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);

    janela.document.close();
}

// --------------------------------------------------
// SINCRONIZAÇÃO COM O GITHUB GIST
// Inclui avaliações corporais junto dos demais dados.
// --------------------------------------------------

async function uploadParaNuvem() {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        alert("Configure o ID do Gist e o Token na aba Nuvem.");
        return;
    }

    const dados = {
        treinos: JSON.parse(localStorage.getItem("treinos") || "[]"),
        pesos: JSON.parse(localStorage.getItem("pesos") || "[]"),
        injecoes: JSON.parse(localStorage.getItem("injecoes") || "[]"),
        avaliacoesDobras: JSON.parse(
            localStorage.getItem("avaliacoesDobras") || "[]"
        )
    };

    try {
        const resposta = await fetch(
            `https://api.github.com/gists/${gistId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/vnd.github+json"
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

        if (resposta.ok) {
            alert("✅ Dados enviados para a nuvem, incluindo as avaliações corporais!");
        } else {
            alert("❌ Erro ao enviar. Verifique o ID do Gist e o Token.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão ao enviar os dados.");
    }
}

async function downloadDaNuvem(manual = true) {
    const gistId = localStorage.getItem("github_gist_id");
    const token = localStorage.getItem("github_token");

    if (!gistId || !token) {
        if (manual) alert("Configure o ID do Gist e o Token na aba Nuvem.");
        return;
    }

    if (
        manual &&
        !confirm("Isso substituirá os dados locais pelos dados da nuvem. Continuar?")
    ) {
        return;
    }

    try {
        const resposta = await fetch(
            `https://api.github.com/gists/${gistId}?t=${Date.now()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json"
                }
            }
        );

        if (!resposta.ok) {
            if (manual) alert("Erro ao baixar. Verifique o ID do Gist e o Token.");
            return;
        }

        const dadosGist = await resposta.json();
        const arquivo =
            dadosGist.files["dados_fitness.json"] ||
            Object.values(dadosGist.files)[0];

        if (!arquivo || !arquivo.content) {
            if (manual) alert("Não encontrei os dados no Gist.");
            return;
        }

        const dados = JSON.parse(arquivo.content);

        ["treinos", "pesos", "injecoes", "avaliacoesDobras"].forEach(chave => {
            localStorage.setItem(chave, JSON.stringify(dados[chave] || []));
        });

        if (typeof historico !== "undefined") historico = dados.treinos || [];
        if (typeof pesos !== "undefined") pesos = dados.pesos || [];
        if (typeof injecoes !== "undefined") injecoes = dados.injecoes || [];

        avaliacoesDobras = dados.avaliacoesDobras || [];

        if (typeof renderizarTudo === "function") renderizarTudo();

        carregarHistoricoAvaliacaoCorporal();
        atualizarGraficosComposicao();
        gerarRelatorioCorporal();

        if (manual) {
            alert("✅ Dados baixados e atualizados!");
        }
    } catch (erro) {
        console.error(erro);
        if (manual) alert("Erro ao baixar os dados do GitHub.");
    }
}

// --------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
    carregarHistoricoAvaliacaoCorporal();
    atualizarGraficosComposicao();
    gerarRelatorioCorporal();
});