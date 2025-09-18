#!/usr/bin/env python3
"""
Script de teste para verificar se todas as dependências estão funcionando
antes do deploy no Render.
"""

import sys
import importlib

def test_imports():
    """Testa se todas as dependências podem ser importadas."""
    dependencies = [
        'flask',
        'pandas', 
        'openpyxl',
        'gunicorn',
        'numpy',
        'werkzeug'
    ]
    
    print("🔍 Testando importações das dependências...")
    
    for dep in dependencies:
        try:
            importlib.import_module(dep)
            print(f"✅ {dep} - OK")
        except ImportError as e:
            print(f"❌ {dep} - ERRO: {e}")
            return False
    
    return True

def test_app_import():
    """Testa se o app.py pode ser importado."""
    print("\n🔍 Testando importação do app.py...")
    
    try:
        import app
        print("✅ app.py - OK")
        return True
    except Exception as e:
        print(f"❌ app.py - ERRO: {e}")
        return False

def main():
    """Função principal do teste."""
    print("🚀 Iniciando testes de deploy...")
    print(f"Python version: {sys.version}")
    print("-" * 50)
    
    # Testar importações
    imports_ok = test_imports()
    
    # Testar app
    app_ok = test_app_import()
    
    print("-" * 50)
    
    if imports_ok and app_ok:
        print("🎉 Todos os testes passaram! O deploy deve funcionar.")
        return 0
    else:
        print("💥 Alguns testes falharam. Verifique as dependências.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
