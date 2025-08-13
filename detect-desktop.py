#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para detectar automaticamente o caminho do desktop
e gerar docker-compose.yml personalizado
"""

import os
import platform
import sys

def detect_desktop_path():
    """Detecta o caminho do desktop para o sistema atual"""
    system = platform.system()
    
    if system == "Windows":
        desktop_paths = [
            os.path.expanduser("~/OneDrive/Attachments/Área de Trabalho"),
            os.path.expanduser("~/OneDrive/Desktop"),
            os.path.expanduser("~/Desktop"),
            os.path.expanduser("~/Área de Trabalho"),
        ]
    elif system == "Darwin":  # macOS
        desktop_paths = [
            os.path.expanduser("~/Desktop"),
            os.path.expanduser("~/OneDrive/Desktop"),
        ]
    else:  # Linux
        desktop_paths = [
            os.path.expanduser("~/Desktop"),
            os.path.expanduser("~/OneDrive/Desktop"),
            os.path.expanduser("~/Área de Trabalho"),
        ]
    
    for path in desktop_paths:
        if os.path.exists(path):
            return path
    
    # Fallback para diretório atual
    return os.getcwd()

def generate_docker_compose(desktop_path):
    """Gera docker-compose.yml com o caminho do desktop detectado"""
    # Converter barras para formato Docker (Windows)
    if platform.system() == "Windows":
        desktop_path = desktop_path.replace("\\", "/")
    
    docker_compose = f'''version: '3.8'

services:
  pje-scraper:
    build: .
    container_name: pje-scraper
    ports:
      - "5001:5001"
    volumes:
      # Volume para desktop (detectado automaticamente)
      - "{desktop_path}:/app/desktop:rw"
      # Volume para downloads (fallback)
      - ./downloads:/app/downloads
      # Volume para configurações (opcional)
      - ./.env:/app/.env
    environment:
      - DISPLAY=:99
      - PYTHONUNBUFFERED=1
    restart: unless-stopped
    # Configurações de recursos
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    # Configurações de segurança
    security_opt:
      - seccomp:unconfined
    # Configurações de rede
    networks:
      - pje-network

networks:
  pje-network:
    driver: bridge

volumes:
  downloads:
    driver: local
'''
    
    return docker_compose

def main():
    """Função principal"""
    print("🔍 Detectando caminho do desktop...")
    
    desktop_path = detect_desktop_path()
    print(f"✅ Desktop detectado: {desktop_path}")
    
    # Gerar docker-compose.yml
    docker_compose_content = generate_docker_compose(desktop_path)
    
    # Salvar arquivo
    with open("docker-compose.yml", "w", encoding="utf-8") as f:
        f.write(docker_compose_content)
    
    print("✅ docker-compose.yml gerado com sucesso!")
    print(f"📁 Desktop mapeado: {desktop_path}")
    print("\n🚀 Para executar:")
    print("   docker-compose up --build")

if __name__ == "__main__":
    main()
