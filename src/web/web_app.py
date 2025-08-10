#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Interface Web - Scraper PJE
Aplicação web com Flask para buscar processos no PJE
"""

from flask import Flask, render_template, request, jsonify, send_file
import threading
import re
import os
import json
from datetime import datetime
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'core'))
from pje import executar_scraper, get_logger, remove_logger

app = Flask(__name__)

# Armazenar status das consultas
consultas = {}

def validar_cpf(cpf):
    """Valida CPF usando algoritmo oficial"""
    cpf_limpo = re.sub(r'[^0-9]', '', cpf)
    
    if len(cpf_limpo) != 11:
        return False
        
    if cpf_limpo == cpf_limpo[0] * 11:
        return False
        
    # Primeiro dígito verificador
    soma = sum(int(cpf_limpo[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    if int(cpf_limpo[9]) != digito1:
        return False
        
    # Segundo dígito verificador
    soma = sum(int(cpf_limpo[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    if int(cpf_limpo[10]) != digito2:
        return False
        
    return True

def formatar_cpf(cpf):
    """Formata CPF para XXX.XXX.XXX-XX"""
    cpf_limpo = re.sub(r'[^0-9]', '', cpf)
    return f"{cpf_limpo[:3]}.{cpf_limpo[3:6]}.{cpf_limpo[6:9]}-{cpf_limpo[9:]}"

def executar_consulta_thread(nome, cpf, consulta_id):
    """Executa consulta em thread separada com logs detalhados"""
    try:
        consultas[consulta_id]['status'] = 'running'
        consultas[consulta_id]['progress'] = 'Iniciando consulta...'
        consultas[consulta_id]['start_time'] = datetime.now().isoformat()
        
        # Executar scraper com sistema de logs
        resultados = executar_scraper(nome, cpf, consulta_id)
        
        # Obter resumo final dos logs
        logger = get_logger(consulta_id)
        if logger:
            summary = logger.get_summary()
            consultas[consulta_id]['logs'] = summary['logs']
            consultas[consulta_id]['total_processos'] = summary['total_processos']
            consultas[consulta_id]['processos_encontrados'] = summary['processos_encontrados']
            consultas[consulta_id]['downloads_concluidos'] = summary['downloads_concluidos']
            consultas[consulta_id]['erros'] = summary['erros']
            consultas[consulta_id]['progress'] = summary['progress']
            
            # Remover logger após conclusão
            remove_logger(consulta_id)
        
        consultas[consulta_id]['status'] = 'completed'
        consultas[consulta_id]['end_time'] = datetime.now().isoformat()
        consultas[consulta_id]['result'] = resultados
        
    except Exception as e:
        consultas[consulta_id]['status'] = 'error'
        consultas[consulta_id]['progress'] = f'Erro: {str(e)}'
        consultas[consulta_id]['end_time'] = datetime.now().isoformat()
        
        # Adicionar erro aos logs
        logger = get_logger(consulta_id)
        if logger:
            logger.add_error(str(e))
            consultas[consulta_id]['logs'] = logger.get_summary()['logs']
            remove_logger(consulta_id)

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/validar-cpf', methods=['POST'])
def api_validar_cpf():
    """API para validar CPF"""
    data = request.get_json()
    cpf = data.get('cpf', '').strip()
    
    if not cpf:
        return jsonify({'valido': False, 'mensagem': 'CPF não pode estar vazio'})
    
    if validar_cpf(cpf):
        cpf_formatado = formatar_cpf(cpf)
        return jsonify({
            'valido': True, 
            'mensagem': f'CPF válido: {cpf_formatado}',
            'cpf_formatado': cpf_formatado
        })
    else:
        return jsonify({'valido': False, 'mensagem': 'CPF inválido'})

@app.route('/api/iniciar-consulta', methods=['POST'])
def api_iniciar_consulta():
    """API para iniciar consulta"""
    data = request.get_json()
    nome = data.get('nome', '').strip()
    cpf = data.get('cpf', '').strip()
    
    # Validações
    if not nome:
        return jsonify({'sucesso': False, 'mensagem': 'Nome é obrigatório'})
    
    if not cpf:
        return jsonify({'sucesso': False, 'mensagem': 'CPF é obrigatório'})
    
    if not validar_cpf(cpf):
        return jsonify({'sucesso': False, 'mensagem': 'CPF inválido'})
    
    # Limpar CPF
    cpf_limpo = re.sub(r'[^0-9]', '', cpf)
    
    # Gerar ID único para consulta
    consulta_id = f"consulta_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{cpf_limpo[-4:]}"
    
    # Inicializar consulta
    consultas[consulta_id] = {
        'nome': nome,
        'cpf': cpf_limpo,
        'status': 'pending',
        'progress': 'Aguardando início...',
        'created_at': datetime.now().isoformat(),
        'logs': [],
        'total_processos': 0,
        'processos_encontrados': 0,
        'downloads_concluidos': 0,
        'erros': 0
    }
    
    # Executar em thread separada
    thread = threading.Thread(target=executar_consulta_thread, args=(nome, cpf_limpo, consulta_id))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'sucesso': True, 
        'mensagem': 'Consulta iniciada com sucesso',
        'consulta_id': consulta_id
    })

@app.route('/api/status-consulta/<consulta_id>')
def api_status_consulta(consulta_id):
    """API para verificar status da consulta"""
    if consulta_id not in consultas:
        return jsonify({'erro': 'Consulta não encontrada'})
    
    consulta = consultas[consulta_id]
    
    # Obter logs em tempo real se a consulta estiver rodando
    if consulta['status'] == 'running':
        logger = get_logger(consulta_id)
        if logger:
            summary = logger.get_summary()
            consulta['logs'] = summary['logs']
            consulta['progress'] = summary['progress']
            consulta['total_processos'] = summary['total_processos']
            consulta['processos_encontrados'] = summary['processos_encontrados']
            consulta['downloads_concluidos'] = summary['downloads_concluidos']
            consulta['erros'] = summary['erros']
    
    return jsonify({
        'consulta_id': consulta_id,
        'nome': consulta['nome'],
        'cpf': consulta['cpf'],
        'status': consulta['status'],
        'progress': consulta['progress'],
        'created_at': consulta['created_at'],
        'start_time': consulta.get('start_time'),
        'end_time': consulta.get('end_time'),
        'result': consulta.get('result', []),
        'logs': consulta.get('logs', []),
        'total_processos': consulta.get('total_processos', 0),
        'processos_encontrados': consulta.get('processos_encontrados', 0),
        'downloads_concluidos': consulta.get('downloads_concluidos', 0),
        'erros': consulta.get('erros', 0)
    })

@app.route('/api/logs-consulta/<consulta_id>')
def api_logs_consulta(consulta_id):
    """API para obter logs detalhados da consulta"""
    if consulta_id not in consultas:
        return jsonify({'erro': 'Consulta não encontrada'})
    
    logger = get_logger(consulta_id)
    if logger:
        summary = logger.get_summary()
        return jsonify({
            'logs': summary['logs'],
            'status': summary['status'],
            'progress': summary['progress'],
            'total_processos': summary['total_processos'],
            'processos_encontrados': summary['processos_encontrados'],
            'downloads_concluidos': summary['downloads_concluidos'],
            'erros': summary['erros']
        })
    else:
        return jsonify({
            'logs': consultas[consulta_id].get('logs', []),
            'status': consultas[consulta_id]['status'],
            'progress': consultas[consulta_id]['progress']
        })

@app.route('/api/listar-consultas')
def api_listar_consultas():
    """API para listar todas as consultas"""
    consultas_list = []
    for consulta_id, consulta in consultas.items():
        consultas_list.append({
            'consulta_id': consulta_id,
            'nome': consulta['nome'],
            'cpf': consulta['cpf'],
            'status': consulta['status'],
            'progress': consulta['progress'],
            'created_at': consulta['created_at'],
            'total_processos': consulta.get('total_processos', 0),
            'processos_encontrados': consulta.get('processos_encontrados', 0),
            'downloads_concluidos': consulta.get('downloads_concluidos', 0),
            'erros': consulta.get('erros', 0)
        })
    
    return jsonify({'consultas': consultas_list})

@app.route('/api/limpar-consultas', methods=['POST'])
def api_limpar_consultas():
    """API para limpar histórico de consultas"""
    global consultas
    consultas = {}
    return jsonify({'sucesso': True, 'mensagem': 'Histórico limpo com sucesso'})

if __name__ == '__main__':
    print("🚀 Iniciando Scraper PJE - Interface Web...")
    print("🌐 Acesse: http://localhost:5001")
    print("⏹️  Para parar, pressione Ctrl+C")
    print("")
    app.run(debug=True, host='0.0.0.0', port=5001)
