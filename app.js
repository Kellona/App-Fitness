<script>
    const META = 200;
    let historico = JSON.parse(localStorage.getItem('treinos')) || [];
    let contador = Number(localStorage.getItem('contador')) || 0;

    function atualizarTema() {
        const tema = Math.floor(contador / 30); 

        let gradient = "";
        let botaoTreino = "";
        let botaoSave = "";

        switch (tema) {
            case 0:
                gradient = "linear-gradient(135deg, #ffecd2, #fcb69f)";
                botaoTreino = "#ff6f61";
                botaoSave = "#3cb371";
                break;

            case 1:
                gradient = "linear-gradient(135deg, #ff9a9e, #8e44ad)";
                botaoTreino = "#e84393";
                botaoSave = "#6c5ce7";
                break;

            case 2:
                gradient = "linear-gradient(135deg, #74ebd5, #ACB6E5)";
                botaoTreino = "#0984e3";
                botaoSave = "#00cec9";
                break;

            case 3:
                gradient = "linear-gradient(135deg, #6a11cb, #2575fc)";
                botaoTreino = "#4b7bec";
                botaoSave = "#8e44ad";
                break;

            case 4:
                gradient = "linear-gradient(135deg, #f6d365, #fda085)";
                botaoTreino = "#f39c12";
                botaoSave = "#e67e22";
                break;

            case 5:
                gradient = "linear-gradient(135deg, #ff00cc, #333399)";
                botaoTreino = "#9b59b6";
                botaoSave = "#2980b9";
                break;

            default:
                gradient = "linear-gradient(135deg, #fff0b3, #ffd700)";
                botaoTreino = "#d4ac0d";
                botaoSave = "#f1c40f";
        }

        document.querySelector(".container").style.background = gradient;
        document.querySelector(".btn-add").style.background = botaoTreino;
        document.querySelector(".btn-save").style.background = botaoSave;
    }

    function atualizarTela() {
        document.getElementById('contador').textContent = contador;
        document.getElementById('diasRestantes').textContent = META - contador;
        document.getElementById('diasMeta').textContent = contador;

        let progresso = (contador / META) * 100;
        document.getElementById('progressFill').style.width = progresso + '%';

        atualizarMensagem(progresso);
        atualizarTema();
    }

    function atualizarMensagem(p) {
        let msg = document.getElementById('motivacional');

        if (p === 0) msg.textContent = 'Vamos começar! 💪🔥';
        else if (p < 10) msg.textContent = 'Cada passo conta! 🚀';
        else if (p < 25) msg.textContent = 'O ritmo tá gostoso! Continua! 😎';
        else if (p < 50) msg.textContent = 'Você tá voando! ✨';
        else if (p < 75) msg.textContent = 'Metade da jornada concluída! 🔥';
        else if (p < 100) msg.textContent = 'A linha de chegada tá logo ali! 🏁';
        else msg.textContent = 'META BATIDA! Você é incrível! 🏆🔥';
    }

    function adicionarTreino() {
        if (contador < META) {
            contador++;
            localStorage.setItem('contador', contador);
            atualizarTela();
        }
    }

    function salvarRegistro() {
        const hoje = new Date().toLocaleDateString('pt-BR');
        historico.push({ data: hoje, total: contador });
        localStorage.setItem('treinos', JSON.stringify(historico));
        alert('Registro salvo com sucesso! 🎉🔥');
    }

    function resetar() {
        contador = 0;
        localStorage.setItem('contador', contador);
        atualizarTela();
    }

    atualizarTela();
</script>