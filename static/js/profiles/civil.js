/**
 * Civil Manager - Gerenciador para Perfil de Civil
 * Sistema Cidades Frias, Corações Quentes
 */

class CivilManager {
    constructor() {
        this.currentZone = null;
        this.initialized = false;
    }

    /**
     * Inicializa o gerenciador de civil
     */
    async init() {
        if (this.initialized) return;

        try {
            // Carrega dados das zonas
            const zonesData = await window.DataManager.loadZonesData();
            
            // Atualiza estatísticas na interface
            this.updateCivilStatistics();
            
            // Adiciona zonas ao mapa
            window.MapManager.addZonesToMap(zonesData);
            
            // Esconde loading
            this.hideLoading();
            
            this.initialized = true;
            console.log('CivilManager inicializado com sucesso');
            
        } catch (error) {
            console.error('Erro ao inicializar CivilManager:', error);
            this.showError('Erro ao carregar dados do sistema');
        }
    }

    /**
     * Atualiza estatísticas simplificadas para civis
     */
    updateCivilStatistics() {
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
            document.getElementById('civilModalTitle').innerHTML = `
                <i class="fas fa-users"></i> ${zoneDetails.nome}
            `;
            
            // Preenche conteúdo do modal
            this.fillCivilModalContent(zoneDetails);
            
            // Mostra modal
            const modal = new bootstrap.Modal(document.getElementById('civilModal'));
            modal.show();
            
            // Atualiza sidebar
            this.updateCivilSidebar(zoneDetails);
            
        } catch (error) {
            console.error('Erro ao carregar detalhes da zona:', error);
            this.showError('Erro ao carregar detalhes da zona');
        }
    }

    /**
     * Preenche conteúdo do modal para civis
     */
    fillCivilModalContent(zoneDetails) {
        const modalBody = document.getElementById('civilModalBody');
        
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
                        <p>${zoneDetails.civil_description}</p>
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
     * Atualiza sidebar do civil
     */
    updateCivilSidebar(zoneDetails) {
        const detailsCard = document.getElementById('civil-zone-details');
        const detailsContent = document.getElementById('civil-zone-content');
        
        const needsHelp = zoneDetails.classificacao !== 'Segura';
        
        detailsContent.innerHTML = `
            <h6>${zoneDetails.nome}</h6>
            <div class="volunteer-zone-info">
                <p><strong>Status:</strong> 
                    <span class="status-badge ${zoneDetails.classificacao.toLowerCase()}">
                        ${needsHelp ? 'Precisa de Ajuda' : 'Bem Cuidada'}
                    </span>
                </p>
                <p>${zoneDetails.civil_description}</p>
                ${needsHelp ? `
                    <div class="mt-3">
                        <button class="btn btn-success btn-sm w-100" onclick="contactCivil()">
                            <i class="fas fa-phone"></i> Quero Ajudar!
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        detailsCard.style.display = 'block';
    }

    /**
     * Mostra informações para civis
     */
    showCivilInfo() {
        const modal = new bootstrap.Modal(document.getElementById('civilInfoModal'));
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

// Instância global do CivilManager
window.CivilManager = new CivilManager();

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.userProfile === 'civil') {
        window.CivilManager.init();
    }
});

// Funções globais para botões
function contactCivil() {
    const contactInfo = {
        email: 'civis@cidadesfrias.com.br',
        phone: '(11) 99999-9999',
        website: 'https://cidadesfrias.com.br/civis'
    };
    
    const message = `Olá! Gostaria de ajudar na arborização da zona: ${window.CivilManager.currentZone?.nome || 'zona selecionada'}`;
    
    // Simula contato - em produção seria integração real
    alert(`Contato para civis:\n\nEmail: ${contactInfo.email}\nTelefone: ${contactInfo.phone}\n\nMensagem: ${message}`);
    
    // Fecha modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('civilModal'));
    if (modal) {
        modal.hide();
    }
}

function showCivilInfo() {
    alert('Informações para Civis:\n\n• Você pode ajudar plantando árvores\n• Participar de mutirões de arborização\n• Cuidar de áreas verdes existentes\n• Divulgar a importância da arborização urbana\n\nEntre em contato conosco para saber como participar!');
}