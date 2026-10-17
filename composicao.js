
/* Painel Fitness - avaliação corporal corrigida */

let chartMassaMagra = null;
let chartGordura = null;

// Lê as avaliações atuais ou os dados salvos no formato antigo.
function obterAvaliacoesCorporais() {
  let avaliacoes = [];

  try {
    const novas = JSON.parse(
      localStorage.getItem('fitness_avaliacao_db') || '[]'
    );

    if (Array.isArray(novas)) avaliacoes = novas;
  } catch (e) {
    console.error('Erro ao ler avaliações novas:', e);
  }

  if (avaliacoes.length === 0) {
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
      peso: Number(a.peso),
      pctGordura: Number(a.pctGordura ?? a.percentualGordura),
      massaMagraKg: Number(a.massaMagraKg ?? a.massaMagra),
      massaGordaKg: Number(a.massaGordaKg ?? a.massaGorda),
      somaDobras: Number(a.somaDobras ?? a.soma ?? 0)
    }))
    .filter(a => a.data);
}

function salvarListaAvaliacoes(avaliacoes) {
  const conteudo = JSON.stringify(avaliacoes);

  localStorage.setItem('fitness_avaliacao_db', conteudo);
  localStorage.setItem('avaliacoesDobras', conteudo);
}

// Lê os valores numéricos, aceitando vírgula decimal.
function numeroCampo(id) {
  const campo = document.getElementById(id);
  if (!campo) return NaN;

  const texto = String(campo.value ?? '').trim().replace(',', '.');

  if (texto === '') return NaN;

  return Number(texto);
}

function salvarAvaliacaoCorporal() {
  const data = document.getElementById('dataAvaliacao')?.value;
  const idade = numeroCampo('idadeAvaliacao');
  const peso = numeroCampo('pesoAvaliacao');

  const idsDobras = [
    'dobraPeitoral',
    'dobraAxilar',
    'dobraTriceps',
    'dobraSubescapular',
    'dobraAbdominal',
    'dobraSuprailiaca',
    'dobraCoxa'
  ];

  const dobras = idsDobras.map(numeroCampo);

  if (
    !data ||
    !Number.isFinite(idade) ||
    idade < 18 ||
    idade > 100 ||
    !Number.isFinite(peso) ||
    peso <= 0
  ) {
    alert('Preencha a data, a idade entre 18 e 100 anos e um peso válido.');
    return;
  }

  if (dobras.some(v => !Number.isFinite(v) || v <= 0)) {
    alert('Preencha as sete dobras com medidas maiores que zero.');
    return;
  }

  const soma = dobras.reduce((total, valor) => total + valor, 0);

  // Jackson-Pollock de 7 dobras para mulheres.
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
    alert('Resultado fora da faixa esperada. Confira as medidas digitadas.');
    return;
  }

  const pct = Number(percentual.toFixed(2));
  const massaGorda = Number((peso * pct / 100).toFixed(2));
  const massaMagra = Number((peso - massaGorda).toFixed(2));
  const somaArredondada = Number(soma.toFixed(1));

  const avaliacao = {
    data,
    idade,
    peso,
    somaDobras: somaArredondada,
    pctGordura: pct,
    massaMagraKg: massaMagra,
    massaGordaKg: massaGorda,

    // Compatibilidade com registros antigos.
    percentualGordura: pct,
    massaMagra,
    massaGorda,
    soma: somaArredondada,

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

  try {
    salvarListaAvaliacoes(historico);
  } catch (e) {
    console.error('Erro ao salvar avaliação:', e);
    alert('Não foi possível salvar. Verifique o armazenamento do navegador.');
    return;
  }

  const resultado = document.getElementById('resultadoAvaliacao');

  if (resultado) {
    resultado.innerHTML = `
      <div style="background:#e8f5e9;padding:15px;border-radius:10px;margin-top:15px">
        <strong>Resultado estimado — ${data}</strong>
        <p>Soma das dobras: <strong>${somaArredondada} mm</strong></p>
        <p>Gordura corporal: <strong>${pct}%</strong></p>
        <p>Massa magra: <strong>${massaMagra} kg</strong></p>
        <p>Massa gorda: <strong>${massaGorda} kg</strong></p>
      </div>
    `;
  }

  renderizarAvaliacaoCorporal();
  alert('Avaliação corporal salva com sucesso!');
}

// Nome alternativo para botões que chamem esta função.
function calcularComposicaoCorporal() {
  salvarAvaliacaoCorporal();
}

function renderizarAvaliacaoCorporal() {
  const historico = obterAvaliacoesCorporais()
    .sort((a, b) => a.data.localeCompare(b.data));

  const lista =
    document.getElementById('historicoDobras') ||
    document.getElementById('historicoAvaliacaoCorporal');

  if (lista) {
    lista.innerHTML = [...historico].reverse().map(a => `
      <div class="item-historico"
           style="padding:12px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px">
        <strong>📊 ${a.data}</strong><br>
        Peso: ${a.peso.toFixed(1)} kg<br>
        Gordura corporal: ${a.pctGordura.toFixed(2)}%<br>
        Massa gorda: ${a.massaGordaKg.toFixed(2)} kg<br>
        Massa magra: ${a.massaMagraKg.toFixed(2)} kg
        <div style="text-align:right;margin-top:10px">
          <button type="button"
            onclick="apagarAvaliacaoCorporal('${a.data}')"
            style="background:#dc3545;color:white;border:0;padding:8px 12px;border-radius:6px;cursor:pointer">
            Excluir avaliação
          </button>
        </div>
      </div>
    `).join('') || '<p>Nenhuma avaliação registrada.</p>';
  }

  if (typeof Chart === 'undefined') return;

  const ordenadas = [...historico];
  const datas = ordenadas.map(a => a.data);

  const canvasMagra = document.getElementById('graficoMassaMagra');
  const canvasGordura = document.getElementById('graficoPercentualGordura');

  if (canvasMagra) {
    if (chartMassaMagra) chartMassaMagra.destroy();
    chartMassaMagra = null;

    if (ordenadas.length > 0) {
      chartMassaMagra = new Chart(canvasMagra, {
        type: 'line',
        data: {
          labels: datas,
          datasets: [{
            label: 'Massa magra (kg)',
            data: ordenadas.map(a => a.massaMagraKg),
            borderColor: '#007bff',
            tension: 0.25
          }]
        },
        options: { responsive: true }
      });
    }
  }

  if (canvasGordura) {
    if (chartGordura) chartGordura.destroy();
    chartGordura = null;

    if (ordenadas.length > 0) {
      chartGordura = new Chart(canvasGordura, {
        type: 'line',
        data: {
          labels: datas,
          datasets: [{
            label: 'Gordura corporal (%)',
            data: ordenadas.map(a => a.pctGordura),
            borderColor: '#dc3545',
            tension: 0.25
          }]
        },
        options: { responsive: true }
      });
    }
  }
}

function apagarAvaliacaoCorporal(data) {
  if (!confirm(
    `Deseja excluir a avaliação corporal de ${data}? Essa ação não poderá ser desfeita.`
  )) return;

  const atualizadas = obterAvaliacoesCorporais()
    .filter(a => a.data !== data);

  salvarListaAvaliacoes(atualizadas);

  const resultado = document.getElementById('resultadoAvaliacao');
  if (resultado) resultado.innerHTML = '';

  renderizarAvaliacaoCorporal();
  alert('Avaliação excluída.');
}

function gerarRelatorioCorporal() {
  const historico = obterAvaliacoesCorporais()
    .sort((a, b) => a.data.localeCompare(b.data));

  if (historico.length < 2) {
    alert('É necessário ter pelo menos duas avaliações para comparar.');
    return;
  }

  const primeira = historico[0];
  const ultima = historico[historico.length - 1];
  const formatar = n => `${n > 0 ? '+' : ''}${n.toFixed(1)}`;

  const relatorio = document.getElementById('relatorioCorporal');

  if (!relatorio) {
    alert('Não encontrei a área do relatório no HTML.');
    return;
  }

  relatorio.innerHTML = `
    <div style="background:#f8f9fa;padding:15px;border:1px solid #ddd;border-radius:10px;margin-top:15px">
      <h4>Relatório de evolução (${primeira.data} → ${ultima.data})</h4>
      <p>Variação de peso: <strong>${formatar(ultima.peso - primeira.peso)} kg</strong></p>
      <p>Variação de gordura: <strong>${formatar(ultima.pctGordura - primeira.pctGordura)} pontos percentuais</strong></p>
      <p>Variação de massa magra: <strong>${formatar(ultima.massaMagraKg - primeira.massaMagraKg)} kg</strong></p>
    </div>
  `;
}

function imprimirRelatorioCorporal() {
  const relatorio = document.getElementById("relatorioCorporal");

  if (!relatorio || !relatorio.innerHTML.trim()) {
    alert("Gere o relatório comparativo antes de imprimir.");
    return;
  }

  const janela = window.open("", "_blank");

  if (!janela) {
    alert("O navegador bloqueou a janela de impressão. Permita pop-ups para este site.");
    return;
  }

  const estilos = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  ).map(elemento => elemento.outerHTML).join("\n");

  janela.document.open();
  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Avaliação Corporal</title>
      ${estilos}
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #222;
          background: #fff;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>Relatório de Avaliação Corporal</h1>
      ${relatorio.innerHTML}
    </body>
    </html>
  `);
  janela.document.close();

  janela.onload = function () {
    janela.focus();
    janela.print();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarAvaliacaoCorporal();
});
