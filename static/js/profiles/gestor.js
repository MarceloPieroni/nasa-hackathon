/**
 * Gestor Manager - Gerenciador para Perfil de Gestor
 * Sistema Cidades Frias, Corações Quentes
 */

class GestorManager {
    constructor() {
        this.currentZone = null;
        this.initialized = false;
    }

    /**
     * Inicializa o gerenciador de gestor
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
            console.log('GestorManager inicializado com sucesso');
            
        } catch (error) {
            console.error('Erro ao inicializar GestorManager:', error);
            this.showError('Erro ao carregar dados do sistema');
        }
    }

    /**
     * Atualiza estatísticas na sidebar
     */
    updateStatistics() {
        const stats = window.DataManager.getStatistics();
        
        document.getElementById('total-zones').textContent = stats.total_zones;
        document.getElementById('critical-zones').textContent = stats.critical_zones;
        document.getElementById('medium-zones').textContent = stats.medium_zones;
        document.getElementById('safe-zones').textContent = stats.safe_zones;
        document.getElementById('avg-temperature').textContent = `${stats.avg_temperature.toFixed(1)}°C`;
        document.getElementById('avg-ndvi').textContent = stats.avg_ndvi.toFixed(2);
    }

    /**
     * Mostra detalhes de uma zona no modal
     */
    async showZoneDetails(zone) {
        this.currentZone = zone;
        
        try {
            // Carrega detalhes completos da zona
            const zoneDetails = await window.DataManager.loadZoneDetails(zone.id);
            
            // Atualiza título do modal
            document.getElementById('gestorModalTitle').innerHTML = `
                <i class="fas fa-map-marker-alt"></i> ${zoneDetails.nome}
            `;
            
            // Preenche conteúdo do modal
            this.fillModalContent(zoneDetails);
            
            // Mostra modal
            const modal = new bootstrap.Modal(document.getElementById('gestorModal'));
            modal.show();
            
            // Atualiza sidebar
            this.updateSidebarDetails(zoneDetails);
            
        } catch (error) {
            console.error('Erro ao carregar detalhes da zona:', error);
            this.showError('Erro ao carregar detalhes da zona');
        }
    }

    /**
     * Preenche conteúdo do modal com detalhes da zona
     */
    fillModalContent(zoneDetails) {
        const modalBody = document.getElementById('gestorModalBody');
        
        modalBody.innerHTML = `
            <div class="row">
                <!-- Dados Técnicos -->
                <div class="col-md-6">
                    <h6><i class="fas fa-chart-line"></i> Dados Técnicos</h6>
                    <div class="data-grid">
                        <div class="data-item">
                            <span class="data-label">Nome da Zona:</span>
                            <span class="data-value">${zoneDetails.nome}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Região:</span>
                            <span class="data-value">${zoneDetails.regiao}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Temperatura Média:</span>
                            <span class="data-value">${zoneDetails.temperatura}°C</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">NDVI:</span>
                            <span class="data-value">${zoneDetails.ndvi}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Densidade Populacional:</span>
                            <span class="data-value">${zoneDetails.densidade_populacional.toLocaleString()} hab/km²</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Índice de Criticidade:</span>
                            <span class="data-value">${zoneDetails.indice_criticidade}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">Classificação:</span>
                            <span class="data-value status-badge ${zoneDetails.classificacao.toLowerCase()}">
                                ${zoneDetails.classificacao}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Análise e Recomendações -->
                <div class="col-md-6">
                    <h6><i class="fas fa-lightbulb"></i> Análise e Recomendações</h6>
                    
                    <div class="action-card ${zoneDetails.classificacao.toLowerCase()}">
                        <h6><i class="fas fa-exclamation-triangle"></i> Ação Recomendada</h6>
                        <p>${zoneDetails.acao_sugerida}</p>
                    </div>
                    
                    <div class="cost-estimate">
                        <strong><i class="fas fa-dollar-sign"></i> Custo Estimado:</strong><br>
                        <span class="cost-value">${zoneDetails.custo_estimado}</span>
                    </div>
                    
                    <div class="species-recommendation">
                        <strong><i class="fas fa-leaf"></i> Espécies Recomendadas:</strong><br>
                        <small class="species-text">${zoneDetails.especies_recomendadas}</small>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <h6><i class="fas fa-info-circle"></i> Interpretação dos Dados</h6>
                <div class="alert alert-info">
                    <div class="interpretation">
                        <p><strong>NDVI (Normalized Difference Vegetation Index):</strong></p>
                        <ul>
                            <li><strong>0.0 - 0.3:</strong> Áreas urbanizadas, concreto, asfalto</li>
                            <li><strong>0.3 - 0.6:</strong> Vegetação esparsa, gramados</li>
                            <li><strong>0.6 - 1.0:</strong> Vegetação densa, florestas</li>
                        </ul>
                        
                        <p class="mt-3"><strong>Índice de Criticidade:</strong></p>
                        <p>Calculado como Temperatura - (NDVI × 10). Valores altos indicam maior risco de ilha de calor.</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Atualiza detalhes na sidebar
     */
    updateSidebarDetails(zoneDetails) {
        const detailsCard = document.getElementById('zone-details-card');
        const detailsContent = document.getElementById('zone-details-content');
        
        detailsContent.innerHTML = `
            <h6>${zoneDetails.nome}</h6>
            <div class="zone-stats">
                <div class="stat-item">
                    <span class="stat-label">Temperatura:</span>
                    <span class="stat-value">${zoneDetails.temperatura}°C</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">NDVI:</span>
                    <span class="stat-value">${zoneDetails.ndvi}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Criticidade:</span>
                    <span class="stat-value">${zoneDetails.indice_criticidade}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Status:</span>
                    <span class="stat-value ${zoneDetails.classificacao.toLowerCase()}">${zoneDetails.classificacao}</span>
                </div>
            </div>
        `;
        
        detailsCard.style.display = 'block';
    }

    /**
     * Gera relatório completo
     */
    async generateFullReport() {
        try {
            window.UIManager.showLoading('Gerando relatório completo...');
            
            const blob = await window.DataManager.generateReport();
            
            // Download do arquivo
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_completo_sp_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            window.UIManager.hideLoading();
            window.UIManager.showSuccess('Relatório gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            window.UIManager.hideLoading();
            window.UIManager.showError('Erro ao gerar relatório');
        }
    }

    /**
     * Gera relatório da zona específica
     */
    async generateZoneReport() {
        if (!this.currentZone) {
            window.UIManager.showError('Nenhuma zona selecionada');
            return;
        }

        try {
            window.UIManager.showLoading('Gerando relatório da zona...');
            
            // Implementar endpoint específico para relatório de zona
            const response = await fetch(`/api/zone/${this.currentZone.id}/report`);
            const blob = await response.blob();
            
            // Download do arquivo
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${this.currentZone.nome.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            window.UIManager.hideLoading();
            window.UIManager.showSuccess('Relatório da zona gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar relatório da zona:', error);
            window.UIManager.hideLoading();
            window.UIManager.showError('Erro ao gerar relatório da zona');
        }
    }

    /**
     * Exporta dados
     */
    exportData() {
        try {
            window.DataManager.exportToCSV();
            window.UIManager.showSuccess('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            window.UIManager.showError('Erro ao exportar dados');
        }
    }

    /**
     * Filtra zonas críticas
     */
    filterCritical() {
        window.MapManager.filterMarkers('Crítica');
        window.UIManager.showInfo('Mostrando apenas zonas críticas');
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

// Instância global do GestorManager
window.GestorManager = new GestorManager();

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.userProfile === 'gestor') {
        window.GestorManager.init();
    }
});

