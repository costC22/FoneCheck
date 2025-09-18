# Usar Python 3.11
FROM python:3.11-slim-bullseye

# Definir variáveis de ambiente
ENV PYTHON_VERSION=3.11
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Verificar versão do Python
RUN python --version
RUN python3 --version

# Atualizar pip e instalar setuptools/wheel primeiro
RUN python -m pip install --upgrade pip==23.3.1
RUN pip install --upgrade setuptools==68.2.2 wheel==0.41.2

# Copiar arquivos de requirements
COPY requirements-python311.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements-python311.txt

# Copiar código da aplicação
COPY . .

# Criar diretório para uploads
RUN mkdir -p uploads

# Verificar versão final
RUN python --version

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
