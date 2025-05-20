document.addEventListener('DOMContentLoaded', () => {
    const temperaturaAtualElement = document.getElementById('temperatura-atual');
    const eficienciaAtualElement = document.getElementById('eficiencia-atual');
    const ultimaAtualizacaoElement = document.getElementById('ultima-atualizacao');
    const mensagemElement = document.getElementById('mensagem');
    const historicoTabelaCorpo = document.getElementById('historico-tabela-corpo');
    const historicoChartCanvas = document.getElementById('historicoChart');

    const ATUALIZAR_DADOS_INTERVALO = 30 * 1000;
    const ATUALIZAR_HISTORICO_INTERVALO = 30 * 1000;

    let historicoChartInstance = null;

    /**
     * @param {string} mensagem 
     * @param {string} tipo 
     */
    function exibirMensagem(mensagem, tipo = 'erro') {
        if (mensagemElement) {
            mensagemElement.textContent = mensagem;
            mensagemElement.className = '';
            mensagemElement.classList.add(tipo);
        }
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    }

    /** 
     * @param {string} dataHoraString 
     * @returns {string}
     */
    function formatarDataHora(dataHoraString) {
        if (!dataHoraString) return '';
        try {
            const [data, hora] = dataHoraString.split(' ');
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano} ${hora}`;
        } catch (e) {
            console.error('Erro ao formatar data e hora:', e);
            return dataHoraString;
        }
    }


    async function atualizarDadosAtuais() {
        try {
            const response = await fetch('backend/atualizar_dados.php');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ erro: 'Erro desconhecido.' }));
                throw new Error(`Erro na requisição (${response.status}): ${errorData.erro || 'Não foi possível obter detalhes do erro.'}`);
            }

            const data = await response.json();

            if (data.sucesso) {
                temperaturaAtualElement.textContent = `${data.temperatura_atual}`;
                eficienciaAtualElement.textContent = `${data.eficiencia_atual}`;
                ultimaAtualizacaoElement.textContent = `Última atualização: ${formatarDataHora(data.ultima_atualizacao)}`;
                exibirMensagem('', 'sucesso');
            } else {
                exibirMensagem(`Erro ao atualizar dados: ${data.erro || 'Resposta de sucesso falsa.'}`);
            }
        } catch (error) {
            console.error('Erro ao buscar dados atuais:', error);
            exibirMensagem(`Erro de conexão ao servidor ou dados inválidos: ${error.message}`);
        }
    }

    async function buscarExibirHistorico() {
        try {
            const response = await fetch('backend/buscar_historico.php');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ erro: 'Erro desconhecido.' }));
                throw new Error(`Erro na requisição (${response.status}): ${errorData.erro || 'Não foi possível obter detalhes do erro.'}`);
            }

            const data = await response.json();

            if (data.sucesso && Array.isArray(data.historico)) {
                historicoTabelaCorpo.innerHTML = '';
                if (data.historico.length === 0) {
                    historicoTabelaCorpo.innerHTML = '<tr><td colspan="3">Nenhum registro de histórico encontrado.</td></tr>';
                } else {
                    data.historico.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${formatarDataHora(item.dataehora)}</td>
                            <td>${parseFloat(item.temperatura).toFixed(2)} °C</td>
                            <td>${parseFloat(item.eficiencia).toFixed(2)} %</td>
                        `;
                        historicoTabelaCorpo.appendChild(row);
                    });
                }

                const labels = data.historico.map(item => formatarDataHora(item.dataehora));
                const temperaturas = data.historico.map(item => parseFloat(item.temperatura));
                const eficiencias = data.historico.map(item => parseFloat(item.eficiencia));

                if (historicoChartInstance) {
                    historicoChartInstance.destroy();
                }

                historicoChartInstance = new Chart(historicoChartCanvas, {
                    type: 'line',
                    data: {
                        labels: labels.reverse(),
                        datasets: [{
                            label: 'Temperatura (°C)',
                            data: temperaturas.reverse(),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.3,
                            fill: false
                        }, {
                            label: 'Eficiência (%)',
                            data: eficiencias.reverse(),
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.3,
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        color: '#FFFFFF',
                        plugins: {
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                titleColor: '#FFFFFF',
                                bodyColor: '#FFFFFF',
                                footerColor: '#FFFFFF',
                            },
                            legend: {
                                labels: {
                                    color: '#FFFFFF'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Histórico de Temperatura e Eficiência',
                                color: '#FFFFFF'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Data e Hora',
                                    color: '#FFFFFF'
                                },
                                ticks: {
                                    color: '#FFFFFF'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }
                            },
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: 'Valor',
                                    color: '#FFFFFF'
                                },
                                ticks: {
                                    color: '#FFFFFF'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }
                            }
                        }
                    }
                });

                exibirMensagem('', 'sucesso');
            } else {
                exibirMensagem(`Erro ao carregar histórico: ${data.erro || 'Resposta de sucesso falsa ou histórico ausente.'}`);
                if (!data.historico) {
                    console.error('Estrutura do histórico inválida ou vazia:', data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            exibirMensagem(`Erro de conexão ao servidor ou dados inválidos ao carregar histórico: ${error.message}`);
        }
    }

    atualizarDadosAtuais();
    buscarExibirHistorico();


    setInterval(atualizarDadosAtuais, ATUALIZAR_DADOS_INTERVALO);
    setInterval(buscarExibirHistorico, ATUALIZAR_HISTORICO_INTERVALO);
});