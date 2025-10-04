/**
 * Data Manager - Gerenciador de Dados
 * Sistema Cidades Frias, Corações Quentes
 */

class DataManager {
    constructor() {
        this.zonesData = [];
        this.statistics = {};
        this.loaded = false;
    }

    /**
     * Carrega dados das zonas via API
     */
    async loadZonesData() {
        try {
            const response = await fetch('/api/zones');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.zonesData = await response.json();
            this.calculateStatistics();
            this.loaded = true;
            
            console.log(`${this.zonesData.length} zonas carregadas`);
            return this.zonesData;
            
        } catch (error) {
            console.error('Erro ao carregar dados das zonas:', error);
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
            return zoneData;
            
        } catch (error) {
            console.error(`Erro ao carregar detalhes da zona ${zoneId}:`, error);
            throw error;
        }
    }

    /**
     * Calcula estatísticas gerais
     */
    calculateStatistics() {
        if (!this.zonesData || this.zonesData.length === 0) {
            this.statistics = {
                total_zones: 0,
                critical_zones: 0,
                medium_zones: 0,
                safe_zones: 0,
                avg_temperature: 0,
                avg_ndvi: 0,
                avg_criticity: 0
            };
            return;
        }

        const critical = this.zonesData.filter(z => z.classificacao === 'Crítica');
        const medium = this.zonesData.filter(z => z.classificacao === 'Média');
        const safe = this.zonesData.filter(z => z.classificacao === 'Segura');

        this.statistics = {
            total_zones: this.zonesData.length,
            critical_zones: critical.length,
            medium_zones: medium.length,
            safe_zones: safe.length,
            avg_temperature: this.zonesData.reduce((sum, z) => sum + z.temperatura, 0) / this.zonesData.length,
            avg_ndvi: this.zonesData.reduce((sum, z) => sum + z.ndvi, 0) / this.zonesData.length,
            avg_criticity: this.zonesData.reduce((sum, z) => sum + z.indice_criticidade, 0) / this.zonesData.length
        };
    }

    /**
     * Retorna estatísticas calculadas
     */
    getStatistics() {
        return this.statistics;
    }

    /**
     * Retorna dados de todas as zonas
     */
    getAllZones() {
        return this.zonesData;
    }

    /**
     * Retorna zonas filtradas por classificação
     */
    getZonesByClassification(classification) {
        return this.zonesData.filter(zone => zone.classificacao === classification);
    }

    /**
     * Retorna zonas que precisam de ajuda (para voluntários)
     */
    getZonesNeedingHelp() {
        return this.zonesData.filter(zone => zone.classificacao !== 'Segura');
    }

    /**
     * Gera relatório PDF
     */
    async generateReport() {
        try {
            const response = await fetch('/api/report');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            return blob;
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error;
        }
    }

    /**
     * Exporta dados para CSV
     */
    exportToCSV() {
        if (!this.zonesData || this.zonesData.length === 0) {
            console.error('Nenhum dado para exportar');
            return;
        }

        const headers = ['ID', 'Nome', 'Região', 'Latitude', 'Longitude', 'Temperatura', 'NDVI', 'Densidade', 'Criticidade', 'Classificação'];
        const csvContent = [
            headers.join(','),
            ...this.zonesData.map(zone => [
                zone.id,
                zone.nome,
                zone.regiao,
                zone.latitude,
                zone.longitude,
                zone.temperatura,
                zone.ndvi,
                zone.densidade_populacional,
                zone.indice_criticidade,
                zone.classificacao
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `zonas_calor_sp_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Busca zonas por nome
     */
    searchZones(query) {
        if (!query || query.trim() === '') {
            return this.zonesData;
        }

        const searchTerm = query.toLowerCase();
        return this.zonesData.filter(zone => 
            zone.nome.toLowerCase().includes(searchTerm) ||
            zone.regiao.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Ordena zonas por critério
     */
    sortZones(criteria = 'indice_criticidade', order = 'desc') {
        const sorted = [...this.zonesData].sort((a, b) => {
            let aVal = a[criteria];
            let bVal = b[criteria];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });

        return sorted;
    }

    /**
     * Verifica se os dados foram carregados
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Limpa dados carregados
     */
    clear() {
        this.zonesData = [];
        this.statistics = {};
        this.loaded = false;
    }
}

// Instância global do DataManager
window.DataManager = new DataManager();

