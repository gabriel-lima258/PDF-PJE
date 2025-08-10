# 👤 Funcionalidade de Nome e Pasta Personalizada

## 🎯 Nova Funcionalidade

A aplicação agora permite incluir o nome da pessoa na consulta, criando automaticamente uma pasta personalizada no Desktop para organizar os downloads.

## ✨ Benefícios

- ✅ **Organização automática** - Cada pessoa tem sua própria pasta
- ✅ **Fácil localização** - PDFs organizados por nome no Desktop
- ✅ **Sem confusão** - Downloads separados por pessoa
- ✅ **Interface melhorada** - Campo de nome obrigatório

## 🔧 Como Funciona

### 1. Interface Web
- **Campo Nome**: Obrigatório, nome completo da pessoa
- **Campo CPF**: Obrigatório, CPF no formato 000.000.000-00
- **Validação**: Ambos os campos são validados antes da consulta

### 2. Criação da Pasta
- **Localização**: `~/Desktop/[Nome da Pessoa]`
- **Limpeza**: Caracteres especiais são removidos do nome
- **Criação automática**: Pasta criada se não existir

### 3. Download dos PDFs
- **Destino**: Pasta personalizada no Desktop (configuração direta do Chrome)
- **Organização**: Todos os PDFs da pessoa ficam juntos
- **Nomenclatura**: Mantém os nomes originais dos arquivos
- **Configuração**: Chrome configurado para baixar diretamente na pasta da pessoa

## 📁 Estrutura de Pastas

```
Desktop/
├── João Silva/
│   ├── processo_001.pdf
│   ├── processo_002.pdf
│   └── ...
├── Maria Santos/
│   ├── processo_003.pdf
│   └── ...
└── ...
```

## 🎨 Interface Atualizada

### Formulário
- **Título**: "Consulta por Nome e CPF"
- **Campo Nome**: Placeholder "Nome completo da pessoa"
- **Campo CPF**: Placeholder "000.000.000-00"
- **Botão**: "Iniciar Consulta com Organização"

### Confirmação
- Mostra nome e CPF antes de iniciar
- Confirma criação da pasta personalizada

### Resultados
- Exibe nome da pessoa nos resultados
- Mostra localização da pasta criada
- Histórico inclui nome da pessoa

## 🔄 Fluxo Completo

1. **Usuário preenche** nome e CPF
2. **Sistema valida** ambos os campos
3. **Confirmação** mostra dados da consulta
4. **Cria pasta** personalizada no Desktop
5. **Executa consulta** no PJE
6. **Baixa PDFs** na pasta da pessoa
7. **Mostra resultado** com localização dos arquivos

## 📝 Código Modificado

### Frontend (JavaScript)
- `app.js`: Validação de nome, envio para API
- `index.html`: Campo de nome, atualizações de interface

### Backend (Python)
- `web_app.py`: API aceita nome, thread com nome
- `pje.py`: Função com nome, criação de pasta personalizada, configuração do Chrome

### APIs Atualizadas
- `/api/iniciar-consulta`: Aceita `nome` e `cpf`
- `/api/status-consulta`: Retorna nome da pessoa
- `/api/listar-consultas`: Inclui nome no histórico

## 🎯 Exemplo de Uso

1. **Preencher formulário**:
   - Nome: "João Silva"
   - CPF: "123.456.789-00"

2. **Confirmar consulta**:
   - Sistema mostra: "João Silva (123.456.789-00)"

3. **Executar consulta**:
   - Cria pasta: `~/Desktop/João Silva`
   - Baixa PDFs na pasta

4. **Ver resultado**:
   - Mostra: "PDFs salvos diretamente na pasta 'João Silva' no Desktop"
   - Exibe caminho completo de cada arquivo baixado

## ⚠️ Considerações

- **Nome obrigatório**: Campo não pode ficar vazio
- **Caracteres especiais**: Removidos automaticamente do nome da pasta
- **Pasta existente**: Reutiliza se já existir
- **Permissões**: Requer acesso de escrita no Desktop

**Funcionalidade implementada com sucesso!** 🚀
