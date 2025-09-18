# Deploy do FoneCheck no Render

## 🚀 **Passo a Passo para Deploy no Render:**

### **1. Criar Conta no Render**
- Acesse: https://render.com
- Clique em "Get Started for Free"
- Faça login com sua conta GitHub

### **2. Conectar Repositório**
- No dashboard do Render, clique em "New +"
- Selecione "Web Service"
- Conecte sua conta GitHub
- Selecione o repositório: `costC22/FoneCheck`

### **3. Configurar o Deploy**
- **Name:** `fonecheck`
- **Environment:** `Python 3`
- **Branch:** `main`
- **Root Directory:** Deixe em branco
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

### **4. Configurações Avançadas**
- **Plan:** Free (gratuito)
- **Auto-Deploy:** Yes (deploy automático quando fizer push)

### **5. Deploy**
- Clique em "Create Web Service"
- Aguarde o build (pode levar 5-10 minutos)
- Sua aplicação estará disponível em: `https://fonecheck.onrender.com`

## ⚙️ **Configurações Importantes:**

### **Variáveis de Ambiente (se necessário):**
- `PYTHON_VERSION`: `3.11.0`
- `FLASK_ENV`: `production`

### **Limitações do Plano Gratuito:**
- ⚠️ Aplicação "dorme" após 15 minutos de inatividade
- ⚠️ Primeira requisição após dormir pode demorar ~30 segundos
- ⚠️ Limite de 750 horas/mês

## 📋 **Arquivos Preparados:**

✅ `requirements.txt` - Dependências Python
✅ `render.yaml` - Configuração do Render
✅ `gunicorn` - Servidor WSGI incluído
✅ `incident.xlsx` - Arquivo de dados

## 🔧 **Comandos Úteis:**

### **Para atualizar o deploy:**
```bash
git add .
git commit -m "Update FoneCheck"
git push origin main
```

### **Para ver logs:**
- Acesse o dashboard do Render
- Vá em "Logs" na sua aplicação

## 🎯 **Vantagens do Render:**

- ✅ Deploy automático via GitHub
- ✅ HTTPS gratuito
- ✅ Domínio personalizado
- ✅ Interface simples
- ✅ Suporte nativo ao Python/Flask

## 🚨 **Troubleshooting:**

### **Se o deploy falhar:**
1. Verifique os logs no dashboard
2. Confirme se todas as dependências estão no `requirements.txt`
3. Verifique se o `incident.xlsx` está no repositório

### **Se a aplicação não carregar:**
1. Aguarde alguns minutos (primeira inicialização é lenta)
2. Verifique se o arquivo `incident.xlsx` está acessível
3. Confirme se o `startCommand` está correto

## 📞 **Suporte:**

Para dúvidas sobre deploy, entre em contato com os desenvolvedores:
- **Angelica Pedroso**
- **Bruno Costa**

---

**URL Final:** `https://fonecheck.onrender.com` 🎉
