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
            console.log('🚀 Inicializando GestorManager...');
            
            // Carrega dados das zonas
            const zonesData = await window.DataManager.loadZonesData();
            
            // Atualiza estatísticas na interface
            this.updateStatistics();
            
            // Adiciona zonas ao mapa
            window.MapManager.addZonesToMap(zonesData);
            
            // Esconde loading
            this.hideLoading();
            
            this.initialized = true;
            console.log('✅ GestorManager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar GestorManager:', error);
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
        const avgTemperature = zonesData.reduce((sum, zone) => sum + zone.temperatura, 0) / zonesData.length;

        // Atualiza elementos na interface
        const totalElement = document.getElementById('total-zones');
        const criticalElement = document.getElementById('critical-zones');
        const avgTempElement = document.getElementById('avg-temperature');

        if (totalElement) totalElement.textContent = totalZones;
        if (criticalElement) criticalElement.textContent = criticalZones;
        if (avgTempElement) avgTempElement.textContent = `${avgTemperature.toFixed(1)}°C`;

        console.log(`📊 Estatísticas atualizadas: ${totalZones} zonas, ${criticalZones} críticas, ${avgTemperature.toFixed(1)}°C média`);
    }

    /**
     * Gera relatório completo
     */
    generateFullReport() {
        console.log('📄 Gerando relatório completo...');
        window.open('/api/report', '_blank');
    }

    /**
     * Exporta dados
     */
    exportData() {
        console.log('📊 Exportando dados...');
        const zonesData = window.DataManager.zonesData;
        if (!zonesData || zonesData.length === 0) {
            this.showError('Nenhum dado disponível para exportar');
            return;
        }

        // Converte para CSV
        const headers = ['Nome', 'Região', 'Temperatura', 'NDVI', 'Densidade', 'Criticidade', 'Classificação'];
        const csvContent = [
            headers.join(','),
            ...zonesData.map(zone => [
                zone.nome,
                zone.regiao || 'São Paulo',
                zone.temperatura,
                zone.ndvi,
                zone.densidade_populacional,
                zone.indice_criticidade,
                zone.classificacao
            ].join(','))
        ].join('\n');

        // Cria e baixa arquivo
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zonas_sao_paulo_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Dados exportados com sucesso');
    }

    /**
     * Filtra apenas zonas críticas
     */
    filterCritical() {
        console.log('🔍 Filtrando zonas críticas...');
        const zonesData = window.DataManager.zonesData;
        if (!zonesData || zonesData.length === 0) {
            this.showError('Nenhum dado disponível');
            return;
        }

        const criticalZones = zonesData.filter(zone => zone.classificacao === 'Crítica');
        window.MapManager.addZonesToMap(criticalZones);
        
        console.log(`✅ Mostrando ${criticalZones.length} zonas críticas`);
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

// Instância global do GestorManager
window.GestorManager = new GestorManager();

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.userProfile === 'gestor') {
        window.GestorManager.init();
    }
});