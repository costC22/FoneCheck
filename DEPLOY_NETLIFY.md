# Deploy do FoneCheck no Netlify

## ⚠️ **IMPORTANTE - Limitação do Netlify**

O **Netlify** é uma plataforma de hosting estático que não suporta aplicações Python/Flask diretamente. Para aplicações Flask, você precisa usar plataformas como:

## 🚀 **Alternativas Recomendadas para Deploy:**

### **1. Heroku (Recomendado)**

```bash
# Instalar Heroku CLI
# Criar conta no heroku.com

# No diretório do projeto:
heroku create fonecheck-app
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### **2. Railway**

```bash
# Criar conta no railway.app
# Conectar GitHub e fazer deploy automático
```

### **3. Render**

```bash
# Criar conta no render.com
# Conectar GitHub e fazer deploy automático
```

### **4. PythonAnywhere**

```bash
# Criar conta no pythonanywhere.com
# Upload dos arquivos via interface web
```

## 📋 **Arquivos Preparados para Deploy:**

✅ `Procfile` - Para Heroku
✅ `requirements.txt` - Dependências Python
✅ `runtime.txt` - Versão do Python
✅ `netlify.toml` - Configuração Netlify (não funcionará)

## 🌐 **Para Netlify (Apenas Frontend Estático):**

Se quiser usar apenas o frontend no Netlify, você precisaria:

1. **Converter para JavaScript puro** (sem backend Python)
2. **Usar uma API externa** para processar os arquivos Excel
3. **Implementar tudo no frontend** (limitado)

## 💡 **Recomendação:**

Use **Heroku** ou **Railway** para deploy completo da aplicação Flask com todas as funcionalidades.

## 🔧 **Comandos para Deploy no Heroku:**

```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Criar app
heroku create seu-app-fonecheck

# 4. Deploy
git add .
git commit -m "Deploy FoneCheck"
git push heroku main

# 5. Abrir no navegador
heroku open
```

## 📞 **Suporte:**

Para dúvidas sobre deploy, entre em contato com os desenvolvedores:

- **Angelica Pedroso**
- **Bruno Costa**
