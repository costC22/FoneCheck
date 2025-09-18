# Deploy do FoneCheck no Render - VERSÃO CORRIGIDA

## 🚨 **Problemas Corrigidos:**

### **1. Configuração de Porta**
- ✅ Adicionado suporte à variável `PORT` do Render
- ✅ Configurado gunicorn para usar a porta correta

### **2. Configuração do Flask**
- ✅ Desabilitado debug mode para produção
- ✅ Configurado host para `0.0.0.0`

## 🚀 **Passo a Passo CORRIGIDO:**

### **1. Acesse o Render**
- https://render.com
- Faça login com GitHub

### **2. Crie Novo Web Service**
- Clique em "New +" → "Web Service"
- Conecte: `costC22/FoneCheck`

### **3. Configurações CORRETAS:**
```
Name: fonecheck
Environment: Python 3
Region: Oregon (US West)
Branch: main
Root Directory: (deixe vazio)
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT app:app
```

### **4. Configurações Avançadas:**
- **Auto-Deploy:** Yes
- **Plan:** Free

## ⚙️ **Configurações de Ambiente (Adicionar):**

Na seção "Environment Variables", adicione:
```
PYTHON_VERSION = 3.11.0
FLASK_ENV = production
```

## 🔧 **Arquivos Atualizados:**

✅ `app.py` - Configuração de porta corrigida
✅ `render.yaml` - Configuração de porta adicionada
✅ `requirements.txt` - Gunicorn incluído

## 🚨 **Se Ainda Der Erro:**

### **Erro de Build:**
1. Verifique se `incident.xlsx` está no repositório
2. Confirme se todas as dependências estão corretas

### **Erro de Runtime:**
1. Verifique os logs no dashboard do Render
2. Confirme se a porta está configurada corretamente

### **Erro de Arquivo:**
1. Certifique-se que `incident.xlsx` está na raiz do projeto
2. Verifique se o arquivo não está corrompido

## 📋 **Comandos para Atualizar:**

```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

## 🎯 **URL Final:**
Após o deploy bem-sucedido:
`https://fonecheck.onrender.com`

## 📞 **Suporte:**
Se ainda houver problemas, me informe qual erro específico apareceu nos logs do Render.
