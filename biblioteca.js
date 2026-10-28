
/* Painel Fitness — Biblioteca de Treinos v1
   Módulo independente. Não altera os históricos existentes. */

(function () {
  "use strict";

  const CHAVE_TREINO_ATIVO = "fitness_treino_ativo_biblioteca_v1";

  const programas = [
    {
      id: "iniciante-fullbody-3",
      nome: "Corpo Todo — Primeiros Passos",
      nivel: "Iniciante",
      objetivo: "Condicionamento",
      dias: 3,
      perfil: "Todos",
      descricao: "Programa de adaptação para aprender os movimentos e construir consistência.",
      semana: [
        ["Leg press 2×12", "Supino máquina 2×12", "Puxada na frente 2×12", "Elevação pélvica 2×12", "Caminhada leve 10 min"],
        ["Cadeira flexora 2×12", "Remada sentada 2×12", "Desenvolvimento máquina 2×12", "Abdutora 2×15", "Bicicleta leve 10 min"],
        ["Leg press 2×12", "Supino máquina 2×12", "Puxada na frente 2×12", "Elevação pélvica 2×12", "Pallof press 2×10 por lado"]
      ]
    },
    {
      id: "iniciante-emagrecimento-3",
      nome: "Movimento e Emagrecimento",
      nivel: "Iniciante",
      objetivo: "Emagrecimento",
      dias: 3,
      perfil: "Todos",
      descricao: "Musculação geral combinada com aeróbico progressivo e confortável.",
      semana: [
        ["Leg press 2×12", "Supino máquina 2×12", "Remada sentada 2×12", "Cadeira flexora 2×12", "Caminhada 10–15 min"],
        ["Puxada na frente 2×12", "Cadeira extensora 2×12", "Elevação pélvica 2×12", "Elevação lateral 2×12", "Bicicleta 10–15 min"],
        ["Leg press 2×12", "Supino máquina 2×12", "Remada sentada 2×12", "Abdutora 2×15", "Caminhada 10–15 min"]
      ]
    },
    {
      id: "intermediario-superior-inferior-4",
      nome: "Divisão Superior e Inferior",
      nivel: "Intermediário",
      objetivo: "Hipertrofia",
      dias: 4,
      perfil: "Todos",
      descricao: "Alternância entre membros superiores e inferiores para distribuir o volume semanal.",
      semana: [
        ["Leg press 3×10–12", "Cadeira extensora 3×12", "Cadeira flexora 3×12", "Panturrilha 3×15"],
        ["Supino máquina 3×10", "Puxada na frente 3×10–12", "Remada sentada 3×10–12", "Rosca direta 2×12", "Tríceps corda 2×12"],
        ["Elevação pélvica 3×10–12", "Terra romeno com halteres 3×10", "Abdutora 3×15", "Coice na polia 2×12 por perna"],
        ["Supino inclinado máquina 3×10", "Remada com apoio 3×10", "Desenvolvimento máquina 2×12", "Elevação lateral 2×15", "Pallof press 2×10 por lado"]
      ]
    },
    {
      id: "intermediario-gluteos-4",
      nome: "Ênfase em Glúteos",
      nivel: "Intermediário",
      objetivo: "Hipertrofia",
      dias: 4,
      perfil: "Todos",
      descricao: "Programa com dois estímulos semanais para glúteos e trabalho equilibrado do corpo.",
      semana: [
        ["Elevação pélvica 3×10–12", "Leg press 3×10", "Abdutora 3×15–20", "Coice na polia 3×12 por perna"],
        ["Puxada na frente 3×10–12", "Supino máquina 3×10–12", "Remada sentada 3×10–12", "Elevação lateral 2×15"],
        ["Cadeira flexora 3×12", "Terra romeno com halteres 3×10", "Elevação pélvica 3×10", "Abdutora 2×15"],
        ["Leg press 2×12", "Supino máquina 2×12", "Remada sentada 2×12", "Coice na polia 2×15 por perna", "Pallof press 2×10 por lado"]
      ]
    },
    {
      id: "intermediario-condicionamento-3",
      nome: "Força e Condicionamento",
      nivel: "Intermediário",
      objetivo: "Condicionamento",
      dias: 3,
      perfil: "Todos",
      descricao: "Sessões de corpo inteiro com aeróbico adaptável ao condicionamento individual.",
      semana: [
        ["Leg press 3×10", "Supino máquina 3×10", "Puxada na frente 3×10", "Caminhada 10–15 min"],
        ["Cadeira flexora 3×12", "Remada sentada 3×10", "Elevação pélvica 3×12", "Bicicleta 10–15 min"],
        ["Leg press 2×12", "Supino máquina 2×12", "Puxada na frente 2×12", "Pallof press 2×10 por lado", "Aeróbico leve 15 min"]
      ]
    },
    {
      id: "avancado-hipertrofia-5",
      nome: "Hipertrofia — Divisão de 5 Dias",
      nivel: "Avançado",
      objetivo: "Hipertrofia",
      dias: 5,
      perfil: "Todos",
      descricao: "Maior variedade e volume semanal. Requer experiência e recuperação adequadas.",
      semana: [
        ["Leg press 4×8–12", "Cadeira extensora 3×10–15", "Panturrilha 4×12–20"],
        ["Supino máquina 4×8–12", "Supino inclinado 3×10", "Tríceps corda 3×12"],
        ["Terra romeno 3×8–10", "Cadeira flexora 4×10–12", "Elevação pélvica 4×8–12", "Coice na polia 3×12 por perna"],
        ["Puxada na frente 4×8–12", "Remada sentada 4×10", "Rosca direta 3×10–12"],
        ["Leg press 3×10", "Abdutora 3×15–20", "Elevação pélvica 3×10", "Desenvolvimento máquina 3×10", "Elevação lateral 3×15"]
      ]
    },
    {
      id: "iniciante-forca-3",
      nome: "Fundamentos de Força",
      nivel: "Iniciante",
      objetivo: "Força",
      dias: 3,
      perfil: "Todos",
      descricao: "Aprendizagem de movimentos básicos com cargas controladas e técnica prioritária.",
      semana: [
        ["Leg press 3×10", "Supino máquina 3×10", "Remada sentada 3×10"],
        ["Cadeira flexora 3×12", "Puxada na frente 3×10", "Elevação pélvica 3×12"],
        ["Leg press 3×10", "Supino máquina 3×10", "Puxada na frente 3×10", "Pallof press 2×10 por lado"]
      ]
    },
    {
      id: "intermediario-forca-4",
      nome: "Força — 4 Dias",
      nivel: "Intermediário",
      objetivo: "Força",
      dias: 4,
      perfil: "Todos",
      descricao: "Treino dividido com progressão gradual e atenção à técnica.",
      semana: [
        ["Leg press 3×8–10", "Cadeira flexora 3×10", "Panturrilha 3×15"],
        ["Supino máquina 3×8–10", "Remada sentada 3×8–10", "Rosca direta 2×10", "Tríceps corda 2×10"],
        ["Elevação pélvica 3×8–10", "Terra romeno com halteres 3×8–10", "Abdutora 2×15"],
        ["Puxada na frente 3×8–10", "Supino inclinado máquina 3×10", "Desenvolvimento máquina 2×10", "Pallof press 2×10 por lado"]
      ]
    }
  ];

  function criarElemento(tag, texto, classe) {
    const elemento = document.createElement(tag);
    if (texto !== undefined) elemento.textContent = texto;
    if (classe) elemento.className = classe;
    return elemento;
  }

  function iniciarBiblioteca() {
    const area = document.getElementById("bibliotecaTreinos");
    if (!area || area.dataset.iniciada === "sim") return;
    area.dataset.iniciada = "sim";

    const filtros = criarElemento("div", undefined, "biblioteca-filtros");
    const nivel = criarElemento("select");
    const objetivo = criarElemento("select");
    const dias = criarElemento("select");

    function adicionarOpcao(select, valor, rotulo) {
      const opcao = criarElemento("option", rotulo);
      opcao.value = valor;
      select.appendChild(opcao);
    }

    adicionarOpcao(nivel, "Todos", "Todos os níveis");
    ["Iniciante", "Intermediário", "Avançado"].forEach(v => adicionarOpcao(nivel, v, v));

    adicionarOpcao(objetivo, "Todos", "Todos os objetivos");
    ["Emagrecimento", "Hipertrofia", "Força", "Condicionamento"].forEach(
      v => adicionarOpcao(objetivo, v, v)
    );

    adicionarOpcao(dias, "Todos", "Qualquer duração");
    [3, 4, 5].forEach(v => adicionarOpcao(dias, String(v), `${v} dias por semana`));

    [nivel, objetivo, dias].forEach(select => {
      select.style.cssText = "padding:10px;border:1px solid #ccd3df;border-radius:8px;max-width:100%;";
      filtros.appendChild(select);
      select.addEventListener("change", renderizar);
    });

    const lista = criarElemento("div", undefined, "biblioteca-lista");
    lista.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:16px;";

    const aviso = criarElemento("p");
    aviso.setAttribute("role", "status");

    area.replaceChildren();
    area.append(
      criarElemento("h2", "Biblioteca de Treinos"),
      criarElemento("p", "Explore os programas e escolha o que combina com seus objetivos."),
      filtros,
      aviso,
      lista
    );

    function renderizar() {
      lista.replaceChildren();

      const encontrados = programas.filter(p =>
        (nivel.value === "Todos" || p.nivel === nivel.value) &&
        (objetivo.value === "Todos" || p.objetivo === objetivo.value) &&
        (dias.value === "Todos" || String(p.dias) === dias.value)
      );

      aviso.textContent = encontrados.length
        ? `${encontrados.length} programa(s) encontrado(s).`
        : "Nenhum programa corresponde a esses filtros.";

      encontrados.forEach(programa => {
        const cartao = criarElemento("article");
        cartao.style.cssText = "border:1px solid #d8deea;border-radius:12px;padding:16px;background:#fff;color:#202633;";

        cartao.append(
          criarElemento("h3", programa.nome),
          criarElemento("p", `Nível: ${programa.nivel}`),
          criarElemento("p", `Objetivo: ${programa.objetivo}`),
          criarElemento("p", `${programa.dias} dias por semana`),
          criarElemento("p", programa.descricao)
        );

        const detalhes = criarElemento("details");
        detalhes.appendChild(criarElemento("summary", "Ver exercícios"));

        programa.semana.forEach((exercicios, indice) => {
          detalhes.appendChild(criarElemento("h4", `Treino ${indice + 1}`));
          const ul = criarElemento("ul");
          exercicios.forEach(exercicio => ul.appendChild(criarElemento("li", exercicio)));
          detalhes.appendChild(ul);
        });

        cartao.appendChild(detalhes);

        const selecionar = criarElemento("button", "Selecionar programa");
        selecionar.type = "button";
        selecionar.style.cssText = "margin-top:12px;padding:10px 14px;border:0;border-radius:8px;background:#176b45;color:white;cursor:pointer;";

        selecionar.addEventListener("click", () => {
          const selecao = {
            versao: 1,
            programaId: programa.id,
            nome: programa.nome,
            nivel: programa.nivel,
            objetivo: programa.objetivo,
            dias: programa.dias,
            semana: programa.semana,
            selecionadoEm: new Date().toISOString()
          };

          try {
            localStorage.setItem(CHAVE_TREINO_ATIVO, JSON.stringify(selecao));
            aviso.textContent = `Programa "${programa.nome}" selecionado. A integração com o treino diário será feita na próxima etapa.`;
          } catch (erro) {
            aviso.textContent = "Não foi possível salvar a seleção neste navegador.";
          }
        });

        cartao.appendChild(selecionar);
        lista.appendChild(cartao);
      });
    }

    renderizar();
  }

  window.abrirBibliotecaTreinos = function () {
    const area = document.getElementById("bibliotecaTreinos");
    if (!area) return;

    iniciarBiblioteca();
    area.style.display = area.style.display === "none" ? "block" : "none";
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarBiblioteca);
  } else {
    iniciarBiblioteca();
  }
})();
