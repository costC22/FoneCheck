#!/bin/bash
# Script para instalar Python 3.11 manualmente no Render

echo "🚨 FORÇANDO INSTALAÇÃO DO PYTHON 3.11 NO RENDER..."

# Verificar versão atual
echo "Versão atual do Python:"
python --version 2>/dev/null || echo "Python não encontrado"
python3 --version 2>/dev/null || echo "Python3 não encontrado"

# Instalar dependências do sistema
echo "📦 Instalando dependências do sistema..."
apt-get update -y
apt-get install -y software-properties-common curl wget build-essential

# Adicionar repositório do Python
echo "🔧 Adicionando repositório do Python..."
add-apt-repository ppa:deadsnakes/ppa -y
apt-get update -y

# Instalar Python 3.11
echo "🐍 Instalando Python 3.11..."
apt-get install -y python3.11 python3.11-venv python3.11-dev python3.11-distutils

# Instalar pip para Python 3.11
echo "📦 Instalando pip para Python 3.11..."
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3.11 get-pip.py

# Criar link simbólico para python
echo "🔗 Criando links simbólicos..."
ln -sf /usr/bin/python3.11 /usr/local/bin/python
ln -sf /usr/bin/python3.11 /usr/local/bin/python3

# Verificar instalação
echo "✅ Verificando instalação:"
python --version
python3 --version

# Atualizar pip
echo "⬆️ Atualizando pip..."
python -m pip install --upgrade pip

# Instalar setuptools e wheel
echo "🔧 Instalando setuptools e wheel..."
python -m pip install --upgrade setuptools==68.2.2 wheel==0.41.2

# Instalar dependências da aplicação
echo "📚 Instalando dependências da aplicação..."
python -m pip install -r requirements-python311.txt

echo "🎉 Python 3.11 instalado e configurado com sucesso!"
