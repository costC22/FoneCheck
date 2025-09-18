# FoneCheck - Buscador de Telefones

Uma aplicação web moderna para buscar e filtrar números de telefone em arquivos Excel baseada em códigos de colaboradores.

**Desenvolvido por:** Angelica Pedroso e Bruno Costa

## 🚀 Funcionalidades

- **Upload de Arquivos Excel**: Suporte para arquivos .xlsx e .xls
- **Busca por Código**: Encontra telefones baseado no código do colaborador
- **Filtros Avançados**: Filtre telefones por texto e exclua números específicos
- **Exportação**: Exporte resultados para Excel
- **Interface Moderna**: Design responsivo e intuitivo
- **Validação de Dados**: Verifica formatos de telefone válidos

## 📋 Pré-requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação

1. **Clone ou baixe o projeto**:

   ```bash
   cd FoneCheck
   ```

2. **Instale as dependências**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Execute a aplicação**:

   ```bash
   python app.py
   ```

4. **Acesse no navegador**:
   ```
   http://localhost:5000
   ```

## 📖 Como Usar

1. **Carregar Arquivo**: Selecione um arquivo Excel (.xlsx ou .xls) com seus contatos
2. **Inserir Código**: Digite o código do colaborador que deseja buscar
3. **Buscar**: Clique em "Buscar" para encontrar os telefones
4. **Filtrar**: Use os filtros para refinar os resultados
5. **Exportar**: Baixe os resultados em formato Excel

## 📁 Estrutura do Projeto

```
FoneCheck/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── README.md             # Documentação
├── templates/
│   └── index.html        # Template HTML principal
├── static/
│   ├── styles.css        # Estilos CSS
│   └── script.js         # JavaScript frontend
└── uploads/              # Pasta temporária para uploads
```

## 🔧 Configuração

### Números Excluídos

Por padrão, os seguintes números são excluídos dos resultados:

- `+5531996272142`
- `+5527981824400`

Para modificar, edite a variável `NUMEROS_EXCLUIDOS` em `app.py`.

### Limite de Arquivo

O tamanho máximo de arquivo é 16MB. Para alterar, modifique `MAX_CONTENT_LENGTH` em `app.py`.

## 🎯 Formato do Excel

O arquivo Excel deve conter:

- Uma coluna chamada "Colaborador" com os códigos
- Outras colunas com informações de contato (telefones, emails, etc.)
- A coluna "Telefone comercial" será automaticamente ignorada

## 🔍 Padrões de Telefone

A aplicação reconhece telefones nos seguintes formatos:

- `(11) 99999-9999`
- `11 99999-9999`
- `11999999999`
- `+55 11 99999-9999`
- `+5511999999999`

## 🚨 Solução de Problemas

### Erro de Upload

- Verifique se o arquivo é .xlsx ou .xls
- Confirme que o tamanho não excede 16MB
- Verifique se o arquivo não está corrompido

### Nenhum Resultado

- Confirme se o código existe na coluna "Colaborador"
- Verifique se há telefones válidos nas outras colunas
- Teste com um arquivo menor primeiro

### Erro de Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## 📝 Changelog

### v1.0.0

- Lançamento inicial
- Upload e processamento de Excel
- Busca por código de colaborador
- Filtros e exportação
- Interface web responsiva

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas, abra uma issue no repositório ou entre em contato.

---

Desenvolvido com ❤️ para facilitar a busca de contatos em planilhas Excel.
