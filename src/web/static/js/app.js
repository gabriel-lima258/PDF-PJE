// JavaScript para a interface web do Scraper PJE

class ScraperPJEApp {
    constructor() {
        this.currentConsultaId = null;
        this.statusInterval = null;
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

        // Confirmação
        if (!confirm(`Deseja iniciar a consulta para:\nNome: ${nome}\nCPF: ${cpf}\n\nEsta operação pode levar alguns minutos.`)) {
            return;
        }

        try {
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
                this.log(`Consulta iniciada: ${nome} (${cpf})`, 'info');
                this.monitorarStatus();
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
        document.getElementById('validarBtn').disabled = true;
    }

    hideStatusConsulta() {
        document.getElementById('statusConsulta').style.display = 'none';
        document.getElementById('iniciarBtn').disabled = false;
        document.getElementById('validarBtn').disabled = false;
    }

    async monitorarStatus() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        this.statusInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/status-consulta/${this.currentConsultaId}`);
                const data = await response.json();

                if (data.erro) {
                    this.log(`Erro: ${data.erro}`, 'error');
                    this.stopMonitoring();
                    return;
                }

                document.getElementById('statusText').textContent = data.progress;
                this.log(`Status: ${data.progress}`, 'info');

                if (data.status === 'completed' || data.status === 'error') {
                    this.stopMonitoring();
                    this.hideStatusConsulta();
                    this.loadHistorico();

                    if (data.status === 'completed') {
                        this.showResultado(data);
                        this.log(`Consulta concluída: ${data.result?.length || 0} arquivo(s) encontrado(s)`, 'success');
                    } else {
                        this.log(`Consulta com erro: ${data.progress}`, 'error');
                    }
                }
            } catch (error) {
                this.log(`Erro ao monitorar status: ${error.message}`, 'error');
                this.stopMonitoring();
            }
        }, 2000);
    }

    stopMonitoring() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }
    }

    showResultado(data) {
        const modal = new bootstrap.Modal(document.getElementById('resultadoModal'));
        const modalBody = document.getElementById('resultadoModalBody');

        let html = `
            <div class="row">
                <div class="col-12">
                    <h6>Nome: ${data.nome || 'N/A'}</h6>
                    <h6>CPF: ${data.cpf}</h6>
                    <p><strong>Status:</strong> ${data.status}</p>
                    <p><strong>Duração:</strong> ${data.duracao ? `${data.duracao.toFixed(1)} segundos` : 'N/A'}</p>
                </div>
            </div>
        `;

        if (data.result && data.result.length > 0) {
            html += `
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>Arquivos Encontrados (${data.result.length}):</h6>
                        <ul class="list-group">
            `;
            
            data.result.forEach((item, index) => {
                html += `
                    <li class="list-group-item">
                        <i class="fas fa-file-pdf text-danger"></i>
                        ${item.arquivo}
                        <br><small class="text-muted">${item.caminho_completo || 'Localização não disponível'}</small>
                    </li>
                `;
            });
            
            html += `
                        </ul>
                        <div class="alert alert-success mt-3">
                            <i class="fas fa-check-circle"></i>
                            Os PDFs foram salvos diretamente na pasta '${data.nome}' no Desktop
                            <br><small>Pasta criada: ~/Desktop/${data.nome}</small>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-exclamation-triangle"></i>
                    Nenhum processo encontrado para este CPF.
                </div>
            `;
        }

        modalBody.innerHTML = html;
        modal.show();
    }

    async loadHistorico() {
        try {
            const response = await fetch('/api/listar-consultas');
            const data = await response.json();
            
            const historicoArea = document.getElementById('historicoArea');
            
            if (data.consultas.length === 0) {
                historicoArea.innerHTML = '<div class="text-muted text-center">Nenhuma consulta realizada ainda.</div>';
                return;
            }

            let html = '';
            data.consultas.forEach(consulta => {
                const time = consulta.start_time ? new Date(consulta.start_time).toLocaleString('pt-BR') : 'N/A';
                const statusClass = `status-${consulta.status}`;
                
                html += `
                    <div class="historico-item fade-in">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="historico-nome">${consulta.nome || 'N/A'}</div>
                                <div class="historico-cpf">${consulta.cpf}</div>
                                <div class="historico-time">${time}</div>
                            </div>
                            <span class="status-badge ${statusClass}">${consulta.status}</span>
                        </div>
                    </div>
                `;
            });

            historicoArea.innerHTML = html;
        } catch (error) {
            this.log(`Erro ao carregar histórico: ${error.message}`, 'error');
        }
    }

    async limparHistorico() {
        if (!confirm('Deseja realmente limpar todo o histórico de consultas?')) {
            return;
        }

        try {
            const response = await fetch('/api/limpar-consultas', {
                method: 'POST'
            });
            const data = await response.json();
            
            if (data.sucesso) {
                this.loadHistorico();
                this.log('Histórico limpo', 'info');
            }
        } catch (error) {
            this.log(`Erro ao limpar histórico: ${error.message}`, 'error');
        }
    }

    limparLog() {
        const logArea = document.getElementById('logArea');
        logArea.innerHTML = '<div class="text-muted">Log limpo</div>';
        this.log('Log limpo', 'info');
    }

    log(message, type = 'info') {
        const logArea = document.getElementById('logArea');
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        
        logArea.appendChild(logEntry);
        logArea.scrollTop = logArea.scrollHeight;
    }

    showAlert(message, type) {
        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' : 
                          type === 'success' ? 'alert-success' : 'alert-info';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container-fluid').insertBefore(alertDiv, document.querySelector('.row'));
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ScraperPJEApp();
});
