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


# 📌 Criar o driver por função (NÃO global)
def iniciar_driver(download_dir=None):
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
    else:
        chrome_options.add_experimental_option("prefs", CHROME_OPTIONS)
    
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    return webdriver.Chrome(options=chrome_options)

def criar_diretorio_downloads(nome_pessoa=None):
    """Cria diretório de downloads, opcionalmente com pasta personalizada para a pessoa"""
    if nome_pessoa:
        # Criar pasta personalizada no desktop
        desktop_path = os.path.expanduser("~/Desktop")
        nome_limpo = "".join(c for c in nome_pessoa if c.isalnum() or c in (' ', '-', '_')).rstrip()
        pasta_pessoa = os.path.join(desktop_path, nome_limpo)
        
        if not os.path.exists(pasta_pessoa):
            os.makedirs(pasta_pessoa)
            print(f"📁 Pasta criada no desktop: {pasta_pessoa}")
        
        return pasta_pessoa
    else:
        # Usar diretório padrão
        if not os.path.exists(DOWNLOAD_DIR):
            os.makedirs(DOWNLOAD_DIR)
            print(f"📁 Diretório criado: {DOWNLOAD_DIR}")
        return DOWNLOAD_DIR

def login(driver):
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)

    wait.until(EC.presence_of_element_located((By.ID, "botaoRedirecionarSSO"))).click()

    # iframe = wait.until(EC.presence_of_element_located((By.TAG_NAME, "iframe")))
    # driver.switch_to.frame(iframe)

    wait.until(EC.presence_of_element_located((By.ID, "username"))).send_keys(PJE_USER)
    sleep(3)
    wait.until(EC.presence_of_element_located((By.ID, "password"))).send_keys(PJE_PASSWORD)
    wait.until(EC.element_to_be_clickable((By.ID, "kc-login"))).click()

    # driver.switch_to.default_content()
    sleep(3)

def wait_for_download_and_upload(download_dir, timeout, processo_info=None):
    initial_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
    start_time = datetime.now()
    
    print(f"📁 Aguardando downloads em: {download_dir}")

    while (datetime.now() - start_time).seconds < timeout:
        current_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
        new_files = current_files - initial_files

        if new_files:
            sleep(2)
            for file_path in new_files:
                if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                    print(f"📄 PDF baixado: {os.path.basename(file_path)}")
                    print(f"📍 Localização: {file_path}")

                    return {
                        "arquivo": os.path.basename(file_path),
                        "info": processo_info,
                        "caminho_completo": file_path
                    }

        sleep(1)

    print(f"⏰ Timeout aguardando download em: {download_dir}")
    return None

def aguardar_todos_downloads(driver, download_dir, cpf):
    """Aguarda todos os downloads com timeout inteligente"""
    num_abas = len(driver.window_handles) - 1  # Excluir aba principal
    print(f"📊 Aguardando {num_abas} downloads...")
    
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
                    print(f"📄 PDF {downloads_concluidos}/{num_abas} baixado: {os.path.basename(file_path)}")
                    print(f"📍 Localização: {file_path}")
                    
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
            print(f"⏰ Timeout total atingido ({timeout_total}s). Encerrando downloads.")
            break
        
        # Aguardar um pouco antes de verificar novamente
        sleep(2)
        
        # Mostrar progresso a cada 10 segundos
        if int(elapsed_time) % 10 == 0 and elapsed_time > 0:
            print(f"⏱️  Progresso: {downloads_concluidos}/{num_abas} downloads concluídos ({elapsed_time:.0f}s)")
    
    print(f"✅ Downloads concluídos: {downloads_concluidos}/{num_abas}")
    return resultados

def buscar_processo(driver, cpf, download_dir):
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)
    driver.get("https://pje1g.trf1.jus.br/pje/Processo/ConsultaProcesso/listView.seam")

    campo_cpf = wait.until(EC.presence_of_element_located((By.ID, "fPP:dpDec:documentoParte")))
    campo_cpf.clear()
    campo_cpf.send_keys(cpf)

    campo_classe = wait.until(EC.presence_of_element_located((By.ID, "fPP:j_id256:classeJudicial")))
    campo_classe.send_keys("CUMPRIMENTO DE SENTENÇA")
    campo_classe.send_keys(Keys.ENTER)

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]'))
    )

    botoes = driver.find_elements(By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]')
    print(f"🔍 {len(botoes)} processos encontrados.")

    # 🔄 Abrir todas as abas
    for i, botao in enumerate(botoes):
        try:
            driver.execute_script("arguments[0].scrollIntoView();", botao)
            sleep(0.5)
            botao.click()
            WebDriverWait(driver, 5).until(EC.alert_is_present()).accept()
        except Exception as e:
            print(f"❌ Erro ao abrir aba {i+1}: {e}")

    resultados = []

    # ⏬ Ativar todos os downloads nas abas
    for i in range(1, len(driver.window_handles)):
        try:
            driver.switch_to.window(driver.window_handles[i])
            print(f"🗂️ Acessando aba {i}")

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

        except Exception as e:
            print(f"❌ Erro na aba {i}: {e}")

    print(f"⏳ Aguardando downloads na pasta: {download_dir}")

    # 📥 Aguardar todos os downloads com timeout inteligente
    resultados = aguardar_todos_downloads(driver, download_dir, cpf)

    # 🧹 Fechar abas extras
    for i in range(1, len(driver.window_handles)):
        try:
            driver.switch_to.window(driver.window_handles[i])
            driver.close()
        except:
            pass

    driver.switch_to.window(driver.window_handles[0])
    return resultados

def executar_scraper(nome: str, cpf: str):
    download_dir = criar_diretorio_downloads(nome)
    driver = iniciar_driver(download_dir)
    driver.get("https://pje1g.trf1.jus.br/pje")
    sleep(2)

    try:
        print("🔐 Fazendo login no PJE...")
        login(driver)
        print("🔍 Iniciando busca de processos...")
        resultados = buscar_processo(driver, cpf, download_dir)
        print(f"✅ Busca concluída. {len(resultados)} arquivos baixados.")
        return resultados
    except Exception as e:
        print(f"❌ Erro durante a execução: {e}")
        return []
    finally:
        print("🔄 Fechando navegador...")
        try:
            driver.quit()
            print("✅ Navegador fechado com sucesso.")
        except Exception as e:
            print(f"⚠️  Erro ao fechar navegador: {e}")

if __name__ == "__main__":
    executar_scraper("João Silva", "03575438749")
