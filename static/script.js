// Elementos DOM
const searchForm = document.getElementById('searchForm');
const searchBtn = document.getElementById('searchBtn');
const codigoInput = document.getElementById('codigoInput');
const resultsCard = document.getElementById('resultsCard');
const resultsInfo = document.getElementById('resultsInfo');
const telefonesGrid = document.getElementById('telefonesGrid');
const filtersSection = document.getElementById('filtersSection');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const exportSeparateBtn = document.getElementById('exportSeparateBtn');
const addNumberForm = document.getElementById('addNumberForm');
const loadingModal = document.getElementById('loadingModal');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Filtros
const filterTelefone = document.getElementById('filterTelefone');
const filterDuplicados = document.getElementById('filterDuplicados');

// Dados globais
let telefonesData = [];
let telefonesFiltrados = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Placeholder do input
    codigoInput.placeholder = "Digite o PLK Number ou BK Number da loja desejada";
    
    // Event listeners
    searchForm.addEventListener('submit', buscarTelefones);
    clearBtn.addEventListener('click', limparResultados);
    exportBtn.addEventListener('click', exportarTelefones);
    exportSeparateBtn.addEventListener('click', exportarTelefonesSeparados);
    addNumberForm.addEventListener('submit', adicionarNumero);
    
    // Filtros
    filterTelefone.addEventListener('input', aplicarFiltros);
    filterDuplicados.addEventListener('change', aplicarFiltros);
});

// Função para mostrar loading
function mostrarLoading() {
    loadingModal.style.display = 'block';
}

// Função para esconder loading
function esconderLoading() {
    loadingModal.style.display = 'none';
}

// Função para mostrar notificação
function mostrarNotificacao(texto, tipo = 'info') {
    notificationText.textContent = texto;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Função para buscar telefones
async function buscarTelefones(e) {
    e.preventDefault();
    
    const codigo = codigoInput.value.trim();
    const tipoBusca = document.querySelector('input[name="tipoBusca"]:checked').value;
    
    if (!codigo) {
        mostrarNotificacao('Por favor, digite um código válido', 'error');
        return;
    }
    
    mostrarLoading();
    
    try {
        const response = await fetch('/buscar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                tipo_busca: tipoBusca
            })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            telefonesData = data.telefones || [];
            telefonesFiltrados = [...telefonesData];
            
            exibirResultados(data);
            mostrarNotificacao(`Encontrados ${telefonesData.length} telefones!`, 'success');
        } else {
            mostrarNotificacao(data.erro || 'Erro ao buscar telefones', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão. Tente novamente.', 'error');
    } finally {
        esconderLoading();
    }
}

// Função para exibir resultados
function exibirResultados(data) {
    // Mostrar card de resultados
    resultsCard.style.display = 'block';
    
    // Atualizar informações
    const tipoResultado = data.tipo_busca === 'BK' ? 'Burger King' : 'Popeyes';
    const totalTelefones = telefonesData.length;
    const telefonesUnicos = [...new Set(telefonesData)].length;
    
    resultsInfo.innerHTML = `
        <div class="info-card">
            <i class="fas fa-store"></i>
            <div class="info-value">${tipoResultado}</div>
            <div class="info-label">Tipo de Loja</div>
        </div>
        <div class="info-card">
            <i class="fas fa-phone"></i>
            <div class="info-value">${totalTelefones}</div>
            <div class="info-label">Total de Telefones</div>
        </div>
        <div class="info-card">
            <i class="fas fa-hashtag"></i>
            <div class="info-value">${telefonesUnicos}</div>
            <div class="info-label">Telefones Únicos</div>
        </div>
        <div class="info-card">
            <i class="fas fa-key"></i>
            <div class="info-value">${data.codigo}</div>
            <div class="info-label">Código Buscado</div>
        </div>
    `;
    
    // Mostrar seção de filtros se houver telefones
    if (totalTelefones > 0) {
        filtersSection.style.display = 'block';
    }
    
    // Exibir telefones
    exibirTelefones();
    
    // Scroll para resultados
    resultsCard.scrollIntoView({ behavior: 'smooth' });
}

// Função para exibir telefones
function exibirTelefones() {
    if (telefonesFiltrados.length === 0) {
        telefonesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #718096;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Nenhum telefone encontrado com os filtros aplicados.</p>
            </div>
        `;
        return;
    }
    
    telefonesGrid.innerHTML = telefonesFiltrados.map(telefone => `
        <div class="telefone-card">
            <div class="telefone-icon">
                <i class="fas fa-phone"></i>
            </div>
            <div class="telefone-number">${telefone}</div>
        </div>
    `).join('');
}

// Função para aplicar filtros
function aplicarFiltros() {
    let filtrados = [...telefonesData];
    
    // Filtro por telefone
    const telefoneFiltro = filterTelefone.value.trim();
    if (telefoneFiltro) {
        filtrados = filtrados.filter(telefone => 
            telefone.includes(telefoneFiltro)
        );
    }
    
    // Filtro de duplicados
    if (filterDuplicados.checked) {
        const telefonesUnicos = new Set();
        filtrados = filtrados.filter(telefone => {
            if (telefonesUnicos.has(telefone)) {
                return false;
            }
            telefonesUnicos.add(telefone);
            return true;
        });
    }
    
    telefonesFiltrados = filtrados;
    exibirTelefones();
}

// Função para limpar resultados
function limparResultados() {
    resultsCard.style.display = 'none';
    telefonesData = [];
    telefonesFiltrados = [];
    codigoInput.value = '';
    
    // Limpar filtros
    filterTelefone.value = '';
    filterDuplicados.checked = false;
}

// Função para exportar telefones
async function exportarTelefones() {
    if (telefonesData.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    mostrarLoading();
    
    try {
        const response = await fetch('/exportar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefones: telefonesData
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'telefones_busca.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacao('Arquivo exportado com sucesso!', 'success');
        } else {
            const data = await response.json();
            mostrarNotificacao(data.erro || 'Erro ao exportar arquivo', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão. Tente novamente.', 'error');
    } finally {
        esconderLoading();
    }
}

// Função para exportar telefones separados
async function exportarTelefonesSeparados() {
    if (telefonesData.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    mostrarLoading();
    
    try {
        const response = await fetch('/exportar-separado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefones: telefonesData
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'telefones_detalhado.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            mostrarNotificacao('Arquivo detalhado exportado com sucesso!', 'success');
        } else {
            const data = await response.json();
            mostrarNotificacao(data.erro || 'Erro ao exportar arquivo', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão. Tente novamente.', 'error');
    } finally {
        esconderLoading();
    }
}

// Função para adicionar número
async function adicionarNumero(e) {
    e.preventDefault();
    
    const formData = new FormData(addNumberForm);
    const dados = {
        tipo: formData.get('tipo'),
        codigo: formData.get('codigo'),
        nome: formData.get('nome'),
        telefone: formData.get('telefone')
    };
    
    mostrarLoading();
    
    try {
        const response = await fetch('/adicionar-numero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            mostrarNotificacao('Número adicionado com sucesso!', 'success');
            addNumberForm.reset();
        } else {
            mostrarNotificacao(data.erro || 'Erro ao adicionar número', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão. Tente novamente.', 'error');
    } finally {
        esconderLoading();
    }
}