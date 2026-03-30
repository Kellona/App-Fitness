const META = 200;
let contador = 0;

function trocarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
}

// Atualiza tudo
function atualizarTela() {
    document.getElementById("contador").textContent = contador;
    document.getElementById("diasRestantes").textContent = META - contador;
    document.getElementById("diasMeta").textContent = contador;

    let progresso = (contador / META) * 100;
    document.getElementById("progressFill").style.width = progresso + "%";

    atualizarMensagem(progresso);
}

// Mensagens motivacionais
function atualizarMensagem(p) {
    const msg = document.getElementById("motivacional");
    if (p === 0) msg.textContent = "Vamos começar! 💪🔥";
    else if (p < 10) msg.textContent = "Cada passo conta! 🚀";
    else if (p < 25) msg.textContent = "Tá fluindo demais! 😎";
    else if (p < 50) msg.textContent = "Você tá voando! ✨";
    else if (p < 75) msg.textContent = "Metade já foi! 🔥";
    else if (p < 100) msg.textContent = "Falta pouquinho! 🏁";
    else msg.textContent = "META CONCLUÍDA! 🏆🔥";
}

// Botão adicionar treino
function adicionarTreino() {
    if (contador < META) {
        contador++;
        atualizarTela();
    }
}

// SALVAR REGISTRO NO BANCO
function salvarRegistro() {
    const hoje = new Date().toLocaleDateString("pt-BR");

    const tx = db.transaction("historico", "readwrite");
    tx.objectStore("historico").add({ data: hoje, total: contador });

    tx.oncomplete = () => carregarHistorico();

    alert("Treino salvo com sucesso! 🎉🔥");
}

// CARREGAR HISTÓRICO
function carregarHistorico() {
    const lista = document.getElementById("listaHistorico");
    lista.innerHTML = "";

    const tx = db.transaction("historico", "readonly");
    tx.objectStore("historico").getAll().onsuccess = function (e) {
        e.target.result.forEach(item => {
            lista.innerHTML += `<li>📅 ${item.data} — 🔥 ${item.total} treinos</li>`;
        });
    };
}

// SALVAR NOTA
function salvarNota() {
    const texto = document.getElementById("campoNota").value;
    if (texto.trim() === "") return;

    const tx = db.transaction("notas", "readwrite");
    tx.objectStore("notas").add({ texto });

    tx.oncomplete = () => carregarNotas();

    document.getElementById("campoNota").value = "";
}

// CARREGAR NOTAS
function carregarNotas() {
    const lista = document.getElementById("listaNotas");
    lista.innerHTML = "";

    const tx = db.transaction("notas", "readonly");
    tx.objectStore("notas").getAll().onsuccess = function (e) {
        e.target.result.forEach(item => {
            lista.innerHTML += `<li>📝 ${item.texto}</li>`;
        });
    };
}

// Resetar tudo
function resetar() {
    contador = 0;
    atualizarTela();
}

atualizarTela();