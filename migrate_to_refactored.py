#!/usr/bin/env python3
"""
Script de Migração para Versão Refatorada
Sistema Clima Vida - NASA Space Apps Hackathon
"""

import os
import shutil
import sys
from pathlib import Path

def backup_current_files():
    """Cria backup dos arquivos atuais"""
    print("🔄 Criando backup dos arquivos atuais...")
    
    backup_dir = Path("backup_original")
    if backup_dir.exists():
        shutil.rmtree(backup_dir)
    
    backup_dir.mkdir()
    
    # Arquivos para backup
    files_to_backup = [
        "app.py",
        "static/js/core/data-manager.js",
        "static/js/core/ui-manager.js"
    ]
    
    for file_path in files_to_backup:
        if os.path.exists(file_path):
            shutil.copy2(file_path, backup_dir / file_path)
            print(f"  ✅ Backup: {file_path}")
    
    print("✅ Backup concluído!")

def migrate_files():
    """Migra para os arquivos refatorados"""
    print("🚀 Iniciando migração para versão refatorada...")
    
    # Substitui app.py
    if os.path.exists("app_refactored.py"):
        shutil.move("app.py", "app_original.py")
        shutil.move("app_refactored.py", "app.py")
        print("  ✅ app.py migrado")
    
    # Substitui data-manager.js
    if os.path.exists("static/js/core/data-manager-refactored.js"):
        shutil.move("static/js/core/data-manager.js", "static/js/core/data-manager-original.js")
        shutil.move("static/js/core/data-manager-refactored.js", "static/js/core/data-manager.js")
        print("  ✅ data-manager.js migrado")
    
    # Substitui ui-manager.js
    if os.path.exists("static/js/core/ui-manager-refactored.js"):
        shutil.move("static/js/core/ui-manager.js", "static/js/core/ui-manager-original.js")
        shutil.move("static/js/core/ui-manager-refactored.js", "static/js/core/ui-manager.js")
        print("  ✅ ui-manager.js migrado")
    
    print("✅ Migração concluída!")

def create_directories():
    """Cria diretórios necessários"""
    print("📁 Criando diretórios necessários...")
    
    directories = [
        "services",
        "templates/errors",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"  ✅ Diretório: {directory}")
    
    print("✅ Diretórios criados!")

def update_requirements():
    """Atualiza requirements.txt se necessário"""
    print("📦 Verificando requirements.txt...")
    
    requirements_file = "requirements.txt"
    if os.path.exists(requirements_file):
        with open(requirements_file, 'r') as f:
            content = f.read()
        
        # Adiciona dependências se não existirem
        if 'python-dotenv' not in content:
            with open(requirements_file, 'a') as f:
                f.write('\npython-dotenv==1.0.0\n')
            print("  ✅ python-dotenv adicionado")
        
        print("✅ Requirements.txt atualizado!")
    else:
        print("⚠️  requirements.txt não encontrado")

def main():
    """Função principal de migração"""
    print("=" * 60)
    print("🌍 SISTEMA CLIMA VIDA - MIGRAÇÃO PARA VERSÃO REFATORADA")
    print("=" * 60)
    
    try:
        # 1. Backup
        backup_current_files()
        
        # 2. Criar diretórios
        create_directories()
        
        # 3. Migrar arquivos
        migrate_files()
        
        # 4. Atualizar requirements
        update_requirements()
        
        print("\n" + "=" * 60)
        print("🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        print("\n📋 Próximos passos:")
        print("1. Execute: python app.py")
        print("2. Acesse: http://localhost:5000")
        print("3. Teste todas as funcionalidades")
        print("\n💡 Se houver problemas, restaure o backup em: backup_original/")
        
    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        print("💡 Verifique os logs e tente novamente")
        sys.exit(1)

if __name__ == "__main__":
    main()
