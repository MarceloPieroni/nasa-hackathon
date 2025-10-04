/**
 * App Initialization - Sistema Cidades Frias, Corações Quentes
 * Inicialização automática dos gerenciadores baseado no perfil do usuário
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação...');
    
    // Detecta o perfil do usuário baseado na URL ou elementos da página
    const userProfile = detectUserProfile();
    console.log('Perfil detectado:', userProfile);
    
    // Inicializa os gerenciadores baseado no perfil
    initializeManagers(userProfile);
});

/**
 * Detecta o perfil do usuário baseado nos elementos da página
 */
function detectUserProfile() {
    // Verifica se existe sidebar de gestor
    if (document.querySelector('.sidebar-gestor')) {
        return 'gestor';
    }
    
    // Verifica se existe sidebar de civil
    if (document.querySelector('.sidebar-civil')) {
        return 'civil';
    }
    
    // Verifica pelo título da página
    const title = document.title;
    if (title.includes('Gestor')) {
        return 'gestor';
    } else if (title.includes('Civil')) {
        return 'civil';
    }
    
    return 'guest';
}

/**
 * Inicializa os gerenciadores baseado no perfil
 */
async function initializeManagers(profile) {
    try {
        // Verifica se o elemento do mapa existe
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.log('Elemento do mapa não encontrado, pulando inicialização');
            return;
        }
        
        // Inicializa gerenciadores base
        window.DataManager = new DataManager();
        window.MapManager = new MapManager();
        
        // Inicializa o mapa
        window.MapManager.initMap();
        
        // Inicializa gerenciador específico do perfil
        if (profile === 'gestor') {
            window.GestorManager = new GestorManager();
            await window.GestorManager.init();
        } else if (profile === 'civil') {
            window.CivilManager = new CivilManager();
            await window.CivilManager.init();
        }
        
        console.log('Aplicação inicializada com sucesso para perfil:', profile);
        
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showErrorMessage('Erro ao carregar o sistema. Tente recarregar a página.');
    }
}

/**
 * Mostra mensagem de erro para o usuário
 */
function showErrorMessage(message) {
    // Cria um toast de erro simples
    const toast = document.createElement('div');
    toast.className = 'alert alert-danger position-fixed';
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
    toast.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}
