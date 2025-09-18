# Deploy no Render - Solução Definitiva

## Problema Identificado

O erro `BackendUnavailable: Cannot import 'setuptools.build_meta'` ocorre devido a incompatibilidades entre versões do setuptools e Python 3.13.

## Soluções Implementadas

### 1. Arquivos de Requirements Otimizados

- `requirements-minimal.txt`: Versões específicas e compatíveis
- `requirements-render.txt`: Versão completa com setuptools atualizado

### 2. Configuração do Render (render.yaml)

```yaml
services:
  - type: web
    name: fonecheck
    env: python
    plan: free
    pythonVersion: 3.10.12
    buildCommand: |
      python -m pip install --upgrade pip
      pip install --upgrade setuptools wheel
      pip install -r requirements-minimal.txt
    startCommand: gunicorn --bind 0.0.0.0:$PORT app:app
```

### 3. Arquivos de Configuração Adicionais

- `pyproject.toml`: Configuração moderna do setuptools
- `setup.py`: Configuração alternativa para compatibilidade

## Passos para Deploy

1. **Fazer commit das alterações:**

   ```bash
   git add .
   git commit -m "Fix: Resolve setuptools build error for Render deploy"
   git push origin main
   ```

2. **No Render Dashboard:**

   - Acesse o serviço existente
   - Vá em Settings > Build & Deploy
   - Certifique-se que está usando Python 3.10.12
   - O buildCommand já está configurado no render.yaml

3. **Se ainda houver problemas:**
   - Use o arquivo `requirements-minimal.txt`
   - Verifique se o Python Version está definido como 3.10.12
   - Considere usar o Dockerfile como alternativa

## Arquivos Modificados

- ✅ requirements-render.txt
- ✅ requirements-minimal.txt (novo)
- ✅ render.yaml
- ✅ pyproject.toml (novo)
- ✅ setup.py (novo)

## Teste Local

Para testar localmente antes do deploy:

```bash
pip install -r requirements-minimal.txt
python app.py
```
