# Sistema de Progresso Dinâmico - PJE Scraper

## Visão Geral

O sistema de progresso dinâmico foi implementado para fornecer feedback visual em tempo real durante a execução das consultas no PJE. Ele inclui:

- **Barra de progresso animada** com cores dinâmicas
- **Etapas visuais** mostrando o progresso atual
- **Tempo estimado** de conclusão
- **Estatísticas em tempo real** com contadores animados
- **Logs detalhados** com ícones e animações
- **Animações suaves** para melhor experiência do usuário

## Funcionalidades Implementadas

### 1. Progresso Visual Detalhado

#### Etapas do Processo:
1. **Iniciando sistema** (5%) - Preparando ambiente
2. **Conectando ao PJE** (10%) - Estabelecendo conexão
3. **Fazendo login** (20%) - Autenticando no sistema
4. **Buscando processos** (40%) - Consultando banco de dados
5. **Abrindo abas** (60%) - Preparando downloads
6. **Baixando arquivos** (80%) - Transferindo PDFs
7. **Finalizando** (95%) - Organizando arquivos
8. **Concluído** (100%) - Consulta finalizada

#### Indicadores Visuais:
- **Ícones animados** para cada etapa
- **Cores dinâmicas** na barra de progresso
- **Pulsação** na etapa atual
- **Check marks** nas etapas concluídas

### 2. Cálculo de Tempo Estimado

O sistema calcula automaticamente o tempo restante baseado em:
- Tempo decorrido desde o início
- Etapa atual vs. total de etapas
- Velocidade média de progresso

**Formato de exibição:**
- Menos de 1 minuto: "45s"
- Menos de 1 hora: "2m 30s"
- Mais de 1 hora: "1h 15m"

### 3. Estatísticas em Tempo Real

#### Contadores Animados:
- **Total de Processos** - Número total encontrado
- **Processos Encontrados** - Quantidade localizada
- **Downloads Concluídos** - PDFs baixados
- **Erros** - Problemas encontrados

#### Animações:
- Contadores incrementam suavemente
- Efeitos de hover nos cards
- Transições suaves entre estados

### 4. Logs Detalhados

#### Características:
- **Ícones por tipo** de log (sucesso, erro, aviso, info)
- **Timestamps** precisos
- **Animações de entrada** para novos logs
- **Scroll automático** para o log mais recente
- **Cores diferenciadas** por tipo de mensagem

#### Tipos de Log:
- 🟢 **Sucesso** - Operações concluídas
- 🔴 **Erro** - Problemas encontrados
- 🟡 **Aviso** - Alertas importantes
- 🔵 **Info** - Informações gerais

## Implementação Técnica

### Backend (Python/Flask)

#### Arquivo: `src/web/web_app.py`

```python
def calcular_tempo_estimado(etapa_atual, total_etapas, tempo_decorrido):
    """Calcula tempo estimado restante baseado no progresso atual"""
    if etapa_atual <= 0:
        return "Calculando..."
    
    tempo_por_etapa = tempo_decorrido / etapa_atual
    etapas_restantes = total_etapas - etapa_atual
    tempo_restante = tempo_por_etapa * etapas_restantes
    
    # Formatação do tempo
    if tempo_restante < 60:
        return f"{int(tempo_restante)}s"
    elif tempo_restante < 3600:
        minutos = int(tempo_restante // 60)
        segundos = int(tempo_restante % 60)
        return f"{minutos}m {segundos}s"
    else:
        horas = int(tempo_restante // 3600)
        minutos = int((tempo_restante % 3600) // 60)
        return f"{horas}h {minutos}m"
```

#### Estrutura de Dados da Consulta:
```python
consultas[consulta_id] = {
    'status': 'running',
    'progress': 'Descrição da etapa atual',
    'progresso_numerico': 45,  # 0-100
    'etapa_atual': 3,          # 1-8
    'total_etapas': 8,
    'tempo_estimado': '2m 30s',
    'total_processos': 5,
    'processos_encontrados': 3,
    'downloads_concluidos': 2,
    'erros': 0,
    'logs': [...]
}
```

### Frontend (JavaScript)

#### Arquivo: `src/web/static/js/app.js`

#### Função Principal de Atualização:
```javascript
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
    
    // Atualizar barra de progresso com cores dinâmicas
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
    
    // Atualizar etapas visuais
    this.atualizarEtapas(data.etapa_atual || 0);
}
```

#### Animações de Contadores:
```javascript
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
```

### CSS (Estilos e Animações)

#### Arquivo: `src/web/static/css/style.css`

#### Animações Principais:
```css
@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
    }
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
    }
}

@keyframes progressGlow {
    0% {
        box-shadow: 0 0 5px rgba(13, 110, 253, 0.5);
    }
    50% {
        box-shadow: 0 0 20px rgba(13, 110, 253, 0.8);
    }
    100% {
        box-shadow: 0 0 5px rgba(13, 110, 253, 0.5);
    }
}
```

#### Estilos das Etapas:
```css
.etapa-item {
    text-align: center;
    transition: var(--transition);
}

.etapa-icon {
    transition: var(--transition);
    margin: 0 auto;
}

.etapa-text {
    font-size: 0.75rem;
    font-weight: 500;
    transition: var(--transition);
}

.etapa-item:hover {
    transform: translateY(-2px);
}
```

## Como Usar

### 1. Iniciar uma Consulta

1. Preencha o nome da pessoa
2. Digite o CPF (será validado automaticamente)
3. Clique em "Iniciar Consulta com Organização"
4. O sistema mostrará o progresso dinâmico

### 2. Acompanhar o Progresso

- **Barra principal**: Mostra o progresso geral (0-100%)
- **Etapas visuais**: Ícones que mudam conforme o progresso
- **Tempo estimado**: Calculado automaticamente
- **Estatísticas**: Atualizadas em tempo real
- **Logs**: Detalhes de cada operação

### 3. Interpretar os Indicadores

#### Cores da Barra de Progresso:
- 🟡 **Amarelo** (0-25%): Iniciando
- 🔵 **Azul** (25-75%): Processando
- 🟢 **Verde** (75-100%): Finalizando

#### Estados das Etapas:
- ⚪ **Cinza**: Pendente
- 🔵 **Azul pulsante**: Atual
- 🟢 **Verde com ✓**: Concluída

## Personalização

### Modificar Etapas

Para alterar as etapas, edite o arquivo `src/web/web_app.py`:

```python
etapas = [
    {"nome": "Nova Etapa", "progresso": 15, "descricao": "Descrição da etapa..."},
    # Adicione mais etapas conforme necessário
]
```

### Alterar Cores

Modifique as variáveis CSS em `src/web/static/css/style.css`:

```css
:root {
    --primary-color: #0d6efd;
    --success-color: #198754;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --info-color: #0dcaf0;
}
```

### Ajustar Animações

Para modificar a velocidade das animações:

```css
.animate__animated {
    animation-duration: 0.6s; /* Altere este valor */
}
```

## Troubleshooting

### Problemas Comuns

1. **Progresso não atualiza**
   - Verifique se o JavaScript está carregado
   - Confirme se as APIs estão respondendo

2. **Animações não funcionam**
   - Certifique-se de que o Animate.css está incluído
   - Verifique se o CSS está sendo carregado

3. **Tempo estimado incorreto**
   - O cálculo é baseado no progresso atual
   - Pode variar dependendo da velocidade da rede

### Logs de Debug

Para ativar logs detalhados, adicione no console do navegador:

```javascript
localStorage.setItem('debug', 'true');
```

## Performance

### Otimizações Implementadas

1. **Debounce** nas atualizações de UI
2. **Throttling** nas requisições de status
3. **Lazy loading** de elementos
4. **CSS transitions** otimizadas
5. **Reduced motion** para acessibilidade

### Métricas Esperadas

- **Tempo de resposta**: < 100ms
- **FPS das animações**: 60fps
- **Uso de memória**: < 50MB
- **Requisições por segundo**: < 2

## Conclusão

O sistema de progresso dinâmico fornece uma experiência de usuário moderna e informativa, permitindo acompanhar em tempo real o progresso das consultas no PJE. As animações e feedback visual tornam a espera mais agradável e informativa.
