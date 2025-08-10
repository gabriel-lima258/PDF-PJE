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
from pje import executar_scraper

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
    """Executa consulta em thread separada"""
    try:
        consultas[consulta_id]['status'] = 'running'
        consultas[consulta_id]['progress'] = 'Conectando ao PJE...'
        consultas[consulta_id]['start_time'] = datetime.now().isoformat()
        
        resultados = executar_scraper(nome, cpf)
        
        consultas[consulta_id]['status'] = 'completed'
        consultas[consulta_id]['progress'] = 'Consulta concluída com sucesso'
        consultas[consulta_id]['end_time'] = datetime.now().isoformat()
        consultas[consulta_id]['result'] = resultados
        
    except Exception as e:
        consultas[consulta_id]['status'] = 'error'
        consultas[consulta_id]['progress'] = f'Erro: {str(e)}'
        consultas[consulta_id]['end_time'] = datetime.now().isoformat()

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
    
    if not nome:
        return jsonify({'sucesso': False, 'mensagem': 'Nome não informado'})
    
    if not cpf:
        return jsonify({'sucesso': False, 'mensagem': 'CPF não informado'})
    
    cpf_limpo = re.sub(r'[^0-9]', '', cpf)
    if not validar_cpf(cpf_limpo):
        return jsonify({'sucesso': False, 'mensagem': 'CPF inválido'})
    
    # Criar ID único para a consulta
    consulta_id = f"{cpf_limpo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Inicializar status da consulta
    consultas[consulta_id] = {
        'nome': nome,
        'cpf': cpf_limpo,
        'status': 'pending',
        'progress': 'Iniciando consulta...',
        'start_time': None,
        'end_time': None,
        'result': None
    }
    
    # Iniciar consulta em thread separada
    thread = threading.Thread(target=executar_consulta_thread, args=(nome, cpf_limpo, consulta_id))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'sucesso': True,
        'mensagem': 'Consulta iniciada',
        'consulta_id': consulta_id
    })

@app.route('/api/status-consulta/<consulta_id>')
def api_status_consulta(consulta_id):
    """API para verificar status da consulta"""
    if consulta_id not in consultas:
        return jsonify({'erro': 'Consulta não encontrada'})
    
    consulta = consultas[consulta_id]
    
    # Calcular duração se concluída
    duracao = None
    if consulta['start_time'] and consulta['end_time']:
        inicio = datetime.fromisoformat(consulta['start_time'])
        fim = datetime.fromisoformat(consulta['end_time'])
        duracao = (fim - inicio).total_seconds()
    
    return jsonify({
        'consulta_id': consulta_id,
        'nome': consulta.get('nome', 'N/A'),
        'cpf': formatar_cpf(consulta['cpf']),
        'status': consulta['status'],
        'progress': consulta['progress'],
        'start_time': consulta['start_time'],
        'end_time': consulta['end_time'],
        'duracao': duracao,
        'result': consulta['result']
    })

@app.route('/api/listar-consultas')
def api_listar_consultas():
    """API para listar todas as consultas"""
    return jsonify({
        'consultas': [
            {
                'id': consulta_id,
                'nome': consulta.get('nome', 'N/A'),
                'cpf': formatar_cpf(consulta['cpf']),
                'status': consulta['status'],
                'start_time': consulta['start_time']
            }
            for consulta_id, consulta in consultas.items()
        ]
    })

@app.route('/api/limpar-consultas', methods=['POST'])
def api_limpar_consultas():
    """API para limpar histórico de consultas"""
    consultas.clear()
    return jsonify({'sucesso': True, 'mensagem': 'Histórico limpo'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
