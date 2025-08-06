import os
from dotenv import load_dotenv

load_dotenv()

# Configurações do PJE
PJE_USER = os.getenv("USER", "seu_usuario_pje")
PJE_PASSWORD = os.getenv("PASSWORD", "sua_senha_pje")

# Configurações da API
API_URL = os.getenv("API_URL", "http://localhost:5000/upload")
API_KEY = os.getenv("API_KEY", "")

# Configurações de download
DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloads")
PDF_DIR = os.path.join(os.getcwd(), "pdfs")

# Configurações do servidor Flask
FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"

# Configurações do Chrome
CHROME_OPTIONS = {
    "download.default_directory": DOWNLOAD_DIR,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True,
    "download.open_pdf_in_system_reader": False,
    "plugins.always_open_pdf_externally": True,
    "profile.default_content_setting_values.automatic_downloads": 1
}

# Timeouts
DOWNLOAD_TIMEOUT = 45  # segundos
WEBDRIVER_WAIT = 10   # segundos 