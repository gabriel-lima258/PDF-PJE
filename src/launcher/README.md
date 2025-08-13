# PJE Web App - Launchers

Este diretório contém os scripts para criar atalhos na área de trabalho, organizados por plataforma.

## 📁 Estrutura Final

```
launcher/
├── windows/          # Scripts para Windows
│   ├── create_desktop_shortcut.ps1
│   ├── create_desktop_shortcut.bat
│   ├── launch_pje_web.bat      # ✅ Versão funcional
│   └── README.md
├── mac/              # Scripts para macOS
│   ├── create_desktop_shortcut.sh
│   ├── launch_pje_web.command
│   └── README.md
└── README.md         # Este arquivo
```

## 🖥️ Windows

Para Windows, use os arquivos na pasta `windows/`:

- **`create_desktop_shortcut.bat`** - Execute este arquivo para criar o atalho
- **`launch_pje_web.bat`** - Launcher da aplicação web (versão funcional)

Veja o [README do Windows](windows/README.md) para instruções detalhadas.

## 🍎 macOS

Para macOS, use os arquivos na pasta `mac/`:

- **`create_desktop_shortcut.sh`** - Execute este script para criar o atalho
- **`launch_pje_web.command`** - Launcher da aplicação web

Veja o [README do macOS](mac/README.md) para instruções detalhadas.

## 🚀 Como Usar

### Windows
1. Navegue até `src/launcher/windows/`
2. Dê duplo clique em `create_desktop_shortcut.bat`
3. O atalho será criado na sua área de trabalho

### macOS
1. Abra o Terminal
2. Navegue até `src/launcher/mac/`
3. Execute: `chmod +x create_desktop_shortcut.sh && ./create_desktop_shortcut.sh`
4. O atalho será criado na sua área de trabalho

## ✨ Recursos

- **Detecção automática** do projeto PDF-PJE
- **Instalação automática** de dependências
- **Abertura automática** do navegador
- **Interface colorida** para melhor visualização
- **Suporte completo** a caracteres especiais

## 📋 Pré-requisitos

- Python 3.x instalado
- Conexão com internet (para instalar dependências)
- Permissões de execução (macOS)

## 🔧 Solução de Problemas

Se encontrar problemas, consulte os READMEs específicos de cada plataforma:
- [Windows](windows/README.md)
- [macOS](mac/README.md)

## 🧹 Limpeza Realizada

- ✅ Removidos arquivos duplicados e não funcionais
- ✅ Mantida apenas a versão funcional do launcher Windows
- ✅ Organização clara por plataforma
- ✅ Documentação atualizada
