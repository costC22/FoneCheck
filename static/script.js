// Elementos DOM
const searchForm = document.getElementById('searchForm');
const codigoInput = document.getElementById('codigoInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const exportSeparateBtn = document.getElementById('exportSeparateBtn');
const addNumberForm = document.getElementById('addNumberForm');
const resultsCard = document.getElementById('resultsCard');
const telefonesGrid = document.getElementById('telefonesGrid');
const loadingModal = document.getElementById('loadingModal');
const loadingText = document.getElementById('loadingText');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Filtros
const filterTelefone = document.getElementById('filterTelefone');
const filterDuplicados = document.getElementById('filterDuplicados');

// Resultados info
const tipoResultado = document.getElementById('tipoResultado');
const totalTelefones = document.getElementById('totalTelefones');
const telefonesUnicos = document.getElementById('telefonesUnicos');
const codigoBuscado = document.getElementById('codigoBuscado');

// Dados
let telefonesData = [];
let telefonesFiltrados = [];
let tipoBuscaAtual = 'BK';

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.dashboard-section');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Placeholder do input
    codigoInput.placeholder = "Digite o PLK Number ou BK Number da loja desejada";
    
    // Event listeners principais
    searchForm.addEventListener('submit', buscarTelefones);
    clearBtn.addEventListener('click', limparResultados);
    exportBtn.addEventListener('click', exportarTelefones);
    exportSeparateBtn.addEventListener('click', exportarTelefonesSeparados);
    addNumberForm.addEventListener('submit', adicionarNumero);
    
    // Filtros
    filterTelefone.addEventListener('input', aplicarFiltros);
    filterDuplicados.addEventListener('change', aplicarFiltros);
    
    // Navegação
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Tipo de busca
    document.querySelectorAll('input[name="tipoBusca"]').forEach(input => {
        input.addEventListener('change', function() {
            tipoBuscaAtual = this.value;
        });
    });
});

// Função de navegação
function navigateToSection(sectionName) {
    // Remove active de todos os nav items
    navItems.forEach(item => item.classList.remove('active'));
    
    // Adiciona active ao item clicado
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Remove active de todas as seções
    sections.forEach(section => section.classList.remove('active'));
    
    // Adiciona active à seção correspondente
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

// Função para mostrar loading
function mostrarLoading() {
    loadingModal.style.display = 'flex';
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
    if (!codigo) {
        mostrarNotificacao('Por favor, digite um código de loja', 'error');
        return;
    }
    
    mostrarLoading();
    loadingText.textContent = 'Buscando telefones...';
    
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
        
        const data = await response.json();
        
        if (data.sucesso) {
            telefonesData = data.telefones || [];
            telefonesFiltrados = [...telefonesData];
            
            exibirResultados(codigo, data.telefones || []);
            aplicarFiltros();
            
            mostrarNotificacao(`Encontrados ${telefonesData.length} telefones!`, 'success');
        } else {
            mostrarNotificacao(data.erro || 'Nenhum telefone encontrado', 'error');
            telefonesData = [];
            telefonesFiltrados = [];
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro de conexão. Tente novamente.', 'error');
    } finally {
        esconderLoading();
    }
}

// Função para exibir resultados
function exibirResultados(codigo, telefones) {
    tipoResultado.textContent = `${tipoBuscaAtual} (${tipoBuscaAtual === 'BK' ? 'Burger King' : 'Popeyes'})`;
    totalTelefones.textContent = telefones.length;
    
    // Contar telefones únicos
    const telefonesUnicosSet = new Set(telefones);
    telefonesUnicos.textContent = telefonesUnicosSet.size;
    
    codigoBuscado.textContent = codigo;
    
    resultsCard.style.display = 'block';
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
            <div class="telefone-content">
                <div class="telefone-icon">
                    <i class="fas fa-phone"></i>
                </div>
                <div class="telefone-number">${telefone}</div>
            </div>
            <a href="https://wa.me/55${telefone}" target="_blank" class="whatsapp-btn" title="Abrir no WhatsApp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
            </a>
        </div>
    `).join('');
}

// Função para aplicar filtros
function aplicarFiltros() {
    let filtrados = [...telefonesData];
    
    const telefoneFiltro = filterTelefone.value.trim();
    if (telefoneFiltro) {
        filtrados = filtrados.filter(telefone => 
            telefone.includes(telefoneFiltro)
        );
    }
    
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
    loadingText.textContent = 'Exportando telefones...';
    
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
    loadingText.textContent = 'Exportando telefones separados...';
    
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
            a.download = 'telefones_separados.xlsx';
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

// Função para adicionar número
async function adicionarNumero(e) {
    e.preventDefault();
    
    const formData = new FormData(addNumberForm);
    const dados = {
        codigo: formData.get('newCode'),
        tipo: formData.get('newType'),
        telefone: formData.get('newPhone')
    };
    
    if (!dados.codigo || !dados.tipo || !dados.telefone) {
        mostrarNotificacao('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    mostrarLoading();
    loadingText.textContent = 'Adicionando número...';
    
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

// Função para fechar o alerta de atualização
function dismissAlert() {
    const alert = document.getElementById('updateAlert');
    if (alert) {
        alert.style.animation = 'slideOutUp 0.5s ease-out forwards';
        setTimeout(() => {
            alert.style.display = 'none';
        }, 500);
    }
}

// Função para mostrar o alerta novamente (se necessário)
function showAlert() {
    const alert = document.getElementById('updateAlert');
    if (alert) {
        alert.style.display = 'block';
        alert.style.animation = 'slideInDown 0.6s ease-out';
    }
}