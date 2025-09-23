#!/usr/bin/env python3
"""
Script de teste para verificar se o app Flask está funcionando corretamente.
"""

import sys
import os
import pandas as pd

def test_imports():
    """Testa se todas as importações estão funcionando."""
    print("🔍 Testando importações...")
    
    try:
        from flask import Flask, render_template, request, jsonify, send_file
        print("✅ Flask importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar Flask: {e}")
        return False
    
    try:
        import pandas as pd
        print("✅ Pandas importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar Pandas: {e}")
        return False
    
    try:
        import openpyxl
        print("✅ Openpyxl importado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar Openpyxl: {e}")
        return False
    
    return True

def test_excel_file():
    """Testa se o arquivo Excel pode ser lido."""
    print("\n📊 Testando arquivo Excel...")
    
    excel_file = 'incident.xlsx'
    
    if not os.path.exists(excel_file):
        print(f"❌ Arquivo {excel_file} não encontrado")
        return False
    
    try:
        df = pd.read_excel(excel_file)
        print(f"✅ Arquivo Excel lido com sucesso - {len(df)} linhas")
        print(f"📋 Colunas: {list(df.columns)}")
        return True
    except Exception as e:
        print(f"❌ Erro ao ler arquivo Excel: {e}")
        return False

def test_app_creation():
    """Testa se o app Flask pode ser criado."""
    print("\n🚀 Testando criação do app Flask...")
    
    try:
        from app import app
        print("✅ App Flask criado com sucesso")
        
        # Testar se as rotas principais existem
        with app.test_client() as client:
            response = client.get('/')
            if response.status_code == 200:
                print("✅ Rota principal funcionando")
            else:
                print(f"❌ Rota principal com problema: {response.status_code}")
                return False
            
            response = client.get('/health')
            if response.status_code == 200:
                print("✅ Rota de health check funcionando")
            else:
                print(f"❌ Rota de health check com problema: {response.status_code}")
                return False
        
        return True
    except Exception as e:
        print(f"❌ Erro ao criar app Flask: {e}")
        return False

def main():
    """Função principal de teste."""
    print("🧪 INICIANDO TESTES DO FONECHECK\n")
    
    tests = [
        test_imports,
        test_excel_file,
        test_app_creation
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Erro durante teste: {e}")
            results.append(False)
    
    print(f"\n📊 RESUMO DOS TESTES:")
    print(f"✅ Sucessos: {sum(results)}")
    print(f"❌ Falhas: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 TODOS OS TESTES PASSARAM! O app está pronto para deploy.")
        return 0
    else:
        print("\n⚠️  ALGUNS TESTES FALHARAM! Verifique os problemas acima.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
