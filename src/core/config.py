import os
from dotenv import load_dotenv

load_dotenv()

# Configurações do PJE
PJE_USER = os.getenv("USERNAME")
PJE_PASSWORD = os.getenv("PASSWORD")

# Configurações de download
DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloads")

# Configurações do Chrome
CHROME_OPTIONS = {
    "download.default_directory": DOWNLOAD_DIR,
    "profile.default_content_settings.popups": 0,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": False,
    "download.open_pdf_in_system_reader": False,
    "plugins.always_open_pdf_externally": True,
    "profile.default_content_setting_values.automatic_downloads": 1
}

# Timeouts
DOWNLOAD_TIMEOUT = 80   # segundos por download individual
WEBDRIVER_WAIT = 10    # segundos 

