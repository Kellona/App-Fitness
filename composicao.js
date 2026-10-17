
/* Painel Fitness - avaliação corporal compatível com dados antigos */

let chartMassaMagra = null;
let chartGordura = null;

function obterAvaliacoesCorporais() {
  let avaliacoes = [];

  try {
    avaliacoes = JSON.parse(
      localStorage.getItem('fitness_avaliacao_db') || '[]'
    );
  } catch (e) {
    console.error('Erro ao ler avaliações novas:', e);
  }

  if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) {
    try {
      const antigas = JSON.parse(
        localStorage.getItem('avaliacoesDobras') || '[]'
      );

      if (Array.isArray(antigas)) avaliacoes = antigas;
    } catch (e) {
      console.error('Erro ao ler avaliações antigas:', e);
    }
  }

  return avaliacoes
    .map(a => ({
      ...a,
      pctGordura: Number(
        a.pctGordura ?? a.percentualGordura
      ),
      massaMagraKg: Number(
        a.massaMagraKg ?? a.massaMagra
      ),
      massaGordaKg: Number(
        a.massaGordaKg ?? a.massaGorda
      ),
      somaDobras: Number(
        a.somaDobras ?? a.soma ?? 0
      )
    }))
    .filter(a => a.data);
}

function salvarListaAvaliacoes(avaliacoes) {
  const conteudo = JSON.stringify(avaliacoes);

  localStorage.setItem('fitness_avaliacao_db', conteudo);
  localStorage.setItem('avaliacoesDobras', conteudo);
}

function salvarAvaliacaoCorporal() {
  const valor = id =>
    String(document.getElementById(id)?.value ?? '').trim();

  const data = valor('dataAvaliacao');
  const idade = Number(valor('idadeAvaliacao'));
  const peso = Number(valor('pesoAvaliacao').replace(',', '.'));

  const idsDobras = [
    'dobraPeitoral',
    'dobraAxilar',
    'dobraTriceps',
    'dobraSubescapular',
    'dobraAbdominal',
    'dobraSuprailiaca',
    'dobraCoxa'
  ];

  const dobras = idsDobras.map(id =>
    Number(valor(id).replace(',', '.'))
  );

  if (
    !data ||
    !Number.isFinite(idade) ||
    idade < 18 ||
    idade > 100 ||
    !Number.isFinite(peso) ||
    peso <= 0
  ) {
    alert(
      'Preencha a data, a idade (18 a 100 anos) e um peso válido.'
    );
    return;
  }

  if (dobras.some(v => !Number.isFinite(v) || v <= 0)) {
    alert('Preencha as sete dobras com medidas maiores que zero.');
    return;
  }

  const soma = dobras.reduce((total, valor) => total + valor, 0);

  /*
   * Equação de Jackson-Pollock de 7 dobras para mulheres.
   * A estimativa depende da técnica correta de medição.
   */
  const densidade =
    1.097 -
    0.00046971 * soma +
    0.00000056 * soma * soma -
    0.00012828 * idade;

  const percentual = (4.95 / densidade - 4.5) * 100;

  if (
    !Number.isFinite(densidade) ||
    densidade <= 0 ||
    !Number.isFinite(percentual) ||
    percentual < 0 ||
    percentual > 70
  ) {
    alert(
      'O resultado ficou fora da faixa esperada. ' +
      'Confira as medidas e a técnica de avaliação.'
    );
    return;
  }

  const massaGorda = Number(
    (peso * percentual / 100).toFixed(2)
  );

  const massaMagra = Number(
    (peso - massaGorda).toFixed(2)
  );

  const avaliacao = {
    data,
    idade,
    peso,
    somaDobras: Number(soma.toFixed(1)),
    pctGordura: Number(percentual.toFixed(2)),
    massaMagraKg: massaMagra,
    massaGordaKg: massaGorda,

    // Campos antigos para manter compatibilidade.
    percentualGordura: Number(percentual.toFixed(2)),
    massaMagra,
    massaGorda,
    soma: Number(soma.toFixed(1)),

    protocolo: 'Jackson-Pollock 7 dobras - mulheres',

    dobras: {
      peitoral: dobras[0],
      axilar: dobras[1],
      triceps: dobras[2],
      subescapular: dobras[3],
      abdominal: dobras[4],
      suprailiaca: dobras[5],
      coxa: dobras[6]
    }
  };

  const historico = obterAvaliacoesCorporais()
    .filter(a => a.data !== data);

  historico.push(avaliacao);
  historico.sort((a, b) => a.data.localeCompare(b.data));

  salvarListaAvaliacoes(historico);

  const resultado = document.getElementById('resultadoAvaliacao');

  if (resultado) {
    resultado.innerHTML = `
      <div style="
        background:#e8f5e9;
        padding:15px;
        border-radius:10px;
        margin-top:15px
      ">
        <strong>Resultado estimado — ${data}</strong>
        <p>Soma das dobras:
          <strong>${avaliacao.somaDobras} mm</strong>
        </p>
        <p>Gordura corporal:
          <strong>${avaliacao.pctGordura}%</strong>
        </p>
        <p>Massa magra:
          <strong>${avaliacao.massaMagraKg} kg</strong>
        </p>
        <p>Massa gorda:
          <strong>${avaliacao.massaGordaKg} kg</strong>
        </p>
      </div>
    `;
  }

  renderizarAvaliacaoCorporal();
  alert('Avaliação corporal salva com sucesso!');
}

function renderizarAvaliacaoCorporal() {
  const historico = obterAvaliacoesCorporais();
  const lista = document.getElementById('historicoAvaliacaoCorporal');

  if (lista) {
    lista.innerHTML = historico
      .slice(-10)
      .reverse()
      .map(a => `
        <div class="item-historico">
          📊 <strong>${a.data}</strong> —
          Peso: ${a.peso} kg |
          Gordura: ${a.pctGordura}% |
          Massa magra: ${a.massaMagraKg} kg
        </div>
      `)
      .join('') || '<p>Nenhuma avaliação registrada.</p>';
  }

  const canvasMagra = document.getElementById('graficoMassaMagra');
  const canvasGordura = document.getElementById(
    'graficoPercentualGordura'
  );

  if (typeof Chart === 'undefined' || historico.length === 0) return;

  const datas = historico.map(a => a.data);
  const massasMagras = historico.map(a => a.massaMagraKg);
  const percentuais = historico.map(a => a.pctGordura);

  if (canvasMagra) {
    if (chartMassaMagra) chartMassaMagra.destroy();

    chartMassaMagra = new Chart(canvasMagra, {
      type: 'line',
      data: {
        labels: datas,
        datasets: [{
          label: 'Massa magra (kg)',
          data: massasMagras,
          borderColor: '#007bff',
          fill: false,
          tension: 0.25
        }]
      },
      options: { responsive: true }
    });
  }

  if (canvasGordura) {
    if (chartGordura) chartGordura.destroy();

    chartGordura = new Chart(canvasGordura, {
      type: 'line',
      data: {
        labels: datas,
        datasets: [{
          label: 'Gordura corporal (%)',
          data: percentuais,
          borderColor: '#dc3545',
          fill: false,
          tension: 0.25
        }]
      },
      options: { responsive: true }
    });
  }
}

function gerarRelatorioCorporal() {
  const historico = obterAvaliacoesCorporais();

  if (historico.length < 2) {
    alert('É necessário ter pelo menos duas avaliações para comparar.');
    return;
  }

  const primeira = historico[0];
  const ultima = historico[historico.length - 1];

  const formatar = n =>
    `${n > 0 ? '+' : ''}${n.toFixed(1)}`;

  const relatorio = document.getElementById('relatorioCorporal');

  if (!relatorio) {
    alert('Não encontrei a área do relatório no HTML.');
    return;
  }

  relatorio.innerHTML = `
    <div style="
      background:#f8f9fa;
      padding:15px;
      border:1px solid #ddd;
      border-radius:10px;
      margin-top:15px
    ">
      <h4>
        Relatório de evolução
        (${primeira.data} → ${ultima.data})
      </h4>
      <p>Variação de peso:
        <strong>${formatar(ultima.peso - primeira.peso)} kg</strong>
      </p>
      <p>Variação de gordura:
        <strong>
          ${formatar(ultima.pctGordura - primeira.pctGordura)}
          pontos percentuais
        </strong>
      </p>
      <p>Variação de massa magra:
        <strong>
          ${formatar(
            ultima.massaMagraKg - primeira.massaMagraKg
          )} kg
        </strong>
      </p>
    </div>
  `;
}

function imprimirRelatorioCorporal() {
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarAvaliacaoCorporal();
});
