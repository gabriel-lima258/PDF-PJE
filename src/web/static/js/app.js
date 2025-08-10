// JavaScript para a interface web do Scraper PJE

class ScraperPJEApp {
    constructor() {
        this.currentConsultaId = null;
        this.statusInterval = null;
        this.logsInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistorico();
        this.log('Aplicação iniciada', 'info');
    }

    bindEvents() {
        // Validação de CPF
        document.getElementById('validarBtn').addEventListener('click', () => this.validarCPF());
        
        // Formulário de consulta
        document.getElementById('consultaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.iniciarConsulta();
        });
        
        // Limpar log
        document.getElementById('limparLogBtn').addEventListener('click', () => this.limparLog());
        
        // Atualizar logs
        document.getElementById('atualizarLogsBtn').addEventListener('click', () => this.atualizarLogs());
        
        // Limpar histórico
        document.getElementById('limparHistoricoBtn').addEventListener('click', () => this.limparHistorico());
        
        // Formatação automática do CPF
        document.getElementById('cpf').addEventListener('input', (e) => this.formatarCPF(e.target));
    }

    formatarCPF(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
        }
        
        input.value = value;
    }

    async validarCPF() {
        const cpf = document.getElementById('cpf').value.trim();
        
        if (!cpf) {
            this.showAlert('Por favor, digite um CPF.', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/validar-cpf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cpf: cpf })
            });

            const data = await response.json();
            
            if (data.valido) {
                document.getElementById('cpf').value = data.cpf_formatado;
                document.getElementById('iniciarBtn').disabled = false;
                this.showAlert(data.mensagem, 'success');
                this.log(`CPF validado: ${data.cpf_formatado}`, 'success');
            } else {
                document.getElementById('iniciarBtn').disabled = true;
                this.showAlert(data.mensagem, 'error');
                this.log(`CPF inválido: ${cpf}`, 'error');
            }
        } catch (error) {
            this.showAlert('Erro ao validar CPF. Tente novamente.', 'error');
            this.log(`Erro na validação: ${error.message}`, 'error');
        }
    }

    async iniciarConsulta() {
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        
        if (!nome) {
            this.showAlert('Por favor, digite o nome da pessoa.', 'warning');
            return;
        }
        
        if (!cpf) {
            this.showAlert('Por favor, digite um CPF válido.', 'warning');
            return;
        }

        if (!confirm(`Deseja iniciar a consulta para:\nNome: ${nome}\nCPF: ${cpf}\n\nEsta operação pode levar alguns minutos.`)) {
            return;
        }

        try {
            this.log(`Iniciando consulta para: ${nome} (CPF: ${cpf})`, 'info');
            
            const response = await fetch('/api/iniciar-consulta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: nome, cpf: cpf })
            });

            const data = await response.json();
            
            if (data.sucesso) {
                this.currentConsultaId = data.consulta_id;
                this.showStatusConsulta();
                this.monitorarStatus();
                this.monitorarLogs();
                this.showAlert(data.mensagem, 'success');
                this.log(`Consulta iniciada com ID: ${data.consulta_id}`, 'success');
            } else {
                this.showAlert(data.mensagem, 'error');
                this.log(`Erro ao iniciar consulta: ${data.mensagem}`, 'error');
            }
        } catch (error) {
            this.showAlert('Erro ao iniciar consulta. Tente novamente.', 'error');
            this.log(`Erro na consulta: ${error.message}`, 'error');
        }
    }

    showStatusConsulta() {
        document.getElementById('statusConsulta').style.display = 'block';
        document.getElementById('iniciarBtn').disabled = true;
        document.getElementById('iniciarBtn').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Consulta em Andamento...';
    }

    hideStatusConsulta() {
        document.getElementById('statusConsulta').style.display = 'none';
        document.getElementById('iniciarBtn').disabled = false;
        document.getElementById('iniciarBtn').innerHTML = '<i class="fas fa-rocket me-2"></i>Iniciar Consulta com Organização';
    }

    async monitorarStatus() {
        if (!this.currentConsultaId) return;
        
        this.statusInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/status-consulta/${this.currentConsultaId}`);
                const data = await response.json();
                
                if (data.status === 'completed' || data.status === 'error') {
                    this.stopMonitoring();
                    this.hideStatusConsulta();
                    
                    if (data.status === 'completed') {
                        this.showResultado(data);
                        this.log(`Consulta concluída: ${data.downloads_concluidos} downloads realizados`, 'success');
                    } else {
                        this.log(`Consulta falhou: ${data.progress}`, 'error');
                    }
                } else {
                    document.getElementById('statusText').textContent = data.progress;
                }
            } catch (error) {
                this.log(`Erro ao monitorar status: ${error.message}`, 'error');
            }
        }, 2000);
    }

    async monitorarLogs() {
        if (!this.currentConsultaId) return;
        
        this.logsInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/logs-consulta/${this.currentConsultaId}`);
                const data = await response.json();
                
                if (data.logs && data.logs.length > 0) {
                    this.atualizarLogsDetalhados(data);
                    this.atualizarEstatisticas(data);
                    this.atualizarProgresso(data.progress || 0);
                }
            } catch (error) {
                console.error('Erro ao monitorar logs:', error);
            }
        }, 1000);
    }

    stopMonitoring() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
        if (this.logsInterval) {
            clearInterval(this.logsInterval);
            this.logsInterval = null;
        }
    }

    atualizarLogsDetalhados(data) {
        const logArea = document.getElementById('logArea');
        
        if (data.logs && data.logs.length > 0) {
            let html = '';
            
            data.logs.forEach(log => {
                const tipoClass = this.getTipoClass(log.tipo);
                html += `
                    <div class="log-entry ${tipoClass}">
                        <span class="log-timestamp">[${log.timestamp}]</span>
                        <span class="log-message">${log.message}</span>
                    </div>
                `;
            });
            
            logArea.innerHTML = html;
            logArea.scrollTop = logArea.scrollHeight;
        }
    }

    atualizarEstatisticas(data) {
        const statsRapidas = document.getElementById('statsRapidas');
        
        if (data.total_processos > 0 || data.processos_encontrados > 0 || data.downloads_concluidos > 0 || data.erros > 0) {
            statsRapidas.style.display = 'block';
            
            document.getElementById('totalProcessos').textContent = data.total_processos || 0;
            document.getElementById('processosEncontrados').textContent = data.processos_encontrados || 0;
            document.getElementById('downloadsConcluidos').textContent = data.downloads_concluidos || 0;
            document.getElementById('totalErros').textContent = data.erros || 0;
        }
    }

    atualizarProgresso(progress) {
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progress > 0) {
            progressContainer.style.display = 'block';
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }

    getTipoClass(tipo) {
        switch (tipo) {
            case 'success': return 'log-success';
            case 'error': return 'log-error';
            case 'warning': return 'log-warning';
            case 'info': return 'log-info';
            default: return 'log-info';
        }
    }

    async atualizarLogs() {
        if (this.currentConsultaId) {
            try {
                const response = await fetch(`/api/logs-consulta/${this.currentConsultaId}`);
                const data = await response.json();
                
                if (data.logs && data.logs.length > 0) {
                    this.atualizarLogsDetalhados(data);
                    this.atualizarEstatisticas(data);
                    this.atualizarProgresso(data.progress || 0);
                }
            } catch (error) {
                this.log(`Erro ao atualizar logs: ${error.message}`, 'error');
            }
        }
    }

    showResultado(data) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');
        const statsContent = document.getElementById('statsContent');
        
        // Mostrar seção de resultados
        resultsSection.style.display = 'block';
        
        // Conteúdo dos resultados
        let html = `
            <div class="row">
                <div class="col-12">
                    <h6>Nome: ${data.nome || 'N/A'}</h6>
                    <h6>CPF: ${data.cpf}</h6>
                    <h6>Status: ${data.status === 'completed' ? 'Concluído' : 'Erro'}</h6>
                    <hr>
                </div>
            </div>
        `;
        
        if (data.result && data.result.length > 0) {
            html += '<h6 class="mb-3">Arquivos Baixados:</h6><ul class="list-group">';
            
            data.result.forEach(item => {
                html += `
                    <li class="list-group-item">
                        <i class="fas fa-file-pdf text-danger"></i>
                        ${item.arquivo}
                        <br><small class="text-muted">${item.caminho_completo || 'Localização não disponível'}</small>
                    </li>
                `;
            });
            
            html += '</ul>';
            
            html += `
                <div class="alert alert-success mt-3">
                    <i class="fas fa-check-circle"></i>
                    Os PDFs foram salvos diretamente na pasta '${data.nome}' no Desktop
                    <br><small>Pasta criada: ~/Desktop/${data.nome}</small>
                </div>
            `;
        } else {
            html += `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Nenhum arquivo foi baixado.
                </div>
            `;
        }
        
        resultsContent.innerHTML = html;
        
        // Estatísticas
        let statsHtml = `
            <div class="row text-center">
                <div class="col-6 mb-3">
                    <div class="stat-card bg-primary text-white p-3 rounded">
                        <h4>${data.processos_encontrados || 0}</h4>
                        <small>Processos Encontrados</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card bg-success text-white p-3 rounded">
                        <h4>${data.downloads_concluidos || 0}</h4>
                        <small>Downloads Concluídos</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card bg-info text-white p-3 rounded">
                        <h4>${data.total_processos || 0}</h4>
                        <small>Total de Processos</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card bg-danger text-white p-3 rounded">
                        <h4>${data.erros || 0}</h4>
                        <small>Erros</small>
                    </div>
                </div>
            </div>
        `;
        
        statsContent.innerHTML = statsHtml;
        
        // Rolar para a seção de resultados
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    async loadHistorico() {
        try {
            const response = await fetch('/api/listar-consultas');
            const data = await response.json();
            
            const historicoArea = document.getElementById('historicoArea');
            
            if (data.consultas && data.consultas.length > 0) {
                let html = '<div class="table-responsive"><table class="table table-hover">';
                html += `
                    <thead class="table-light">
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Status</th>
                            <th>Processos</th>
                            <th>Downloads</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                `;
                
                data.consultas.forEach(consulta => {
                    const statusClass = consulta.status === 'completed' ? 'success' : 
                                      consulta.status === 'error' ? 'danger' : 'warning';
                    const statusText = consulta.status === 'completed' ? 'Concluído' : 
                                     consulta.status === 'error' ? 'Erro' : 'Em Andamento';
                    
                    html += `
                        <tr>
                            <td>${consulta.nome}</td>
                            <td>${consulta.cpf}</td>
                            <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                            <td>${consulta.processos_encontrados || 0}</td>
                            <td>${consulta.downloads_concluidos || 0}</td>
                            <td>${new Date(consulta.created_at).toLocaleString()}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table></div>';
                historicoArea.innerHTML = html;
            } else {
                historicoArea.innerHTML = `
                    <div class="text-muted text-center py-4">
                        <i class="fas fa-clock me-2"></i>
                        Nenhuma consulta realizada ainda
                    </div>
                `;
            }
        } catch (error) {
            this.log(`Erro ao carregar histórico: ${error.message}`, 'error');
        }
    }

    async limparHistorico() {
        if (!confirm('Tem certeza que deseja limpar todo o histórico de consultas?')) {
            return;
        }

        try {
            const response = await fetch('/api/limpar-consultas', {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.sucesso) {
                this.showAlert(data.mensagem, 'success');
                this.loadHistorico();
                this.log('Histórico limpo com sucesso', 'success');
            } else {
                this.showAlert('Erro ao limpar histórico', 'error');
            }
        } catch (error) {
            this.showAlert('Erro ao limpar histórico', 'error');
            this.log(`Erro ao limpar histórico: ${error.message}`, 'error');
        }
    }

    limparLog() {
        document.getElementById('logArea').innerHTML = `
            <div class="text-muted text-center py-4">
                <i class="fas fa-info-circle me-2"></i>
                Log limpo
            </div>
        `;
        document.getElementById('statsRapidas').style.display = 'none';
        document.getElementById('progressContainer').style.display = 'none';
        this.log('Log limpo pelo usuário', 'info');
    }

    log(message, type = 'info') {
        const logArea = document.getElementById('logArea');
        const timestamp = new Date().toLocaleTimeString();
        const tipoClass = this.getTipoClass(type);
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${tipoClass}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logArea.appendChild(logEntry);
        logArea.scrollTop = logArea.scrollHeight;
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ScraperPJEApp();
});
