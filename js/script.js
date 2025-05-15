document.addEventListener('DOMContentLoaded', () => {
    const temperaturaAtualElement = document.getElementById('temperatura-atual');
    const eficienciaAtualElement = document.getElementById('eficiencia-atual');
    const ultimaAtualizacaoElement = document.getElementById('ultima-atualizacao');
    const mensagemElement = document.getElementById('mensagem');
    const atualizarIntervalo = 30000;
    const atualizarHistoricoIntervalo = 60000; 

    async function atualizarDadosAtuais() {
        try {
            const response = await fetch('backend/atualizar_dados.php');
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const data = await response.json();
            if (data.sucesso) {
                temperaturaAtualElement.textContent = `${data.temperatura_atual} °C`;
                eficienciaAtualElement.textContent = `${data.eficiencia_atual} %`;
                ultimaAtualizacaoElement.textContent = data.ultima_atualizacao;
                exibirMensagem('', 'sucesso'); 
            } else {
                exibirMensagem(`Erro ao atualizar dados: ${data.erro}`);
            }
        } catch (error) {
            exibirMensagem(`Erro de conexão ao servidor ao atualizar dados: ${error.message}`);
        }
    }

    async function buscarExibirHistorico() {
        try {
            const response = await fetch('backend/buscar_historico.php');
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            const data = await response.json();
            if (data.sucesso && Array.isArray(data.historico)) {
                // Atualizar a tabela
                const historicoTabelaCorpo = document.getElementById('historico-tabela-corpo');
                historicoTabelaCorpo.innerHTML = '';
                data.historico.forEach(item => {
                    const row = document.createElement('div');
                    row.classList.add('tr');
                    const dataHoraCell = document.createElement('div');
                    dataHoraCell.classList.add('td');
                    dataHoraCell.textContent = item.dataehora;
                    const temperaturaCell = document.createElement('div');
                    temperaturaCell.classList.add('td');
                    temperaturaCell.textContent = `${item.temperatura} °C`;
                    const eficienciaCell = document.createElement('div');
                    eficienciaCell.classList.add('td');
                    eficienciaCell.textContent = `${item.eficiencia} %`;
                    row.appendChild(dataHoraCell);
                    row.appendChild(temperaturaCell);
                    row.appendChild(eficienciaCell);
                    historicoTabelaCorpo.appendChild(row);
                });

                const labels = data.historico.map(item => item.dataehora);
                const temperaturas = data.historico.map(item => parseFloat(item.temperatura));
                const eficiencias = data.historico.map(item => parseFloat(item.eficiencia));

                const ctx = document.getElementById('historicoChart').getContext('2d');
                const historicoChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Temperatura (°C)',
                            data: temperaturas,
                            borderColor: 'rgb(255, 99, 132)',
                            tension: 0.1
                        }, {
                            label: 'Eficiência (%)',
                            data: eficiencias,
                            borderColor: 'rgb(54, 162, 235)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

            } else {
                exibirMensagem(`Erro ao carregar histórico: ${data.erro || 'Resposta inválida'}`);
                if (!data.historico) {
                    console.error('Estrutura do histórico inválida:', data);
                }
            }
        } catch (error) {
            exibirMensagem(`Erro de conexão ao servidor ao carregar histórico: ${error.message}`);
        }
    }

    function exibirMensagem(mensagem, tipo = 'erro') {
        if (mensagemElement) {
            mensagemElement.textContent = mensagem;
            mensagemElement.className = tipo;
        }
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    }

    atualizarDadosAtuais();
    buscarExibirHistorico();

    setInterval(atualizarDadosAtuais, atualizarIntervalo);
    setInterval(buscarExibirHistorico, atualizarHistoricoIntervalo); 
});