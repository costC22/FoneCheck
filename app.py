from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
import re
import os
import io

app = Flask(__name__)

# Caminho do arquivo Excel fixo
EXCEL_FILE = 'incident.xlsx'

# Números específicos para exclusão (conforme código original)
NUMEROS_EXCLUIDOS = ['+5531996272142', '+5527981824400']

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
            # Determinar se é OJA ou Popeyes baseado no tipo de busca
            is_correct_type = False
            
            if tipo_busca == 'BK':
                # OJA (Burger King): códigos que começam com 15, 18, 20, 22, 30
                is_correct_type = (
                    colaborador.startswith('15') or
                    colaborador.startswith('18') or
                    colaborador.startswith('20') or
                    colaborador.startswith('22') or
                    colaborador.startswith('30')
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

@app.route('/')
def index():
    """Página principal."""
    return render_template('index.html')

@app.route('/buscar', methods=['POST'])
def buscar_telefones():
    """Endpoint para buscar telefones por BK Number ou PK Number."""
    try:
        dados = request.json
        codigo = dados.get('codigo', '').strip()
        tipo_busca = dados.get('tipo_busca', 'BK')
        
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

@app.route('/health')
def health_check():
    """Endpoint para verificar saúde da aplicação."""
    return jsonify({'status': 'ok', 'mensagem': 'FoneCheck está funcionando!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
