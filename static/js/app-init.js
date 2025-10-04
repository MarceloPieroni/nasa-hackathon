/**
 * App Initialization - Inicialização da Aplicação
 * Sistema Cidades Frias, Corações Quentes
 */

/**
 * Detecta o perfil do usuário baseado na URL ou elementos da página
 */
function detectUserProfile() {
    // Verifica se há um perfil na sessão (definido pelo servidor)
    if (window.userProfile) {
        return window.userProfile;
    }
    
    // Detecta baseado nos elementos da página
    if (document.querySelector('.sidebar-gestor')) {
        return 'gestor';
    } else if (document.querySelector('.sidebar-civil')) {
        return 'civil';
    }
    
    return null;
}

/**
 * Inicializa os gerenciadores baseado no perfil detectado
 */
function initializeManagers() {
    const profile = detectUserProfile();
    
    if (!profile) {
        console.warn('⚠️ Perfil não detectado, pulando inicialização dos gerenciadores');
        return;
    }
    
    console.log(`👤 Perfil detectado: ${profile}`);
    
    // Define o perfil globalmente
    window.userProfile = profile;
    
    // Inicializa o MapManager com o perfil correto
    if (window.MapManager) {
        window.MapManager.setProfile(profile);
    }
    
    // Inicializa o gerenciador específico do perfil
    switch (profile) {
        case 'gestor':
            if (window.GestorManager) {
                window.GestorManager.init();
            }
            break;
        case 'civil':
            if (window.CivilManager) {
                window.CivilManager.init();
            }
            break;
        default:
            console.warn(`⚠️ Perfil desconhecido: ${profile}`);
    }
}

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicação...');
    
    // Aguarda um pouco para garantir que todos os scripts foram carregados
    setTimeout(() => {
        initializeManagers();
    }, 100);
});

/**
 * Funções globais para compatibilidade
 */
window.loginAsProfile = function(profile) {
    console.log('🔐 Login como:', profile);
    // Esta função será sobrescrita pelo template de login
};

window.generateFullReport = function() {
    if (window.GestorManager) {
        window.GestorManager.generateFullReport();
    }
};

window.exportData = function() {
    if (window.GestorManager) {
        window.GestorManager.exportData();
    }
};

window.filterCritical = function() {
    if (window.GestorManager) {
        window.GestorManager.filterCritical();
    }
};

window.contactCivil = function() {
    if (window.CivilManager) {
        window.CivilManager.contactCivil();
    }
};