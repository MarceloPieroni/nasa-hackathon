/**
 * Voluntario Manager - Gerenciador para Perfil de Voluntário
 * Sistema Cidades Frias, Corações Quentes
 */

class VoluntarioManager {
    constructor() {
        this.currentZone = null;
        this.initialized = false;
    }

    /**
     * Inicializa o gerenciador de voluntário
     */
    async init() {
        if (this.initialized) return;

        try {
            // Carrega dados das zonas
            const zonesData = await window.DataManager.loadZonesData();
            
            // Atualiza estatísticas na interface
            this.updateVolunteerStatistics();
            
            // Adiciona zonas ao mapa
            window.MapManager.addZonesToMap(zonesData);
            
            // Esconde loading
            this.hideLoading();
            
            this.initialized = true;
            console.log('VoluntarioManager inicializado com sucesso');
            
        } catch (error) {
            console.error('Erro ao inicializar VoluntarioManager:', error);
            this.showError('Erro ao carregar dados do sistema');
        }
    }

    /**
     * Atualiza estatísticas simplificadas para voluntários
     */
    updateVolunteerStatistics() {
        const stats = window.DataManager.getStatistics();
        
        // Calcula zonas que precisam de ajuda (críticas + médias)
        const needsHelp = stats.critical_zones + stats.medium_zones;
        const wellCared = stats.safe_zones;
        
        document.getElementById('needs-help').textContent = needsHelp;
        document.getElementById('well-cared').textContent = wellCared;
    }

    /**
     * Mostra detalhes de uma zona no modal simplificado
     */
    async showZoneDetails(zone) {
        this.currentZone = zone;
        
        try {
            // Carrega detalhes da zona
            const zoneDetails = await window.DataManager.loadZoneDetails(zone.id);
            
            // Atualiza título do modal
            document.getElementById('voluntarioModalTitle').innerHTML = `
                <i class="fas fa-seedling"></i> ${zoneDetails.nome}
            `;
            
            // Preenche conteúdo do modal
            this.fillVolunteerModalContent(zoneDetails);
            
            // Mostra modal
            const modal = new bootstrap.Modal(document.getElementById('voluntarioModal'));
            modal.show();
            
            // Atualiza sidebar
            this.updateVolunteerSidebar(zoneDetails);
            
        } catch (error) {
            console.error('Erro ao carregar detalhes da zona:', error);
            this.showError('Erro ao carregar detalhes da zona');
        }
    }

    /**
     * Preenche conteúdo do modal para voluntários
     */
    fillVolunteerModalContent(zoneDetails) {
        const modalBody = document.getElementById('voluntarioModalBody');
        
        const needsHelp = zoneDetails.classificacao !== 'Segura';
        const helpIcon = needsHelp ? '🌳' : '✅';
        const helpText = needsHelp ? 'Precisa de Ajuda' : 'Bem Cuidada';
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-12 text-center mb-4">
                    <div class="zone-status ${zoneDetails.classificacao.toLowerCase()}">
                        <h3>${helpIcon} ${helpText}</h3>
                        <p class="mb-0">${zoneDetails.volunteer_message}</p>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-info-circle"></i> Sobre a Zona</h6>
                    <div class="zone-info">
                        <p><strong>Nome:</strong> ${zoneDetails.nome}</p>
                        <p><strong>Região:</strong> ${zoneDetails.regiao}</p>
                        <p><strong>Status:</strong> 
                            <span class="status-badge ${zoneDetails.classificacao.toLowerCase()}">
                                ${zoneDetails.classificacao}
                            </span>
                        </p>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <h6><i class="fas fa-hands-helping"></i> Como Ajudar</h6>
                    <div class="help-info">
                        <p>${zoneDetails.volunteer_description}</p>
                        ${needsHelp ? `
                            <div class="alert alert-warning">
                                <strong>Esta zona precisa de ajuda!</strong><br>
                                ${zoneDetails.acao_sugerida}
                            </div>
                        ` : `
                            <div class="alert alert-success">
                                <strong>Esta zona está bem cuidada!</strong><br>
                                Continue mantendo o bom trabalho na cidade.
                            </div>
                        `}
                    </div>
                </div>
            </div>
            
            ${needsHelp ? `
            <div class="mt-4">
                <h6><i class="fas fa-leaf"></i> Espécies Recomendadas</h6>
                <p class="text-muted">${zoneDetails.especies_recomendadas}</p>
            </div>
            ` : ''}
        `;
    }

    /**
     * Atualiza sidebar do voluntário
     */
    updateVolunteerSidebar(zoneDetails) {
        const detailsCard = document.getElementById('volunteer-zone-details');
        const detailsContent = document.getElementById('volunteer-zone-content');
        
        const needsHelp = zoneDetails.classificacao !== 'Segura';
        
        detailsContent.innerHTML = `
            <h6>${zoneDetails.nome}</h6>
            <div class="volunteer-zone-info">
                <p><strong>Status:</strong> 
                    <span class="status-badge ${zoneDetails.classificacao.toLowerCase()}">
                        ${needsHelp ? 'Precisa de Ajuda' : 'Bem Cuidada'}
                    </span>
                </p>
                <p>${zoneDetails.volunteer_description}</p>
                ${needsHelp ? `
                    <div class="mt-3">
                        <button class="btn btn-success btn-sm w-100" onclick="contactVolunteer()">
                            <i class="fas fa-phone"></i> Quero Ajudar!
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        detailsCard.style.display = 'block';
    }

    /**
     * Mostra informações para voluntários
     */
    showVolunteerInfo() {
        const modal = new bootstrap.Modal(document.getElementById('volunteerInfoModal'));
        modal.show();
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * Mostra erro
     */
    showError(message) {
        window.UIManager.showError(message);
    }
}

// Instância global do VoluntarioManager
window.VoluntarioManager = new VoluntarioManager();

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.userProfile === 'voluntario') {
        window.VoluntarioManager.init();
    }
});

// Funções globais para botões
function contactVolunteer() {
    const contactInfo = {
        email: 'voluntarios@cidadesfrias.com.br',
        phone: '(11) 99999-9999',
        website: 'https://cidadesfrias.com.br/voluntarios'
    };
    
    const message = `Olá! Gostaria de ajudar na arborização da zona: ${window.VoluntarioManager.currentZone?.nome || 'zona selecionada'}`;
    
    // Simula contato - em produção seria integração real
    alert(`Contato para voluntários:\n\nEmail: ${contactInfo.email}\nTelefone: ${contactInfo.phone}\n\nMensagem: ${message}`);
    
    // Fecha modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('voluntarioModal'));
    if (modal) {
        modal.hide();
    }
}

function showVolunteerInfo() {
    alert('Informações para Voluntários:\n\n• Você pode ajudar plantando árvores\n• Participar de mutirões de arborização\n• Cuidar de áreas verdes existentes\n• Divulgar a importância da arborização urbana\n\nEntre em contato conosco para saber como participar!');
}