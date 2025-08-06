from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from pje import executar_scraper
import json
from threading import Thread

app = Flask(__name__)

# Configurações
UPLOAD_FOLDER = 'pdfs'
ALLOWED_EXTENSIONS = {'pdf'}

# Sistema de status para scraper
scraper_status = {}

# Cria o diretório se não existir
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 400 * 1024 * 1024  # 50MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def run_scraper_with_status(cpf):
    """
    Executa o scraper e atualiza o status
    """
    job_id = f"{cpf}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Inicializa o status
    scraper_status[job_id] = {
        'cpf': cpf,
        'status': 'running',
        'start_time': datetime.now().isoformat(),
        'end_time': None,
        'result': None,
        'error': None,
        'progress': 'Iniciando scraper...'
    }
    
    try:
        print(f"🚀 Iniciando scraper para CPF: {cpf} (Job ID: {job_id})")
        scraper_status[job_id]['progress'] = 'Executando login...'
        
        # Executa o scraper
        result = executar_scraper(cpf)
        
        # Atualiza status com sucesso
        scraper_status[job_id].update({
            'status': 'completed',
            'end_time': datetime.now().isoformat(),
            'result': result,
            'progress': 'Scraper concluído com sucesso'
        })
        
        print(f"✅ Scraper concluído para CPF: {cpf} (Job ID: {job_id})")
        
    except Exception as e:
        # Atualiza status com erro
        scraper_status[job_id].update({
            'status': 'error',
            'end_time': datetime.now().isoformat(),
            'error': str(e),
            'progress': f'Erro: {str(e)}'
        })
        
        print(f"❌ Erro no scraper para CPF: {cpf} (Job ID: {job_id}): {e}")

@app.route('/executar-scraper', methods=['GET'])
def executar_scraper_route():
    cpf = request.args.get('cpf')
    if not cpf:
        return jsonify({'error': 'CPF não fornecido'}), 400

    # Inicia o scraper em thread separada
    Thread(target=run_scraper_with_status, args=(cpf,)).start()

    # Retorna o job_id para acompanhamento
    job_id = f"{cpf}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    return jsonify({
        'message': f'Scraper iniciado para CPF: {cpf}',
        'job_id': job_id,
        'status_url': f'/scraper-status/{job_id}'
    }), 202

@app.route('/scraper-status/<job_id>', methods=['GET'])
def scraper_status_route(job_id):
    """
    Verifica o status de uma execução do scraper
    """
    if job_id not in scraper_status:
        return jsonify({'error': 'Job ID não encontrado'}), 404
    
    status = scraper_status[job_id]
    
    # Calcula duração se já terminou
    duration = None
    if status['end_time']:
        start_time = datetime.fromisoformat(status['start_time'])
        end_time = datetime.fromisoformat(status['end_time'])
        duration = (end_time - start_time).total_seconds()
    
    response = {
        'job_id': job_id,
        'cpf': status['cpf'],
        'status': status['status'],
        'start_time': status['start_time'],
        'end_time': status['end_time'],
        'duration_seconds': duration,
        'progress': status['progress']
    }
    
    # Adiciona resultado ou erro conforme o status
    if status['status'] == 'completed':
        response['result'] = status['result']
    elif status['status'] == 'error':
        response['error'] = status['error']
    
    return jsonify(response), 200

@app.route('/scraper-status', methods=['GET'])
def list_scraper_status():
    """
    Lista todos os status de scraper
    """
    cpf_filter = request.args.get('cpf')
    status_filter = request.args.get('status')
    
    filtered_status = {}
    
    for job_id, status in scraper_status.items():
        # Filtra por CPF se especificado
        if cpf_filter and status['cpf'] != cpf_filter:
            continue
            
        # Filtra por status se especificado
        if status_filter and status['status'] != status_filter:
            continue
            
        filtered_status[job_id] = status
    
    return jsonify({
        'total_jobs': len(scraper_status),
        'filtered_jobs': len(filtered_status),
        'jobs': filtered_status
    }), 200

@app.route('/download/<filename>', methods=['GET'])
def download_pdf(filename):
    """
    Baixa um PDF específico pelo nome e apaga após o download
    """
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            from flask import after_this_request
            
            @after_this_request
            def remove_file(response):
                try:
                    os.remove(filepath)
                    print(f"🗑️ Arquivo removido após download: {filename}")
                except Exception as e:
                    print(f"❌ Erro ao remover arquivo: {e}")
                return response
                
            return send_file(filepath, as_attachment=True)
        else:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
    except Exception as e:
        return jsonify({'error': f'Erro ao baixar PDF: {str(e)}'}), 500

@app.route('/upload', methods=['POST'])
def upload_pdf():
    """
    Endpoint para receber PDFs do script Selenium
    """
    try:
        # Verifica se o arquivo foi enviado
        if 'pdf' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['pdf']
        
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if file and allowed_file(file.filename):
            # Gera nome único para o arquivo
            filename = secure_filename(file.filename)
            filename = f"{filename}"
            
            # Salva o arquivo
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Processa informações adicionais
            processo_info = {}
            if 'processo_info' in request.form:
                try:
                    processo_info = json.loads(request.form['processo_info'])
                except:
                    processo_info = {}
            
            # Adiciona informações do upload
            upload_info = {
                'filename': filename,
                'filepath': filepath,
                'filesize': os.path.getsize(filepath),
                'upload_timestamp': datetime.now().isoformat(),
                'processo_info': processo_info
            }
            
            print(f"✅ PDF recebido: {filename}")
            print(f"📊 Informações: {upload_info}")
            
            return jsonify({
                'success': True,
                'message': 'PDF recebido com sucesso',
                'data': upload_info
            }), 200
        
        else:
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
    
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/pdfs', methods=['GET'])
def list_pdfs():
    """
    Lista todos os PDFs recebidos
    """
    try:
        pdfs = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if filename.endswith('.pdf'):
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                pdfs.append({
                    'filename': filename,
                    'filesize': os.path.getsize(filepath),
                    'upload_date': datetime.fromtimestamp(os.path.getctime(filepath)).isoformat()
                })
        
        return jsonify({
            'success': True,
            'pdfs': pdfs,
            'total': len(pdfs)
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/download-multiple', methods=['POST'])
def download_multiple_pdfs():
    """
    Baixa múltiplos PDFs especificados por nome
    """
    try:
        data = request.get_json()
        if not data or 'filenames' not in data:
            return jsonify({'error': 'Lista de arquivos não fornecida'}), 400
        
        filenames = data['filenames']
        if not isinstance(filenames, list):
            return jsonify({'error': 'filenames deve ser uma lista'}), 400
        
        # Verifica se todos os arquivos existem
        missing_files = []
        for filename in filenames:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if not os.path.exists(filepath):
                missing_files.append(filename)
        
        if missing_files:
            return jsonify({
                'error': 'Arquivos não encontrados',
                'missing_files': missing_files
            }), 404
        
        # Cria um ZIP com os arquivos
        import zipfile
        import io
        from flask import Response
        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            for filename in filenames:
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                zip_file.write(filepath, arcname=filename)
        
        zip_buffer.seek(0)
        
        # Remove os arquivos após criar o ZIP
        for filename in filenames:
            try:
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                os.remove(filepath)
                print(f"🗑️ Arquivo removido: {filename}")
            except Exception as e:
                print(f"❌ Erro ao remover arquivo {filename}: {e}")
        
        return Response(
            zip_buffer.getvalue(),
            mimetype='application/zip',
            headers={'Content-Disposition': 'attachment; filename=pdfs.zip'}
        )
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint de verificação de saúde da API
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'upload_folder': app.config['UPLOAD_FOLDER']
    }), 200

if __name__ == '__main__':
    print("🚀 Iniciando servidor de upload de PDFs...")
    print(f"📁 Diretório de upload: {UPLOAD_FOLDER}")
    print("🌐 Servidor rodando em: http://localhost:5000")
    print("📤 Endpoint de upload: http://localhost:5000/upload")
    print("📋 Lista de PDFs: http://localhost:5000/pdfs")
    print("📥 Download individual: http://localhost:5000/download/<filename>")
    print("📦 Download múltiplo: POST http://localhost:5000/download-multiple")
    print("💚 Health check: http://localhost:5000/health")
    print("🔄 Executar scraper: GET http://localhost:5000/executar-scraper?cpf=<CPF>")
    print("📊 Status do scraper: GET http://localhost:5000/scraper-status/<job_id>")
    print("📋 Lista de status: GET http://localhost:5000/scraper-status")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 