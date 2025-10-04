/**
 * Data Manager - Gerenciador de Dados
 * Sistema Cidades Frias, Corações Quentes
 */

class DataManager {
    constructor() {
        this.zonesData = [];
        this.statistics = {};
        this.initialized = false;
    }

    /**
     * Carrega dados das zonas da API
     */
    async loadZonesData() {
        try {
            console.log('📡 Carregando dados das zonas...');
            const response = await fetch('/api/zones');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.zonesData = await response.json();
            this.calculateStatistics();
            this.initialized = true;
            
            console.log(`✅ ${this.zonesData.length} zonas carregadas`);
            return this.zonesData;
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados das zonas:', error);
            throw error;
        }
    }

    /**
     * Carrega detalhes de uma zona específica
     */
    async loadZoneDetails(zoneId) {
        try {
            const response = await fetch(`/api/zone/${zoneId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const zoneData = await response.json();
            console.log(`✅ Detalhes da zona ${zoneId} carregados`);
            return zoneData;
            
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes da zona:', error);
            throw error;
        }
    }

    /**
     * Calcula estatísticas dos dados
     */
    calculateStatistics() {
        if (!this.zonesData || this.zonesData.length === 0) {
            this.statistics = {};
            return;
        }

        const total = this.zonesData.length;
        const critical = this.zonesData.filter(z => z.classificacao === 'Crítica').length;
        const medium = this.zonesData.filter(z => z.classificacao === 'Média').length;
        const safe = this.zonesData.filter(z => z.classificacao === 'Segura').length;
        
        const avgTemp = this.zonesData.reduce((sum, z) => sum + z.temperatura, 0) / total;
        const avgNDVI = this.zonesData.reduce((sum, z) => sum + z.ndvi, 0) / total;

        this.statistics = {
            total,
            critical,
            medium,
            safe,
            avgTemperature: Math.round(avgTemp * 10) / 10,
            avgNDVI: Math.round(avgNDVI * 100) / 100
        };

        console.log('📊 Estatísticas calculadas:', this.statistics);
    }

    /**
     * Retorna dados de uma zona por ID
     */
    getZoneById(zoneId) {
        return this.zonesData.find(zone => zone.id === zoneId);
    }

    /**
     * Filtra zonas por classificação
     */
    filterZonesByClassification(classification) {
        return this.zonesData.filter(zone => zone.classificacao === classification);
    }

    /**
     * Retorna zonas ordenadas por criticidade
     */
    getZonesByCriticity() {
        return [...this.zonesData].sort((a, b) => b.indice_criticidade - a.indice_criticidade);
    }
}

// Instância global do DataManager
window.DataManager = new DataManager();