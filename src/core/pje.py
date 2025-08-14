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
    try:
        wait = WebDriverWait(driver, WEBDRIVER_WAIT)
        print("🔐 Iniciando processo de login...")

        # Verificar se as credenciais estão configuradas
        if not PJE_USER or not PJE_PASSWORD:
            raise Exception("Credenciais não configuradas. Configure PJE_USER e PJE_PASSWORD em config.py")

        # Clicar no botão SSO
        try:
            wait.until(EC.presence_of_element_located((By.ID, "botaoRedirecionarSSO"))).click()
            print("✅ Botão SSO clicado")
        except Exception as e:
            print(f"⚠️  Erro ao clicar no botão SSO: {e}")
            # Tentar continuar mesmo assim

        # Preencher usuário
        try:
            campo_usuario = wait.until(EC.presence_of_element_located((By.ID, "username")))
            campo_usuario.clear()
            campo_usuario.send_keys(PJE_USER)
            print("✅ Usuário preenchido")
        except Exception as e:
            raise Exception(f"Erro ao preencher usuário: {e}")

        sleep(3)

        # Preencher senha
        try:
            campo_senha = wait.until(EC.presence_of_element_located((By.ID, "password")))
            campo_senha.clear()
            campo_senha.send_keys(PJE_PASSWORD)
            print("✅ Senha preenchida")
        except Exception as e:
            raise Exception(f"Erro ao preencher senha: {e}")

        # Clicar no botão de login
        try:
            wait.until(EC.element_to_be_clickable((By.ID, "kc-login"))).click()
            print("✅ Botão de login clicado")
        except Exception as e:
            raise Exception(f"Erro ao clicar no botão de login: {e}")

        sleep(3)
        print("✅ Login realizado com sucesso")

    except Exception as e:
        print(f"❌ Erro durante o login: {e}")
        raise e

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

def buscar_processo(driver, cpf, download_dir):
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)
    driver.get("https://pje1g.trf1.jus.br/pje/Processo/ConsultaProcesso/listView.seam")

    campo_cpf = wait.until(EC.presence_of_element_located((By.ID, "fPP:dpDec:documentoParte")))
    campo_cpf.clear()
    campo_cpf.send_keys(cpf)

    campo_classe = wait.until(EC.presence_of_element_located((By.ID, "fPP:j_id256:classeJudicial")))
    campo_classe.send_keys("CUMPRIMENTO DE SENTENÇA")
    campo_classe.send_keys(Keys.ENTER)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]'))
        )
    except Exception as e:
        print(f"⚠️  Timeout aguardando processos: {e}")
        print("🔍 Verificando se há processos disponíveis...")

    botoes = driver.find_elements(By.XPATH, '//a[contains(@class, "btn-link") and contains(@class, "btn-condensed")]')
    print(f"🔍 {len(botoes)} processos encontrados.")

    # Verificar se encontrou processos
    if not botoes:
        print("⚠️  Nenhum processo encontrado para este CPF.")
        return []

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

    # Verificar se há abas abertas
    if len(driver.window_handles) <= 1:
        print("⚠️  Nenhuma aba foi aberta. Verificando se há processos disponíveis...")
        return []

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

    # Verificar novamente se há abas abertas antes de tentar downloads
    if len(driver.window_handles) <= 1:
        print("⚠️  Nenhuma aba disponível para download.")
        return []

    # 📥 Esperar e fazer upload
    for i in range(1, len(driver.window_handles)):
        try:
            info = {
                "numero_processo": f"Processo {i}",
                "cpf": cpf,
                "data_consulta": datetime.now().isoformat()
            }
            result = wait_for_download_and_upload(download_dir, DOWNLOAD_TIMEOUT, processo_info=info)
            if result:
                resultados.append(result)
        except Exception as e:
            print(f"❌ Erro ao processar download da aba {i}: {e}")
            continue

    # 🧹 Fechar abas extras
    try:
        for i in range(1, len(driver.window_handles)):
            try:
                driver.switch_to.window(driver.window_handles[i])
                driver.close()
            except Exception as e:
                print(f"⚠️  Erro ao fechar aba {i}: {e}")
                continue

        # Voltar para a aba principal
        if len(driver.window_handles) > 0:
            driver.switch_to.window(driver.window_handles[0])
    except Exception as e:
        print(f"⚠️  Erro ao fechar abas: {e}")

    return resultados

def executar_scraper(nome: str, cpf: str):
    download_dir = criar_diretorio_downloads(nome)
    driver = None
    
    try:
        driver = iniciar_driver(download_dir)
        driver.get("https://pje1g.trf1.jus.br/pje")
        sleep(2)

        login(driver)
        resultados = buscar_processo(driver, cpf, download_dir)
        return resultados if resultados is not None else []
        
    except Exception as e:
        print(f"❌ Erro durante a execução do scraper: {e}")
        return []
    finally:
        if driver:
            try:
                driver.quit()
                print("✅ Navegador fechado com sucesso.")
            except Exception as e:
                print(f"⚠️  Erro ao fechar navegador: {e}")

if __name__ == "__main__":
    executar_scraper("João Silva", "03575438749")
