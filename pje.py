from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from datetime import datetime
from time import sleep
import requests
import glob
import json
import os
from config import *


# 📌 Criar o driver por função (NÃO global)
def iniciar_driver():
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_experimental_option("prefs", CHROME_OPTIONS)
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    # options = ChromeOptions()
    # options.browser_version = "latest"
    # options.set_capability("browserName", "chrome")
    # options.set_capability(
    #     "selenoid:options", {
    #         "enableVNC": True,
    #     }
    # )

    # # Conectar ao Selenoid
    # return webdriver.Remote(
    #     command_executor="http://localhost:4444/wd/hub",
    #     options=options 
    # )

def criar_diretorio_downloads():
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
        print(f"📁 Diretório criado: {DOWNLOAD_DIR}")

def login(driver):
    wait = WebDriverWait(driver, WEBDRIVER_WAIT)
    iframe = wait.until(EC.presence_of_element_located((By.TAG_NAME, "iframe")))
    driver.switch_to.frame(iframe)

    wait.until(EC.presence_of_element_located((By.ID, "username"))).send_keys(PJE_USER)
    wait.until(EC.presence_of_element_located((By.ID, "password"))).send_keys(PJE_PASSWORD)
    wait.until(EC.element_to_be_clickable((By.ID, "kc-login"))).click()

    driver.switch_to.default_content()
    sleep(3)

def wait_for_download_and_upload(download_dir, timeout, processo_info=None):
    initial_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
    start_time = datetime.now()

    while (datetime.now() - start_time).seconds < timeout:
        current_files = set(glob.glob(os.path.join(download_dir, "*.pdf")))
        new_files = current_files - initial_files

        if new_files:
            sleep(2)
            for file_path in new_files:
                if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                    print(f"📄 PDF baixado: {os.path.basename(file_path)}")

                    # ✅ Upload para API local
                    api_response = None
                    try:
                        with open(file_path, 'rb') as file:
                            files = {'pdf': file}
                            data = {
                                'timestamp': datetime.now().isoformat(),
                                'processo_info': json.dumps(processo_info) if processo_info else '{}'
                            }
                            
                            response = requests.post(API_URL, files=files, data=data)
                            
                            if response.status_code == 200:
                                api_response = response.json()
                                print(f"✅ PDF enviado para API: {os.path.basename(file_path)}")
                            else:
                                print(f"❌ Erro ao enviar para API: {response.status_code} - {response.text}")
                    except Exception as e:
                        print(f"❌ Erro ao enviar para API: {e}")
                        api_response = None

                    os.remove(file_path)

                    return {
                        "arquivo": os.path.basename(file_path),
                        "api_response": api_response,
                        "info": processo_info
                    }

        sleep(1)

    print("⏰ Timeout aguardando download")
    return None

def buscar_processo(driver, cpf):
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

    print("⏳ Aguardando downloads...")

    # 📥 Esperar e fazer upload
    for i in range(1, len(driver.window_handles)):
        info = {
            "numero_processo": f"Processo {i}",
            "cpf": cpf,
            "data_consulta": datetime.now().isoformat()
        }
        result = wait_for_download_and_upload(DOWNLOAD_DIR, DOWNLOAD_TIMEOUT, processo_info=info)
        if result:
            resultados.append(result)

    # 🧹 Fechar abas extras
    for i in range(1, len(driver.window_handles)):
        try:
            driver.switch_to.window(driver.window_handles[i])
            driver.close()
        except:
            pass

    driver.switch_to.window(driver.window_handles[0])
    return resultados

def executar_scraper(cpf: str):
    criar_diretorio_downloads()
    driver = iniciar_driver()
    driver.get("https://pje1g.trf1.jus.br/pje")
    sleep(2)

    try:
        login(driver)
        resultados = buscar_processo(driver, cpf)
        return resultados
    finally:
        driver.quit()
