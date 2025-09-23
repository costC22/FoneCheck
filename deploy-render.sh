#!/bin/bash

echo "🚀 Iniciando deploy no Render..."

# Verificar se estamos no diretório correto
if [ ! -f "app.py" ]; then
    echo "❌ Arquivo app.py não encontrado!"
    exit 1
fi

if [ ! -f "incident.xlsx" ]; then
    echo "❌ Arquivo incident.xlsx não encontrado!"
    exit 1
fi

echo "✅ Arquivos principais encontrados"

# Verificar dependências
echo "📦 Verificando dependências..."
python -c "import flask, pandas, openpyxl, gunicorn" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Todas as dependências estão instaladas"
else
    echo "❌ Algumas dependências estão faltando"
    exit 1
fi

# Testar o app
echo "🧪 Testando aplicação..."
python test_app.py
if [ $? -eq 0 ]; then
    echo "✅ Aplicação testada com sucesso"
else
    echo "❌ Testes falharam"
    exit 1
fi

echo "🎉 Aplicação pronta para deploy no Render!"
echo ""
echo "📋 Instruções para deploy:"
echo "1. Acesse https://dashboard.render.com"
echo "2. Crie um novo Web Service"
echo "3. Conecte ao repositório GitHub"
echo "4. Configure:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: gunicorn --bind 0.0.0.0:\$PORT app:app"
echo "   - Python Version: 3.11.0"
echo "5. Faça o deploy!"
