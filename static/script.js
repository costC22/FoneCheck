// Variáveis globais
let telefonesEncontrados = [];
let codigoAtual = '';
let tipoBuscaAtual = 'BK';

// Elementos DOM
const codigoInput = document.getElementById('codigoInput');
const searchBtn = document.getElementById('searchBtn');
const resultsCard = document.getElementById('resultsCard');
const telefonesList = document.getElementById('telefonesList');
const totalTelefones = document.getElementById('totalTelefones');
const codigoResultado = document.getElementById('codigoResultado');
const tipoResultado = document.getElementById('tipoResultado');
const filterInput = document.getElementById('filterInput');
const excludeNumbers = document.getElementById('excludeNumbers');
const exportBtn = document.getElementById('exportBtn');
const exportSeparateBtn = document.getElementById('exportSeparateBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingModal = document.getElementById('loadingModal');
const notification = document.getElementById('notification');

// Elementos do formulário de adicionar número
const addNumberForm = document.getElementById('addNumberForm');
const newCodeInput = document.getElementById('newCode');
const newTypeSelect = document.getElementById('newType');
const newPhoneInput = document.getElementById('newPhone');

// Elementos das tabs
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners principais
    searchBtn.addEventListener('click', buscarTelefones);
    exportBtn.addEventListener('click', exportarTelefones);
    exportSeparateBtn.addEventListener('click', exportarTelefonesSeparados);
    clearBtn.addEventListener('click', limparResultados);
    filterInput.addEventListener('input', filtrarTelefones);
    excludeNumbers.addEventListener('change', filtrarTelefones);
    addNumberForm.addEventListener('submit', adicionarNumero);
    
    // Event listener para Enter no input
    codigoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarTelefones();
        }
    });
    
    // Event listeners das tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Listener para mudança de tipo de busca
    document.querySelectorAll('input[name="tipoBusca"]').forEach(radio => {
        radio.addEventListener('change', function() {
            tipoBuscaAtual = this.value;
            codigoInput.placeholder = 'Digite o PLK Number ou BK Number da loja desejada';
        });
    });
    
    // Inicializar placeholder
    codigoInput.placeholder = 'Digite o PLK Number ou BK Number da loja desejada';
});

// Função para alternar entre tabs
function switchTab(tabId) {
    // Remover classe active de todos os botões e conteúdos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active ao botão e conteúdo selecionados
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    notification.textContent = mensagem;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Função para mostrar/ocultar loading
function toggleLoading(show) {
    loadingModal.style.display = show ? 'block' : 'none';
}

// Função para buscar telefones
async function buscarTelefones() {
    const codigo = codigoInput.value.trim();
    
    if (!codigo) {
        mostrarNotificacao('Por favor, digite um código', 'error');
        return;
    }
    
    toggleLoading(true);
    searchBtn.disabled = true;
    
    try {
        const response = await fetch('/buscar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                tipo: tipoBuscaAtual
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
            telefonesEncontrados = resultado.telefones;
            
            // Atualizar interface
            tipoResultado.textContent = `${tipoBuscaAtual} (${tipoBuscaAtual === 'BK' ? 'Burger King' : 'Popeyes'})`;
            codigoResultado.textContent = codigo;
            totalTelefones.textContent = resultado.total;
            
            // Mostrar resultados
            exibirTelefones(telefonesEncontrados);
            resultsCard.style.display = 'block';
            
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
        telefonesList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7); font-size: 1.1rem;">Nenhum telefone encontrado</div>';
        return;
    }
    
    telefones.forEach(telefone => {
        const telefoneCard = document.createElement('div');
        telefoneCard.className = 'telefone-card';
        telefoneCard.innerHTML = `
            <div class="telefone-icon">
                <i class="fas fa-phone"></i>
            </div>
            <div class="telefone-number">${telefone}</div>
        `;
        telefonesList.appendChild(telefoneCard);
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
    resultsCard.style.display = 'none';
    codigoInput.value = '';
    filterInput.value = '';
    excludeNumbers.checked = true;
    telefonesList.innerHTML = '';
    
    mostrarNotificacao('Resultados limpos', 'info');
}

// Função para exportar telefones separadamente
async function exportarTelefonesSeparados() {
    if (telefonesEncontrados.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    try {
        const response = await fetch('/exportar-separado', {
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
            a.download = `telefones_separados_${tipoBuscaAtual}_${codigoAtual}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacao('Arquivo separado exportado com sucesso!', 'success');
        } else {
            const erro = await response.json();
            mostrarNotificacao(`Erro na exportação: ${erro.erro}`, 'error');
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        mostrarNotificacao('Erro ao exportar arquivo separado', 'error');
    }
}

// Função para adicionar novo número
async function adicionarNumero(event) {
    event.preventDefault();
    
    const codigo = newCodeInput.value.trim();
    const tipo = newTypeSelect.value;
    const telefone = newPhoneInput.value.trim();
    
    if (!codigo || !tipo || !telefone) {
        mostrarNotificacao('Todos os campos são obrigatórios', 'error');
        return;
    }
    
    toggleLoading(true);
    
    try {
        const response = await fetch('/adicionar-numero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                tipo: tipo,
                telefone: telefone
            })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
            mostrarNotificacao(resultado.mensagem, 'success');
            // Limpar formulário
            addNumberForm.reset();
        } else {
            mostrarNotificacao(`Erro: ${resultado.erro}`, 'error');
        }
        
    } catch (error) {
        console.error('Erro ao adicionar número:', error);
        mostrarNotificacao('Erro ao adicionar número. Tente novamente.', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Função para verificar saúde da aplicação
async function verificarSaude() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Status da aplicação:', data);
    } catch (error) {
        console.error('Erro ao verificar saúde da aplicação:', error);
    }
}

// Verificar saúde ao carregar a página
document.addEventListener('DOMContentLoaded', verificarSaude);