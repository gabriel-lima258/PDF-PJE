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
        const statusDiv = document.getElementById('statusConsulta');
        statusDiv.style.display = 'block';
        
        // Inicializar área de logs de forma suave
        this.inicializarAreaLogs();
        
        // Atualizar conteúdo com progresso dinâmico
        statusDiv.innerHTML = `
            <div class="alert alert-info border-0">
                <div class="d-flex align-items-center mb-3">
                    <div class="spinner-border spinner-border-sm me-3" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">Consulta em Andamento</h6>
                        <div id="statusText" class="text-muted">Iniciando sistema...</div>
                    </div>
                    <div class="text-end">
                        <div id="tempoEstimado" class="text-muted small">Calculando...</div>
                        <div id="progressoNumerico" class="fw-bold">0%</div>
                    </div>
                </div>
                
                <!-- Progress Bar Principal -->
                <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                         id="progressBar" role="progressbar" style="width: 0%"></div>
                </div>
                
                <!-- Etapas do Progresso -->
                <div id="etapasProgresso" class="row g-2">
                    <div class="col-3">
                        <div class="etapa-item" data-etapa="1">
                            <div class="etapa-icon bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                                <i class="fas fa-cog fa-sm"></i>
                            </div>
                            <div class="etapa-text small mt-1">Iniciando</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="etapa-item" data-etapa="2">
                            <div class="etapa-icon bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                                <i class="fas fa-sign-in-alt fa-sm"></i>
                            </div>
                            <div class="etapa-text small mt-1">Login</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="etapa-item" data-etapa="3">
                            <div class="etapa-icon bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                                <i class="fas fa-search fa-sm"></i>
                            </div>
                            <div class="etapa-text small mt-1">Buscando</div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="etapa-item" data-etapa="4">
                            <div class="etapa-icon bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                                <i class="fas fa-download fa-sm"></i>
                            </div>
                            <div class="etapa-text small mt-1">Baixando</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('iniciarBtn').disabled = true;
        document.getElementById('iniciarBtn').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Consulta em Andamento...';
    }

    inicializarAreaLogs() {
        const logArea = document.getElementById('logArea');
        if (logArea) {
            logArea.innerHTML = `
                <div class="text-muted text-center py-4 animate__animated animate__fadeIn">
                    <i class="fas fa-info-circle me-2"></i>
                    Aguardando início da consulta...
                </div>
            `;
        }
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
                    this.atualizarProgressoDinamico(data);
                }
            } catch (error) {
                this.log(`Erro ao monitorar status: ${error.message}`, 'error');
            }
        }, 2000);
    }

    atualizarProgressoDinamico(data) {
        // Atualizar texto de status
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = data.progress || 'Processando...';
        }
        
        // Atualizar progresso numérico
        const progressoNumerico = document.getElementById('progressoNumerico');
        if (progressoNumerico) {
            progressoNumerico.textContent = `${Math.round(data.progresso_numerico || 0)}%`;
        }
        
        // Atualizar tempo estimado
        const tempoEstimado = document.getElementById('tempoEstimado');
        if (tempoEstimado) {
            tempoEstimado.textContent = data.tempo_estimado || 'Calculando...';
        }
        
        // Atualizar barra de progresso
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progresso = data.progresso_numerico || 0;
            progressBar.style.width = `${progresso}%`;
            
            // Mudar cor baseada no progresso
            if (progresso < 25) {
                progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
            } else if (progresso < 75) {
                progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-info';
            } else {
                progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
            }
        }
        
        // Atualizar etapas
        this.atualizarEtapas(data.etapa_atual || 0);
    }

    atualizarEtapas(etapaAtual) {
        const etapas = document.querySelectorAll('.etapa-item');
        etapas.forEach((etapa, index) => {
            const etapaNum = index + 1;
            const icon = etapa.querySelector('.etapa-icon');
            const text = etapa.querySelector('.etapa-text');
            
            if (etapaNum <= etapaAtual) {
                // Etapa concluída
                icon.className = 'etapa-icon bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center';
                icon.style.cssText = 'width: 30px; height: 30px; transition: all 0.3s ease;';
                text.className = 'etapa-text small mt-1 text-success fw-bold';
                
                // Adicionar ícone de check
                icon.innerHTML = '<i class="fas fa-check fa-sm"></i>';
            } else if (etapaNum === etapaAtual + 1) {
                // Etapa atual
                icon.className = 'etapa-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center';
                icon.style.cssText = 'width: 30px; height: 30px; transition: all 0.3s ease; animation: pulse 1.5s infinite;';
                text.className = 'etapa-text small mt-1 text-primary fw-bold';
            } else {
                // Etapa pendente
                icon.className = 'etapa-icon bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center';
                icon.style.cssText = 'width: 30px; height: 30px; transition: all 0.3s ease;';
                text.className = 'etapa-text small mt-1 text-muted';
            }
        });
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
                }
            } catch (error) {
                console.error('Erro ao monitorar logs:', error);
            }
        }, 3000); // Aumentado de 1000ms para 3000ms (3 segundos)
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
            // Verificar se já temos logs existentes
            const logsExistentes = logArea.querySelectorAll('.log-entry');
            const logsExistentesCount = logsExistentes.length;
            
            // Se temos novos logs, adicionar apenas os novos
            if (data.logs.length > logsExistentesCount) {
                const novosLogs = data.logs.slice(logsExistentesCount);
                
                novosLogs.forEach(log => {
                    const tipoClass = this.getTipoClass(log.tipo);
                    const icon = this.getTipoIcon(log.tipo);
                    const logEntry = document.createElement('div');
                    logEntry.className = `log-entry ${tipoClass} animate__animated animate__fadeIn`;
                    logEntry.innerHTML = `
                        <span class="log-timestamp">[${log.timestamp}]</span>
                        <span class="log-icon">${icon}</span>
                        <span class="log-message">${log.message}</span>
                    `;
                    
                    logArea.appendChild(logEntry);
                });
                
                // Scroll suave para o final
                this.scrollToBottom(logArea);
            }
        }
    }

    scrollToBottom(element) {
        // Scroll suave para o final da área de logs
        element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
        });
    }

    getTipoIcon(tipo) {
        switch (tipo) {
            case 'success': return '<i class="fas fa-check-circle text-success"></i>';
            case 'error': return '<i class="fas fa-exclamation-circle text-danger"></i>';
            case 'warning': return '<i class="fas fa-exclamation-triangle text-warning"></i>';
            case 'info': return '<i class="fas fa-info-circle text-info"></i>';
            default: return '<i class="fas fa-info-circle text-info"></i>';
        }
    }

    atualizarEstatisticas(data) {
        const statsRapidas = document.getElementById('statsRapidas');
        
        if (data.total_processos > 0 || data.processos_encontrados > 0 || data.downloads_concluidos > 0 || data.erros > 0) {
            statsRapidas.style.display = 'block';
            
            // Atualizar apenas se os valores mudaram significativamente
            this.atualizarContadorSeNecessario('totalProcessos', data.total_processos || 0);
            this.atualizarContadorSeNecessario('processosEncontrados', data.processos_encontrados || 0);
            this.atualizarContadorSeNecessario('downloadsConcluidos', data.downloads_concluidos || 0);
            this.atualizarContadorSeNecessario('totalErros', data.erros || 0);
        }
    }

    atualizarContadorSeNecessario(elementId, valorFinal) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const valorAtual = parseInt(element.textContent) || 0;
        
        // Só atualizar se o valor mudou
        if (valorAtual !== valorFinal) {
            this.animarContador(elementId, valorFinal);
        }
    }

    animarContador(elementId, valorFinal) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const valorAtual = parseInt(element.textContent) || 0;
        if (valorAtual === valorFinal) return;
        
        const incremento = (valorFinal - valorAtual) / 10;
        let valor = valorAtual;
        
        const animacao = setInterval(() => {
            valor += incremento;
            if ((incremento > 0 && valor >= valorFinal) || (incremento < 0 && valor <= valorFinal)) {
                element.textContent = valorFinal;
                clearInterval(animacao);
            } else {
                element.textContent = Math.round(valor);
            }
        }, 100);
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
                    <div class="stat-card p-3 rounded">
                        <h4 class="text-primary">${data.processos_encontrados || 0}</h4>
                        <small>Processos Encontrados</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card p-3 rounded">
                        <h4 class="text-success">${data.downloads_concluidos || 0}</h4>
                        <small>Downloads Concluídos</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card p-3 rounded">
                        <h4 class="text-info">${data.total_processos || 0}</h4>
                        <small>Total de Processos</small>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="stat-card p-3 rounded">
                        <h4 class="text-danger">${data.erros || 0}</h4>
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
                let html = '<div class="row g-3">';
                
                data.consultas.forEach(consulta => {
                    const statusClass = consulta.status === 'completed' ? 'success' : 
                                      consulta.status === 'error' ? 'danger' : 'warning';
                    const statusText = consulta.status === 'completed' ? 'Concluído' : 
                                     consulta.status === 'error' ? 'Erro' : 'Em Andamento';
                    const statusIcon = consulta.status === 'completed' ? 'check-circle' : 
                                     consulta.status === 'error' ? 'exclamation-circle' : 'clock';
                    
                    const progresso = consulta.progresso_numerico || 0;
                    const progressoColor = progresso >= 75 ? 'success' : 
                                          progresso >= 25 ? 'info' : 'warning';
                    
                    const dataFormatada = new Date(consulta.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    html += `
                        <div class="col-lg-6 col-xl-4">
                            <div class="historico-card card h-100 border-0 shadow-sm">
                                <div class="card-header bg-transparent border-0 pb-0">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <h6 class="card-title mb-1 text-truncate" title="${consulta.nome}">
                                                <i class="fas fa-user me-2 text-primary"></i>
                                                ${consulta.nome}
                                            </h6>
                                            <p class="card-subtitle mb-0 text-muted small">
                                                <i class="fas fa-id-card me-1"></i>
                                                ${consulta.cpf}
                                            </p>
                                        </div>
                                        <span class="badge bg-${statusClass} fs-6">
                                            <i class="fas fa-${statusIcon} me-1"></i>
                                            ${statusText}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="card-body pt-2">
                                    <!-- Progresso -->
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between align-items-center mb-1">
                                            <small class="text-muted">Progresso</small>
                                            <small class="text-muted fw-bold">${progresso}%</small>
                                        </div>
                                        <div class="progress" style="height: 8px;">
                                            <div class="progress-bar bg-${progressoColor}" 
                                                 style="width: ${progresso}%" 
                                                 role="progressbar"></div>
                                        </div>
                                    </div>
                                    
                                    <!-- Estatísticas -->
                                    <div class="row g-2 mb-3">
                                        <div class="col-6">
                                            <div class="stat-item-mini text-center p-2 rounded">
                                                <div class="stat-number text-primary fw-bold">${consulta.processos_encontrados || 0}</div>
                                                <div class="stat-label text-muted small">Processos</div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="stat-item-mini text-center p-2 rounded">
                                                <div class="stat-number text-success fw-bold">${consulta.downloads_concluidos || 0}</div>
                                                <div class="stat-label text-muted small">Downloads</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Data -->
                                    <div class="text-center">
                                        <small class="text-muted">
                                            <i class="fas fa-calendar-alt me-1"></i>
                                            ${dataFormatada}
                                        </small>
                                    </div>
                                </div>
                                
                                <div class="card-footer bg-transparent border-0 pt-0">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            ID: ${consulta.consulta_id.split('_')[2]}
                                        </small>
                                        <button class="btn btn-sm btn-outline-primary" 
                                                onclick="app.detalhesConsulta('${consulta.consulta_id}')"
                                                title="Ver detalhes">
                                            <i class="fas fa-eye me-1"></i>
                                            Detalhes
                                        </button>
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
                    <div class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-history fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted mb-2">Nenhuma consulta realizada</h5>
                            <p class="text-muted mb-0">As consultas realizadas aparecerão aqui</p>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            this.log(`Erro ao carregar histórico: ${error.message}`, 'error');
            historicoArea.innerHTML = `
                <div class="text-center py-5">
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h5 class="text-danger mb-2">Erro ao carregar histórico</h5>
                        <p class="text-muted mb-0">Tente recarregar a página</p>
                    </div>
                </div>
            `;
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
        this.log('Log limpo pelo usuário', 'info');
    }

    log(message, type = 'info') {
        const logArea = document.getElementById('logArea');
        const timestamp = new Date().toLocaleTimeString();
        const tipoClass = this.getTipoClass(type);
        const icon = this.getTipoIcon(type);
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${tipoClass} animate__animated animate__fadeIn`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-icon">${icon}</span>
            <span class="log-message">${message}</span>
        `;
        
        logArea.appendChild(logEntry);
        logArea.scrollTop = logArea.scrollHeight;
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed animate__animated animate__fadeInRight`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.classList.remove('animate__fadeInRight');
                alertDiv.classList.add('animate__fadeOutRight');
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Funções de gerenciamento de tema
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            themeToggle.title = 'Mudar para modo claro';
            this.log('Tema escuro ativado', 'info');
        } else {
            icon.className = 'fas fa-moon';
            themeToggle.title = 'Mudar para modo escuro';
            this.log('Tema claro ativado', 'info');
        }
        
        // Adicionar animação de transição
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    // Função para ver detalhes da consulta
    detalhesConsulta(consultaId) {
        // Buscar dados da consulta
        fetch(`/api/status-consulta/${consultaId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'completed') {
                    this.showResultado(data);
                    // Rolar para a seção de resultados
                    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
                } else {
                    this.showAlert('Esta consulta ainda não foi concluída', 'warning');
                }
            })
            .catch(error => {
                this.showAlert('Erro ao carregar detalhes da consulta', 'error');
                this.log(`Erro ao carregar detalhes: ${error.message}`, 'error');
            });
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ScraperPJEApp();
});
