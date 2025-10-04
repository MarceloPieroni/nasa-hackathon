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
            const response = await fetch('/api/zones');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.zonesData = await response.json();
            this.calculateStatistics();
            this.initialized = true;
            
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
            
            const zoneDetails = await response.json();
            return zoneDetails;
            
        } catch (error) {
            console.error('Erro ao carregar detalhes da zona:', error);
            throw error;
        }
    }

    /**
     * Calcula estatísticas dos dados
     */
    calculateStatistics() {
        if (this.zonesData.length === 0) {
            this.statistics = {
                total_zones: 0,
                critical_zones: 0,
                medium_zones: 0,
                safe_zones: 0,
                avg_temperature: 0,
                avg_ndvi: 0
            };
            return;
        }

        const critical = this.zonesData.filter(z => z.classificacao === 'Crítica').length;
        const medium = this.zonesData.filter(z => z.classificacao === 'Média').length;
        const safe = this.zonesData.filter(z => z.classificacao === 'Segura').length;
        
        const avgTemp = this.zonesData.reduce((sum, z) => sum + z.temperatura, 0) / this.zonesData.length;
        const avgNDVI = this.zonesData.reduce((sum, z) => sum + z.ndvi, 0) / this.zonesData.length;

        this.statistics = {
            total_zones: this.zonesData.length,
            critical_zones: critical,
            medium_zones: medium,
            safe_zones: safe,
            avg_temperature: avgTemp,
            avg_ndvi: avgNDVI
        };
    }

    /**
     * Retorna estatísticas calculadas
     */
    getStatistics() {
        return this.statistics;
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
        if (this.zonesData.length === 0) {
            throw new Error('Nenhum dado disponível para exportação');
        }

        // Cria cabeçalho CSV
        const headers = [
            'ID', 'Nome', 'Região', 'Latitude', 'Longitude', 
            'Temperatura', 'NDVI', 'Densidade Populacional', 
            'Índice Criticidade', 'Classificação'
        ];

        // Cria linhas de dados
        const csvRows = [
            headers.join(','),
            ...this.zonesData.map(zone => [
                zone.id,
                `"${zone.nome}"`,
                `"${zone.regiao}"`,
                zone.latitude,
                zone.longitude,
                zone.temperatura,
                zone.ndvi,
                zone.densidade_populacional,
                zone.indice_criticidade,
                `"${zone.classificacao}"`
            ].join(','))
        ];

        // Cria e baixa arquivo
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zonas_ilhas_calor_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Filtra zonas por classificação
     */
    filterZonesByClassification(classification) {
        if (!classification) {
            return this.zonesData;
        }
        return this.zonesData.filter(zone => zone.classificacao === classification);
    }

    /**
     * Busca zona por ID
     */
    getZoneById(zoneId) {
        return this.zonesData.find(zone => zone.id === zoneId);
    }

    /**
     * Retorna todas as zonas
     */
    getAllZones() {
        return this.zonesData;
    }

    /**
     * Verifica se os dados foram inicializados
     */
    isInitialized() {
        return this.initialized;
    }
}

// Instância global do DataManager
window.DataManager = new DataManager();