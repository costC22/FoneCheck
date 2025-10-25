# 🔐 Credenciais de Acesso - FoneCheck

## Usuários Disponíveis

### 1. Administrador

- **Usuário:** `admin`
- **Senha:** `admin123`
- **Acesso:** Completo ao sistema

### 2. Usuário FoneCheck

- **Usuário:** `fonecheck`
- **Senha:** `fonecheck2024`
- **Acesso:** Completo ao sistema

### 3. Usuário Padrão

- **Usuário:** `user`
- **Senha:** `user123`
- **Acesso:** Completo ao sistema

## 🔒 Segurança

- Todas as senhas são criptografadas usando SHA-256
- Sessões são protegidas com chave secreta
- Todas as rotas do sistema requerem autenticação
- Logout automático ao fechar o navegador (exceto se "Lembrar de mim" estiver marcado)

## 🚀 Como Acessar

1. Acesse a URL do sistema
2. Será redirecionado automaticamente para a tela de login
3. Digite suas credenciais
4. Marque "Lembrar de mim" se desejar manter a sessão ativa
5. Clique em "Entrar"

## ⚠️ Importante

- **NÃO COMPARTILHE** estas credenciais com pessoas não autorizadas
- Para produção, recomenda-se:
  - Usar banco de dados para armazenar usuários
  - Implementar hash mais seguro (bcrypt)
  - Adicionar autenticação de dois fatores
  - Configurar HTTPS

## 🔧 Configuração de Produção

Para ambiente de produção, modifique o arquivo `app.py`:

```python
# Substitua por credenciais do banco de dados
USERS = {
    'usuario1': hashlib.sha256('senha_segura'.encode()).hexdigest(),
    # Adicione mais usuários conforme necessário
}
```

---

**Desenvolvido por:** Angelica Pedroso e Bruno Costa  
**Para:** Zamp - Burger King e Popeyes
