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
            console.log('🚀 Inicializando CivilManager...');
            
            // Carrega dados das zonas
            const zonesData = await window.DataManager.loadZonesData();
            
            // Atualiza estatísticas na interface
            this.updateStatistics();
            
            // Adiciona zonas ao mapa
            window.MapManager.addZonesToMap(zonesData);
            
            // Esconde loading
            this.hideLoading();
            
            this.initialized = true;
            console.log('✅ CivilManager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar CivilManager:', error);
            this.showError('Erro ao carregar dados do sistema');
        }
    }

    /**
     * Atualiza estatísticas na sidebar
     */
    updateStatistics() {
        const zonesData = window.DataManager.zonesData;
        if (!zonesData || zonesData.length === 0) return;

        const totalZones = zonesData.length;
        const criticalZones = zonesData.filter(zone => zone.classificacao === 'Crítica').length;

        // Atualiza elementos na interface
        const totalElement = document.getElementById('civil-total-zones');
        const criticalElement = document.getElementById('civil-critical-zones');

        if (totalElement) totalElement.textContent = totalZones;
        if (criticalElement) criticalElement.textContent = criticalZones;

        console.log(`📊 Estatísticas atualizadas: ${totalZones} zonas, ${criticalZones} críticas`);
    }

    /**
     * Mostra modal de ajuda para uma zona
     */
    showCivilModal(zoneData) {
        this.currentZone = zoneData;
        
        const modal = document.getElementById('civilModal');
        const title = document.getElementById('civilModalTitle');
        const content = document.getElementById('civilModalContent');
        
        if (!modal || !title || !content) {
            console.error('❌ Elementos do modal não encontrados');
            return;
        }

        // Atualiza título
        title.innerHTML = `<i class="fas fa-users"></i> ${zoneData.nome}`;
        
        // Atualiza conteúdo
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-thermometer-half"></i> Informações da Zona</h6>
                    <ul class="list-unstyled">
                        <li><strong>Região:</strong> ${zoneData.regiao || 'São Paulo'}</li>
                        <li><strong>Temperatura:</strong> ${zoneData.temperatura.toFixed(1)}°C</li>
                        <li><strong>NDVI:</strong> ${zoneData.ndvi.toFixed(2)}</li>
                        <li><strong>Classificação:</strong> 
                            <span class="badge ${zoneData.classificacao.toLowerCase()}">${zoneData.classificacao}</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-hands-helping"></i> Como Ajudar</h6>
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Esta zona precisa de ajuda!</strong><br>
                        Temperatura alta e baixa cobertura vegetal.
                    </div>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-seedling text-success"></i> Plantio de árvores nativas</li>
                        <li><i class="fas fa-water text-primary"></i> Cuidado com irrigação</li>
                        <li><i class="fas fa-users text-info"></i> Organização de mutirões</li>
                        <li><i class="fas fa-share text-warning"></i> Divulgação da causa</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Mostra modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    /**
     * Função para contato direto
     */
    contactCivil() {
        const zoneName = this.currentZone ? this.currentZone.nome : 'zona selecionada';
        
        const message = `Olá! Gostaria de ajudar com a arborização da ${zoneName}. Como posso contribuir?`;
        const email = 'civis@cidadesfrias.com.br';
        const subject = `Ajuda com Arborização - ${zoneName}`;
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        
        window.open(mailtoLink, '_blank');
        
        // Fecha modal
        const modal = document.getElementById('civilModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
        
        console.log('📧 Email de contato aberto para:', zoneName);
    }

    /**
     * Mostra loading
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
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
        this.hideLoading();
        if (window.UIManager) {
            window.UIManager.showError(message);
        } else {
            alert(`Erro: ${message}`);
        }
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