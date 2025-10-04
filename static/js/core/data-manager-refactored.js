/**
 * Data Manager Refatorado - Sistema Clima Vida
 * Gerenciador de dados com melhor tratamento de erros e cache
 */

class DataManager {
    constructor() {
        this.zonesData = [];
        this.statistics = {};
        this.initialized = false;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 segundo
    }

    /**
     * Carrega dados das zonas da API com retry e cache
     */
    async loadZonesData(forceRefresh = false) {
        const cacheKey = 'zones_data';
        
        // Verifica cache se não for refresh forçado
        if (!forceRefresh && this._isCacheValid(cacheKey)) {
            console.log('Carregando dados do cache');
            return this.cache.get(cacheKey).data;
        }

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`Tentativa ${attempt} de carregar dados das zonas`);
                
                const response = await fetch('/api/zones');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Validação dos dados
                if (!Array.isArray(data)) {
                    throw new Error('Dados recebidos não são um array válido');
                }
                
                // Processa e armazena dados
                this.zonesData = data;
                this.calculateStatistics();
                this.initialized = true;
                
                // Atualiza cache
                this._updateCache(cacheKey, data);
                
                console.log(`✅ ${data.length} zonas carregadas com sucesso`);
                return data;
                
            } catch (error) {
                console.error(`❌ Erro na tentativa ${attempt}:`, error);
                
                if (attempt === this.retryAttempts) {
                    throw new Error(`Falha ao carregar dados após ${this.retryAttempts} tentativas: ${error.message}`);
                }
                
                // Aguarda antes da próxima tentativa
                await this._delay(this.retryDelay * attempt);
            }
        }
    }

    /**
     * Carrega detalhes de uma zona específica
     */
    async loadZoneDetails(zoneId) {
        const cacheKey = `zone_${zoneId}`;
        
        // Verifica cache
        if (this._isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch(`/api/zone/${zoneId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Zona ${zoneId} não encontrada`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const zoneDetails = await response.json();
            
            // Validação dos dados
            if (!zoneDetails.id || !zoneDetails.nome) {
                throw new Error('Dados da zona inválidos');
            }
            
            // Atualiza cache
            this._updateCache(cacheKey, zoneDetails);
            
            return zoneDetails;
            
        } catch (error) {
            console.error(`Erro ao carregar detalhes da zona ${zoneId}:`, error);
            throw error;
        }
    }

    /**
     * Carrega estatísticas gerais
     */
    async loadStatistics(forceRefresh = false) {
        const cacheKey = 'statistics';
        
        if (!forceRefresh && this._isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey).data;
        }

        try {
            const response = await fetch('/api/statistics');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const statistics = await response.json();
            
            // Atualiza cache
            this._updateCache(cacheKey, statistics);
            
            return statistics;
            
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            throw error;
        }
    }

    /**
     * Calcula estatísticas dos dados carregados
     */
    calculateStatistics() {
        if (!this.zonesData || this.zonesData.length === 0) {
            this.statistics = this._getEmptyStatistics();
            return;
        }

        const critical = this.zonesData.filter(z => z.classificacao === 'Crítica').length;
        const medium = this.zonesData.filter(z => z.classificacao === 'Média').length;
        const safe = this.zonesData.filter(z => z.classificacao === 'Segura').length;
        
        const avgTemp = this.zonesData.reduce((sum, z) => sum + z.temperatura, 0) / this.zonesData.length;
        const avgNDVI = this.zonesData.reduce((sum, z) => sum + z.ndvi, 0) / this.zonesData.length;
        const avgCriticity = this.zonesData.reduce((sum, z) => sum + z.indice_criticidade, 0) / this.zonesData.length;

        this.statistics = {
            total_zones: this.zonesData.length,
            critical_zones: critical,
            medium_zones: medium,
            safe_zones: safe,
            avg_temperature: Math.round(avgTemp * 10) / 10,
            avg_ndvi: Math.round(avgNDVI * 100) / 100,
            avg_criticity: Math.round(avgCriticity * 10) / 10
        };
    }

    /**
     * Gera relatório PDF
     */
    async generateReport() {
        try {
            const response = await fetch('/api/report');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
            throw new Error('Nenhum dado disponível para exportação');
        }

        try {
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
            a.download = `zonas_clima_vida_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ Dados exportados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            throw error;
        }
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
     * Retorna estatísticas calculadas
     */
    getStatistics() {
        return this.statistics;
    }

    /**
     * Verifica se os dados foram inicializados
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache limpo');
    }

    /**
     * Força refresh dos dados
     */
    async refreshData() {
        this.clearCache();
        this.initialized = false;
        return await this.loadZonesData(true);
    }

    // ========================================================================
    // MÉTODOS PRIVADOS
    // ========================================================================

    /**
     * Verifica se o cache é válido
     */
    _isCacheValid(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        
        const cached = this.cache.get(key);
        return (Date.now() - cached.timestamp) < this.cacheTimeout;
    }

    /**
     * Atualiza o cache
     */
    _updateCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Retorna estatísticas vazias
     */
    _getEmptyStatistics() {
        return {
            total_zones: 0,
            critical_zones: 0,
            medium_zones: 0,
            safe_zones: 0,
            avg_temperature: 0,
            avg_ndvi: 0,
            avg_criticity: 0
        };
    }

    /**
     * Delay para retry
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Instância global do DataManager
window.DataManager = new DataManager();
