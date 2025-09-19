// Variáveis globais
let telefonesEncontrados = [];
let codigoAtual = '';
let tipoBuscaAtual = 'BK';

// Elementos DOM
const codigoInput = document.getElementById('codigoInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const telefonesList = document.getElementById('telefonesList');
const totalTelefones = document.getElementById('totalTelefones');
const codigoResultado = document.getElementById('codigoResultado');
const tipoResultado = document.getElementById('tipoResultado');
const filterInput = document.getElementById('filterInput');
const excludeNumbers = document.getElementById('excludeNumbers');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingModal = document.getElementById('loadingModal');
const notification = document.getElementById('notification');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    searchBtn.addEventListener('click', buscarTelefones);
    exportBtn.addEventListener('click', exportarTelefones);
    clearBtn.addEventListener('click', limparResultados);
    filterInput.addEventListener('input', filtrarTelefones);
    excludeNumbers.addEventListener('change', filtrarTelefones);
    codigoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarTelefones();
        }
    });
    
    // Listener para mudança de tipo de busca
    document.querySelectorAll('input[name="tipoBusca"]').forEach(radio => {
        radio.addEventListener('change', function() {
            tipoBuscaAtual = this.value;
            // Atualizar placeholder do input
            codigoInput.placeholder = 'Digite o código do colaborador';
        });
    });
});

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    notification.textContent = mensagem;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Função para mostrar/ocultar modal de loading
function toggleLoading(mostrar) {
    if (mostrar) {
        loadingModal.style.display = 'block';
    } else {
        loadingModal.style.display = 'none';
    }
}

// Função principal de busca
async function buscarTelefones() {
    const codigo = codigoInput.value.trim();
    
    // Validações
    if (!codigo) {
        mostrarNotificacao('Por favor, digite o código para buscar', 'error');
        return;
    }
    
    toggleLoading(true);
    searchBtn.disabled = true;
    
    try {
        // Fazer requisição para o backend
        const response = await fetch('/buscar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                tipo_busca: tipoBuscaAtual
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
            telefonesEncontrados = resultado.telefones;
            codigoAtual = codigo;
            
            // Atualizar interface
            tipoResultado.textContent = `${tipoBuscaAtual} (${tipoBuscaAtual === 'BK' ? 'Burger King' : 'Popeyes'})`;
            codigoResultado.textContent = codigo;
            totalTelefones.textContent = resultado.total;
            
            // Mostrar resultados
            exibirTelefones(telefonesEncontrados);
            resultsSection.style.display = 'block';
            
            mostrarNotificacao(`Encontrados ${resultado.total} telefones para código ${codigo}`, 'success');
        } else {
            mostrarNotificacao(`Erro: ${resultado.erro}`, 'error');
        }
        
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarNotificacao('Erro ao processar busca. Tente novamente.', 'error');
    } finally {
        toggleLoading(false);
        searchBtn.disabled = false;
    }
}

// Função para exibir telefones
function exibirTelefones(telefones) {
    telefonesList.innerHTML = '';
    
    if (telefones.length === 0) {
        telefonesList.innerHTML = '<p class="no-results">Nenhum telefone encontrado</p>';
        return;
    }
    
    telefones.forEach(telefone => {
        const telefoneItem = document.createElement('div');
        telefoneItem.className = 'telefone-item';
        telefoneItem.innerHTML = `
            <i class="fas fa-phone"></i>
            <span>${telefone}</span>
        `;
        telefonesList.appendChild(telefoneItem);
    });
}

// Função para filtrar telefones
function filtrarTelefones() {
    const filtro = filterInput.value.toLowerCase();
    const excluirNumeros = excludeNumbers.checked;
    
    let telefonesFiltrados = [...telefonesEncontrados];
    
    // Aplicar filtro de texto
    if (filtro) {
        telefonesFiltrados = telefonesFiltrados.filter(telefone => 
            telefone.toLowerCase().includes(filtro)
        );
    }
    
    // Aplicar exclusão de números específicos
    if (excluirNumeros) {
        const numerosExcluidos = ['+5531996272142', '+5527981824400'];
        telefonesFiltrados = telefonesFiltrados.filter(telefone => 
            !numerosExcluidos.includes(telefone)
        );
    }
    
    // Atualizar exibição
    exibirTelefones(telefonesFiltrados);
    totalTelefones.textContent = telefonesFiltrados.length;
}

// Função para exportar telefones
async function exportarTelefones() {
    if (telefonesEncontrados.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    try {
        const response = await fetch('/exportar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefones: telefonesEncontrados,
                codigo: codigoAtual,
                tipo_busca: tipoBuscaAtual
            })
        });
        
        if (response.ok) {
            // Baixar arquivo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `telefones_${tipoBuscaAtual}_${codigoAtual}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacao('Arquivo exportado com sucesso!', 'success');
        } else {
            const erro = await response.json();
            mostrarNotificacao(`Erro na exportação: ${erro.erro}`, 'error');
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        mostrarNotificacao('Erro ao exportar arquivo', 'error');
    }
}

// Função para limpar resultados
function limparResultados() {
    telefonesEncontrados = [];
    codigoAtual = '';
    resultsSection.style.display = 'none';
    codigoInput.value = '';
    filterInput.value = '';
    excludeNumbers.checked = true;
    telefonesList.innerHTML = '';
    
    mostrarNotificacao('Resultados limpos', 'info');
}

// Inicializar placeholder
document.addEventListener('DOMContentLoaded', function() {
    codigoInput.placeholder = 'Digite o código do colaborador';
});

// Função para verificar saúde da aplicação
async function verificarSaude() {
    try {
        const response = await fetch('/health');
        const resultado = await response.json();
        console.log('Status da aplicação:', resultado);
    } catch (error) {
        console.error('Erro ao verificar saúde da aplicação:', error);
    }
}

// Verificar saúde ao carregar a página
document.addEventListener('DOMContentLoaded', verificarSaude);
