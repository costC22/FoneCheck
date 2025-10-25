from flask import Flask, render_template, request, jsonify, send_file, session, redirect, url_for
import pandas as pd
import re
import os
import io
import hashlib
from functools import wraps

app = Flask(__name__)
app.secret_key = 'fonecheck_secret_key_2024'  # Chave secreta para sessões

# Caminho do arquivo Excel fixo
EXCEL_FILE = 'incident.xlsx'

# Números específicos para exclusão (conforme código original)
NUMEROS_EXCLUIDOS = ['+5531996272142', '+5527981824400']

# Credenciais de acesso (em produção, usar banco de dados)
USERS = {
    'admin': hashlib.sha256('admin123'.encode()).hexdigest(),
    'fonecheck': hashlib.sha256('fonecheck2024'.encode()).hexdigest(),
    'user': hashlib.sha256('user123'.encode()).hexdigest()
}

def login_required(f):
    """Decorator para proteger rotas que requerem autenticação."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def encontrar_telefones(row):
    """Encontra e retorna os números de telefone válidos presentes na linha."""
    telefones = []
    # Padrão regex melhorado para capturar telefones brasileiros
    padrao_telefone = re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,3}\)?[-.\s]?)?\d{4,5}[-.\s]?\d{4,5}\b')
    
    for valor in row:
        if isinstance(valor, str):
            # Procurar por padrões que se assemelham a números de telefone
            numeros = padrao_telefone.findall(valor)
            for numero in numeros:
                # Remover espaços, hífens e pontos
                numero_formatado = re.sub(r'[-.\s()]', '', numero)
                # Verificar se o número está dentro de um comprimento razoável
                if 10 <= len(numero_formatado) <= 15:
                    telefones.append(numero_formatado)
    
    return telefones

def buscar_numeros_telefone_por_codigo(df, codigo, tipo_busca):
    """Busca números de telefone por código na coluna Colaborador, separando por tipo de loja."""
    numeros_telefone = []
    
    for index, row in df.iterrows():
        colaborador = str(row.get('Colaborador', ''))
        
        # Verificar se o código está presente na coluna Colaborador
        if codigo in colaborador:
            # Determinar se é Burger King ou Popeyes baseado no tipo de busca
            is_correct_type = False
            
            if tipo_busca == 'BK':
                # Burger King: códigos que começam com 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
                is_correct_type = (
                    colaborador.startswith('15') or
                    colaborador.startswith('16') or
                    colaborador.startswith('17') or
                    colaborador.startswith('18') or
                    colaborador.startswith('19') or
                    colaborador.startswith('20') or
                    colaborador.startswith('21') or
                    colaborador.startswith('22') or
                    colaborador.startswith('23') or
                    colaborador.startswith('24') or
                    colaborador.startswith('25') or
                    colaborador.startswith('26') or
                    colaborador.startswith('27') or
                    colaborador.startswith('28') or
                    colaborador.startswith('29') or
                    colaborador.startswith('30') or
                    colaborador.startswith('31') or
                    colaborador.startswith('32')
                )
            else:  # PK
                # Popeyes: PLK OU códigos que começam com 12, 13, 14
                colaborador_upper = colaborador.upper()
                is_correct_type = (
                    'PLK' in colaborador_upper or
                    colaborador.startswith('12') or
                    colaborador.startswith('13') or
                    colaborador.startswith('14')
                )
            
            if is_correct_type:
                # Excluir colunas específicas
                colunas_excluir = ['Colaborador', 'Telefone comercial', 'BK/PLK Number']
                row_filtrado = row.drop(labels=colunas_excluir, errors='ignore')
                telefones = encontrar_telefones(row_filtrado)
                numeros_telefone.extend(telefones)
    
    return numeros_telefone

def processar_busca(codigo, tipo_busca):
    """Processa busca no arquivo Excel fixo e retorna telefones encontrados."""
    try:
        # Verificar se o arquivo existe
        if not os.path.exists(EXCEL_FILE):
            return {
                'sucesso': False,
                'erro': f'Arquivo {EXCEL_FILE} não encontrado'
            }
        
        # Ler o arquivo Excel
        df = pd.read_excel(EXCEL_FILE)
        
        # Buscar números de telefone
        numeros_telefone = buscar_numeros_telefone_por_codigo(df, codigo, tipo_busca)
        
        # Remover números duplicados
        numeros_telefone_unicos = list(set(numeros_telefone))
        
        # Excluir números específicos
        numeros_filtrados = [numero for numero in numeros_telefone_unicos 
                           if numero not in NUMEROS_EXCLUIDOS]
        
        return {
            'sucesso': True,
            'telefones': numeros_filtrados,
            'total': len(numeros_filtrados),
            'colunas': df.columns.tolist(),
            'total_linhas': len(df),
            'tipo_busca': tipo_busca,
            'codigo': codigo
        }
    
    except Exception as e:
        return {
            'sucesso': False,
            'erro': str(e)
        }

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login."""
    if request.method == 'POST':
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        remember = data.get('remember', False)
        
        if username in USERS:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            if USERS[username] == password_hash:
                session['logged_in'] = True
                session['username'] = username
                if remember:
                    session.permanent = True
                return jsonify({'success': True, 'message': 'Login realizado com sucesso!'})
        
        return jsonify({'success': False, 'message': 'Credenciais inválidas!'})
    
    # Se já estiver logado, redirecionar para a página principal
    if 'logged_in' in session:
        return redirect(url_for('index'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout do usuário."""
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    """Página principal."""
    return render_template('index.html')

@app.route('/buscar', methods=['POST'])
@login_required
def buscar_telefones():
    """Endpoint para buscar telefones por BK Number ou PK Number."""
    try:
        dados = request.json
        codigo = dados.get('codigo', '').strip()
        tipo_busca = dados.get('tipo', 'BK')
        
        if not codigo:
            return jsonify({'sucesso': False, 'erro': 'Código não informado'})
        
        if tipo_busca not in ['BK', 'PK']:
            return jsonify({'sucesso': False, 'erro': 'Tipo de busca inválido'})
        
        # Processar busca
        resultado = processar_busca(codigo, tipo_busca)
        
        return jsonify(resultado)
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro no servidor: {str(e)}'})

@app.route('/exportar', methods=['POST'])
@login_required
def exportar_telefones():
    """Exporta lista de telefones para arquivo Excel."""
    try:
        dados = request.json
        telefones = dados.get('telefones', [])
        codigo = dados.get('codigo', '')
        tipo_busca = dados.get('tipo_busca', 'BK')
        
        if not telefones:
            return jsonify({'sucesso': False, 'erro': 'Nenhum telefone para exportar'})
        
        # Criar DataFrame
        df = pd.DataFrame({
            'Código': [codigo] * len(telefones),
            'Tipo': [tipo_busca] * len(telefones),
            'Telefone': telefones
        })
        
        # Criar arquivo temporário
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Telefones', index=False)
        
        output.seek(0)
        
        # Retornar arquivo
        return send_file(
            io.BytesIO(output.read()),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'telefones_{tipo_busca}_{codigo}.xlsx'
        )
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro na exportação: {str(e)}'})

@app.route('/exportar-separado', methods=['POST'])
@login_required
def exportar_telefones_separados():
    """Exporta cada telefone em uma linha separada para arquivo Excel."""
    try:
        dados = request.json
        telefones = dados.get('telefones', [])
        codigo = dados.get('codigo', '')
        tipo_busca = dados.get('tipo_busca', 'BK')
        
        if not telefones:
            return jsonify({'sucesso': False, 'erro': 'Nenhum telefone para exportar'})
        
        # Criar DataFrame com cada telefone em uma linha
        dados_export = []
        for i, telefone in enumerate(telefones, 1):
            dados_export.append({
                'Linha': i,
                'Código': codigo,
                'Tipo': tipo_busca,
                'Telefone': telefone,
                'Data_Exportacao': pd.Timestamp.now().strftime('%d/%m/%Y %H:%M:%S')
            })
        
        df = pd.DataFrame(dados_export)
        
        # Criar arquivo temporário
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Telefones_Separados', index=False)
        
        output.seek(0)
        
        # Retornar arquivo
        return send_file(
            io.BytesIO(output.read()),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'telefones_separados_{tipo_busca}_{codigo}.xlsx'
        )
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro na exportação separada: {str(e)}'})

@app.route('/adicionar-numero', methods=['POST'])
@login_required
def adicionar_numero():
    """Adiciona um novo número ao arquivo Excel."""
    try:
        dados = request.json
        codigo = dados.get('codigo', '').strip()
        tipo = dados.get('tipo', '').strip()
        telefone = dados.get('telefone', '').strip()
        
        if not all([codigo, tipo, telefone]):
            return jsonify({'sucesso': False, 'erro': 'Todos os campos são obrigatórios'})
        
        if tipo not in ['BK', 'PK']:
            return jsonify({'sucesso': False, 'erro': 'Tipo inválido'})
        
        # Verificar se o arquivo existe
        if not os.path.exists(EXCEL_FILE):
            return jsonify({'sucesso': False, 'erro': f'Arquivo {EXCEL_FILE} não encontrado'})
        
        # Ler o arquivo Excel
        df = pd.read_excel(EXCEL_FILE)
        
        # Criar nova linha
        tipo_nome = 'Burger King' if tipo == 'BK' else 'Popeyes'
        nova_linha = {
            'Colaborador': f'{codigo} - {tipo_nome}',
            'Telefone': telefone,
            'Telefone do solicitante': telefone,
            'Nome': f'{codigo} - {tipo_nome}',
            'Nome do solicitante': f'Usuário {tipo_nome}',
            'Telefone do Gerente': '',
            'BK/PLK Number': codigo,
            'Nome completo do contato': f'{tipo_nome} - {codigo}',
            'Gerente': '',
            'Telefone comercial': '',
            'Gerente.1': '',
            'Telefone comercial.1': ''
        }
        
        # Adicionar nova linha ao DataFrame
        df = pd.concat([df, pd.DataFrame([nova_linha])], ignore_index=True)
        
        # Salvar arquivo
        df.to_excel(EXCEL_FILE, index=False)
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Número {telefone} adicionado com sucesso para {tipo_nome} - {codigo}'
        })
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro ao adicionar número: {str(e)}'})

@app.route('/remover-contato', methods=['POST'])
@login_required
def remover_contato():
    """Remove um contato do arquivo Excel."""
    try:
        dados = request.json
        telefone = dados.get('telefone', '').strip()
        codigo = dados.get('codigo', '').strip()
        tipo = dados.get('tipo', '').strip()
        
        if not telefone:
            return jsonify({'sucesso': False, 'erro': 'Telefone não informado'})
        
        # Verificar se o arquivo existe
        if not os.path.exists(EXCEL_FILE):
            return jsonify({'sucesso': False, 'erro': f'Arquivo {EXCEL_FILE} não encontrado'})
        
        # Ler o arquivo Excel
        df = pd.read_excel(EXCEL_FILE)
        
        # Procurar e remover linhas que contenham o telefone
        linhas_removidas = 0
        for index, row in df.iterrows():
            # Verificar se o telefone está em qualquer coluna da linha
            for coluna in df.columns:
                valor = str(row[coluna])
                if telefone in valor:
                    # Verificar se é a linha correta baseada no código e tipo
                    colaborador = str(row.get('Colaborador', ''))
                    if codigo in colaborador:
                        # Verificar tipo de loja
                        is_correct_type = False
                        if tipo == 'BK':
                            is_correct_type = any(colaborador.startswith(str(i)) for i in range(15, 33))
                        else:  # PK
                            colaborador_upper = colaborador.upper()
                            is_correct_type = ('PLK' in colaborador_upper or 
                                             any(colaborador.startswith(str(i)) for i in range(12, 15)))
                        
                        if is_correct_type:
                            df = df.drop(index)
                            linhas_removidas += 1
                            break
        
        if linhas_removidas > 0:
            # Salvar arquivo atualizado
            df.to_excel(EXCEL_FILE, index=False)
            return jsonify({
                'sucesso': True,
                'mensagem': f'Contato {telefone} removido com sucesso! ({linhas_removidas} linha(s) removida(s))'
            })
        else:
            return jsonify({
                'sucesso': False,
                'erro': f'Contato {telefone} não encontrado para o código {codigo}'
            })
    
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro ao remover contato: {str(e)}'})

@app.route('/log-whatsapp', methods=['POST'])
@login_required
def log_whatsapp():
    """Endpoint para salvar log de cliques no WhatsApp."""
    try:
        dados = request.json
        nome = dados.get('nome', '').strip()
        motivo = dados.get('motivo', '').strip()
        telefone = dados.get('telefone', '').strip()
        codigo_loja = dados.get('codigo_loja', '').strip()
        tipo_loja = dados.get('tipo_loja', '').strip()
        data_hora = dados.get('data_hora', '').strip()
        ip = dados.get('ip', '').strip()
        
        # Criar entrada do log
        log_entry = {
            'Data/Hora': data_hora,
            'Nome': nome,
            'Motivo': motivo,
            'Telefone': telefone,
            'Código Loja': codigo_loja,
            'Tipo Loja': tipo_loja,
            'IP': ip
        }
        
        # Tentar ler arquivo de log existente ou criar novo
        try:
            log_df = pd.read_excel('whatsapp_logs.xlsx')
        except FileNotFoundError:
            log_df = pd.DataFrame()
        
        # Adicionar nova entrada
        log_df = pd.concat([log_df, pd.DataFrame([log_entry])], ignore_index=True)
        
        # Salvar log
        log_df.to_excel('whatsapp_logs.xlsx', index=False)
        
        return jsonify({'sucesso': True, 'mensagem': 'Log salvo com sucesso'})
        
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro ao salvar log: {str(e)}'})

@app.route('/health')
def health_check():
    """Endpoint para verificar saúde da aplicação."""
    return jsonify({'status': 'ok', 'mensagem': 'FoneCheck está funcionando!'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Iniciando FoneCheck na porta {port}")
    print(f"📁 Diretório de trabalho: {os.getcwd()}")
    print(f"📊 Arquivo Excel existe: {os.path.exists(EXCEL_FILE)}")
    app.run(debug=False, host='0.0.0.0', port=port)
