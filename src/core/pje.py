from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from datetime import datetime
from time import sleep
import glob
import os
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))
from config import *

# Sistema de logs para interface web
class WebLogger:
    def __init__(self, consulta_id):
        self.consulta_id = consulta_id
        self.logs = []
        self.status = "iniciando"
        self.progress = 0
        self.total_processos = 0
        self.processos_encontrados = 0
        self.downloads_concluidos = 0
        self.erros = []
        
        # Etapas detalhadas do progresso
        self.etapas = {
            "iniciando": {"nome": "Iniciando Sistema", "progresso": 0},
            "navegador": {"nome": "Iniciando Navegador", "progresso": 5},
            "login": {"nome": "Fazendo Login", "progresso": 15},
            "login_concluido": {"nome": "Login Concluído", "progresso": 25},
            "buscando": {"nome": "Buscando Processos", "progresso": 35},
            "processos_encontrados": {"nome": "Processos Encontrados", "progresso": 45},
            "abrindo_abas": {"nome": "Abrindo Abas", "progresso": 55},
            "iniciando_downloads": {"nome": "Iniciando Downloads", "progresso": 65},
            "aguardando_downloads": {"nome": "Aguardando Downloads", "progresso": 75},
            "baixando_pdfs": {"nome": "Baixando PDFs", "progresso": 85},
            "concluido": {"nome": "Concluído", "progresso": 100},
            "erro": {"nome": "Erro", "progresso": 0}
        }
        
        self.etapa_atual = "iniciando"
        
    def log(self, message, tipo="info"):
        """Adiciona log com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = {
            "timestamp": timestamp,
            "message": message,
            "tipo": tipo
        }
        self.logs.append(log_entry)
        print(f"[{timestamp}] {message}")
        
    def update_status(self, status, progress=None):
        """Atualiza status e progresso"""
        self.status = status
        self.etapa_atual = status
        
        if progress is not None:
            self.progress = progress
        elif status in self.etapas:
            self.progress = self.etapas[status]["progresso"]
            
    def get_etapa_atual(self):
        """Retorna informações da etapa atual"""
        if self.etapa_atual in self.etapas:
            return self.etapas[self.etapa_atual]
        return {"nome": "Desconhecido", "progresso": 0}
            
    def add_error(self, error):
        """Adiciona erro à lista"""
        self.erros.append(error)
        self.log(f"❌ Erro: {error}", "error")
        
    def get_summary(self):
        """Retorna resumo da execução"""
        etapa_atual = self.get_etapa_atual()
        return {
            "status": self.status,
            "progress": self.progress,
            "etapa_atual": etapa_atual,
            "total_processos": self.total_processos,
            "processos_encontrados": self.processos_encontrados,
            "downloads_concluidos": self.downloads_concluidos,
            "erros": len(self.erros),
            "logs": self.logs[-20:]  # Últimos 20 logs
        }

# Variável global para armazenar loggers ativos
active_loggers = {}

def get_logger(consulta_id):
    """Obtém logger para uma consulta específica"""
    if consulta_id not in active_loggers:
        active_loggers[consulta_id] = WebLogger(consulta_id)
    return active_loggers[consulta_id]

def remove_logger(consulta_id):
    """Remove logger após conclusão"""
    if consulta_id in active_loggers:
        del active_loggers[consulta_id]

# 📌 Criar o driver por função (NÃO global)
def iniciar_driver(download_dir=None, logger=None):
    if logger:
        logger.log("🚀 Iniciando navegador Chrome...", "info")
        logger.update_status("navegador", 5)
    
    chrome_options = webdriver.ChromeOptions()
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Configurar diretório de download personalizado
    if download_dir:
        chrome_prefs = CHROME_OPTIONS.copy()
        chrome_prefs["download.default_directory"] = download_dir
        chrome_options.add_experimental_option("prefs", chrome_prefs)
        if logger:
            logger.log(f"📁 Diretório de download configurado: {download_dir}", "info")
    else:
        chrome_options.add_experimental_option("prefs", CHROME_OPTIONS)
    
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    if logger:
        logger.log("✅ Navegador Chrome iniciado com sucesso", "success")
    
    return webdriver.Chrome(options=chrome_options)

def criar_diretorio_downloads(nome_pessoa=None, logger=None):
    """Cria diretório de downloads, opcionalmente com pasta personalizada para a pessoa"""
    if nome_pessoa:
        # Criar pasta personalizada no desktop
        desktop_path = os.path.expanduser("~/Desktop")
        nome_limpo = "".join(c for c in nome_pessoa if c.isalnum() or c in (' ', '-', '_')).rstrip()
        pasta_pessoa = os.path.join(desktop_path, nome_limpo)
        
        if not os.path.exists(pasta_pessoa):
            os.makedirs(pasta_pessoa)
            if logger:
                logger.log(f"📁 Pasta criada no desktop: {pasta_pessoa}", "success")
        else:
            if logger:
                logger.log(f"📁 Pasta já existe: {pasta_pessoa}", "info")
        
        return pasta_pessoa
    else:
        # Usar diretório padrão
        if not os.path.exists(DOWNLOAD_DIR):
            os.makedirs(DOWNLOAD_DIR)
            if logger:
                logger.log(f"📁 Diretório criado: {DOWNLOAD_DIR}", "info")
        return DOWNLOAD_DIR

def login(driver, logger=None):
    if logger:
        logger.log("🔐 Iniciando processo de login...", "info")
        logger.update_status("login", 15)
    
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)

    try:
        # wait.until(EC.presence_of_element_located((By.ID, "botaoRedirecionarSSO"))).click()
        # if logger:
        #     logger.log("✅ Botão SSO clicado", "success")

        driver.switch_to.frame(driver.find_element(By.ID, "ssoFrame"))
     

        wait.until(EC.presence_of_element_located((By.ID, "username"))).send_keys(PJE_USER)
        sleep(3)
        wait.until(EC.presence_of_element_located((By.ID, "password"))).send_keys(PJE_PASSWORD)
        wait.until(EC.element_to_be_clickable((By.ID, "kc-login"))).click()

        driver.switch_to.default_content()

        sleep(3)
        
        if logger:
            logger.log("✅ Login realizado com sucesso", "success")
            logger.update_status("login_concluido", 25)
            
    except Exception as e:
        if logger:
            logger.add_error(f"Falha no login: {str(e)}")
        raise e

def wait_for_download_and_upload(download_dir, timeout, processo_info=None, logger=None):
    initial_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
    start_time = datetime.now()
    
    if logger:
        logger.log(f"📁 Aguardando downloads em: {download_dir}", "info")

    while (datetime.now() - start_time).seconds < timeout:
        current_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
        new_files = current_files - initial_files

        if new_files:
            sleep(2)
            for file_path in new_files:
                if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                    if logger:
                        logger.log(f"📄 PDF baixado: {os.path.basename(file_path)}", "success")
                        logger.log(f"📍 Localização: {file_path}", "info")

                    return {
                        "arquivo": os.path.basename(file_path),
                        "info": processo_info,
                        "caminho_completo": file_path
                    }

        sleep(1)

    if logger:
        logger.log(f"⏰ Timeout aguardando download em: {download_dir}", "warning")
    return None

def aguardar_todos_downloads(driver, download_dir, cpf, logger=None):
    """Aguarda todos os downloads com timeout inteligente"""
    num_abas = len(driver.window_handles) - 1  # Excluir aba principal
    
    if logger:
        logger.log(f"📊 Aguardando {num_abas} downloads...", "info")
        logger.update_status("aguardando_downloads", 75)
        logger.total_processos = num_abas
    
    resultados = []
    downloads_concluidos = 0
    start_time = datetime.now()
    timeout_total = DOWNLOAD_TIMEOUT * 2  # Timeout total mais longo
    
    while downloads_concluidos < num_abas:
        # Verificar se algum download foi concluído
        current_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
        
        for file_path in current_files:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                # Verificar se já foi processado
                arquivo_ja_processado = any(r.get('arquivo') == os.path.basename(file_path) for r in resultados)
                
                if not arquivo_ja_processado:
                    downloads_concluidos += 1
                    
                    if logger:
                        logger.log(f"📄 PDF {downloads_concluidos}/{num_abas} baixado: {os.path.basename(file_path)}", "success")
                        logger.log(f"📍 Localização: {file_path}", "info")
                        logger.downloads_concluidos = downloads_concluidos
                        progress = 75 + (downloads_concluidos / num_abas) * 20
                        logger.update_status("baixando_pdfs", progress)
                    
                    info = {
                        "numero_processo": f"Processo {downloads_concluidos}",
                        "cpf": cpf,
                        "data_consulta": datetime.now().isoformat()
                    }
                    
                    resultados.append({
                        "arquivo": os.path.basename(file_path),
                        "info": info,
                        "caminho_completo": file_path
                    })
        
        # Verificar timeout total
        elapsed_time = (datetime.now() - start_time).total_seconds()
        if elapsed_time > timeout_total:
            if logger:
                logger.log(f"⏰ Timeout total atingido ({timeout_total}s). Encerrando downloads.", "warning")
            break
        
        # Aguardar um pouco antes de verificar novamente
        sleep(2)
        
        # Mostrar progresso a cada 10 segundos
        if int(elapsed_time) % 10 == 0 and elapsed_time > 0:
            if logger:
                logger.log(f"⏱️  Progresso: {downloads_concluidos}/{num_abas} downloads concluídos ({elapsed_time:.0f}s)", "info")
    
    if logger:
        logger.log(f"✅ Downloads concluídos: {downloads_concluidos}/{num_abas}", "success")
        logger.update_status("concluido", 100)
    
    return resultados

def buscar_processo(driver, cpf, download_dir, logger=None):
    if logger:
        logger.log("🔍 Iniciando busca de processos...", "info")
        logger.update_status("buscando", 35)
    
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)
    driver.get("https://pje1g.trf1.jus.br/pje/Processo/ConsultaProcesso/listView.seam")

    try:
        campo_cpf = wait.until(EC.presence_of_element_located((By.ID, "fPP:dpDec:documentoParte")))
        campo_cpf.clear()
        campo_cpf.send_keys(cpf)
        
        if logger:
            logger.log(f"📝 CPF inserido: {cpf}", "info")

        campo_classe = wait.until(EC.presence_of_element_located((By.ID, "fPP:j_id256:classeJudicial")))
        campo_classe.send_keys("CUMPRIMENTO DE SENTENÇA")
        campo_classe.send_keys(Keys.ENTER)
        
        if logger:
            logger.log("🔍 Buscando processos de 'CUMPRIMENTO DE SENTENÇA'...", "info")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]'))
        )

        botoes = driver.find_elements(By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]')
        
        if logger:
            logger.log(f"🔍 {len(botoes)} processos encontrados.", "success")
            logger.processos_encontrados = len(botoes)
            logger.update_status("processos_encontrados", 45)

        # 🔄 Abrir todas as abas
        if logger:
            logger.log("🔄 Abrindo processos em novas abas...", "info")
            logger.update_status("abrindo_abas", 55)
        
        for i, botao in enumerate(botoes):
            try:
                driver.execute_script("arguments[0].scrollIntoView();", botao)
                sleep(0.5)
                botao.click()
                WebDriverWait(driver, 5).until(EC.alert_is_present()).accept()
                
                if logger:
                    logger.log(f"✅ Aba {i+1} aberta com sucesso", "success")
                    
            except Exception as e:
                if logger:
                    logger.add_error(f"Erro ao abrir aba {i+1}: {e}")
                else:
                    print(f"❌ Erro ao abrir aba {i+1}: {e}")

        resultados = []

        # ⏬ Ativar todos os downloads nas abas
        if logger:
            logger.log("⏬ Iniciando downloads dos processos...", "info")
            logger.update_status("iniciando_downloads", 65)
        
        for i in range(1, len(driver.window_handles)):
            try:
                driver.switch_to.window(driver.window_handles[i])
                
                if logger:
                    logger.log(f"🗂️ Acessando aba {i} para download", "info")

                WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, '//a[contains(@class, "btn-menu-abas")]'))
                ).click()

                botao_download = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.ID, "navbar:downloadProcesso"))
                )
                driver.execute_script("arguments[0].scrollIntoView(true);", botao_download)
                sleep(0.5)
                botao_download.click()

                WebDriverWait(driver, 5).until(EC.alert_is_present()).accept()
                
                if logger:
                    logger.log(f"✅ Download iniciado na aba {i}", "success")

            except Exception as e:
                if logger:
                    logger.add_error(f"Erro na aba {i}: {e}")
                else:
                    print(f"❌ Erro na aba {i}: {e}")

        if logger:
            logger.log(f"⏳ Aguardando downloads na pasta: {download_dir}", "info")
            logger.update_status("aguardando_downloads", 75)

        # 📥 Aguardar todos os downloads com timeout inteligente
        resultados = aguardar_todos_downloads(driver, download_dir, cpf, logger)

        # 🧹 Fechar abas extras
        if logger:
            logger.log("🧹 Fechando abas extras...", "info")
        
        for i in range(1, len(driver.window_handles)):
            try:
                driver.switch_to.window(driver.window_handles[i])
                driver.close()
            except:
                pass

        driver.switch_to.window(driver.window_handles[0])
        
        if logger:
            logger.log(f"✅ Busca concluída. {len(resultados)} arquivos baixados.", "success")
        
        return resultados
        
    except Exception as e:
        if logger:
            logger.add_error(f"Erro durante busca: {e}")
        raise e

def executar_scraper(nome: str, cpf: str, consulta_id: str = None):
    logger = get_logger(consulta_id) if consulta_id else None
    
    if logger:
        logger.log(f"🚀 Iniciando scraper para: {nome} (CPF: {cpf})", "info")
        logger.update_status("iniciando", 0)
        logger.log("📋 Etapas do processo:", "info")
        logger.log("   1. Iniciar navegador", "info")
        logger.log("   2. Fazer login no PJE", "info")
        logger.log("   3. Buscar processos", "info")
        logger.log("   4. Abrir abas dos processos", "info")
        logger.log("   5. Iniciar downloads", "info")
        logger.log("   6. Aguardar conclusão", "info")
    
    download_dir = criar_diretorio_downloads(nome, logger)
    driver = iniciar_driver(download_dir, logger)
    driver.get("https://pje1g.trf1.jus.br/pje")
    sleep(2)

    try:
        if logger:
            logger.log("🔐 Fazendo login no PJE...", "info")
        login(driver, logger)
        
        if logger:
            logger.log("🔍 Iniciando busca de processos...", "info")
        resultados = buscar_processo(driver, cpf, download_dir, logger)
        
        if logger:
            logger.log(f"✅ Busca concluída. {len(resultados)} arquivos baixados.", "success")
            logger.update_status("concluido", 100)
        
        return resultados
        
    except Exception as e:
        if logger:
            logger.add_error(f"Erro durante a execução: {e}")
            logger.update_status("erro", 0)
        else:
            print(f"❌ Erro durante a execução: {e}")
        return []
        
    finally:
        if logger:
            logger.log("🔄 Fechando navegador...", "info")
        else:
            print("🔄 Fechando navegador...")
            
        try:
            driver.quit()
            if logger:
                logger.log("✅ Navegador fechado com sucesso.", "success")
            else:
                print("✅ Navegador fechado com sucesso.")
        except Exception as e:
            if logger:
                logger.add_error(f"Erro ao fechar navegador: {e}")
            else:
                print(f"⚠️  Erro ao fechar navegador: {e}")

if __name__ == "__main__":
    executar_scraper("João Silva", "03575438749")
