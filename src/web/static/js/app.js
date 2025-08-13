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
        this.initTheme();
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
        
        // Atualizar histórico
        document.getElementById('atualizarHistoricoBtn').addEventListener('click', () => this.loadHistorico());
        
        // Toggle do log
        document.getElementById('logToggleBtn').addEventListener('click', () => this.toggleLog());
        
        // Formatação automática do CPF
        document.getElementById('cpf').addEventListener('input', (e) => this.formatarCPF(e.target));
        
        // Toggle do tema
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
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
        document.getElementById('etapasProgresso').style.display = 'block';
        document.getElementById('iniciarBtn').disabled = true;
        document.getElementById('iniciarBtn').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Consulta em Andamento...';
        
        // Mostrar log automaticamente quando consulta iniciar
        this.showLog();
    }

    hideStatusConsulta() {
        document.getElementById('statusConsulta').style.display = 'none';
        document.getElementById('etapasProgresso').style.display = 'none';
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
                    // Atualizar texto de status e progresso
                    document.getElementById('statusText').textContent = data.progress;
                    this.atualizarProgresso(data.progress || 0, data.etapa_atual?.nome);
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
                
                // Sempre atualizar progresso e estatísticas, mesmo sem logs
                this.atualizarProgresso(data.progress || 0, data.etapa_atual?.nome);
                this.atualizarEstatisticas(data);
                
                if (data.logs && data.logs.length > 0) {
                    this.atualizarLogsDetalhados(data);
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

    atualizarProgresso(progress, etapaAtual = null) {
        const etapasProgresso = document.getElementById('etapasProgresso');
        const etapaAtualText = document.getElementById('etapaAtual');
        
        // Atualizar etapa atual se fornecida
        if (etapaAtual && etapasProgresso.style.display !== 'none') {
            etapaAtualText.textContent = etapaAtual;
            this.atualizarEtapas(progress);
        }
    }
    
    atualizarEtapas(progress) {
        const etapas = {
            'navegador': { min: 0, max: 15, icon: 'fa-chrome', text: 'Navegador' },
            'login': { min: 15, max: 30, icon: 'fa-sign-in-alt', text: 'Login' },
            'buscando': { min: 30, max: 50, icon: 'fa-search', text: 'Busca' },
            'processos_encontrados': { min: 45, max: 60, icon: 'fa-search', text: 'Processos' },
            'abrindo_abas': { min: 55, max: 70, icon: 'fa-external-link-alt', text: 'Abas' },
            'iniciando_downloads': { min: 65, max: 80, icon: 'fa-download', text: 'Downloads' },
            'aguardando_downloads': { min: 75, max: 95, icon: 'fa-clock', text: 'Aguardando' },
            'baixando_pdfs': { min: 75, max: 100, icon: 'fa-file-pdf', text: 'PDFs' },
            'concluido': { min: 100, max: 100, icon: 'fa-check-circle', text: 'Concluído' }
        };
        
        // Atualizar cada etapa baseado no progresso
        Object.keys(etapas).forEach(etapaKey => {
            const etapa = etapas[etapaKey];
            const etapaElement = document.getElementById(`etapa-${etapaKey.split('_')[0]}`);
            
            if (etapaElement) {
                const iconElement = etapaElement.querySelector('.etapa-icon i');
                const textElement = etapaElement.querySelector('.etapa-text');
                
                if (progress >= etapa.min && progress <= etapa.max) {
                    // Etapa atual
                    iconElement.className = `fas ${etapa.icon} text-primary`;
                    textElement.className = 'etapa-text text-primary fw-bold';
                    etapaElement.classList.add('etapa-ativa');
                } else if (progress > etapa.max) {
                    // Etapa concluída
                    iconElement.className = `fas ${etapa.icon} text-success`;
                    textElement.className = 'etapa-text text-success';
                    etapaElement.classList.add('etapa-concluida');
                } else {
                    // Etapa pendente
                    iconElement.className = `fas ${etapa.icon} text-muted`;
                    textElement.className = 'etapa-text text-muted';
                    etapaElement.classList.remove('etapa-ativa', 'etapa-concluida');
                }
            }
        });
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
                
                // Sempre atualizar progresso e estatísticas
                this.atualizarProgresso(data.progress || 0, data.etapa_atual?.nome);
                this.atualizarEstatisticas(data);
                
                if (data.logs && data.logs.length > 0) {
                    this.atualizarLogsDetalhados(data);
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
                // Ordenar consultas por data (mais recente primeiro)
                const consultasOrdenadas = data.consultas.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                
                let html = '<div class="row g-3">';
                
                consultasOrdenadas.forEach(consulta => {
                    const statusClass = consulta.status === 'completed' ? 'success' : 
                                      consulta.status === 'error' ? 'danger' : 'warning';
                    const statusText = consulta.status === 'completed' ? 'Concluído' : 
                                     consulta.status === 'error' ? 'Erro' : 'Em Andamento';
                    const statusIcon = consulta.status === 'completed' ? 'fa-check-circle' : 
                                     consulta.status === 'error' ? 'fa-exclamation-triangle' : 'fa-clock';
                    
                    const dataFormatada = new Date(consulta.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const duracao = this.calcularDuracao(consulta.created_at, consulta.end_time);
                    
                                         html += `
                         <div class="col-lg-6 col-xl-4">
                             <div class="historico-card card h-100">
                                 <div class="card-header d-flex justify-content-between align-items-center">
                                     <div>
                                         <h6 class="card-title mb-0">
                                             <i class="fas fa-user me-2"></i>
                                             ${consulta.nome}
                                         </h6>
                                         <small class="text-muted">CPF: ${consulta.cpf}</small>
                                     </div>
                                     <span class="badge bg-${statusClass}">
                                         <i class="fas ${statusIcon} me-1"></i>
                                         ${statusText}
                                     </span>
                                 </div>
                                 <div class="card-body">
                                     <div class="row text-center mb-3">
                                         <div class="col-3">
                                             <div class="stat-item-mini p-2 rounded">
                                                 <div class="stat-number text-primary">${consulta.total_processos || 0}</div>
                                                 <div class="stat-label">Total</div>
                                             </div>
                                         </div>
                                         <div class="col-3">
                                             <div class="stat-item-mini p-2 rounded">
                                                 <div class="stat-number text-success">${consulta.processos_encontrados || 0}</div>
                                                 <div class="stat-label">Encontrados</div>
                                             </div>
                                         </div>
                                         <div class="col-3">
                                             <div class="stat-item-mini p-2 rounded">
                                                 <div class="stat-number text-info">${consulta.downloads_concluidos || 0}</div>
                                                 <div class="stat-label">Downloads</div>
                                             </div>
                                         </div>
                                         <div class="col-3">
                                             <div class="stat-item-mini p-2 rounded">
                                                 <div class="stat-number text-danger">${consulta.erros || 0}</div>
                                                 <div class="stat-label">Erros</div>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     ${consulta.status === 'completed' && consulta.progress ? `
                                         <div class="mb-3">
                                             <div class="d-flex justify-content-between align-items-center mb-1">
                                                 <small class="text-muted">Progresso</small>
                                                 <small class="text-muted">${Math.round(consulta.progress)}%</small>
                                             </div>
                                             <div class="progress" style="height: 6px;">
                                                 <div class="progress-bar bg-${statusClass}" style="width: ${consulta.progress}%"></div>
                                             </div>
                                         </div>
                                     ` : ''}
                                     
                                     <div class="d-flex justify-content-between align-items-center">
                                         <small class="text-muted">
                                             <i class="fas fa-calendar me-1"></i>
                                             ${dataFormatada}
                                         </small>
                                         ${duracao ? `
                                             <small class="text-muted">
                                                 <i class="fas fa-clock me-1"></i>
                                                 ${duracao}
                                             </small>
                                         ` : ''}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     `;
                });
                
                html += '</div>';
                historicoArea.innerHTML = html;
            } else {
                historicoArea.innerHTML = `
                    <div class="empty-state text-center py-5">
                        <i class="fas fa-history fa-3x mb-3"></i>
                        <h5>Nenhuma consulta realizada</h5>
                        <p class="text-muted">Realize sua primeira consulta para ver o histórico aqui.</p>
                    </div>
                `;
            }
        } catch (error) {
            this.log(`Erro ao carregar histórico: ${error.message}`, 'error');
            const historicoArea = document.getElementById('historicoArea');
            historicoArea.innerHTML = `
                <div class="error-state text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h5>Erro ao carregar histórico</h5>
                    <p class="text-muted">Não foi possível carregar o histórico de consultas.</p>
                    <button class="btn btn-primary" onclick="app.loadHistorico()">
                        <i class="fas fa-sync me-1"></i>
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    async limparHistorico() {
        if (!confirm('Tem certeza que deseja limpar todo o histórico de consultas?\n\nEsta ação não pode ser desfeita.')) {
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



    calcularDuracao(inicio, fim) {
        if (!inicio || !fim) return null;
        
        const inicioDate = new Date(inicio);
        const fimDate = new Date(fim);
        const diffMs = fimDate - inicioDate;
        
        if (diffMs <= 0) return null;
        
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffSeg = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        if (diffMin > 0) {
            return `${diffMin}m ${diffSeg}s`;
        } else {
            return `${diffSeg}s`;
        }
    }



    toggleLog() {
        const logSection = document.getElementById('logSection');
        const logToggleBtn = document.getElementById('logToggleBtn');
        const logToggleText = document.getElementById('logToggleText');
        const logToggleIcon = document.getElementById('logToggleIcon');
        
        if (logSection.style.display === 'none') {
            this.showLog();
        } else {
            this.hideLog();
        }
    }

    showLog() {
        const logSection = document.getElementById('logSection');
        const logToggleBtn = document.getElementById('logToggleBtn');
        const logToggleText = document.getElementById('logToggleText');
        const logToggleIcon = document.getElementById('logToggleIcon');
        
        logSection.style.display = 'block';
        logSection.classList.add('show');
        logToggleBtn.classList.add('active');
        logToggleText.textContent = 'Ocultar Logs';
        logToggleIcon.className = 'fas fa-chevron-up ms-2';
    }

    hideLog() {
        const logSection = document.getElementById('logSection');
        const logToggleBtn = document.getElementById('logToggleBtn');
        const logToggleText = document.getElementById('logToggleText');
        const logToggleIcon = document.getElementById('logToggleIcon');
        
        logSection.classList.add('hide');
        setTimeout(() => {
            logSection.style.display = 'none';
            logSection.classList.remove('hide');
        }, 300);
        logToggleBtn.classList.remove('active');
        logToggleText.textContent = 'Mostrar Logs';
        logToggleIcon.className = 'fas fa-chevron-down ms-2';
    }

    limparLog() {
        document.getElementById('logArea').innerHTML = `
            <div class="text-muted text-center py-4">
                <i class="fas fa-info-circle me-2"></i>
                Log limpo
            </div>
        `;
        document.getElementById('statsRapidas').style.display = 'none';
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

    // Funções do Dark Mode
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.log(`Tema alterado para: ${newTheme === 'dark' ? 'escuro' : 'claro'}`, 'info');
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'Mudar para modo claro';
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'Mudar para modo escuro';
        }
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ScraperPJEApp();
});
