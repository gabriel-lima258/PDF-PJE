#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script principal para iniciar a aplicação web PJE
"""

import sys
import os

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Importar e executar a aplicação web
from web.web_app import app

if __name__ == '__main__':
    print("🚀 Iniciando Scraper PJE - Interface Web...")
    print("🌐 Acesse: http://localhost:5001")
    print("⏹️  Para parar, pressione Ctrl+C")
    print("")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
