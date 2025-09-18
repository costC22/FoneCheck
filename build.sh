#!/bin/bash
# Script de build personalizado para forçar Python 3.10

echo "🔧 Configurando Python 3.10.12..."

# Verificar versão do Python
python3.10 --version

# Atualizar pip
python3.10 -m pip install --upgrade pip

# Instalar setuptools e wheel primeiro
python3.10 -m pip install --upgrade setuptools==68.2.2 wheel==0.41.2

# Instalar dependências
python3.10 -m pip install -r requirements-python310.txt

echo "✅ Build concluído com sucesso!"
