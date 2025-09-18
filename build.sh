#!/bin/bash
# Script de build personalizado para forçar Python 3.10

echo "🔧 Forçando Python 3.10.12 no Render..."

# Verificar se python3.10 existe, senão usar python3
if command -v python3.10 &> /dev/null; then
    PYTHON_CMD="python3.10"
    echo "✅ Usando python3.10"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    echo "⚠️  Usando python3 (fallback)"
else
    PYTHON_CMD="python"
    echo "⚠️  Usando python (fallback)"
fi

# Verificar versão
$PYTHON_CMD --version

# Instalar pyenv para forçar Python 3.10.12
echo "📦 Instalando pyenv para forçar Python 3.10.12..."
curl https://pyenv.run | bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"

# Instalar Python 3.10.12 via pyenv
pyenv install 3.10.12
pyenv global 3.10.12

# Verificar se agora temos Python 3.10.12
python --version

# Atualizar pip
python -m pip install --upgrade pip

# Instalar setuptools e wheel primeiro
python -m pip install --upgrade setuptools==68.2.2 wheel==0.41.2

# Instalar dependências
python -m pip install -r requirements-python310.txt

echo "✅ Build concluído com Python 3.10.12!"
