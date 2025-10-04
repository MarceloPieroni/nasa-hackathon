/**
 * Voluntario Manager - Gerenciador para Perfil de Voluntário
 * Sistema Cidades Frias, Corações Quentes
 */

class VoluntarioManager {
    constructor() {
        this.currentZone = null;
        this.contributionCount = 0;
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
            this.updateStatistics();
            
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
     * Atualiza estatísticas na sidebar
     */
    updateStatistics() {
        const stats = window.DataManager.getStatistics();
        const zonesNeedingHelp = window.DataManager.getZonesNeedingHelp();
        
        document.getElementById('zones-need-help').textContent = zonesNeedingHelp.length;
        document.getElementById('critical-count').textContent = stats.critical_zones;
        document.getElementById('contribution').textContent = `${this.contributionCount} ações`;
    }

    /**
     * Mostra detalhes de uma zona no modal
     */
    showZoneDetails(zone) {
        this.currentZone = zone;
        
        // Atualiza título do modal
        document.getElementById('voluntarioModalTitle').innerHTML = `
            <i class="fas fa-map-marker-alt"></i> ${zone.nome}
        `;
        
        // Preenche conteúdo do modal
        this.fillModalContent(zone);
        
        // Mostra modal
        const modal = new bootstrap.Modal(document.getElementById('voluntarioModal'));
        modal.show();
    }

    /**
     * Preenche conteúdo do modal com informações simplificadas
     */
    fillModalContent(zone) {
        const modalBody = document.getElementById('voluntarioModalBody');
        
        const needsHelp = zone.classificacao !== 'Segura';
        const helpIcon = needsHelp ? '🌳' : '✅';
        const helpMessage = this.getHelpMessage(zone);
        const helpDescription = this.getHelpDescription(zone);
        
        modalBody.innerHTML = `
            <div class="zone-info">
                <div class="zone-header">
                    <div class="zone-icon">
                        ${helpIcon}
                    </div>
                    <div class="zone-details">
                        <h5>${zone.nome}</h5>
                        <p class="zone-region">
                            <i class="fas fa-map-marker-alt"></i> ${zone.regiao}
                        </p>
                    </div>
                </div>
                
                <div class="help-status ${zone.classificacao.toLowerCase()}">
                    <h6>${helpMessage}</h6>
                    <p>${helpDescription}</p>
                </div>
                
                <div class="zone-stats">
                    <div class="stat-row">
                        <span class="stat-label">Status Atual:</span>
                        <span class="stat-value status-badge ${zone.classificacao.toLowerCase()}">
                            ${zone.classificacao}
                        </span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Temperatura:</span>
                        <span class="stat-value">${zone.temperatura}°C</span>
                    </div>
                </div>
                
                ${needsHelp ? `
                    <div class="help-actions">
                        <h6><i class="fas fa-hands-helping"></i> Como Você Pode Ajudar:</h6>
                        <ul class="help-list">
                            <li><i class="fas fa-seedling"></i> Plantio de mudas nativas</li>
                            <li><i class="fas fa-tint"></i> Irrigação e manutenção</li>
                            <li><i class="fas fa-shield-alt"></i> Proteção de mudas</li>
                            <li><i class="fas fa-users"></i> Mobilização da comunidade</li>
                        </ul>
                    </div>
                ` : `
                    <div class="success-message">
                        <h6><i class="fas fa-check-circle"></i> Zona Bem Cuidada!</h6>
                        <p>Esta zona está bem preservada, mas sempre podemos melhorar. Sua contribuição é sempre bem-vinda!</p>
                    </div>
                `}
            </div>
        `;
    }

    /**
     * Retorna mensagem de ajuda baseada na classificação
     */
    getHelpMessage(zone) {
        switch (zone.classificacao) {
            case 'Crítica':
                return '🔥 Zona Crítica - Precisa de Arborização Urgente!';
            case 'Média':
                return '🌱 Zona Média - Pode Melhorar com Arborização';
            case 'Segura':
                return '✅ Zona Segura - Verde Bem Preservado';
            default:
                return '🌳 Zona que Pode Melhorar';
        }
    }

    /**
     * Retorna descrição de ajuda baseada na classificação
     */
    getHelpDescription(zone) {
        switch (zone.classificacao) {
            case 'Crítica':
                return 'Esta zona tem alta temperatura e baixa cobertura vegetal. Sua ajuda fará uma grande diferença para a comunidade!';
            case 'Média':
                return 'Esta zona pode se beneficiar muito com mais vegetação. Toda ajuda é bem-vinda!';
            case 'Segura':
                return 'Esta zona está bem cuidada, mas sempre pode melhorar. Sua contribuição é sempre valorizada!';
            default:
                return 'Esta zona pode se beneficiar com sua contribuição.';
        }
    }

    /**
     * Manipula clique no botão "Quero Ajudar Aqui"
     */
    wantToHelp() {
        if (!this.currentZone) {
            window.UIManager.showError('Nenhuma zona selecionada');
            return;
        }

        // Atualiza nome da zona no modal de confirmação
        document.getElementById('help-zone-name').textContent = this.currentZone.nome;
        
        // Atualiza links de contato com informações da zona
        const emailLink = document.querySelector('#helpModal a[href^="mailto:"]');
        if (emailLink) {
            const subject = `Interesse em Ajudar - ${this.currentZone.nome}`;
            const body = `Olá! Gostaria de ajudar na arborização da zona ${this.currentZone.nome} (${this.currentZone.regiao}). Aguardo contato.`;
            emailLink.href = `mailto:voluntarios@cidadesfrias.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
        
        // Esconde modal da zona
        const zoneModal = bootstrap.Modal.getInstance(document.getElementById('voluntarioModal'));
        if (zoneModal) {
            zoneModal.hide();
        }
        
        // Mostra modal de confirmação
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
        
        // Incrementa contador de contribuições
        this.contributionCount++;
        this.updateStatistics();
        
        // Salva no localStorage
        this.saveContribution();
    }

    /**
     * Salva contribuição no localStorage
     */
    saveContribution() {
        const contributions = this.getContributions();
        contributions.push({
            zone: this.currentZone.nome,
            region: this.currentZone.regiao,
            classification: this.currentZone.classificacao,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('volunteer_contributions', JSON.stringify(contributions));
    }

    /**
     * Recupera contribuições do localStorage
     */
    getContributions() {
        const stored = localStorage.getItem('volunteer_contributions');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Carrega contribuições salvas
     */
    loadContributions() {
        const contributions = this.getContributions();
        this.contributionCount = contributions.length;
        this.updateStatistics();
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
        window.VoluntarioManager.loadContributions();
        window.VoluntarioManager.init();
    }
});

