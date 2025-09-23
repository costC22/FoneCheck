// Elementos do DOM
const searchForm = document.getElementById('searchForm');
const codigoInput = document.getElementById('codigoInput');
const searchBtn = document.getElementById('searchBtn');
const tipoBuscaInputs = document.querySelectorAll('input[name="tipoBusca"]');
const resultsSection = document.getElementById('resultsSection');
const telefonesGrid = document.getElementById('telefonesGrid');
const loadingModal = document.getElementById('loadingModal');
const notification = document.getElementById('notification');
const addNumberForm = document.getElementById('addNumberForm');
const exportBtn = document.getElementById('exportBtn');
const exportSeparateBtn = document.getElementById('exportSeparateBtn');
const filterTelefone = document.getElementById('filterTelefone');
const filterDuplicados = document.getElementById('filterDuplicados');

// Variáveis globais
let telefonesData = [];
let telefonesFiltrados = [];
let tipoBuscaAtual = 'BK';
let codigoBuscadoAtual = '';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    searchForm.addEventListener('submit', buscarTelefones);
    addNumberForm.addEventListener('submit', adicionarNumero);
    exportBtn.addEventListener('click', exportarTelefones);
    exportSeparateBtn.addEventListener('click', exportarTelefonesSeparados);
    
    // Filtros
    filterTelefone.addEventListener('input', aplicarFiltros);
    filterDuplicados.addEventListener('change', aplicarFiltros);
    
    // Tipo de busca
    tipoBuscaInputs.forEach(input => {
        input.addEventListener('change', function() {
            tipoBuscaAtual = this.value;
            codigoInput.placeholder = tipoBuscaAtual === 'BK' 
                ? 'Digite o BK Number da loja desejada'
                : 'Digite o PLK Number da loja desejada';
        });
    });
    
    // Placeholder inicial
    codigoInput.placeholder = 'Digite o BK Number da loja desejada';
});

// Função para buscar telefones
async function buscarTelefones(e) {
    e.preventDefault();
    
    const codigo = codigoInput.value.trim();
    if (!codigo) {
        mostrarNotificacao('Por favor, digite um código válido', 'error');
        return;
    }
    
    mostrarLoading(true);
    
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
            codigoBuscadoAtual = codigo;
            exibirResultados(data, codigo);
            mostrarNotificacao(`${telefonesData.length} telefone(s) encontrado(s)`, 'success');
        } else {
            mostrarNotificacao(data.erro || 'Nenhum telefone encontrado', 'error');
            limparResultados();
        }
    } catch (error) {
        console.error('Erro na busca:', error);
        mostrarNotificacao('Erro ao buscar telefones. Tente novamente.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Função para exibir resultados
function exibirResultados(data, codigo) {
    // Atualizar informações do resumo
    document.getElementById('tipoResultado').textContent = `${tipoBuscaAtual} (${tipoBuscaAtual === 'BK' ? 'Burger King' : 'Popeyes'})`;
    document.getElementById('totalTelefones').textContent = telefonesData.length;
    document.getElementById('telefonesUnicos').textContent = telefonesData.length;
    document.getElementById('codigoBuscado').textContent = codigo;
    
    // Mostrar seção de resultados
    resultsSection.style.display = 'block';
    
    // Aplicar filtros e exibir telefones
    aplicarFiltros();
    
    // Scroll para resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Função para exibir telefones
function exibirTelefones() {
    if (telefonesFiltrados.length === 0) {
        telefonesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
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
            <button onclick="console.log('Botão clicado:', '${telefone}'); openWhatsAppModal('${telefone}')" class="whatsapp-btn" title="Abrir no WhatsApp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
            </button>
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
    
    // Atualizar contadores
    document.getElementById('telefonesUnicos').textContent = telefonesFiltrados.length;
}

// Função para limpar resultados
function limparResultados() {
    resultsSection.style.display = 'none';
    telefonesData = [];
    telefonesFiltrados = [];
    codigoInput.value = '';
    filterTelefone.value = '';
    filterDuplicados.checked = false;
}

// Função para adicionar número
async function adicionarNumero(e) {
    e.preventDefault();
    
    const formData = new FormData(addNumberForm);
    const dados = {
        codigo: formData.get('newCode'),
        tipo: formData.get('newType'),
        nome: formData.get('newStoreName'),
        telefone: formData.get('newPhone')
    };
    
    if (!dados.codigo || !dados.tipo || !dados.telefone) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    mostrarLoading(true);
    
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
        console.error('Erro ao adicionar número:', error);
        mostrarNotificacao('Erro ao adicionar número. Tente novamente.', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Função para exportar telefones
async function exportarTelefones() {
    if (telefonesData.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const response = await fetch('/exportar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefones: telefonesData,
                tipo: tipoBuscaAtual
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `telefones_${tipoBuscaAtual}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            mostrarNotificacao('Arquivo exportado com sucesso!', 'success');
        } else {
            mostrarNotificacao('Erro ao exportar arquivo', 'error');
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        mostrarNotificacao('Erro ao exportar arquivo', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Função para exportar telefones separados
async function exportarTelefonesSeparados() {
    if (telefonesData.length === 0) {
        mostrarNotificacao('Nenhum telefone para exportar', 'error');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const response = await fetch('/exportar-separado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefones: telefonesData,
                tipo: tipoBuscaAtual
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `telefones_separados_${tipoBuscaAtual}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            mostrarNotificacao('Arquivo exportado com sucesso!', 'success');
        } else {
            mostrarNotificacao('Erro ao exportar arquivo', 'error');
        }
    } catch (error) {
        console.error('Erro na exportação:', error);
        mostrarNotificacao('Erro ao exportar arquivo', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Função para mostrar/esconder loading
function mostrarLoading(mostrar) {
    if (mostrar) {
        loadingModal.style.display = 'flex';
    } else {
        loadingModal.style.display = 'none';
    }
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'success') {
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationIcon = notification.querySelector('.notification-icon i');
    
    notificationMessage.textContent = mensagem;
    
    // Remove classes anteriores
    notification.classList.remove('show', 'success', 'error', 'info');
    
    // Adiciona classe do tipo
    notification.classList.add('show', tipo);
    
    // Muda o ícone baseado no tipo
    switch (tipo) {
        case 'success':
            notificationIcon.className = 'fas fa-check';
            break;
        case 'error':
            notificationIcon.className = 'fas fa-times';
            break;
        case 'info':
            notificationIcon.className = 'fas fa-info';
            break;
    }
    
    // Remove a notificação após 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
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

// Variáveis globais para o modal WhatsApp
let telefoneAtual = '';
let codigoLojaAtual = '';
let tipoLojaAtual = '';

// Função para abrir o modal do WhatsApp
function openWhatsAppModal(telefone) {
    console.log('openWhatsAppModal chamada com:', telefone);
    
    telefoneAtual = telefone;
    codigoLojaAtual = codigoBuscadoAtual || '';
    tipoLojaAtual = tipoBuscaAtual || '';
    
    console.log('Dados:', { telefoneAtual, codigoLojaAtual, tipoLojaAtual });
    
    // Preencher dados no modal
    const phoneElement = document.getElementById('phoneNumber');
    const storeElement = document.getElementById('storeCode');
    
    if (phoneElement) phoneElement.textContent = telefone;
    if (storeElement) storeElement.textContent = `${tipoLojaAtual} - ${codigoLojaAtual}`;
    
    // Limpar formulário
    const form = document.getElementById('whatsappForm');
    const customReasonGroup = document.getElementById('customReasonGroup');
    
    if (form) form.reset();
    if (customReasonGroup) customReasonGroup.style.display = 'none';
    
    // Mostrar modal
    const modal = document.getElementById('whatsappModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal exibido');
        console.log('Modal style:', modal.style.display);
    } else {
        console.error('Modal não encontrado');
    }
    
    // Focar no primeiro campo
    setTimeout(() => {
        const userNameField = document.getElementById('userName');
        if (userNameField) userNameField.focus();
    }, 100);
}

// Função para fechar o modal do WhatsApp
function closeWhatsAppModal() {
    document.getElementById('whatsappModal').style.display = 'none';
    telefoneAtual = '';
    codigoLojaAtual = '';
    tipoLojaAtual = '';
}

// Função para mostrar/ocultar campo de motivo customizado
document.addEventListener('DOMContentLoaded', function() {
    const reasonSelect = document.getElementById('reason');
    const customReasonGroup = document.getElementById('customReasonGroup');
    
    if (reasonSelect) {
        reasonSelect.addEventListener('change', function() {
            if (this.value === 'Outro') {
                customReasonGroup.style.display = 'block';
                document.getElementById('customReason').required = true;
            } else {
                customReasonGroup.style.display = 'none';
                document.getElementById('customReason').required = false;
                document.getElementById('customReason').value = '';
            }
        });
    }
    
    // Fechar modal ao clicar fora dele
    const modal = document.getElementById('whatsappModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWhatsAppModal();
            }
        });
    }
});

// Função para abrir o WhatsApp com mensagem formatada
async function openWhatsApp() {
    const form = document.getElementById('whatsappForm');
    const formData = new FormData(form);
    
    const userName = formData.get('userName');
    const reason = formData.get('reason');
    const customReason = formData.get('customReason');
    
    if (!userName || !reason) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (reason === 'Outro' && !customReason) {
        mostrarNotificacao('Por favor, especifique o motivo', 'error');
        return;
    }
    
    const motivoFinal = reason === 'Outro' ? customReason : reason;
    
    // Criar mensagem formatada
    const mensagem = `Ola! Me chamo ${userName} e estou entrando em contato sobre ${motivoFinal} da loja ${tipoLojaAtual} numero ${codigoLojaAtual}.`;
    
    console.log('Mensagem criada:', mensagem);
    
    // Codificar mensagem para URL
    const mensagemEncoded = encodeURIComponent(mensagem);
    console.log('Mensagem codificada:', mensagemEncoded);
    
    // Salvar log antes de abrir WhatsApp
    try {
        await salvarLogWhatsApp(userName, motivoFinal, telefoneAtual, codigoLojaAtual, tipoLojaAtual);
    } catch (error) {
        console.error('Erro ao salvar log:', error);
        // Continuar mesmo se o log falhar
    }
    
    // Verificar se telefone já está limpo (apenas números)
    const telefoneLimpo = telefoneAtual.replace(/[^\d]/g, '');
    console.log('Telefone original:', telefoneAtual);
    console.log('Telefone limpo:', telefoneLimpo);
    console.log('Tamanho do telefone:', telefoneLimpo.length);
    
    // Verificar se o telefone tem tamanho válido (10 ou 11 dígitos)
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        console.error('Telefone com tamanho inválido:', telefoneLimpo.length);
        mostrarNotificacao('Número de telefone inválido', 'error');
        return;
    }
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/55${telefoneLimpo}?text=${mensagemEncoded}`;
    
    console.log('=== DEBUG WHATSAPP ===');
    console.log('Telefone original:', telefoneAtual);
    console.log('Telefone limpo:', telefoneLimpo);
    console.log('Mensagem original:', mensagem);
    console.log('Mensagem codificada:', mensagemEncoded);
    console.log('URL final:', whatsappUrl);
    console.log('=====================');
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Mostrar notificação de sucesso
    mostrarNotificacao('WhatsApp aberto com sucesso!', 'success');
    
    // Fechar modal após um pequeno delay
    setTimeout(() => {
        closeWhatsAppModal();
    }, 500);
}

// Função para salvar log do WhatsApp
async function salvarLogWhatsApp(nome, motivo, telefone, codigoLoja, tipoLoja) {
    const logData = {
        nome: nome,
        motivo: motivo,
        telefone: telefone,
        codigo_loja: codigoLoja,
        tipo_loja: tipoLoja,
        data_hora: new Date().toLocaleString('pt-BR'),
        ip: await obterIP()
    };
    
    try {
        const response = await fetch('/log-whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData)
        });
        
        const result = await response.json();
        
        if (!result.sucesso) {
            console.error('Erro ao salvar log:', result.erro);
        }
    } catch (error) {
        console.error('Erro ao enviar log:', error);
    }
}

// Função para obter IP do usuário
async function obterIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'Desconhecido';
    } catch (error) {
        return 'Desconhecido';
    }
}