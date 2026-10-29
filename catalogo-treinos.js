
/* =====================================================
   PAINEL FITNESS — CATÁLOGO DE TREINOS v1
   Armazenamento isolado: não altera os registros antigos.
   ===================================================== */

(() => {
  "use strict";

  const CHAVE = "fitness_catalogo_treinos_v1";

  const PROGRAMAS = [
    {
      id: "full-body-3",
      nome: "Corpo todo — 3 dias",
      objetivo: "Condicionamento e força geral",
      nivel: "Iniciante",
      exercicios: [
        "Leg press — 2 séries de 10–12 repetições",
        "Puxada na frente — 2 séries de 10–12",
        "Supino na máquina — 2 séries de 10–12",
        "Elevação pélvica — 2 séries de 10–12",
        "Pallof press — 2 séries por lado"
      ]
    },
    {
      id: "superior-inferior",
      nome: "Superior e inferior",
      objetivo: "Organizar o treino por grupos musculares",
      nivel: "Intermediário",
      exercicios: [
        "Dia A — membros inferiores",
        "Dia B — costas, peito e braços",
        "Dia C — membros inferiores",
        "Dia D — peito, costas e ombros"
      ]
    },
    {
      id: "mobilidade",
      nome: "Mobilidade e recuperação",
      objetivo: "Movimentação leve e recuperação",
      nivel: "Leve",
      exercicios: [
        "Caminhada ou bicicleta confortável",
        "Mobilidade suave de quadril",
        "Movimentos leves dentro da amplitude confortável",
        "Respiração lenta e relaxamento"
      ]
    }
  ];

  function lerEstado() {
    try {
      const estado = JSON.parse(
        localStorage.getItem(CHAVE) || "{}"
      );

      return {
        personalizados: Array.isArray(estado.personalizados)
          ? estado.personalizados
          : [],
        ativoId: typeof estado.ativoId === "string"
          ? estado.ativoId
          : ""
      };
    } catch (erro) {
      console.error("Erro ao ler catálogo:", erro);
      return { personalizados: [], ativoId: "" };
    }
  }

  function salvarEstado(estado) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      return true;
    } catch (erro) {
      console.error("Erro ao salvar catálogo:", erro);
      alert("Não foi possível salvar. Verifique o espaço disponível.");
      return false;
    }
  }

  function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caractere]);
  }

  function todosOsProgramas(estado) {
    return [
      ...PROGRAMAS,
      ...estado.personalizados
    ];
  }

  function iniciar() {
    const aba = document.getElementById("abaTreinos");
    if (!aba || document.getElementById("catalogoTreinos")) return;

    const painel = document.createElement("section");
    painel.id = "catalogoTreinos";
    painel.className = "catalogo-treinos";

    painel.innerHTML = `
      <div class="catalogo-cabecalho">
        <p class="catalogo-etiqueta">SUA ROTINA, SUAS ESCOLHAS</p>
        <h2>📚 Catálogo de treinos</h2>
        <p>Explore um programa ou monte sua própria rotina.</p>
      </div>

      <label for="programaPronto">Programas disponíveis</label>
      <select id="programaPronto"></select>

      <div id="detalhesPrograma" class="catalogo-detalhes"></div>

      <button type="button" id="usarPrograma" class="catalogo-botao">
        Usar este programa
      </button>

      <hr>

      <h3>✍️ Montar treino personalizado</h3>

      <label for="nomePersonalizado">Nome do treino</label>
      <input id="nomePersonalizado"
        type="text" maxlength="80"
        placeholder="Ex.: Treino A — membros superiores">

      <label for="objetivoPersonalizado">Objetivo</label>
      <input id="objetivoPersonalizado"
        type="text" maxlength="120"
        placeholder="Ex.: força e condicionamento">

      <label for="exerciciosPersonalizados">
        Exercícios (um por linha)
      </label>
      <textarea id="exerciciosPersonalizados"
        rows="6" maxlength="5000"
        placeholder="Puxada na frente — 3 × 10&#10;Remada baixa — 3 × 12"></textarea>

      <button type="button" id="salvarPersonalizado"
        class="catalogo-botao secundario">
        Salvar treino personalizado
      </button>

      <div class="catalogo-detalhes">
        <h3>⭐ Meu treino ativo</h3>
        <div id="treinoAtivo"></div>
      </div>

      <div class="catalogo-detalhes">
        <h3>Meus treinos personalizados</h3>
        <div id="meusProgramas"></div>
      </div>

      <p id="mensagemCatalogo" role="status"
        class="catalogo-mensagem"></p>
    `;

    // Acrescenta o catálogo sem apagar o conteúdo existente.
    aba.prepend(painel);

    const seletor = painel.querySelector("#programaPronto");
    const detalhes = painel.querySelector("#detalhesPrograma");
    const meusProgramas = painel.querySelector("#meusProgramas");
    const treinoAtivo = painel.querySelector("#treinoAtivo");
    const mensagem = painel.querySelector("#mensagemCatalogo");

    function avisar(texto) {
      mensagem.textContent = texto;
    }

    function renderizarOpcoes() {
      const estado = lerEstado();
      const programas = todosOsProgramas(estado);
      const anterior = seletor.value;

      seletor.innerHTML = programas.map(programa => `
        <option value="${escapar(programa.id)}">
          ${escapar(programa.nome)}
        </option>
      `).join("");

      if (programas.some(programa => programa.id === anterior)) {
        seletor.value = anterior;
      }

      renderizarDetalhes();
      renderizarMeusProgramas();
      renderizarAtivo();
    }

    function renderizarDetalhes() {
      const estado = lerEstado();
      const programa = todosOsProgramas(estado).find(
        item => item.id === seletor.value
      );

      if (!programa) {
        detalhes.textContent = "Selecione um programa.";
        return;
      }

      detalhes.innerHTML = `
        <strong>${escapar(programa.nome)}</strong>
        <p>${escapar(programa.objetivo || "")}</p>
        <ul>
          ${programa.exercicios.map(exercicio =>
            `<li>${escapar(exercicio)}</li>`
          ).join("")}
        </ul>
        <small>Nível: ${escapar(programa.nivel || "Personalizado")}</small>
      `;
    }

    function renderizarMeusProgramas() {
      const estado = lerEstado();

      if (!estado.personalizados.length) {
        meusProgramas.textContent =
          "Seus treinos personalizados aparecerão aqui.";
        return;
      }

      meusProgramas.innerHTML = estado.personalizados.map(programa => `
        <div class="catalogo-item">
          <strong>${escapar(programa.nome)}</strong>
          <p>${escapar(programa.objetivo || "")}</p>
          <button type="button"
            data-ativar="${escapar(programa.id)}">
            Ativar
          </button>
          <button type="button"
            data-excluir="${escapar(programa.id)}">
            Excluir
          </button>
        </div>
      `).join("");
    }

    function renderizarAtivo() {
      const estado = lerEstado();
      const programa = todosOsProgramas(estado).find(
        item => item.id === estado.ativoId
      );

      if (!programa) {
        treinoAtivo.textContent =
          "Você ainda não selecionou um treino ativo.";
        return;
      }

      treinoAtivo.innerHTML = `
        <strong>${escapar(programa.nome)}</strong>
        <ul>
          ${programa.exercicios.map(exercicio =>
            `<li>${escapar(exercicio)}</li>`
          ).join("")}
        </ul>
      `;
    }

    function ativarPrograma(programa) {
      const estado = lerEstado();
      estado.ativoId = programa.id;

      if (salvarEstado(estado)) {
        renderizarOpcoes();
        avisar("Treino ativo selecionado!");
      }
    }

    seletor.addEventListener("change", renderizarDetalhes);

    painel.querySelector("#usarPrograma").addEventListener("click", () => {
      const programa = todosOsProgramas(lerEstado()).find(
        item => item.id === seletor.value
      );

      if (programa) ativarPrograma(programa);
    });

    painel.querySelector("#salvarPersonalizado").addEventListener(
      "click", () => {
        const nome = painel.querySelector("#nomePersonalizado")
          .value.trim();
        const objetivo = painel.querySelector("#objetivoPersonalizado")
          .value.trim();
        const textoExercicios = painel.querySelector(
          "#exerciciosPersonalizados"
        ).value.trim();

       const exercicios = textoExercicios
         .split(/\r?\n/)
         .map(item => item.trim())
         .filter(Boolean);

        if (!nome || exercicios.length === 0) {
          avisar("Informe o nome e pelo menos um exercício.");
          return;
        }

        const estado = lerEstado();

        const programa = {
          id: "personalizado-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 8),
          nome,
          objetivo,
          nivel: "Personalizado",
          exercicios
        };

        estado.personalizados.push(programa);

        if (!salvarEstado(estado)) return;

        painel.querySelector("#nomePersonalizado").value = "";
        painel.querySelector("#objetivoPersonalizado").value = "";
        painel.querySelector("#exerciciosPersonalizados").value = "";

        renderizarOpcoes();
        seletor.value = programa.id;
        renderizarDetalhes();
        ativarPrograma(programa);
        avisar("Treino personalizado salvo!");
    
    });

    painel.addEventListener("click", evento => {
      const botaoAtivar = evento.target.closest("[data-ativar]");
      const botaoExcluir = evento.target.closest("[data-excluir]");

      if (botaoAtivar) {
        const programa = lerEstado().personalizados.find(
          item => item.id === botaoAtivar.dataset.ativar
        );
        if (programa) ativarPrograma(programa);
      }

      if (botaoExcluir) {
        const id = botaoExcluir.dataset.excluir;
        const estado = lerEstado();

        if (!confirm("Excluir este treino personalizado?")) return;

        estado.personalizados = estado.personalizados.filter(
          item => item.id !== id
        );

        if (estado.ativoId === id) estado.ativoId = "";

        if (salvarEstado(estado)) {
          renderizarOpcoes();
          avisar("Treino personalizado excluído.");
        }
      }
    });

    renderizarOpcoes();
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();


