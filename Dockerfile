FROM python:3.10.12-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Atualizar pip e instalar setuptools/wheel primeiro
RUN python -m pip install --upgrade pip
RUN pip install --upgrade setuptools==68.2.2 wheel==0.41.2

# Copiar arquivos de requirements
COPY requirements-python310.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements-python310.txt

# Copiar código da aplicação
COPY . .

# Criar diretório para uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
