/* ==========================================================================
   COMPOSIÇÃO CORPORAL - PROTOCOLO JACKSON-POLLOCK (7 DOBRAS)
   ========================================================================== */

let chartMassaMagra = null;
let chartGordura = null;

function salvarAvaliacaoCorporal() {
    const data = document.getElementById('dataAvaliacao').value;
    const idade = parseFloat(document.getElementById('idadeAvaliacao').value);
    const peso = parseFloat(document.getElementById('pesoAvaliacao').value);

    // Captura das 7 Dobras Cutâneas
    const peitoral = parseFloat(document.getElementById('dobraPeitoral').value) || 0;
    const axilar = parseFloat(document.getElementById('dobraAxilar').value) || 0;
    const triceps = parseFloat(document.getElementById('dobraTriceps').value) || 0;
    const subescapular = parseFloat(document.getElementById('dobraSubescapular').value) || 0;
    const abdominal = parseFloat(document.getElementById('dobraAbdominal').value) || 0;
    const suprailiaca = parseFloat(document.getElementById('dobraSuprailiaca').value) || 0;
    const coxa = parseFloat(document.getElementById('dobraCoxa').value) || 0;

    if (!data || isNaN(idade) || isNaN(peso)) {
        alert('Preencha os campos obrigatórios: Data, Idade e Peso.');
        return;
    }

    const somaDobras = peitoral + axilar + triceps + subescapular + abdominal + suprailiaca + coxa;
    if (somaDobras === 0) {
        alert('Insira as medidas das dobras para realizar o cálculo.');
        return;
    }

    // Fórmula Jackson-Pollock 7 Dobras para Mulheres (Densidade Corporal)
    const densidade = 1.0970 - (0.00046971 * somaDobras) + (0.00000056 * (somaDobras ** 2)) - (0.00012828 * idade);
    
    // Equação de Siri (% Gordura)
    const pctGordura = ((4.95 / densidade) - 4.5) * 100;
    const massaGordaKg = peso * (pctGordura / 100);
    const massaMagraKg = peso - massaGordaKg;

    const avaliacao = {
        data,
        idade,
        peso,
        somaDobras,
        pctGordura: parseFloat(pctGordura.toFixed(2)),
        massaMagraKg: parseFloat(massaMagraKg.toFixed(2)),
        massaGordaKg: parseFloat(massaGordaKg.toFixed(2))
    };

    const historico = JSON.parse(localStorage.getItem('fitness_avaliacao_db') || '[]');
    historico.push(avaliacao);
    historico.sort((a, b) => new Date(a.data) - new Date(b.data));

    localStorage.setItem('fitness_avaliacao_db', JSON.stringify(historico));

    document.getElementById('resultadoAvaliacao').innerHTML = `
        <div style="background:#e8f5e9; padding:15px; border-radius:10px; margin-top:15px;">
            <strong>Resultado Calculado:</strong><br>
            • % Gordura Corporal: <strong>${avaliacao.pctGordura}%</strong><br>
            • Massa Magra: <strong>${avaliacao.massaMagraKg} kg</strong><br>
            • Massa Gorda: <strong>${avaliacao.massaGordaKg} kg</strong>
        </div>
    `;

    renderizarAvaliacaoCorporal();
}

function renderizarAvaliacaoCorporal() {
    const historico = JSON.parse(localStorage.getItem('fitness_avaliacao_db') || '[]');

    // Histórico em lista
    const histEl = document.getElementById('historicoAvaliacaoCorporal');
    if (histEl) {
        histEl.innerHTML = historico.slice(-5).reverse().map(a => `
            <div class="item-historico">
                📊 <strong>${a.data}</strong> — Peso: ${a.peso}kg | Gordura: ${a.pctGordura}% | Massa Magra: ${a.massaMagraKg}kg
            </div>
        `).join('') || '<p>Nenhuma avaliação registrada.</p>';
    }

    if (historico.length === 0) return;

    const labels = historico.map(a => a.data);
    const massaMagraData = historico.map(a => a.massaMagraKg);
    const pctGorduraData = historico.map(a => a.pctGordura);

    // Gráfico de Massa Magra
    const ctxMagra = document.getElementById('graficoMassaMagra');
    if (ctxMagra) {
        if (chartMassaMagra) chartMassaMagra.destroy();
        chartMassaMagra = new Chart(ctxMagra, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Massa Magra (kg)',
                    data: massaMagraData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true
                }]
            },
            options: { responsive: true }
        });
    }

    // Gráfico de % Gordura
    const ctxGordura = document.getElementById('graficoPercentualGordura');
    if (ctxGordura) {
        if (chartGordura) chartGordura.destroy();
        chartGordura = new Chart(ctxGordura, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '% Gordura Corporal',
                    data: pctGorduraData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true
                }]
            },
            options: { responsive: true }
        });
    }
}

function gerarRelatorioCorporal() {
    const historico = JSON.parse(localStorage.getItem('fitness_avaliacao_db') || '[]');
    if (historico.length < 2) {
        alert('É necessário ter pelo menos duas avaliações para comparar.');
        return;
    }

    const primeira = historico[0];
    const ultima = historico[historico.length - 1];

    const diffPeso = (ultima.peso - primeira.peso).toFixed(1);
    const diffGordura = (ultima.pctGordura - primeira.pctGordura).toFixed(1);
    const diffMagra = (ultima.massaMagraKg - primeira.massaMagraKg).toFixed(1);

    document.getElementById('relatorioCorporal').innerHTML = `
        <div style="background:#f8f9fa; padding:15px; border:1px solid #ddd; border-radius:10px; margin-top:15px;">
            <h4>Relatório de Evolução (${primeira.data} ➔ ${ultima.data})</h4>
            <p>• Variação de Peso: <strong>${diffPeso > 0 ? '+' : ''}${diffPeso} kg</strong></p>
            <p>• Variação de Gordura: <strong>${diffGordura > 0 ? '+' : ''}${diffGordura}%</strong></p>
            <p>• Variação de Massa Magra: <strong>${diffMagra > 0 ? '+' : ''}${diffMagra} kg</strong></p>
        </div>
    `;
}

function imprimirRelatorioCorporal() {
    window.print();
}